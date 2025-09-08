
import React, { useState, useCallback, useEffect } from 'react';
import { CreatorStyle, AspectRatio, UploadedFile, GeneratedConcept, TemplatePrefillData } from '../types';
import { generatePrompts, generateThumbnail } from '../services/aiService';
import { CREATOR_STYLES } from '../services/constants';
import * as historyService from '../services/historyService';
import * as jobService from '../services/jobService';
import { HiArrowLeft, HiCheck, HiArrowDownTray, HiOutlineHeart, HiOutlineSparkles, HiArrowUpTray, HiXMark, HiOutlineDocumentText, HiOutlineChatBubbleLeftRight, HiOutlineTag, HiOutlineDocumentDuplicate, HiOutlineArrowPath, HiOutlineLightBulb, HiOutlineQueueList } from 'react-icons/hi2';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from './ErrorMessage';
import TemplateBrowser from './TemplateBrowser';
import StyleSelector from './StyleSelector';
import AspectRatioSelector from './AspectRatioSelector';
import { resizeImage } from '../utils/cropImage';

type Step = 'input' | 'promptSelection' | 'generating' | 'result';

interface ThumbnailGeneratorProps {
    onNavigateHome: () => void;
    onThumbnailGenerated: () => void;
    onGenerating: (isGenerating: boolean) => void;
}

