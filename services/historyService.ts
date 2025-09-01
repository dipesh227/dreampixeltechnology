import { HistoryEntry } from '../types';
import { supabase } from './supabaseClient';

export const getCreations = async (userId: string): Promise<HistoryEntry[]> => {
    if (!userId) return [];
    try {
        const { data, error } = await supabase
            .from('creations')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        
        return data.map(item => ({
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
        const { error } = await supabase
            .from('creations')
            .insert([{ 
                prompt: newEntry.prompt, 
                image_url: newEntry.imageUrl,
                user_id: userId
            }]);
        
        if (error) throw error;

    } catch (error) {
        console.error("Failed to save creation to Supabase", error);
        throw error;
    }
};

export const clearCreations = async (userId: string): Promise<void> => {
    if (!userId) return;
    try {
        const { error } = await supabase
            .from('creations')
            .delete()
            .eq('user_id', userId);
        
        if (error) throw error;

    } catch (error) {
        console.error("Failed to clear user creations from Supabase", error);
    }
};