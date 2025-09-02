import { ApiConfig } from '../types';

/**
 * Retrieves the current API configuration. Now hardcoded to 'default'.
 * @returns {ApiConfig} The default API configuration.
 */
export const getConfig = (): ApiConfig => {
    return { provider: 'default' };
};

/**
 * Saves the given API configuration. This function is now a no-op as the provider is fixed.
 * @param {ApiConfig} config - The configuration object to save.
 */
export const saveConfig = (config: ApiConfig): void => {
    // No-op: Configuration is fixed to default.
    return;
};

/**
 * Retrieves the default API key from environment variables.
 * @returns {string} The resolved API key.
 */
export const getApiKey = (): string => {
    const apiKey = import.meta.env.VITE_API_KEY;
    if (!apiKey) {
         console.error("VITE_API_KEY not found in environment variables.");
         return '';
    }
    return apiKey;
};

/**
 * Checks if the default Gemini API key is set in the environment variables.
 * @returns {boolean} - True if the key is present, false otherwise.
 */
export const isDefaultApiKeySet = (): boolean => {
    return !!import.meta.env.VITE_API_KEY;
};
