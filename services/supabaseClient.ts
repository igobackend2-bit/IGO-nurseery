import { createClient } from '@supabase/supabase-js';

// VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in Vercel environment variables.
// The anon key is safe to use in frontend code — it is a public key by design.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://coeqpwckaepquphacwws.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvZXFwd2NrYWVwcXVwaGFjd3dzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NTk2OTIsImV4cCI6MjA5MzAzNTY5Mn0.pcpHeZjjY5AwSTkZLuzmIHIJ23IIhQ0-rUCKNHgkIi0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
