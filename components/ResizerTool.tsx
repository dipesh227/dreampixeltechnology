import React, { useState, useCallback, useEffect } from 'react';
import Cropper, { Point, Area } from 'react-easy-crop';
import { UploadedFile } from '../types';
import { getCroppedImg, resizeAndCompressImage, enhanceImageWithCanvas } from '../utils/cropImage';
import { enhanceImage } from '../services/aiService';
import { HiArrowUpTray, HiArrowDownTray, HiOutlineSparkles, HiOutlineCheckCircle, HiOutlineExclamationTriangle, HiXMark, HiArrowPath, HiOutlineDocumentText } from 'react-icons/hi2';
import type { ExamPreset } from '../services/examPresets';

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
    presets?: ExamPreset[];
}

export const ResizerTool: React.FC<ResizerToolProps> = ({ config, onNavigateHome, presets }) => {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [originalFile, setOriginalFile] = useState<File | null>(null);
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [finalImage, setFinalImage] = useState<{ base64: string; sizeKB: number } | null>(null);
    
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);

    // New state for custom settings and enhancements
    const [useCustomSettings, setUseCustomSettings] = useState(false);
    const [customWidth, setCustomWidth] = useState(config.outputWidth);
    const [customHeight, setCustomHeight] = useState(config.outputHeight);
    const [customMinSize, setCustomMinSize] = useState(config.minSizeKB);
    const [customMaxSize, setCustomMaxSize] = useState(config.maxSizeKB);
    const [autoEnhance, setAutoEnhance] = useState(true);
    const [aiEnhance, setAiEnhance] = useState(false);
    
    const currentConfig = useCustomSettings
        ? { title: config.title, outputWidth: customWidth, outputHeight: customHeight, minSizeKB: customMinSize, maxSizeKB: customMaxSize, aspect: customWidth > 0 && customHeight > 0 ? customWidth / customHeight : 1 }
        : config;
        
    useEffect(() => {
        // When AI Enhance is checked, disable and uncheck auto-enhance as AI is superior
        if (aiEnhance && autoEnhance) {
            setAutoEnhance(false);
        }
    }, [aiEnhance, autoEnhance]);

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
            setLoadingMessage('Cropping image...');
            let processedImageBase64 = await getCroppedImg(imageSrc, croppedAreaPixels);

            if (aiEnhance) {
                setLoadingMessage('Super-enhancing with AI...');
                const enhanced = await enhanceImage({ base64: processedImageBase64.split(',')[1], mimeType: 'image/png', name: 'temp_enhancement' });
                if (enhanced) {
                    processedImageBase64 = `data:image/png;base64,${enhanced}`;
                } else {
                    console.warn("AI enhancement failed, proceeding without it.");
                }
            } else if (autoEnhance) {
                setLoadingMessage('Applying auto-enhancements...');
                processedImageBase64 = await enhanceImageWithCanvas(processedImageBase64);
            }

            setLoadingMessage('Resizing and compressing...');
            const result = await resizeAndCompressImage(processedImageBase64, currentConfig.outputWidth, currentConfig.outputHeight, currentConfig.maxSizeKB);
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
        setUseCustomSettings(false);
        setAutoEnhance(true);
        setAiEnhance(false);
    };
    
    const handlePresetChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedPresetName = event.target.value;
        if (!selectedPresetName) return;

        const preset = presets?.find(p => p.name === selectedPresetName);
        if (preset) {
            setCustomWidth(preset.width);
            setCustomHeight(preset.height);
            setCustomMinSize(preset.minSize);
            setCustomMaxSize(preset.maxSize);
        }
    };

    const isSizeValid = finalImage && finalImage.sizeKB >= currentConfig.minSizeKB && finalImage.sizeKB <= currentConfig.maxSizeKB;

    return (
        <div className="p-4 sm:p-6 md:p-8 bg-slate-900/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg max-w-5xl mx-auto animate-fade-in">
            <h2 className="text-3xl font-bold text-center mb-2 text-white">{config.title}</h2>
            <p className="text-slate-400 text-center mb-8">
                Crop and resize your image to the required dimensions and file size.
            </p>

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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="relative h-96 lg:h-[500px] w-full bg-slate-900 rounded-lg">
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={currentConfig.aspect}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={handleCropComplete}
                        />
                    </div>
                    <div className="space-y-6">
                        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                             <h3 className="font-semibold text-white mb-3">Settings</h3>
                             <div className="flex gap-2 mb-4">
                                <button onClick={() => setUseCustomSettings(false)} className={`w-full p-2 text-sm rounded-md transition-colors ${!useCustomSettings ? 'bg-purple-600 text-white font-semibold' : 'bg-slate-800 hover:bg-slate-700'}`}>Default</button>
                                <button onClick={() => setUseCustomSettings(true)} className={`w-full p-2 text-sm rounded-md transition-colors ${useCustomSettings ? 'bg-purple-600 text-white font-semibold' : 'bg-slate-800 hover:bg-slate-700'}`}>Custom</button>
                             </div>
                             {useCustomSettings ? (
                                <div className="space-y-3 text-sm animate-fade-in">
                                    {presets && presets.length > 0 && (
                                        <div className="mb-4">
                                            <label className="flex items-center gap-2 font-semibold text-slate-300 mb-1">
                                                <HiOutlineDocumentText className="w-5 h-5 text-sky-400" />
                                                Load Exam Preset
                                            </label>
                                            <select 
                                                onChange={handlePresetChange} 
                                                className="w-full mt-1 p-2 bg-slate-900 border border-slate-700 rounded-md"
                                                defaultValue=""
                                            >
                                                <option value="" disabled>Select a preset to auto-fill...</option>
                                                {presets.map(p => (
                                                    <option key={p.name} value={p.name}>
                                                        {p.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-2">
                                        <div><label>Width (px)</label><input type="number" value={customWidth} onChange={e => setCustomWidth(parseInt(e.target.value) || 0)} className="w-full mt-1 p-2 bg-slate-900 border border-slate-700 rounded-md"/></div>
                                        <div><label>Height (px)</label><input type="number" value={customHeight} onChange={e => setCustomHeight(parseInt(e.target.value) || 0)} className="w-full mt-1 p-2 bg-slate-900 border border-slate-700 rounded-md"/></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div><label>Min Size (KB)</label><input type="number" value={customMinSize} onChange={e => setCustomMinSize(parseInt(e.target.value) || 0)} className="w-full mt-1 p-2 bg-slate-900 border border-slate-700 rounded-md"/></div>
                                        <div><label>Max Size (KB)</label><input type="number" value={customMaxSize} onChange={e => setCustomMaxSize(parseInt(e.target.value) || 0)} className="w-full mt-1 p-2 bg-slate-900 border border-slate-700 rounded-md"/></div>
                                    </div>
                                </div>
                             ) : (
                                <div className="text-center text-sm p-4 bg-slate-900 rounded-md">
                                     <p>Dimensions: <span className="font-bold text-amber-400">{config.outputWidth}px &times; {config.outputHeight}px</span></p>
                                     <p>File Size: <span className="font-bold text-amber-400">{config.minSizeKB}KB - {config.maxSizeKB}KB</span></p>
                                </div>
                             )}
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                             <h3 className="font-semibold text-white mb-3">Quality Enhancements</h3>
                             <div className="space-y-3">
                                 <label className="flex items-center gap-3 p-3 bg-slate-900 rounded-md cursor-pointer hover:bg-slate-800">
                                     <input type="checkbox" checked={autoEnhance} onChange={e => setAutoEnhance(e.target.checked)} disabled={aiEnhance} className="h-5 w-5 rounded bg-slate-700 text-purple-500 focus:ring-purple-500 border-slate-600 disabled:opacity-50"/>
                                     <div>
                                         <p className="font-semibold">Auto-enhance quality</p>
                                         <p className="text-xs text-slate-400">Fast, client-side improvements to clarity and color.</p>
                                     </div>
                                 </label>
                                 <label className="flex items-center gap-3 p-3 bg-slate-900 rounded-md cursor-pointer hover:bg-slate-800">
                                     <input type="checkbox" checked={aiEnhance} onChange={e => setAiEnhance(e.target.checked)} className="h-5 w-5 rounded bg-slate-700 text-purple-500 focus:ring-purple-500 border-slate-600"/>
                                     <div>
                                         <p className="font-semibold text-amber-400">Super-enhance with AI</p>
                                         <p className="text-xs text-slate-400">Slower, uses AI for the highest possible quality.</p>
                                     </div>
                                 </label>
                             </div>
                        </div>
                        <div className="flex justify-center pt-4 gap-4">
                            <button onClick={handleReset} className="flex items-center gap-2 px-6 py-3 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 transition-all duration-300 border border-slate-700">
                                <HiXMark className="w-5 h-5"/> Reset
                            </button>
                            <button onClick={handleCreateImage} disabled={isLoading} className="flex items-center gap-3 px-8 py-3 bg-primary-gradient text-white font-bold text-lg rounded-lg hover:opacity-90 transition-all duration-300 disabled:opacity-50 transform hover:scale-105">
                                {isLoading ? <div className="w-6 h-6 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : <HiOutlineSparkles className="w-6 h-6"/>}
                                {isLoading ? loadingMessage : `Make ${config.title.split(' ')[0]}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {finalImage && (
                <div className="text-center space-y-6 animate-fade-in">
                     <h3 className="text-2xl font-bold text-white">Your Image is Ready!</h3>
                     <div className="inline-block p-2 bg-slate-800 rounded-lg border border-slate-700">
                        <img 
                            src={finalImage.base64} 
                            alt="Final processed" 
                            className="rounded-md"
                            style={{ width: currentConfig.outputWidth, height: currentConfig.outputHeight }}
                        />
                     </div>
                     <div className={`p-3 rounded-lg inline-flex items-center gap-2 text-sm font-semibold ${isSizeValid ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'}`}>
                        {isSizeValid ? <HiOutlineCheckCircle className="w-5 h-5"/> : <HiOutlineExclamationTriangle className="w-5 h-5"/>}
                        File Size: {finalImage.sizeKB.toFixed(2)} KB (Required: {currentConfig.minSizeKB}-{currentConfig.maxSizeKB} KB)
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
