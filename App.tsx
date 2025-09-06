import React, { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import LandingPage from './components/LandingPage';
import Header from './components/Header';
import { ToolType, ValidationStatus, ConnectedAccount } from './types';
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

const ToolLoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center py-40">
        <div className="relative w-24 h-24">
            <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-purple-400 rounded-full animate-spin"></div>
        </div>
    </div>
);

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolType | 'landing'>('landing');
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
    const toolTitles: Record<ToolType | 'landing', string> = {
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
        'social-campaign': 'AI Social Media Content Factory'
    };
    
    const baseTitle = "DreamPixel Technology";
    const toolTitle = toolTitles[activeTool];
    document.title = `${toolTitle} | ${baseTitle}`;
  }, [activeTool]);

  const handleSelectTool = useCallback((tool: ToolType) => {
    setActiveTool(tool);
  }, []);

  const handleNavigateHome = useCallback(() => {
    setActiveTool('landing');
  }, []);

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

  const renderActiveTool = () => {
    switch(activeTool) {
        case 'landing':
            return (
                <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
                    <div className="lg:col-span-2">
                    <LandingPage onSelectTool={handleSelectTool} connectedAccounts={connectedAccounts} onToggleConnect={handleToggleConnect} />
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
        default: return <LandingPage onSelectTool={handleSelectTool} connectedAccounts={connectedAccounts} onToggleConnect={handleToggleConnect} />;
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
      <main className="container mx-auto px-4 py-8">
        <Suspense fallback={<ToolLoadingSpinner />}>
            {renderActiveTool()}
        </Suspense>
      </main>
      <Footer dbStatus={dbStatus} dbError={dbError} connectedAccounts={connectedAccounts} />
      {isFeedbackOpen && <FeedbackModal onClose={handleCloseFeedback} />}
      {isAuthModalOpen && <AuthModal onClose={handleCloseAuthModal} />}
    </div>
  );
};

export default App;