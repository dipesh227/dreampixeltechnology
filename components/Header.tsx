
import React, { useState } from 'react';
import { DreamLogo } from './icons/DreamLogo';
import { HiOutlineKey, HiOutlineChatBubbleLeftEllipsis, HiOutlineArrowRightOnRectangle, HiOutlineUserCircle, HiBars3, HiXMark, HiOutlineCog6Tooth } from 'react-icons/hi2';
import { useAuth } from '../context/AuthContext';
import * as apiConfigService from '../services/apiConfigService';
import { useSWRConfig } from 'swr';

interface HeaderProps {
    onNavigateHome: () => void;
    onOpenFeedback: () => void;
    onLogin: () => void;
    onOpenSettings: () => void;
}

const UserMenu: React.FC<{ inMobileMenu?: boolean, onOpenSettings: () => void, onCloseMobileMenu?: () => void }> = ({ inMobileMenu = false, onOpenSettings, onCloseMobileMenu }) => {
    const { profile, logout, isLoggingOut } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    if (!profile) return null;

    const handleLogout = () => {
        logout().then(() => setIsOpen(false));
    };
    
    const handleSettingsClick = () => {
        setIsOpen(false);
        if (onCloseMobileMenu) onCloseMobileMenu();
        onOpenSettings();
    };

    if (inMobileMenu) {
        return (
             <div className="border-t border-slate-700 px-4 py-4">
                 <div className="flex items-center gap-3 mb-4">
                    <img src={profile.avatar_url} alt={profile.full_name} className="w-10 h-10 rounded-full border-2 border-slate-600" />
                    <div>
                        <p className="font-semibold text-white">{profile.full_name}</p>
                    </div>
                </div>
                <div className="space-y-2">
                    <button onClick={handleSettingsClick} className="w-full flex items-center justify-center gap-3 px-4 py-2 text-sm text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors icon-hover-effect">
                        <HiOutlineCog6Tooth className="w-5 h-5"/> Settings
                    </button>
                    <button onClick={handleLogout} disabled={isLoggingOut} className="w-full flex items-center justify-center gap-3 px-4 py-2 text-sm text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors icon-hover-effect disabled:opacity-70 disabled:cursor-wait">
                        {isLoggingOut ? 'Signing Out...' : <><HiOutlineArrowRightOnRectangle className="w-5 h-5"/> Sign Out</>}
                    </button>
                </div>
             </div>
        );
    }

    return (
        <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2">
                <img src={profile.avatar_url} alt={profile.full_name} className="w-8 h-8 rounded-full border-2 border-slate-600" />
                <span className="hidden md:inline text-sm font-semibold text-slate-300">{profile.full_name}</span>
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg py-1 z-50">
                    <button onClick={handleSettingsClick} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors icon-hover-effect">
                        <HiOutlineCog6Tooth className="w-5 h-5"/> Settings
                    </button>
                    <button onClick={handleLogout} disabled={isLoggingOut} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors icon-hover-effect disabled:opacity-70 disabled:cursor-wait">
                        {isLoggingOut ? 'Signing Out...' : <><HiOutlineArrowRightOnRectangle className="w-5 h-5"/> Sign Out</>}
                    </button>
                </div>
            )}
        </div>
    );
};


