
import React, { useState, useEffect } from 'react';
import { HiOutlineXMark, HiOutlineKey, HiOutlineCheckCircle, HiOutlineExclamationCircle, HiOutlineClock } from 'react-icons/hi2';
import { useAuth } from '../context/AuthContext';
import * as geminiNativeService from '../services/geminiNativeService';

interface SettingsModalProps {
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
    const { customApiKey, customApiKeyStatus, setCustomApiKey, clearCustomApiKey } = useAuth();
    const [apiKeyInput, setApiKeyInput] = useState('');
    const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
    const [validationError, setValidationError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setApiKeyInput(customApiKey || '');
        setValidationStatus(customApiKeyStatus);
    }, [customApiKey, customApiKeyStatus]);

    const handleTestKey = async () => {
        if (!apiKeyInput.trim()) {
            setValidationStatus('invalid');
            setValidationError('API key cannot be empty.');
            return;
        }
        setValidationStatus('validating');
        setValidationError(null);
        const { isValid, error } = await geminiNativeService.validateApiKey(apiKeyInput);
        setValidationStatus(isValid ? 'valid' : 'invalid');
        if (!isValid) {
            setValidationError(error || "The provided API key is invalid.");
        }
    };

    const handleSaveKey = async () => {
        setIsSaving(true);
        await setCustomApiKey(apiKeyInput);
        setIsSaving(false);
        onClose();
    };

    const handleClearKey = async () => {
        await clearCustomApiKey();
        setApiKeyInput('');
        setValidationStatus('idle');
        setValidationError(null);
    };

    const getStatusInfo = () => {
        switch (validationStatus) {
            case 'validating':
                return { icon: <HiOutlineClock className="w-5 h-5 text-yellow-400 animate-spin" />, text: 'Validating...' };
            case 'valid':
                return { icon: <HiOutlineCheckCircle className="w-5 h-5 text-green-400" />, text: 'This key is valid and can be saved.' };
            case 'invalid':
                return { icon: <HiOutlineExclamationCircle className="w-5 h-5 text-red-400" />, text: validationError || 'Invalid API Key.' };
            case 'idle':
            default:
                return { icon: <HiOutlineKey className="w-5 h-5 text-slate-500" />, text: 'Enter your Gemini API key.' };
        }
    };

    const { icon: statusIcon, text: statusText } = getStatusInfo();

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-slate-900/80 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-2xl w-full max-w-lg modal-content" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-slate-800">
                    <h2 className="text-lg font-bold text-white">Settings</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-white">
                        <HiOutlineXMark className="w-6 h-6 icon-hover-effect"/>
                    </button>
                </header>

                <main className="p-6 space-y-4">
                    <div>
                        <label htmlFor="api-key-input" className="font-semibold text-white">Your Gemini API Key</label>
                        <p className="text-sm text-slate-400 mb-2">Add your own key to use your personal quota. Your key is encrypted and stored securely.</p>
                        <div className="flex gap-2">
                            <input
                                id="api-key-input"
                                type="password"
                                value={apiKeyInput}
                                onChange={(e) => setApiKeyInput(e.target.value)}
                                placeholder="Enter your Gemini API Key"
                                className="w-full p-2 rounded-lg"
                            />
                            <button onClick={handleTestKey} disabled={validationStatus === 'validating'} className="px-4 py-2 text-sm font-semibold bg-slate-700 text-white rounded-lg hover:bg-slate-600 disabled:opacity-50">
                                {validationStatus === 'validating' ? 'Testing...' : 'Test'}
                            </button>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-sm text-slate-400">
                            {statusIcon}
                            <span>{statusText}</span>
                        </div>
                    </div>
                     <p className="text-xs text-slate-500">
                        If you don't have a key, you can get one from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">Google AI Studio</a>.
                        If you clear your key, the application will revert to using the default site key.
                    </p>
                </main>
                
                <footer className="flex justify-between items-center p-4 bg-slate-950/30 border-t border-slate-800 rounded-b-2xl">
                    <button onClick={handleClearKey} className="px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                        Clear Key
                    </button>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-4 py-2 text-sm font-semibold bg-slate-800 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors">Cancel</button>
                        <button onClick={handleSaveKey} disabled={validationStatus !== 'valid' || isSaving} className="px-4 py-2 text-sm font-semibold bg-primary-gradient text-white rounded-lg hover:opacity-90 disabled:opacity-50">
                            {isSaving ? 'Saving...' : 'Save and Use Key'}
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default SettingsModal;
