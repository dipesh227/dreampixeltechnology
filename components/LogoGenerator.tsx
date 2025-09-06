import React, { useState, useEffect } from 'react';
import { UploadedFile, GeneratedConcept, TemplatePrefillData, LogoStyle } from '../types';
import { generateLogoPrompts, generateLogo } from '../services/aiService';
import { LOGO_STYLES } from '../services/constants';
import * as historyService from '../services/historyService';
import * as jobService from '../services/jobService';
import { HiArrowDownTray, HiOutlineHeart, HiOutlineSparkles, HiArrowUpTray, HiXMark, HiOutlineBuildingOffice2, HiOutlineChatBubbleLeftRight, HiOutlineDocumentText, HiOutlineArrowPath, HiArrowLeft, HiOutlineDocumentDuplicate, HiCheck, HiOutlineLightBulb, HiOutlineQueueList, HiOutlineUserCircle } from 'react-icons/hi2';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from './ErrorMessage';
import TemplateBrowser from './TemplateBrowser';
import StyleSelector from './StyleSelector';
import { resizeImage } from '../utils/cropImage';

type Step = 'input' | 'promptSelection' | 'generating' | 'result';

interface LogoGeneratorProps {
    onNavigateHome: () => void;
    onCreationGenerated: () => void;
    onGenerating: (isGenerating: boolean) => void;
}

