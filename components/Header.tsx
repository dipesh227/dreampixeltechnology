import React, { useState, useEffect } from 'react';
import { DreamLogo } from './icons/DreamLogo';
import { HiOutlineKey, HiOutlineChatBubbleLeftEllipsis, HiOutlineArrowRightOnRectangle, HiOutlineUserCircle, HiBars3, HiOutlineXMark, HiOutlineCog6Tooth } from 'react-icons/hi2';
import { ValidationStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { Session } from '@supabase/supabase-js';

interface HeaderProps {
    onNavigateHome: () => void;
    onOpenFeedback: () => void;
    apiKeyStatus: ValidationStatus;
    apiKeyError: string | null;
    onLogin: () => void;
    onOpenSettings: () => void;
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

interface MobileMenuProps extends Omit<HeaderProps, 'onNavigateHome' | 'apiKeyError'> {
    session: Session | null;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ onOpenFeedback, apiKeyStatus, onLogin, onOpenSettings, session }) => {
    const { logout, isLoggingOut } = useAuth();
    
    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-50 animate-fade-in p-4 flex flex-col">
            <div className="flex justify-between items-center mb-10">
                <h2 className="text-lg font-bold text-white">Menu</h2>
            </div>

            <div className="flex flex-col gap-4 flex-grow">
                {session ? (
                     <div className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                        <img src={session.user.user_metadata.avatar_url} alt={session.user.user_metadata.full_name} className="w-10 h-10 rounded-full" />
                        <div>
                            <p className="font-semibold text-white">{session.user.user_metadata.full_name}</p>
                            <p className="text-sm text-slate-400">{session.user.email}</p>
                        </div>
                    </div>
                ) : (
                    <button onClick={onLogin} className="w-full flex items-center gap-3 p-4 text-left bg-slate-800/50 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors">
                        <HiOutlineUserCircle className="w-6 h-6 text-sky-400" />
                        <span className="font-semibold text-white">Login / Sign Up</span>
                    </button>
                )}
                
                <button onClick={onOpenSettings} className="w-full flex items-center gap-3 p-4 text-left bg-slate-800/50 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors">
                    <HiOutlineKey className="w-6 h-6 text-yellow-400" />
                    <div>
                        <span className="font-semibold text-white">API Key Settings</span>
                        <p className="text-sm text-slate-400">{apiKeyStatus === 'valid' ? 'Connected' : 'Action Required'}</p>
                    </div>
                </button>
                
                <button onClick={onOpenFeedback} className="w-full flex items-center gap-3 p-4 text-left bg-slate-800/50 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors">
                    <HiOutlineChatBubbleLeftEllipsis className="w-6 h-6 text-pink-400" />
                    <span className="font-semibold text-white">Send Feedback</span>
                </button>
            </div>

            {session && (
                <button 
                    onClick={() => logout()} 
                    disabled={isLoggingOut}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-slate-700/50 border border-slate-700 rounded-lg transition-colors icon-hover-effect disabled:opacity-70 disabled:cursor-wait">
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
            )}
        </div>
    );
};


const Header: React.FC<HeaderProps> = ({ onNavigateHome, onOpenFeedback, apiKeyStatus, apiKeyError, onLogin, onOpenSettings }) => {
  const { session } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getStatusInfo = () => {
    switch (apiKeyStatus) {
        case 'valid':
            return { className: 'text-green-400 neon-green', title: apiKeyError || 'API Key is valid and connected.' };
        case 'invalid':
            return { className: 'text-red-400 neon-red', title: apiKeyError || 'The configured API Key is invalid.' };
        case 'validating':
            return { className: 'text-yellow-400 neon-yellow-pulse', title: 'Validating API Key...' };
        default:
            return { className: 'text-slate-300', title: 'API Status Unknown' };
    }
  };

  const { className: statusIconClassName, title: statusIconTitle } = getStatusInfo();
  
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [isMobileMenuOpen]);

  return (
    <header className="py-4 px-4 md:px-8 bg-slate-950/50 backdrop-blur-lg border-b border-slate-700/50 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex-1 flex justify-start items-center">
           <div className="hidden lg:flex items-center gap-2 p-2 border border-slate-700 bg-slate-800/80 rounded-lg">
                <div 
                    className="flex items-center gap-2 text-sm text-slate-300 pr-2"
                    title={statusIconTitle}
                >
                    <div className="p-1.5 bg-slate-800 border border-slate-700 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                       <HiOutlineKey className={`w-5 h-5 transition-all duration-300 ${statusIconClassName}`} />
                    </div>
                    <span>API Status</span>
                </div>
                <div className="h-6 border-l border-slate-700"></div>
                <button 
                    onClick={onOpenSettings}
                    className="pl-2 text-slate-400 hover:text-white"
                    title="API Key Settings"
                >
                    <HiOutlineCog6Tooth className="w-5 h-5 icon-hover-effect" />
                </button>
           </div>
        </div>

        <div className="flex-shrink-0">
          <div 
            className="flex flex-col items-center justify-center cursor-pointer logo-container"
            onClick={onNavigateHome}
          >
              <DreamLogo className="h-10 md:h-12 w-auto" />
          </div>
        </div>

        <div className="flex-1 hidden lg:flex items-center gap-4 justify-end">
            <button onClick={onOpenFeedback} className="flex items-center gap-2 p-2 text-sm rounded-lg border border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-800 transition-colors group">
                <div className="p-1 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 group-hover:from-purple-500/40 group-hover:to-pink-500/40 transition-all">
                  <HiOutlineChatBubbleLeftEllipsis className="w-5 h-5 text-pink-300 icon-hover-effect" />
                </div>
                <span>Feedback</span>
            </button>
            
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
            
        <div className="lg:hidden flex-1 flex justify-end">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-md text-slate-300 hover:bg-slate-800 z-50">
                {isMobileMenuOpen ? <HiOutlineXMark className="w-7 h-7" /> : <HiBars3 className="w-7 h-7" />}
            </button>
        </div>
      </div>
      
      {isMobileMenuOpen && (
        <MobileMenu 
            onOpenFeedback={() => { onOpenFeedback(); setIsMobileMenuOpen(false); }} 
            apiKeyStatus={apiKeyStatus} 
            onLogin={() => { onLogin(); setIsMobileMenuOpen(false); }}
            onOpenSettings={() => { onOpenSettings(); setIsMobileMenuOpen(false); }}
            session={session}
        />
      )}
    </header>
  );
};

export default Header;