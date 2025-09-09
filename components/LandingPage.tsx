import React from 'react';
import { Tool, ToolType, ConnectedAccount } from '../types';
import { 
    HiOutlinePhoto, HiOutlineMegaphone, HiOutlineUserGroup, HiOutlineUserCircle, HiOutlineSwatch, 
    HiOutlineSparkles, HiOutlineIdentification, HiOutlineCreditCard, HiOutlineClipboardDocumentList, 
    HiOutlineTicket, HiOutlineBuildingStorefront, HiOutlineNewspaper,
    // Added for new sections
    HiOutlineCursorArrowRays, HiOutlineDocumentText, HiOutlinePaintBrush, HiOutlineClock,
    // Added for new resizer tools
    HiOutlineScissors, HiOutlinePencilSquare, HiOutlineHandThumbUp
} from 'react-icons/hi2';
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
        political: { icon: HiOutlineUserGroup, gradient: 'from-amber-500 to-orange-500' },
        profile: { icon: HiOutlineUserCircle, gradient: 'from-teal-500 to-emerald-500' },
        logo: { icon: HiOutlineSwatch, gradient: 'from-fuchsia-500 to-purple-500' },
        'image-enhancer': { icon: HiOutlineSparkles, gradient: 'from-yellow-400 to-amber-500' },
        'headshot-maker': { icon: HiOutlineIdentification, gradient: 'from-cyan-400 to-sky-500' },
        'passport-photo': { icon: HiOutlineCreditCard, gradient: 'from-blue-500 to-indigo-600' },
        'visiting-card': { icon: HiOutlineClipboardDocumentList, gradient: 'from-slate-400 to-slate-600' },
        'event-poster': { icon: HiOutlineTicket, gradient: 'from-rose-400 to-red-500' },
        'social-campaign': { icon: HiOutlineBuildingStorefront, gradient: 'from-indigo-500 to-violet-600' },
        newspaper: { icon: HiOutlineNewspaper, gradient: 'from-stone-500 to-gray-600'},
        'photo-resizer': { icon: HiOutlineScissors, gradient: 'from-green-500 to-emerald-600' },
        'signature-resizer': { icon: HiOutlinePencilSquare, gradient: 'from-sky-500 to-cyan-600' },
        'thumb-resizer': { icon: HiOutlineHandThumbUp, gradient: 'from-gray-500 to-slate-600' },
    };
    const { icon: Icon, gradient } = icons[tool.id];

    return (
        <div
            className={`
                flex flex-col p-6 rounded-2xl h-full tool-card
                ${!tool.enabled ? 'opacity-50' : ''}
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
                className="w-full mt-4 px-4 py-2 text-sm font-semibold rounded-lg bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700/70 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
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
        { id: 'political', title: "Politician's Poster Maker", description: "Generate timely and impactful posters for political campaigns based on current events and topics.", enabled: true },
        { id: 'social-campaign', title: "AI Social Media Content Factory", description: "Generate a full campaign, a single post, or content based on real-time trends, all from one powerful tool.", enabled: true },
        { id: 'profile', title: "Profile Picture Generator", description: "Craft the perfect profile picture for LinkedIn, Instagram, or any platform using your headshot.", enabled: true },
        { id: 'logo', title: "AI Logo Generator", description: "Generate unique logos for your brand, with or without a mascot from a headshot.", enabled: true },
        { id: 'image-enhancer', title: "AI Image Enhancer", description: "Automatically improve image quality, lighting, and clarity with a single click. Upscale and refine.", enabled: true },
        { id: 'headshot-maker', title: "HQ Headshot Maker", description: "Turn any photo into a professional, studio-quality 1:1 headshot, perfect for any profile.", enabled: true },
        { id: 'passport-photo', title: "Passport Photo Maker", description: "Create official, compliant passport-size photos with background and outfit changes.", enabled: true },
        { id: 'visiting-card', title: "AI Visiting Card Maker", description: "Design professional business cards with your name, title, contact details, and optional logo.", enabled: true },
        { id: 'event-poster', title: "AI Event Poster Maker", description: "Turn your event photos into promotional posters by adding stylish text and branding.", enabled: true },
        { id: 'newspaper', title: "Newspaper Cutting Maker", description: "Create realistic newspaper clippings from your photos and text for fun or announcements.", enabled: true },
        { id: 'photo-resizer', title: "Photo Resizer", description: "Crop and resize photos to exact pixel dimensions (150x200) and file size (10-50KB) for applications.", enabled: true },
        { id: 'signature-resizer', title: "Signature Resizer", description: "Crop and resize signatures to exact dimensions (150x100) and file size (5-20KB) for online forms.", enabled: true },
        { id: 'thumb-resizer', title: "Thumb Impression Resizer", description: "Crop and resize thumb impressions to exact dimensions (150x100) and file size (5-20KB).", enabled: true },
    ];
    
     const features = [
        {
            icon: HiOutlineSparkles,
            title: "Generate Engaging Content with Advanced AI",
            description: "Go from a simple idea to a finished visual in seconds. Our AI, powered by Google Gemini, crafts stunning, professional-grade assets tailored to your needs.",
            gradient: "from-purple-500 to-indigo-500"
        },
        {
            icon: HiOutlinePaintBrush,
            title: "Effortless Visual Design Powered by AI",
            description: "No design skills needed. Just provide your text and images, and let our AI handle the layout, branding, and creative composition for you.",
            gradient: "from-pink-500 to-rose-500"
        },
        {
            icon: HiOutlineClock,
            title: "Smart Social Media Scheduling & Automation",
            description: "Automate your content creation with our Social Media Factory. Generate full campaigns, single posts, or capitalize on trends with just a few clicks.",
            gradient: "from-amber-500 to-orange-500"
        }
    ];

    return (
        <div className="animate-fade-in-up space-y-24">
             {/* Hero Section */}
            <section className="text-center pt-8">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-3">DreamPixel Technology: Your Complete AI Content & Social Media Automation Suite</h1>
                <h2 className="text-base md:text-lg text-slate-400 max-w-3xl mx-auto">Unlock your creative potential. Effortlessly generate high-quality content, design stunning visuals, and streamline your social media strategy with our free, all-in-one AI platform.</h2>
            </section>
            
             {/* How It Works Section */}
            <section>
                <h2 className="text-3xl font-bold text-white text-center mb-12">How Our AI Suite Works: A Step-by-Step Guide</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="flex flex-col items-center">
                        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-full mb-4">
                            <HiOutlineCursorArrowRays className="w-10 h-10 text-sky-400"/>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">1. Select a Tool</h3>
                        <p className="text-slate-400">Choose from our suite of 12+ specialized AI content generators.</p>
                    </div>
                    <div className="flex flex-col items-center">
                         <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-full mb-4">
                            <HiOutlineDocumentText className="w-10 h-10 text-purple-400"/>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">2. Provide Your Input</h3>
                        <p className="text-slate-400">Add your text, upload images, and select a style for the AI.</p>
                    </div>
                    <div className="flex flex-col items-center">
                         <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-full mb-4">
                            <HiOutlineSparkles className="w-10 h-10 text-pink-400"/>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">3. Generate & Download</h3>
                        <p className="text-slate-400">Let the AI create your content, then download your finished asset.</p>
                    </div>
                </div>
            </section>

             {/* Features Section */}
            <section>
                <h2 className="text-3xl font-bold text-white text-center mb-12">Why DreamPixel is the Best Free AI Tool</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="p-6 bg-slate-900/60 border border-slate-700/50 rounded-xl tool-card">
                             <div className={`mb-4 p-3 bg-gradient-to-br ${feature.gradient} rounded-lg inline-block shadow-lg`}>
                                <feature.icon className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                            <p className="text-slate-400 text-sm">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>
            
            {/* Tools Section */}
            <section>
                <h2 className="text-3xl font-bold text-white text-center mb-12">Explore Our Creation Suite</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {tools.map((tool) => (
                        <ToolCard key={tool.id} tool={tool} onClick={() => onSelectTool(tool.id)} />
                    ))}
                </div>
            </section>

             {/* Social Connect Section */}
            <section className="p-8 bg-slate-900/60 backdrop-blur-lg border border-slate-700/50 rounded-xl text-center">
              <h2 className="text-3xl font-bold text-white text-center mb-6">Connect Your Social Accounts</h2>
              <SocialConnect connectedAccounts={connectedAccounts} onToggleConnect={onToggleConnect} />
            </section>
        </div>
    );
};

export default LandingPage;