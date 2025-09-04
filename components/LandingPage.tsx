
import React from 'react';
import { Tool, ToolType, ConnectedAccount } from '../types';
// FIX: Replaced HiOutlineTrendingUp with HiOutlineArrowTrendingUp as it is the correct icon name in react-icons/hi2.
import { HiOutlinePhoto, HiOutlineMegaphone, HiOutlineShare, HiOutlineUserGroup, HiOutlineUserCircle, HiOutlineSwatch, HiOutlineSparkles, HiOutlineIdentification, HiOutlineCreditCard, HiOutlineClipboardDocumentList, HiOutlineTicket, HiOutlineArrowTrendingUp, HiOutlineBuildingStorefront } from 'react-icons/hi2';
import SocialConnect from './SocialConnect';
import { useLocalization } from '../hooks/useLocalization';

interface LandingPageProps {
  onSelectTool: (tool: ToolType) => void;
  connectedAccounts: ConnectedAccount[];
  onToggleConnect: (platform: string) => void;
}

const ToolCard: React.FC<{ tool: Tool; onClick: () => void, t: (key: string) => string }> = React.memo(({ tool, onClick, t }) => {
    const icons: { [key in ToolType]: { icon: React.ElementType, gradient: string } } = {
        thumbnail: { icon: HiOutlinePhoto, gradient: 'from-purple-500 to-indigo-500' },
        advertisement: { icon: HiOutlineMegaphone, gradient: 'from-pink-500 to-rose-500' },
        social: { icon: HiOutlineShare, gradient: 'from-sky-500 to-cyan-500' },
        political: { icon: HiOutlineUserGroup, gradient: 'from-amber-500 to-orange-500' },
        profile: { icon: HiOutlineUserCircle, gradient: 'from-teal-500 to-emerald-500' },
        logo: { icon: HiOutlineSwatch, gradient: 'from-fuchsia-500 to-purple-500' },
        'image-enhancer': { icon: HiOutlineSparkles, gradient: 'from-yellow-400 to-amber-500' },
        'headshot-maker': { icon: HiOutlineIdentification, gradient: 'from-cyan-400 to-sky-500' },
        'passport-photo': { icon: HiOutlineCreditCard, gradient: 'from-blue-500 to-indigo-600' },
        'visiting-card': { icon: HiOutlineClipboardDocumentList, gradient: 'from-slate-400 to-slate-600' },
        'event-poster': { icon: HiOutlineTicket, gradient: 'from-rose-400 to-red-500' },
        'trend-post': { icon: HiOutlineArrowTrendingUp, gradient: 'from-green-400 to-teal-500' },
        'social-campaign': { icon: HiOutlineBuildingStorefront, gradient: 'from-indigo-500 to-violet-600' },
    };
    const { icon: Icon, gradient } = icons[tool.id];

    return (
        <div
            className={`
                flex flex-col p-6 bg-slate-900/60 backdrop-blur-lg border border-slate-700/50 rounded-xl
                transition-all duration-300 ease-in-out h-full
                ${!tool.enabled ? 'opacity-50' : 'hover:border-slate-600 hover:shadow-2xl hover:shadow-slate-900/50 hover:-translate-y-1'}
            `}
        >
            <div className="flex-grow">
                <div className={`mb-4 p-3 bg-gradient-to-br ${gradient} border border-slate-700 rounded-lg inline-block shadow-lg`}>
                    <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{tool.title}</h3>
                <p className="text-slate-400 text-sm mb-4">{tool.description}</p>
            </div>
            <button 
                onClick={tool.enabled ? onClick : undefined}
                disabled={!tool.enabled}
                className="w-full mt-4 px-4 py-2 text-sm font-semibold rounded-lg bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            >
                {tool.enabled ? t('toolCard.launch') : t('toolCard.soon')}
            </button>
        </div>
    );
});

const LandingPage: React.FC<LandingPageProps> = ({ onSelectTool, connectedAccounts, onToggleConnect }) => {
    const { t } = useLocalization();
    
    const tools: Tool[] = [
        { id: 'thumbnail', title: t('tools.thumbnail.title'), description: t('tools.thumbnail.description'), enabled: true },
        { id: 'advertisement', title: t('tools.advertisement.title'), description: t('tools.advertisement.description'), enabled: true },
        { id: 'social', title: t('tools.social.title'), description: t('tools.social.description'), enabled: true },
        { id: 'political', title: t('tools.political.title'), description: t('tools.political.description'), enabled: true },
        { id: 'trend-post', title: t('tools.trend-post.title'), description: t('tools.trend-post.description'), enabled: true },
        { id: 'social-campaign', title: t('tools.social-campaign.title'), description: t('tools.social-campaign.description'), enabled: true },
        { id: 'profile', title: t('tools.profile.title'), description: t('tools.profile.description'), enabled: true },
        { id: 'logo', title: t('tools.logo.title'), description: t('tools.logo.description'), enabled: true },
        { id: 'image-enhancer', title: t('tools.image-enhancer.title'), description: t('tools.image-enhancer.description'), enabled: true },
        { id: 'headshot-maker', title: t('tools.headshot-maker.title'), description: t('tools.headshot-maker.description'), enabled: true },
        { id: 'passport-photo', title: t('tools.passport-photo.title'), description: t('tools.passport-photo.description'), enabled: true },
        { id: 'visiting-card', title: t('tools.visiting-card.title'), description: t('tools.visiting-card.description'), enabled: true },
        { id: 'event-poster', title: t('tools.event-poster.title'), description: t('tools.event-poster.description'), enabled: true },
    ];

    return (
        <div className="animate-fade-in-up">
            <div className="mb-12">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-3">{t('landing.title')}</h2>
                <p className="text-base md:text-lg text-slate-400 max-w-3xl">{t('landing.subtitle')}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {tools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} onClick={() => onSelectTool(tool.id)} t={t} />
                ))}
            </div>
            <div className="mt-16">
              <SocialConnect connectedAccounts={connectedAccounts} onToggleConnect={onToggleConnect} />
            </div>
        </div>
    );
};

export default LandingPage;
