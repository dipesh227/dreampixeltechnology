import React from 'react';
import { HiArrowLeft, HiOutlineWrenchScrewdriver } from 'react-icons/hi2';

interface InfoPageProps {
    title: string;
    onNavigateHome: () => void;
    children?: React.ReactNode;
}

export const InfoPage: React.FC<InfoPageProps> = ({ title, onNavigateHome, children }) => {
    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
             <button 
                onClick={onNavigateHome} 
                className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition-colors">
                <HiArrowLeft /> Back to Home
            </button>
            <div className="p-8 md:p-12 bg-white border border-slate-200 rounded-2xl shadow-sm">
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-6 border-b border-slate-200 pb-4">{title}</h1>
                {children ? (
                    <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-headings:text-slate-800 prose-a:text-purple-600 hover:prose-a:text-purple-500 prose-strong:text-slate-800">
                        {children}
                    </div>
                ) : (
                    <div className="text-center py-8">
                         <div className="inline-block p-4 bg-slate-100 rounded-full mb-6">
                            <HiOutlineWrenchScrewdriver className="w-12 h-12 text-slate-500" />
                        </div>
                        <p className="text-slate-500 text-lg">This tool is currently under construction. Please check back soon!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InfoPage;
