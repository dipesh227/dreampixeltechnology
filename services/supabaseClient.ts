import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase environment variables not found. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
    // We don't throw an error here to allow the app to run, 
    // but features requiring Supabase will fail.
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
