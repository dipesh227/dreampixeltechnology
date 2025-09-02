/**
 * -----------------------------------------------------------------------------
 * API KEY CONFIGURATION
 * -----------------------------------------------------------------------------
 * This application obtains the Gemini API key from the execution environment.
 * The `process.env.API_KEY` environment variable must be set for the
 * application to function correctly.
 *
 * For more information on acquiring a key, visit:
 * https://aistudio.google.com/app/apikey
 * -----------------------------------------------------------------------------
 */

// The API key is read from the environment variables once when the module is loaded.
// This makes the access resilient to potential issues with environment variable
// availability during the app's lifecycle (e.g., after an OAuth redirect).
// FIX: Adhering to guidelines to exclusively use process.env.API_KEY. This also resolves the TypeScript error on 'import.meta.env'.
const GEMINI_API_KEY = process.env.API_KEY as string;

/**
 * Retrieves the cached Gemini API key from environment variables.
 * @returns {string} The resolved API key.
 */
export const getApiKey = (): string => {
    if (!GEMINI_API_KEY) {
      // This log is helpful for developers during setup.
      // FIX: Updated error message to reflect exclusive use of process.env.API_KEY.
      console.error("Gemini API key is not configured. Please ensure the API_KEY environment variable is set.");
    }
    return GEMINI_API_KEY;
};