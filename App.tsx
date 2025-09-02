import React, { useState, useCallback, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import Header from './components/Header';
import { ToolType, ValidationStatus } from './types';
import HistorySidebar from './components/HistorySidebar';
import Footer from './components/Footer';
import FeedbackModal from './components/FeedbackModal';
import AuthModal from './components/AuthModal';
import * as aiService from './services/aiService';
import MouseTrail from './components/MouseTrail';
import { useAuth } from './context/AuthContext';
import { checkDatabaseConnection } from './services/supabaseClient';
import SettingsModal from './components/SettingsModal';

// Eager load components to fix potential module resolution issues with lazy loading.
import ThumbnailGenerator from './components/ThumbnailGenerator';
import PoliticiansPosterMaker from './components/PoliticiansPosterMaker';
import AdBannerGenerator from './components/AdBannerGenerator';
import SocialMediaPostGenerator from './components/SocialMediaPostGenerator';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolType | 'landing'>('landing');
  const [historyUpdated, setHistoryUpdated] = useState(0);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKeyStatus, setApiKeyStatus] = useState<ValidationStatus>('validating');
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [dbStatus, setDbStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [dbError, setDbError] = useState<string | null>(null);

  const { session } = useAuth();

  const checkConnections = useCallback(async () => {
    setApiKeyStatus('validating');
    setApiKeyError(null);
    
    // Only check DB on initial load
    if (dbStatus === 'connecting') {
        setDbError(null);
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
    }

    // Check API Status based on current config
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
  }, [dbStatus]);

  useEffect(() => {
    checkConnections();
    
    if (session) {
      const preAuthTool = sessionStorage.getItem('preAuthTool');
      if (preAuthTool) {
        setActiveTool(preAuthTool as ToolType);
        sessionStorage.removeItem('preAuthTool');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);
  
  useEffect(() => {
    const baseTitle = "DreamPixel Technology";
    switch(activeTool) {
      case 'thumbnail':
        document.title = `Thumbnail Generator | ${baseTitle}`;
        break;
      case 'political':
        document.title = `Political Poster Maker | ${baseTitle}`;
        break;
      case 'advertisement':
        document.title = `Ad Banner Generator | ${baseTitle}`;
        break;
      case 'social':
        document.title = `Social Post Generator | ${baseTitle}`;
        break;
      default:
        document.title = `AI Content Creation Suite | ${baseTitle}`;
    }
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
  
  const handleOpenAuthModal = useCallback(() => {
    if (activeTool !== 'landing') {
      sessionStorage.setItem('preAuthTool', activeTool);
    }
    setIsAuthModalOpen(true);
  }, [activeTool]);
  const handleCloseAuthModal = useCallback(() => setIsAuthModalOpen(false), []);
  
  const handleOpenSettings = useCallback(() => setIsSettingsOpen(true), []);
  const handleCloseSettings = useCallback(() => setIsSettingsOpen(false), []);
  const handleApiKeyChange = useCallback(() => {
      checkConnections();
  }, [checkConnections]);

  const handleGeneratingStatusChange = useCallback((status: boolean) => {
    setIsGenerating(status);
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
        onOpenSettings={handleOpenSettings}
      />
      <main className="container mx-auto px-4 py-8">
        {activeTool === 'landing' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
            <div className="lg:col-span-2">
              <LandingPage onSelectTool={handleSelectTool} />
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
          </>
        )}
      </main>
      <Footer dbStatus={dbStatus} dbError={dbError} />
      {isFeedbackOpen && <FeedbackModal onClose={handleCloseFeedback} />}
      {isAuthModalOpen && <AuthModal onClose={handleCloseAuthModal} />}
      {isSettingsOpen && <SettingsModal onClose={handleCloseSettings} onApiKeyChange={handleApiKeyChange} />}
    </div>
  );
};

export default App;