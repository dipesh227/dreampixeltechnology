import React from 'react';
import { ResizerTool, ToolConfig } from './ResizerTool';
import { PHOTO_PRESETS } from '../services/examPresets';

interface PhotoResizerProps {
    onNavigateHome: () => void;
}

const photoConfig: ToolConfig = {
    titleKey: 'landing.toolPhotoResizerTitle',
    outputWidth: 150,
    outputHeight: 200,
    minSizeKB: 10,
    maxSizeKB: 50,
    aspect: 150 / 200, // 3 / 4
};

export const PhotoResizer: React.FC<PhotoResizerProps> = ({ onNavigateHome }) => {
    return <ResizerTool config={photoConfig} onNavigateHome={onNavigateHome} presets={PHOTO_PRESETS} />;
};

export default PhotoResizer;
