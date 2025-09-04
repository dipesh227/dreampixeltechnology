
import React, { useState, useEffect } from 'react';
import { SocialCampaign, PlatformPostConcept } from '../types';
import { generateSocialMediaCampaign, generateSocialPost } from '../services/aiService';
import * as historyService from '../services/historyService';
import * as jobService from '../services/jobService';
import { HiArrowDownTray, HiOutlineHeart, HiOutlineSparkles, HiArrowLeft, HiClipboardDocument, HiCheck, HiOutlinePhoto } from 'react-icons/hi2';
import { FaLinkedin, FaInstagram, FaFacebook, FaTiktok, FaYoutube } from 'react-icons/fa6';
import { FaTwitter, FaThreads } from 'react-icons/fa6';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from './ErrorMessage';
import { useLocalization } from '../hooks/useLocalization';

type Step = 'input' | 'generating' | 'result';

interface SocialMediaCampaignFactoryProps {
    onNavigateHome: () => void;
    onCreationGenerated: () => void;
    onGenerating: (isGenerating: boolean) => void;
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

const SocialMediaCampaignFactory: React.FC<SocialMediaCampaignFactoryProps> = ({ onNavigateHome, onCreationGenerated, onGenerating }) => {
    const { session } = useAuth();
    const { t } = useLocalization();
    const [step, setStep] = useState<Step>('input');
    
    const [topic, setTopic] = useState('');
    const [keywords, setKeywords] = useState('');
    const [link, setLink] = useState('');
    
    const [campaignResult, setCampaignResult] = useState<SocialCampaign | null>(null);
    const [generatedImages, setGeneratedImages] = useState<{ [platform: string]: { loading: boolean; base64: string | null; saved: boolean } }>({});

    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);

    useEffect(() => {
        onGenerating(isLoading || Object.values(generatedImages).some(img => img.loading));
    }, [isLoading, generatedImages, onGenerating]);

