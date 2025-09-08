import React, { useState, useEffect } from 'react';
import { UploadedFile, NewspaperStyle } from '../types';
import { generateNewspaperCutting } from '../services/aiService';
import { NEWSPAPER_STYLES } from '../services/constants';
import * as historyService from '../services/historyService';
import * as jobService from '../services/jobService';
import { HiArrowDownTray, HiOutlineHeart, HiOutlineSparkles, HiArrowUpTray, HiXMark, HiArrowLeft, HiOutlineNewspaper, HiCalendar, HiPencil } from 'react-icons/hi2';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from './ErrorMessage';
import StyleSelector from './StyleSelector';
import { resizeImage } from '../utils/cropImage';

interface NewspaperCuttingMakerProps {
    onNavigateHome: () => void;
    onCreationGenerated: () => void;
    onGenerating: (isGenerating: boolean) => void;
}

export const NewspaperCuttingMaker: React.FC<NewspaperCuttingMakerProps> = ({ onNavigateHome, onCreationGenerated, onGenerating }) => {
    const { session } = useAuth();
    const [image, setImage] = useState<UploadedFile | null>(null);
    const [headline, setHeadline] = useState('');
    const [bodyText, setBodyText] = useState('');
    const [newspaperName, setNewspaperName] = useState('The Daily Chronicle');
    const [date, setDate] = useState(new Date().toLocaleDateString('en-CA'));
    const [selectedStyleId, setSelectedStyleId] = useState<string>(NEWSPAPER_STYLES[0].id);
    
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
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
                'Setting the printing press...',
                'Typesetting your article...',
                'Adding halftone effect to photo...',
                'Aging the newsprint...',
                'Creating final clipping...',
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
                const resizedImage = await resizeImage(file, 1024);
                setImage(resizedImage);
            } catch (error) {
                console.error("Error resizing image:", error);
                setError("Failed to process image. Please try a different file.");
            }
            event.target.value = '';
        }
    };
    
    const handleGenerate = async () => {
        if (!image) {
            setError('Please upload an image for the article.');
            return;
        }
        if (!headline.trim() || !bodyText.trim()) {
            setError('Please provide a headline and body text.');
            return;
        }
        const selectedStyle = NEWSPAPER_STYLES.find(s => s.id === selectedStyleId);
        if (!selectedStyle) {
            setError('Please select a valid newspaper style.');
            return;
        }

        if (session) {
            // jobService.saveNewspaperJob({...}); // TODO: Add to jobService
        }
        
        setIsLoading(true);
        setError(null);
        setIsSaved(false);
        try {
            const result = await generateNewspaperCutting(image, headline, bodyText, newspaperName, date, selectedStyle);
            if (result) {
                setGeneratedImage(result);
            } else {
                throw new Error("The AI failed to generate the newspaper cutting. The content may have been blocked by safety filters.");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate the image.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveCreation = async () => {
        if (generatedImage && !isSaved && session) {
            const prompt = `Newspaper Clipping: ${headline}`;
            const newEntry = {
                id: '',
                prompt,
                imageUrl: `data:image/png;base64,${generatedImage}`,
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
        setImage(null);
        setGeneratedImage(null);
        setError(null);
        setIsLoading(false);
        setIsSaved(false);
    };

    const renderInputForm = () => (
         <div className="space-y-8">
            <h2 className="text-3xl font-bold text-center mb-2 text-white">AI Newspaper Cutting Maker</h2>
            <p className="text-slate-400 text-center -mt-8 mb-10">Turn your photos and stories into realistic newspaper clippings.</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="p-4 md:p-6 bg-slate-900/60 backdrop-blur-lg border border-slate-700/50 rounded-xl" data-tooltip="Upload the photo to be featured in the newspaper article.">
                    <h3 className="text-xl font-bold text-white mb-1">1. Upload a Photo</h3>
                    <p className="text-sm text-slate-400 mb-4">This will be the main image in your news story.</p>
                    <div className="p-6 border-2 border-dashed border-slate-700 rounded-xl text-center bg-slate-800/50 hover:border-slate-600 transition h-48 flex flex-col justify-center">
                         <input type="file" id="file-upload" className="hidden" accept="image/png, image/jpeg" onChange={handleFileChange} />
                         <label htmlFor="file-upload" className="cursor-pointer">
                            <HiArrowUpTray className="w-8 h-8 mx-auto text-slate-500 mb-2"/>
                            <p className="text-slate-300 font-semibold">Click to upload or drag & drop</p>
                         </label>
                    </div>
                     {image && 
                        <div className="flex justify-center mt-4">
                            <div className="relative group w-24 h-24">
                                <img src={`data:${image.mimeType};base64,${image.base64}`} alt={image.name} className="rounded-lg object-cover w-full h-full"/>
                                <button onClick={() => setImage(null)} className="absolute top-1 right-1 bg-black/60 rounded-full p-1 text-white hover:bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <HiXMark className="w-4 h-4 icon-hover-effect" />
                                </button>
                            </div>
                        </div>
                    }
                </div>
                 <div className="p-4 md:p-6 bg-slate-900/60 backdrop-blur-lg border border-slate-700/50 rounded-xl space-y-4">
                    <h3 className="text-xl font-bold text-white mb-1">2. Write Your Article</h3>
                     <div className="flex items-center gap-3"><HiOutlineNewspaper className="w-5 h-5 text-purple-400"/><input value={newspaperName} onChange={(e) => setNewspaperName(e.target.value)} placeholder="Newspaper Name" className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 transition text-sm" /></div>
                     <div className="flex items-center gap-3"><HiCalendar className="w-5 h-5 text-purple-400"/><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 transition text-sm" /></div>
                    <div className="flex items-start gap-3"><HiPencil className="w-5 h-5 mt-2 text-purple-400"/><input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Headline" className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 transition text-sm" /></div>
                    <textarea value={bodyText} onChange={(e) => setBodyText(e.target.value)} placeholder="Body text for the article..." className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 transition text-sm" rows={4}></textarea>
                </div>
            </div>
            <StyleSelector
                title="3. Choose a Newspaper Style"
                tooltip="Select a style to define the look and feel of your newspaper clipping."
                stylesData={NEWSPAPER_STYLES}
                selectedStyleId={selectedStyleId}
                onStyleSelect={setSelectedStyleId}
            />
             <div className="flex justify-center pt-8">
                <button onClick={handleGenerate} disabled={isLoading || !image || !headline.trim()} className="flex items-center gap-3 px-8 py-4 bg-primary-gradient text-white font-bold text-lg rounded-lg hover:opacity-90 transition-all duration-300 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed transform hover:scale-105">
                    {isLoading ? <div className="w-6 h-6 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : <HiOutlineSparkles className="w-6 h-6"/>}
                    {isLoading ? loadingMessage : 'Create Newspaper Cutting'}
                </button>
            </div>
        </div>
    );

    const renderResultScreen = () => (
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
             <h2 className="text-3xl font-bold text-center mb-8 text-white">Your Newspaper Clipping is Ready!</h2>
             {generatedImage && (
                <div className="inline-block p-4 bg-slate-700/50 rounded-xl" style={{ transform: 'rotate(-2deg)' }}>
                    <img src={`data:image/png;base64,${generatedImage}`} alt="Generated Newspaper Cutting" className="rounded-lg mx-auto shadow-2xl shadow-black/30 border-2 border-slate-700/50 max-w-lg w-full" />
                </div>
             )}
             <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center items-center gap-4 mt-8">
                 <button onClick={handleReset} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 transition-all duration-300 border border-slate-700 icon-hover-effect">
                    <HiArrowLeft className="w-5 h-5 text-slate-300"/> Create Another
                 </button>
                 <div className="relative group" title={!session ? 'Please sign in to save creations' : ''}>
                    <button onClick={handleSaveCreation} disabled={isSaved || !session} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700 transition-all duration-300 border border-slate-700 disabled:opacity-60 disabled:cursor-not-allowed icon-hover-effect icon-hover-effect-pink">
                        <HiOutlineHeart className={`w-5 h-5 transition-colors ${isSaved ? 'text-pink-500' : 'text-pink-400'}`} /> {isSaved ? 'Saved!' : 'Like & Save'}
                    </button>
                 </div>
                 <a href={`data:image/png;base64,${generatedImage}`} download="dreampixel-newspaper.png" className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary-gradient text-white font-bold rounded-lg hover:opacity-90 transition-all duration-300 transform hover:scale-105">
                    <HiArrowDownTray className="w-5 h-5"/> Download
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
            <p className="text-slate-400 mt-2">This is a complex generation, please wait.</p>
        </div>
    );

    return (
        <div className="animate-fade-in">
            <ErrorMessage error={error} />
            <div className="p-4 sm:p-6 md:p-8 bg-slate-900/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg">
                {isLoading ? renderGeneratingStep() : (generatedImage ? renderResultScreen() : renderInputForm())}
            </div>
        </div>
    );
};