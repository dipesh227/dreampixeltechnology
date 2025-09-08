import React, { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import LandingPage from './components/LandingPage';
import Header from './components/Header';
import { ToolType, ValidationStatus, ConnectedAccount, ViewType } from './types';
import HistorySidebar from './components/HistorySidebar';
import Footer from './components/Footer';
import FeedbackModal from './components/FeedbackModal';
import AuthModal from './components/AuthModal';
import * as aiService from './services/aiService';
import MouseTrail from './components/MouseTrail';
import { useAuth } from './context/AuthContext';
import { checkDatabaseConnection } from './services/supabaseClient';

// Lazy load components to improve initial page load time. All components use named exports now.
const ThumbnailGenerator = lazy(() => import('./components/ThumbnailGenerator').then(module => ({ default: module.ThumbnailGenerator })));
const PoliticiansPosterMaker = lazy(() => import('./components/PoliticiansPosterMaker').then(module => ({ default: module.PoliticiansPosterMaker })));
const AdBannerGenerator = lazy(() => import('./components/AdBannerGenerator').then(module => ({ default: module.AdBannerGenerator })));
const ProfileImageGenerator = lazy(() => import('./components/ProfileImageGenerator').then(module => ({ default: module.ProfileImageGenerator })));
const LogoGenerator = lazy(() => import('./components/LogoGenerator').then(module => ({ default: module.LogoGenerator })));
const ImageEnhancer = lazy(() => import('./components/ImageEnhancer').then(module => ({ default: module.ImageEnhancer })));
const HeadshotMaker = lazy(() => import('./components/HeadshotMaker').then(module => ({ default: module.HeadshotMaker })));
const PassportPhotoMaker = lazy(() => import('./components/PassportPhotoMaker').then(module => ({ default: module.PassportPhotoMaker })));
const VisitingCardMaker = lazy(() => import('./components/VisitingCardMaker').then(module => ({ default: module.VisitingCardMaker })));
const EventPosterMaker = lazy(() => import('./components/EventPosterMaker').then(module => ({ default: module.EventPosterMaker })));
const SocialMediaCampaignFactory = lazy(() => import('./components/SocialMediaCampaignFactory').then(module => ({ default: module.SocialMediaCampaignFactory })));
const NewspaperCuttingMaker = lazy(() => import('./components/NewspaperCuttingMaker').then(module => ({ default: module.NewspaperCuttingMaker })));
const AboutUs = lazy(() => import('./components/AboutUs').then(module => ({ default: module.AboutUs })));
const ContactUs = lazy(() => import('./components/ContactUs').then(module => ({ default: module.ContactUs })));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy').then(module => ({ default: module.PrivacyPolicy })));
const TermsOfService = lazy(() => import('./components/TermsOfService').then(module => ({ default: module.TermsOfService })));

const ToolLoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center py-40">
        <div className="relative w-24 h-24">
            <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-purple-400 rounded-full animate-spin"></div>
        </div>
    </div>
);

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('landing');
  const [historyUpdated, setHistoryUpdated] = useState(0);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [apiKeyStatus, setApiKeyStatus] = useState<ValidationStatus>('validating');
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [dbStatus, setDbStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [dbError, setDbError] = useState<string | null>(null);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);

  const { session } = useAuth();
  
  // Effect to handle URL hash for navigation
  useEffect(() => {
    const handleHashChange = () => {
        const hash = window.location.hash.substring(1);
        const validViews: ViewType[] = [
            'landing', 'about', 'contact', 'privacy', 'terms', 
            'thumbnail', 'advertisement', 'political', 'profile', 'logo', 
            'image-enhancer', 'headshot-maker', 'passport-photo', 
            'visiting-card', 'event-poster', 'social-campaign', 'newspaper'
        ];
        
        if (validViews.includes(hash as ViewType)) {
            setActiveView(hash as ViewType);
        } else {
            setActiveView('landing');
        }
    };

    window.addEventListener('hashchange', handleHashChange, false);
    // Set initial view from hash
    handleHashChange();

    return () => {
        window.removeEventListener('hashchange', handleHashChange, false);
    };
}, []);

