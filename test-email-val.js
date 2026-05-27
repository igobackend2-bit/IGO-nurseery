//
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf-8');
const SUPABASE_URL = env.match(/VITE_SUPABASE_URL=(.*)/)?.[1]?.trim();
const SUPABASE_KEY = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim();

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkEmailNotifications() {
  const { data, error } = await supabase.from('customers').select('email, email_notifications').eq('email', 'igobackend3@gmail.com').single();
  if (error) {
    console.error("Failed to select customer:", error);
  } else {
    console.log("Customer data:", data);
  }
}

checkEmailNotifications();
