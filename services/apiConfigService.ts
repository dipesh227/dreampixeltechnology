/**
 * -----------------------------------------------------------------------------
 * API KEY CONFIGURATION
 * -----------------------------------------------------------------------------
 * This application is configured to use the Gemini API key provided via
 * the `process.env.API_KEY` environment variable.
 *
 * The availability of this key is handled externally and is a hard requirement.
 * -----------------------------------------------------------------------------
 */

// FIX: Switched from import.meta.env.VITE_API_KEY to process.env.API_KEY to align with coding guidelines and fix the TypeScript error.
const API_KEY = process.env.API_KEY as string;

/**
 * Retrieves the configured Gemini API key.
 * @returns {string} The resolved API key.
 */
export const getApiKey = (): string => {
    if (!API_KEY) {
      // This log is for the developer in the console.
      // FIX: Updated error message to refer to the standard API_KEY environment variable.
      console.error("Gemini API key is not configured. Please ensure the API_KEY environment variable is set.");
    }
    return API_KEY;
};