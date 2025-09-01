
import { ApiConfig, ApiProvider } from '../types';

const API_CONFIG_KEY = 'dreamPixelApiConfig';

export const getConfig = (): ApiConfig => {
    try {
        const configJson = localStorage.getItem(API_CONFIG_KEY);
        if (configJson) {
            return JSON.parse(configJson);
        }
    } catch (error) {
        console.error("Failed to parse API config from localStorage", error);
    }
    return { provider: 'default' };
};

export const saveConfig = (config: ApiConfig): void => {
    try {
        localStorage.setItem(API_CONFIG_KEY, JSON.stringify(config));
    } catch (error) {
        console.error("Failed to save API config to localStorage", error);
    }
};

export const getApiKey = (): string => {
    const config = getConfig();
    switch (config.provider) {
        case 'gemini':
            // Use custom key if available, otherwise fall back to environment variable
            return config.geminiApiKey || process.env.API_KEY || '';
        case 'openrouter':
            return config.openRouterApiKey || '';
        case 'perplexity':
            return config.perplexityApiKey || '';
        case 'default':
        default:
            return process.env.API_KEY || '';
    }
};