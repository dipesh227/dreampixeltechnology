import React from 'react';
import { ResizerTool, ToolConfig } from './ResizerTool';
import { SIGNATURE_PRESETS } from '../services/examPresets';

interface SignatureResizerProps {
    onNavigateHome: () => void;
}

const signatureConfig: ToolConfig = {
    titleKey: 'landing.toolSignatureResizerTitle',
    outputWidth: 150,
    outputHeight: 100,
    minSizeKB: 5,
    maxSizeKB: 20,
    aspect: 150 / 100, // 3 / 2
};

export const SignatureResizer: React.FC<SignatureResizerProps> = ({ onNavigateHome }) => {
    return <ResizerTool config={signatureConfig} onNavigateHome={onNavigateHome} presets={SIGNATURE_PRESETS} />;
};

export default SignatureResizer;
