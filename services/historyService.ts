import { HistoryEntry } from '../types';
import { supabase } from './supabaseClient';

const MAX_HISTORY_ITEMS = 50;

export const getCreations = async (): Promise<HistoryEntry[]> => {
    const { data, error } = await supabase
        .from('creations')
        .select('id, prompt, image_url, created_at')
        .order('created_at', { ascending: false })
        .limit(MAX_HISTORY_ITEMS);

    if (error) {
        console.error("Failed to fetch creations from Supabase", error);
        return [];
    }

    // Map Supabase response to the application's HistoryEntry type
    return data.map(item => ({
        id: item.id,
        prompt: item.prompt,
        imageUrl: item.image_url,
        timestamp: Date.parse(item.created_at),
    }));
};

export const saveCreation = async (newEntry: { prompt: string; imageUrl: string }): Promise<void> => {
    const { error } = await supabase
        .from('creations')
        .insert([
            { prompt: newEntry.prompt, image_url: newEntry.imageUrl }
        ]);
    
    if (error) {
        console.error("Failed to save creation to Supabase", error);
    }
};

export const clearCreations = async (): Promise<void> => {
    // This will delete all records in the creations table.
    // In a multi-user app, you would add a .eq('user_id', userId) filter.
    const { error } = await supabase
        .from('creations')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // A condition that is always true to delete all rows

    if (error) {
        console.error("Failed to clear creations from Supabase", error);
    }
};