    const handleGenerateCampaign = async () => {
        if (!topic.trim()) {
            setError('Please provide a topic for your campaign.');
            return;
        }

        if (session) {
            jobService.saveSocialCampaignJob({
                userId: session.user.id,
                topic, keywords, link
            });
        }
        
        setIsLoading(true);
        setError(null);
        setStep('generating');
        setLoadingMessage(t('socialCampaignFactory.generatingMessage'));
        try {
            const result = await generateSocialMediaCampaign(topic, keywords, link);
            setCampaignResult(result);
            setStep('result');
        } catch (err) {
            setError(err instanceof Error ? err.message : t('socialCampaignFactory.errorCampaign'));
            setStep('input');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGenerateImage = async (platform: string, imagePrompt: string) => {
        setGeneratedImages(prev => ({ ...prev, [platform]: { loading: true, base64: null, saved: false } }));
        setError(null);

        try {
            // A simple mapping to get a reasonable aspect ratio for the image
            const aspectRatio = platform === 'Instagram Story' || platform === 'TikTok' || platform === 'YouTube_Shorts' ? '9:16' : '1:1';
            const imageResult = await generateSocialPost(imagePrompt, aspectRatio);
            if (imageResult) {
                setGeneratedImages(prev => ({ ...prev, [platform]: { loading: false, base64: imageResult, saved: false } }));
            } else {
                throw new Error(t('toolShared.errorImageFailed'));
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate image.');
            setGeneratedImages(prev => ({ ...prev, [platform]: { loading: false, base64: null, saved: false } }));
        }
    };
    
    const handleSaveCreation = async (platform: string, imagePrompt: string) => {
        const imageData = generatedImages[platform];
        if (imageData?.base64 && !imageData.saved && session) {
            const newEntry = {
                id: '',
                prompt: `Campaign: ${topic} - ${platform} Visual: ${imagePrompt}`,
                imageUrl: `data:image/png;base64,${imageData.base64}`,
                timestamp: Date.now()
            };
            try {
                await historyService.saveCreation(newEntry, session.user.id);
                setGeneratedImages(prev => ({ ...prev, [platform]: { ...imageData, saved: true } }));
                onCreationGenerated();
            } catch (error) {
                setError("Failed to save creation. Please try again.");
            }
        }
    };

    const handleCopyPost = (platform: string, content: PlatformPostConcept) => {
        const textToCopy = [
            content.title,
            content.post,
            content.caption,
            content.text_post,
            content.description,
            content.hashtags ? content.hashtags.join(' ') : '',
            content.call_to_action
        ].filter(Boolean).join('\n\n');
        
        navigator.clipboard.writeText(textToCopy);
        setCopiedPlatform(platform);
        setTimeout(() => setCopiedPlatform(null), 2000);
    };

    const renderInputStep = () => (
        <div className="max-w-3xl mx-auto space-y-6">
            <h3 className="text-xl font-bold text-white">{t('socialCampaignFactory.step1Title')}</h3>
            <div data-tooltip="Describe the core message or announcement for your campaign. The AI will generate content for all platforms based on this.">
                <label className="font-semibold text-slate-300">{t('socialCampaignFactory.topicLabel')}</label>
                <textarea value={topic} onChange={(e) => setTopic(e.target.value)} placeholder={t('socialCampaignFactory.topicPlaceholder')} className="w-full mt-2 p-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 transition text-sm" rows={3}></textarea>
            </div>
             <div data-tooltip="Include any specific keywords you want the AI to focus on.">
                <label className="font-semibold text-slate-300">{t('socialCampaignFactory.keywordsLabel')} <span className="text-slate-400 font-normal">{t('common.optional')}</span></label>
                <input value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder={t('socialCampaignFactory.keywordsPlaceholder')} className="w-full mt-2 p-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 transition text-sm" />
            </div>
             <div data-tooltip="Add a call to action link to be included in the posts.">
                <label className="font-semibold text-slate-300">{t('socialCampaignFactory.linkLabel')} <span className="text-slate-400 font-normal">{t('common.optional')}</span></label>
                <input value={link} onChange={(e) => setLink(e.target.value)} placeholder={t('socialCampaignFactory.linkPlaceholder')} className="w-full mt-2 p-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 transition text-sm" />
            </div>
            <div className="flex justify-center pt-4">
                <button onClick={handleGenerateCampaign} disabled={isLoading || !topic.trim()} className="flex items-center gap-3 px-8 py-4 bg-primary-gradient text-white font-bold text-lg rounded-lg hover:opacity-90 transition-all duration-300 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed transform hover:scale-105">
                    {isLoading ? <div className="w-6 h-6 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : <HiOutlineSparkles className="w-6 h-6"/>}
                    {t('socialCampaignFactory.generateButton')}
                </button>
            </div>
        </div>
    );
    
    const renderGeneratingStep = () => (
        <div className="text-center py-20 animate-fade-in">
            <div className="relative w-24 h-24 mx-auto"><div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div><div className="absolute inset-0 border-4 border-t-purple-400 rounded-full animate-spin"></div></div>
            <h2 className="text-3xl font-bold mt-8 text-white">{loadingMessage}</h2>
            <p className="text-slate-400 mt-2">{t('common.generatingMessage')}</p>
        </div>
    );
    
    const renderResultStep = () => {
        if (!campaignResult) return null;
        const platforms = Object.keys(campaignResult);

        return (
            <div className="animate-fade-in">
                 <h2 className="text-3xl font-bold text-center mb-2 text-white">{t('socialCampaignFactory.resultsTitle')}</h2>
                 <p className="text-slate-400 text-center mb-10">{t('socialCampaignFactory.resultsSubtitle')}</p>
                 <div className="flex flex-col lg:flex-row gap-8">
                     <div className="lg:w-1/3">
                         <div className="space-y-2 sticky top-24">
                             {platforms.map(p => {
                                 const Icon = platformIcons[p];
                                 return (
                                     <a key={p} href={`#platform-${p}`} className="flex items-center gap-3 p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors w-full">
                                         {Icon && <Icon className="w-6 h-6 text-slate-300"/>}
                                         <span className="font-semibold text-white">{p.replace(/_/g, ' ')}</span>
                                     </a>
                                 )
                             })}
                         </div>
                     </div>
                     <div className="lg:w-2/3 space-y-8">
                         {platforms.map(p => {
                             const content = campaignResult[p as keyof SocialCampaign];
                             if (!content) return null;
                             const Icon = platformIcons[p];
                             const platformImageData = generatedImages[p];
                             const postText = content.post || content.caption || content.text_post || content.title;
                             const suggestion = content.image_suggestion || content.video_suggestion;
                             const isVideo = !!content.video_suggestion;

                             return (
                                 <div key={p} id={`platform-${p}`} className="p-6 bg-slate-900/60 backdrop-blur-lg border border-slate-700/50 rounded-xl scroll-mt-24">
                                     <div className="flex items-center gap-3 mb-4">
                                        {Icon && <Icon className="w-7 h-7 text-slate-300"/>}
                                        <h3 className="text-xl font-bold text-white">{p.replace(/_/g, ' ')}</h3>
                                     </div>
                                     <div className="space-y-4">
                                        {postText && <p className="text-slate-300 whitespace-pre-wrap">{postText}</p>}
                                        {content.description && <p className="text-slate-400 text-sm whitespace-pre-wrap">{content.description}</p>}
                                        {content.hashtags && (
                                            <div>
                                                <h4 className="font-semibold text-slate-400 text-sm">{t('socialCampaignFactory.hashtags')}:</h4>
                                                <p className="text-sky-400 text-sm">{content.hashtags.join(' ')}</p>
                                            </div>
                                        )}
                                        {content.call_to_action && (
                                            <div>
                                                <h4 className="font-semibold text-slate-400 text-sm">{t('socialCampaignFactory.cta')}:</h4>
                                                <p className="text-amber-400 font-semibold text-sm">{content.call_to_action}</p>
                                            </div>
                                        )}
                                        {suggestion && (
                                             <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg space-y-3">
                                                <h4 className="font-semibold text-slate-400 text-sm">{isVideo ? t('socialCampaignFactory.videoSuggestion') : t('socialCampaignFactory.imageSuggestion')}:</h4>
                                                <p className="text-slate-300 text-sm italic">"{suggestion}"</p>
                                                {!isVideo && (
                                                    platformImageData?.base64 ? (
                                                        <div className="mt-2 space-y-2">
                                                            <img src={`data:image/png;base64,${platformImageData.base64}`} alt={`${p} visual`} className="rounded-lg w-full"/>
                                                            <div className="flex gap-2">
                                                                <a href={`data:image/png;base64,${platformImageData.base64}`} download={`dreampixel-${p}.png`} className="flex-grow flex items-center justify-center gap-2 px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"><HiArrowDownTray className="w-4 h-4"/> {t('common.download')}</a>
                                                                <button onClick={() => handleSaveCreation(p, suggestion)} disabled={platformImageData.saved || !session} className="flex-grow flex items-center justify-center gap-2 px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-60"><HiOutlineHeart className={`w-4 h-4 ${platformImageData.saved ? 'text-pink-500' : 'text-pink-400'}`}/> {platformImageData.saved ? t('common.saved') : t('socialCampaignFactory.saveCreation')}</button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <button onClick={() => handleGenerateImage(p, suggestion)} disabled={platformImageData?.loading} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600/50 hover:bg-purple-600/80 text-white font-semibold rounded-lg transition-colors disabled:opacity-60">
                                                             {platformImageData?.loading ? <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : <HiOutlinePhoto className="w-5 h-5"/>}
                                                             {t('socialCampaignFactory.generateImage')}
                                                        </button>
                                                    )
                                                )}
                                            </div>
                                        )}
                                        <button onClick={() => handleCopyPost(p, content)} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 transition-all duration-300 border border-slate-700">
                                            {copiedPlatform === p ? <HiCheck className="w-5 h-5 text-green-400"/> : <HiClipboardDocument className="w-5 h-5 text-slate-300"/>}
                                            {copiedPlatform === p ? t('common.copied') : t('socialCampaignFactory.copyPost')}
                                        </button>
                                     </div>
                                 </div>
                             )
                         })}
                     </div>
                 </div>
                 <div className="flex justify-center mt-10">
                    <button onClick={() => setStep('input')} className="flex items-center gap-2 px-6 py-2 text-slate-400 hover:text-slate-300 bg-slate-800/50 border border-slate-700 rounded-lg transition-colors icon-hover-effect">
                        <HiArrowLeft className="w-5 h-5" /> {t('common.backToSettings')}
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="animate-fade-in">
            <ErrorMessage error={error} />
            <div className="p-4 sm:p-6 md:p-8 bg-slate-900/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg">
                <h2 className="text-3xl font-bold text-center mb-2 text-white">{t('socialCampaignFactory.title')}</h2>
                <p className="text-slate-400 text-center mb-10">{t('socialCampaignFactory.subtitle')}</p>
                {step === 'input' && renderInputStep()}
                {step === 'generating' && renderGeneratingStep()}
                {step === 'result' && renderResultStep()}
            </div>
        </div>
    );
};

export default SocialMediaCampaignFactory;
