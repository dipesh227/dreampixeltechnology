import { HistoryEntry, PublicCreation } from '../types';
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

export const saveCreation = async (newEntry: HistoryEntry, userId: string, isPublic: boolean): Promise<void> => {
    if (!userId) throw new Error("User must be logged in to save a creation.");
    try {
        // Call the secure RPC function to create an encrypted creation
        const { error } = await supabase
            .rpc('create_encrypted_creation', {
                p_prompt: newEntry.prompt, 
                p_image_url: newEntry.imageUrl,
                p_user_id: userId,
                p_is_public: isPublic
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


export const getPublicCreations = async (): Promise<PublicCreation[]> => {
    // FIX: Switched from a potentially problematic RPC call to a direct SELECT query.
    // This method is simpler and relies on the RLS policy that allows everyone to
    // view creations where `is_public` is true. This should resolve the permission errors.
    const { data, error } = await supabase
        .from('creations')
        .select('id, image_url')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(12);

    if (error) {
        console.error("Failed to fetch public creations:", error);
        // Re-throw the error with a more descriptive message so SWR can handle it.
        throw new Error(`Database error: ${error.message}`);
    }

    if (!data) {
        return [];
    }

    // FIX: Manually map the 'image_url' field from the database to the 'imageUrl'
    // field expected by the PublicCreation type.
    return data.map(creation => ({
        id: creation.id,
        imageUrl: creation.image_url,
    }));
};