export const LogoGenerator: React.FC<LogoGeneratorProps> = ({ onNavigateHome, onCreationGenerated, onGenerating }) => {
    const { session } = useAuth();
    const [step, setStep] = useState<Step>('input');
    const [headshot, setHeadshot] = useState<UploadedFile | null>(null);
    const [companyName, setCompanyName] = useState('');
    const [slogan, setSlogan] = useState('');
    const [description, setDescription] = useState('');
    const [selectedStyleId, setSelectedStyleId] = useState<string>(LOGO_STYLES.general[0].id);
    
    const [generatedPrompts, setGeneratedPrompts] = useState<GeneratedConcept[]>([]);
    const [finalPrompt, setFinalPrompt] = useState<string>('');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
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
            const messages = ['Analyzing brand identity...', 'Sketching logo concepts...', 'Exploring typography...'];
            let index = 0;
            setLoadingMessage(messages[index]);
            interval = setInterval(() => { index = (index + 1) % messages.length; setLoadingMessage(messages[index]); }, 2000);
        } else if (isLoading && step === 'generating') {
            const messages = ['Initializing design vectors...', 'Rendering logo variations...', 'Applying color palettes...', 'Finalizing brand mark...'];
            let index = 0;
            setLoadingMessage(messages[index]);
            interval = setInterval(() => { index = (index + 1) % messages.length; setLoadingMessage(messages[index]); }, 2500);
        }
        return () => clearInterval(interval);
    }, [isLoading, step]);

    const handleBackToSettings = () => {
        setStep('input');
        setGeneratedPrompts([]);
        setFinalPrompt('');
        setGeneratedImage(null);
        setError(null);
        setIsSaved(false);
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            try {
                const resizedImage = await resizeImage(file, 1024);
                setHeadshot(resizedImage);
            } catch (error) {
                console.error("Error resizing image:", error);
                setError("Failed to process image. Please try a different file.");
            }
            event.target.value = '';
        }
    };
    
    const handleGenerateConcepts = async () => {
        if (!companyName.trim() || !description.trim()) {
            setError('Please provide a company name and description.');
            return;
        }

        if (session) {
            jobService.saveLogoJob({
                userId: session.user.id,
                companyName, slogan, description, styleId: selectedStyleId, headshot
            });
        }
        
        setIsLoading(true);
        setError(null);
        try {
            const selectedStyle = LOGO_STYLES.general.find(s => s.id === selectedStyleId);
            if (!selectedStyle) throw new Error("A style must be selected.");
            
            const prompts = await generateLogoPrompts(companyName, description, selectedStyle, slogan, !!headshot);
            setGeneratedPrompts(prompts);
            setStep('promptSelection');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate concepts.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateImage = async (prompt: string) => {
        setIsLoading(true);
        setError(null);
        setFinalPrompt(prompt);
        setStep('generating');
        setIsSaved(false);
        try {
            const imageResult = await generateLogo(prompt, headshot);
            if (imageResult) {
                setGeneratedImage(imageResult);
                setStep('result');
            } else {
                throw new Error("The AI failed to generate an image. Please try another concept.");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate image.');
            setStep('promptSelection');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveCreation = async () => {
        if (generatedImage && !isSaved && session) {
            const newEntry = {
                id: '',
                prompt: finalPrompt,
                imageUrl: `data:image/png;base64,${generatedImage}`,
                timestamp: Date.now()
            };
            try {
                await historyService.saveCreation(newEntry, session.user.id);
                setIsSaved(true);
                onCreationGenerated();
            } catch (error) {
                setError("Failed to save creation. Please try again.");
            }
        }
    };

    const handleSelectTemplate = (prefill: TemplatePrefillData) => {
        if (prefill.styleId) setSelectedStyleId(prefill.styleId);
        if (prefill.companyName) setCompanyName(prefill.companyName);
        if (prefill.slogan) setSlogan(prefill.slogan);
        if (prefill.logoDescription) setDescription(prefill.logoDescription);
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
                <div className="p-4 md:p-6 bg-slate-900/60 backdrop-blur-lg border border-slate-700/50 rounded-xl space-y-4" data-tooltip="Provide the core details about your brand. The more context you give the AI, the more relevant your logo concepts will be.">
                    <div className="flex items-start gap-3">
                        <HiOutlineBuildingOffice2 className="w-6 h-6 mt-1 text-purple-400"/>
                        <div>
                           <h3 className="text-md font-bold text-white">1. Brand Details</h3>
                           <p className="text-sm text-slate-400 mb-2">Tell us about your company.</p>
                        </div>
                    </div>
                    <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Company Name" className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 transition text-sm" />
                    <input value={slogan} onChange={(e) => setSlogan(e.target.value)} placeholder="Slogan (Optional)" className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 transition text-sm" />
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your company and what it does... e.g., 'A modern coffee shop for young professionals.'" className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 transition text-sm" rows={4}></textarea>
                </div>
                <div className="p-4 md:p-6 bg-slate-900/60 backdrop-blur-lg border border-slate-700/50 rounded-xl" data-tooltip="Want a logo featuring a character or mascot? Upload a headshot, and the AI will create a stylized mascot that looks just like the person in the photo.">
                    <div className="flex items-start gap-3">
                        <HiOutlineUserCircle className="w-6 h-6 mt-1 text-pink-400"/>
                        <div>
                           <h3 className="text-md font-bold text-white">2. Mascot Headshot <span className="text-slate-400 font-normal">(Optional)</span></h3>
                           <p className="text-sm text-slate-400 mb-2">Upload a headshot to create a character/mascot logo.</p>
                        </div>
                    </div>
                    <div className="p-6 border-2 border-dashed border-slate-700 rounded-xl text-center bg-slate-800/50 hover:border-slate-600 transition h-36 flex flex-col justify-center">
                         <input type="file" id="file-upload" className="hidden" accept="image/png, image/jpeg" onChange={handleFileChange} />
                         <label htmlFor="file-upload" className="cursor-pointer">
                            <HiArrowUpTray className="w-8 h-8 mx-auto text-slate-500 mb-2"/>
                            <p className="text-slate-300 font-semibold text-sm">Upload Headshot</p>
                         </label>
                    </div>
                     {headshot && 
                        <div className="flex justify-center mt-2">
                            <div className="relative group w-20 h-20">
                                <img src={`data:${headshot.mimeType};base64,${headshot.base64}`} alt={headshot.name} className="rounded-lg object-cover w-full h-full"/>
                                <button onClick={() => setHeadshot(null)} className="absolute top-1 right-1 bg-black/60 rounded-full p-1 text-white hover:bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <HiXMark className="w-4 h-4 icon-hover-effect" />
                                </button>
                            </div>
                        </div>
                    }
                </div>
            </div>
            <StyleSelector
                title="3. Choose a Logo Style"
                tooltip="Select a style to define the visual direction of your logo. This is the most important choice for the final design."
                stylesData={LOGO_STYLES}
                selectedStyleId={selectedStyleId}
                onStyleSelect={setSelectedStyleId}
            />
             <div className="flex justify-center pt-4">
                <button onClick={handleGenerateConcepts} disabled={isLoading || !description.trim() || !companyName.trim()} className="flex items-center gap-3 px-8 py-4 bg-primary-gradient text-white font-bold text-lg rounded-lg hover:opacity-90 transition-all duration-300 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed transform hover:scale-105">
                    {isLoading ? <div className="w-6 h-6 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : <HiOutlineSparkles className="w-6 h-6"/>}
                    {isLoading ? loadingMessage : 'Generate Logo Concepts'}
                </button>
            </div>
        </div>
    );

    const renderPromptSelectionStep = () => (
        <div className="max-w-7xl mx-auto animate-fade-in">
            <h2 className="text-3xl font-bold text-center mb-2 text-white">Choose Your Logo Concept</h2>
            <p className="text-slate-400 text-center mb-10">Select a concept below to generate your final logo.</p>
            <div className="grid md:grid-cols-3 gap-6">
                {generatedPrompts.map((concept, index) => (
                    <div key={index} onClick={() => handleGenerateImage(concept.prompt)} className={`relative p-6 rounded-xl border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between ${concept.isRecommended ? 'border-amber-400 bg-slate-800/50' : 'border-slate-800 bg-slate-900/70 hover:border-slate-700 hover:-translate-y-1'}`}>
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
             <h2 className="text-3xl font-bold text-center mb-8 text-white">Your Logo is Ready!</h2>
             {generatedImage && (
                <div className="bg-white p-8 inline-block rounded-xl">
                    <img src={`data:image/png;base64,${generatedImage}`} alt="Generated Logo" className="w-64 h-64 object-contain mx-auto shadow-2xl shadow-black/30" />
                </div>
             )}
             <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center items-center gap-4 mt-8">
                 <button onClick={handleBackToSettings} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 transition-all duration-300 border border-slate-700 icon-hover-effect">
                    <HiArrowLeft className="w-5 h-5 text-slate-300"/> Back to Settings
                 </button>
                 <button onClick={() => setStep('promptSelection')} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 transition-all duration-300 border border-slate-700 icon-hover-effect icon-hover-effect-yellow">
                    <HiOutlineLightBulb className="w-5 h-5 text-yellow-400"/> Back to Concepts
                 </button>
                 <button onClick={() => handleGenerateImage(finalPrompt)} disabled={isLoading} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700 transition-all duration-300 border border-slate-700 disabled:opacity-60 disabled:cursor-not-allowed icon-hover-effect icon-hover-effect-blue">
                    <HiOutlineArrowPath className="w-5 h-5 text-sky-400"/> Regenerate
                 </button>
                 <div className="relative group" title={!session ? 'Please sign in to save creations' : ''}>
                    <button onClick={handleSaveCreation} disabled={isSaved || !session} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700 transition-all duration-300 border border-slate-700 disabled:opacity-60 disabled:cursor-not-allowed icon-hover-effect icon-hover-effect-pink">
                        <HiOutlineHeart className={`w-5 h-5 transition-colors ${isSaved ? 'text-pink-500' : 'text-pink-400'}`} /> {isSaved ? 'Saved!' : 'Like & Save'}
                    </button>
                 </div>
                 <a href={`data:image/png;base64,${generatedImage}`} download="dreampixel-logo.png" className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary-gradient text-white font-bold rounded-lg hover:opacity-90 transition-all duration-300 transform hover:scale-105">
                    <HiArrowDownTray className="w-5 h-5"/> Download
                 </a>
             </div>
        </div>
    );

    return (
        <div className="animate-fade-in">
            {isTemplateBrowserOpen && (
                <TemplateBrowser
                    tool="logo"
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
