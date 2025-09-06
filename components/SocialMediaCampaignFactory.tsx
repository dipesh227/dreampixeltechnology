import React, { useState, useEffect } from 'react';
import { SocialCampaign, PlatformPostConcept, UploadedFile, ConnectedAccount, AdStyle, AspectRatio, GeneratedConcept } from '../types';
import { generateSocialMediaCampaign, generateSocialPost, generateSocialPostWithHeadshot, generateSocialVideo, getTrendingTopics, generateTrendPostConcepts, generateSocialPostConcepts } from '../services/aiService';
import * as historyService from '../services/historyService';
import * as jobService from '../services/jobService';
import * as facebookService from '../services/facebookService';
import { HiArrowDownTray, HiOutlineHeart, HiOutlineSparkles, HiArrowLeft, HiClipboardDocument, HiCheck, HiOutlinePhoto, HiOutlineUserCircle, HiArrowUpTray, HiOutlineLink, HiXMark, HiCheckCircle, HiOutlineVideoCamera, HiOutlinePencil, HiOutlineShare, HiBuildingStorefront, HiRectangleStack, HiOutlineArrowTrendingUp, HiOutlineLightBulb } from 'react-icons/hi2';
import { FaLinkedin, FaInstagram, FaFacebook, FaTiktok, FaYoutube } from 'react-icons/fa6';
import { FaTwitter, FaThreads } from 'react-icons/fa6';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from './ErrorMessage';
import { AD_STYLES } from '../services/constants';
import StyleSelector from './StyleSelector';

type GenerationMode = 'campaign' | 'single' | 'trend';
type Step = 'input' | 'generating' | 'result' | 'trendSelection' | 'conceptSelection';
type PostStatus = 'idle' | 'posting' | 'posted' | 'error';

interface SocialMediaCampaignFactoryProps {
    onNavigateHome: () => void;
    onCreationGenerated: () => void;
    onGenerating: (isGenerating: boolean) => void;
    connectedAccounts: ConnectedAccount[];
    onToggleConnect: (platform: string) => void;
}

const platformIcons: { [key: string]: React.ElementType } = {
    LinkedIn: FaLinkedin,
    Instagram: FaInstagram,
    Facebook: FaFacebook,
    'X-Twitter': FaTwitter,
    TikTok: FaTiktok,
    Threads: FaThreads,
    YouTube_Shorts: FaYoutube,
};

const platforms = {
    "Instagram": "1:1",
    "Facebook": "1.91:1",
    "X / Twitter": "16:9",
    "LinkedIn": "1.91:1",
    "Pinterest": "4:5",
    "Instagram Story": "9:16",
} as const;
type Platform = keyof typeof platforms;
const tones = ["Professional", "Casual", "Humorous", "Inspirational", "Informative"];

