import React from 'react';
import { AspectRatio } from '../types';
import { ASPECT_RATIOS } from '../services/constants';

interface AspectRatioSelectorProps {
    selectedRatio: AspectRatio;
    onSelectRatio: (ratio: AspectRatio) => void;
    availableRatios?: AspectRatio[];
}

export const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({ selectedRatio, onSelectRatio, availableRatios }) => {
    
    const ratiosToDisplay = availableRatios
        ? ASPECT_RATIOS.filter(r => availableRatios.includes(r.id))
        : ASPECT_RATIOS;

    return (
        <div className="p-4 md:p-6 bg-slate-900/60 backdrop-blur-lg border border-slate-700/50 rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4">Choose Aspect Ratio</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {ratiosToDisplay.map(({ id, name, icon }) => (
                    <button 
                        key={id} 
                        onClick={() => onSelectRatio(id)} 
                        className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-colors duration-200 ${selectedRatio === id ? 'border-purple-500 bg-slate-800/50' : 'border-slate-800 bg-slate-900 hover:border-slate-700'}`}
                    >
                        <svg viewBox="0 0 24 24" className="w-10 h-10 mb-2 text-slate-300" fill="currentColor">
                            <path d={icon}></path>
                        </svg>
                        <p className="font-bold text-lg text-white">{id}</p>
                        <p className="text-sm text-slate-400">{name}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default AspectRatioSelector;
