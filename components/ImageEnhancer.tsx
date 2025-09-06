import React, { useState, useEffect, useRef, useCallback } from 'react';
import { UploadedFile } from '../types';
import { enhanceImage } from '../services/aiService';
import * as historyService from '../services/historyService';
import * as jobService from '../services/jobService';
import { HiArrowDownTray, HiOutlineHeart, HiOutlineSparkles, HiArrowUpTray, HiXMark, HiArrowLeft, HiOutlineArrowPath, HiChevronLeft, HiChevronRight } from 'react-icons/hi2';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from './ErrorMessage';
import { resizeImage } from '../utils/cropImage';

interface ImageEnhancerProps {
    onNavigateHome: () => void;
    onCreationGenerated: () => void;
    onGenerating: (isGenerating: boolean) => void;
}

export const ImageEnhancer: React.FC<ImageEnhancerProps> = ({ onNavigateHome, onCreationGenerated, onGenerating }) => {
    const { session } = useAuth();
    const [originalImage, setOriginalImage] = useState<UploadedFile | null>(null);
    const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [isSaved, setIsSaved] = useState(false);
    
    // State for the comparison slider
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const imageContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        onGenerating(isLoading);
    }, [isLoading, onGenerating]);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isLoading) {
            const messages = [
                'Analyzing image pixels...',
                'Upscaling resolution...',
                'Reconstructing fine details...',
                'Remastering lighting & colors...',
                'Applying finishing touches...',
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
                // Enhancer can handle larger images, but we still cap it to prevent browser issues.
                const resizedImage = await resizeImage(file, 4096);
                setOriginalImage(resizedImage);
                setEnhancedImage(null);
                setError(null);
                setIsSaved(false);
            } catch (error) {
                console.error("Error processing image:", error);
                setError("Failed to process image. Please try a different file.");
            }
            event.target.value = '';
        }
    };
    
    const handleEnhanceImage = async () => {
        if (!originalImage) {
            setError('Please upload an image to enhance.');
            return;
        }

        if (session) {
            jobService.saveImageEnhancerJob({
                userId: session.user.id,
                originalImageFilename: originalImage.name,
            });
        }
        
        setIsLoading(true);
        setError(null);
        setIsSaved(false);
        try {
            const result = await enhanceImage(originalImage);
            if (result) {
                setEnhancedImage(result);
            } else {
                throw new Error("The AI failed to enhance the image. Please try again with a different image.");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to enhance image.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleEnhanceMore = async () => {
        if (!enhancedImage) {
            setError('No enhanced image to improve further.');
            return;
        }

        const imageToEnhance: UploadedFile = {
            base64: enhancedImage,
            mimeType: 'image/png', // The AI returns a PNG
            name: `enhanced_${originalImage?.name || 'image.png'}`
        };

        setIsLoading(true);
        setError(null);
        setIsSaved(false);

        try {
            const result = await enhanceImage(imageToEnhance);
            if (result) {
                setOriginalImage(imageToEnhance);
                setEnhancedImage(result);
            } else {
                throw new Error("The AI failed to enhance the image further. Please try again.");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to enhance image.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveCreation = async () => {
        if (enhancedImage && !isSaved && session) {
            const newEntry = {
                id: '',
                prompt: 'AI Image Enhancement',
                imageUrl: `data:image/png;base64,${enhancedImage}`,
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
        setEnhancedImage(null);
        setError(null);
        setIsLoading(false);
        setIsSaved(false);
    };
    
    // Slider Drag Logic
    const handleSliderMove = useCallback((clientX: number) => {
        if (!isDragging || !imageContainerRef.current) return;
        const rect = imageContainerRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
        setSliderPosition(position);
    }, [isDragging]);

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);
    
    const handleMouseMove = useCallback((e: MouseEvent) => {
        handleSliderMove(e.clientX);
    }, [handleSliderMove]);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);


    return (
        <div className="animate-fade-in">
            <ErrorMessage error={error} />
            <div className="p-4 sm:p-6 md:p-8 bg-slate-900/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg">
                <h2 className="text-3xl font-bold text-center mb-2 text-white">10x AI Image Enhancer</h2>
                <p className="text-slate-400 text-center mb-10">Upload any image to dramatically improve its quality, lighting, and clarity.</p>

                {!enhancedImage && !isLoading && (
                    <div className="max-w-2xl mx-auto">
                        <div className="p-6 border-2 border-dashed border-slate-700 rounded-xl text-center bg-slate-800/50 hover:border-slate-600 transition h-48 flex flex-col justify-center" data-tooltip="Upload any JPG or PNG image. The AI will upscale, clean, and relight it for a professional look.">
                             <input type="file" id="file-upload" className="hidden" accept="image/png, image/jpeg" onChange={handleFileChange} />
                             <label htmlFor="file-upload" className="cursor-pointer">
                                <HiArrowUpTray className="w-8 h-8 mx-auto text-slate-500 mb-2"/>
                                <p className="text-slate-300 font-semibold">Click to upload or drag & drop</p>
                                <p className="text-xs text-slate-500">PNG or JPG</p>
                             </label>
                        </div>
                         {originalImage && 
                            <div className="flex justify-center mt-4">
                                <div className="relative group w-32 h-32">
                                    <img src={`data:${originalImage.mimeType};base64,${originalImage.base64}`} alt={originalImage.name} className="rounded-lg object-cover w-full h-full"/>
                                    <button onClick={() => setOriginalImage(null)} className="absolute top-1 right-1 bg-black/60 rounded-full p-1 text-white hover:bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <HiXMark className="w-4 h-4 icon-hover-effect" />
                                    </button>
                                </div>
                            </div>
                        }
                         <div className="flex justify-center pt-8">
                            <button onClick={handleEnhanceImage} disabled={isLoading || !originalImage} className="flex items-center gap-3 px-8 py-4 bg-primary-gradient text-white font-bold text-lg rounded-lg hover:opacity-90 transition-all duration-300 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed transform hover:scale-105">
                                <HiOutlineSparkles className="w-6 h-6"/>
                                Enhance Image
                            </button>
                        </div>
                    </div>
                )}

                {isLoading && (
                     <div className="text-center py-20 animate-fade-in">
                        <div className="relative w-24 h-24 mx-auto">
                            <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-t-purple-400 rounded-full animate-spin"></div>
                        </div>
                        <h2 className="text-3xl font-bold mt-8 text-white">{loadingMessage}</h2>
                        <p className="text-slate-400 mt-2">This can take up to a minute. Please wait.</p>
                    </div>
                )}

                {originalImage && enhancedImage && !isLoading && (
                    <div className="animate-fade-in">
                        <div 
                            ref={imageContainerRef}
                            className="relative w-full max-w-3xl mx-auto select-none overflow-hidden rounded-xl border-2 border-slate-700/50"
                            onMouseMove={(e) => handleSliderMove(e.clientX)}
                            onMouseUp={handleMouseUp}
                            data-tooltip="Drag the slider to compare the 'Before' and 'After' versions of the image."
                        >
                            {/* Enhanced Image (Bottom Layer) */}
                            <img src={`data:image/png;base64,${enhancedImage}`} alt="Enhanced" className="block w-full h-auto" />
                            
                            {/* Original Image (Top Layer, Clipped) */}
                            <div className="absolute top-0 left-0 h-full w-full overflow-hidden" style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}>
                                <img src={`data:${originalImage.mimeType};base64,${originalImage.base64}`} alt="Original" className="block w-full h-auto absolute top-0 left-0" />
                            </div>

                            {/* Slider Handle */}
                            <div 
                                className="absolute top-0 bottom-0 w-1 bg-white/50 cursor-ew-resize"
                                style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                                onMouseDown={handleMouseDown}
                            >
                                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-12 w-12 bg-white/80 backdrop-blur-md rounded-full border-2 border-white/50 shadow-lg flex items-center justify-center text-slate-800">
                                    <HiChevronLeft className="w-6 h-6" /><HiChevronRight className="w-6 h-6" />
                                </div>
                            </div>
                             {/* Labels */}
                            <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full pointer-events-none">Before</div>
                            <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full pointer-events-none">After</div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center items-center gap-4 mt-8">
                             <button onClick={handleReset} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 transition-all duration-300 border border-slate-700 icon-hover-effect">
                                <HiArrowLeft className="w-5 h-5 text-slate-300"/> Start Over
                             </button>
                             <div data-tooltip="Run the enhancement process again on the current 'After' image for even more quality improvements.">
                                <button onClick={handleEnhanceMore} disabled={isLoading} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700 transition-all duration-300 border border-slate-700 disabled:opacity-60 disabled:cursor-not-allowed icon-hover-effect icon-hover-effect-blue">
                                    <HiOutlineArrowPath className="w-5 h-5 text-sky-400"/> Enhance More
                                </button>
                             </div>
                             <div className="relative group" title={!session ? 'Please sign in to save creations' : ''}>
                                <button onClick={handleSaveCreation} disabled={isSaved || !session} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700 transition-all duration-300 border border-slate-700 disabled:opacity-60 disabled:cursor-not-allowed icon-hover-effect icon-hover-effect-pink">
                                    <HiOutlineHeart className={`w-5 h-5 transition-colors ${isSaved ? 'text-pink-500' : 'text-pink-400'}`} /> {isSaved ? 'Saved!' : 'Like & Save'}
                                </button>
                             </div>
                             <a href={`data:image/png;base64,${enhancedImage}`} download="dreampixel-enhanced.png" className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary-gradient text-white font-bold rounded-lg hover:opacity-90 transition-all duration-300 transform hover:scale-105">
                                <HiArrowDownTray className="w-5 h-5"/> Download
                             </a>
                         </div>
                    </div>
                )}
            </div>
        </div>
    );
};
