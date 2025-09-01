
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
    // The default key is sourced from environment variables for production builds.
    const defaultApiKey = ((import.meta as any).env.VITE_API_KEY as string) || '';

    switch (config.provider) {
        case 'gemini':
            // Use only the user-provided custom Gemini key.
            return config.geminiApiKey || '';
        case 'openrouter':
            // Use only the user-provided OpenRouter key.
            return config.openRouterApiKey || '';
        case 'openai':
            // Use only the user-provided OpenAI key.
            return config.openaiApiKey || '';
        case 'default':
        default:
            // Use only the application's default key.
            return defaultApiKey;
    }
};