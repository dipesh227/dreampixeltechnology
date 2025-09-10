
import React from 'react';
import { HiArrowLeft, HiOutlineWrenchScrewdriver } from 'react-icons/hi2';
import { useLocalization } from '../hooks/useLocalization';

interface InfoPageProps {
    title: string;
    onNavigateHome: () => void;
    children?: React.ReactNode;
}

export const InfoPage: React.FC<InfoPageProps> = ({ title, onNavigateHome, children }) => {
    const { t } = useLocalization();
    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
             <button 
                onClick={onNavigateHome} 
                className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors font-semibold">
                <HiArrowLeft /> {t('infoPage.backToHome')}
            </button>
            <div className="p-8 md:p-12 bg-slate-900/60 border border-slate-700/50 rounded-2xl shadow-lg">
                <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-6 border-b border-slate-700 pb-4">{title}</h1>
                {children ? (
                    <div className="prose prose-invert max-w-none prose-p:text-slate-300 prose-headings:text-white prose-a:text-purple-400 hover:prose-a:text-purple-300 prose-strong:text-white">
                        {children}
                    </div>
                ) : (
                    <div className="text-center py-8">
                         <div className="inline-block p-4 bg-slate-800 rounded-full mb-6">
                            <HiOutlineWrenchScrewdriver className="w-12 h-12 text-slate-500" />
                        </div>
                        <p className="text-slate-400 text-lg">{t('infoPage.underConstruction')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InfoPage;
