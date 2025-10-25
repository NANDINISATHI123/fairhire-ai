import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ogafdyuawydfrcnhykre.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nYWZkeXVhd3lkZnJjbmh5a3JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNzgzMDAsImV4cCI6MjA3Njk1NDMwMH0.6gYUn_vgELquXd-IBwSuK7mCGcsglCZXX3raXsFbN7g';

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL or anon key is missing.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
