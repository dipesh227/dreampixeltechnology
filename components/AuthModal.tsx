

import React from 'react';
import { HiOutlineXMark } from 'react-icons/hi2';
import { FaGoogle } from 'react-icons/fa6';
import { useAuth } from '../context/AuthContext';
import { useLocalization } from '../hooks/useLocalization';

interface AuthModalProps {
    onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
    const { login, isLoggingIn, authError } = useAuth();
    const { t } = useLocalization();
    
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-slate-900/80 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-slate-800">
                    <h2 className="text-lg font-bold text-white">{t('authModal.title')}</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-white">
                        <HiOutlineXMark className="w-6 h-6 icon-hover-effect"/>
                    </button>
                </header>

                <main className="p-8 text-center">
                    <p className="text-slate-400 mb-6">{t('authModal.description')}</p>
                    <button 
                        onClick={login}
                        disabled={isLoggingIn}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-slate-800 border border-slate-700 text-white font-semibold rounded-lg hover:bg-slate-700 transition-colors duration-200 disabled:bg-slate-700 disabled:cursor-not-allowed">
                        {isLoggingIn ? (
                             <>
                                <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                                <span>{t('authModal.redirecting')}</span>
                             </>
                        ) : (
                            <>
                                <FaGoogle className="w-5 h-5 text-white"/>
                                {t('authModal.signInWithGoogle')}
                            </>
                        )}
                    </button>
                    {authError && <p className="text-sm text-red-400 mt-4">{authError}</p>}
                </main>
            </div>
        </div>
    );
};

export default AuthModal;
