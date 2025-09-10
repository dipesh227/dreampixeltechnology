
import React, { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import LandingPage from './components/LandingPage';
import Header from './components/Header';
import { ViewType } from './types';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import MouseTrail from './components/MouseTrail';

// Lazy load all generator components
const ThumbnailGenerator = lazy(() => import('./components/ThumbnailGenerator').then(module => ({ default: module.ThumbnailGenerator })));
const PoliticiansPosterMaker = lazy(() => import('./components/PoliticiansPosterMaker').then(module => ({ default: module.PoliticiansPosterMaker })));
const AdBannerGenerator = lazy(() => import('./components/AdBannerGenerator').then(module => ({ default: module.AdBannerGenerator })));
const SocialMediaCampaignFactory = lazy(() => import('./components/SocialMediaCampaignFactory').then(module => ({ default: module.SocialMediaCampaignFactory })));
const VideoScriptWriter = lazy(() => import('./components/VideoScriptWriter').then(module => ({ default: module.VideoScriptWriter })));
const ProfileImageGenerator = lazy(() => import('./components/ProfileImageGenerator').then(module => ({ default: module.ProfileImageGenerator })));
const LogoGenerator = lazy(() => import('./components/LogoGenerator').then(module => ({ default: module.LogoGenerator })));
const ImageEnhancer = lazy(() => import('./components/ImageEnhancer').then(module => ({ default: module.ImageEnhancer })));
const HeadshotMaker = lazy(() => import('./components/HeadshotMaker').then(module => ({ default: module.HeadshotMaker })));
const PassportPhotoMaker = lazy(() => import('./components/PassportPhotoMaker').then(module => ({ default: module.PassportPhotoMaker })));
const VisitingCardMaker = lazy(() => import('./components/VisitingCardMaker').then(module => ({ default: module.VisitingCardMaker })));
const EventPosterMaker = lazy(() => import('./components/EventPosterMaker').then(module => ({ default: module.EventPosterMaker })));
const NewspaperCuttingMaker = lazy(() => import('./components/NewspaperCuttingMaker').then(module => ({ default: module.NewspaperCuttingMaker })));
const PhotoResizer = lazy(() => import('./components/PhotoResizer').then(module => ({ default: module.PhotoResizer })));
const SignatureResizer = lazy(() => import('./components/SignatureResizer').then(module => ({ default: module.SignatureResizer })));
const ThumbResizer = lazy(() => import('./components/ThumbResizer').then(module => ({ default: module.ThumbResizer })));


// Lazy load info pages
const AboutUs = lazy(() => import('./components/AboutUs').then(module => ({ default: module.AboutUs })));
const ContactUs = lazy(() => import('./components/ContactUs').then(module => ({ default: module.ContactUs })));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy').then(module => ({ default: module.PrivacyPolicy })));
const TermsOfService = lazy(() => import('./components/TermsOfService').then(module => ({ default: module.TermsOfService })));


const ToolLoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center py-40">
        <div className="relative w-24 h-24">
            <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-purple-500 rounded-full animate-spin"></div>
        </div>
    </div>
);

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('landing');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleGenerating = useCallback((generating: boolean) => {
    setIsGenerating(generating);
  }, []);

  const handleCreationGenerated = useCallback(() => {
    // Can be used to trigger a notification or update history count in the future
  }, []);


  useEffect(() => {
    const handleHashChange = () => {
        const hash = window.location.hash.substring(1);
        const validViews: ViewType[] = [
            'landing', 'about', 'contact', 'privacy', 'terms',
            'thumbnail', 'political', 'advertisement', 'social-campaign', 'video-script', 'profile', 'logo', 'image-enhancer', 
            'headshot-maker', 'passport-photo', 'visiting-card', 'event-poster', 'newspaper',
            'photo-resizer', 'signature-resizer', 'thumb-resizer'
        ];
        
        if (validViews.includes(hash as ViewType)) {
            setActiveView(hash as ViewType);
        } else {
            setActiveView('landing');
        }
    };

    window.addEventListener('hashchange', handleHashChange, false);
    handleHashChange();

    return () => {
        window.removeEventListener('hashchange', handleHashChange, false);
    };
}, []);

