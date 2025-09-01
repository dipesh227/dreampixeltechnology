
import React, { useState, useCallback, useMemo } from 'react';
import { PoliticalParty, PosterStyle, AspectRatio, UploadedFile, GeneratedConcept } from '../types';
import { generatePosterPrompts, generatePoster } from '../services/geminiService';
import { POLITICAL_PARTIES, POSTER_STYLES, POSTER_THEMES } from '../services/constants';
import * as historyService from '../services/historyService';
import { DownloadIcon, HeartIcon, SparklesIcon, UploadIcon, XMarkIcon, FlagIcon, CalendarDaysIcon, DocumentTextIcon, ComputerDesktopIcon, DevicePhoneMobileIcon, ArrowPathIcon, ArrowLeftIcon, DocumentDuplicateIcon, CheckIcon, LightBulbIcon } from './icons/ActionIcons';

type Step = 'input' | 'promptSelection' | 'generating' | 'result';

interface PoliticiansPosterMakerProps {
    onNavigateHome: () => void;
    onPosterGenerated: () => void;
}

const PoliticiansPosterMaker: React.FC<PoliticiansPosterMakerProps> = ({ onNavigateHome, onPosterGenerated }) => {
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
    const [isSaved, setIsSaved] = useState(false);
    const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);

    const handleBackToSettings = () => {
        setStep('input');
        // Clear only the generation-specific state, keep the inputs
        setGeneratedPrompts([]);
        setFinalPrompt('');
        setGeneratedPoster(null);
        setError(null);
        setIsSaved(false);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = (reader.result as string).split(',')[1];
                setHeadshots([{ base64, mimeType: file.type, name: file.name }]);
            };
            reader.onerror = error => {
                console.error("File reading error: ", error);
                setError("There was an error reading your file.");
            };
            reader.readAsDataURL(file);
        }
    };
    
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
        setIsLoading(true);
        setError(null);
        try {
            const finalEventTheme = selectedEvent === 'other' ? customEventTheme : selectedEvent;
            if (selectedEvent === 'other' && !customEventTheme.trim()) {
                setError('Please enter your custom theme.');
                setIsLoading(false);
                return;
            }
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
            // This check is redundant if handleGenerateConcepts has run, but good for safety
            setError('A headshot is required to generate a poster.');
            setStep('input');
            return;
        }
        setIsLoading(true);
        setError(null);
        setFinalPrompt(prompt);
        setStep('generating');
        setIsSaved(false); // Reset saved state for new generation
        try {
            const posterResult = await generatePoster(prompt, headshots, aspectRatio);
            if(posterResult) {
                setGeneratedPoster(posterResult);
                setStep('result');
            } else {
                throw new Error("The AI failed to generate a poster. Please try again.");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate poster.');
            setStep('promptSelection'); // Go back to prompts on failure
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveCreation = () => {
        if (generatedPoster && !isSaved && selectedParty) {
            const newEntry = {
                id: new Date().toISOString(),
                prompt: finalPrompt,
                imageUrl: `data:image/png;base64,${generatedPoster}`,
                timestamp: Date.now()
            };
            historyService.saveCreation(newEntry);
            setIsSaved(true);
            onPosterGenerated();
        }
    };

    const handleCopyPrompt = (prompt: string) => {
        navigator.clipboard.writeText(prompt);
        setCopiedPrompt(prompt);
        setTimeout(() => setCopiedPrompt(null), 2000);
    };

    const renderInputStep = () => (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
                    <h2 className="text-xl font-bold text-white mb-1">1. Upload Headshot</h2>
                    <p className="text-sm text-slate-400 mb-4">Provide one clear image for the poster.</p>
                    <div className="p-6 border-2 border-dashed border-slate-700 rounded-xl text-center bg-slate-800/50 hover:border-slate-600 transition h-48 flex flex-col justify-center">
                         <input type="file" id="file-upload" className="hidden" accept="image/png, image/jpeg" onChange={handleFileChange} disabled={headshots.length >= 1} />
                         <label htmlFor="file-upload" className={`cursor-pointer ${headshots.length >= 1 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            <UploadIcon className="w-8 h-8 mx-auto text-slate-500 mb-2"/>
                            <p className="text-slate-300 font-semibold">Click to upload or drag & drop</p>
                         </label>
                    </div>
                     {headshots.length > 0 && 
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 mt-4">
                            {headshots.map((file, index) => (
                                <div key={index} className="relative group aspect-square">
                                    <img src={`data:${file.mimeType};base64,${file.base64}`} alt={file.name} className="rounded-lg object-cover w-full h-full"/>
                                    <button onClick={() => removeHeadshot(index)} className="absolute top-1 right-1 bg-black/60 rounded-full p-1 text-white hover:bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <XMarkIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    }
                </div>
                 <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
                    <div className="flex items-start gap-3">
                        <FlagIcon className="w-5 h-5 mt-1 text-slate-400"/>
                        <div>
                           <h3 className="text-md font-bold text-white">2. Select Party</h3>
                           <p className="text-sm text-slate-400 mb-2">The poster will use the party's branding.</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {POLITICAL_PARTIES.map(party => (
                            <button key={party.id} onClick={() => setSelectedPartyId(party.id)} className={`px-3 py-1 text-sm rounded-full transition-colors duration-200 ${selectedPartyId === party.id ? 'bg-blue-600 text-white font-semibold' : 'bg-slate-800 hover:bg-slate-700'}`}>
                               {party.name}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-start gap-3 pt-2">
                        <CalendarDaysIcon className="w-5 h-5 mt-1 text-slate-400"/>
                        <div>
                           <h3 className="text-md font-bold text-white">3. Select Event/Theme</h3>
                           <p className="text-sm text-slate-400 mb-2">What is the poster for?</p>
                        </div>
                    </div>
                    <select
                        value={selectedEvent}
                        onChange={(e) => setSelectedEvent(e.target.value)}
                        className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-slate-600 focus:border-slate-600 transition text-sm"
                    >
                        {POSTER_THEMES.map(theme => (
                            <option key={theme} value={theme}>{theme}</option>
                        ))}
                        <option value="other">Other (Please specify)</option>
                    </select>
                    {selectedEvent === 'other' && (
                        <input 
                            type="text" 
                            value={customEventTheme} 
                            onChange={e => setCustomEventTheme(e.target.value)} 
                            placeholder="Enter your custom theme" 
                            className="w-full mt-2 p-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-slate-600 focus:border-slate-600 transition text-sm animate-fade-in" 
                        />
                    )}

                    <div className="flex items-start gap-3 pt-2">
                        <DocumentTextIcon className="w-5 h-5 mt-1 text-slate-400"/>
                        <div>
                           <h3 className="text-md font-bold text-white">4. Custom Text <span className="text-slate-400 font-normal">(Optional)</span></h3>
                           <p className="text-sm text-slate-400 mb-2">Enter the main message for the poster.</p>
                        </div>
                    </div>
                    <textarea value={customText} onChange={(e) => setCustomText(e.target.value)} placeholder="e.g., 'Vote for Progress!'" className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-slate-600 focus:border-slate-600 transition text-sm" rows={2}></textarea>
                </div>
            </div>

            <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
                 <h2 className="text-xl font-bold text-white mb-4">5. Choose a Poster Style</h2>
                 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {POSTER_STYLES.map(style => (
                        <button key={style.id} onClick={() => setSelectedStyleId(style.id)} className={`p-4 rounded-lg border-2 text-left transition-colors duration-200 text-sm ${selectedStyleId === style.id ? 'border-blue-500 bg-slate-800/50' : 'border-slate-800 bg-slate-900 hover:border-slate-700'}`}>
                            <p className="font-bold text-white">{style.name}</p>
                            <p className="text-xs text-slate-400">{style.tags}</p>
                        </button>
                    ))}
                 </div>
            </div>
            
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
                <h2 className="text-xl font-bold text-white mb-4">6. Choose Aspect Ratio</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button onClick={() => setAspectRatio('1:1')} className={`flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-colors duration-200 ${aspectRatio === '1:1' ? 'border-blue-500 bg-slate-800/50' : 'border-slate-800 bg-slate-900 hover:border-slate-700'}`}>
                        <ComputerDesktopIcon className="w-10 h-10 mb-2 text-slate-300"/>
                        <p className="font-bold text-lg text-white">1:1</p>
                        <p className="text-sm text-slate-400">Square</p>
                    </button>
                     <button onClick={() => setAspectRatio('4:5')} className={`flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-colors duration-200 ${aspectRatio === '4:5' ? 'border-blue-500 bg-slate-800/50' : 'border-slate-800 bg-slate-900 hover:border-slate-700'}`}>
                        <DevicePhoneMobileIcon className="w-10 h-10 mb-2 text-slate-300"/>
                        <p className="font-bold text-lg text-white">4:5</p>
                        <p className="text-sm text-slate-400">Portrait</p>
                    </button>
                    <button onClick={() => setAspectRatio('16:9')} className={`flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-colors duration-200 ${aspectRatio === '16:9' ? 'border-blue-500 bg-slate-800/50' : 'border-slate-800 bg-slate-900 hover:border-slate-700'}`}>
                        <ComputerDesktopIcon className="w-10 h-10 mb-2 text-slate-300"/>
                        <p className="font-bold text-lg text-white">16:9</p>
                        <p className="text-sm text-slate-400">Landscape</p>
                    </button>
                </div>
            </div>

             <div className="flex justify-center pt-4">
                <button onClick={handleGenerateConcepts} disabled={isLoading} className="flex items-center gap-3 px-8 py-4 bg-slate-200 text-slate-900 font-bold text-lg rounded-lg hover:bg-white transition-all duration-300 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed transform hover:scale-105">
                    {isLoading ? <div className="w-6 h-6 border-2 border-t-transparent border-slate-900 rounded-full animate-spin"></div> : <SparklesIcon className="w-6 h-6"/>}
                    {isLoading ? 'Generating Concepts...' : 'Generate Poster Concepts'}
                </button>
            </div>
        </div>
    );
    
    const renderPromptSelectionStep = () => (
        <div className="max-w-7xl mx-auto animate-fade-in">
            <h2 className="text-3xl font-bold text-center mb-2 text-white">Choose Your Poster Style</h2>
            <p className="text-slate-400 text-center mb-10">Select a concept below to generate your poster.</p>
            <div className="grid md:grid-cols-3 gap-6">
                {generatedPrompts.map((concept, index) => (
                    <div 
                        key={index} 
                        onClick={() => handleGeneratePoster(concept.prompt)}
                        className={`relative p-6 rounded-xl border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between
                            ${concept.isRecommended 
                                ? 'border-amber-400 bg-slate-800/50' 
                                : 'border-slate-800 bg-slate-900 hover:border-slate-700 hover:-translate-y-1'
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
                                {copiedPrompt === concept.prompt ? <CheckIcon className="w-4 h-4 text-green-400" /> : <DocumentDuplicateIcon className="w-4 h-4" />}
                                {copiedPrompt === concept.prompt ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-center mt-10">
                <button onClick={() => setStep('input')} className="flex items-center gap-2 px-6 py-2 text-slate-400 hover:text-slate-300 bg-slate-800/50 border border-slate-700 rounded-lg transition-colors">
                    <ArrowLeftIcon className="w-5 h-5" /> Back
                </button>
            </div>
        </div>
    );
    
    const renderGeneratingStep = () => (
        <div className="text-center py-20 animate-fade-in">
            <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-slate-400 rounded-full animate-spin"></div>
            </div>
            <h2 className="text-3xl font-bold mt-8 text-white">Creating your poster...</h2>
            <p className="text-slate-400 mt-2">This can take up to a minute. Please don't close the window.</p>
        </div>
    );

    const renderResultStep = () => (
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
             <h2 className="text-3xl font-bold text-center mb-8 text-white">Your Poster is Ready!</h2>
             {generatedPoster && (
                <img src={`data:image/png;base64,${generatedPoster}`} alt="Generated Poster" className="rounded-xl mx-auto shadow-2xl shadow-black/30 mb-8 border-2 border-slate-700/50" style={{ aspectRatio: aspectRatio.replace(':', ' / ') }} />
             )}
             <div className="flex justify-center gap-4 flex-wrap">
                 <button onClick={handleBackToSettings} className="flex items-center gap-2 px-6 py-3 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 transition-all duration-300 border border-slate-700">
                    <ArrowLeftIcon className="w-5 h-5"/> Back to Settings
                 </button>
                 <button onClick={() => setStep('promptSelection')} className="flex items-center gap-2 px-6 py-3 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 transition-all duration-300 border border-slate-700">
                    <LightBulbIcon className="w-5 h-5"/> Back to Concepts
                 </button>
                 <button onClick={() => handleGeneratePoster(finalPrompt)} disabled={isLoading} className="flex items-center gap-2 px-6 py-3 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700 transition-all duration-300 border border-slate-700 disabled:opacity-60 disabled:cursor-not-allowed">
                    <ArrowPathIcon className="w-5 h-5"/> Regenerate
                 </button>
                 <button onClick={handleSaveCreation} disabled={isSaved} className="flex items-center gap-2 px-6 py-3 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700 transition-all duration-300 border border-slate-700 disabled:opacity-60 disabled:cursor-not-allowed">
                    <HeartIcon className={`w-5 h-5 ${isSaved ? 'text-pink-500' : ''}`} /> {isSaved ? 'Saved!' : 'Like & Save Creation'}
                 </button>
                 <a href={`data:image/png;base64,${generatedPoster}`} download="dreampixel-poster.png" className="flex items-center gap-2 px-6 py-3 bg-slate-200 text-slate-900 font-bold rounded-lg hover:bg-white transition-all duration-300 transform hover:scale-105">
                    <DownloadIcon className="w-5 h-5"/> Download
                 </a>
             </div>
        </div>
    );

    return (
        <div className="animate-fade-in">
            {error && <div className="bg-red-900/50 border border-red-500 text-red-300 p-4 rounded-lg mb-6 max-w-4xl mx-auto">{error}</div>}
            
            {step === 'input' && renderInputStep()}
            {(step === 'promptSelection' || step === 'generating' || step === 'result') && (
                <div className="p-4 sm:p-6 md:p-8 bg-slate-900/70 border border-slate-800 rounded-2xl shadow-lg backdrop-blur-xl">
                    {step === 'promptSelection' && renderPromptSelectionStep()}
                    {step === 'generating' && renderGeneratingStep()}
                    {step === 'result' && renderResultStep()}
                </div>
            )}
        </div>
    );
};

export default PoliticiansPosterMaker;
