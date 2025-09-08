import React from 'react';
import { HiArrowLeft } from 'react-icons/hi2';

interface InfoPageProps {
    title: string;
    onNavigateHome: () => void;
    children: React.ReactNode;
}

export const InfoPage: React.FC<InfoPageProps> = ({ title, onNavigateHome, children }) => {
    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="p-8 bg-slate-900/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg">
                <button 
                    onClick={onNavigateHome} 
                    className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors icon-hover-effect">
                    <HiArrowLeft /> Back to Home
                </button>
                <h1 className="text-4xl font-extrabold text-white mb-6 border-b border-slate-700 pb-4">{title}</h1>
                <div className="prose prose-invert prose-slate max-w-none prose-p:text-slate-300 prose-headings:text-white prose-a:text-purple-400 hover:prose-a:text-purple-300 prose-strong:text-white">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default InfoPage;
