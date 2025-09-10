

import React, { useState, useEffect } from 'react';
import { VideoScriptResponse, UploadedFile } from '../types';
import { generateVideoScript, generateTopicFromImage } from '../services/aiService';
import * as historyService from '../services/historyService';
import * as jobService from '../services/jobService';
import { HiArrowLeft, HiCheck, HiOutlineSparkles, HiOutlineDocumentDuplicate, HiOutlineHeart, HiArrowUpTray, HiOutlineLightBulb, HiXMark } from 'react-icons/hi2';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from './ErrorMessage';

type Step = 'input' | 'generating' | 'result';

interface VideoScriptWriterProps {
    onNavigateHome: () => void;
    onCreationGenerated: () => void;
    onGenerating: (isGenerating: boolean) => void;
}

const tones = ["Professional", "Casual", "Humorous", "Inspirational", "Informative", "Dramatic"];

export const VideoScriptWriter: React.FC<VideoScriptWriterProps> = ({ onNavigateHome, onCreationGenerated, onGenerating }) => {
    const { session } = useAuth();
    const [step, setStep] = useState<Step>('input');
    const [topic, setTopic] = useState('');
    const [tone, setTone] = useState(tones[1]);
    const [audience, setAudience] = useState('');
    
    // New state for image analysis feature
    const [uploadedImage, setUploadedImage] = useState<UploadedFile | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    
    const [generatedResult, setGeneratedResult] = useState<VideoScriptResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [isSaved, setIsSaved] = useState(false);
    const [copiedItem, setCopiedItem] = useState<'script' | 'prompt' | null>(null);

    useEffect(() => {
        // Update parent on any loading state change
        onGenerating(isLoading || isAnalyzing);
    }, [isLoading, isAnalyzing, onGenerating]);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isLoading) {
            const messages = [
                'Analyzing your video idea...',
                'Brainstorming engaging hooks...',
                'Structuring the narrative flow...',
                'Writing scene-by-scene...',
                'Crafting the perfect VEO prompt...',
            ];
            let index = 0;
            setLoadingMessage(messages[index]);
            interval = setInterval(() => {
                index = (index + 1) % messages.length;
                setLoadingMessage(messages[index]);
            }, 2500);
        }
        return () => clearInterval(interval);
    }, [isLoading]);

    const handleReset = () => {
        setStep('input');
        setGeneratedResult(null);
        setError(null);
        setIsLoading(false);
        setIsSaved(false);
        setUploadedImage(null);
        setTopic('');
    };
    
    const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = (reader.result as string).split(',')[1];
                setUploadedImage({ base64, mimeType: file.type, name: file.name });
            };
            reader.readAsDataURL(file);
            event.target.value = '';
        }
    };

    const handleAnalyzeImage = async () => {
        if (!uploadedImage) {
            setError("Please upload an image first.");
            return;
        }
        setIsAnalyzing(true);
        setError(null);
        if(session) {
            jobService.saveVideoTopicSuggestionJob({ userId: session.user.id, imageFilename: uploadedImage.name });
        }
        try {
            const suggestedTopic = await generateTopicFromImage(uploadedImage);
            setTopic(suggestedTopic);
        } catch(err) {
            setError(err instanceof Error ? err.message : 'Failed to analyze image.');
        } finally {
            setIsAnalyzing(false);
        }
    };


    const handleGenerate = async () => {
        if (!topic.trim() || !audience.trim()) {
            setError('Please provide a video topic and target audience.');
            return;
        }

        if (session) {
            jobService.saveVideoScriptJob({ userId: session.user.id, topic, tone, audience });
        }
        
        setIsLoading(true);
        setError(null);
        setIsSaved(false);
        setStep('generating');
        try {
            const result = await generateVideoScript(topic, tone, audience);
            setGeneratedResult(result);
            setStep('result');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate the script.');
            setStep('input');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveCreation = async () => {
        if (generatedResult && !isSaved && session) {
            const prompt = `Video Script for: "${generatedResult.script.title}" | VEO Prompt: ${generatedResult.veoPrompt.prompt}`;
            const newEntry = {
                id: '',
                prompt,
                imageUrl: 'https://placehold.co/480x270/8b5cf6/ffffff?text=Video+Script',
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
    
    const handleCopy = (item: 'script' | 'prompt') => {
        if (!generatedResult) return;
        
        let textToCopy = '';
        if (item === 'script') {
            const { title, hook, intro, mainContent, outro, callToAction } = generatedResult.script;
            const sceneTexts = mainContent.map(s => `Scene ${s.scene}:\nVisual: ${s.visual}\nVoiceover: ${s.voiceover}`).join('\n\n');
            textToCopy = `Title: ${title}\n\nHook:\n${hook}\n\nIntro:\n${intro}\n\nMain Content:\n${sceneTexts}\n\nOutro:\n${outro}\n\nCall to Action:\n${callToAction}`;
        } else {
            textToCopy = JSON.stringify(generatedResult.veoPrompt, null, 2);
        }

        navigator.clipboard.writeText(textToCopy);
        setCopiedItem(item);
        setTimeout(() => setCopiedItem(null), 2000);
    };

    const renderInputStep = () => (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center">
                 <h2 className="text-3xl font-bold text-white">AI Video Script Writer</h2>
                 <p className="text-slate-400 mt-2">Generate a complete video script and VEO prompt from a simple idea or an image.</p>
            </div>
            
            <div className="p-4 md:p-6 bg-slate-900/60 backdrop-blur-lg border border-slate-700/50 rounded-xl space-y-6">
                 <div className="border border-slate-700 rounded-lg p-4 bg-slate-800/30">
                    <label className="font-semibold text-slate-300">Start with an Image (Optional)</label>
                    <p className="text-sm text-slate-400 mt-1 mb-4">Let AI analyze an image to suggest a video topic for you.</p>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="p-4 w-full sm:w-auto border-2 border-dashed border-slate-700 rounded-xl text-center bg-slate-800/50 hover:border-slate-600 transition h-28 flex flex-col justify-center">
                            <input type="file" id="image-upload" className="hidden" accept="image/png, image/jpeg" onChange={handleImageFileChange} />
                            <label htmlFor="image-upload" className="cursor-pointer">
                                <HiArrowUpTray className="w-6 h-6 mx-auto text-slate-500 mb-1"/>
                                <p className="text-slate-400 text-xs font-semibold">Upload Image</p>
                            </label>
                        </div>
                        {uploadedImage && (
                             <div className="relative group w-28 h-28 flex-shrink-0">
                                <img src={`data:${uploadedImage.mimeType};base64,${uploadedImage.base64}`} alt={uploadedImage.name} className="rounded-lg object-cover w-full h-full"/>
                                <button onClick={() => setUploadedImage(null)} className="absolute top-1 right-1 bg-black/60 rounded-full p-1 text-white hover:bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <HiXMark className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                        <button onClick={handleAnalyzeImage} disabled={!uploadedImage || isAnalyzing} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-wait w-full sm:w-auto">
                           {isAnalyzing ? <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : <HiOutlineLightBulb className="w-5 h-5 text-yellow-400"/>}
                           {isAnalyzing ? "Analyzing..." : "Suggest Topic"}
                        </button>
                    </div>
                </div>

                <div data-tooltip="Describe the core concept or topic of your video. The more detail, the better.">
                    <label className="font-semibold text-slate-300">1. Video Topic</label>
                    <textarea value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., 'A short documentary about the lifecycle of a butterfly' or let AI suggest one from your image." className="w-full mt-2 p-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 transition text-sm" rows={3}></textarea>
                </div>

                <div data-tooltip="Choose the tone of voice for the script's narration.">
                    <label className="font-semibold text-slate-300">2. Desired Tone</label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                         {tones.map(t_item => <button key={t_item} type="button" onClick={() => setTone(t_item)} className={`p-2 text-sm rounded-md transition-colors ${tone === t_item ? 'bg-purple-600 text-white font-semibold' : 'bg-slate-800 hover:bg-slate-700'}`}>{t_item}</button>)}
                    </div>
                </div>

                <div data-tooltip="Who is this video for? This helps the AI tailor the language and complexity of the script.">
                    <label className="font-semibold text-slate-300">3. Target Audience</label>
                    <input value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="e.g., 'Young children', 'Tech enthusiasts', 'History buffs'" className="w-full mt-2 p-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 transition text-sm" />
                </div>
            </div>

            <div className="flex justify-center pt-4">
                <button onClick={handleGenerate} disabled={isLoading || !topic.trim()} className="flex items-center gap-3 px-8 py-4 bg-primary-gradient text-white font-bold text-lg rounded-lg hover:opacity-90 transition-all duration-300 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed transform hover:scale-105">
                    {isLoading ? <div className="w-6 h-6 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : <HiOutlineSparkles className="w-6 h-6"/>}
                    {isLoading ? loadingMessage : 'Generate Script'}
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
            <p className="text-slate-400 mt-2">This can take a moment. Please wait.</p>
        </div>
    );

    const renderResultStep = () => (
        <div className="max-w-7xl mx-auto animate-fade-in">
            <h2 className="text-3xl font-bold text-center mb-2 text-white">Your Video Script is Ready!</h2>
            <p className="text-slate-400 text-center mb-8">Use the script for your voiceover and the VEO prompt to generate the video.</p>
             
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Script Side */}
                <div className="bg-slate-900/70 p-6 rounded-xl border border-slate-700/50">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-xl text-white">Video Script</h3>
                        <button onClick={() => handleCopy('script')} className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-md bg-slate-700/50 hover:bg-slate-700 text-slate-300 transition-colors">
                            {copiedItem === 'script' ? <HiCheck className="w-4 h-4 text-green-400" /> : <HiOutlineDocumentDuplicate className="w-4 h-4" />}
                            {copiedItem === 'script' ? 'Copied!' : 'Copy Script'}
                        </button>
                    </div>
                    <div className="space-y-4 h-[60vh] overflow-y-auto pr-3">
                        <h4 className="font-bold text-purple-400 border-b border-slate-700 pb-1">Title: <span className="text-white">{generatedResult?.script.title}</span></h4>
                        <div><p className="font-semibold text-purple-400">Hook:</p><p className="text-sm">{generatedResult?.script.hook}</p></div>
                        <div><p className="font-semibold text-purple-400">Intro:</p><p className="text-sm">{generatedResult?.script.intro}</p></div>
                        <div><p className="font-semibold text-purple-400 border-b border-slate-700 pb-1 mb-2">Main Content:</p>
                            <div className="space-y-3">
                                {generatedResult?.script.mainContent.map(scene => (
                                    <div key={scene.scene} className="p-2 bg-slate-800/50 rounded-md">
                                        <p className="font-bold text-sm text-sky-300">Scene {scene.scene} - Visuals:</p>
                                        <p className="text-xs text-slate-300 mb-1">{scene.visual}</p>
                                        <p className="font-bold text-sm text-sky-300">Voiceover:</p>
                                        <p className="text-xs text-slate-300">{scene.voiceover}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div><p className="font-semibold text-purple-400">Outro:</p><p className="text-sm">{generatedResult?.script.outro}</p></div>
                        <div><p className="font-semibold text-purple-400">Call to Action:</p><p className="text-sm">{generatedResult?.script.callToAction}</p></div>
                    </div>
                </div>

                {/* VEO Prompt Side */}
                <div className="bg-slate-900/70 p-6 rounded-xl border border-slate-700/50">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-xl text-white">VEO JSON Prompt</h3>
                         <button onClick={() => handleCopy('prompt')} className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-md bg-slate-700/50 hover:bg-slate-700 text-slate-300 transition-colors">
                            {copiedItem === 'prompt' ? <HiCheck className="w-4 h-4 text-green-400" /> : <HiOutlineDocumentDuplicate className="w-4 h-4" />}
                            {copiedItem === 'prompt' ? 'Copied!' : 'Copy Prompt'}
                        </button>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-md h-[60vh] overflow-y-auto">
                        <pre className="text-sm whitespace-pre-wrap font-mono text-slate-300">
                            <code>
                                {generatedResult ? JSON.stringify(generatedResult.veoPrompt, null, 2) : ''}
                            </code>
                        </pre>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center items-center gap-4 mt-8">
                <button onClick={handleReset} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 transition-all duration-300 border border-slate-700 icon-hover-effect">
                    <HiArrowLeft className="w-5 h-5 text-slate-300"/> Start Over
                </button>
                <div className="relative group" title={!session ? 'Please sign in to save creations' : ''}>
                    <button onClick={handleSaveCreation} disabled={isSaved || !session} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700 transition-all duration-300 border border-slate-700 disabled:opacity-60 disabled:cursor-not-allowed icon-hover-effect-pink">
                        <HiOutlineHeart className={`w-5 h-5 transition-colors ${isSaved ? 'text-pink-500' : 'text-pink-400'}`} /> {isSaved ? 'Saved!' : 'Like & Save Script'}
                    </button>
                </div>
            </div>
        </div>
    );

    const renderActiveStep = () => {
        switch (step) {
            case 'input': return renderInputStep();
            case 'generating': return renderGeneratingStep();
            case 'result': return renderResultStep();
            default: return renderInputStep();
        }
    };
    
    return (
        <div className="animate-fade-in">
            <ErrorMessage error={error} />
            {renderActiveStep()}
        </div>
    );
};

export default VideoScriptWriter;