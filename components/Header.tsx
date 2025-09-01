
import React from 'react';
import { DreamLogo } from './icons/DreamLogo';
import { KeyIcon, HomeIcon, ChatBubbleLeftEllipsisIcon } from './icons/UiIcons';
import { ValidationStatus } from '../types';

interface HeaderProps {
    onNavigateHome: () => void;
    onOpenSettings: () => void;
    onOpenFeedback: () => void;
    apiKeyStatus: ValidationStatus;
}

const Header: React.FC<HeaderProps> = ({ onNavigateHome, onOpenSettings, onOpenFeedback, apiKeyStatus }) => {

  const getKeyIconClassName = () => {
    switch (apiKeyStatus) {
        case 'valid':
            return 'text-green-400 neon-green';
        case 'invalid':
            return 'text-red-400 neon-red';
        case 'validating':
            return 'text-yellow-400 neon-yellow-pulse';
        default:
            return 'text-slate-300';
    }
  };

  return (
    <header className="py-4 px-4 md:px-8 bg-slate-950/70 backdrop-blur-sm border-b border-slate-800/50 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div className="w-1/4">
           <button onClick={onNavigateHome} className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-800 transition-colors">
                <HomeIcon className="w-4 h-4" />
            </button>
        </div>

        <div 
          className="flex flex-col items-center justify-center w-1/2 cursor-pointer"
          onClick={onNavigateHome}
        >
            <DreamLogo className="h-8 md:h-14 w-auto transition-all" />
            <p className="hidden md:block text-sm text-slate-400 font-light mt-2">Your Vision, Amplified by AI.</p>
        </div>

        <div className="flex items-center gap-2 justify-end w-1/4">
            <button onClick={onOpenFeedback} className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-800 transition-colors">
                <ChatBubbleLeftEllipsisIcon className="w-4 h-4" />
                <span className="hidden md:inline">Feedback</span>
            </button>
            <button onClick={onOpenSettings} className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-800 transition-colors">
                <KeyIcon className={`w-4 h-4 transition-all duration-300 ${getKeyIconClassName()}`} />
                <span className="hidden md:inline">API Settings</span>
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;