import React, { useState, useEffect, useCallback } from 'react';
import { HiOutlineXMark, HiOutlineKey, HiCheckCircle, HiExclamationCircle, HiOutlineTrash, HiOutlineCheckBadge, HiOutlineUserCircle } from 'react-icons/hi2';
import * as apiConfigService from '../services/apiConfigService';
import * as geminiNativeService from '../services/geminiNativeService';
import { ValidationStatus, ToolType } from '../types';
import { DreamLogo } from './icons/DreamLogo';

interface SettingsModalProps {
    onClose: () => void;
    onApiKeyChange: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, onApiKeyChange }) => {
    const [apiKeyInput, setApiKeyInput] = useState('');
    const [validationStatus, setValidationStatus] = useState<ValidationStatus>('idle');
    const [validationMessage, setValidationMessage] = useState<string | null>(null);
    const [activeSource, setActiveSource] = useState<apiConfigService.ApiSource>('default');

    useEffect(() => {
        const source = apiConfigService.getActiveApiSource();
        setActiveSource(source);
        if (source === 'custom') {
            setApiKeyInput(apiConfigService.getCustomApiKey() || '');
        }
    }, []);

    const handleSelectSource = (source: apiConfigService.ApiSource) => {
        setActiveSource(source);
        if (source === 'default') {
            // If switching to default, save immediately
            apiConfigService.revertToDefaultKey();
            onApiKeyChange();
            onClose(); // Close after selection for a smoother UX
        } else {
            // If switching to custom, clear validation from previous attempts
            setValidationStatus('idle');
            setValidationMessage(null);
        }
    };

    const testAndSaveKey = useCallback(async () => {
        if (!apiKeyInput) {
            setValidationStatus('invalid');
            setValidationMessage('API key cannot be empty.');
            return;
        }
        setValidationStatus('validating');
        setValidationMessage('Testing key...');
        const result = await geminiNativeService.validateApiKey(apiKeyInput);
        if (result.isValid) {
            apiConfigService.saveCustomApiKey(apiKeyInput);
            apiConfigService.setApiSource('custom');
            setValidationStatus('valid');
            setValidationMessage('API Key saved and verified!');
            setTimeout(() => {
                onApiKeyChange();
                onClose();
            }, 1000);
        } else {
            setValidationStatus('invalid');
            setValidationMessage(result.error || 'This API key is invalid.');
        }
    }, [apiKeyInput, onClose, onApiKeyChange]);

    const getStatusIndicator = () => {
        switch (validationStatus) {
            case 'validating':
                return <div className="w-4 h-4 border-2 border-t-transparent border-yellow-400 rounded-full animate-spin"></div>;
            case 'valid':
                return <HiCheckCircle className="w-5 h-5 text-green-400" />;
            case 'invalid':
                return <HiExclamationCircle className="w-5 h-5 text-red-400" />;
            default:
                return null;
        }
    };
    
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
        <div className="bg-slate-900/80 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <header className="flex items-center justify-between p-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                    <HiOutlineKey className="w-6 h-6 text-sky-400"/>
                    <h2 className="text-lg font-bold text-white">API Key Settings</h2>
                </div>
                <button onClick={onClose} className="text-slate-500 hover:text-white">
                    <HiOutlineXMark className="w-6 h-6 icon-hover-effect"/>
                </button>
            </header>

            <main className="p-6 space-y-6">
                <p className="text-sm text-slate-400 text-center">
                    Choose which Gemini API key to use for your generations.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Default Key Option */}
                    <button 
                        onClick={() => handleSelectSource('default')}
                        className={`p-4 rounded-lg border-2 text-center transition-all duration-200 ${activeSource === 'default' ? 'border-purple-500 bg-slate-800/50' : 'border-slate-800 bg-slate-900 hover:border-slate-700'}`}
                    >
                        <DreamLogo className="h-8 w-auto mx-auto mb-3"/>
                        <h3 className="font-bold text-white">DreamPixel's API</h3>
                        <p className="text-xs text-slate-400 mt-1">Free to use. Generated images will include a small watermark.</p>
                        {activeSource === 'default' && <HiOutlineCheckBadge className="w-6 h-6 text-purple-400 mx-auto mt-3"/>}
                    </button>
                    {/* Custom Key Option */}
                    <button 
                        onClick={() => handleSelectSource('custom')}
                        className={`p-4 rounded-lg border-2 text-center transition-all duration-200 ${activeSource === 'custom' ? 'border-purple-500 bg-slate-800/50' : 'border-slate-800 bg-slate-900 hover:border-slate-700'}`}
                    >
                        <HiOutlineUserCircle className="w-10 h-10 mx-auto mb-3 text-slate-500"/>
                        <h3 className="font-bold text-white">Your API Key</h3>
                        <p className="text-xs text-slate-400 mt-1">Use your own key for higher limits and no watermarks.</p>
                        {activeSource === 'custom' && <HiOutlineCheckBadge className="w-6 h-6 text-purple-400 mx-auto mt-3"/>}
                    </button>
                </div>

                {activeSource === 'custom' && (
                    <div className="animate-fade-in-down space-y-2">
                         <label htmlFor="api-key-input" className="font-semibold text-slate-300 text-sm">Your Google Gemini API Key</label>
                         <div className="relative">
                            <input
                                id="api-key-input"
                                type="password"
                                value={apiKeyInput}
                                onChange={(e) => {
                                    setApiKeyInput(e.target.value);
                                    setValidationStatus('idle');
                                    setValidationMessage(null);
                                }}
                                placeholder="Enter your Gemini API Key..."
                                className="w-full p-3 pr-10 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 transition text-sm"
                                disabled={validationStatus === 'validating'}
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                {getStatusIndicator()}
                            </div>
                        </div>
                        {validationMessage && (
                            <p className={`text-xs mt-2 ${validationStatus === 'valid' ? 'text-green-400' : 'text-red-400'}`}>
                                {validationMessage}
                            </p>
                        )}
                    </div>
                )}
            </main>
            
            {activeSource === 'custom' && (
                 <footer className="flex justify-end gap-3 p-4 bg-slate-950/30 border-t border-slate-800 rounded-b-2xl">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold bg-slate-800 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors">Cancel</button>
                    <button 
                        type="button" 
                        onClick={testAndSaveKey}
                        disabled={!apiKeyInput || validationStatus === 'validating' || validationStatus === 'valid'} 
                        className="px-4 py-2 text-sm font-semibold bg-primary-gradient text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {validationStatus === 'validating' ? 'Testing...' : 'Save & Verify Key'}
                    </button>
                </footer>
            )}
        </div>
      </div>
    );
};
export default SettingsModal;