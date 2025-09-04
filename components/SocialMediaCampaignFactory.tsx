import React, { useState, useEffect } from 'react';
import { SocialCampaign, PlatformPostConcept, UploadedFile, ConnectedAccount, AdStyle, AspectRatio, GeneratedConcept } from '../types';
import { generateSocialMediaCampaign, generateSocialPost, generateSocialPostWithHeadshot, generateSocialVideo, getTrendingTopics, generateTrendPostConcepts, generateSocialPostConcepts } from '../services/aiService';
import * as historyService from '../services/historyService';
import * as jobService from '../services/jobService';
import { HiArrowDownTray, HiOutlineHeart, HiOutlineSparkles, HiArrowLeft, HiClipboardDocument, HiCheck, HiOutlinePhoto, HiOutlineUserCircle, HiArrowUpTray, HiOutlineLink, HiXMark, HiCheckCircle, HiOutlineVideoCamera, HiOutlinePencil, HiOutlineShare, HiBuildingStorefront, HiRectangleStack, HiOutlineArrowTrendingUp, HiOutlineLightBulb } from 'react-icons/hi2';
import { FaLinkedin, FaInstagram, FaFacebook, FaTiktok, FaYoutube } from 'react-icons/fa6';
import { FaTwitter, FaThreads } from 'react-icons/fa6';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from './ErrorMessage';
import { useLocalization } from '../hooks/useLocalization';
import { AD_STYLES } from '../services/constants';
import StyleSelector from './StyleSelector';

type GenerationMode = 'campaign' | 'single' | 'trend';
type Step = 'input' | 'generating' | 'result' | 'trendSelection' | 'conceptSelection';

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

const platforms: {[key: string]: AspectRatio} = {
    "Instagram": "1:1",
    "Facebook": "1.91:1",
    "X / Twitter": "16:9",
    "LinkedIn": "1.91:1",
    "Pinterest": "4:5",
    "Instagram Story": "9:16",
};
type Platform = keyof typeof platforms;
const tones = ["Professional", "Casual", "Humorous", "Inspirational", "Informative"];

