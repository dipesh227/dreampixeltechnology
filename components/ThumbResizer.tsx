import React from 'react';
import { ResizerTool, ToolConfig } from './ResizerTool';

interface ThumbResizerProps {
    onNavigateHome: () => void;
}

const thumbConfig: ToolConfig = {
    title: 'Thumb Impression Resizer',
    outputWidth: 150,
    outputHeight: 100,
    minSizeKB: 5,
    maxSizeKB: 20,
    aspect: 150 / 100, // 3 / 2
};

export const ThumbResizer: React.FC<ThumbResizerProps> = ({ onNavigateHome }) => {
    return <ResizerTool config={thumbConfig} onNavigateHome={onNavigateHome} />;
};
