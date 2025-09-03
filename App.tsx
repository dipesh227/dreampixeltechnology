
import React, { useState, useCallback, useEffect } from 'react';
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

// Eager load components to fix potential module resolution issues with lazy loading.
import ThumbnailGenerator from './components/ThumbnailGenerator';
import PoliticiansPosterMaker from './components/PoliticiansPosterMaker';
import AdBannerGenerator from './components/AdBannerGenerator';
import SocialMediaPostGenerator from './components/SocialMediaPostGenerator';
import ProfileImageGenerator from './components/ProfileImageGenerator';
import LogoGenerator from './components/LogoGenerator';
import ImageEnhancer from './components/ImageEnhancer';
import HeadshotMaker from './components/HeadshotMaker';
import PassportPhotoMaker from './components/PassportPhotoMaker';
import VisitingCardMaker from './components/VisitingCardMaker';
import EventPosterMaker from './components/EventPosterMaker';

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
    const baseTitle = "DreamPixel Technology";
    const toolTitles: { [key: string]: string } = {
        'thumbnail': "YouTube Thumbnail Generator",
        'advertisement': "Ad Banner Generator",
        'social': "Social Media Post Generator",
        'political': "Politician's Poster Maker",
        'profile': "Profile Picture Generator",
        'logo': "AI Logo Generator",
        'image-enhancer': "AI Image Enhancer",
        'headshot-maker': "HQ Headshot Maker",
        'passport-photo': "Passport Photo Maker",
        'visiting-card': "AI Visiting Card Maker",
        'event-poster': "AI Event Poster Maker",
    };

    const toolTitle = activeTool === 'landing' ? "AI Content Creation Suite" : toolTitles[activeTool] || "Generator";
    
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
        {activeTool === 'landing' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
            <div className="lg:col-span-2">
              <LandingPage onSelectTool={handleSelectTool} connectedAccounts={connectedAccounts} onToggleConnect={handleToggleConnect} />
            </div>
            <div className="mt-8 lg:mt-0">
              <HistorySidebar key={historyUpdated} />
            </div>
          </div>
        ) : (
          <>
            {activeTool === 'thumbnail' && <ThumbnailGenerator onNavigateHome={handleNavigateHome} onThumbnailGenerated={onCreationGenerated} onGenerating={handleGeneratingStatusChange} />}
            {activeTool === 'political' && <PoliticiansPosterMaker onNavigateHome={handleNavigateHome} onPosterGenerated={onCreationGenerated} onGenerating={handleGeneratingStatusChange} />}
            {activeTool === 'advertisement' && <AdBannerGenerator onNavigateHome={handleNavigateHome} onBannerGenerated={onCreationGenerated} onGenerating={handleGeneratingStatusChange} />}
            {activeTool === 'social' && <SocialMediaPostGenerator onNavigateHome={handleNavigateHome} onPostGenerated={onCreationGenerated} onGenerating={handleGeneratingStatusChange} />}
            {activeTool === 'profile' && <ProfileImageGenerator onNavigateHome={handleNavigateHome} onCreationGenerated={onCreationGenerated} onGenerating={handleGeneratingStatusChange} />}
            {activeTool === 'logo' && <LogoGenerator onNavigateHome={handleNavigateHome} onCreationGenerated={onCreationGenerated} onGenerating={handleGeneratingStatusChange} />}
            {activeTool === 'image-enhancer' && <ImageEnhancer onNavigateHome={handleNavigateHome} onCreationGenerated={onCreationGenerated} onGenerating={handleGeneratingStatusChange} />}
            {activeTool === 'headshot-maker' && <HeadshotMaker onNavigateHome={handleNavigateHome} onCreationGenerated={onCreationGenerated} onGenerating={handleGeneratingStatusChange} />}
            {activeTool === 'passport-photo' && <PassportPhotoMaker onNavigateHome={handleNavigateHome} onCreationGenerated={onCreationGenerated} onGenerating={handleGeneratingStatusChange} />}
            {activeTool === 'visiting-card' && <VisitingCardMaker onNavigateHome={handleNavigateHome} onCreationGenerated={onCreationGenerated} onGenerating={handleGeneratingStatusChange} />}
            {activeTool === 'event-poster' && <EventPosterMaker onNavigateHome={handleNavigateHome} onCreationGenerated={onCreationGenerated} onGenerating={handleGeneratingStatusChange} />}
          </>
        )}
      </main>
      <Footer dbStatus={dbStatus} dbError={dbError} />
      {isFeedbackOpen && <FeedbackModal onClose={handleCloseFeedback} />}
      {isAuthModalOpen && <AuthModal onClose={handleCloseAuthModal} />}
    </div>
  );
};

export default App;