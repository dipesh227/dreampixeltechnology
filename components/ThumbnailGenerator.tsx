import React, { useState, useCallback, useEffect } from 'react';
import { CreatorStyle, AspectRatio, UploadedFile, GeneratedConcept, ApiProvider } from '../types';
import { generatePrompts, generateThumbnail } from '../services/aiService';
import { CREATOR_STYLES } from '../services/constants';
import * as historyService from '../services/historyService';
import * as jobService from '../services/jobService';
import { HiArrowLeft, HiCheck, HiComputerDesktop, HiDevicePhoneMobile, HiArrowDownTray, HiOutlineHeart, HiOutlineSparkles, HiArrowUpTray, HiXMark, HiOutlineDocumentText, HiOutlineChatBubbleLeftRight, HiOutlineTag, HiOutlineDocumentDuplicate, HiOutlineArrowPath, HiOutlineLightBulb } from 'react-icons/hi2';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from './ErrorMessage';

type Step = 'input' | 'promptSelection' | 'generating' | 'result';

interface ThumbnailGeneratorProps {
    onNavigateHome: () => void;
    onThumbnailGenerated: () => void;
    onGenerating: (isGenerating: boolean) => void;
    apiProvider: ApiProvider;
    onOpenSettings: () => void;
}

const ThumbnailGenerator: React.FC<ThumbnailGeneratorProps> = ({ onNavigateHome, onThumbnailGenerated, onGenerating, apiProvider, onOpenSettings }) => {
    const { session } = useAuth();
    const [step, setStep] = useState<Step>('input');
    const [headshots, setHeadshots] = useState<UploadedFile[]>([]);
    const [description, setDescription] = useState('');
    const [thumbnailText, setThumbnailText] = useState('');
    const [brandDetails, setBrandDetails] = useState('');
    const [activeCategory, setActiveCategory] = useState(Object.keys(CREATOR_STYLES)[0]);
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

    useEffect(() => {
        onGenerating(isLoading);
    }, [isLoading, onGenerating]);

    const resetState = useCallback(() => {
        setStep('input');
        setHeadshots([]);
        setDescription('');
        setThumbnailText('');
        setBrandDetails('');
        setActiveCategory(Object.keys(CREATOR_STYLES)[0]);
        setSelectedStyleId(CREATOR_STYLES[Object.keys(CREATOR_STYLES)[0]][0].id);
        setAspectRatio('16:9');
        setGeneratedPrompts([]);
        setFinalPrompt('');
        setGeneratedThumbnail(null);
        setError(null);
        setIsLoading(false);
        setLoadingMessage('');
        setIsSaved(false);
    }, []);

    const handleBackToSettings = () => {
        setStep('input');
        setGeneratedPrompts([]);
        setFinalPrompt('');
        setGeneratedThumbnail(null);
        setError(null);
        setIsSaved(false);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const files = Array.from(event.target.files).slice(0, 5 - headshots.length);
            const filePromises = files.map(file => {
                return new Promise<UploadedFile>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        const base64 = (reader.result as string).split(',')[1];
                        resolve({ base64, mimeType: file.type, name: file.name });
                    };
                    reader.onerror = error => reject(error);
                    reader.readAsDataURL(file);
                });
            });

            Promise.all(filePromises).then(uploadedFiles => {
                setHeadshots(prev => [...prev, ...uploadedFiles].slice(0, 5));
            }).catch(err => {
                console.error("File reading error: ", err);
                setError("There was an error reading your files.");
            });
        }
    };
    
    const removeHeadshot = (index: number) => {
        setHeadshots(prev => prev.filter((_, i) => i !== index));
    };

    const handleGeneratePrompts = async () => {
        if (!description.trim()) {
            setError('Please provide a video description.');
            return;
        }

        // Log the job before starting generation
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


    const renderInputStep = () => (
        <div className="space-y-8">
            <div className="p-4 md:p-6 bg-slate-900/60 backdrop-blur-lg border border-slate-700/50 rounded-xl">
              <h2 className="text-xl font-bold text-white mb-1">1. Powered by Advanced Generative AI</h2>
              <p className="text-sm text-slate-400 mb-4">Using state-of-the-art models for the best results. You can also use your own API key in the settings.</p>
              <div className="flex divide-x divide-slate-700">
                <div className="pr-6">
                  <h3 className="font-semibold text-slate-300">Concept Generation</h3>
                  <p className="text-sm text-slate-500">Advanced Language Model</p>
                </div>
                <div className="pl-6">
                  <h3 className="font-semibold text-slate-300">Thumbnail Generation</h3>
                  <p className="text-sm text-slate-500">Multimodal Vision Model</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="p-4 md:p-6 bg-slate-900/60 backdrop-blur-lg border border-slate-700/50 rounded-xl">
                    <h2 className="text-xl font-bold text-white mb-1">2. Upload Headshots</h2>
                    <p className="text-sm text-slate-400 mb-4">Provide 1-5 images for the best face accuracy.</p>
                     {apiProvider === 'openai' && (
                        <div className="p-3 mb-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg text-xs text-yellow-400">
                            <strong>Provider Note:</strong> You have OpenAI selected. DALL-E 3 is a powerful text-to-image model but does not use uploaded headshots to create a likeness. The generated image will be based on the text prompt only.
                        </div>
                    )}
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
                    <div className="flex items-start gap-3">
                        <HiOutlineDocumentText className="w-6 h-6 mt-1 text-purple-400"/>
                        <div>
                           <h3 className="text-md font-bold text-white">2. Describe Your Video</h3>
                           <p className="text-sm text-slate-400 mb-2">The more detail, the better the thumbnail concepts.</p>
                        </div>
                    </div>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g., 'A video essay exploring the rise of AI in creative industries, and whether it will replace human artists...'" className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition text-sm" rows={4}></textarea>
                    
                     <div className="flex items-start gap-3">
                        <HiOutlineChatBubbleLeftRight className="w-6 h-6 mt-1 text-pink-400"/>
                        <div>
                           <h3 className="text-md font-bold text-white">Text on Thumbnail <span className="text-slate-400 font-normal">(Optional)</span></h3>
                           <p className="text-sm text-slate-400 mb-2">Add compelling text to grab attention. Keep it short!</p>
                        </div>
                    </div>
                    <input type="text" value={thumbnailText} onChange={e => setThumbnailText(e.target.value)} placeholder="e.g., 'AI TAKEOVER?!' or 'My BIGGEST Secret'" className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition text-sm" />

                    <div className="flex items-start gap-3">
                        <HiOutlineTag className="w-6 h-6 mt-1 text-sky-400"/>
                        <div>
                           <h3 className="text-md font-bold text-white">Brand Details <span className="text-slate-400 font-normal">(Optional)</span></h3>
                           <p className="text-sm text-slate-400 mb-2">Add a brand name or style notes (e.g., 'Use our font "Poppins"').</p>
                        </div>
                    </div>
                    <input type="text" value={brandDetails} onChange={e => setBrandDetails(e.target.value)} placeholder="e.g., 'DreamPixel Tech'" className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition text-sm" />
                </div>
            </div>

            <div className="p-4 md:p-6 bg-slate-900/60 backdrop-blur-lg border border-slate-700/50 rounded-xl">
                 <h2 className="text-xl font-bold text-white mb-4">3. Choose a Creator Style</h2>
                 <div className="flex flex-wrap gap-2 mb-4 border-b border-slate-800 pb-4">
                     {Object.keys(CREATOR_STYLES).map(category => (
                        <button key={category} onClick={() => setActiveCategory(category)} className={`px-4 py-1.5 text-sm rounded-full transition-colors duration-200 ${activeCategory === category ? 'bg-primary-gradient text-white font-semibold' : 'bg-slate-800 hover:bg-slate-700'}`}>
                           {category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </button>
                     ))}
                 </div>
                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {CREATOR_STYLES[activeCategory].map(style => (
                        <button key={style.id} onClick={() => setSelectedStyleId(style.id)} className={`p-4 rounded-lg border-2 text-left transition-colors duration-200 text-sm ${selectedStyleId === style.id ? 'border-purple-500 bg-slate-800/50' : 'border-slate-800 bg-slate-900 hover:border-slate-700'}`}>
                            <p className="font-bold text-white">{style.name}</p>
                            <p className="text-xs text-slate-400">{style.tags}</p>
                        </button>
                    ))}
                 </div>
            </div>
            
            <div className="p-4 md:p-6 bg-slate-900/60 backdrop-blur-lg border border-slate-700/50 rounded-xl">
                <h2 className="text-xl font-bold text-white mb-4">4. Choose Aspect Ratio</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button onClick={() => setAspectRatio('16:9')} className={`flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-colors duration-200 ${aspectRatio === '16:9' ? 'border-purple-500 bg-slate-800/50' : 'border-slate-800 bg-slate-900 hover:border-slate-700'}`}>
                        <HiComputerDesktop className="w-10 h-10 mb-2 text-slate-300"/>
                        <p className="font-bold text-lg text-white">16:9</p>
                        <p className="text-sm text-slate-400">YouTube</p>
                    </button>
                    <button onClick={() => setAspectRatio('9:16')} className={`flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-colors duration-200 ${aspectRatio === '9:16' ? 'border-purple-500 bg-slate-800/50' : 'border-slate-800 bg-slate-900 hover:border-slate-700'}`}>
                        <HiDevicePhoneMobile className="w-10 h-10 mb-2 text-slate-300"/>
                        <p className="font-bold text-lg text-white">9:16</p>
                        <p className="text-sm text-slate-400">Shorts/Reels</p>
                    </button>
                </div>
            </div>

             <div className="flex justify-center pt-4">
                <button onClick={handleGeneratePrompts} disabled={isLoading || !description.trim()} className="flex items-center gap-3 px-8 py-4 bg-primary-gradient text-white font-bold text-lg rounded-lg hover:opacity-90 transition-all duration-300 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed transform hover:scale-105">
                    {isLoading ? <div className="w-6 h-6 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : <HiOutlineSparkles className="w-6 h-6"/>}
                    {isLoading ? loadingMessage : 'Generate Thumbnail Concepts'}
                </button>
            </div>
        </div>
    );
    
    const handleCopyPrompt = (prompt: string) => {
        navigator.clipboard.writeText(prompt);
        setCopiedPrompt(prompt);
        setTimeout(() => setCopiedPrompt(null), 2000);
    };

    const renderPromptSelectionStep = () => (
        <div className="max-w-7xl mx-auto animate-fade-in">
            <h2 className="text-3xl font-bold text-center mb-2 text-white">Choose Your Thumbnail Style</h2>
            <p className="text-slate-400 text-center mb-10">Select a concept below to generate your thumbnail.</p>
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
                <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-purple-400 rounded-full animate-spin"></div>
            </div>
            <h2 className="text-3xl font-bold mt-8 text-white">{loadingMessage}</h2>
            <p className="text-slate-400 mt-2">This can take up to a minute. Please don't close the window.</p>
        </div>
    );

    const renderResultStep = () => (
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
             <h2 className="text-3xl font-bold text-center mb-8 text-white">Your Thumbnail is Ready!</h2>
             {generatedThumbnail && (
                <img src={`data:image/png;base64,${generatedThumbnail}`} alt="Generated Thumbnail" className="rounded-xl mx-auto shadow-2xl shadow-black/30 mb-8 border-2 border-slate-700/50" style={{ aspectRatio: aspectRatio.replace(':', ' / ') }} />
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
            <ErrorMessage error={error} onOpenSettings={onOpenSettings} />
            
            {step === 'input' && renderInputStep()}
            {(step === 'promptSelection' || step === 'generating' || step === 'result') && (
                <div className="p-4 sm:p-6 md:p-8 bg-slate-900/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg">
                    {step === 'promptSelection' && renderPromptSelectionStep()}
                    {step === 'generating' && renderGeneratingStep()}
                    {step === 'result' && renderResultStep()}
                </div>
            )}
        </div>
    );
};

export default ThumbnailGenerator;