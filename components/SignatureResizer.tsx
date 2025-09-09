import React from 'react';
import { ResizerTool, ToolConfig } from './ResizerTool';

interface SignatureResizerProps {
    onNavigateHome: () => void;
}

const signatureConfig: ToolConfig = {
    title: 'Signature Resizer',
    outputWidth: 150,
    outputHeight: 100,
    minSizeKB: 5,
    maxSizeKB: 20,
    aspect: 150 / 100, // 3 / 2
};

export const SignatureResizer: React.FC<SignatureResizerProps> = ({ onNavigateHome }) => {
    return <ResizerTool config={signatureConfig} onNavigateHome={onNavigateHome} />;
};
