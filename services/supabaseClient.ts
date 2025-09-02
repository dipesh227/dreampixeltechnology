import { createClient } from '@supabase/supabase-js';

// --- Supabase Configuration ---
// Read Supabase credentials from Vite's environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Checks if the Supabase environment variables are set.
 * This is crucial for the application to connect to the backend.
 * @returns {boolean} - True if both keys are present, false otherwise.
 */
export const areSupabaseKeysSet = (): boolean => {
    return !!(supabaseUrl && supabaseAnonKey);
};

// Initialize and export the Supabase client
// Throw an error if the keys are missing, which should be caught by the initial check in index.tsx
if (!areSupabaseKeysSet()) {
    console.error("Supabase environment variables not found. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.");
}
export const supabase = createClient(supabaseUrl, supabaseAnonKey);


/**
 * Checks the connection to the Supabase database by performing a lightweight query.
 * @returns {Promise<boolean>} - True if the connection is successful, false otherwise.
 */
export const checkDatabaseConnection = async (): Promise<boolean> => {
    try {
        // This is a very lightweight query. It asks for the count of a table
        // but with `head: true`, it doesn't return any data, just the status
        // and the count in the headers, which is enough to verify the connection
        // and table access are working. We check against a table we know should exist.
        const { error } = await supabase
            .from('profiles')
            .select('id', { count: 'exact', head: true });

        if (error) {
            console.error("Supabase connection check failed:", error.message);
            return false;
        }
        return true;
    } catch (e) {
        console.error("Supabase client error during connection check:", e);
        return false;
    }
};