useEffect(() => {
    try {
        const currentHash = window.location.hash.substring(1);
        if (activeView === 'landing' || !activeView) {
            if (currentHash) window.location.hash = '';
        } else {
            if (currentHash !== activeView) window.location.hash = activeView;
        }
    } catch (e) {
        console.warn("Could not update URL hash, possibly in a sandboxed environment.");
    }
}, [activeView]);

  useEffect(() => {
    const viewTitles: Record<ViewType, string> = {
        landing: 'AI Content Creation Suite',
        thumbnail: 'YouTube Thumbnail Generator',
        'video-script': 'AI Video Script Writer',
        'social-campaign': 'Social Media Content Factory',
        advertisement: 'Ad Banner Generator',
        logo: 'AI Logo Generator',
        'event-poster': 'Event Poster Maker',
        newspaper: 'Newspaper Cutting Maker',
        'headshot-maker': 'HQ Headshot Maker',
        profile: 'Profile Picture Generator',
        'visiting-card': 'AI Visiting Card Maker',
        'passport-photo': 'Passport Photo Maker',
        'image-enhancer': 'AI Image Enhancer',
        political: 'Political Poster Maker',
        'photo-resizer': 'Photo Resizer for Exams',
        'signature-resizer': 'Signature Resizer for Exams',
        'thumb-resizer': 'Thumb Impression Resizer for Exams',
        about: 'About Us', contact: 'Contact Us', privacy: 'Privacy Policy', terms: 'Terms of Service',
    };
    
    const baseTitle = "DreamPixel";
    const viewTitle = viewTitles[activeView] || viewTitles['landing'];
    document.title = `${viewTitle} | ${baseTitle}`;
  }, [activeView]);

  const handleSetView = useCallback((view: ViewType) => {
    setActiveView(view);
    window.scrollTo(0, 0);
  }, []);

  const handleNavigateHome = useCallback(() => {
    handleSetView('landing');
  }, [handleSetView]);
  
  const handleOpenAuthModal = useCallback(() => setIsAuthModalOpen(true), []);
  const handleCloseAuthModal = useCallback(() => setIsAuthModalOpen(false), []);

  const renderActiveView = () => {
    const commonProps = {
        onNavigateHome: handleNavigateHome,
        onCreationGenerated: handleCreationGenerated,
        onGenerating: handleGenerating
    };
    switch(activeView) {
        case 'landing': return <LandingPage onSelectTool={handleSetView} />;
        
        // AI Tools
        case 'thumbnail': return <ThumbnailGenerator {...commonProps} onThumbnailGenerated={handleCreationGenerated} />;
        case 'political': return <PoliticiansPosterMaker {...commonProps} onPosterGenerated={handleCreationGenerated} />;
        case 'advertisement': return <AdBannerGenerator {...commonProps} onBannerGenerated={handleCreationGenerated} />;
        case 'social-campaign': return <SocialMediaCampaignFactory {...commonProps} connectedAccounts={[]} onToggleConnect={() => {}} />;
        case 'video-script': return <VideoScriptWriter {...commonProps} />;
        case 'profile': return <ProfileImageGenerator {...commonProps} />;
        case 'logo': return <LogoGenerator {...commonProps} />;
        case 'image-enhancer': return <ImageEnhancer {...commonProps} />;
        case 'headshot-maker': return <HeadshotMaker {...commonProps} />;
        case 'passport-photo': return <PassportPhotoMaker {...commonProps} />;
        case 'visiting-card': return <VisitingCardMaker {...commonProps} />;
        case 'event-poster': return <EventPosterMaker {...commonProps} />;
        case 'newspaper': return <NewspaperCuttingMaker {...commonProps} />;
        case 'photo-resizer': return <PhotoResizer onNavigateHome={handleNavigateHome} />;
        case 'signature-resizer': return <SignatureResizer onNavigateHome={handleNavigateHome} />;
        case 'thumb-resizer': return <ThumbResizer onNavigateHome={handleNavigateHome} />;

        // Info Pages
        case 'about': return <AboutUs onNavigateHome={handleNavigateHome} />;
        case 'contact': return <ContactUs onNavigateHome={handleNavigateHome} />;
        case 'privacy': return <PrivacyPolicy onNavigateHome={handleNavigateHome} />;
        case 'terms': return <TermsOfService onNavigateHome={handleNavigateHome} />;
        
        default: return <LandingPage onSelectTool={handleSetView} />;
    }
  };

  return (
    <div className={`stars-bg text-slate-300 min-h-screen font-sans flex flex-col ${isGenerating ? 'generating-bg' : ''}`}>
        <MouseTrail />
        <Header 
            onNavigateHome={handleNavigateHome}
            onLogin={handleOpenAuthModal}
        />
        <main className="container mx-auto py-8 px-4 flex-grow">
            <Suspense fallback={<ToolLoadingSpinner />}>
                {renderActiveView()}
            </Suspense>
        </main>
        <Footer onNavigate={handleSetView} />
      {isAuthModalOpen && <AuthModal onClose={handleCloseAuthModal} />}
    </div>
  );
};

export default App;