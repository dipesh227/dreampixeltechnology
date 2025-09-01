
import React, { useState, useEffect } from 'react';
import { ApiConfig, ApiProvider } from '../types';
import * as apiConfigService from '../services/apiConfigService';
import { CogIcon, XMarkIcon } from './icons/UiIcons';

interface SettingsModalProps {
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
    const [config, setConfig] = useState<ApiConfig>({ provider: 'default' });

    useEffect(() => {
        setConfig(apiConfigService.getConfig());
    }, []);

    const handleProviderChange = (provider: ApiProvider) => {
        setConfig(prev => ({ ...prev, provider }));
    };

    const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>, keyName: 'geminiApiKey' | 'openRouterApiKey' | 'perplexityApiKey') => {
        const { value } = e.target;
        setConfig(prev => ({ ...prev, [keyName]: value }));
    };
    
    const handleSave = () => {
        apiConfigService.saveConfig(config);
        onClose();
    };

    const renderProviderInput = () => {
        if (config.provider === 'gemini') {
            return <input type="password" placeholder="Enter your Gemini API Key" value={config.geminiApiKey || ''} onChange={(e) => handleApiKeyChange(e, 'geminiApiKey')} className="w-full mt-2 p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-1 focus:ring-slate-500" />;
        }
        if (config.provider === 'openrouter') {
             return <input type="password" placeholder="Enter your OpenRouter API Key" value={config.openRouterApiKey || ''} onChange={(e) => handleApiKeyChange(e, 'openRouterApiKey')} className="w-full mt-2 p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-1 focus:ring-slate-500" />;
        }
        if (config.provider === 'perplexity') {
             return <input type="password" placeholder="Enter your Perplexity API Key" value={config.perplexityApiKey || ''} onChange={(e) => handleApiKeyChange(e, 'perplexityApiKey')} className="w-full mt-2 p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-1 focus:ring-slate-500" />;
        }
        return <p className="text-sm text-slate-400 mt-2">You are using the application's default API configuration.</p>;
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <CogIcon className="w-6 h-6 text-slate-400"/>
                        <h2 className="text-lg font-bold text-white">API Provider Settings</h2>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white">
                        <XMarkIcon className="w-6 h-6"/>
                    </button>
                </header>

                <main className="p-6 space-y-6">
                    <div>
                        <label className="font-semibold text-slate-300">AI Provider</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1 bg-slate-800 border border-slate-700 rounded-lg mt-2">
                            <button onClick={() => handleProviderChange('default')} className={`px-3 py-1.5 text-sm rounded-md ${config.provider === 'default' ? 'bg-blue-600 text-white font-semibold' : 'hover:bg-slate-700'}`}>Default</button>
                            <button onClick={() => handleProviderChange('gemini')} className={`px-3 py-1.5 text-sm rounded-md ${config.provider === 'gemini' ? 'bg-blue-600 text-white font-semibold' : 'hover:bg-slate-700'}`}>Custom Gemini</button>
                            <button onClick={() => handleProviderChange('openrouter')} className={`px-3 py-1.5 text-sm rounded-md ${config.provider === 'openrouter' ? 'bg-blue-600 text-white font-semibold' : 'hover:bg-slate-700'}`}>OpenRouter</button>
                            <button onClick={() => handleProviderChange('perplexity')} className={`px-3 py-1.5 text-sm rounded-md ${config.provider === 'perplexity' ? 'bg-blue-600 text-white font-semibold' : 'hover:bg-slate-700'}`}>Perplexity</button>
                        </div>
                        <div className="mt-3">
                            {renderProviderInput()}
                        </div>
                    </div>
                    <div className="p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
                        <h4 className="font-bold text-yellow-400">Security Note</h4>
                        <p className="text-sm text-yellow-500 mt-1">Your API key is stored only in your browser's local storage and is never sent to our servers. Do not use this feature on a shared or public computer.</p>
                    </div>
                </main>
                
                <footer className="flex justify-end gap-3 p-4 bg-slate-900/50 border-t border-slate-800 rounded-b-2xl">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold bg-slate-700/50 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors">Save & Close</button>
                </footer>
            </div>
        </div>
    );
};

export default SettingsModal;