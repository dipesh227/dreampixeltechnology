
import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Point, Area } from 'react-easy-crop';
import { createImage, getCroppedImg } from '../utils/cropImage';
import { HiOutlineScissors, HiOutlineXMark, HiOutlineMagnifyingGlassPlus, HiOutlineMagnifyingGlassMinus } from 'react-icons/hi2';

interface ImageCropperProps {
    imageSrc: string;
    onCropComplete: (croppedImage: string) => void;
    onCancel: () => void;
    aspect: number;
}

const ImageCropper: React.FC<ImageCropperProps> = ({ imageSrc, onCropComplete, onCancel, aspect }) => {
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [isCropping, setIsCropping] = useState(false);

    const onCropChange = useCallback((location: Point) => {
        setCrop(location);
    }, []);

    const onZoomChange = useCallback((zoomValue: number) => {
        setZoom(zoomValue);
    }, []);

    const onCropFull = useCallback((croppedArea: Area, croppedAreaPixelsValue: Area) => {
        setCroppedAreaPixels(croppedAreaPixelsValue);
    }, []);

    const handleCropImage = async () => {
        if (!croppedAreaPixels || !imageSrc) return;
        setIsCropping(true);
        try {
            const croppedImageBase64 = await getCroppedImg(imageSrc, croppedAreaPixels);
            const base64Data = croppedImageBase64.split(',')[1];
            onCropComplete(base64Data);
        } catch (e) {
            console.error(e);
        } finally {
            setIsCropping(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in" onClick={onCancel}>
            <div className="bg-slate-900/80 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-2xl w-full max-w-2xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-slate-800 flex-shrink-0">
                    <h2 className="text-lg font-bold text-white">Crop Your Image</h2>
                    <button onClick={onCancel} className="text-slate-500 hover:text-white">
                        <HiOutlineXMark className="w-6 h-6 icon-hover-effect"/>
                    </button>
                </header>

                <div className="relative flex-grow p-4">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={aspect}
                        onCropChange={onCropChange}
                        onZoomChange={onZoomChange}
                        onCropComplete={onCropFull}
                    />
                </div>
                
                <div className="p-4 space-y-4 border-t border-slate-800 flex-shrink-0">
                     <div className="flex items-center gap-4">
                        <HiOutlineMagnifyingGlassMinus className="w-6 h-6 text-slate-400"/>
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                        />
                        <HiOutlineMagnifyingGlassPlus className="w-6 h-6 text-slate-400"/>
                    </div>
                </div>

                <footer className="flex justify-end gap-3 p-4 bg-slate-950/30 border-t border-slate-800 rounded-b-2xl">
                    <button onClick={onCancel} className="px-4 py-2 text-sm font-semibold bg-slate-800 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors">Cancel</button>
                    <button onClick={handleCropImage} disabled={isCropping} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary-gradient text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed">
                        {isCropping ? (
                            <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                        ) : (
                            <HiOutlineScissors className="w-5 h-5"/>
                        )}
                        {isCropping ? 'Cropping...' : 'Crop Image'}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default ImageCropper;