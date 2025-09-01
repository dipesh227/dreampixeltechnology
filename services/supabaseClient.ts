import { createClient } from '@supabase/supabase-js';

// --- Supabase Configuration ---
// As a senior engineer, the best practice is to load these values from environment variables.
// (e.g., const supabaseUrl = process.env.VITE_SUPABASE_URL;).
// However, to ensure the application works immediately as requested, the connection
// strings have been configured directly here. For a production deployment, it is
// strongly recommended to move these credentials to a secure environment configuration.

const supabaseUrl = 'https://ftsvupbnmvphphvwzxha.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0c3Z1cGJubXZwaHBodnd6eGhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MzI3OTAsImV4cCI6MjA3MjMwODc5MH0.zSrEpRrmZNUPIM0wlaz2Kih8aSfcdbX1zXa9kDO8xK8';

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('CRITICAL: Supabase credentials are not configured. Database features will fail.');
}

// Initialize and export the Supabase client
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
