import { HistoryEntry } from '../types';
import { supabase } from './supabaseClient';

export const getCreations = async (): Promise<HistoryEntry[]> => {
    try {
        const { data, error } = await supabase
            .from('creations')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        
        return data.map(item => ({
            id: item.id,
            prompt: item.prompt,
            imageUrl: item.image_url,
            timestamp: new Date(item.created_at).getTime()
        }));

    } catch (error) {
        console.error("Failed to fetch creations from Supabase", error);
        return [];
    }
};

export const saveCreation = async (newEntry: HistoryEntry): Promise<void> => {
    try {
        const { error } = await supabase
            .from('creations')
            .insert([{ 
                prompt: newEntry.prompt, 
                image_url: newEntry.imageUrl 
            }]);
        
        if (error) throw error;

    } catch (error) {
        console.error("Failed to save creation to Supabase", error);
        throw error;
    }
};

export const clearCreations = async (): Promise<void> => {
    try {
        const { error } = await supabase
            .from('creations')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Safe delete all
        
        if (error) throw error;

    } catch (error) {
        console.error("Failed to clear creations from Supabase", error);
    }
};