import React, { useState } from 'react';
import { DreamLogo } from './icons/DreamLogo';
import { HiOutlineKey, HiOutlineChatBubbleLeftEllipsis, HiOutlineArrowRightOnRectangle, HiOutlineUserCircle, HiOutlineBars3, HiOutlineXMark } from 'react-icons/hi2';
import { ValidationStatus } from '../types';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
    onNavigateHome: () => void;
    onOpenSettings: () => void;
    onOpenFeedback: () => void;
    apiKeyStatus: ValidationStatus;
    onLogin: () => void;
}

const UserMenu: React.FC = () => {
    const { profile, logout, isLoggingOut } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    if (!profile) return null;

    const handleLogout = () => {
        logout().then(() => setIsOpen(false));
    };

    return (
        <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2">
                <img src={profile.avatar_url} alt={profile.full_name} className="w-8 h-8 rounded-full border-2 border-slate-600" />
                <span className="hidden md:inline text-sm font-semibold text-slate-300">{profile.full_name}</span>
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg py-1 z-50">
                    <button 
                        onClick={handleLogout} 
                        disabled={isLoggingOut}
                        className="w-full flex items-center justify-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors icon-hover-effect disabled:opacity-70 disabled:cursor-wait">
                        {isLoggingOut ? (
                            <>
                                <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                                Signing Out...
                            </>
                        ) : (
                            <>
                                <HiOutlineArrowRightOnRectangle className="w-5 h-5"/>
                                Sign Out
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

const Header: React.FC<HeaderProps> = ({ onNavigateHome, onOpenSettings, onOpenFeedback, apiKeyStatus, onLogin }) => {
  const { session, logout, isLoggingOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
  
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="py-4 px-4 md:px-8 bg-slate-950/50 backdrop-blur-lg border-b border-slate-700/50 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        {/* Left Side */}
        <div className="flex-1 flex justify-start">
           <button onClick={onOpenSettings} className="flex items-center gap-2 text-sm rounded-lg text-slate-300 transition-colors group">
                <div className="p-2.5 bg-slate-800 border border-slate-700 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 group-hover:from-purple-500/40 group-hover:to-pink-500/40 transition-all">
                   <HiOutlineKey className={`w-5 h-5 transition-all duration-300 icon-hover-effect ${getKeyIconClassName()}`} />
                </div>
            </button>
        </div>

        {/* Center Logo */}
        <div className="flex-shrink-0">
          <div 
            className="flex flex-col items-center justify-center cursor-pointer logo-container"
            onClick={onNavigateHome}
          >
              <DreamLogo className="h-10 md:h-12 w-auto" />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex-1 flex items-center gap-4 justify-end">
            {/* Desktop Buttons */}
            <button onClick={onOpenFeedback} className="hidden lg:flex items-center gap-2 p-2 text-sm rounded-lg border border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-800 transition-colors group">
                <div className="p-1 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 group-hover:from-purple-500/40 group-hover:to-pink-500/40 transition-all">
                  <HiOutlineChatBubbleLeftEllipsis className="w-5 h-5 text-pink-300 icon-hover-effect" />
                </div>
                <span className="hidden md:inline">Feedback</span>
            </button>
            
            {/* Auth Area for Desktop */}
            <div className="hidden lg:flex">
              {session ? (
                  <UserMenu />
              ) : (
                  <button 
                    onClick={onLogin} 
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-primary-gradient text-white hover:opacity-90 transition-opacity">
                      <HiOutlineUserCircle className="w-5 h-5" />
                      Login
                  </button>
              )}
            </div>
            
            {/* Mobile Auth Area & Menu Toggle */}
            <div className="lg:hidden flex items-center gap-2">
                {session && <UserMenu />}
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-md text-slate-300 hover:bg-slate-800">
                    {isMobileMenuOpen ? <HiOutlineXMark className="w-6 h-6"/> : <HiOutlineBars3 className="w-6 h-6"/>}
                </button>
            </div>
        </div>
      </div>
      
      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="lg:hidden mt-4 p-4 bg-slate-900 border-t border-slate-800 space-y-3 animate-fade-in-down">
          <button onClick={() => { onOpenFeedback(); closeMobileMenu(); }} className="w-full flex items-center gap-3 p-3 text-base rounded-lg text-slate-300 hover:bg-slate-800 transition-colors">
            <HiOutlineChatBubbleLeftEllipsis className="w-5 h-5 text-pink-300"/> Feedback
          </button>
          <button onClick={() => { onOpenSettings(); closeMobileMenu(); }} className="w-full flex items-center gap-3 p-3 text-base rounded-lg text-slate-300 hover:bg-slate-800 transition-colors">
            <HiOutlineKey className={`w-5 h-5 transition-all duration-300 ${getKeyIconClassName()}`}/> API Settings
          </button>
          <div className="border-t border-slate-800 my-2"></div>
          {session ? (
              <button 
                onClick={() => { logout(); closeMobileMenu(); }} 
                disabled={isLoggingOut}
                className="w-full flex items-center justify-center gap-3 p-3 text-base rounded-lg text-slate-300 hover:bg-slate-800 transition-colors disabled:opacity-70 disabled:cursor-wait">
                 {isLoggingOut ? (
                    <>
                        <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                        Signing Out...
                    </>
                ) : (
                    <>
                        <HiOutlineArrowRightOnRectangle className="w-5 h-5"/>
                        Sign Out
                    </>
                )}
              </button>
          ) : (
             <button onClick={() => { onLogin(); closeMobileMenu(); }} className="w-full flex items-center gap-3 p-3 text-base rounded-lg text-slate-300 hover:bg-slate-800 transition-colors">
                <HiOutlineUserCircle className="w-5 h-5"/> Login
              </button>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;