import React from 'react';
import { DreamLogo } from './icons/DreamLogo';
import { GlobeIcon, KeyIcon, HomeIcon } from './icons/UiIcons';

interface HeaderProps {
    onNavigateHome: () => void;
    onOpenSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigateHome, onOpenSettings }) => {
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
            <DreamLogo className="h-16 md:h-28 w-auto transition-all" />
            <p className="hidden md:block text-sm text-slate-400 font-light mt-2">Your Vision, Amplified by AI.</p>
        </div>

        <div className="flex items-center gap-2 justify-end w-1/4">
            <button className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-800 transition-colors">
                <GlobeIcon className="w-4 h-4" />
                <span className="hidden md:inline">EN</span>
            </button>
            <button onClick={onOpenSettings} className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-800 transition-colors">
                <KeyIcon className="w-4 h-4" />
                <span className="hidden md:inline">API Settings</span>
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;