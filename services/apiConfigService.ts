/**
 * -----------------------------------------------------------------------------
 * API KEY CONFIGURATION
 * -----------------------------------------------------------------------------
 * This application obtains the Gemini API key from the execution environment.
 * The `GEMINI_API_KEY` environment variable must be set in a `.env.local` file
 * and exposed to the client via Vite's configuration.
 *
 * See the project's README.md for detailed setup instructions.
 * -----------------------------------------------------------------------------
 */

// The API key is read from the environment variables.
// NOTE: For this to work in Vite, `GEMINI_API_KEY` must be explicitly exposed
// in the `vite.config.ts` file.
// FIX: Cast `import.meta` to `any` to resolve TypeScript error "Property 'env' does not exist on type 'ImportMeta'".
const GEMINI_API_KEY = (import.meta as any).env.GEMINI_API_KEY as string;

/**
 * Retrieves the cached Gemini API key from environment variables.
 * @returns {string} The resolved API key.
 */
export const getApiKey = (): string => {
    if (!GEMINI_API_KEY) {
      // This log is helpful for developers during setup.
      console.error("Gemini API key is not configured. Please set GEMINI_API_KEY in your .env.local file AND ensure it is exposed in your vite.config.ts. See README.md for instructions.");
    }
    return GEMINI_API_KEY;
};