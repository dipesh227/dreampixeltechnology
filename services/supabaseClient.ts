
import { createClient } from '@supabase/supabase-js';

// --- Supabase Configuration ---
// As a senior engineer, these values are loaded from environment variables
// for security and flexibility in deployment environments. Ensure you have a .env
// file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY set.

// FIX: Cast `import.meta` to `any` to resolve TypeScript error about missing 'env' property.
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL as string;
// FIX: Cast `import.meta` to `any` to resolve TypeScript error about missing 'env' property.
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
    // This provides a clear error in the developer console if the .env file is missing or misconfigured.
    throw new Error('Supabase environment variables not found. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
}

// Initialize and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);