// FIX: Added 'export' to the component definition and completed its implementation.
export const SocialMediaCampaignFactory: React.FC<SocialMediaCampaignFactoryProps> = ({ onNavigateHome, onCreationGenerated, onGenerating, connectedAccounts, onToggleConnect }) => {
    const { session } = useAuth();
    const { t, locale, setLocale } = useLocalization();
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
    const [postedPlatforms, setPostedPlatforms] = useState<{ [key: string]: boolean }>({});
    const [isScriptModalOpen, setIsScriptModalOpen] = useState(false);
    const [currentScriptData, setCurrentScriptData] = useState<{ platform: string; script: string; suggestion: string } | null>(null);
    const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);
    
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
        setAspectRatio(platforms[platform] as AspectRatio);
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
    
    // --- API CALL HANDLERS ---
    const handleGenerateCampaign = async () => {
        if (!topic.trim()) {
            setError('Please provide a topic for your campaign.');
            return;
        }
        if (session) {
            jobService.saveSocialCampaignJob({ userId: session.user.id, topic, keywords, link, headshots: headshot ? [headshot] : [], sampleImage, postLink, language: locale, creatorName });
        }
        setIsLoading(true);
        setError(null);
        setStep('generating');
        // FIX: Explicitly cast t() to String to resolve persistent type errors.
        setLoadingMessage(String(t('socialCampaignFactory.generatingMessage')));
        try {
            const result = await generateSocialMediaCampaign(topic, keywords, link, headshot, sampleImage, postLink, locale, creatorName);
            setCampaignResult(result);
            setStep('result');
        } catch (err) {
            // FIX: Explicitly cast t() to String to resolve persistent type errors.
            setError(err instanceof Error ? err.message : String(t('socialCampaignFactory.errorCampaign')));
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
        setLoadingMessage(String(t('socialCampaignFactory.findingTrends')));
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
                jobService.saveSocialPostJob({ userId: session.user.id, topic, platform, tone, callToAction, styleId: selectedStyleId, aspectRatio });
            } else if (mode === 'trend') {
                jobService.saveTrendPostJob({ userId: session.user.id, baseKeyword, selectedTrend, styleId: selectedStyleId, aspectRatio });
            }
        }
        
        setIsLoading(true);
        setError(null);
        setLoadingMessage(String(t('toolShared.loading.crafting')));
        try {
            const concepts = mode === 'trend'
                ? await generateTrendPostConcepts(selectedTrend, platform, selectedStyle)
                : await generateSocialPostConcepts(topic, platform, tone, selectedStyle, callToAction);
            
            setGeneratedConcepts(concepts);
            setStep('conceptSelection');
        } catch (err) {
            setError(err instanceof Error ? err.message : String(t('toolShared.errorConceptsFailed')));
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
                throw new Error(String(t('toolShared.errorImageFailed')));
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
        const imageAspectRatio = platform.includes('Story') || platform === 'TikTok' || platform === 'YouTube_Shorts' ? '9:16' : '1:1';
        try {
            const imageResult = headshot ? await generateSocialPostWithHeadshot(imagePrompt, headshot, imageAspectRatio as any) : await generateSocialPost(imagePrompt, imageAspectRatio as any);
            if (imageResult) {
                setGeneratedImages(prev => ({ ...prev, [platform]: { loading: false, base64: imageResult, saved: false } }));
            } else {
                throw new Error(String(t('toolShared.errorImageFailed')));
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate image.');
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
        setGeneratedVideos(prev => ({ ...prev, [platform]: { loading: true, url: null, saved: false, loadingMessage: String(t('socialCampaignFactory.videoGenerating.status1')) } }));
        setError(null);

        const messages = [String(t('socialCampaignFactory.videoGenerating.status2')), String(t('socialCampaignFactory.videoGenerating.status3')), String(t('socialCampaignFactory.videoGenerating.status4')), String(t('socialCampaignFactory.videoGenerating.status5'))];
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
    
    // --- UI & STATE HANDLERS ---
    const handleSaveImage = async (platform: string, imagePrompt: string) => {
        const imageData = generatedImages[platform];
        if (imageData?.base64 && !imageData.saved && session) {
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
                // For videos, we might save a thumbnail or just the prompt/URL
                // For simplicity, we'll mark it saved without adding to visual history yet.
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
    
    const renderCampaignInput = () => (
        <div className="space-y-4">
            <div data-tooltip="Describe the core message or announcement for your campaign. The AI will generate content for all platforms based on this.">
                <label className="font-semibold text-slate-300">{t('socialCampaignFactory.topicLabel')}</label>
                <textarea value={topic} onChange={(e) => setTopic(e.target.value)} placeholder={t('socialCampaignFactory.topicPlaceholder') || ''} className="w-full mt-2 p-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 transition text-sm" rows={3}></textarea>
            </div>
             <div data-tooltip="Include any specific keywords you want the AI to focus on.">
                <label className="font-semibold text-slate-300">{t('socialCampaignFactory.keywordsLabel')} <span className="text-slate-400 font-normal">{t('common.optional')}</span></label>
                <input value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder={t('socialCampaignFactory.keywordsPlaceholder') || ''} className="w-full mt-2 p-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 transition text-sm" />
            </div>
             <div data-tooltip="Add a call to action link to be included in the posts.">
                <label className="font-semibold text-slate-300">{t('socialCampaignFactory.linkLabel')} <span className="text-slate-400 font-normal">{t('common.optional')}</span></label>
                <input value={link} onChange={(e) => setLink(e.target.value)} placeholder={t('socialCampaignFactory.linkPlaceholder') || ''} className="w-full mt-2 p-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 transition text-sm" />
            </div>
            <div className="flex justify-center pt-4">
                <button onClick={handleGenerateCampaign} disabled={isLoading || !topic.trim()} className="flex items-center gap-3 px-8 py-4 bg-primary-gradient text-white font-bold text-lg rounded-lg hover:opacity-90 transition-all duration-300 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed transform hover:scale-105">
                    {isLoading ? <div className="w-6 h-6 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : <HiOutlineSparkles className="w-6 h-6"/>}
                    {t('socialCampaignFactory.generateButton')}
                </button>
            </div>
        </div>
    );
    
    const renderSinglePostInput = () => (
         <div className="space-y-4">
            <div data-tooltip="Describe the core message or announcement for your post.">
                <label className="font-semibold text-slate-300">{t('socialCampaignFactory.topicLabel')}</label>
                <textarea value={topic} onChange={(e) => setTopic(e.target.value)} placeholder={t('socialCampaignFactory.topicPlaceholder') || ''} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 transition text-sm" rows={3}></textarea>
            </div>
            <div data-tooltip="Select the social media platform you're targeting.">
                <label className="font-semibold text-slate-300">{t('socialCampaignFactory.platformLabel')}</label>
                <select value={platform} onChange={e => setPlatform(e.target.value as Platform)} className="w-full mt-2 p-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 transition text-sm">
                    {Object.keys(platforms).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>
             <div data-tooltip="Choose the tone of voice for the written caption.">
                <label className="font-semibold text-slate-300">{t('socialCampaignFactory.toneLabel')}</label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                     {tones.map(t_item => <button key={t_item} type="button" onClick={() => setTone(t_item)} className={`p-2 text-sm rounded-md transition-colors ${tone === t_item ? 'bg-purple-600 text-white font-semibold' : 'bg-slate-800 hover:bg-slate-700'}`}>{t_item}</button>)}
                </div>
            </div>
            <div data-tooltip="Add a call to action to encourage engagement.">
                <label className="font-semibold text-slate-300">{t('socialCampaignFactory.callToActionLabel')} <span className="text-slate-400 font-normal">{t('common.optional')}</span></label>
                <input type="text" value={callToAction} onChange={e => setCallToAction(e.target.value)} placeholder="e.g., 'Shop now!' or 'Link in bio'" className="w-full mt-2 p-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 transition text-sm" />
            </div>
            <div className="flex justify-center pt-4">
                <button onClick={handleGenerateConcepts} disabled={isLoading || !topic.trim()} className="flex items-center gap-3 px-8 py-4 bg-primary-gradient text-white font-bold text-lg rounded-lg hover:opacity-90 transition-all duration-300 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed transform hover:scale-105">
                    {isLoading ? <div className="w-6 h-6 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : <HiOutlineSparkles className="w-6 h-6"/>}
                    {t('socialCampaignFactory.generateConceptsButton')}
                </button>
            </div>
        </div>
    );
    
    const renderTrendInput = () => (
         <div className="space-y-4">
            <label className="font-semibold text-slate-300">{t('socialCampaignFactory.baseKeywordLabel')}</label>
            <p className="text-sm text-slate-400">{t('socialCampaignFactory.baseKeywordDesc')}</p>
            <input value={baseKeyword} onChange={(e) => setBaseKeyword(e.target.value)} placeholder={t('socialCampaignFactory.baseKeywordPlaceholder') || ''} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 transition text-sm" />
            <div className="flex justify-center pt-4">
                <button onClick={handleFindTrends} disabled={isLoading || !baseKeyword.trim()} className="flex items-center gap-3 px-8 py-4 bg-primary-gradient text-white font-bold text-lg rounded-lg hover:opacity-90 transition-all duration-300 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed transform hover:scale-105">
                    {isLoading ? <div className="w-6 h-6 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : <HiOutlineSparkles className="w-6 h-6"/>}
                    {isLoading ? loadingMessage : t('socialCampaignFactory.findTrendsButton')}
                </button>
            </div>
        </div>
    );

    const renderStyleSelection = () => (
         <div className="space-y-8">
            <div className="mb-4">
                <label className="font-semibold text-slate-300">{t('socialCampaignFactory.platformLabel')}</label>
                <select value={platform} onChange={e => setPlatform(e.target.value as Platform)} className="w-full mt-2 p-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 transition text-sm">
                    {Object.keys(platforms).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>
            <StyleSelector
                title={String(t('socialCampaignFactory.chooseStyleLabel'))}
                stylesData={AD_STYLES as any}
                selectedStyleId={selectedStyleId}
                onStyleSelect={setSelectedStyleId}
            />
             <div className="flex justify-center pt-4">
                <button onClick={handleGenerateConcepts} disabled={isLoading} className="flex items-center gap-3 px-8 py-4 bg-primary-gradient text-white font-bold text-lg rounded-lg hover:opacity-90 transition-all duration-300 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed transform hover:scale-105">
                    {isLoading ? <div className="w-6 h-6 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : <HiOutlineSparkles className="w-6 h-6"/>}
                    {t('socialCampaignFactory.generateConceptsButton')}
                </button>
            </div>
        </div>
    );

    const renderInputStep = () => (
        <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-2 text-white">{t('socialCampaignFactory.title')}</h2>
            <p className="text-slate-400 text-center mb-10">{t('socialCampaignFactory.subtitle')}</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-8 p-1 bg-slate-800/50 rounded-lg border border-slate-700">
                {[
                    // FIX: Explicitly cast t() to String to resolve persistent type errors for data-tooltip.
                    { key: 'campaign', icon: HiBuildingStorefront, label: t('socialCampaignFactory.modeCampaign'), desc: String(t('socialCampaignFactory.modeCampaignDesc')) },
                    { key: 'single', icon: HiRectangleStack, label: t('socialCampaignFactory.modeSingle'), desc: String(t('socialCampaignFactory.modeSingleDesc')) },
                    { key: 'trend', icon: HiOutlineArrowTrendingUp, label: t('socialCampaignFactory.modeTrend'), desc: String(t('socialCampaignFactory.modeTrendDesc')) },
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
                            <label className="font-semibold text-slate-300">{t('socialCampaignFactory.creatorNameLabel')}</label>
                            <input value={creatorName} onChange={(e) => setCreatorName(e.target.value)} placeholder={t('socialCampaignFactory.creatorNamePlaceholder') || ''} className="w-full mt-2 p-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 transition text-sm" />
                        </div>
                        <div>
                             <label className="font-semibold text-slate-300">{t('socialCampaignFactory.headshotsLabel')}</label>
                             <div className={`mt-2 p-2 border-2 border-dashed rounded-xl text-center ${headshot ? 'border-green-500/50' : 'border-slate-700 hover:border-slate-600'}`}>
                                <input type="file" id="headshot-upload" className="hidden" onChange={(e) => handleFileChange(e, 'headshot')} />
                                <label htmlFor="headshot-upload" className="cursor-pointer text-xs">{headshot ? headshot.name : t('socialCampaignFactory.uploadHeadshots')}</label>
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
            <p className="text-slate-400 mt-2">{t('common.generatingMessage')}</p>
        </div>
    );

    const renderTrendSelectionStep = () => (
        <div className="max-w-3xl mx-auto animate-fade-in">
            <h2 className="text-3xl font-bold text-center mb-2 text-white">{t('socialCampaignFactory.selectTrendLabel')}</h2>
            <p className="text-slate-400 text-center mb-10">{t('socialCampaignFactory.selectTrendDesc')}</p>
            {foundTrends.length > 0 ? (
                <div className="space-y-4">
                    {foundTrends.map((trend, index) => (
                        <button key={index} onClick={() => handleSelectTrend(trend)} className="w-full p-4 text-left bg-slate-800/50 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors">
                            <p className="font-semibold text-white">{trend}</p>
                        </button>
                    ))}
                </div>
            ) : (
                <p className="text-slate-500 text-center">{t('socialCampaignFactory.noTrendsFound')}</p>
            )}
            <div className="flex justify-center mt-10">
                <button onClick={() => setStep('input')} className="flex items-center gap-2 px-6 py-2 text-slate-400 hover:text-slate-300 bg-slate-800/50 border border-slate-700 rounded-lg transition-colors icon-hover-effect">
                    <HiArrowLeft className="w-5 h-5" /> {t('common.back')}
                </button>
            </div>
        </div>
    );

    const renderConceptSelectionStep = () => (
        <div className="max-w-7xl mx-auto animate-fade-in">
            <h2 className="text-3xl font-bold text-center mb-2 text-white">{t('common.chooseConceptTitle')}</h2>
            <p className="text-slate-400 text-center mb-10">{t('common.chooseConceptSubtitle')}</p>
            <div className="grid md:grid-cols-3 gap-6">
                {generatedConcepts.map((concept, index) => (
                    <div 
                        key={index} 
                        onClick={() => handleGenerateFinalPost(concept.prompt, concept.caption || '')}
                        className={`relative p-6 rounded-xl border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between ${concept.isRecommended ? 'border-amber-400 bg-slate-800/50' : 'border-slate-800 bg-slate-900/70 hover:border-slate-700 hover:-translate-y-1'}`}
                    >
                        <div>
                            {concept.isRecommended && (<div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2"><span className="px-3 py-1 text-xs font-semibold tracking-wider text-slate-900 uppercase bg-amber-400 rounded-full">{t('common.recommended')}</span></div>)}
                            <h3 className="font-bold text-white mb-3 mt-3">Concept {index + 1}</h3>
                            <p className="text-slate-300 text-sm mb-4"><strong>Visual:</strong> {concept.prompt}</p>
                            <p className="text-slate-300 text-sm mb-4"><strong>Caption:</strong> {concept.caption}</p>
                            {concept.reason && (<div className="mt-4 pt-4 border-t border-slate-700/50"><p className="text-xs text-amber-300/80 italic"><span className="font-bold not-italic">{t('common.reason')}:</span> {concept.reason}</p></div>)}
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-center mt-10">
                <button onClick={() => setStep('input')} className="flex items-center gap-2 px-6 py-2 text-slate-400 hover:text-slate-300 bg-slate-800/50 border border-slate-700 rounded-lg transition-colors icon-hover-effect">
                    <HiArrowLeft className="w-5 h-5" /> {t('common.backToSettings')}
                </button>
            </div>
        </div>
    );
    
    const renderResultStep = () => {
        if (mode === 'campaign' && campaignResult) {
            return (
                <div className="max-w-7xl mx-auto animate-fade-in">
                    <h2 className="text-3xl font-bold text-center mb-2 text-white">{t('socialCampaignFactory.resultsTitle')}</h2>
                    <p className="text-slate-400 text-center mb-10">{t('socialCampaignFactory.resultsSubtitle')}</p>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {Object.entries(campaignResult).map(([platform, content]) => {
                            const Icon = platformIcons[platform];
                            const platformName = platform.replace('_', ' ');
                            const imageData = generatedImages[platform];
                            const videoData = generatedVideos[platform];
                            return (
                                <div key={platform} className="p-4 bg-slate-900/60 border border-slate-700/50 rounded-xl flex flex-col">
                                    <div className="flex items-center gap-3 mb-3">
                                        {Icon && <Icon className="w-6 h-6 text-slate-400" />}
                                        <h3 className="font-bold text-lg text-white">{platformName}</h3>
                                    </div>
                                    <div className="space-y-2 text-sm text-slate-300 flex-grow">
                                        {content.title && <p><strong>Title:</strong> {content.title}</p>}
                                        {content.post && <p className="whitespace-pre-wrap">{content.post}</p>}
                                        {content.caption && <p className="whitespace-pre-wrap">{content.caption}</p>}
                                        {content.text_post && <p className="whitespace-pre-wrap">{content.text_post}</p>}
                                        {content.hashtags && <p className="text-sky-400">{content.hashtags.join(' ')}</p>}
                                        {content.call_to_action && <p><strong>{t('socialCampaignFactory.cta')}:</strong> {content.call_to_action}</p>}
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
                                        {imageData?.loading ? (
                                            <div className="flex items-center justify-center h-48 bg-slate-800 rounded-lg"><div className="w-6 h-6 border-2 border-t-transparent border-white rounded-full animate-spin"></div></div>
                                        ) : imageData?.base64 ? (
                                            <div>
                                                <img src={`data:image/png;base64,${imageData.base64}`} alt={`${platform} visual`} className="rounded-lg w-full" />
                                                <div className="flex gap-2 mt-2">
                                                    <a href={`data:image/png;base64,${imageData.base64}`} download={`${platform}-image.png`} className="flex-1 text-center px-2 py-1 text-xs bg-slate-700 rounded-md hover:bg-slate-600">{t('common.download')}</a>
                                                    <button onClick={() => handleSaveImage(platform, content.image_suggestion || '')} disabled={imageData.saved} className="flex-1 text-center px-2 py-1 text-xs bg-slate-700 rounded-md hover:bg-slate-600 disabled:opacity-50">{imageData.saved ? t('common.saved') : t('socialCampaignFactory.saveCreation')}</button>
                                                </div>
                                            </div>
                                        ) : (
                                            content.image_suggestion && (
                                                <button onClick={() => handleGenerateImage(platform, content.image_suggestion!)} className="w-full flex items-center justify-center gap-2 p-2 text-sm bg-purple-600/20 text-purple-300 rounded-lg hover:bg-purple-600/30">
                                                    <HiOutlinePhoto /> {t('socialCampaignFactory.generateImage')}
                                                </button>
                                            )
                                        )}
                                        {videoData?.loading ? (
                                            <div className="flex flex-col items-center justify-center h-48 bg-slate-800 rounded-lg">
                                                <div className="w-6 h-6 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                                                <p className="text-xs mt-2 text-slate-400">{videoData.loadingMessage}</p>
                                            </div>
                                        ) : videoData?.url ? (
                                            <div>
                                                <video src={videoData.url} controls className="rounded-lg w-full"></video>
                                                <div className="flex gap-2 mt-2">
                                                     <a href={videoData.url} download={`${platform}-video.mp4`} className="flex-1 text-center px-2 py-1 text-xs bg-slate-700 rounded-md hover:bg-slate-600">{t('socialCampaignFactory.downloadVideo')}</a>
                                                    <button onClick={() => handleSaveVideo(platform)} disabled={videoData.saved} className="flex-1 text-center px-2 py-1 text-xs bg-slate-700 rounded-md hover:bg-slate-600 disabled:opacity-50">{videoData.saved ? t('common.saved') : t('socialCampaignFactory.saveVideo')}</button>
                                                </div>
                                            </div>
                                        ) : (
                                            content.video_suggestion && content.video_suggestion !== "N/A" && (
                                                 <button onClick={() => handleOpenScriptModal(platform, content.video_script, content.video_suggestion)} className="w-full flex items-center justify-center gap-2 p-2 text-sm bg-rose-600/20 text-rose-300 rounded-lg hover:bg-rose-600/30">
                                                    <HiOutlineVideoCamera /> {t('socialCampaignFactory.generateVideo')}
                                                </button>
                                            )
                                        )}
                                    </div>
                                    <div className="mt-2 flex gap-2">
                                        <button onClick={() => handleCopyPost(platform, content)} className="flex-1 flex items-center justify-center gap-2 p-2 text-sm bg-slate-700/50 rounded-lg hover:bg-slate-700">
                                            {copiedPlatform === platform ? <HiCheck className="text-green-400"/> : <HiClipboardDocument />} {copiedPlatform === platform ? t('common.copied') : t('socialCampaignFactory.copyPost')}
                                        </button>
                                        <button disabled className="flex-1 flex items-center justify-center gap-2 p-2 text-sm bg-slate-700/50 rounded-lg disabled:opacity-50 cursor-not-allowed">
                                            <HiOutlineShare /> {t('socialCampaignFactory.postToPlatform', {platform: platformName})}
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <div className="flex justify-center mt-10">
                        <button onClick={() => setStep('input')} className="flex items-center gap-2 px-6 py-2 text-slate-400 hover:text-slate-300 bg-slate-800/50 border border-slate-700 rounded-lg transition-colors icon-hover-effect">
                            <HiArrowLeft className="w-5 h-5" /> {t('common.backToSettings')}
                        </button>
                    </div>
                </div>
            )
        }
        
        if ((mode === 'single' || mode === 'trend') && finalGeneratedPost) {
             return (
                <div className="max-w-4xl mx-auto text-center animate-fade-in">
                    <h2 className="text-3xl font-bold text-center mb-8 text-white">Your Social Post is Ready!</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                        <div className="text-left p-4 bg-slate-800/50 rounded-lg">
                             <h3 className="font-bold text-lg text-white mb-2">Generated Image</h3>
                             <img src={`data:image/png;base64,${finalGeneratedPost}`} alt="Generated social post" className="rounded-lg mx-auto shadow-lg mb-4 border-2 border-slate-700/50" />
                        </div>
                         <div className="text-left p-4 bg-slate-800/50 rounded-lg">
                             <h3 className="font-bold text-lg text-white mb-2">Generated Caption</h3>
                             <p className="text-slate-300 whitespace-pre-wrap">{finalCaption}</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center items-center gap-4 mt-8">
                        <button onClick={() => setStep('input')} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 border border-slate-700">
                            <HiArrowLeft /> {t('common.backToSettings')}
                        </button>
                        <button onClick={() => setStep('conceptSelection')} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 border border-slate-700">
                           <HiOutlineLightBulb/> {t('common.backToConcepts')}
                        </button>
                        <button onClick={handleSaveFinalPost} disabled={isFinalPostSaved || !session} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700 border border-slate-700 disabled:opacity-60">
                           <HiOutlineHeart className={isFinalPostSaved ? 'text-pink-500' : ''} /> {isFinalPostSaved ? t('common.saved') : t('common.likeAndSave')}
                        </button>
                        <a href={`data:image/png;base64,${finalGeneratedPost}`} download="dreampixel-social-post.png" className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary-gradient text-white font-bold rounded-lg hover:opacity-90">
                           <HiArrowDownTray /> {t('common.download')}
                        </a>
                    </div>
                </div>
            )
        }

        return null;
    }

    const renderScriptModal = () => {
        if (!isScriptModalOpen || !currentScriptData) return null;
        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={() => setIsScriptModalOpen(false)}>
                <div className="bg-slate-900/80 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                    <header className="flex items-center justify-between p-4 border-b border-slate-800">
                        <h2 className="text-lg font-bold text-white">{t('socialCampaignFactory.editVideoScriptTitle')}</h2>
                        <button onClick={() => setIsScriptModalOpen(false)} className="text-slate-500 hover:text-white"><HiOutlineXMark className="w-6 h-6"/></button>
                    </header>
                    <main className="p-6 space-y-4">
                        <p className="text-sm text-slate-400">{t('socialCampaignFactory.editVideoScriptDesc')}</p>
                        <div>
                             <label htmlFor="script-textarea" className="font-semibold text-slate-300">{t('socialCampaignFactory.scriptLabel')}</label>
                            <textarea
                                id="script-textarea"
                                value={currentScriptData.script}
                                onChange={(e) => setCurrentScriptData(prev => prev ? { ...prev, script: e.target.value } : null)}
                                className="w-full p-3 mt-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 transition text-sm"
                                rows={8}
                            ></textarea>
                        </div>
                    </main>
                    <footer className="flex justify-end p-4 bg-slate-950/30 border-t border-slate-800">
                        <button onClick={handleGenerateVideoWithScript} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary-gradient text-white rounded-lg hover:opacity-90">
                           <HiOutlineVideoCamera /> {t('socialCampaignFactory.generateWithScript')}
                        </button>
                    </footer>
                </div>
            </div>
        )
    };
    
    return (
        <div className="animate-fade-in">
            <ErrorMessage error={error} />
            
            {(step === 'input' || step === 'trendSelection' || step === 'conceptSelection') && (
                <div className="p-4 sm:p-6 md:p-8 bg-slate-900/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg">
                    {step === 'input' && renderInputStep()}
                    {step === 'trendSelection' && renderTrendSelectionStep()}
                    {step === 'conceptSelection' && renderConceptSelectionStep()}
                </div>
            )}
            
            {step === 'generating' && renderGeneratingStep()}
            {step === 'result' && renderResultStep()}

            {renderScriptModal()}
        </div>
    );
};
