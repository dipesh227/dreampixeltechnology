import React, { useState, useEffect } from 'react';
import { UploadedFile, EventPosterStyle, TemplatePrefillData } from '../types';
import { editEventPoster } from '../services/aiService';
import { EVENT_POSTER_STYLES } from '../services/constants';
import * as historyService from '../services/historyService';
import * as jobService from '../services/jobService';
import { HiArrowDownTray, HiOutlineHeart, HiOutlineSparkles, HiArrowUpTray, HiXMark, HiArrowLeft, HiOutlineTag, HiOutlineChatBubbleLeftRight, HiOutlineCalendar, HiOutlineClock, HiOutlineMapPin } from 'react-icons/hi2';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from './ErrorMessage';
import StyleSelector from './StyleSelector';
import { resizeImage } from '../utils/cropImage';

interface EventPosterMakerProps {
    onNavigateHome: () => void;
    onCreationGenerated: () => void;
    onGenerating: (isGenerating: boolean) => void;
}

export const EventPosterMaker: React.FC<EventPosterMakerProps> = ({ onNavigateHome, onCreationGenerated, onGenerating }) => {
    const { session } = useAuth();
    const [originalImage, setOriginalImage] = useState<UploadedFile | null>(null);
    const [editedImage, setEditedImage] = useState<string | null>(null);
    const [headline, setHeadline] = useState('');
    const [branding, setBranding] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [venue, setVenue] = useState('');
    const [selectedStyleId, setSelectedStyleId] = useState<string>(EVENT_POSTER_STYLES[0].id);
    
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        onGenerating(isLoading);
    }, [isLoading, onGenerating]);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isLoading) {
            const messages = [
                'Analyzing your event photo...',
                'Enhancing image quality...',
                'Applying stylish typography...',
                'Integrating event details...',
                'Rendering final poster...',
            ];
            let index = 0;
            setLoadingMessage(messages[index]);
            interval = setInterval(() => {
                index = (index + 1) % messages.length;
                setLoadingMessage(messages[index]);
            }, 2500);
        }
        return () => clearInterval(interval);
    }, [isLoading]);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            try {
                const resizedImage = await resizeImage(file, 2048);
                setOriginalImage(resizedImage);
                setEditedImage(null);
                setError(null);
                setIsSaved(false);
            } catch (error) {
                console.error("Error resizing image:", error);
                setError("Failed to process image. Please try a different file.");
            }
            event.target.value = '';
        }
    };
    
    const handleGenerate = async () => {
        if (!originalImage) {
            setError('Please upload an event photo.');
            return;
        }
        if (!headline.trim()) {
            setError('Please provide a headline for the poster.');
            return;
        }
        const selectedStyle = EVENT_POSTER_STYLES.find(s => s.id === selectedStyleId);
        if (!selectedStyle) {
            setError('Please select a valid style.');
            return;
        }

        if (session) {
            jobService.saveEventPosterJob({
                userId: session.user.id,
                headline,
                branding,
                styleId: selectedStyleId,
                originalImageFilename: originalImage.name,
                date,
                time,
                venue,
            });
        }
        
        setIsLoading(true);
        setError(null);
        setIsSaved(false);
        try {
            const result = await editEventPoster(originalImage, headline, branding, selectedStyle, { date, time, venue });
            if (result) {
                setEditedImage(result);
            } else {
                throw new Error("The AI failed to edit the image. Please try again with a different image or prompt.");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to edit the poster.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveCreation = async () => {
        if (editedImage && !isSaved && session) {
            const prompt = `Event Poster: ${headline} - ${branding}`;
            const newEntry = {
                id: '',
                prompt,
                imageUrl: `data:image/png;base64,${editedImage}`,
                timestamp: Date.now()
            };
            try {
                await historyService.saveCreation(newEntry, session.user.id);
                setIsSaved(true);
                onCreationGenerated();
            } catch (error) {
                setError("Failed to save creation. Please try again.");
            }
        }
    };

    const handleReset = () => {
        setOriginalImage(null);
        setEditedImage(null);
        setError(null);
        setIsLoading(false);
        setIsSaved(false);
    };

    const renderInputScreen = () => (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-center mb-2 text-white">AI Event Poster Maker</h2>
            <p className="text-slate-400 text-center -mt-8 mb-10">Turn your event photos into promotional posters instantly.</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="p-4 md:p-6 bg-slate-900/60 backdrop-blur-lg border border-slate-700/50 rounded-xl" data-tooltip="Upload the main photo from your event. High-resolution images work best.">
                    <h3 className="text-xl font-bold text-white mb-1">1. Upload Event Photo</h3>
                    <p className="text-sm text-slate-400 mb-4">Provide one high-quality image from your event.</p>
                    <div className="p-6 border-2 border-dashed border-slate-700 rounded-xl text-center bg-slate-800/50 hover:border-slate-600 transition h-48 flex flex-col justify-center">
                         <input type="file" id="file-upload" className="hidden" accept="image/png, image/jpeg" onChange={handleFileChange} />
                         <label htmlFor="file-upload" className="cursor-pointer">
                            <HiArrowUpTray className="w-8 h-8 mx-auto text-slate-500 mb-2"/>
                            <p className="text-slate-300 font-semibold">Click to upload or drag & drop</p>
                         </label>
                    </div>
                     {originalImage && 
                        <div className="flex justify-center mt-4">
                            <div className="relative group w-24 h-24">
                                <img src={`data:${originalImage.mimeType};base64,${originalImage.base64}`} alt={originalImage.name} className="rounded-lg object-cover w-full h-full"/>
                                <button onClick={() => setOriginalImage(null)} className="absolute top-1 right-1 bg-black/60 rounded-full p-1 text-white hover:bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <HiXMark className="w-4 h-4 icon-hover-effect" />
                                </button>
                            </div>
                        </div>
                    }
                </div>
                 <div className="p-4 md:p-6 bg-slate-900/60 backdrop-blur-lg border border-slate-700/50 rounded-xl space-y-4">
                    <h3 className="text-xl font-bold text-white mb-1">2. Add Text & Details</h3>
                    <div data-tooltip="This is the main, attention-grabbing text on your poster.">
                        <label className="font-semibold text-slate-300 flex items-center gap-2"><HiOutlineChatBubbleLeftRight className="w-5 h-5 text-pink-400"/> Headline</label>
                        <input type="text" value={headline} onChange={e => setHeadline(e.target.value)} placeholder="e.g., 'Annual Gala Dinner'" className="w-full p-2 mt-1 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 transition text-sm" />
                    </div>
                     <div data-tooltip="Add your brand name, a sponsor's logo, or a website URL.">
                        <label className="font-semibold text-slate-300 flex items-center gap-2"><HiOutlineTag className="w-5 h-5 text-sky-400"/> Branding Details (Optional)</label>
                        <input type="text" value={branding} onChange={e => setBranding(e.target.value)} placeholder="e.g., 'Sponsored by DreamPixel'" className="w-full p-2 mt-1 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 transition text-sm" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div data-tooltip="Date of the event.">
                            <label className="font-semibold text-slate-300 flex items-center gap-2"><HiOutlineCalendar className="w-5 h-5 text-emerald-400"/> Date</label>
                            <input type="text" value={date} onChange={e => setDate(e.target.value)} placeholder="e.g., October 26th" className="w-full p-2 mt-1 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 transition text-sm" />
                        </div>
                        <div data-tooltip="Time of the event.">
                            <label className="font-semibold text-slate-300 flex items-center gap-2"><HiOutlineClock className="w-5 h-5 text-emerald-400"/> Time</label>
                            <input type="text" value={time} onChange={e => setTime(e.target.value)} placeholder="e.g., 7 PM onwards" className="w-full p-2 mt-1 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 transition text-sm" />
                        </div>
                    </div>
                     <div data-tooltip="Location of the event.">
                        <label className="font-semibold text-slate-300 flex items-center gap-2"><HiOutlineMapPin className="w-5 h-5 text-amber-400"/> Venue</label>
                        <input type="text" value={venue} onChange={e => setVenue(e.target.value)} placeholder="e.g., The Grand Ballroom" className="w-full p-2 mt-1 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 transition text-sm" />
                    </div>
                </div>
            </div>
            <StyleSelector
                title="3. Choose a Text Style"
                tooltip="Select a style to define the font and visual treatment of the text on your poster."
                stylesData={EVENT_POSTER_STYLES}
                selectedStyleId={selectedStyleId}
                onStyleSelect={setSelectedStyleId}
            />
             <div className="flex justify-center pt-8">
                <button onClick={handleGenerate} disabled={isLoading || !originalImage || !headline.trim()} className="flex items-center gap-3 px-8 py-4 bg-primary-gradient text-white font-bold text-lg rounded-lg hover:opacity-90 transition-all duration-300 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed transform hover:scale-105">
                    {isLoading ? <div className="w-6 h-6 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : <HiOutlineSparkles className="w-6 h-6"/>}
                    {isLoading ? loadingMessage : 'Create Poster'}
                </button>
            </div>
        </div>
    );

    const renderResultScreen = () => (
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
             <h2 className="text-3xl font-bold text-center mb-8 text-white">Your Event Poster is Ready!</h2>
             {editedImage && (
                <img src={`data:image/png;base64,${editedImage}`} alt="Edited Event Poster" className="rounded-xl mx-auto shadow-2xl shadow-black/30 mb-8 border-2 border-slate-700/50" />
             )}
             <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center items-center gap-4">
                 <button onClick={handleReset} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 transition-all duration-300 border border-slate-700 icon-hover-effect">
                    <HiArrowLeft className="w-5 h-5 text-slate-300"/> Create Another
                 </button>
                 <div className="relative group" title={!session ? 'Please sign in to save creations' : ''}>
                    <button onClick={handleSaveCreation} disabled={isSaved || !session} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700 transition-all duration-300 border border-slate-700 disabled:opacity-60 disabled:cursor-not-allowed icon-hover-effect icon-hover-effect-pink">
                        <HiOutlineHeart className={`w-5 h-5 transition-colors ${isSaved ? 'text-pink-500' : 'text-pink-400'}`} /> {isSaved ? 'Saved!' : 'Like & Save'}
                    </button>
                 </div>
                 <a href={`data:image/png;base64,${editedImage}`} download="dreampixel-event-poster.png" className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary-gradient text-white font-bold rounded-lg hover:opacity-90 transition-all duration-300 transform hover:scale-105">
                    <HiArrowDownTray className="w-5 h-5"/> Download Poster
                 </a>
             </div>
        </div>
    );

    const renderGeneratingStep = () => (
         <div className="text-center py-20 animate-fade-in">
            <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-purple-400 rounded-full animate-spin"></div>
            </div>
            <h2 className="text-3xl font-bold mt-8 text-white">{loadingMessage}</h2>
            <p className="text-slate-400 mt-2">This can take up to a minute. Please don't close the window.</p>
        </div>
    );

    return (
        <div className="animate-fade-in">
            <ErrorMessage error={error} />
            <div className="p-4 sm:p-6 md:p-8 bg-slate-900/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg">
                {isLoading && renderGeneratingStep()}
                {!isLoading && editedImage && renderResultScreen()}
                {!isLoading && !editedImage && renderInputScreen()}
            </div>
        </div>
    );
};