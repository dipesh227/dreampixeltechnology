

import React, { useState, useCallback, useEffect } from 'react';
import { AdStyle, AspectRatio, UploadedFile, GeneratedConcept, TemplatePrefillData } from '../types';
import { generateAdConcepts, generateAdBanner, editImage } from '../services/aiService';
import { AD_STYLES } from '../services/constants';
import * as historyService from '../services/historyService';
import * as jobService from '../services/jobService';
import { HiArrowDownTray, HiOutlineHeart, HiOutlineSparkles, HiArrowUpTray, HiXMark, HiOutlineDocumentText, HiOutlineChatBubbleLeftRight, HiOutlineTag, HiOutlineArrowPath, HiArrowLeft, HiOutlineDocumentDuplicate, HiCheck, HiOutlineLightBulb, HiOutlineCube, HiOutlineUserCircle, HiOutlineQueueList, HiOutlineWrenchScrewdriver } from 'react-icons/hi2';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from './ErrorMessage';
import TemplateBrowser from './TemplateBrowser';
import StyleSelector from './StyleSelector';
import { resizeImage } from '../utils/cropImage';

type Step = 'input' | 'promptSelection' | 'generating' | 'result';

interface AdBannerGeneratorProps {
    onNavigateHome: () => void;
    onBannerGenerated: () => void;
    onGenerating: (isGenerating: boolean) => void;
}