export const ThumbnailGenerator: React.FC<ThumbnailGeneratorProps> = ({ onNavigateHome, onThumbnailGenerated, onGenerating }) => {
    const { session } = useAuth();
    const [step, setStep] = useState<Step>('input');
    const [headshots, setHeadshots] = useState<UploadedFile[]>([]);
    const [description, setDescription] = useState('');
    const [thumbnailText, setThumbnailText] = useState('');
    const [brandDetails, setBrandDetails] = useState('');
    const [selectedStyleId, setSelectedStyleId] = useState<string>(CREATOR_STYLES[Object.keys(CREATOR_STYLES)[0]][0].id);
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
    const [generatedPrompts, setGeneratedPrompts] = useState<GeneratedConcept[]>([]);
    const [finalPrompt, setFinalPrompt] = useState<string>('');
    const [generatedThumbnail, setGeneratedThumbnail] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [isSaved, setIsSaved] = useState(false);
    const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);
    const [isTemplateBrowserOpen, setIsTemplateBrowserOpen] = useState(false);

    useEffect(() => {
        onGenerating(isLoading);
    }, [isLoading, onGenerating]);

    const handleBackToSettings = () => {
        setStep('input');
        setGeneratedPrompts([]);
        setFinalPrompt('');
        setGeneratedThumbnail(null);
        setError(null);
        setIsSaved(false);
    };

    const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const files = Array.from(event.target.files).slice(0, 5 - headshots.length);
            for (const file of files) {
                try {
                    const resizedImage = await resizeImage(file, 2048);
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

    const handleGeneratePrompts = async () => {
        if (!description.trim()) {
            setError('Please provide a video description.');
            return;
        }

        if (session) {
            jobService.saveThumbnailJob({
                userId: session.user.id,
                description,
                thumbnailText,
                brandDetails,
                styleId: selectedStyleId,
                aspectRatio,
                headshots
            });
        }

        setIsLoading(true);
        setError(null);
        try {
            const allStyles = Object.values(CREATOR_STYLES).flat();
            const selectedStyle = allStyles.find(s => s.id === selectedStyleId);
            if (!selectedStyle) {
                throw new Error("A creator style must be selected.");
            }
            const prompts = await generatePrompts(description, selectedStyle);
            setGeneratedPrompts(prompts);
            setStep('promptSelection');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate prompts.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateThumbnail = async (prompt: string) => {
        if (!prompt) {
            setError('Please select a prompt.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setFinalPrompt(prompt);
        setStep('generating');
        setIsSaved(false);
        try {
            const allStyles = Object.values(CREATOR_STYLES).flat();
            const style = allStyles.find(s => s.id === selectedStyleId);
            if (!style) throw new Error("Selected style not found.");
            
            const thumbnailResult = await generateThumbnail(prompt, headshots, style, aspectRatio, thumbnailText, brandDetails);
            if(thumbnailResult) {
                setGeneratedThumbnail(thumbnailResult);
                setStep('result');
            } else {
                throw new Error("The AI failed to generate an image. Please try a different prompt or headshots.");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate thumbnail.');
            setStep('promptSelection');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveCreation = async () => {
        if (generatedThumbnail && !isSaved && session) {
            const newEntry = {
                id: '',
                prompt: finalPrompt,
                imageUrl: `data:image/png;base64,${generatedThumbnail}`,
                timestamp: Date.now()
            };
            try {
                await historyService.saveCreation(newEntry, session.user.id);
                setIsSaved(true);
                onThumbnailGenerated();
            } catch (error) {
                setError("Failed to save creation. Please try again.");
            }
        }
    };
    
    const handleSelectTemplate = (prefill: TemplatePrefillData) => {
        if (prefill.styleId) setSelectedStyleId(prefill.styleId);
        if (prefill.aspectRatio) setAspectRatio(prefill.aspectRatio);
        if (prefill.description) setDescription(prefill.description);
        if (prefill.thumbnailText) setThumbnailText(prefill.thumbnailText);
    };
    
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        
        if (isLoading && step === 'input') {
            const messages = [
                'Analyzing video description...',
                'Brainstorming viral ideas...',
                'Crafting compelling concepts...',
                'Finalizing suggestions...'
            ];
            let index = 0;
            setLoadingMessage(messages[index]);
            interval = setInterval(() => {
                index = (index + 1) % messages.length;
                setLoadingMessage(messages[index]);
            }, 2000);
        } else if (step === 'generating') {
            const messages = [
                'Initializing AI art matrix...',
                'Analyzing headshot vectors...',
                'Synthesizing creative concepts...',
                'Rendering final pixels...',
                'Polishing the masterpiece...',
                'Almost there...',
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
                <div className="p-4 md:p-6 main-content-area rounded-xl" data-tooltip="Upload 1-5 high-quality images of the person to be featured. The AI will use these to ensure the face in the thumbnail is a perfect match.">
                    <h2 className="text-xl font-bold text-headings mb-1">1. Upload Headshots</h2>
                    <p className="text-sm text-text-secondary mb-4">Provide 1-5 images for the best face accuracy.</p>
                    <div className="p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-center bg-slate-100 dark:bg-slate-800/50 hover:border-slate-400 dark:hover:border-slate-600 transition h-48 flex flex-col justify-center">
                         <input type="file" id="file-upload" className="hidden" multiple accept="image/png, image/jpeg" onChange={handleFileChange} disabled={headshots.length >= 5} />
                         <label htmlFor="file-upload" className={`cursor-pointer ${headshots.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            <HiArrowUpTray className="w-8 h-8 mx-auto text-slate-500 dark:text-slate-500 mb-2"/>
                            <p className="text-text-primary font-semibold">Click to upload or drag & drop</p>
                            <p className="text-xs text-text-secondary">You can add {5 - headshots.length} more images.</p>
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
                 <div className="p-4 md:p-6 main-content-area rounded-xl space-y-4">
                    <div data-tooltip="Describe your video in detail. The AI uses this to brainstorm concepts that match your content and attract viewers.">
                        <div className="flex items-start gap-3">
                            <HiOutlineDocumentText className="w-6 h-6 mt-1 text-purple-500"/>
                            <div>
                               <h3 className="text-md font-bold text-headings">2. Describe Your Video</h3>
                               <p className="text-sm text-text-secondary mb-2">The more detail, the better the thumbnail concepts.</p>
                            </div>
                        </div>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g., 'A video essay exploring the rise of AI in creative industries...'" className="w-full p-3 rounded-lg focus:ring-2 focus:ring-purple-500 transition text-sm" rows={4}></textarea>
                    </div>
                    
                    <div data-tooltip="Add short, punchy text that grabs attention. Keep it under 5-6 words for maximum impact.">
                         <div className="flex items-start gap-3">
                            <HiOutlineChatBubbleLeftRight className="w-6 h-6 mt-1 text-pink-500"/>
                            <div>
                               <h3 className="text-md font-bold text-headings">Text on Thumbnail <span className="text-text-secondary font-normal">(Optional)</span></h3>
                               <p className="text-sm text-text-secondary mb-2">Keep it short!</p>
                            </div>
                        </div>
                        <input type="text" value={thumbnailText} onChange={e => setThumbnailText(e.target.value)} placeholder="e.g., 'AI TAKEOVER?!'" className="w-full p-3 rounded-lg focus:ring-2 focus:ring-purple-500 transition text-sm" />
                    </div>

                    <div data-tooltip="Include your brand name, a specific font, or other branding notes.">
                        <div className="flex items-start gap-3">
                            <HiOutlineTag className="w-6 h-6 mt-1 text-sky-500"/>
                            <div>
                               <h3 className="text-md font-bold text-headings">Brand Details <span className="text-text-secondary font-normal">(Optional)</span></h3>
                               <p className="text-sm text-text-secondary mb-2">Add a brand name or style notes.</p>
                            </div>
                        </div>
                        <input type="text" value={brandDetails} onChange={e => setBrandDetails(e.target.value)} placeholder="e.g., 'DreamPixel Tech'" className="w-full p-3 rounded-lg focus:ring-2 focus:ring-purple-500 transition text-sm" />
                    </div>
                </div>
            </div>

            <StyleSelector
                title="3. Choose a Creator Style"
                tooltip="Select a creator whose style you admire. This choice heavily influences the mood, color, and composition of the generated thumbnail concepts."
                stylesData={CREATOR_STYLES}
                selectedStyleId={selectedStyleId}
                onStyleSelect={setSelectedStyleId}
            />
            
            <AspectRatioSelector
                selectedRatio={aspectRatio}
                onSelectRatio={setAspectRatio}
                availableRatios={['16:9', '9:16', '1:1', '4:5']}
            />

             <div className="flex justify-center pt-4">
                <button onClick={handleGeneratePrompts} disabled={isLoading || !description.trim()} className="flex items-center gap-3 px-8 py-4 bg-primary-gradient text-white font-bold text-lg rounded-lg hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105">
                    {isLoading ? <div className="w-6 h-6 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : <HiOutlineSparkles className="w-6 h-6"/>}
                    {isLoading ? loadingMessage : 'Generate Thumbnail Concepts'}
                </button>
            </div>
        </div>
    );
    
    const renderPromptSelectionStep = () => (
        <div className="max-w-7xl mx-auto animate-fade-in">
            <h2 className="text-3xl font-bold text-center mb-2 text-headings">Choose Your Thumbnail Style</h2>
            <p className="text-text-secondary text-center mb-10">Select a concept below to generate your thumbnail. Hover to see the detailed AI prompt.</p>
            <div className="grid md:grid-cols-3 gap-6">
                {generatedPrompts.map((concept, index) => (
                    <div 
                        key={index} 
                        onClick={() => handleGenerateThumbnail(concept.prompt)}
                        className={`relative p-6 rounded-xl border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between
                            ${concept.isRecommended 
                                ? 'border-amber-400 bg-slate-800/50' 
                                : 'border-slate-800 bg-slate-900/70 hover:border-slate-700 hover:-translate-y-1'
                            }`}
                        data-tooltip={concept.structured_prompt ? JSON.stringify(concept.structured_prompt, null, 2) : 'No structured prompt available.'}
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
            <p className="text-center text-xs text-slate-500 mt-4">Select a concept to choose your generation model.</p>
        </div>
    );
    
    const renderGeneratingStep = () => (
        <div className="text-center py-20 animate-fade-in">
            <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-purple-500 rounded-full animate-spin"></div>
            </div>
            <h2 className="text-3xl font-bold mt-8 text-headings">{loadingMessage}</h2>
            <p className="text-text-secondary mt-2">This can take up to a minute. Please don't close the window.</p>
        </div>
    );

    const renderResultStep = () => (
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
             <h2 className="text-3xl font-bold text-center mb-8 text-headings">Your Thumbnail is Ready!</h2>
             {generatedThumbnail && (
                <img src={`data:image/png;base64,${generatedThumbnail}`} alt="Generated Thumbnail" className="rounded-xl mx-auto shadow-2xl shadow-black/30 mb-8 border-2 border-slate-300 dark:border-slate-700/50" style={{ aspectRatio: aspectRatio.replace(':', ' / ') }} />
             )}
             <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center items-center gap-4">
                 <button onClick={handleBackToSettings} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 transition-all duration-300 border border-slate-700 icon-hover-effect">
                    <HiArrowLeft className="w-5 h-5 text-slate-300"/> Back to Settings
                 </button>
                 <button onClick={() => setStep('promptSelection')} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 transition-all duration-300 border border-slate-700 icon-hover-effect icon-hover-effect-yellow">
                    <HiOutlineLightBulb className="w-5 h-5 text-yellow-400"/> Back to Concepts
                 </button>
                 <button onClick={() => handleGenerateThumbnail(finalPrompt)} disabled={isLoading} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700 transition-all duration-300 border border-slate-700 disabled:opacity-60 disabled:cursor-not-allowed icon-hover-effect icon-hover-effect-blue">
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
                 <a href={`data:image/png;base64,${generatedThumbnail}`} download="dreampixel-thumbnail.png" className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary-gradient text-white font-bold rounded-lg hover:opacity-90 transition-all duration-300 transform hover:scale-105">
                    <HiArrowDownTray className="w-5 h-5"/> Download
                 </a>
             </div>
        </div>
    );

    return (
        <div className="animate-fade-in">
            {isTemplateBrowserOpen && (
                <TemplateBrowser
                    tool="thumbnail"
                    onClose={() => setIsTemplateBrowserOpen(false)}
                    onSelect={handleSelectTemplate}
                />
            )}
            <ErrorMessage error={error} />
            <div className="p-4 sm:p-6 md:p-8 main-content-area rounded-2xl shadow-lg">
                <div className="sm:hidden md:block"> {/* Responsive check */}
                    {step === 'input' && renderInputStep()}
                </div>
                {step === 'promptSelection' && renderPromptSelectionStep()}
                {step === 'generating' && renderGeneratingStep()}
                {step === 'result' && renderResultStep()}
            </div>
        </div>
    );
};
