
import React, { useState } from 'react';
import { DreamLogo } from './icons/DreamLogo';
import { HiOutlineArrowRightOnRectangle, HiOutlineUserCircle, HiBars3, HiXMark, HiLanguage } from 'react-icons/hi2';
import { useAuth } from '../context/AuthContext';
import { useLocalization } from '../hooks/useLocalization';

interface HeaderProps {
    onNavigateHome: () => void;
    onLogin: () => void;
}

const UserMenu: React.FC<{ inMobileMenu?: boolean }> = ({ inMobileMenu = false }) => {
    const { profile, logout, isLoggingOut } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useLocalization();

    if (!profile) return null;

    const handleLogout = () => {
        logout().then(() => setIsOpen(false));
    };
    
    if (inMobileMenu) {
        return (
             <div className="border-t border-slate-800 px-4 py-4">
                 <div className="flex items-center gap-3 mb-4">
                    <img src={profile.avatar_url} alt={profile.full_name} className="w-10 h-10 rounded-full border-2 border-slate-600" />
                    <div>
                        <p className="font-semibold text-white">{profile.full_name}</p>
                    </div>
                </div>
                <button 
                    onClick={handleLogout} 
                    disabled={isLoggingOut}
                    className="w-full flex items-center justify-center gap-3 px-4 py-2 text-sm text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-wait">
                    {isLoggingOut ? (
                        <>
                            <div className="w-4 h-4 border-2 border-t-transparent border-slate-300 rounded-full animate-spin"></div>
                            {t('header.signingOut')}
                        </>
                    ) : (
                        <>
                            <HiOutlineArrowRightOnRectangle className="w-5 h-5"/>
                            {t('header.signOut')}
                        </>
                    )}
                </button>
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
                <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-lg py-1 z-50">
                    <button 
                        onClick={handleLogout} 
                        disabled={isLoggingOut}
                        className="w-full flex items-center justify-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 transition-colors disabled:opacity-70 disabled:cursor-wait">
                        {isLoggingOut ? (
                            <>
                                <div className="w-4 h-4 border-2 border-t-transparent border-slate-300 rounded-full animate-spin"></div>
                                {t('header.signingOut')}
                            </>
                        ) : (
                            <>
                                <HiOutlineArrowRightOnRectangle className="w-5 h-5"/>
                                {t('header.signOut')}
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};


const MobileMenu: React.FC<HeaderProps & { onClose: () => void }> = ({ onLogin, onClose }) => {
    const { session } = useAuth();
    const { locale, changeLocale, t } = useLocalization();

    const handleLanguageChange = () => {
        changeLocale(locale === 'en' ? 'hi' : 'en');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-lg z-50 flex flex-col animate-fade-in text-slate-200">
            <div className="flex justify-end p-4">
                 <button onClick={onClose} className="p-2 rounded-md text-slate-400 hover:bg-slate-800">
                    <HiXMark className="w-7 h-7"/>
                 </button>
            </div>
            <div className="flex flex-col justify-between flex-grow">
                <div className="px-4 py-4">
                    <button 
                        onClick={handleLanguageChange}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-slate-800 text-slate-200 font-semibold rounded-lg hover:bg-slate-700 transition-colors">
                        <HiLanguage className="w-6 h-6" />
                        {locale === 'en' ? 'हिन्दी में स्विच करें' : 'Switch to English'}
                    </button>
                </div>

                {session ? (
                   <UserMenu inMobileMenu />
                ) : (
                    <div className="px-4 py-4">
                         <button 
                            onClick={() => { onLogin(); onClose(); }}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-white transition-colors">
                              <HiOutlineUserCircle className="w-6 h-6" />
                              {t('header.login')}
                          </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const Header: React.FC<HeaderProps> = (props) => {
  const { onNavigateHome, onLogin } = props;
  const { session } = useAuth();
  const { locale, changeLocale, t } = useLocalization();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLanguageChange = () => {
    changeLocale(locale === 'en' ? 'hi' : 'en');
  };

  return (
    <>
      <header className="py-4 px-4 md:px-8 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800/50 fixed top-0 w-full z-40">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex-1 flex justify-start">
            <div className="hidden lg:flex">
                <button 
                  onClick={handleLanguageChange} 
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                    <HiLanguage className="w-5 h-5" />
                    {locale === 'en' ? 'हिन्दी' : 'English'}
                </button>
            </div>
          </div>

          <div className="flex-1 flex justify-center">
            <div 
              className="flex items-center justify-center cursor-pointer group"
              onClick={onNavigateHome}
            >
                <DreamLogo className="h-10 md:h-12 w-auto transition-all duration-300 group-hover:drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]" />
            </div>
          </div>

          <div className="flex-1 flex items-center gap-4 justify-end">
              <div className="hidden lg:flex">
                {session ? (
                    <UserMenu />
                ) : (
                    <button 
                      onClick={onLogin} 
                      className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                        <HiOutlineUserCircle className="w-5 h-5" />
                        {t('header.login')}
                    </button>
                )}
              </div>
              
              <div className="lg:hidden">
                  <button 
                      onClick={() => setIsMenuOpen(true)}
                      className="p-2 rounded-md text-slate-400 hover:bg-slate-800"
                      aria-label={t('header.openMenu')}
                  >
                      <HiBars3 className="w-7 h-7"/>
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
