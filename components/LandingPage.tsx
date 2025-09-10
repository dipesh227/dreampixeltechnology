
import React from 'react';
import { ToolType } from '../types';
import { 
    HiOutlinePlay, HiOutlineDocumentText, HiOutlineMegaphone, 
    HiOutlineTicket, HiOutlineNewspaper, HiOutlineBriefcase, 
    HiOutlineUserCircle, HiOutlineIdentification, HiOutlineCamera, 
    HiOutlineSparkles, HiOutlineFlag, HiOutlinePhoto, 
    HiOutlinePencil, HiOutlineHandThumbUp, HiBuildingStorefront
} from 'react-icons/hi2';

interface LandingPageProps {
  onSelectTool: (tool: ToolType) => void;
}

interface Tool {
  id: ToolType;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  isPopular?: boolean;
}

interface ToolCategory {
  title: string;
  tools: Tool[];
}

const toolCategories: ToolCategory[] = [
  {
    title: 'For Content Creators',
    tools: [
      { id: 'thumbnail', title: 'Thumbnail Generator', description: 'Create viral YouTube thumbnails.', icon: HiOutlinePlay, color: 'text-red-400', isPopular: true },
      { id: 'video-script', title: 'AI Video Script Writer', description: 'Generate scripts for short-form videos.', icon: HiOutlineDocumentText, color: 'text-red-400' },
      { id: 'social-campaign', title: 'Content Factory', description: 'Run full social media campaigns.', icon: HiOutlineMegaphone, color: 'text-red-400' },
    ],
  },
  {
    title: 'For Marketing',
    tools: [
      { id: 'advertisement', title: 'Ad Banner Generator', description: 'Design professional ad banners.', icon: HiBuildingStorefront, color: 'text-amber-400', isPopular: true },
      { id: 'logo', title: 'AI Logo Generator', description: 'Create a unique brand logo.', icon: HiOutlineSparkles, color: 'text-amber-400' },
      { id: 'event-poster', title: 'Event Poster Maker', description: 'Turn photos into event posters.', icon: HiOutlineTicket, color: 'text-amber-400' },
      { id: 'newspaper', title: 'Newspaper Cutting Maker', description: 'Make realistic newspaper clippings.', icon: HiOutlineNewspaper, color: 'text-amber-400' },
    ],
  },
  {
    title: 'For Professionals',
    tools: [
        { id: 'headshot-maker', title: 'HQ Headshot Maker', description: 'Generate professional headshots.', icon: HiOutlineBriefcase, color: 'text-sky-400', isPopular: true },
        { id: 'profile', title: 'Profile Picture Generator', description: 'Create the perfect profile picture.', icon: HiOutlineUserCircle, color: 'text-sky-400' },
        { id: 'visiting-card', title: 'AI Visiting Card Maker', description: 'Design professional business cards.', icon: HiOutlineIdentification, color: 'text-sky-400' },
        { id: 'passport-photo', title: 'Passport Photo Maker', description: 'Create official passport photos.', icon: HiOutlineCamera, color: 'text-sky-400' },
    ],
  },
  {
    title: 'Utilities & Campaigns',
    tools: [
      { id: 'image-enhancer', title: 'AI Image Enhancer', description: '10x the quality of any image.', icon: HiOutlineSparkles, color: 'text-emerald-400' },
      { id: 'political', title: 'Political Poster Maker', description: 'Design posters for campaigns.', icon: HiOutlineFlag, color: 'text-emerald-400' },
    ],
  },
  {
    title: 'For Exam Applicants',
    tools: [
      { id: 'photo-resizer', title: 'Photo Resizer', description: 'Resize photos for exam forms.', icon: HiOutlinePhoto, color: 'text-fuchsia-400' },
      { id: 'signature-resizer', title: 'Signature Resizer', description: 'Resize signatures for forms.', icon: HiOutlinePencil, color: 'text-fuchsia-400' },
      { id: 'thumb-resizer', title: 'Thumb Resizer', description: 'Resize thumb impressions.', icon: HiOutlineHandThumbUp, color: 'text-fuchsia-400' },
    ],
  },
];

const LandingPage: React.FC<LandingPageProps> = ({ onSelectTool }) => {
    return (
        <div className="animate-fade-in space-y-12">
            <div className="text-center max-w-3xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
                    Your Vision, <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">Amplified by AI</span>
                </h1>
                <p className="mt-4 text-lg text-slate-400">
                    The all-in-one content creation suite powered by Google Gemini. Go from idea to stunning visuals in seconds.
                </p>
            </div>
            <div className="space-y-10">
                {toolCategories.map((category) => (
                    <div key={category.title}>
                        <h2 className="text-xl font-bold text-white mb-4 tracking-wide">
                            {category.title}
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {category.tools.map((tool) => (
                                <button
                                    key={tool.id}
                                    onClick={() => onSelectTool(tool.id)}
                                    className="w-full text-left p-6 rounded-xl tool-link bg-slate-900/60 border border-slate-700/50"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className={`p-2 bg-slate-800 rounded-lg`}>
                                            <tool.icon className={`w-7 h-7 ${tool.color}`} />
                                        </div>
                                        {tool.isPopular && <span className="text-xs font-semibold bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">Popular</span>}
                                    </div>
                                    <h3 className="font-bold text-white">{tool.title}</h3>
                                    <p className="text-sm text-slate-400 mt-1">{tool.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LandingPage;
