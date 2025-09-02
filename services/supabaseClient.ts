

import { createClient } from '@supabase/supabase-js';

// --- Supabase Configuration ---
// Hardcoded credentials to resolve environment variable loading issues.
const supabaseUrl = "https://ftsvupbnmvphphvwzxha.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0c3Z1cGJubXZwaHBodnd6eGhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MzI3OTAsImV4cCI6MjA3MjMwODc5MH0.zSrEpRrmZNUPIM0wlaz2Kih8aSfcdbX1zXa9kDO8xK8";


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
// Note: This will throw an error if the keys are not set, which is intended.
// The main application entry point (index.tsx) checks for keys before rendering the app,
// so we use the non-null assertion operator (!) to satisfy TypeScript.
export const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

/**
 * Checks the connection to the Supabase database by performing a lightweight query.
 * @returns {Promise<boolean>} - True if the connection is successful, false otherwise.
 */
export const checkDatabaseConnection = async (): Promise<boolean> => {
    if (!areSupabaseKeysSet()) {
        return false;
    }
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