import React from 'react';
import useSWR from 'swr';
import * as historyService from '../services/historyService';
import { PublicCreation } from '../types';
import { HiOutlinePhotograph } from 'react-icons/hi';

const fetcher = (): Promise<PublicCreation[]> => historyService.getPublicCreations();

const SkeletonGallery: React.FC = () => (
    <div className="columns-2 md:columns-3 lg:columns-4 gap-4 animate-pulse">
        {[...Array(8)].map((_, i) => (
            <div key={i} className="mb-4 break-inside-avoid">
                <div className="w-full h-48 bg-slate-800 rounded-lg"></div>
            </div>
        ))}
    </div>
);

const PublicGallery: React.FC = () => {
    const { data: creations, error, isLoading } = useSWR('publicCreations', fetcher);

    return (
        <div className="p-8 bg-slate-900/60 backdrop-blur-lg border border-slate-700/50 rounded-xl">
            <h3 className="text-2xl font-bold text-white mb-2 text-center">Inspiration from the Community</h3>
            <p className="text-slate-400 mb-8 max-w-2xl mx-auto text-center">
                Check out what others are creating with DreamPixel. Sign in and share your creations to be featured!
            </p>

            {isLoading && <SkeletonGallery />}
            
            {error && (
                <div className="text-center py-8 text-red-400 bg-red-900/30 p-4 rounded-lg border border-red-500/50">
                    <p className="font-bold">Could not load community gallery.</p>
                    <p className="text-sm text-red-300/80 mt-1">{error.message}</p>
                </div>
            )}
            
            {!isLoading && !error && creations && creations.length === 0 && (
                <div className="text-center py-10 text-slate-500">
                    <HiOutlinePhotograph className="w-12 h-12 mx-auto mb-4"/>
                    The gallery is empty right now. <br/> Be the first to be featured!
                </div>
            )}

            {!isLoading && !error && creations && creations.length > 0 && (
                <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
                    {creations.map((creation) => (
                        <div key={creation.id} className="mb-4 break-inside-avoid">
                            <img
                                src={creation.imageUrl}
                                alt="Community Creation"
                                className="w-full h-auto rounded-lg object-cover transition-all duration-300 hover:brightness-110 hover:shadow-lg hover:shadow-purple-500/20"
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PublicGallery;