import React, { useState, useEffect, useMemo } from 'react';
import * as historyService from '../services/historyService';
import { HistoryEntry } from '../types';
import { SearchIcon, TrashIcon } from './icons/UiIcons';

const HistorySidebar: React.FC = () => {
    const [creations, setCreations] = useState<HistoryEntry[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCreations = async () => {
            setIsLoading(true);
            const savedCreations = await historyService.getCreations();
            setCreations(savedCreations);
            setIsLoading(false);
        };
        fetchCreations();
    }, []);

    const handleClearCreations = async () => {
        if (window.confirm("Are you sure you want to delete all your liked creations? This action cannot be undone.")) {
            await historyService.clearCreations();
            setCreations([]);
        }
    };

    const filteredCreations = useMemo(() => {
        if (!searchTerm.trim()) {
            return creations;
        }
        return creations.filter(creation =>
            creation.prompt.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [creations, searchTerm]);

    return (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    Liked Creations
                    <span className="text-xs font-semibold bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">{creations.length}</span>
                </h3>
                {creations.length > 0 && (
                    <button onClick={handleClearCreations} aria-label="Clear all creations" className="text-slate-500 hover:text-red-400 transition-colors p-1 rounded-md hover:bg-slate-800">
                        <TrashIcon className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className="relative mb-4">
                <input
                    type="text"
                    placeholder="Search history..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg focus:ring-1 focus:ring-slate-600 focus:border-slate-600"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="w-4 h-4 text-slate-500" />
                </div>
            </div>
            {isLoading ? (
                 <div className="text-center py-8 flex-grow flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-t-transparent border-slate-500 rounded-full animate-spin"></div>
                 </div>
            ) : filteredCreations.length > 0 ? (
                <div className="space-y-4 pr-2 overflow-y-auto flex-grow">
                    {filteredCreations.map(creation => (
                        <div key={creation.id} className="group relative">
                             <img 
                                src={creation.imageUrl} 
                                alt={creation.prompt} 
                                className="w-full rounded-lg aspect-video object-cover border-2 border-transparent group-hover:border-slate-600 transition-all"
                            />
                            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity p-2 text-xs text-white overflow-hidden rounded-lg">
                                {creation.prompt}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 flex-grow flex items-center justify-center">
                    <p className="text-sm text-slate-500">
                        {creations.length > 0 ? 'No matching creations found.' : 'Your liked creations will appear here.'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default HistorySidebar;