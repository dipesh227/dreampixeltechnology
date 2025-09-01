
import React, { useState, useCallback } from 'react';
import LandingPage from './components/LandingPage';
import ThumbnailGenerator from './components/ThumbnailGenerator';
import PoliticiansPosterMaker from './components/PoliticiansPosterMaker';
import AdBannerGenerator from './components/AdBannerGenerator';
import Header from './components/Header';
import { ToolType } from './types';
import HistorySidebar from './components/HistorySidebar';
import Footer from './components/Footer';
import SettingsModal from './components/SettingsModal';
import FeedbackModal from './components/FeedbackModal';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolType | 'landing'>('landing');
  // This state is used to trigger a refresh of the history sidebar
  const [historyUpdated, setHistoryUpdated] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

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
  const handleCloseSettings = useCallback(() => setIsSettingsOpen(false), []);

  const handleOpenFeedback = useCallback(() => setIsFeedbackOpen(true), []);
  const handleCloseFeedback = useCallback(() => setIsFeedbackOpen(false), []);


  return (
    <div className="min-h-screen bg-slate-950 dotted-bg">
      <Header onNavigateHome={handleNavigateHome} onOpenSettings={handleOpenSettings} onOpenFeedback={handleOpenFeedback} />
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
            {activeTool === 'thumbnail' && <ThumbnailGenerator onNavigateHome={handleNavigateHome} onThumbnailGenerated={onCreationGenerated} />}
            {activeTool === 'political' && <PoliticiansPosterMaker onNavigateHome={handleNavigateHome} onPosterGenerated={onCreationGenerated} />}
            {activeTool === 'advertisement' && <AdBannerGenerator onNavigateHome={handleNavigateHome} onBannerGenerated={onCreationGenerated} />}
          </>
        )}
      </main>
      <Footer />
      {isSettingsOpen && <SettingsModal onClose={handleCloseSettings} />}
      {isFeedbackOpen && <FeedbackModal onClose={handleCloseFeedback} />}
    </div>
  );
};

export default App;