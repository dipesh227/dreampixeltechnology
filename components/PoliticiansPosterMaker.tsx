import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { PoliticalParty, PosterStyle, AspectRatio, UploadedFile, GeneratedConcept, TemplatePrefillData } from '../types';
import { generatePosterPrompts, generatePoster } from '../services/aiService';
import { POLITICAL_PARTIES, POSTER_STYLES, POSTER_THEMES } from '../services/constants';
import * as historyService from '../services/historyService';
import * as jobService from '../services/jobService';
import { HiArrowDownTray, HiOutlineHeart, HiOutlineSparkles, HiArrowUpTray, HiXMark, HiOutlineFlag, HiOutlineCalendarDays, HiOutlineDocumentText, HiComputerDesktop, HiDevicePhoneMobile, HiOutlineArrowPath, HiArrowLeft, HiOutlineDocumentDuplicate, HiCheck, HiOutlineLightBulb, HiOutlineQueueList } from 'react-icons/hi2';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from './ErrorMessage';
import TemplateBrowser from './TemplateBrowser';
import StyleSelector from './StyleSelector';
import { resizeImage } from '../utils/cropImage';

type Step = 'input' | 'promptSelection' | 'generating' | 'result';

interface PoliticiansPosterMakerProps {
    onNavigateHome: () => void;
    onPosterGenerated: () => void;
    onGenerating: (isGenerating: boolean) => void;
}