export const SocialMediaCampaignFactory: React.FC<SocialMediaCampaignFactoryProps> = ({ onNavigateHome, onCreationGenerated, onGenerating, connectedAccounts, onToggleConnect }) => {
    const { session } = useAuth();
    const [mode, setMode] = useState<GenerationMode>('campaign');
    const [step, setStep] = useState<Step>('input');
    
    // Campaign Mode State
    const [topic, setTopic] = useState('');
    const [keywords, setKeywords] = useState('');
    const [link, setLink] = useState('');
    const [creatorName, setCreatorName] = useState('');
    const [headshot, setHeadshot] = useState<UploadedFile | null>(null);
    const [sampleImage, setSampleImage] = useState<UploadedFile | null>(null);
    const [postLink, setPostLink] = useState('');
    const [campaignResult, setCampaignResult] = useState<SocialCampaign | null>(null);
    const [generatedImages, setGeneratedImages] = useState<{ [platform: string]: { loading: boolean; base64: string | null; saved: boolean } }>({});
    const [generatedVideos, setGeneratedVideos] = useState<{ [platform: string]: { loading: boolean; url: string | null; saved: boolean; loadingMessage: string } }>({});
    const [isScriptModalOpen, setIsScriptModalOpen] = useState(false);
    const [currentScriptData, setCurrentScriptData] = useState<{ platform: string; script: string; suggestion: string } | null>(null);
    const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);
    const [facebookAccessToken, setFacebookAccessToken] = useState('');
    const [facebookPageId, setFacebookPageId] = useState('');
    const [platformPostStatus, setPlatformPostStatus] = useState<{ [key: string]: PostStatus }>({});
    
    // Single Post & Trend Mode State
    const [baseKeyword, setBaseKeyword] = useState('');
    const [foundTrends, setFoundTrends] = useState<string[]>([]);
    const [selectedTrend, setSelectedTrend] = useState('');
    const [platform, setPlatform] = useState<Platform>('Instagram');
    const [tone, setTone] = useState('Casual');
    const [callToAction, setCallToAction] = useState('');
    const [selectedStyleId, setSelectedStyleId] = useState<string>(AD_STYLES[Object.keys(AD_STYLES)[0]][0].id);
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
    const [generatedConcepts, setGeneratedConcepts] = useState<GeneratedConcept[]>([]);
    const [finalPrompt, setFinalPrompt] = useState('');
    const [finalCaption, setFinalCaption] = useState('');
    const [finalGeneratedPost, setFinalGeneratedPost] = useState<string | null>(null);
    const [isFinalPostSaved, setIsFinalPostSaved] = useState(false);
    const [copiedItem, setCopiedItem] = useState<'prompt' | 'caption' | null>(null);


    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    useEffect(() => {
        onGenerating(isLoading || Object.values(generatedImages).some(img => img.loading) || Object.values(generatedVideos).some(vid => vid.loading));
    }, [isLoading, generatedImages, generatedVideos, onGenerating]);

    useEffect(() => {
        setAspectRatio(platforms[platform]);
    }, [platform]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, fileType: 'headshot' | 'sample') => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = (reader.result as string).split(',')[1];
                const uploadedFile: UploadedFile = { base64, mimeType: file.type, name: file.name };
                if (fileType === 'headshot') setHeadshot(uploadedFile);
                else if (fileType === 'sample') setSampleImage(uploadedFile);
            };
            reader.readAsDataURL(file);
            event.target.value = '';
        }
    };
    
    const handleBackToSettings = () => {
        setStep('input');
        // Reset single/trend mode state
        setGeneratedConcepts([]);
        setFinalPrompt('');
        setFinalCaption('');
        setFinalGeneratedPost(null);
        setIsFinalPostSaved(false);
    };

    // --- API CALL HANDLERS ---
    const handleGenerateCampaign = async () => {
        if (!topic.trim()) {
            setError('Please provide a topic for your campaign.');
            return;
        }
        if (session) {
            jobService.saveSocialCampaignJob({ userId: session.user.id, topic, keywords, link, headshots: headshot ? [headshot] : [], sampleImage, postLink, creatorName });
        }
        setIsLoading(true);
        setError(null);
        setStep('generating');
        setLoadingMessage("Building your multi-platform campaign...");
        try {
            const result = await generateSocialMediaCampaign(topic, keywords, link, headshot, sampleImage, postLink, creatorName);
            setCampaignResult(result);
            setStep('result');
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to generate the social media campaign. The AI may have returned an invalid format.");
            setStep('input');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFindTrends = async () => {
        if (!baseKeyword.trim()) {
            setError('Please provide a base keyword.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setLoadingMessage("Searching for trends...");
        try {
            const trends = await getTrendingTopics(baseKeyword);
            setFoundTrends(trends);
            setStep('trendSelection');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to find trends.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateConcepts = async () => {
        const conceptTopic = mode === 'trend' ? selectedTrend : topic;
        if (!conceptTopic.trim()) {
            setError('Please provide a topic.');
            return;
        }
        
        const allStyles = Object.values(AD_STYLES).flat();
        const selectedStyle = allStyles.find(s => s.id === selectedStyleId);
        if (!selectedStyle) {
            setError("A visual style must be selected.");
            return;
        }
        
        if(session) {
            if (mode === 'single') {
                jobService.saveSocialPostJob({ userId: session.user.id, topic, platform: String(platform), tone, callToAction, styleId: selectedStyleId, aspectRatio });
            } else if (mode === 'trend') {
                jobService.saveTrendPostJob({ userId: session.user.id, baseKeyword, selectedTrend, styleId: selectedStyleId, aspectRatio });
            }
        }
        
        setIsLoading(true);
        setError(null);
        setLoadingMessage("Crafting concepts...");
        try {
            const concepts = mode === 'trend'
                ? await generateTrendPostConcepts(selectedTrend, String(platform), selectedStyle)
                : await generateSocialPostConcepts(topic, String(platform), tone, selectedStyle, callToAction);
            
            setGeneratedConcepts(concepts);
            setStep('conceptSelection');
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to generate concepts.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGenerateFinalPost = async (prompt: string, caption: string) => {
        setIsLoading(true);
        setError(null);
        setFinalPrompt(prompt);
        setFinalCaption(caption);
        setStep('generating');
        setIsFinalPostSaved(false);
        try {
            const postResult = await generateSocialPost(prompt, aspectRatio);
            if (postResult) {
                setFinalGeneratedPost(postResult);
                setStep('result');
            } else {
                throw new Error("The AI failed to generate an image. Please try another concept.");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate post image.');
            setStep('conceptSelection');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateImage = async (platform: string, imagePrompt: string) => {
        setGeneratedImages(prev => ({ ...prev, [platform]: { loading: true, base64: null, saved: false } }));
        setError(null);
        const imageAspectRatio: AspectRatio = platform.includes('Story') || platform === 'TikTok' || platform === 'YouTube_Shorts' ? '9:16' : '1:1';
        try {
            const imageResult = headshot ? await generateSocialPostWithHeadshot(imagePrompt, headshot, imageAspectRatio) : await generateSocialPost(imagePrompt, imageAspectRatio);
            if (imageResult) {
                setGeneratedImages(prev => ({ ...prev, [platform]: { loading: false, base64: imageResult, saved: false } }));
            } else {
                throw new Error("The AI failed to generate an image. Please try another concept.");
            }
        } catch (err: any) {
            setError(err?.message ? String(err.message) : 'Failed to generate image.');
            setGeneratedImages(prev => ({ ...prev, [platform]: { loading: false, base64: null, saved: false } }));
        }
    };

    const handleOpenScriptModal = (platform: string, script: string | undefined, suggestion: string | undefined) => {
        setCurrentScriptData({ platform, script: script || '', suggestion: suggestion || '' });
        setIsScriptModalOpen(true);
    };

    const handleGenerateVideoWithScript = async () => {
        if (!currentScriptData) return;
        const { platform, script, suggestion } = currentScriptData;
        setIsScriptModalOpen(false);
        setGeneratedVideos(prev => ({ ...prev, [platform]: { loading: true, url: null, saved: false, loadingMessage: "Warming up the video creation engine..." } }));
        setError(null);

        const messages = ["Storyboarding the first few frames...", "Rendering high-definition scenes...", "Adding the final cinematic touches...", "Almost ready, preparing the video file..."];
        let messageIndex = 0;
        const intervalId = setInterval(() => {
            setGeneratedVideos(prev => {
                if (!prev[platform]?.loading) {
                    clearInterval(intervalId);
                    return prev;
                }
                messageIndex = (messageIndex + 1) % messages.length;
                return { ...prev, [platform]: { ...prev[platform], loadingMessage: messages[messageIndex] } };
            });
        }, 8000);

        try {
            // FIX: Removed invalid backslash from template literal
            const finalVideoPrompt = `Video Concept: "${suggestion}". The required voiceover script is: "${script}".`;
            const videoUrl = await generateSocialVideo(finalVideoPrompt);
            if (videoUrl) {
                setGeneratedVideos(prev => ({ ...prev, [platform]: { loading: false, url: videoUrl, saved: false, loadingMessage: '' } }));
            } else {
                throw new Error("The AI failed to generate a video. Please try again.");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate video.');
            setGeneratedVideos(prev => ({ ...prev, [platform]: { loading: false, url: null, saved: false, loadingMessage: '' } }));
        } finally {
            clearInterval(intervalId);
        }
    };
    
    const handleSaveImage = async (platform: string, imagePrompt: string) => {
        const imageData = generatedImages[platform];
        if (imageData?.base64 && !imageData.saved && session) {
            // FIX: Removed invalid backslashes from template literals
            const newEntry = { id: '', prompt: `Campaign: ${topic} - ${platform} Visual: ${imagePrompt}`, imageUrl: `data:image/png;base64,${imageData.base64}`, timestamp: Date.now() };
            try {
                await historyService.saveCreation(newEntry, session.user.id);
                setGeneratedImages(prev => ({ ...prev, [platform]: { ...imageData, saved: true } }));
                onCreationGenerated();
            } catch (error) { setError("Failed to save creation. Please try again."); }
        }
    };

    const handleSaveVideo = async (platform: string) => {
        const videoData = generatedVideos[platform];
        if (videoData?.url && !videoData.saved && session) {
            try {
                setGeneratedVideos(prev => ({ ...prev, [platform]: { ...videoData, saved: true } }));
                onCreationGenerated();
            } catch (error) { setError("Failed to save creation. Please try again."); }
        }
    };

    const handleSaveFinalPost = async () => {
        if (finalGeneratedPost && !isFinalPostSaved && session) {
            const newEntry = { id: '', prompt: `Visual: ${finalPrompt} | Caption: ${finalCaption}`, imageUrl: `data:image/png;base64,${finalGeneratedPost}`, timestamp: Date.now() };
            try {
                await historyService.saveCreation(newEntry, session.user.id);
                setIsFinalPostSaved(true);
                onCreationGenerated();
            } catch (error) { setError("Failed to save creation. Please try again."); }
        }
    };

    const handleCopyPost = (platform: string, content: PlatformPostConcept) => {
        const textToCopy = [content.title, content.post, content.caption, content.text_post, content.description, content.hashtags?.join(' '), content.call_to_action].filter(Boolean).join('\n\n');
        navigator.clipboard.writeText(textToCopy);
        setCopiedPlatform(platform);
        setTimeout(() => setCopiedPlatform(null), 2000);
    };

    const handleSelectTrend = (trend: string) => {
        setSelectedTrend(trend);
        setStep('input');
    };
    
    const handlePostToFacebook = async (platform: string, content: PlatformPostConcept) => {
        if (!facebookPageId.trim() || !facebookAccessToken.trim()) {
            setError('Please provide a Facebook Page ID and Access Token.');
            return;
        }
        
        const imageBase64 = generatedImages[platform]?.base64;
        if (!imageBase64) {
            setError('Please generate the image for Facebook before posting.');
            return;
        }

        setPlatformPostStatus(prev => ({ ...prev, [platform]: 'posting' }));
        setError(null);

        try {
            const fullMessage = [content.title, content.post, content.caption, content.text_post, content.hashtags?.join(' '), content.call_to_action].filter(Boolean).join('\n\n');
            
            await facebookService.postToFacebookPage(facebookAccessToken, facebookPageId, {
                message: fullMessage,
                imageBase64: imageBase64
            });
            
            setPlatformPostStatus(prev => ({ ...prev, [platform]: 'posted' }));
            
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred while posting to Facebook.';
            // FIX: Removed invalid backslash from template literal
            setError(`Facebook Post Failed: ${errorMessage}. Please check your Page ID, Access Token and permissions.`);
            setPlatformPostStatus(prev => ({ ...prev, [platform]: 'error' }));
            setTimeout(() => {
                setPlatformPostStatus(prev => ({ ...prev, [platform]: 'idle' }));
            }, 5000);
        }
    };

    const renderCampaignInput = () => (
        <div className="space-y-4">
            <div data-tooltip="Describe the core message or announcement for your campaign. The AI will generate content for all platforms based on this.">
                <label className="font-semibold text-slate-300">Topic</label>
                <textarea value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., 'Launch of our new eco-friendly sneaker line'" className="w-full mt-2 p-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 transition text-sm" rows={3}></textarea>
            </div>
             <div data-tooltip="Include any specific keywords you want the AI to focus on.">
                <label className="font-semibold text-slate-300">Keywords <span className="text-slate-400 font-normal">(Optional)</span></label>
                <input value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="e.g., 'sustainable fashion, sneakers, eco-friendly'" className="w-full mt-2 p-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 transition text-sm" />
            </div>
             <div data-tooltip="Add a call to action link to be included in the posts.">
                <label className="font-semibold text-slate-300">Link <span className="text-slate-400 font-normal">(Optional)</span></label>
                <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="e.g., 'https://yourstore.com/new-sneakers'" className="w-full mt-2 p-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 transition text-sm" />
            </div>
            <div className="flex justify-center pt-4">
                <button onClick={handleGenerateCampaign} disabled={isLoading || !topic.trim()} className="flex items-center gap-3 px-8 py-4 bg-primary-gradient text-white font-bold text-lg rounded-lg hover:opacity-90 transition-all duration-300 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed transform hover:scale-105">
                    {isLoading ? <div className="w-6 h-6 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : <HiOutlineSparkles className="w-6 h-6"/>}
                    Generate Social Campaign
                </button>
            </div>
        </div>
    );
    
    const renderSinglePostInput = () => (
         <div className="space-y-4">
            <div data-tooltip="Describe the core message or announcement for your post.">
                <label className="font-semibold text-slate-300">Topic</label>
                <textarea value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., 'Launch of our new eco-friendly sneaker line'" className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 transition text-sm" rows={3}></textarea>
            </div>
            <div data-tooltip="Select the social media platform you're targeting.">
                <label className="font-semibold text-slate-300">Target Platform</label>
                <select value={platform} onChange={e => setPlatform(e.target.value as Platform)} className="w-full mt-2 p-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 transition text-sm">
                    {(Object.keys(platforms) as Platform[]).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>
             <div data-tooltip="Choose the tone of voice for the written caption.">
                <label className="font-semibold text-slate-300">Desired Tone</label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                     {tones.map(t_item => <button key={t_item} type="button" onClick={() => setTone(t_item)} className={`p-2 text-sm rounded-md transition-colors ${tone === t_item ? 'bg-purple-600 text-white font-semibold' : 'bg-slate-800 hover:bg-slate-700'}`}>{t_item}</button>)}
                </div>
            </div>
            <div data-tooltip="Add a call to action to encourage engagement.">
                <label className="font-semibold text-slate-300">Call to Action <span className="text-slate-400 font-normal">(Optional)</span></label>
                <input type="text" value={callToAction} onChange={e => setCallToAction(e.target.value)} placeholder="e.g., 'Shop now!' or 'Link in bio'" className="w-full mt-2 p-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 transition text-sm" />
            </div>
            <div className="flex justify-center pt-4">
                <button onClick={handleGenerateConcepts} disabled={isLoading || !topic.trim()} className="flex items-center gap-3 px-8 py-4 bg-primary-gradient text-white font-bold text-lg rounded-lg hover:opacity-90 transition-all duration-300 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed transform hover:scale-105">
                    {isLoading ? <div className="w-6 h-6 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : <HiOutlineSparkles className="w-6 h-6"/>}
                    Generate Post Concepts
                </button>
            </div>
        </div>
    );
    
    const renderTrendInput = () => (
         <div className="space-y-4">
            <label className="font-semibold text-slate-300">Enter a Base Keyword</label>
            <p className="text-sm text-slate-400">Provide a broad keyword for your industry (e.g., 'Technology', 'Finance', 'Fashion'). The AI will find related trending topics.</p>
            <input value={baseKeyword} onChange={(e) => setBaseKeyword(e.target.value)} placeholder="e.g., Artificial Intelligence" className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 transition text-sm" />
            <div className="flex justify-center pt-4">
                <button onClick={handleFindTrends} disabled={isLoading || !baseKeyword.trim()} className="flex items-center gap-3 px-8 py-4 bg-primary-gradient text-white font-bold text-lg rounded-lg hover:opacity-90 transition-all duration-300 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed transform hover:scale-105">
                    {isLoading ? <div className="w-6 h-6 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : <HiOutlineSparkles className="w-6 h-6"/>}
                    {isLoading ? loadingMessage : "Find Trending Topics"}
                </button>
            </div>
        </div>
    );

    const renderStyleSelection = () => (
         <div className="space-y-8">
            <div className="mb-4">
                <label className="font-semibold text-slate-300">Target Platform</label>
                <select value={platform} onChange={e => setPlatform(e.target.value as Platform)} className="w-full mt-2 p-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 transition text-sm">
                    {(Object.keys(platforms) as Platform[]).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>
            <StyleSelector
                title="Choose a Visual Style"
                stylesData={AD_STYLES}
                selectedStyleId={selectedStyleId}
                onStyleSelect={setSelectedStyleId}
            />
             <div className="flex justify-center pt-4">
                <button onClick={handleGenerateConcepts} disabled={isLoading} className="flex items-center gap-3 px-8 py-4 bg-primary-gradient text-white font-bold text-lg rounded-lg hover:opacity-90 transition-all duration-300 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed transform hover:scale-105">
                    {isLoading ? <div className="w-6 h-6 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : <HiOutlineSparkles className="w-6 h-6"/>}
                    Generate Post Concepts
                </button>
            </div>
        </div>
    );

    const renderInputStep = () => (
        <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-2 text-white">AI Social Media Content Factory</h2>
            <p className="text-slate-400 text-center mb-10">Generate a full campaign, a single post, or content based on real-time trends.</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-8 p-1 bg-slate-800/50 rounded-lg border border-slate-700">
                {[
                    { key: 'campaign', icon: HiBuildingStorefront, label: "Campaign Mode", desc: "Generate a full campaign for 7+ platforms from a single topic." },
                    { key: 'single', icon: HiRectangleStack, label: "Single Post Mode", desc: "Create a tailored image and caption for one specific social media platform." },
                    { key: 'trend', icon: HiOutlineArrowTrendingUp, label: "Trend-Based Mode", desc: "Find trending topics based on a keyword and generate a relevant post." },
                ].map(({key, icon: Icon, label, desc}) => (
                    <button key={key} onClick={() => { setMode(key as GenerationMode); setStep('input'); setSelectedTrend(''); }} className={`flex flex-col text-center items-center justify-center gap-1 p-3 text-sm font-semibold rounded-md transition-colors ${mode === key ? 'bg-primary-gradient text-white shadow-lg' : 'text-slate-300 hover:bg-slate-700'}`} data-tooltip={desc || ''}>
                       <Icon className="w-6 h-6 mb-1" /> {label}
                    </button>
                ))}
            </div>
            <div className="p-4 md:p-6 bg-slate-900/60 backdrop-blur-lg border border-slate-700/50 rounded-xl space-y-4">
                {mode === 'campaign' && renderCampaignInput()}
                {mode === 'single' && (selectedTrend ? renderStyleSelection() : renderSinglePostInput())}
                {mode === 'trend' && (selectedTrend ? renderStyleSelection() : renderTrendInput())}
            </div>
             {mode === 'campaign' && (
                <div className="mt-8 p-4 md:p-6 bg-slate-900/60 backdrop-blur-lg border border-slate-700/50 rounded-xl space-y-4">
                    <h3 className="text-xl font-bold text-white">2. Personalization & Style (Optional)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="font-semibold text-slate-300">Name of Person/Leader</label>
                            <input value={creatorName} onChange={(e) => setCreatorName(e.target.value)} placeholder="e.g., 'Narendra Modi', 'Your Name'" className="w-full mt-2 p-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 transition text-sm" />
                        </div>
                        <div>
                             <label className="font-semibold text-slate-300">Headshots for Images</label>
                             <div className={`mt-2 p-2 border-2 border-dashed rounded-xl text-center ${headshot ? 'border-green-500/50' : 'border-slate-700 hover:border-slate-600'}`}>
                                <input type="file" id="headshot-upload" className="hidden" onChange={(e) => handleFileChange(e, 'headshot')} />
                                <label htmlFor="headshot-upload" className="cursor-pointer text-xs">{headshot ? headshot.name : "Upload Headshot"}</label>
                             </div>
                        </div>
                    </div>
                </div>
            )}
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

    const renderTrendSelectionStep = () => (
        <div className="max-w-3xl mx-auto animate-fade-in">
            <h2 className="text-3xl font-bold text-center mb-2 text-white">Select a Trending Topic</h2>
            <p className="text-slate-400 text-center mb-10">Choose one of the current trending topics below to create a post about.</p>
            {foundTrends.length > 0 ? (
                 <div className="space-y-4">
                    {foundTrends.map((trend, index) => (
                        <button key={index} onClick={() => handleSelectTrend(trend)} className="w-full p-4 bg-slate-800/50 border border-slate-700 rounded-lg text-left hover:bg-slate-700 transition-colors">
                            <p className="font-semibold text-white">{trend}</p>
                        </button>
                    ))}
                </div>
            ) : (
                <p className="text-center text-slate-500">No specific trends found. Try a broader keyword.</p>
            )}
             <div className="flex justify-center mt-10">
                <button onClick={() => setStep('input')} className="flex items-center gap-2 px-6 py-2 text-slate-400 hover:text-slate-300 bg-slate-800/50 border border-slate-700 rounded-lg transition-colors icon-hover-effect">
                    <HiArrowLeft className="w-5 h-5" /> Back
                </button>
            </div>
        </div>
    );

    const renderConceptSelectionStep = () => (
        <div className="max-w-7xl mx-auto animate-fade-in">
            <h2 className="text-3xl font-bold text-center mb-2 text-white">Choose Your Post Concept</h2>
            <p className="text-slate-400 text-center mb-10">Select a concept below to generate your final post.</p>
            <div className="grid md:grid-cols-3 gap-6">
                {generatedConcepts.map((concept, index) => (
                    <div 
                        key={index} 
                        onClick={() => handleGenerateFinalPost(concept.prompt, concept.caption || '')}
                        // FIX: Removed invalid backslash from template literal
                        className={`relative p-6 rounded-xl border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between ${concept.isRecommended ? 'border-amber-400 bg-slate-800/50' : 'border-slate-800 bg-slate-900/70 hover:border-slate-700 hover:-translate-y-1'}`}>
                        <div>
                            {concept.isRecommended && (<div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2"><span className="px-3 py-1 text-xs font-semibold tracking-wider text-slate-900 uppercase bg-amber-400 rounded-full">Recommended</span></div>)}
                            <h3 className="font-bold text-white mb-3 mt-3">Visual Idea</h3>
                            <p className="text-slate-400 text-sm mb-3">{concept.prompt}</p>
                            <h3 className="font-bold text-white mb-2">Caption</h3>
                            <p className="text-slate-300 text-sm mb-4 whitespace-pre-wrap">{concept.caption}</p>
                            {concept.isRecommended && concept.reason && (<div className="mt-4 pt-4 border-t border-slate-700/50"><p className="text-xs text-amber-300/80 italic"><span className="font-bold not-italic">Reason:</span> {concept.reason}</p></div>)}
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-center mt-10"><button onClick={() => { setStep('input'); setSelectedTrend(''); }} className="flex items-center gap-2 px-6 py-2 text-slate-400 hover:text-slate-300 bg-slate-800/50 border border-slate-700 rounded-lg transition-colors icon-hover-effect"><HiArrowLeft className="w-5 h-5" /> Back</button></div>
        </div>
    );

    const renderResultStep = () => {
        if (mode === 'campaign') {
            return (
                <div className="animate-fade-in">
                    <h2 className="text-3xl font-bold text-center mb-2 text-white">Your Social Media Campaign is Ready!</h2>
                    <p className="text-slate-400 text-center mb-10">Here are tailored posts for each platform. Generate visuals and post them directly.</p>
                    <div className="space-y-6">
                        {campaignResult && Object.entries(campaignResult).map(([platform, content]) => {
                            if (!content) return null;
                            const Icon = platformIcons[platform];
                            const platformImage = generatedImages[platform];
                            const platformVideo = generatedVideos[platform];
                            return (
                                <div key={platform} className="p-4 md:p-6 bg-slate-900/70 backdrop-blur-lg border border-slate-700/50 rounded-xl">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            {Icon && <Icon className="w-6 h-6 text-white"/>}
                                            <h3 className="text-xl font-bold text-white">{platform.replace(/_/g, ' ')}</h3>
                                        </div>
                                        <button onClick={() => handleCopyPost(platform, content)} className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-md bg-slate-700/50 hover:bg-slate-700 text-slate-300 transition-colors">
                                            {copiedPlatform === platform ? <HiCheck className="w-4 h-4 text-green-400" /> : <HiClipboardDocument className="w-4 h-4" />}
                                            {copiedPlatform === platform ? 'Copied!' : 'Copy Text'}
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-3 text-sm text-slate-300 whitespace-pre-wrap">
                                            {[content.title, content.post, content.caption, content.text_post, content.description].filter(Boolean).join('\n\n')}
                                            <p className="text-sky-400">{content.hashtags?.join(' ')}</p>
                                            {content.call_to_action && <p className="font-semibold text-amber-400">{content.call_to_action}</p>}
                                        </div>
                                        <div>
                                            {content.video_suggestion && content.video_suggestion !== 'N/A' ? (
                                                <div className="aspect-video bg-slate-800 rounded-lg flex flex-col items-center justify-center p-4 text-center">
                                                    {platformVideo?.loading ? (
                                                         <>
                                                            <div className="w-8 h-8 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
                                                            <p className="text-sm mt-2 text-slate-400">{platformVideo.loadingMessage}</p>
                                                         </>
                                                    ) : platformVideo?.url ? (
                                                        <>
                                                            <video src={platformVideo.url} controls className="w-full h-full rounded-md object-cover"></video>
                                                            <div className="flex items-center gap-2 mt-2">
                                                                <a href={platformVideo.url} download={`${platform}.mp4`} className="text-xs p-1 rounded-md bg-slate-700/50 hover:bg-slate-700">Download</a>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <HiOutlineVideoCamera className="w-10 h-10 text-slate-500 mb-2"/>
                                                            <p className="text-sm font-semibold text-white">Video Concept</p>
                                                            <p className="text-xs text-slate-400 mb-3">{content.video_suggestion}</p>
                                                            <button onClick={() => handleOpenScriptModal(platform, content.video_script, content.video_suggestion)} className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-primary-gradient text-white hover:opacity-90">
                                                                <HiOutlineSparkles/> Generate Video
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="aspect-square bg-slate-800 rounded-lg flex flex-col items-center justify-center p-4 text-center">
                                                    {platformImage?.loading ? (
                                                        <div className="w-8 h-8 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
                                                    ) : platformImage?.base64 ? (
                                                        <>
                                                            {/* FIX: Removed invalid backslashes from template literals */}
                                                            <img src={`data:image/png;base64,${platformImage.base64}`} alt={`${platform} visual`} className="w-full h-full rounded-md object-cover"/>
                                                            <div className="flex items-center gap-2 mt-2">
                                                                {/* FIX: Removed invalid backslashes from template literals */}
                                                                <a href={`data:image/png;base64,${platformImage.base64}`} download={`${platform}.png`} className="text-xs p-1 rounded-md bg-slate-700/50 hover:bg-slate-700">Download</a>
                                                                {/* FIX: Removed invalid backslash from template literal */}
                                                                <button onClick={() => handleSaveImage(platform, content.image_suggestion || '')} disabled={platformImage.saved} className={`text-xs p-1 rounded-md ${platformImage.saved ? 'bg-green-500/20 text-green-400' : 'bg-slate-700/50 hover:bg-slate-700'}`}>{platformImage.saved ? 'Saved' : 'Save'}</button>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <HiOutlinePhoto className="w-10 h-10 text-slate-500 mb-2"/>
                                                            <p className="text-sm font-semibold text-white">Image Suggestion</p>
                                                            <p className="text-xs text-slate-400 mb-3">{content.image_suggestion}</p>
                                                            <button onClick={() => handleGenerateImage(platform, content.image_suggestion || '')} className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-primary-gradient text-white hover:opacity-90">
                                                                <HiOutlineSparkles/> Generate Image
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {platform === 'Facebook' && (
                                        <div className="mt-4 pt-4 border-t border-slate-700/50">
                                            <h4 className="text-sm font-semibold text-white mb-2">Post to Facebook Page</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                                <input value={facebookPageId} onChange={e => setFacebookPageId(e.target.value)} placeholder="Facebook Page ID" className="w-full p-2 text-xs bg-slate-800 border border-slate-700 rounded-lg"/>
                                                <input value={facebookAccessToken} onChange={e => setFacebookAccessToken(e.target.value)} placeholder="Page Access Token" className="w-full p-2 text-xs bg-slate-800 border border-slate-700 rounded-lg"/>
                                                <button 
                                                    onClick={() => handlePostToFacebook(platform, content)}
                                                    disabled={platformPostStatus[platform] === 'posting' || platformPostStatus[platform] === 'posted' || !generatedImages[platform]?.base64}
                                                    className={`w-full flex items-center justify-center gap-2 text-xs font-semibold rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed
                                                        ${platformPostStatus[platform] === 'posted' ? 'bg-green-500/80' : 'bg-blue-600 hover:bg-blue-500'}`}>
                                                    {platformPostStatus[platform] === 'posting' ? 'Posting...' : platformPostStatus[platform] === 'posted' ? 'Posted!' : 'Post Now'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                     <div className="flex justify-center mt-10">
                        <button onClick={() => { setStep('input'); setCampaignResult(null); setGeneratedImages({}); }} className="flex items-center gap-2 px-6 py-2 text-slate-400 hover:text-slate-300 bg-slate-800/50 border border-slate-700 rounded-lg transition-colors icon-hover-effect"><HiArrowLeft className="w-5 h-5" /> Back</button>
                    </div>
                </div>
            );
        } else {
            return (
                <div className="max-w-4xl mx-auto animate-fade-in">
                     <h2 className="text-3xl font-bold text-center mb-2 text-white">Your Social Post is Ready!</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                        <div>
                            <h3 className="font-semibold text-white mb-2 text-center">Generated Visual</h3>
                            {finalGeneratedPost && <img src={`data:image/png;base64,${finalGeneratedPost}`} alt="Generated social post" className="rounded-xl mx-auto shadow-lg border-2 border-slate-700/50" style={{ aspectRatio: aspectRatio.replace(':', ' / ') }} />}
                        </div>
                        <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                             <h3 className="font-semibold text-white mb-2">Generated Caption</h3>
                             <p className="text-sm text-slate-300 whitespace-pre-wrap">{finalCaption}</p>
                        </div>
                     </div>
                     <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center items-center gap-4 mt-8">
                         <button onClick={handleBackToSettings} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 border border-slate-700"><HiArrowLeft/> Back to Settings</button>
                         <button onClick={() => setStep('conceptSelection')} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 border border-slate-700"><HiOutlineLightBulb/> Back to Concepts</button>
                         <div className="relative group" title={!session ? 'Please sign in to save creations' : ''}><button onClick={handleSaveFinalPost} disabled={isFinalPostSaved || !session} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700 border border-slate-700 disabled:opacity-60"><HiOutlineHeart className={isFinalPostSaved ? 'text-pink-500' : ''}/> {isFinalPostSaved ? 'Saved!' : 'Like & Save'}</button></div>
                         <a href={`data:image/png;base64,${finalGeneratedPost}`} download="dreampixel-post.png" className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary-gradient text-white font-bold rounded-lg hover:opacity-90"><HiArrowDownTray/> Download Image</a>
                     </div>
                </div>
            );
        }
    };
    
    const renderActiveStep = () => {
        switch (step) {
            case 'input':
                return renderInputStep();
            case 'trendSelection':
                return renderTrendSelectionStep();
            case 'conceptSelection':
                return renderConceptSelectionStep();
            case 'generating':
                return renderGeneratingStep();
            case 'result':
                return renderResultStep();
            default:
                return renderInputStep();
        }
    };

    return (
        <div className="animate-fade-in">
            <ErrorMessage error={error} />
            {isScriptModalOpen && currentScriptData && (
                 <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in" onClick={() => setIsScriptModalOpen(false)}>
                     <div className="bg-slate-900/80 border border-slate-700 rounded-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                         <header className="p-4 border-b border-slate-800 flex justify-between items-center">
                            <h3 className="font-bold text-white">Video Script for {currentScriptData.platform}</h3>
                            <button onClick={() => setIsScriptModalOpen(false)}><HiXMark className="w-6 h-6"/></button>
                         </header>
                         <main className="p-6 space-y-4">
                             <div>
                                <label className="font-semibold text-sm text-slate-400">Video Concept</label>
                                <p className="p-2 bg-slate-800 rounded-md text-sm">{currentScriptData.suggestion}</p>
                             </div>
                             <div>
                                <label className="font-semibold text-sm text-slate-400">Editable Script / Voiceover</label>
                                <textarea value={currentScriptData.script} onChange={(e) => setCurrentScriptData(prev => prev ? {...prev, script: e.target.value} : null)} rows={6} className="w-full p-2 bg-slate-800 rounded-md text-sm border border-slate-700"></textarea>
                             </div>
                         </main>
                         <footer className="p-4 flex justify-end">
                            <button onClick={handleGenerateVideoWithScript} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-primary-gradient text-white hover:opacity-90">
                                <HiOutlineSparkles/> Generate Video with this Script
                            </button>
                         </footer>
                     </div>
                 </div>
            )}
            {renderActiveStep()}
        </div>
    );
};