// Effect to update URL hash when activeView changes, preventing crashes in sandboxed environments.
useEffect(() => {
    const currentHash = window.location.hash.substring(1);

    if (activeView === 'landing' || !activeView) {
        // If on the landing page and there's a hash, clear it safely.
        // This avoids using history.pushState which can fail in certain (e.g., blob:) environments.
        if (currentHash) {
            window.location.hash = '';
        }
    } else {
        // Only update the hash if it's different to prevent redundant history entries and loops.
        if (currentHash !== activeView) {
            window.location.hash = activeView;
        }
    }
}, [activeView]);


  // This effect runs ONLY ONCE when the app first loads to check static connections.
  useEffect(() => {
    const checkInitialConnections = async () => {
        setApiKeyStatus('validating');
        setApiKeyError(null);
        setDbStatus('connecting');
        setDbError(null);

        // Check API Status - this is based on environment config, not session.
        try {
            const apiResult = await aiService.checkCurrentApiStatus();
            setApiKeyStatus(apiResult.status);
            if (apiResult.error) {
                setApiKeyError(apiResult.error);
            }
        } catch (error: any) {
            console.error("Failed to check API status:", error);
            setApiKeyStatus('invalid');
            setApiKeyError(error.message || 'An unknown error occurred during API validation.');
        }

        // Check Database Connection - this is also based on config, not session.
        try {
            const dbResult = await checkDatabaseConnection();
            setDbStatus(dbResult.isConnected ? 'connected' : 'error');
             if (dbResult.error) {
                setDbError(dbResult.error);
            }
        } catch (error: any) {
             console.error("Failed to check DB status:", error);
             setDbStatus('error');
             setDbError(error.message || 'An unknown error occurred during DB connection check.');
        }
    };

    checkInitialConnections();
  }, []); // Empty dependency array ensures this runs only once on mount.
  
  useEffect(() => {
    const viewTitles: Record<ViewType, string> = {
        landing: 'AI Content Creation Suite',
        thumbnail: 'YouTube Thumbnail Generator',
        advertisement: 'Ad Banner Generator',
        political: 'Politician\'s Poster Maker',
        profile: 'Profile Picture Generator',
        logo: 'AI Logo Generator',
        'image-enhancer': 'AI Image Enhancer',
        'headshot-maker': 'HQ Headshot Maker',
        'passport-photo': 'Passport Photo Maker',
        'visiting-card': 'AI Visiting Card Maker',
        'event-poster': 'AI Event Poster Maker',
        'social-campaign': 'AI Social Media Content Factory',
        newspaper: 'AI Newspaper Cutting Maker',
        about: 'About Us',
        contact: 'Contact Us',
        privacy: 'Privacy Policy',
        terms: 'Terms of Service',
    };
    
    const baseTitle = "DreamPixel Technology";
    const viewTitle = viewTitles[activeView] || viewTitles['landing'];
    document.title = `${viewTitle} | ${baseTitle}`;
  }, [activeView]);

  const handleSetView = useCallback((view: ViewType) => {
    setActiveView(view);
    window.scrollTo(0, 0); // Scroll to top on navigation
  }, []);

  const handleNavigateHome = useCallback(() => {
    handleSetView('landing');
  }, [handleSetView]);

  const onCreationGenerated = useCallback(() => {
    setHistoryUpdated(count => count + 1);
  }, []);

  const handleOpenFeedback = useCallback(() => setIsFeedbackOpen(true), []);
  const handleCloseFeedback = useCallback(() => setIsFeedbackOpen(false), []);
  
  const handleOpenAuthModal = useCallback(() => setIsAuthModalOpen(true), []);
  const handleCloseAuthModal = useCallback(() => setIsAuthModalOpen(false), []);

  const handleGeneratingStatusChange = useCallback((status: boolean) => {
    setIsGenerating(status);
  }, []);

  const handleToggleConnect = useCallback((platform: string) => {
    setConnectedAccounts(prev => {
      const isConnected = prev.some(acc => acc.platform === platform);
      if (isConnected) {
        return prev.filter(acc => acc.platform !== platform);
      } else {
        // Storing the platform name fulfills the placeholder requirement.
        return [...prev, { platform }];
      }
    });
  }, []);

  const renderActiveView = () => {
    switch(activeView) {
        case 'landing':
            return (
                <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
                    <div className="lg:col-span-2">
                    <LandingPage onSelectTool={handleSetView} connectedAccounts={connectedAccounts} onToggleConnect={handleToggleConnect} />
                    </div>
                    <div className="mt-8 lg:mt-0">
                    <HistorySidebar key={historyUpdated} />
                    </div>
                </div>
            );
        case 'thumbnail': return <ThumbnailGenerator onNavigateHome={handleNavigateHome} onThumbnailGenerated={onCreationGenerated} onGenerating={handleGeneratingStatusChange} />;
        case 'political': return <PoliticiansPosterMaker onNavigateHome={handleNavigateHome} onPosterGenerated={onCreationGenerated} onGenerating={handleGeneratingStatusChange} />;
        case 'advertisement': return <AdBannerGenerator onNavigateHome={handleNavigateHome} onBannerGenerated={onCreationGenerated} onGenerating={handleGeneratingStatusChange} />;
        case 'profile': return <ProfileImageGenerator onNavigateHome={handleNavigateHome} onCreationGenerated={onCreationGenerated} onGenerating={handleGeneratingStatusChange} />;
        case 'logo': return <LogoGenerator onNavigateHome={handleNavigateHome} onCreationGenerated={onCreationGenerated} onGenerating={handleGeneratingStatusChange} />;
        case 'image-enhancer': return <ImageEnhancer onNavigateHome={handleNavigateHome} onCreationGenerated={onCreationGenerated} onGenerating={handleGeneratingStatusChange} />;
        case 'headshot-maker': return <HeadshotMaker onNavigateHome={handleNavigateHome} onCreationGenerated={onCreationGenerated} onGenerating={handleGeneratingStatusChange} />;
        case 'passport-photo': return <PassportPhotoMaker onNavigateHome={handleNavigateHome} onCreationGenerated={onCreationGenerated} onGenerating={handleGeneratingStatusChange} />;
        case 'visiting-card': return <VisitingCardMaker onNavigateHome={handleNavigateHome} onCreationGenerated={onCreationGenerated} onGenerating={handleGeneratingStatusChange} />;
        case 'event-poster': return <EventPosterMaker onNavigateHome={handleNavigateHome} onCreationGenerated={onCreationGenerated} onGenerating={handleGeneratingStatusChange} />;
        case 'social-campaign': return <SocialMediaCampaignFactory onNavigateHome={handleNavigateHome} onCreationGenerated={onCreationGenerated} onGenerating={handleGeneratingStatusChange} connectedAccounts={connectedAccounts} onToggleConnect={handleToggleConnect} />;
        case 'newspaper': return <NewspaperCuttingMaker onNavigateHome={handleNavigateHome} onCreationGenerated={onCreationGenerated} onGenerating={handleGeneratingStatusChange} />;
        case 'about': return <AboutUs onNavigateHome={handleNavigateHome} />;
        case 'contact': return <ContactUs onNavigateHome={handleNavigateHome} />;
        case 'privacy': return <PrivacyPolicy onNavigateHome={handleNavigateHome} />;
        case 'terms': return <TermsOfService onNavigateHome={handleNavigateHome} />;
        default: return <LandingPage onSelectTool={handleSetView} connectedAccounts={connectedAccounts} onToggleConnect={handleToggleConnect} />;
    }
  }

  return (
    <div className={`min-h-screen animated-bg ${isGenerating ? 'generating-active' : ''}`}>
      <MouseTrail />
      <Header 
        onNavigateHome={handleNavigateHome} 
        onOpenFeedback={handleOpenFeedback} 
        apiKeyStatus={apiKeyStatus} 
        apiKeyError={apiKeyError}
        onLogin={handleOpenAuthModal}
      />
      <main className="container mx-auto px-4 py-4 sm:py-8">
        <Suspense fallback={<ToolLoadingSpinner />}>
            {renderActiveView()}
        </Suspense>
      </main>
      <Footer dbStatus={dbStatus} dbError={dbError} connectedAccounts={connectedAccounts} onNavigate={handleSetView} />
      {isFeedbackOpen && <FeedbackModal onClose={handleCloseFeedback} />}
      {isAuthModalOpen && <AuthModal onClose={handleCloseAuthModal} />}
    </div>
  );
};

export default App;