export const PoliticiansPosterMaker: React.FC<PoliticiansPosterMakerProps> = ({ onNavigateHome, onPosterGenerated, onGenerating }) => {
    const { session } = useAuth();
    const [step, setStep] = useState<Step>('input');
    const [headshots, setHeadshots] = useState<UploadedFile[]>([]);
    const [selectedPartyId, setSelectedPartyId] = useState<string>(POLITICAL_PARTIES[0].id);
    const [selectedEvent, setSelectedEvent] = useState<string>(POSTER_THEMES[0]);
    const [customEventTheme, setCustomEventTheme] = useState('');
    const [customText, setCustomText] = useState('');
    const [selectedStyleId, setSelectedStyleId] = useState<string>(POSTER_STYLES[0].id);
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('4:5');
    
    const [generatedPrompts, setGeneratedPrompts] = useState<GeneratedConcept[]>([]);
    const [finalPrompt, setFinalPrompt] = useState<string>('');
    const [generatedPoster, setGeneratedPoster] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [isSaved, setIsSaved] = useState(false);
    const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);
    const [isTemplateBrowserOpen, setIsTemplateBrowserOpen] = useState(false);

    useEffect(() => {
        onGenerating(isLoading);
    }, [isLoading, onGenerating]);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;

        if (isLoading && step === 'input') {
            const messages = [
                'Analyzing campaign details...',
                'Crafting strategic concepts...',
                'Considering party branding...',
                'Finalizing poster ideas...',
            ];
            let index = 0;
            setLoadingMessage(messages[index]);
            interval = setInterval(() => {
                index = (index + 1) % messages.length;
                setLoadingMessage(messages[index]);
            }, 2000);
        } else if (step === 'generating') {
            const messages = [
                'Initializing AI design canvas...',
                "Integrating politician's likeness...",
                'Applying party branding...',
                'Typesetting slogans...',
                'Rendering final poster...',
                'Almost done...'
            ];
            let index = 0;
            setLoadingMessage(messages[index]);
            interval = setInterval(() => {
                index = (index + 1) % messages.length;
                setLoadingMessage(messages[index]);
            }, 2500);
        }
        return () => clearInterval(interval);
    }, [isLoading, step]);

    const handleBackToSettings = () => {
        setStep('input');
        setGeneratedPrompts([]);
        setFinalPrompt('');
        setGeneratedPoster(null);
        setError(null);
        setIsSaved(false);
    };

    const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const files = Array.from(event.target.files).slice(0, 5 - headshots.length);
            for (const file of files) {
                try {
                    const resizedImage = await resizeImage(file, 1024);
                    setHeadshots(prev => [...prev, resizedImage].slice(0, 5));
                } catch (error) {
                    console.error("Error resizing image:", error);
                    setError("Failed to process image. Please try a different file.");
                }
            }
            event.target.value = '';
        }
    }, [headshots.length]);
    
    const removeHeadshot = (index: number) => {
        setHeadshots(prev => prev.filter((_, i) => i !== index));
    };

    const selectedParty = useMemo(() => POLITICAL_PARTIES.find(p => p.id === selectedPartyId), [selectedPartyId]);
    const selectedStyle = useMemo(() => POSTER_STYLES.find(s => s.id === selectedStyleId), [selectedStyleId]);

    const handleGenerateConcepts = async () => {
        if (!selectedParty || !selectedStyle) {
            setError('Please select a party and style.');
            return;
        }
        if (headshots.length === 0) {
            setError('A headshot is required to generate poster concepts.');
            return;
        }
        
        const finalEventTheme = selectedEvent === 'other' ? customEventTheme : selectedEvent;
        if (selectedEvent === 'other' && !customEventTheme.trim()) {
            setError('Please enter your custom theme.');
            return;
        }

        if (session) {
            jobService.savePoliticalPosterJob({
                userId: session.user.id,
                partyId: selectedPartyId,
                eventTheme: finalEventTheme,
                customText,
                styleId: selectedStyleId,
                aspectRatio,
                headshots
            });
        }
        
        setIsLoading(true);
        setError(null);
        try {
            const prompts = await generatePosterPrompts(selectedParty, finalEventTheme, customText, selectedStyle);
            setGeneratedPrompts(prompts);
            setStep('promptSelection');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate prompts.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGeneratePoster = async (prompt: string) => {
        if (headshots.length === 0) {
            setError('A headshot is required to generate a poster.');
            setStep('input');
            return;
        }
        setIsLoading(true);
        setError(null);
        setFinalPrompt(prompt);
        setStep('generating');
        setIsSaved(false);
        try {
            const posterResult = await generatePoster(prompt, headshots, aspectRatio, selectedParty);
            if(posterResult) {
                setGeneratedPoster(posterResult);
                setStep('result');
            } else {
                throw new Error("The AI failed to generate a poster. Please try again.");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate poster.');
            setStep('promptSelection');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveCreation = async () => {
        if (generatedPoster && !isSaved && selectedParty && session) {
            const newEntry = {
                id: '',
                prompt: finalPrompt,
                imageUrl: `data:image/png;base64,${generatedPoster}`,
                timestamp: Date.now()
            };
            try {
                await historyService.saveCreation(newEntry, session.user.id);
                setIsSaved(true);
                onPosterGenerated();
            } catch (error) {
                setError("Failed to save creation. Please try again.");
            }
        }
    };
    
    const handleSelectTemplate = (prefill: TemplatePrefillData) => {
        if (prefill.partyId) setSelectedPartyId(prefill.partyId);
        if (prefill.eventTheme) setSelectedEvent(prefill.eventTheme);
        if (prefill.customText) setCustomText(prefill.customText);
        if (prefill.styleId) setSelectedStyleId(prefill.styleId);
        if (prefill.aspectRatio) setAspectRatio(prefill.aspectRatio);
    };

    const handleCopyPrompt = (prompt: string) => {
        navigator.clipboard.writeText(prompt);
        setCopiedPrompt(prompt);
        setTimeout(() => setCopiedPrompt(null), 2000);
    };

    const renderInputStep = () => (
        <div className="space-y-8">
            <div className="flex justify-end">
                <button
                    onClick={() => setIsTemplateBrowserOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 transition-colors icon-hover-effect-blue"
                >
                    <HiOutlineQueueList className="w-5 h-5 text-sky-400" />
                    Browse Templates
                </button>
            </div>
        
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="p-4 md:p-6 bg-slate-900/60 backdrop-blur-lg border border-slate-700/50 rounded-xl" data-tooltip="Upload 1-5 photos of the politician. High-quality, forward-facing images produce the best results for face replication.">
                    <h2 className="text-xl font-bold text-white mb-1">1. Upload Headshots</h2>
                    <p className="text-sm text-slate-400 mb-4">Provide 1-5 images for the best face accuracy.</p>
                    <div className="p-6 border-2 border-dashed border-slate-700 rounded-xl text-center bg-slate-800/50 hover:border-slate-600 transition h-48 flex flex-col justify-center">
                         <input type="file" id="file-upload" className="hidden" multiple accept="image/png, image/jpeg" onChange={handleFileChange} disabled={headshots.length >= 5} />
                         <label htmlFor="file-upload" className={`cursor-pointer ${headshots.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            <HiArrowUpTray className="w-8 h-8 mx-auto text-slate-500 mb-2"/>
                            <p className="text-slate-300 font-semibold">Click to upload or drag & drop</p>
                            <p className="text-xs text-slate-500">You can add {5 - headshots.length} more images.</p>
                         </label>
                    </div>
                     {headshots.length > 0 && 
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 mt-4">
                            {headshots.map((file, index) => (
                                <div key={index} className="relative group aspect-square">
                                    <img src={`data:${file.mimeType};base64,${file.base64}`} alt={file.name} className="rounded-lg object-cover w-full h-full"/>
                                    <button onClick={() => removeHeadshot(index)} className="absolute top-1 right-1 bg-black/60 rounded-full p-1 text-white hover:bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <HiXMark className="w-4 h-4 icon-hover-effect" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    }
                </div>
                 <div className="p-4 md:p-6 bg-slate-900/60 backdrop-blur-lg border border-slate-700/50 rounded-xl space-y-4">
                    <div data-tooltip="The party choice determines the logo, color scheme, and overall ideological tone of the poster concepts.">
                        <div className="flex items-start gap-3">
                            <HiOutlineFlag className="w-6 h-6 mt-1 text-orange-400"/>
                            <div>
                               <h3 className="text-md font-bold text-white">2. Select Political Party</h3>
                               <p className="text-sm text-slate-400 mb-2">This determines the branding and color scheme.</p>
                            </div>
                        </div>
                        <select value={selectedPartyId} onChange={(e) => setSelectedPartyId(e.target.value)} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition text-sm">
                            {POLITICAL_PARTIES.map(party => <option key={party.id} value={party.id}>{party.name}</option>)}
                        </select>
                    </div>
                    
                    <div data-tooltip="Choose a preset theme or specify a custom one to tailor the poster's message to a specific event or announcement.">
                         <div className="flex items-start gap-3">
                            <HiOutlineCalendarDays className="w-6 h-6 mt-1 text-sky-400"/>
                            <div>
                               <h3 className="text-md font-bold text-white">3. Occasion / Theme</h3>
                               <p className="text-sm text-slate-400 mb-2">Choose a theme for the poster.</p>
                            </div>
                        </div>
                        <select value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition text-sm">
                            {POSTER_THEMES.map(theme => <option key={theme} value={theme}>{theme}</option>)}
                            <option value="other">Other (Please specify)</option>
                        </select>
                        {selectedEvent === 'other' && (
                            <input type="text" value={customEventTheme} onChange={e => setCustomEventTheme(e.target.value)} placeholder="Enter your custom theme" className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition text-sm mt-2" />
                        )}
                    </div>
                    <div data-tooltip="Add your main slogan or message here. The AI will make this the central text element of the poster.">
                         <div className="flex items-start gap-3">
                            <HiOutlineDocumentText className="w-6 h-6 mt-1 text-emerald-400"/>
                            <div>
                               <h3 className="text-md font-bold text-white">4. Custom Text / Slogan <span className="text-slate-400 font-normal">(Optional)</span></h3>
                               <p className="text-sm text-slate-400 mb-2">Add a specific message to the poster.</p>
                            </div>
                        </div>
                        <input type="text" value={customText} onChange={e => setCustomText(e.target.value)} placeholder="e.g., 'Vote for Progress'" className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition text-sm" />
                    </div>
                </div>
            </div>

            <StyleSelector
                title="5. Choose a Poster Style"
                tooltip="Select a visual style to set the overall mood and design direction of your poster. Each style provides a different artistic feel."
                stylesData={POSTER_STYLES}
                selectedStyleId={selectedStyleId}
                onStyleSelect={setSelectedStyleId}
            />
            
            <div className="p-4 md:p-6 bg-slate-900/60 backdrop-blur-lg border border-slate-700/50 rounded-xl" data-tooltip="Choose the final poster shape. 4:5 is ideal for most social media feeds, while 9:16 is for stories (e.g., Instagram, WhatsApp).">
                <h2 className="text-xl font-bold text-white mb-4">6. Choose Aspect Ratio</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button onClick={() => setAspectRatio('4:5')} className={`flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-colors duration-200 ${aspectRatio === '4:5' ? 'border-purple-500 bg-slate-800/50' : 'border-slate-800 bg-slate-900 hover:border-slate-700'}`}>
                        <HiComputerDesktop className="w-10 h-10 mb-2 text-slate-300"/>
                        <p className="font-bold text-lg text-white">4:5</p>
                        <p className="text-sm text-slate-400">Social Media Post</p>
                    </button>
                    <button onClick={() => setAspectRatio('9:16')} className={`flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-colors duration-200 ${aspectRatio === '9:16' ? 'border-purple-500 bg-slate-800/50' : 'border-slate-800 bg-slate-900 hover:border-slate-700'}`}>
                        <HiDevicePhoneMobile className="w-10 h-10 mb-2 text-slate-300"/>
                        <p className="font-bold text-lg text-white">9:16</p>
                        <p className="text-sm text-slate-400">Story / Reel</p>
                    </button>
                </div>
            </div>

             <div className="flex justify-center pt-4">
                <button onClick={handleGenerateConcepts} disabled={isLoading || headshots.length === 0} className="flex items-center gap-3 px-8 py-4 bg-primary-gradient text-white font-bold text-lg rounded-lg hover:opacity-90 transition-all duration-300 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed transform hover:scale-105">
                    {isLoading ? <div className="w-6 h-6 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : <HiOutlineSparkles className="w-6 h-6"/>}
                    {isLoading ? loadingMessage : 'Generate Poster Concepts'}
                </button>
            </div>
        </div>
    );

    const renderPromptSelectionStep = () => (
        <div className="max-w-7xl mx-auto animate-fade-in">
            <h2 className="text-3xl font-bold text-center mb-2 text-white">Choose Your Poster Concept</h2>
            <p className="text-slate-400 text-center mb-10">Select a concept below to generate your final poster.</p>
            <div className="grid md:grid-cols-3 gap-6">
                {generatedPrompts.map((concept, index) => (
                    <div 
                        key={index} 
                        onClick={() => handleGeneratePoster(concept.prompt)}
                        className={`relative p-6 rounded-xl border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between
                            ${concept.isRecommended 
                                ? 'border-amber-400 bg-slate-800/50' 
                                : 'border-slate-800 bg-slate-900/70 hover:border-slate-700 hover:-translate-y-1'
                            }`}
                    >
                        <div>
                            {concept.isRecommended && (
                                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                                    <span className="px-3 py-1 text-xs font-semibold tracking-wider text-slate-900 uppercase bg-amber-400 rounded-full">
                                        Recommended
                                    </span>
                                </div>
                            )}
                            <h3 className="font-bold text-white mb-3 mt-3">Concept {index + 1}</h3>
                            <p className="text-slate-300 text-sm mb-4">{concept.prompt}</p>
                            {concept.isRecommended && concept.reason && (
                                 <div className="mt-4 pt-4 border-t border-slate-700/50">
                                    <p className="text-xs text-amber-300/80 italic"><span className="font-bold not-italic">Reason:</span> {concept.reason}</p>
                                </div>
                            )}
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleCopyPrompt(concept.prompt); }}
                                className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-md bg-slate-700/50 hover:bg-slate-700 text-slate-300 transition-colors"
                            >
                                {copiedPrompt === concept.prompt ? <HiCheck className="w-4 h-4 text-green-400" /> : <HiOutlineDocumentDuplicate className="w-4 h-4 icon-hover-effect" />}
                                {copiedPrompt === concept.prompt ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-center mt-10">
                <button onClick={() => setStep('input')} className="flex items-center gap-2 px-6 py-2 text-slate-400 hover:text-slate-300 bg-slate-800/50 border border-slate-700 rounded-lg transition-colors icon-hover-effect">
                    <HiArrowLeft className="w-5 h-5" /> Back
                </button>
            </div>
        </div>
    );

    const renderGeneratingStep = () => (
        <div className="text-center py-20 animate-fade-in">
            <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-purple-400 rounded-full animate-spin"></div>
            </div>
            <h2 className="text-3xl font-bold mt-8 text-white">{loadingMessage}</h2>
            <p className="text-slate-400 mt-2">This can take up to a minute. Please don't close the window.</p>
        </div>
    );

    const renderResultStep = () => (
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
             <h2 className="text-3xl font-bold text-center mb-8 text-white">Your Poster is Ready!</h2>
             {generatedPoster && (
                <img src={`data:image/png;base64,${generatedPoster}`} alt="Generated Poster" className="rounded-xl mx-auto shadow-2xl shadow-black/30 mb-8 border-2 border-slate-700/50" style={{ aspectRatio: aspectRatio.replace(':', ' / ') }} />
             )}
             <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center items-center gap-4">
                 <button onClick={handleBackToSettings} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 transition-all duration-300 border border-slate-700 icon-hover-effect">
                    <HiArrowLeft className="w-5 h-5 text-slate-300"/> Back to Settings
                 </button>
                 <button onClick={() => setStep('promptSelection')} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 transition-all duration-300 border border-slate-700 icon-hover-effect icon-hover-effect-yellow">
                    <HiOutlineLightBulb className="w-5 h-5 text-yellow-400"/> Back to Concepts
                 </button>
                 <button onClick={() => handleGeneratePoster(finalPrompt)} disabled={isLoading} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700 transition-all duration-300 border border-slate-700 disabled:opacity-60 disabled:cursor-not-allowed icon-hover-effect icon-hover-effect-blue">
                    <HiOutlineArrowPath className="w-5 h-5 text-sky-400"/> Regenerate
                 </button>
                 <div className="relative group" title={!session ? 'Please sign in to save creations' : ''}>
                    <button 
                        onClick={handleSaveCreation} 
                        disabled={isSaved || !session} 
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700 transition-all duration-300 border border-slate-700 disabled:opacity-60 disabled:cursor-not-allowed icon-hover-effect icon-hover-effect-pink"
                    >
                        <HiOutlineHeart className={`w-5 h-5 transition-colors ${isSaved ? 'text-pink-500' : 'text-pink-400'}`} /> {isSaved ? 'Saved!' : 'Like & Save Creation'}
                    </button>
                 </div>
                 <a href={`data:image/png;base64,${generatedPoster}`} download="dreampixel-poster.png" className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary-gradient text-white font-bold rounded-lg hover:opacity-90 transition-all duration-300 transform hover:scale-105">
                    <HiArrowDownTray className="w-5 h-5"/> Download
                 </a>
             </div>
        </div>
    );
    
    return (
        <div className="animate-fade-in">
            {isTemplateBrowserOpen && (
                <TemplateBrowser
                    tool="political"
                    onClose={() => setIsTemplateBrowserOpen(false)}
                    onSelect={handleSelectTemplate}
                />
            )}
            <ErrorMessage error={error} />
            <div className="p-4 sm:p-6 md:p-8 bg-slate-900/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg">
                {step === 'input' && renderInputStep()}
                {step === 'promptSelection' && renderPromptSelectionStep()}
                {step === 'generating' && renderGeneratingStep()}
                {step === 'result' && renderResultStep()}
            </div>
        </div>
    );
};
