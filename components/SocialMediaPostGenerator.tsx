import React, { useState, useEffect } from 'react';
import { AdStyle, AspectRatio, GeneratedConcept, TemplatePrefillData } from '../types';
import { generateSocialPostConcepts, generateSocialPost } from '../services/aiService';
import { AD_STYLES } from '../services/constants';
import * as historyService from '../services/historyService';
import * as jobService from '../services/jobService';
import { HiArrowDownTray, HiOutlineHeart, HiOutlineSparkles, HiArrowLeft, HiOutlineDocumentDuplicate, HiCheck, HiOutlineLightBulb, HiOutlineArrowPath, HiClipboardDocument, HiOutlineQueueList } from 'react-icons/hi2';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from './ErrorMessage';
import TemplateBrowser from './TemplateBrowser';

type Step = 'input' | 'promptSelection' | 'generating' | 'result';

interface SocialMediaPostGeneratorProps {
    onNavigateHome: () => void;
    onPostGenerated: () => void;
    onGenerating: (isGenerating: boolean) => void;
}

const platforms = {
    "Instagram": "1:1",
    "Facebook": "1.91:1",
    "X / Twitter": "16:9",
    "LinkedIn": "1.91:1",
    "Pinterest": "4:5",
    "Instagram Story": "9:16",
};
type Platform = keyof typeof platforms;

const tones = ["Professional", "Casual", "Humorous", "Inspirational", "Informative"];

