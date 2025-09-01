import { createClient } from '@supabase/supabase-js';

// FIX: Replaced import.meta.env with process.env to align with project conventions and fix TypeScript type errors.
// Access environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key must be provided in the environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
