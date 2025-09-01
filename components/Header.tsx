import React from 'react';
import { DreamLogo } from './icons/DreamLogo';
import { HiOutlineKey, HiOutlineHome, HiOutlineChatBubbleLeftEllipsis } from 'react-icons/hi2';
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
    <header className="py-4 px-4 md:px-8 bg-slate-950/50 backdrop-blur-lg border-b border-slate-700/50 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div className="w-1/4">
           <button onClick={onNavigateHome} className="flex items-center gap-2 text-sm rounded-lg text-slate-300 transition-colors group">
                <div className="p-2.5 bg-slate-800 border border-slate-700 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 group-hover:from-blue-500/40 group-hover:to-cyan-500/40 transition-all">
                   <HiOutlineHome className="w-5 h-5 text-cyan-300 icon-hover-effect" />
                </div>
            </button>
        </div>

        <div 
          className="flex flex-col items-center justify-center w-1/2 cursor-pointer logo-container"
          onClick={onNavigateHome}
        >
            <DreamLogo className="h-8 md:h-14 w-auto" />
            <p className="hidden md:block text-sm text-slate-400 font-light mt-2">Your Vision, Amplified by AI.</p>
        </div>

        <div className="flex items-center gap-2 justify-end w-1/4">
            <button onClick={onOpenFeedback} className="flex items-center gap-2 p-2 text-sm rounded-lg border border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-800 transition-colors group">
                <div className="p-1 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 group-hover:from-purple-500/40 group-hover:to-pink-500/40 transition-all">
                  <HiOutlineChatBubbleLeftEllipsis className="w-5 h-5 text-pink-300 icon-hover-effect" />
                </div>
                <span className="hidden md:inline">Feedback</span>
            </button>
            <button onClick={onOpenSettings} className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-800 transition-colors">
                <HiOutlineKey className={`w-5 h-5 transition-all duration-300 icon-hover-effect ${getKeyIconClassName()}`} />
                <span className="hidden md:inline">API Settings</span>
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;