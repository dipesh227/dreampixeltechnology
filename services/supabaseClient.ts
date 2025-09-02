import { createClient } from '@supabase/supabase-js';

// --- Supabase Configuration ---
// Hardcoded credentials to resolve environment variable loading issues.
const supabaseUrl = 'https://ftsvupbnmvphphvwzxha.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0c3Z1cGJubXZwaHBodnd6eGhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MzI3OTAsImV4cCI6MjA3MjMwODc5MH0.zSrEpRrmZNUPIM0wlaz2Kih8aSfcdbX1zXa9kDO8xK8';

/**
 * Checks if the Supabase environment variables are set.
 * This is crucial for the application to connect to the backend.
 * @returns {boolean} - True if both keys are present, false otherwise.
 */
export const areSupabaseKeysSet = (): boolean => {
    return !!(supabaseUrl && supabaseAnonKey);
};

// Initialize and export the Supabase client
if (!areSupabaseKeysSet()) {
    console.error("Supabase credentials are not set. Please check the hardcoded values in supabaseClient.ts.");
}
export const supabase = createClient(supabaseUrl, supabaseAnonKey);


/**
 * Checks the connection to the Supabase database by performing a lightweight query.
 * @returns {Promise<{ isConnected: boolean, error?: string }>} - An object with the connection status and an optional error message.
 */
export const checkDatabaseConnection = async () => {
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
            const userError = `Database connection failed: ${error.message}. Please check your Supabase URL/Key and database setup.`;
            return { isConnected: false, error: userError };
        }
        return { isConnected: true };
    } catch (e: any) {
        console.error("Supabase client error during connection check:", e);
        const userError = `A client-side error occurred while connecting to the database. Ensure your Supabase credentials are correct. Details: ${e.message}`;
        return { isConnected: false, error: userError };
    }
};