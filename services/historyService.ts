import { HistoryEntry } from '../types';
import { supabase } from './supabaseClient';

export const getCreations = async (userId: string): Promise<HistoryEntry[]> => {
    if (!userId) return [];
    try {
        // Call the secure RPC function to get decrypted creations
        const { data, error } = await supabase
            .rpc('get_decrypted_creations', { p_user_id: userId });

        if (error) throw error;
        
        // The data from the RPC is already decrypted and in the correct format
        return data.map((item: any) => ({
            id: item.id,
            prompt: item.prompt,
            imageUrl: item.image_url,
            timestamp: new Date(item.created_at).getTime()
        }));

    } catch (error) {
        console.error("Failed to fetch user creations from Supabase", error);
        return [];
    }
};

export const saveCreation = async (newEntry: HistoryEntry, userId: string): Promise<void> => {
    if (!userId) throw new Error("User must be logged in to save a creation.");
    try {
        // Call the secure RPC function to create an encrypted creation
        const { error } = await supabase
            .rpc('create_encrypted_creation', {
                p_prompt: newEntry.prompt, 
                p_image_url: newEntry.imageUrl,
                p_user_id: userId,
                p_is_public: false // Always save as private
            });
        
        if (error) throw error;

    } catch (error) {
        console.error("Failed to save creation to Supabase", error);
        throw error;
    }
};

export const clearCreations = async (userId: string): Promise<void> => {
    if (!userId) return;
    try {
        // This operation is safe as it's protected by Row Level Security
        const { error } = await supabase
            .from('creations')
            .delete()
            .eq('user_id', userId);
        
        if (error) throw error;

    } catch (error) {
        console.error("Failed to clear user creations from Supabase", error);
    }
};
