
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
    // Vite exposes client-side environment variables on `import.meta.env`
    // FIX: Cast `import.meta` to `any` to resolve TypeScript error about missing 'env' property.
    const defaultApiKey = ((import.meta as any).env.VITE_API_KEY as string) || '';

    switch (config.provider) {
        case 'gemini':
            // Use custom key if available, otherwise fall back to environment variable
            return config.geminiApiKey || defaultApiKey;
        case 'openrouter':
            return config.openRouterApiKey || '';
        case 'openai':
            return config.openaiApiKey || '';
        case 'default':
        default:
            return defaultApiKey;
    }
};