
import React from 'react';
import { ToolType } from '../types';
import { 
    HiOutlinePlay, HiOutlineDocumentText, HiOutlineMegaphone, 
    HiOutlineTicket, HiOutlineNewspaper, HiOutlineBriefcase, 
    HiOutlineUserCircle, HiOutlineIdentification, HiOutlineCamera, 
    HiOutlineSparkles, HiOutlineFlag, HiOutlinePhoto, 
    HiOutlinePencil, HiOutlineHandThumbUp, HiBuildingStorefront
} from 'react-icons/hi2';
import { useLocalization } from '../hooks/useLocalization';

interface LandingPageProps {
  onSelectTool: (tool: ToolType) => void;
}

interface Tool {
  id: ToolType;
  titleKey: string;
  descriptionKey: string;
  icon: React.ElementType;
  isPopular?: boolean;
}

interface ToolCategory {
  titleKey: string;
  tools: Tool[];
  color: string;
}

const toolCategories: ToolCategory[] = [
  {
    titleKey: 'landing.categoryCreators',
    color: 'text-red-400',
    tools: [
      { id: 'thumbnail', titleKey: 'landing.toolThumbnailTitle', descriptionKey: 'landing.toolThumbnailDesc', icon: HiOutlinePlay, isPopular: true },
      { id: 'video-script', titleKey: 'landing.toolVideoScriptTitle', descriptionKey: 'landing.toolVideoScriptDesc', icon: HiOutlineDocumentText },
      { id: 'social-campaign', titleKey: 'landing.toolSocialCampaignTitle', descriptionKey: 'landing.toolSocialCampaignDesc', icon: HiOutlineMegaphone },
    ],
  },
  {
    titleKey: 'landing.categoryMarketing',
    color: 'text-amber-400',
    tools: [
      { id: 'advertisement', titleKey: 'landing.toolAdBannerTitle', descriptionKey: 'landing.toolAdBannerDesc', icon: HiBuildingStorefront, isPopular: true },
      { id: 'logo', titleKey: 'landing.toolLogoTitle', descriptionKey: 'landing.toolLogoDesc', icon: HiOutlineSparkles },
      { id: 'event-poster', titleKey: 'landing.toolEventPosterTitle', descriptionKey: 'landing.toolEventPosterDesc', icon: HiOutlineTicket },
      { id: 'newspaper', titleKey: 'landing.toolNewspaperTitle', descriptionKey: 'landing.toolNewspaperDesc', icon: HiOutlineNewspaper },
    ],
  },
  {
    titleKey: 'landing.categoryProfessionals',
    color: 'text-sky-400',
    tools: [
        { id: 'headshot-maker', titleKey: 'landing.toolHeadshotTitle', descriptionKey: 'landing.toolHeadshotDesc', icon: HiOutlineBriefcase, isPopular: true },
        { id: 'profile', titleKey: 'landing.toolProfilePicTitle', descriptionKey: 'landing.toolProfilePicDesc', icon: HiOutlineUserCircle },
        { id: 'visiting-card', titleKey: 'landing.toolVisitingCardTitle', descriptionKey: 'landing.toolVisitingCardDesc', icon: HiOutlineIdentification },
        { id: 'passport-photo', titleKey: 'landing.toolPassportPhotoTitle', descriptionKey: 'landing.toolPassportPhotoDesc', icon: HiOutlineCamera },
    ],
  },
  {
    titleKey: 'landing.categoryUtilities',
    color: 'text-emerald-400',
    tools: [
      { id: 'image-enhancer', titleKey: 'landing.toolImageEnhancerTitle', descriptionKey: 'landing.toolImageEnhancerDesc', icon: HiOutlineSparkles },
      { id: 'political', titleKey: 'landing.toolPoliticalPosterTitle', descriptionKey: 'landing.toolPoliticalPosterDesc', icon: HiOutlineFlag },
    ],
  },
  {
    titleKey: 'landing.categoryApplicants',
    color: 'text-fuchsia-400',
    tools: [
      { id: 'photo-resizer', titleKey: 'landing.toolPhotoResizerTitle', descriptionKey: 'landing.toolPhotoResizerDesc', icon: HiOutlinePhoto },
      { id: 'signature-resizer', titleKey: 'landing.toolSignatureResizerTitle', descriptionKey: 'landing.toolSignatureResizerDesc', icon: HiOutlinePencil },
      { id: 'thumb-resizer', titleKey: 'landing.toolThumbResizerTitle', descriptionKey: 'landing.toolThumbResizerDesc', icon: HiOutlineHandThumbUp },
    ],
  },
];

const LandingPage: React.FC<LandingPageProps> = ({ onSelectTool }) => {
    const { t } = useLocalization();

    return (
        <div className="animate-fade-in space-y-16">
            <div className="text-center max-w-4xl mx-auto pt-8">
                <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight tracking-tight">
                    {t('landing.title1')} <span className="gradient-text">{t('landing.title2')}</span>
                </h1>
                <p className="mt-6 text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
                    {t('landing.subtitle')}
                </p>
            </div>
            <div className="space-y-12">
                {toolCategories.map((category) => (
                    <div key={category.titleKey}>
                        <h2 className="text-2xl font-bold text-white mb-6 tracking-wide border-l-4 border-purple-500 pl-4">
                            {t(category.titleKey)}
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {category.tools.map((tool) => (
                                <button
                                    key={tool.id}
                                    onClick={() => onSelectTool(tool.id)}
                                    className="group w-full text-left p-6 rounded-xl bg-slate-900/60 border border-slate-800 transition-all duration-300 hover:border-purple-500/50 hover:bg-slate-800/80 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-900/30"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`p-2 bg-slate-800 rounded-lg transition-colors duration-300 group-hover:bg-slate-700`}>
                                            <tool.icon className={`w-8 h-8 ${category.color} transition-transform duration-300 group-hover:scale-110`} />
                                        </div>
                                        {tool.isPopular && <span className="text-xs font-semibold bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">{t('landing.popular')}</span>}
                                    </div>
                                    <h3 className="font-bold text-white text-lg">{t(tool.titleKey)}</h3>
                                    <p className="text-sm text-slate-400 mt-1">{t(tool.descriptionKey)}</p>
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
