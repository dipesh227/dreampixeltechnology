import React from 'react';
import { ResizerTool, ToolConfig } from './ResizerTool';

interface PhotoResizerProps {
    onNavigateHome: () => void;
}

const photoConfig: ToolConfig = {
    title: 'Photo Resizer',
    outputWidth: 150,
    outputHeight: 200,
    minSizeKB: 10,
    maxSizeKB: 50,
    aspect: 150 / 200, // 3 / 4
};

export const PhotoResizer: React.FC<PhotoResizerProps> = ({ onNavigateHome }) => {
    return <ResizerTool config={photoConfig} onNavigateHome={onNavigateHome} />;
};
