import React, { useState, useCallback } from 'react';
import Cropper, { Point, Area } from 'react-easy-crop';
import { UploadedFile } from '../types';
import { getCroppedImg, resizeAndCompressImage } from '../utils/cropImage';
import { HiArrowUpTray, HiArrowDownTray, HiOutlineSparkles, HiOutlineCheckCircle, HiOutlineExclamationTriangle, HiXMark, HiArrowPath } from 'react-icons/hi2';

export interface ToolConfig {
    title: string;
    outputWidth: number;
    outputHeight: number;
    minSizeKB: number;
    maxSizeKB: number;
    aspect: number;
}

interface ResizerToolProps {
    config: ToolConfig;
    onNavigateHome: () => void;
}

export const ResizerTool: React.FC<ResizerToolProps> = ({ config, onNavigateHome }) => {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [originalFile, setOriginalFile] = useState<File | null>(null);
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [finalImage, setFinalImage] = useState<{ base64: string; sizeKB: number } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            setOriginalFile(file);
            const reader = new FileReader();
            reader.onload = () => {
                setImageSrc(reader.result as string);
                setFinalImage(null);
                setError(null);
            };
            reader.readAsDataURL(file);
            event.target.value = '';
        }
    };

    const handleCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleCreateImage = async () => {
        if (!imageSrc || !croppedAreaPixels) {
            setError('Please crop the image first.');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const croppedImageBase64 = await getCroppedImg(imageSrc, croppedAreaPixels);
            const result = await resizeAndCompressImage(croppedImageBase64, config.outputWidth, config.outputHeight, config.maxSizeKB);
            setFinalImage(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to process the image.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleReset = () => {
        setImageSrc(null);
        setOriginalFile(null);
        setFinalImage(null);
        setError(null);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
    };

    const isSizeValid = finalImage && finalImage.sizeKB >= config.minSizeKB && finalImage.sizeKB <= config.maxSizeKB;

    return (
        <div className="p-4 sm:p-6 md:p-8 bg-slate-900/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg max-w-4xl mx-auto animate-fade-in">
            <h2 className="text-3xl font-bold text-center mb-2 text-white">{config.title}</h2>
            <p className="text-slate-400 text-center mb-8">
                Crop and resize your image to the required dimensions and file size.
            </p>

            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 text-center mb-8">
                <h3 className="font-semibold text-white">Requirements</h3>
                <p className="text-sm text-slate-300">
                    Dimensions: <span className="font-bold text-amber-400">{config.outputWidth}px (W) &times; {config.outputHeight}px (H)</span> | 
                    File Size: <span className="font-bold text-amber-400">{config.minSizeKB}KB - {config.maxSizeKB}KB</span>
                </p>
            </div>

            {error && (
                <div className="bg-red-900/50 border border-red-500 text-red-300 p-3 rounded-lg mb-6 text-center">
                    {error}
                </div>
            )}
            
            {!imageSrc && (
                <div className="p-6 border-2 border-dashed border-slate-700 rounded-xl text-center bg-slate-800/50 hover:border-slate-600 transition h-48 flex flex-col justify-center">
                    <input type="file" id="file-upload" className="hidden" accept="image/png, image/jpeg" onChange={handleFileChange} />
                    <label htmlFor="file-upload" className="cursor-pointer">
                        <HiArrowUpTray className="w-8 h-8 mx-auto text-slate-500 mb-2"/>
                        <p className="text-slate-300 font-semibold">Click to upload or drag & drop</p>
                    </label>
                </div>
            )}

            {imageSrc && !finalImage && (
                <div className="space-y-6">
                    <div className="relative h-96 w-full bg-slate-900 rounded-lg">
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={config.aspect}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={handleCropComplete}
                        />
                    </div>
                     <div className="flex justify-center pt-4 gap-4">
                        <button onClick={handleReset} className="flex items-center gap-2 px-6 py-3 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 transition-all duration-300 border border-slate-700">
                            <HiXMark className="w-5 h-5"/> Reset
                        </button>
                        <button onClick={handleCreateImage} disabled={isLoading} className="flex items-center gap-3 px-8 py-3 bg-primary-gradient text-white font-bold text-lg rounded-lg hover:opacity-90 transition-all duration-300 disabled:opacity-50 transform hover:scale-105">
                            {isLoading ? <div className="w-6 h-6 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : <HiOutlineSparkles className="w-6 h-6"/>}
                            {isLoading ? 'Processing...' : `Make ${config.title.split(' ')[0]}`}
                        </button>
                    </div>
                </div>
            )}

            {finalImage && (
                <div className="text-center space-y-6">
                     <h3 className="text-2xl font-bold text-white">Your Image is Ready!</h3>
                     <div className="inline-block p-2 bg-slate-800 rounded-lg border border-slate-700">
                        <img 
                            src={finalImage.base64} 
                            alt="Final processed" 
                            className="rounded-md"
                            style={{ width: config.outputWidth, height: config.outputHeight }}
                        />
                     </div>
                     <div className={`p-3 rounded-lg inline-flex items-center gap-2 text-sm font-semibold ${isSizeValid ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'}`}>
                        {isSizeValid ? <HiOutlineCheckCircle className="w-5 h-5"/> : <HiOutlineExclamationTriangle className="w-5 h-5"/>}
                        File Size: {finalImage.sizeKB.toFixed(2)} KB
                     </div>
                    <div className="flex justify-center pt-4 gap-4">
                        <button onClick={handleReset} className="flex items-center gap-2 px-6 py-3 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 transition-all duration-300 border border-slate-700">
                            <HiArrowPath className="w-5 h-5"/> Start Over
                        </button>
                        <a 
                            href={finalImage.base64} 
                            download={`${originalFile?.name.split('.')[0]}_resized.jpeg`}
                            className="flex items-center gap-3 px-8 py-3 bg-primary-gradient text-white font-bold text-lg rounded-lg hover:opacity-90 transition-all duration-300 transform hover:scale-105"
                        >
                            <HiArrowDownTray className="w-6 h-6"/> Download
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
};
