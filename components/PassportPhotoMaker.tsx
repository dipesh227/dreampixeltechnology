import React, { useState, useEffect, useCallback } from 'react';
import { UploadedFile, PassportPhotoStyle, PassportPhotoSize } from '../types';
import { generatePassportPhoto, enhanceImage } from '../services/aiService';
import { PASSPORT_PHOTO_STYLES, PASSPORT_PHOTO_SIZES } from '../services/constants';
import * as historyService from '../services/historyService';
import * as jobService from '../services/jobService';
import { HiArrowDownTray, HiOutlineHeart, HiOutlineSparkles, HiArrowUpTray, HiXMark, HiArrowLeft, HiOutlinePrinter, HiOutlinePhoto } from 'react-icons/hi2';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from './ErrorMessage';

type Step = 'input' | 'generating' | 'result';

interface PassportPhotoMakerProps {
    onNavigateHome: () => void;
    onCreationGenerated: () => void;
    onGenerating: (isGenerating: boolean) => void;
}

const PassportPhotoMaker: React.FC<PassportPhotoMakerProps> = ({ onNavigateHome, onCreationGenerated, onGenerating }) => {
    const { session } = useAuth();
    const [step, setStep] = useState<Step>('input');
    const [uploadedImage, setUploadedImage] = useState<UploadedFile | null>(null);
    const [selectedStyleId, setSelectedStyleId] = useState<string>(PASSPORT_PHOTO_STYLES[0].id);
    const [selectedSizeId, setSelectedSizeId] = useState<string>(PASSPORT_PHOTO_SIZES[0].id);
    const [customBackgroundColor, setCustomBackgroundColor] = useState<string>('#FFFFFF');
    const [photoCount, setPhotoCount] = useState<number>(8);

    const [generatedSinglePhoto, setGeneratedSinglePhoto] = useState<string | null>(null);
    const [generatedSheet, setGeneratedSheet] = useState<string | null>(null);
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
            const messages = ['Enhancing photo quality...', 'Removing original background...', 'Changing outfit...', 'Applying new background...', 'Compositing final image...', 'Generating print-ready sheet...'];
            let index = 0;
            setLoadingMessage(messages[index]);
            interval = setInterval(() => {
                index = (index + 1) % messages.length;
                setLoadingMessage(messages[index]);
            }, 2500);
        }
        return () => clearInterval(interval);
    }, [isLoading]);

    const handleReset = () => {
        setStep('input');
        setUploadedImage(null);
        setGeneratedSinglePhoto(null);
        setGeneratedSheet(null);
        setError(null);
        setIsLoading(false);
        setIsSaved(false);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = (reader.result as string).split(',')[1];
                setUploadedImage({ base64, mimeType: file.type, name: file.name });
            };
            reader.readAsDataURL(file);
            event.target.value = '';
        }
    };
    
    const createPrintSheet = useCallback(async (base64Image: string, size: PassportPhotoSize, count: number): Promise<string> => {
        const DPI = 300;
        const SHEET_WIDTH_IN = 4;
        const SHEET_HEIGHT_IN = 6;
        
        const canvas = document.createElement('canvas');
        canvas.width = SHEET_WIDTH_IN * DPI;
        canvas.height = SHEET_HEIGHT_IN * DPI;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error("Could not create canvas context");

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const photoWidthPx = (size.widthMM / 25.4) * DPI;
        const photoHeightPx = (size.heightMM / 25.4) * DPI;

        const img = new Image();
        await new Promise<void>(resolve => {
            img.onload = () => resolve();
            img.src = `data:image/png;base64,${base64Image}`;
        });

        let photosDrawn = 0;
        const PADDING = 0.1 * DPI; // 0.1 inch padding

        for (let y = PADDING; y < canvas.height - photoHeightPx && photosDrawn < count; y += photoHeightPx + PADDING) {
            for (let x = PADDING; x < canvas.width - photoWidthPx && photosDrawn < count; x += photoWidthPx + PADDING) {
                ctx.drawImage(img, x, y, photoWidthPx, photoHeightPx);
                photosDrawn++;
            }
        }

        return canvas.toDataURL('image/jpeg', 0.95).split(',')[1];
    }, []);

    const handleGenerate = async () => {
        if (!uploadedImage) {
            setError('Please upload a photo.');
            return;
        }

        if (session) {
            jobService.savePassportPhotoJob({
                userId: session.user.id,
                styleId: selectedStyleId,
                sizeId: selectedSizeId,
                backgroundColor: customBackgroundColor,
                photoCount,
                originalImageFilename: uploadedImage.name,
            });
        }
        
        setIsLoading(true);
        setError(null);
        setIsSaved(false);
        setStep('generating');

        try {
            setLoadingMessage('Enhancing photo for best quality...');
            const enhancedResult = await enhanceImage(uploadedImage);
            if (!enhancedResult) throw new Error('Initial image enhancement failed.');
            
            const enhancedFile: UploadedFile = {
                base64: enhancedResult,
                mimeType: 'image/png',
                name: `enhanced_${uploadedImage.name}`
            };

            const selectedStyle = PASSPORT_PHOTO_STYLES.find(s => s.id === selectedStyleId);
            if (!selectedStyle) throw new Error("A style must be selected.");

            setLoadingMessage('Generating passport photo...');
            const photoResult = await generatePassportPhoto(enhancedFile, selectedStyle.outfitPrompt, customBackgroundColor);
            
            if (photoResult) {
                setGeneratedSinglePhoto(photoResult);
                
                const selectedSize = PASSPORT_PHOTO_SIZES.find(s => s.id === selectedSizeId);
                if (!selectedSize) throw new Error("A size must be selected.");
                
                setLoadingMessage('Creating print-ready sheet...');
                const sheet = await createPrintSheet(photoResult, selectedSize, photoCount);
                setGeneratedSheet(sheet);
                setStep('result');
            } else {
                throw new Error("The AI failed to generate the photo. Please try another photo or style.");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate photo.');
            setStep('input');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSaveCreation = async () => {
        if (generatedSinglePhoto && !isSaved && session) {
            const selectedStyle = PASSPORT_PHOTO_STYLES.find(s => s.id === selectedStyleId);
            const prompt = `Passport Photo: ${selectedStyle?.name || 'Custom'} on ${customBackgroundColor} background.`;
            const newEntry = {
                id: '',
                prompt,
                imageUrl: `data:image/png;base64,${generatedSinglePhoto}`,
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

    const renderInputStep = () => (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-center mb-2 text-white">Passport & Visa Photo Maker</h2>
            <p className="text-slate-400 text-center -mt-8 mb-10">Create official, compliant photos for any purpose in seconds.</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="p-4 md:p-6 bg-slate-900/60 backdrop-blur-lg border border-slate-700/50 rounded-xl" data-tooltip="Upload a clear, forward-facing photo with good lighting. The AI will handle background removal and outfit changes.">
                    <h3 className="text-xl font-bold text-white mb-1">1. Upload a Photo</h3>
                    <p className="text-sm text-slate-400 mb-4">Use a clear, forward-facing photo. We'll handle the rest.</p>
                    <div className="p-6 border-2 border-dashed border-slate-700 rounded-xl text-center bg-slate-800/50 hover:border-slate-600 transition h-48 flex flex-col justify-center">
                         <input type="file" id="file-upload" className="hidden" accept="image/png, image/jpeg" onChange={handleFileChange} />
                         <label htmlFor="file-upload" className="cursor-pointer">
                            <HiArrowUpTray className="w-8 h-8 mx-auto text-slate-500 mb-2"/>
                            <p className="text-slate-300 font-semibold">Click to upload or drag & drop</p>
                         </label>
                    </div>
                     {uploadedImage && 
                        <div className="flex justify-center mt-4">
                            <div className="relative group w-24 h-24">
                                <img src={`data:${uploadedImage.mimeType};base64,${uploadedImage.base64}`} alt={uploadedImage.name} className="rounded-lg object-cover w-full h-full"/>
                                <button onClick={() => setUploadedImage(null)} className="absolute top-1 right-1 bg-black/60 rounded-full p-1 text-white hover:bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <HiXMark className="w-4 h-4 icon-hover-effect" />
                                </button>
                            </div>
                        </div>
                    }
                </div>

                 <div className="p-4 md:p-6 bg-slate-900/60 backdrop-blur-lg border border-slate-700/50 rounded-xl space-y-4">
                    <h3 className="text-xl font-bold text-white">2. Customize Your Photo</h3>
                    <div data-tooltip="Select the official size required for your document (e.g., passport, visa, specific exam).">
                        <label className="font-semibold text-slate-300">Official Size</label>
                        <select value={selectedSizeId} onChange={e => setSelectedSizeId(e.target.value)} className="w-full mt-2 p-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 transition text-sm">
                            {PASSPORT_PHOTO_SIZES.map(size => <option key={size.id} value={size.id}>{size.name} ({size.description})</option>)}
                        </select>
                    </div>
                     <div data-tooltip="Choose the background color. White and light blue are common for official documents. Use the color picker for specific hex codes.">
                        <label className="font-semibold text-slate-300">Background Color</label>
                        <div className="flex items-center gap-2 mt-2">
                           <input type="color" value={customBackgroundColor} onChange={e => setCustomBackgroundColor(e.target.value)} className="w-10 h-10 p-1 bg-slate-800 border border-slate-700 rounded-lg cursor-pointer" />
                           <button onClick={() => setCustomBackgroundColor('#FFFFFF')} className="w-8 h-8 bg-white rounded-full border-2 border-slate-500"></button>
                           <button onClick={() => setCustomBackgroundColor('#E1E9F1')} className="w-8 h-8 bg-[#E1E9F1] rounded-full border-2 border-slate-500"></button>
                           <button onClick={() => setCustomBackgroundColor('#808080')} className="w-8 h-8 bg-gray-500 rounded-full border-2 border-slate-500"></button>
                        </div>
                    </div>
                     <div data-tooltip="How many copies of the photo do you want on a standard 4x6 inch printable sheet?">
                        <label className="font-semibold text-slate-300">Number of Photos on 4x6 Sheet</label>
                        <input type="number" value={photoCount} onChange={e => setPhotoCount(parseInt(e.target.value))} min="1" max="20" className="w-full mt-2 p-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 transition text-sm" />
                    </div>
                </div>
            </div>
            <div className="p-4 md:p-6 bg-slate-900/60 backdrop-blur-lg border border-slate-700/50 rounded-xl" data-tooltip="The AI will replace the clothing in your photo with a professional outfit. Choose a style that fits your requirements.">
                 <h3 className="text-xl font-bold text-white mb-4">3. Choose Outfit Style</h3>
                 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {PASSPORT_PHOTO_STYLES.map((style: PassportPhotoStyle) => (
                        <button key={style.id} onClick={() => setSelectedStyleId(style.id)} className={`p-4 rounded-lg border-2 text-center transition-colors duration-200 text-sm ${selectedStyleId === style.id ? 'border-purple-500 bg-slate-800/50' : 'border-slate-800 bg-slate-900 hover:border-slate-700'}`}>
                            <p className="font-bold text-white">{style.name}</p>
                        </button>
                    ))}
                 </div>
            </div>
             <div className="flex justify-center pt-8">
                <button onClick={handleGenerate} disabled={isLoading || !uploadedImage} className="flex items-center gap-3 px-8 py-4 bg-primary-gradient text-white font-bold text-lg rounded-lg hover:opacity-90 transition-all duration-300 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed transform hover:scale-105">
                    {isLoading ? <div className="w-6 h-6 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : <HiOutlineSparkles className="w-6 h-6"/>}
                    {isLoading ? loadingMessage : 'Generate Passport Photo'}
                </button>
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

    const renderResultStep = () => {
        const size = PASSPORT_PHOTO_SIZES.find(s => s.id === selectedSizeId);
        if (!size) {
            setError("Could not find selected size information.");
            setStep('input');
            return null;
        }
        
        const photoWidthPx = (size.widthMM / 25.4) * 96; // 96 DPI for screen
        const photoHeightPx = (size.heightMM / 25.4) * 96;
        
        return (
            <div className="max-w-4xl mx-auto text-center animate-fade-in">
                 <h2 className="text-3xl font-bold text-center mb-8 text-white">Your Passport Photos are Ready!</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="flex flex-col items-center gap-4">
                        <h3 className="font-bold text-xl text-white">Single Photo ({size.description})</h3>
                        {generatedSinglePhoto && (
                           <img src={`data:image/png;base64,${generatedSinglePhoto}`} alt="Generated Passport Photo" className="rounded-lg shadow-lg border-2 border-slate-700" style={{width: `${photoWidthPx}px`, height: `${photoHeightPx}px`}} />
                        )}
                        <a href={`data:image/png;base64,${generatedSinglePhoto}`} download={`dreampixel-passport-photo.png`} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700 transition-all duration-300 border border-slate-700">
                           <HiOutlinePhoto className="w-5 h-5"/> Download Single Photo
                        </a>
                    </div>
                    <div className="flex flex-col items-center gap-4">
                         <h3 className="font-bold text-xl text-white">Printable 4x6 Sheet</h3>
                         {generatedSheet && (
                           <img src={`data:image/jpeg;base64,${generatedSheet}`} alt="Printable sheet" className="rounded-lg shadow-lg border-2 border-slate-700 w-full" style={{aspectRatio: '4 / 6'}} />
                        )}
                        <a href={`data:image/jpeg;base64,${generatedSheet}`} download={`dreampixel-passport-sheet.jpg`} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700 transition-all duration-300 border border-slate-700">
                           <HiOutlinePrinter className="w-5 h-5"/> Download Print Sheet
                        </a>
                    </div>
                 </div>
                 <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center items-center gap-4 mt-8">
                     <button onClick={handleReset} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 transition-all duration-300 border border-slate-700 icon-hover-effect">
                        <HiArrowLeft className="w-5 h-5 text-slate-300"/> Start Over
                     </button>
                     <div className="relative group" title={!session ? 'Please sign in to save creations' : ''}>
                        <button onClick={handleSaveCreation} disabled={isSaved || !session} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700 transition-all duration-300 border border-slate-700 disabled:opacity-60 disabled:cursor-not-allowed icon-hover-effect icon-hover-effect-pink">
                            <HiOutlineHeart className={`w-5 h-5 transition-colors ${isSaved ? 'text-pink-500' : 'text-pink-400'}`} /> {isSaved ? 'Saved!' : 'Like & Save'}
                        </button>
                     </div>
                 </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <ErrorMessage error={error} />
            <div className="p-4 sm:p-6 md:p-8 bg-slate-900/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg">
                {step === 'input' && renderInputStep()}
                {step === 'generating' && renderGeneratingStep()}
                {step === 'result' && renderResultStep()}
            </div>
        </div>
    );
};

export default PassportPhotoMaker;