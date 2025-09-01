import { supabase } from './supabaseClient';

/**
 * Submits feedback securely to the database.
 * The content is encrypted server-side via an RPC call.
 * @param {string} content - The feedback content from the user.
 * @param {string | null} userId - The ID of the authenticated user, or null if anonymous.
 * @returns {Promise<void>}
 */
export const submitFeedback = async (content: string, userId: string | null): Promise<void> => {
    try {
        const { error } = await supabase
            .rpc('submit_encrypted_feedback', {
                p_content: content,
                p_user_id: userId
            });

        if (error) {
            throw error;
        }
    } catch (error) {
        console.error("Failed to submit feedback via RPC", error);
        throw new Error("An error occurred while submitting your feedback.");
    }
};