export const AdBannerGenerator: React.FC<AdBannerGeneratorProps> = ({ onNavigateHome, onBannerGenerated, onGenerating }) => {
    const { session } = useAuth();
    const [step, setStep] = useState<Step>('input');
    const [productImage, setProductImage] = useState<UploadedFile | null>(null);
    const [modelHeadshot, setModelHeadshot] = useState<UploadedFile | null>(null);
    const [productDescription, setProductDescription] = useState('');
    const [headline, setHeadline] = useState('');
    const [brandDetails, setBrandDetails] = useState('');
    const [selectedStyleId, setSelectedStyleId] = useState<string>(AD_STYLES[Object.keys(AD_STYLES)[0]][0].id);
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
    
    const [generatedPrompts, setGeneratedPrompts] = useState<GeneratedConcept[]>([]);
    const [finalPrompt, setFinalPrompt] = useState<string>('');
    const [generatedBanner, setGeneratedBanner] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [isSaved, setIsSaved] = useState(false);
    const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);
    const [isTemplateBrowserOpen, setIsTemplateBrowserOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editPrompt, setEditPrompt] = useState('');

    useEffect(() => {
        onGenerating(isLoading || isEditing);
    }, [isLoading, isEditing, onGenerating]);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;

        if (isLoading && step === 'input') {
            const messages = [
                'Analyzing product details...',
                'Brainstorming ad angles...',
                'Crafting creative concepts...',
                'Finalizing suggestions...'
            ];
            let index = 0;
            setLoadingMessage(messages[index]);
            interval = setInterval(() => {
                index = (index + 1) % messages.length;
                setLoadingMessage(messages[index]);
            }, 2000);
        } else if (isLoading || isEditing) {
            const messages = [
                'Setting up the ad canvas...',
                'Compositing product and model...',
                'Applying brand styles...',
                'Adding headline text...',
                'Rendering final banner...',
                'Polishing the ad creative...'
            ];
            let index = 0;
            setLoadingMessage(messages[index]);
            interval = setInterval(() => {
                index = (index + 1) % messages.length;
                setLoadingMessage(messages[index]);
            }, 2500);
        }
        return () => clearInterval(interval);
    }, [isLoading, step, isEditing]);

    const handleBackToSettings = () => {
        setStep('input');
        setGeneratedPrompts([]);
        setFinalPrompt('');
        setGeneratedBanner(null);
        setError(null);
        setIsSaved(false);
        setIsEditing(false);
        setEditPrompt('');
    };

    const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>, fileType: 'product' | 'model') => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            try {
                const resizedFile = await resizeImage(file, 2048);
                if (fileType === 'product') {
                    setProductImage(resizedFile);
                } else if (fileType === 'model') {
                    setModelHeadshot(resizedFile);
                }
            } catch (error) {
                console.error("Error resizing image:", error);
                setError("Failed to process image. Please try a different file.");
            }
            event.target.value = '';
        }
    }, []);

    const handleGenerateConcepts = async () => {
        if (!productImage) {
            setError('A product image is required.');
            return;
        }
        if (!modelHeadshot) {
            setError('A model headshot is required.');
            return;
        }
        if (!productDescription.trim() || !headline.trim()) {
            setError('Please provide a product description and a headline.');
            return;
        }
        
        if (session) {
            jobService.saveAdBannerJob({
                userId: session.user.id,
                productDescription,
                headline,
                brandDetails,
                styleId: selectedStyleId,
                aspectRatio,
                productImage,
                modelHeadshot
            });
        }
        
        setIsLoading(true);
        setError(null);
        try {
            const allStyles = Object.values(AD_STYLES).flat();
            const selectedStyle = allStyles.find(s => s.id === selectedStyleId);
            if (!selectedStyle) throw new Error("An ad style must be selected.");
            
            const prompts = await generateAdConcepts(productDescription, headline, selectedStyle);
            setGeneratedPrompts(prompts);
            setStep('promptSelection');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate concepts.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateBanner = async (prompt: string) => {
        if (!productImage || !modelHeadshot) {
            setError('A product image and model headshot are required.');
            setStep('input');
            return;
        }
        setIsLoading(true);
        setError(null);
        setFinalPrompt(prompt);
        setStep('generating');
        setIsSaved(false);
        try {
            const bannerResult = await generateAdBanner(prompt, productImage, modelHeadshot, headline, brandDetails, aspectRatio);
            if(bannerResult) {
                setGeneratedBanner(bannerResult);
                setStep('result');
            } else {
                throw new Error("The AI failed to generate an ad banner. Please try again.");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate banner.');
            setStep('promptSelection');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveCreation = async () => {
        if (generatedBanner && !isSaved && session) {
            const newEntry = {
                id: '',
                prompt: finalPrompt,
                imageUrl: `data:image/png;base64,${generatedBanner}`,
                timestamp: Date.now()
            };
            try {
                await historyService.saveCreation(newEntry, session.user.id);
                setIsSaved(true);
                onBannerGenerated();
            } catch (error) {
                setError("Failed to save creation. Please try again.");
            }
        }
    };

    const handleMagicEdit = async () => {
        if (!generatedBanner || !editPrompt.trim()) {
            setError("Cannot edit without an image and an edit instruction.");
            return;
        }
        setIsEditing(true);
        setError(null);
        setLoadingMessage("Applying your magic edit...");
        try {
            const editedResult = await editImage(generatedBanner, editPrompt);
            if (editedResult) {
                setGeneratedBanner(editedResult);
                setEditPrompt('');
            } else {
                throw new Error("The AI failed to apply the edit. It may have been a complex request or a safety filter was triggered.");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to apply edit.');
        } finally {
            setIsEditing(false);
        }
    };
    
    const handleSelectTemplate = (prefill: TemplatePrefillData) => {
        if (prefill.styleId) setSelectedStyleId(prefill.styleId);
        if (prefill.aspectRatio) setAspectRatio(prefill.aspectRatio);
        if (prefill.productDescription) setProductDescription(prefill.productDescription);
        if (prefill.headline) setHeadline(prefill.headline);
        if (prefill.brandDetails) setBrandDetails(prefill.brandDetails);
    };
    
    const handleCopyPrompt = (prompt: string) => {
        navigator.clipboard.writeText(prompt);
        setCopiedPrompt(prompt);
        setTimeout(() => setCopiedPrompt(null), 2000);
    };

    const renderInputStep = () => (
        <div className="space-y-8">
            <div className="flex justify-end">
                <button onClick={() => setIsTemplateBrowserOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 transition-colors icon-hover-effect-blue">
                    <HiOutlineQueueList className="w-5 h-5 text-sky-400" />
                    Browse Templates
                </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="p-4 md:p-6 bg-slate-900/60 backdrop-blur-lg border border-slate-700/50 rounded-xl space-y-4">
                    <h2 className="text-xl font-bold text-white mb-1">1. Upload Assets</h2>
                    <p className="text-sm text-slate-400 mb-4">Provide images for the product and the model.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div data-tooltip="Upload a clear, high-quality image of your product. A transparent PNG is recommended.">
                            <label className="font-semibold text-slate-300 flex items-center gap-2"><HiOutlineCube className="w-5 h-5"/> Product Image</label>
                            <div className="mt-2 p-2 border-2 border-dashed rounded-xl text-center bg-slate-800/50 hover:border-slate-600 transition h-24 flex flex-col justify-center">
                                <input type="file" id="product-upload" className="hidden" accept="image/png, image/jpeg" onChange={(e) => handleFileChange(e, 'product')} />
                                <label htmlFor="product-upload" className="cursor-pointer text-xs">{productImage ? productImage.name : "Upload Image"}</label>
                            </div>
                        </div>
                        <div data-tooltip="Upload a clear, forward-facing headshot of the model to be featured in the ad.">
                            <label className="font-semibold text-slate-300 flex items-center gap-2"><HiOutlineUserCircle className="w-5 h-5"/> Model Headshot</label>
                            <div className="mt-2 p-2 border-2 border-dashed rounded-xl text-center bg-slate-800/50 hover:border-slate-600 transition h-24 flex flex-col justify-center">
                                <input type="file" id="model-upload" className="hidden" accept="image/png, image/jpeg" onChange={(e) => handleFileChange(e, 'model')} />
                                <label htmlFor="model-upload" className="cursor-pointer text-xs">{modelHeadshot ? modelHeadshot.name : "Upload Headshot"}</label>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-4 md:p-6 bg-slate-900/60 backdrop-blur-lg border border-slate-700/50 rounded-xl space-y-4">
                    <h2 className="text-xl font-bold text-white mb-1">2. Define Your Campaign</h2>
                    <div data-tooltip="Describe your product. What does it do? Who is it for? Key features and benefits.">
                        <label className="font-semibold text-slate-300 flex items-center gap-2"><HiOutlineDocumentText className="w-5 h-5"/> Product Description</label>
                        <textarea value={productDescription} onChange={(e) => setProductDescription(e.target.value)} placeholder="e.g., 'A sleek, wireless earbud with 24-hour battery life and noise-cancellation...'" className="w-full mt-2 p-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 transition text-sm" rows={2}></textarea>
                    </div>
                    <div data-tooltip="The main call-to-action text for your ad. Keep it short and punchy.">
                        <label className="font-semibold text-slate-300 flex items-center gap-2"><HiOutlineChatBubbleLeftRight className="w-5 h-5"/> Headline</label>
                        <input value={headline} onChange={e => setHeadline(e.target.value)} placeholder="e.g., 'Sound That Moves You'" className="w-full mt-2 p-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 transition text-sm" />
                    </div>
                    <div data-tooltip="Include your brand name or any other text to be subtly included in the ad.">
                        <label className="font-semibold text-slate-300 flex items-center gap-2"><HiOutlineTag className="w-5 h-5"/> Brand Details (Optional)</label>
                        <input value={brandDetails} onChange={e => setBrandDetails(e.target.value)} placeholder="e.g., 'AudioVibe'" className="w-full mt-2 p-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 transition text-sm" />
                    </div>
                </div>
            </div>
            <StyleSelector title="3. Choose an Ad Style" stylesData={AD_STYLES} selectedStyleId={selectedStyleId} onStyleSelect={setSelectedStyleId} />
            <div className="flex justify-center pt-4">
                <button onClick={handleGenerateConcepts} disabled={isLoading || !productImage || !modelHeadshot || !productDescription.trim() || !headline.trim()} className="flex items-center gap-3 px-8 py-4 bg-primary-gradient text-white font-bold text-lg rounded-lg hover:opacity-90 transition-all duration-300 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed transform hover:scale-105">
                    {isLoading ? <div className="w-6 h-6 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : <HiOutlineSparkles className="w-6 h-6"/>}
                    {isLoading ? loadingMessage : 'Generate Ad Concepts'}
                </button>
            </div>
        </div>
    );

    const renderPromptSelectionStep = () => (
        <div className="max-w-7xl mx-auto animate-fade-in">
            <h2 className="text-3xl font-bold text-center mb-2 text-white">Choose Your Ad Concept</h2>
            <p className="text-slate-400 text-center mb-10">Select a concept below to generate your banner.</p>
            <div className="grid md:grid-cols-3 gap-6">
                {generatedPrompts.map((concept, index) => (
                    <div key={index} onClick={() => handleGenerateBanner(concept.prompt)} className={`relative p-6 rounded-xl border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between ${concept.isRecommended ? 'border-amber-400 bg-slate-800/50' : 'border-slate-800 bg-slate-900/70 hover:border-slate-700 hover:-translate-y-1'}`}>
                        <div>
                            {concept.isRecommended && (<div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2"><span className="px-3 py-1 text-xs font-semibold tracking-wider text-slate-900 uppercase bg-amber-400 rounded-full">Recommended</span></div>)}
                            <h3 className="font-bold text-white mb-3 mt-3">Concept {index + 1}</h3>
                            <p className="text-slate-300 text-sm mb-4">{concept.prompt}</p>
                            {concept.reason && (<div className="mt-4 pt-4 border-t border-slate-700/50"><p className="text-xs text-amber-300/80 italic"><span className="font-bold not-italic">Reason:</span> {concept.reason}</p></div>)}
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button onClick={(e) => { e.stopPropagation(); handleCopyPrompt(concept.prompt); }} className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-md bg-slate-700/50 hover:bg-slate-700 text-slate-300 transition-colors">
                                {copiedPrompt === concept.prompt ? <HiCheck className="w-4 h-4 text-green-400" /> : <HiOutlineDocumentDuplicate className="w-4 h-4 icon-hover-effect" />}
                                {copiedPrompt === concept.prompt ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-center mt-10"><button onClick={() => setStep('input')} className="flex items-center gap-2 px-6 py-2 text-slate-400 hover:text-slate-300 bg-slate-800/50 border border-slate-700 rounded-lg transition-colors icon-hover-effect"><HiArrowLeft className="w-5 h-5" /> Back</button></div>
        </div>
    );
    
    const renderGeneratingStep = () => (
        <div className="text-center py-20 animate-fade-in">
            <div className="relative w-24 h-24 mx-auto"><div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div><div className="absolute inset-0 border-4 border-t-purple-400 rounded-full animate-spin"></div></div>
            <h2 className="text-3xl font-bold mt-8 text-white">{loadingMessage}</h2>
            <p className="text-slate-400 mt-2">This can take up to a minute. Please don't close the window.</p>
        </div>
    );

    const renderResultStep = () => (
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
             <h2 className="text-3xl font-bold text-center mb-8 text-white">Your Ad Banner is Ready!</h2>
             <div className="relative inline-block">
                {generatedBanner && <img src={`data:image/png;base64,${generatedBanner}`} alt="Generated Ad Banner" className="rounded-xl mx-auto shadow-2xl shadow-black/30 mb-4 border-2 border-slate-700/50" style={{ aspectRatio: aspectRatio.replace(':', ' / ') }} />}
                {(isLoading || isEditing) && <div className="absolute inset-0 bg-black/70 rounded-xl flex flex-col items-center justify-center"><div className="w-8 h-8 border-4 border-t-transparent border-white rounded-full animate-spin"></div><p className="mt-2 text-sm text-white">{loadingMessage}</p></div>}
             </div>
             <div className="mt-4 p-4 max-w-2xl mx-auto bg-slate-800/50 rounded-lg border border-slate-700" data-tooltip="Make quick changes to your banner. Type what you want to change (e.g., 'change the background to a beach', 'make her shirt blue') and click 'Magic Edit'.">
                <label className="font-semibold text-slate-300 flex items-center justify-center gap-2 mb-2"><HiOutlineWrenchScrewdriver className="w-5 h-5 text-amber-400"/> Magic Edit</label>
                <div className="flex gap-2">
                    <input value={editPrompt} onChange={(e) => setEditPrompt(e.target.value)} placeholder="e.g., 'Change the background to a city street'" className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 transition text-sm" />
                    <button onClick={handleMagicEdit} disabled={isEditing || !editPrompt.trim()} className="px-4 py-2 bg-amber-500/80 text-white font-semibold rounded-lg hover:bg-amber-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Edit</button>
                </div>
             </div>
             <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center items-center gap-4 mt-8">
                 <button onClick={handleBackToSettings} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 border border-slate-700"><HiArrowLeft/> Back to Settings</button>
                 <button onClick={() => setStep('promptSelection')} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 border border-slate-700"><HiOutlineLightBulb/> Back to Concepts</button>
                 <button onClick={() => handleGenerateBanner(finalPrompt)} disabled={isLoading} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700 border border-slate-700 disabled:opacity-60"><HiOutlineArrowPath/> Regenerate</button>
                 <div className="relative group" title={!session ? 'Please sign in to save creations' : ''}><button onClick={handleSaveCreation} disabled={isSaved || !session} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700 border border-slate-700 disabled:opacity-60"><HiOutlineHeart className={isSaved ? 'text-pink-500' : ''}/> {isSaved ? 'Saved!' : 'Like & Save'}</button></div>
                 <a href={`data:image/png;base64,${generatedBanner}`} download="dreampixel-banner.png" className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary-gradient text-white font-bold rounded-lg hover:opacity-90"><HiArrowDownTray/> Download</a>
             </div>
        </div>
    );

    return (
        <div className="animate-fade-in">
            {isTemplateBrowserOpen && <TemplateBrowser tool="advertisement" onClose={() => setIsTemplateBrowserOpen(false)} onSelect={handleSelectTemplate} />}
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