const MobileMenu: React.FC<HeaderProps & { onClose: () => void }> = ({ onLogin, onOpenFeedback, onOpenSettings, onClose }) => {
    const { session } = useAuth();
    // Use the SWR hook to get the latest API status from the global service
    const { data: apiStatus } = useSWRConfig().cache.get(apiConfigService.API_STATUS_KEY) || { data: { status: 'validating', error: null }};
    const { status, error } = apiStatus;
    const { className: statusIconClassName, title: statusIconTitle } = getStatusInfo(status);

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-lg z-50 flex flex-col animate-fade-in">
            <div className="flex justify-end p-4">
                 <button onClick={onClose} className="p-2 rounded-md text-slate-400 hover:bg-slate-800">
                    <HiXMark className="w-7 h-7 icon-hover-effect"/>
                 </button>
            </div>
            <div className="flex flex-col justify-between flex-grow">
                <div className="px-4 space-y-2">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                         <div className="flex items-center gap-3">
                            <HiOutlineKey className={`w-6 h-6 transition-all duration-300 ${statusIconClassName}`} />
                            <span className="font-semibold text-white">API Status</span>
                         </div>
                         <p className="text-sm text-slate-400">{statusIconTitle}</p>
                    </div>
                    <button onClick={() => { onOpenFeedback(); onClose(); }} className="w-full flex items-center gap-3 p-4 rounded-lg bg-slate-800/50 border border-slate-700 hover:bg-slate-800 text-left">
                        <HiOutlineChatBubbleLeftEllipsis className="w-6 h-6 text-pink-400"/>
                        <span className="font-semibold text-white">Share Feedback</span>
                    </button>
                </div>

                {session ? (
                   <UserMenu inMobileMenu onOpenSettings={onOpenSettings} onCloseMobileMenu={onClose} />
                ) : (
                    <div className="px-4 py-4">
                         <button onClick={() => { onLogin(); onClose(); }} className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-primary-gradient text-white font-semibold rounded-lg hover:opacity-90 transition-opacity">
                              <HiOutlineUserCircle className="w-6 h-6" /> Login / Sign Up
                          </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const getStatusInfo = (status: apiConfigService.ApiStatus['status']) => {
    switch (status) {
        case 'valid': return { className: 'text-green-400 neon-green', title: 'Stable' };
        case 'invalid': return { className: 'text-red-400 neon-red', title: 'Failed' };
        case 'validating': return { className: 'text-yellow-400 neon-yellow-pulse', title: 'Checking...' };
        case 'custom_valid': return { className: 'text-cyan-400 neon-green', title: 'User Key Active' };
        default: return { className: 'text-slate-300', title: 'Unknown' };
    }
};

const Header: React.FC<HeaderProps> = (props) => {
  const { onNavigateHome, onOpenFeedback, onLogin, onOpenSettings } = props;
  const { session } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const apiStatus = apiConfigService.useApiStatus();

  const { className: statusIconClassName, title: statusIconTitle } = getStatusInfo(apiStatus.status);

  const fullStatusMessage = apiStatus.status === 'custom_valid' 
    ? "Using your personal, encrypted API key."
    : apiStatus.status === 'valid' 
    ? 'Using the default site API key. Connection is stable.'
    : apiStatus.error || 'API Status Unknown';

  return (
    <>
      <header className="py-4 px-4 md:px-8 bg-slate-950/50 backdrop-blur-lg border-b border-slate-700/50 sticky top-0 z-40">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex-1 flex justify-start items-center">
             <div className="hidden lg:flex items-center gap-2 text-sm rounded-lg text-slate-300 p-2 border border-slate-700 bg-slate-800/80" data-tooltip={fullStatusMessage}>
                  <div className="p-1.5 rounded-full bg-slate-900 border border-slate-700">
                     <HiOutlineKey className={`w-4 h-4 transition-all duration-300 ${statusIconClassName}`} />
                  </div>
                  <span className="font-semibold">API Status:</span>
                  <span className={statusIconClassName}>{statusIconTitle}</span>
              </div>
          </div>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="flex flex-col items-center justify-center cursor-pointer logo-container" onClick={onNavigateHome}>
                <DreamLogo className="h-10 md:h-12 w-auto" />
            </div>
          </div>

          <div className="flex-1 flex items-center gap-4 justify-end">
              <button onClick={onOpenFeedback} className="hidden lg:flex items-center gap-2 p-2 text-sm rounded-lg border border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-800 transition-colors group">
                  <div className="p-1 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 group-hover:from-purple-500/40 group-hover:to-pink-500/40 transition-all">
                    <HiOutlineChatBubbleLeftEllipsis className="w-5 h-5 text-pink-300 icon-hover-effect" />
                  </div>
                  <span className="hidden md:inline">Share Feedback</span>
              </button>
              
              <div className="hidden lg:flex">
                {session ? (
                    <UserMenu onOpenSettings={onOpenSettings} />
                ) : (
                    <button onClick={onLogin} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-primary-gradient text-white hover:opacity-90 transition-opacity">
                        <HiOutlineUserCircle className="w-5 h-5" /> Login
                    </button>
                )}
              </div>
              
              <div className="lg:hidden">
                  <button onClick={() => setIsMenuOpen(true)} className="p-2 rounded-md text-slate-300 hover:bg-slate-800" aria-label="Open menu">
                      <HiBars3 className="w-7 h-7 icon-hover-effect"/>
                  </button>
              </div>
          </div>
        </div>
      </header>
      {isMenuOpen && <MobileMenu {...props} onClose={() => setIsMenuOpen(false)} />}
    </>
  );
};

export default Header;