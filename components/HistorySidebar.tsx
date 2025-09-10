

import React, { useState, useEffect, useMemo } from 'react';
import * as historyService from '../services/historyService';
import { HistoryEntry } from '../types';
import { HiOutlineMagnifyingGlass, HiOutlineTrash, HiOutlineUserCircle, HiOutlineRectangleStack } from 'react-icons/hi2';
import { useAuth } from '../context/AuthContext';
import { useLocalization } from '../hooks/useLocalization';

const SkeletonCard: React.FC = () => (
    <div className="animate-pulse">
        <div className="w-full bg-slate-700 rounded-lg aspect-video"></div>
    </div>
);


const HistorySidebar: React.FC = () => {
    const { session } = useAuth();
    const { t } = useLocalization();
    const [creations, setCreations] = useState<HistoryEntry[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchCreations = async () => {
            if (session?.user?.id) {
                setIsLoading(true);
                const savedCreations = await historyService.getCreations(session.user.id);
                setCreations(savedCreations);
                setIsLoading(false);
            } else {
                setCreations([]);
                setIsLoading(false);
            }
        };
        fetchCreations();
    }, [session]);

    const handleClearCreations = async () => {
        if (session?.user?.id && window.confirm(t('historySidebar.clearConfirm'))) {
            await historyService.clearCreations(session.user.id);
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
        <div className="p-4 bg-slate-900/60 backdrop-blur-lg border border-slate-800 rounded-xl h-full flex flex-col max-h-[calc(100vh-8rem)]">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <HiOutlineRectangleStack />
                    {t('historySidebar.title')}
                </h3>
                {creations.length > 0 && (
                    <button onClick={handleClearCreations} aria-label="Clear all creations" className="text-slate-500 transition-colors p-1 rounded-md hover:bg-slate-800 hover:text-red-400">
                        <HiOutlineTrash className="w-5 h-5" />
                    </button>
                )}
            </div>

            <div className="relative mb-4 flex-shrink-0">
                <input
                    type="text"
                    placeholder={t('historySidebar.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <HiOutlineMagnifyingGlass className="w-5 h-5 text-slate-500" />
                </div>
            </div>
            <div className="overflow-y-auto flex-grow">
              {isLoading ? (
                   <div className="space-y-4 pr-2">
                      {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
                   </div>
              ) : filteredCreations.length > 0 ? (
                  <div className="space-y-4 pr-2">
                      {filteredCreations.map(creation => (
                          <div key={creation.id} className="group relative">
                               <img 
                                  src={creation.imageUrl} 
                                  alt={creation.prompt} 
                                  className="w-full rounded-lg aspect-video object-cover border-2 border-slate-800 group-hover:border-purple-500 transition-all"
                              />
                              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity p-2 text-xs text-white overflow-hidden rounded-lg flex items-center justify-center">
                                  <p className="line-clamp-4">{creation.prompt}</p>
                              </div>
                          </div>
                      ))}
                  </div>
              ) : (
                  <div className="text-center py-8 h-full flex flex-col items-center justify-center">
                       {!session ? (
                           <>
                                <HiOutlineUserCircle className="w-10 h-10 text-slate-600 mb-2"/>
                                <p className="text-sm font-semibold text-slate-400">{t('historySidebar.signInToSave')}</p>
                                <p className="text-xs text-slate-500">{t('historySidebar.signInPrompt')}</p>
                           </>
                       ) : (
                           <p className="text-sm text-slate-500">
                               {creations.length > 0 ? t('historySidebar.noMatches') : t('historySidebar.empty')}
                           </p>
                       )}
                  </div>
              )}
            </div>
        </div>
    );
};

export default HistorySidebar;
