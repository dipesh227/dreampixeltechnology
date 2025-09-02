/**
 * -----------------------------------------------------------------------------
 * API KEY CONFIGURATION
 * -----------------------------------------------------------------------------
 * This application obtains the Gemini API key based on the user's choice:
 * 1. A custom key provided by the user, stored in localStorage.
 * 2. The default key from the `process.env.API_KEY` environment variable.
 * The user's choice ('default' or 'custom') is also stored in localStorage.
 * -----------------------------------------------------------------------------
 */

const DEFAULT_API_KEY = process.env.API_KEY as string;
const CUSTOM_API_KEY_STORAGE_KEY = 'dreampixel_custom_gemini_api_key';
const API_CHOICE_STORAGE_KEY = 'dreampixel_api_choice'; // 'default' or 'custom'

export type ApiSource = 'default' | 'custom';

/**
 * Saves a custom Gemini API key to local storage.
 * @param {string} apiKey - The custom API key to save.
 */
export const saveCustomApiKey = (apiKey: string): void => {
    localStorage.setItem(CUSTOM_API_KEY_STORAGE_KEY, apiKey);
};

/**
 * Retrieves the custom Gemini API key from local storage.
 * @returns {string | null} The custom API key or null if not set.
 */
export const getCustomApiKey = (): string | null => {
    return localStorage.getItem(CUSTOM_API_KEY_STORAGE_KEY);
};

/**
 * Sets the user's choice of API key source.
 * @param {ApiSource} source - The chosen source, either 'default' or 'custom'.
 */
export const setApiSource = (source: ApiSource): void => {
    localStorage.setItem(API_CHOICE_STORAGE_KEY, source);
};

/**
 * Gets the user's current choice for the API key source.
 * @returns {ApiSource} The chosen source, defaulting to 'default'.
 */
export const getActiveApiSource = (): ApiSource => {
    return (localStorage.getItem(API_CHOICE_STORAGE_KEY) as ApiSource) || 'default';
};


/**
 * Retrieves the active Gemini API key based on the user's saved choice.
 * It prioritizes a custom key if 'custom' is selected, otherwise falls back to the default.
 * @returns {string} The resolved API key.
 */
export const getApiKey = (): string => {
    const source = getActiveApiSource();

    if (source === 'custom') {
        const customKey = getCustomApiKey();
        if (customKey) {
            return customKey;
        }
        // If custom is chosen but key is missing, fall back to default and reset choice
        setApiSource('default');
    }
    
    if (!DEFAULT_API_KEY) {
      console.error("Default Gemini API key is not configured. Please ensure the API_KEY environment variable is set.");
    }
    return DEFAULT_API_KEY;
};

/**
 * Clears the custom Gemini API key and reverts the choice to default.
 */
export const revertToDefaultKey = (): void => {
    localStorage.removeItem(CUSTOM_API_KEY_STORAGE_KEY);
    setApiSource('default');
};