
import React from 'react';
import { Tool, ToolType, ConnectedAccount } from '../types';
// FIX: Replaced non-existent HiOutlineColorSwatch with HiOutlineSwatch.
import { HiOutlinePhoto, HiOutlineMegaphone, HiOutlineShare, HiOutlineUserGroup, HiOutlineUserCircle, HiOutlineSwatch, HiOutlineSparkles, HiOutlineIdentification, HiOutlineCreditCard, HiOutlineClipboardDocumentList, HiOutlineTicket } from 'react-icons/hi2';
import SocialConnect from './SocialConnect';

interface LandingPageProps {
  onSelectTool: (tool: ToolType) => void;
  connectedAccounts: ConnectedAccount[];
  onToggleConnect: (platform: string) => void;
}

const ToolCard: React.FC<{ tool: Tool; onClick: () => void }> = React.memo(({ tool, onClick }) => {
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
                {tool.enabled ? 'Launch Tool' : 'Coming Soon'}
            </button>
        </div>
    );
});

const LandingPage: React.FC<LandingPageProps> = ({ onSelectTool, connectedAccounts, onToggleConnect }) => {
    const tools: Tool[] = [
        { id: 'thumbnail', title: "YouTube Thumbnail Generator", description: "Create high-impact, click-worthy thumbnails by providing a headshot and a video description.", enabled: true },
        { id: 'advertisement', title: "Ad Banner Generator", description: "Instantly produce professional advertisement banners for your marketing campaigns and social media.", enabled: true },
        { id: 'social', title: "Social Media Post Generator", description: "Design engaging posts with both an image and a caption, tailored for platforms like Instagram, Facebook, and X.", enabled: true },
        { id: 'political', title: "Politician's Poster Maker", description: "Generate timely and impactful posters for political campaigns based on current events and topics.", enabled: true },
        { id: 'profile', title: "Profile Picture Generator", description: "Craft the perfect profile picture for LinkedIn, Instagram, or any platform using your headshot.", enabled: true },
        { id: 'logo', title: "AI Logo Generator", description: "Generate unique logos for your brand, with or without a mascot from a headshot.", enabled: true },
        { id: 'image-enhancer', title: "AI Image Enhancer", description: "Automatically improve image quality, lighting, and clarity with a single click. Upscale and refine.", enabled: true },
        { id: 'headshot-maker', title: "HQ Headshot Maker", description: "Turn any photo into a professional, studio-quality 1:1 headshot, perfect for any profile.", enabled: true },
        { id: 'passport-photo', title: "Passport Photo Maker", description: "Create official, compliant passport-size photos with background and outfit changes.", enabled: true },
        { id: 'visiting-card', title: "AI Visiting Card Maker", description: "Design professional business cards with your name, title, contact details, and optional logo.", enabled: true },
        { id: 'event-poster', title: "AI Event Poster Maker", description: "Turn your event photos into promotional posters by adding stylish text and branding.", enabled: true },
    ];

    return (
        <div className="animate-fade-in-up">
            <div className="mb-12">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-3">The AI Content Creation Suite</h2>
                <p className="text-base md:text-lg text-slate-400 max-w-3xl">One platform for all your creative needs. Generate stunning visuals for your brand, channel, or campaign in seconds.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {tools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} onClick={() => onSelectTool(tool.id)} />
                ))}
            </div>
            <div className="mt-16">
              <SocialConnect connectedAccounts={connectedAccounts} onToggleConnect={onToggleConnect} />
            </div>
        </div>
    );
};

export default LandingPage;