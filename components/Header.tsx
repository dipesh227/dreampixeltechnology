import React, { useState, useEffect } from 'react';
import { DreamLogo } from './icons/DreamLogo';
import { HiOutlineArrowRightOnRectangle, HiOutlineUserCircle, HiBars3, HiOutlineXMark } from 'react-icons/hi2';
import { useAuth } from '../context/AuthContext';
import { ToolType } from '../types';

interface HeaderProps {
    onNavigateHome: () => void;
    onLogin: () => void;
    activeTool: ToolType | 'landing';
    onSelectTool: (tool: ToolType) => void;
}

const NAV_TOOLS: { id: ToolType; label: string }[] = [
    { id: 'thumbnail', label: 'Thumbnails' },
    { id: 'political', label: 'Posters' },
    { id: 'advertisement', label: 'Ad Banners' },
    { id: 'social', label: 'Social Posts' }
];

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

interface MobileMenuProps {
    onLogin: () => void;
    onSelectTool: (tool: ToolType) => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ onLogin, onSelectTool }) => {
    const { session, logout, isLoggingOut } = useAuth();
    
    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-50 animate-fade-in p-4 flex flex-col">
            <div className="flex justify-between items-center mb-10">
                <h2 className="text-lg font-bold text-white">Navigation</h2>
            </div>

            <div className="flex flex-col gap-2 flex-grow">
                {NAV_TOOLS.map(tool => (
                    <button
                        key={tool.id}
                        onClick={() => onSelectTool(tool.id)}
                        className="w-full text-left p-4 text-lg font-semibold text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        {tool.label}
                    </button>
                ))}
            </div>

            {session ? (
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
            ) : (
                <button 
                  onClick={onLogin} 
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg bg-primary-gradient text-white hover:opacity-90 transition-opacity">
                    <HiOutlineUserCircle className="w-5 h-5" />
                    Login / Sign Up
                </button>
            )}
        </div>
    );
};


const Header: React.FC<HeaderProps> = ({ onNavigateHome, onLogin, activeTool, onSelectTool }) => {
  const { session } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [isMobileMenuOpen]);

  return (
    <header className="py-4 px-4 md:px-8 bg-slate-950/50 backdrop-blur-lg border-b border-slate-700/50 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex-1 flex justify-start items-center">
            <div 
                className="flex-shrink-0 flex items-center justify-center cursor-pointer logo-container"
                onClick={onNavigateHome}
            >
                <DreamLogo className="h-10 md:h-12 w-auto" />
            </div>
        </div>

        <nav className="hidden lg:flex items-center gap-2">
            {NAV_TOOLS.map(tool => (
                <button
                    key={tool.id}
                    onClick={() => onSelectTool(tool.id)}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 ${
                        activeTool === tool.id
                        ? 'bg-slate-700/50 text-white'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                >
                    {tool.label}
                </button>
            ))}
        </nav>

        <div className="flex-1 flex items-center gap-4 justify-end">
            {session ? (
                <UserMenu />
            ) : (
                <button 
                  onClick={onLogin} 
                  className="hidden lg:flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-primary-gradient text-white hover:opacity-90 transition-opacity">
                    <HiOutlineUserCircle className="w-5 h-5" />
                    Login
                </button>
            )}
             <div className="lg:hidden">
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-md text-slate-300 hover:bg-slate-800 z-50">
                    {isMobileMenuOpen ? <HiOutlineXMark className="w-7 h-7" /> : <HiBars3 className="w-7 h-7" />}
                </button>
            </div>
        </div>
      </div>
      
      {isMobileMenuOpen && (
        <MobileMenu 
            onLogin={() => { onLogin(); setIsMobileMenuOpen(false); }}
            onSelectTool={(tool) => { onSelectTool(tool); setIsMobileMenuOpen(false); }}
        />
      )}
    </header>
  );
};

export default Header;