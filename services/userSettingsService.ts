import { supabase } from './supabaseClient';

/**
 * Retrieves the decrypted Gemini API key for a given user.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<string | null>} The decrypted API key, or null if not found or an error occurs.
 */
export const getUserGeminiKey = async (userId: string): Promise<string | null> => {
    if (!userId) return null;
    try {
        const { data, error } = await supabase.rpc('get_user_gemini_key', { p_user_id: userId });
        if (error) throw error;
        return data || null;
    } catch (error) {
        console.error("Failed to get user Gemini key from Supabase", error);
        return null;
    }
};

/**
 * Sets or clears the encrypted Gemini API key for a given user.
 * @param {string} userId - The ID of the user.
 * @param {string} apiKey - The API key to encrypt and store. Pass an empty string to clear it.
 * @returns {Promise<void>}
 */
export const setUserGeminiKey = async (userId: string, apiKey: string): Promise<void> => {
    if (!userId) throw new Error("User ID is required to set API key.");
    try {
        const { error } = await supabase.rpc('set_user_gemini_key', { p_user_id: userId, p_api_key: apiKey });
        if (error) throw error;
    } catch (error) {
        console.error("Failed to set user Gemini key in Supabase", error);
        throw new Error("Could not save the API key. Please try again.");
    }
};
