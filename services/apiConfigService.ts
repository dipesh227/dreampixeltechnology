import { ApiConfig, ApiProvider } from '../types';

const API_CONFIG_KEY = 'dreamPixelApiConfig';

/**
 * Retrieves the current API configuration from localStorage.
 * Defaults to the 'default' provider if no config is found.
 * @returns {ApiConfig} The current API configuration.
 */
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

/**
 * Saves the given API configuration to localStorage.
 * @param {ApiConfig} config - The configuration object to save.
 */
export const saveConfig = (config: ApiConfig): void => {
    try {
        localStorage.setItem(API_CONFIG_KEY, JSON.stringify(config));
    } catch (error) {
        console.error("Failed to save API config to localStorage", error);
    }
};

/**
 * Retrieves the appropriate API key based on the user's selected provider.
 * - For 'default', it uses the VITE_API_KEY from environment variables.
 * - For custom providers, it uses the key saved in localStorage.
 * @returns {string} The resolved API key.
 */
export const getApiKey = (): string => {
    const config = getConfig();

    switch (config.provider) {
        case 'gemini':
            // Use the user-provided custom Gemini key from localStorage.
            return config.geminiApiKey || '';
        case 'openrouter':
            // Use the user-provided OpenRouter key from localStorage.
            return config.openRouterApiKey || '';
        case 'openai':
            // Use the user-provided OpenAI key from localStorage.
            return config.openaiApiKey || '';
        case 'default':
        default:
            // For the 'Default' provider, use the key from environment variables.
            // This is the primary API key for the application's default setup.
            // The user should set this in a .env file (e.g., VITE_API_KEY="...")
            return (process.env.VITE_API_KEY as string) || '';
    }
};