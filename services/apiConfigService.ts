/**
 * -----------------------------------------------------------------------------
 * API KEY CONFIGURATION
 * -----------------------------------------------------------------------------
 * This application is pre-configured with a default development Gemini API key
 * for immediate testing purposes.
 *
 * IMPORTANT: This key is for demonstration and may be rate-limited.
 * For a stable experience, it's recommended to replace it with your own key from:
 * https://aistudio.google.com/app/apikey
 * -----------------------------------------------------------------------------
 */
const DEFAULT_API_KEY = "INSERT_YOUR_API_KEY_HERE";


/**
 * Retrieves the currently active API key.
 * @returns {string} The resolved API key.
 */
export const getApiKey = (): string => {
    return DEFAULT_API_KEY;
};

/**
 * Checks if the default Gemini API key has been properly set by the developer.
 * This is now pre-configured to always return true for a seamless setup.
 * @returns {boolean} - True.
 */
export const isDefaultApiKeySet = (): boolean => {
    return true;
};
