import React, { useState, useEffect } from 'react';
import { UploadedFile, GeneratedConcept, TemplatePrefillData, ProfilePictureStyle } from '../types';
import { generateProfilePicturePrompts, generateProfilePicture } from '../services/aiService';
import { PROFILE_PICTURE_STYLES } from '../services/constants';
import * as historyService from '../services/historyService';
import * as jobService from '../services/jobService';
import { HiArrowDownTray, HiOutlineHeart, HiOutlineSparkles, HiArrowUpTray, HiXMark, HiOutlineDocumentText, HiOutlineArrowPath, HiArrowLeft, HiOutlineDocumentDuplicate, HiCheck, HiOutlineLightBulb, HiOutlineQueueList } from 'react-icons/hi2';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from './ErrorMessage';
import TemplateBrowser from './TemplateBrowser';
import StyleSelector from './StyleSelector';

type Step = 'input' | 'promptSelection' | 'generating' | 'result';

interface ProfileImageGeneratorProps {
    onNavigateHome: () => void;
    onCreationGenerated: () => void;
    onGenerating: (isGenerating: boolean) => void;
}

export const ProfileImageGenerator: React.FC<ProfileImageGeneratorProps> = ({ onNavigateHome, onCreationGenerated, onGenerating }) => {
    const { session } = useAuth();
    const [step, setStep] = useState<Step>('input');
    const [headshot, setHeadshot] = useState<UploadedFile | null>(null);
    const [description, setDescription] = useState('');
    const [selectedStyleId, setSelectedStyleId] = useState<string>(PROFILE_PICTURE_STYLES[Object.keys(PROFILE_PICTURE_STYLES)[0]][0].id);
    
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
            const messages = ['Analyzing your request...', 'Brainstorming portrait styles...', 'Crafting artistic concepts...'];
            let index = 0;
            setLoadingMessage(messages[index]);
            interval = setInterval(() => { index = (index + 1) % messages.length; setLoadingMessage(messages[index]); }, 2000);
        } else if (isLoading && step === 'generating') {
            const messages = ['Preparing digital canvas...', 'Replicating facial features...', 'Applying lighting & textures...', 'Rendering final portrait...'];
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

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = (reader.result as string).split(',')[1];
                setHeadshot({ base64, mimeType: file.type, name: file.name });
            };
            reader.readAsDataURL(file);
            event.target.value = '';
        }
    };
    
    const handleGenerateConcepts = async () => {
        if (!headshot) {
            setError('Please upload a headshot.');
            return;
        }
        if (!description.trim()) {
            setError('Please describe the kind of profile picture you want.');
            return;
        }

        if (session) {
            // FIX: Added missing aspectRatio property to satisfy the ProfileImageJobData type.
            jobService.saveProfileImageJob({
                userId: session.user.id,
                description,
                styleId: selectedStyleId,
                headshot,
                aspectRatio: '1:1'
            });
        }
        
        setIsLoading(true);
        setError(null);
        try {
            const allStyles = Object.values(PROFILE_PICTURE_STYLES).flat();
            const selectedStyle = allStyles.find(s => s.id === selectedStyleId);
            if (!selectedStyle) throw new Error("A style must be selected.");
            
            const prompts = await generateProfilePicturePrompts(description, selectedStyle);
            setGeneratedPrompts(prompts);
            setStep('promptSelection');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate concepts.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateImage = async (prompt: string) => {
        if (!headshot) {
            setError('Headshot not found. Please go back and upload an image.');
            setStep('input');
            return;
        }
        setIsLoading(true);
        setError(null);
        setFinalPrompt(prompt);
        setStep('generating');
        setIsSaved(false);
        try {
            // FIX: Added missing aspectRatio argument ('1:1') to the function call.
            const imageResult = await generateProfilePicture(prompt, headshot, '1:1');
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
        if (prefill.profileDescription) setDescription(prefill.profileDescription);
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
                <div className="p-4 md:p-6 bg-slate-900/60 backdrop-blur-lg border border-slate-700/50 rounded-xl" data-tooltip="Upload a single, high-quality photo of your face, looking directly at the camera. Good lighting is key for the best results.">
                    <h2 className="text-xl font-bold text-white mb-1">1. Upload Headshot</h2>
                    <p className="text-sm text-slate-400 mb-4">Provide one clear, forward-facing headshot.</p>
                    <div className="p-6 border-2 border-dashed border-slate-700 rounded-xl text-center bg-slate-800/50 hover:border-slate-600 transition h-48 flex flex-col justify-center">
                         <input type="file" id="file-upload" className="hidden" accept="image/png, image/jpeg" onChange={handleFileChange} />
                         <label htmlFor="file-upload" className="cursor-pointer">
                            <HiArrowUpTray className="w-8 h-8 mx-auto text-slate-500 mb-2"/>
                            <p className="text-slate-300 font-semibold">Click to upload or drag & drop</p>
                            <p className="text-xs text-slate-500">PNG or JPG</p>
                         </label>
                    </div>
                     {headshot && 
                        <div className="flex justify-center mt-4">
                            <div className="relative group w-24 h-24">
                                <img src={`data:${headshot.mimeType};base64,${headshot.base64}`} alt={headshot.name} className="rounded-lg object-cover w-full h-full"/>
                                <button onClick={() => setHeadshot(null)} className="absolute top-1 right-1 bg-black/60 rounded-full p-1 text-white hover:bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <HiXMark className="w-4 h-4 icon-hover-effect" />
                                </button>
                            </div>
                        </div>
                    }
                </div>
                 <div className="p-4 md:p-6 bg-slate-900/60 backdrop-blur-lg border border-slate-700/50 rounded-xl space-y-4" data-tooltip="Describe the purpose and vibe of your desired profile picture. For example, 'A professional and friendly headshot for LinkedIn' or 'A cool, vibrant avatar for my gaming profile'.">
                    <div className="flex items-start gap-3">
                        <HiOutlineDocumentText className="w-6 h-6 mt-1 text-purple-400"/>
                        <div>
                           <h3 className="text-md font-bold text-white">2. Describe Your Desired Look</h3>
                           <p className="text-sm text-slate-400 mb-2">What's this for? (e.g., LinkedIn, Instagram, Gaming avatar)</p>
                        </div>
                    </div>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g., 'A professional and friendly headshot for my LinkedIn profile. I'm a marketing manager.'" className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition text-sm" rows={6}></textarea>
                </div>
            </div>
            <StyleSelector
                title="3. Choose a Style"
                tooltip="Choose a style to set the overall mood, lighting, and background for your profile picture."
                stylesData={PROFILE_PICTURE_STYLES}
                selectedStyleId={selectedStyleId}
                onStyleSelect={setSelectedStyleId}
            />
             <div className="flex justify-center pt-4">
                <button onClick={handleGenerateConcepts} disabled={isLoading || !description.trim() || !headshot} className="flex items-center gap-3 px-8 py-4 bg-primary-gradient text-white font-bold text-lg rounded-lg hover:opacity-90 transition-all duration-300 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed transform hover:scale-105">
                    {isLoading ? <div className="w-6 h-6 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : <HiOutlineSparkles className="w-6 h-6"/>}
                    {isLoading ? loadingMessage : 'Generate Concepts'}
                </button>
            </div>
        </div>
    );

    const renderPromptSelectionStep = () => (
        <div className="max-w-7xl mx-auto animate-fade-in">
            <h2 className="text-3xl font-bold text-center mb-2 text-white">Choose Your Style Concept</h2>
            <p className="text-slate-400 text-center mb-10">Select a concept below to generate your profile picture.</p>
            <div className="grid md:grid-cols-3 gap-6">
                {generatedPrompts.map((concept, index) => (
                    <div 
                        key={index} 
                        onClick={() => handleGenerateImage(concept.prompt)}
                        className={`relative p-6 rounded-xl border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between
                            ${concept.isRecommended 
                                ? 'border-amber-400 bg-slate-800/50' 
                                : 'border-slate-800 bg-slate-900/70 hover:border-slate-700 hover:-translate-y-1'
                            }`}
                    >
                        <div>
                            {concept.isRecommended && (
                                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                                    <span className="px-3 py-1 text-xs font-semibold tracking-wider text-slate-900 uppercase bg-amber-400 rounded-full">Recommended</span>
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
             <h2 className="text-3xl font-bold text-center mb-2 text-white">Your Profile Picture is Ready!</h2>
             <p className="text-slate-400 text-center mb-8">See how your new picture looks in different contexts.</p>
             
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="flex flex-col items-center">
                    <h3 className="font-semibold text-white mb-4">Final Image</h3>
                    {generatedImage && (
                       <img src={`data:image/png;base64,${generatedImage}`} alt="Generated Profile Picture" className="rounded-full w-48 h-48 md:w-64 md:h-64 object-cover mx-auto shadow-2xl shadow-black/30 border-4 border-slate-700/50" />
                    )}
                </div>
                <div className="space-y-6">
                    <h3 className="font-semibold text-white">Previews</h3>
                    {/* LinkedIn Mockup */}
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 text-left">
                        <div className="flex items-center gap-4">
                            {generatedImage && <img src={`data:image/png;base64,${generatedImage}`} className="w-16 h-16 rounded-full object-cover border-2 border-slate-600" />}
                            <div>
                                <div className="h-4 w-32 bg-slate-700 rounded-sm mb-2"></div>
                                <div className="h-3 w-48 bg-slate-700 rounded-sm"></div>
                            </div>
                        </div>
                    </div>
                     {/* Instagram Mockup */}
                     <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 text-left">
                        <div className="flex items-center gap-3">
                            {generatedImage && 
                                <div className="p-1 bg-gradient-to-br from-yellow-400 via-red-500 to-purple-600 rounded-full">
                                    <img src={`data:image/png;base64,${generatedImage}`} className="w-12 h-12 rounded-full object-cover border-2 border-slate-800" />
                                </div>
                            }
                            <div className="h-4 w-24 bg-slate-700 rounded-sm"></div>
                        </div>
                    </div>
                </div>
            </div>

             <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center items-center gap-4 mt-12">
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
                 <a href={`data:image/png;base64,${generatedImage}`} download="dreampixel-profile.png" className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary-gradient text-white font-bold rounded-lg hover:opacity-90 transition-all duration-300 transform hover:scale-105">
                    <HiArrowDownTray className="w-5 h-5"/> Download
                 </a>
             </div>
        </div>
    );

    return (
        <div className="animate-fade-in">
            {isTemplateBrowserOpen && (
                <TemplateBrowser
                    tool="profile"
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