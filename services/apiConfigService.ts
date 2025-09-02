/**
 * -----------------------------------------------------------------------------
 * API KEY CONFIGURATION
 * -----------------------------------------------------------------------------
 * This application is configured to use the Gemini API key from the
 * `process.env.GEMINI_API_KEY` environment variable.
 *
 * This key is managed externally and is a hard requirement for the application
 * to function. It should be set in a `.env.local` file for development.
 * -----------------------------------------------------------------------------
 */

/**
 * Retrieves the currently active API key from the environment variable.
 * @returns {string} The resolved API key.
 * @throws {Error} If the API key is not found in the environment variables.
 */
export const getApiKey = (): string => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        // This error will be caught by the API status check and displayed to the user.
        throw new Error("API key is not configured. Please ensure the GEMINI_API_KEY environment variable is set.");
    }
    return apiKey;
};

/**
 * This function is deprecated as the key is now managed exclusively
 * through environment variables.
 * @returns {boolean} - True, to maintain compatibility.
 */
export const isDefaultApiKeySet = (): boolean => {
    return true;
};