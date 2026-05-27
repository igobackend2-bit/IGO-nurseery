//
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf-8');
const SUPABASE_URL = env.match(/VITE_SUPABASE_URL=(.*)/)?.[1]?.trim();
const SUPABASE_KEY = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim();

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testEmail() {
  console.log("Checking customer email_notifications column...");
  const { data, error } = await supabase.from('customers').select('email_notifications').limit(1);
  if (error) {
    console.error("Failed to select email_notifications:", error);
  } else {
    console.log("email_notifications column exists!");
  }
}

testEmail();
