import { createClient } from '@supabase/supabase-js';

// --- Supabase Configuration ---
// Hardcoded credentials as per user request to ensure connection.
export const supabaseUrl = "https://jbhpnyawcbdihobcekis.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpiaHBueWF3Y2JkaWhvYmNla2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0OTMwNDEsImV4cCI6MjA2NjA2OTA0MX0.LYXzc_hP_zZ17TS05V3N9WFU3Vn_Pj3ibm7loLnyjnk";


/**
 * Checks if the Supabase environment variables are set.
 * @returns {boolean} - True if both URL and Key are present, false otherwise.
 */
export const areSupabaseKeysSet = (): boolean => {
    // With hardcoded values, this will always be true.
    return !!supabaseUrl && !!supabaseAnonKey;
};


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