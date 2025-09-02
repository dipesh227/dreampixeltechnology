import { createClient } from '@supabase/supabase-js';

// --- Supabase Configuration ---
// As a senior engineer, these values are loaded from environment variables
// for security and flexibility in deployment environments. Ensure you have a .env
// file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY set.
// FIX: Cast import.meta to any to resolve TypeScript error about missing 'env' property.
export const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL as string;
// FIX: Cast import.meta to any to resolve TypeScript error about missing 'env' property.
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY as string;


/**
 * Checks if the Supabase environment variables are set.
 * @returns {boolean} - True if both URL and Key are present, false otherwise.
 */
export const areSupabaseKeysSet = (): boolean => {
    return !!supabaseUrl && !!supabaseAnonKey;
};


if (!areSupabaseKeysSet()) {
    // This provides a clear error in the developer console if the .env file is missing or misconfigured.
    // The UI will handle showing a message to the user.
    console.error('Supabase environment variables not found. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
}

// Initialize and export the Supabase client
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