const SocialMediaPostGenerator: React.FC<SocialMediaPostGeneratorProps> = ({ onNavigateHome, onPostGenerated, onGenerating }) => {
    const { session } = useAuth();
    const [step, setStep] = useState<Step>('input');
    
    const [topic, setTopic] = useState('');
    const [platform, setPlatform] = useState<Platform>('Instagram');
    const [tone, setTone] = useState('Casual');
    const [callToAction, setCallToAction] = useState('');

    const [activeCategory, setActiveCategory] = useState(Object.keys(AD_STYLES)[0]);
    const [selectedStyleId, setSelectedStyleId] = useState<string>(AD_STYLES[Object.keys(AD_STYLES)[0]][0].id);
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
    
    const [generatedPrompts, setGeneratedPrompts] = useState<GeneratedConcept[]>([]);
    const [finalPrompt, setFinalPrompt] = useState<string>('');
    const [finalCaption, setFinalCaption] = useState('');
    const [generatedPost, setGeneratedPost] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [isSaved, setIsSaved] = useState(false);
    const [copiedItem, setCopiedItem] = useState<'prompt' | 'caption' | null>(null);
    const [isTemplateBrowserOpen, setIsTemplateBrowserOpen] = useState(false);

    useEffect(() => {
        onGenerating(isLoading);
    }, [isLoading, onGenerating]);

    useEffect(() => {
        setAspectRatio(platforms[platform] as AspectRatio);
    }, [platform]);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isLoading && step === 'input') {
            const messages = ['Analyzing your topic...', 'Brainstorming post ideas...', 'Writing creative captions...', 'Designing visual concepts...'];
            let index = 0;
            setLoadingMessage(messages[index]);
            interval = setInterval(() => {
                index = (index + 1) % messages.length;
                setLoadingMessage(messages[index]);
            }, 2000);
        } else if (step === 'generating') {
            const messages = ['Initializing AI design suite...', 'Generating eye-catching visuals...', 'Finalizing post layout...', 'Almost ready to post...'];
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
        setFinalCaption('');
        setGeneratedPost(null);
        setError(null);
        setIsSaved(false);
    };
    
    const handleGenerateConcepts = async () => {
        if (!topic.trim()) {
            setError('Please provide a topic for your post.');
            return;
        }

        if (session) {
            jobService.saveSocialPostJob({
                userId: session.user.id,
                topic, platform, tone, callToAction, styleId: selectedStyleId, aspectRatio
            });
        }
        
        setIsLoading(true);
        setError(null);
        try {
            const allStyles = Object.values(AD_STYLES).flat();
            const selectedStyle = allStyles.find(s => s.id === selectedStyleId);
            if (!selectedStyle) throw new Error("A visual style must be selected.");
            
            const prompts = await generateSocialPostConcepts(topic, platform, tone, selectedStyle, callToAction);
            setGeneratedPrompts(prompts);
            setStep('promptSelection');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate concepts.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGeneratePost = async (prompt: string, caption: string) => {
        setIsLoading(true);
        setError(null);
        setFinalPrompt(prompt);
        setFinalCaption(caption);
        setStep('generating');
        setIsSaved(false);
        try {
            const postResult = await generateSocialPost(prompt, aspectRatio);
            if (postResult) {
                setGeneratedPost(postResult);
                setStep('result');
            } else {
                throw new Error("The AI failed to generate an image. Please try a different concept.");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate post image.');
            setStep('promptSelection');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveCreation = async () => {
        if (generatedPost && !isSaved && session) {
            const isPublic = window.confirm(
                "Your creation has been saved to your 'Liked Creations'!\n\nWould you like to feature it in our public gallery for others to see?"
            );
            const newEntry = {
                id: '',
                prompt: `Visual: ${finalPrompt} | Caption: ${finalCaption}`,
                imageUrl: `data:image/png;base64,${generatedPost}`,
                timestamp: Date.now()
            };
            try {
                await historyService.saveCreation(newEntry, session.user.id, isPublic);
                setIsSaved(true);
                onPostGenerated();
            } catch (error) {
                setError("Failed to save creation. Please try again.");
            }
        }
    };

    const handleSelectTemplate = (prefill: TemplatePrefillData) => {
        if (prefill.styleId) setSelectedStyleId(prefill.styleId);
        if (prefill.aspectRatio) setAspectRatio(prefill.aspectRatio);
        if (prefill.topic) setTopic(prefill.topic);
        if (prefill.platform) setPlatform(prefill.platform as Platform);
        if (prefill.tone) setTone(prefill.tone);
        if (prefill.callToAction) setCallToAction(prefill.callToAction);
        
        for (const category in AD_STYLES) {
            if (AD_STYLES[category].some(style => style.id === prefill.styleId)) {
                setActiveCategory(category);
                break;
            }
        }
    };
    
    const handleCopy = (item: 'prompt' | 'caption', text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedItem(item);
        setTimeout(() => setCopiedItem(null), 2000);
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
                <div className="p-4 md:p-6 bg-slate-900/60 backdrop-blur-lg border border-slate-700/50 rounded-xl space-y-4">
                    <h2 className="text-xl font-bold text-white">1. Post Details</h2>
                    <div>
                        <label className="font-semibold text-slate-300">Topic / Content Idea</label>
                        <p className="text-sm text-slate-400 mb-2">What is this post about? Be descriptive.</p>
                        <textarea value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., Announcing a new line of sustainable coffee beans..." className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 transition text-sm" rows={3}></textarea>
                    </div>
                    <div>
                        <label className="font-semibold text-slate-300">Target Platform</label>
                        <select value={platform} onChange={e => setPlatform(e.target.value as Platform)} className="w-full mt-2 p-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 transition text-sm">
                            {Object.keys(platforms).map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="font-semibold text-slate-300">Desired Tone</label>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                             {tones.map(t => <button key={t} type="button" onClick={() => setTone(t)} className={`p-2 text-sm rounded-md transition-colors ${tone === t ? 'bg-purple-600 text-white font-semibold' : 'bg-slate-800 hover:bg-slate-700'}`}>{t}</button>)}
                        </div>
                    </div>
                    <div>
                        <label className="font-semibold text-slate-300">Call to Action (Optional)</label>
                        <input type="text" value={callToAction} onChange={e => setCallToAction(e.target.value)} placeholder="e.g., 'Shop now!' or 'Link in bio'" className="w-full mt-2 p-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 transition text-sm" />
                    </div>
                </div>
                <div className="p-4 md:p-6 bg-slate-900/60 backdrop-blur-lg border border-slate-700/50 rounded-xl">
                     <h2 className="text-xl font-bold text-white mb-4">2. Choose a Visual Style</h2>
                     <div className="flex flex-wrap gap-2 mb-4 border-b border-slate-800 pb-4">
                         {Object.keys(AD_STYLES).map(category => (
                            <button key={category} onClick={() => setActiveCategory(category)} className={`px-4 py-1.5 text-sm rounded-full transition-colors duration-200 ${activeCategory === category ? 'bg-primary-gradient text-white font-semibold' : 'bg-slate-800 hover:bg-slate-700'}`}>
                               {category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </button>
                         ))}
                     </div>
                     <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {AD_STYLES[activeCategory].map(style => (
                            <button key={style.id} onClick={() => setSelectedStyleId(style.id)} className={`p-4 rounded-lg border-2 text-left transition-colors duration-200 text-sm ${selectedStyleId === style.id ? 'border-purple-500 bg-slate-800/50' : 'border-slate-800 bg-slate-900 hover:border-slate-700'}`}>
                                <p className="font-bold text-white">{style.name}</p>
                                <p className="text-xs text-slate-400">{style.tags}</p>
                            </button>
                        ))}
                     </div>
                </div>
            </div>
            <div className="flex justify-center pt-4">
                <button onClick={handleGenerateConcepts} disabled={isLoading || !topic.trim()} className="flex items-center gap-3 px-8 py-4 bg-primary-gradient text-white font-bold text-lg rounded-lg hover:opacity-90 transition-all duration-300 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed transform hover:scale-105">
                    {isLoading ? <div className="w-6 h-6 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : <HiOutlineSparkles className="w-6 h-6"/>}
                    {isLoading ? loadingMessage : 'Generate Post Concepts'}
                </button>
            </div>
        </div>
    );
    
    const renderPromptSelectionStep = () => (
        <div className="max-w-7xl mx-auto animate-fade-in">
           <h2 className="text-3xl font-bold text-center mb-2 text-white">Choose Your Social Post Concept</h2>
           <p className="text-slate-400 text-center mb-10">Select a concept below to generate the image and caption.</p>
           <div className="grid md:grid-cols-3 gap-6">
               {generatedPrompts.map((concept, index) => (
                   <div key={index} onClick={() => handleGeneratePost(concept.prompt, concept.caption || '')} className={`relative p-6 rounded-xl border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between ${concept.isRecommended ? 'border-amber-400 bg-slate-800/50' : 'border-slate-800 bg-slate-900 hover:border-slate-700 hover:-translate-y-1'}`}>
                       <div>
                           {concept.isRecommended && (<div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2"><span className="px-3 py-1 text-xs font-semibold tracking-wider text-slate-900 uppercase bg-amber-400 rounded-full">Recommended</span></div>)}
                           <h3 className="font-bold text-white mb-3 mt-3">Concept {index + 1}</h3>
                           <p className="text-slate-300 text-sm mb-2 font-semibold">Visual Idea:</p>
                           <p className="text-slate-400 text-sm mb-4">{concept.prompt}</p>
                           <p className="text-slate-300 text-sm mb-2 font-semibold">Caption Idea:</p>
                           <p className="text-slate-400 text-sm mb-4 italic">"{concept.caption}"</p>
                           {concept.reason && (<div className="mt-4 pt-4 border-t border-slate-700/50"><p className="text-xs text-amber-300/80 italic"><span className="font-bold not-italic">Reason:</span> {concept.reason}</p></div>)}
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
            <p className="text-slate-400 mt-2">This can take up to a minute. Please wait.</p>
        </div>
    );
    
    const renderResultStep = () => (
        <div className="animate-fade-in">
             <h2 className="text-3xl font-bold text-center mb-8 text-white">Your Social Media Post is Ready!</h2>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {generatedPost && <img src={`data:image/png;base64,${generatedPost}`} alt="Generated Social Post" className="rounded-xl mx-auto shadow-2xl shadow-black/30 border-2 border-slate-700/50" style={{ aspectRatio: aspectRatio.replace(':', ' / ') }} />}
                <div className="bg-slate-900/60 p-6 rounded-xl border border-slate-700/50 h-full flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-3">Generated Caption</h3>
                    <p className="text-slate-300 whitespace-pre-wrap flex-grow">{finalCaption}</p>
                    <button onClick={() => handleCopy('caption', finalCaption)} className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 transition-all duration-300 border border-slate-700">
                        {copiedItem === 'caption' ? <HiCheck className="w-5 h-5 text-green-400"/> : <HiClipboardDocument className="w-5 h-5 text-slate-300"/>}
                        {copiedItem === 'caption' ? 'Copied!' : 'Copy Caption'}
                    </button>
                </div>
             </div>
             <div className="mt-8 flex flex-col sm:flex-row sm:flex-wrap justify-center items-center gap-4">
                 <button onClick={handleBackToSettings} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 transition-all duration-300 border border-slate-700 icon-hover-effect"><HiArrowLeft className="w-5 h-5 text-slate-300"/> Back to Settings</button>
                 <button onClick={() => setStep('promptSelection')} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 transition-all duration-300 border border-slate-700 icon-hover-effect-yellow"><HiOutlineLightBulb className="w-5 h-5 text-yellow-400"/> Back to Concepts</button>
                 <button onClick={() => handleGeneratePost(finalPrompt, finalCaption)} disabled={isLoading} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700 transition-all duration-300 border border-slate-700 disabled:opacity-60 disabled:cursor-not-allowed icon-hover-effect-blue"><HiOutlineArrowPath className="w-5 h-5 text-sky-400"/> Regenerate</button>
                 <div className="relative group" title={!session ? 'Please sign in to save creations' : ''}>
                     <button onClick={handleSaveCreation} disabled={isSaved || !session} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700 transition-all duration-300 border border-slate-700 disabled:opacity-60 disabled:cursor-not-allowed icon-hover-effect-pink">
                        <HiOutlineHeart className={`w-5 h-5 transition-colors ${isSaved ? 'text-pink-500' : 'text-pink-400'}`} /> {isSaved ? 'Saved!' : 'Like & Save Post'}
                     </button>
                 </div>
                 <a href={`data:image/png;base64,${generatedPost}`} download="dreampixel-social-post.png" className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary-gradient text-white font-bold rounded-lg hover:opacity-90 transition-all duration-300 transform hover:scale-105">
                    <HiArrowDownTray className="w-5 h-5"/> Download Image
                 </a>
             </div>
        </div>
    );
    
    return (
        <div className="animate-fade-in">
            {isTemplateBrowserOpen && (
                <TemplateBrowser
                    tool="social"
                    onClose={() => setIsTemplateBrowserOpen(false)}
                    onSelect={handleSelectTemplate}
                />
            )}
            <ErrorMessage error={error} />
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

export default SocialMediaPostGenerator;