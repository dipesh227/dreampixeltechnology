import React, { useState, useCallback, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import Header from './components/Header';
import { ToolType, ValidationStatus, ApiProvider } from './types';
import HistorySidebar from './components/HistorySidebar';
import Footer from './components/Footer';
import SettingsModal from './components/SettingsModal';
import FeedbackModal from './components/FeedbackModal';
import AuthModal from './components/AuthModal';
import * as aiService from './services/aiService';
import * as apiConfigService from './services/apiConfigService';
import MouseTrail from './components/MouseTrail';
import { useAuth } from './context/AuthContext';
import { checkDatabaseConnection } from './services/supabaseClient';

// Eager load components to fix potential module resolution issues with lazy loading.
import ThumbnailGenerator from './components/ThumbnailGenerator';
import PoliticiansPosterMaker from './components/PoliticiansPosterMaker';
import AdBannerGenerator from './components/AdBannerGenerator';
import SocialMediaPostGenerator from './components/SocialMediaPostGenerator';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolType | 'landing'>('landing');
  const [historyUpdated, setHistoryUpdated] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [apiKeyStatus, setApiKeyStatus] = useState<ValidationStatus>('validating');
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiProvider, setApiProvider] = useState<ApiProvider>(() => apiConfigService.getConfig().provider);
  const [dbStatus, setDbStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

  const { session } = useAuth();

  useEffect(() => {
    const checkStatus = async () => {
        try {
            const status = await aiService.checkCurrentApiStatus();
            setApiKeyStatus(status);
        } catch (error) {
            console.error("Failed to check API status:", error);
            setApiKeyStatus('invalid');
        }
    };
    checkStatus();
  }, [apiProvider, session]);

  useEffect(() => {
    const verifyConnection = async () => {
        const isConnected = await checkDatabaseConnection();
        setDbStatus(isConnected ? 'connected' : 'error');
    };
    const timer = setTimeout(verifyConnection, 1000);
    return () => clearTimeout(timer);
  }, []);
  
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

  const handleOpenSettings = useCallback(() => setIsSettingsOpen(true), []);
  const handleCloseSettings = useCallback(() => {
    setIsSettingsOpen(false);
    setApiProvider(apiConfigService.getConfig().provider); // Update provider state on close
    setApiKeyStatus('validating');
    aiService.checkCurrentApiStatus().then(setApiKeyStatus);
  }, []);


  const handleOpenFeedback = useCallback(() => setIsFeedbackOpen(true), []);
  const handleCloseFeedback = useCallback(() => setIsFeedbackOpen(false), []);
  
  const handleOpenAuthModal = useCallback(() => setIsAuthModalOpen(true), []);
  const handleCloseAuthModal = useCallback(() => setIsAuthModalOpen(false), []);

  const handleGeneratingStatusChange = useCallback((status: boolean) => {
    setIsGenerating(status);
  }, []);

  return (
    <div className={`min-h-screen animated-bg ${isGenerating ? 'generating-active' : ''}`}>
      <MouseTrail />
      <Header 
        onNavigateHome={handleNavigateHome} 
        onOpenSettings={handleOpenSettings} 
        onOpenFeedback={handleOpenFeedback} 
        apiKeyStatus={apiKeyStatus} 
        onLogin={handleOpenAuthModal}
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
            {activeTool === 'thumbnail' && <ThumbnailGenerator onNavigateHome={handleNavigateHome} onThumbnailGenerated={onCreationGenerated} onGenerating={handleGeneratingStatusChange} apiProvider={apiProvider} onOpenSettings={handleOpenSettings} />}
            {activeTool === 'political' && <PoliticiansPosterMaker onNavigateHome={handleNavigateHome} onPosterGenerated={onCreationGenerated} onGenerating={handleGeneratingStatusChange} apiProvider={apiProvider} onOpenSettings={handleOpenSettings} />}
            {activeTool === 'advertisement' && <AdBannerGenerator onNavigateHome={handleNavigateHome} onBannerGenerated={onCreationGenerated} onGenerating={handleGeneratingStatusChange} apiProvider={apiProvider} onOpenSettings={handleOpenSettings} />}
            {activeTool === 'social' && <SocialMediaPostGenerator onNavigateHome={handleNavigateHome} onPostGenerated={onCreationGenerated} onGenerating={handleGeneratingStatusChange} apiProvider={apiProvider} onOpenSettings={handleOpenSettings} />}
          </>
        )}
      </main>
      <Footer dbStatus={dbStatus} />
      {isSettingsOpen && <SettingsModal onClose={handleCloseSettings} />}
      {isFeedbackOpen && <FeedbackModal onClose={handleCloseFeedback} />}
      {isAuthModalOpen && <AuthModal onClose={handleCloseAuthModal} />}
    </div>
  );
};

export default App;