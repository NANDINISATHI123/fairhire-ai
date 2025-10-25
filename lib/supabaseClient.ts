import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('YOUR_SUPABASE_URL')) {
    throw new Error("Supabase URL or anon key is missing. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set correctly in your .env file.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);