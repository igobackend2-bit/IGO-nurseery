import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf-8');
const SUPABASE_URL = env.match(/VITE_SUPABASE_URL=(.*)/)?.[1]?.trim();
const SUPABASE_KEY = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim();

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkOrdersColumns() {
  const { data, error } = await supabase.from('orders').select('*').limit(1);
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Keys in first order row:", Object.keys(data[0]));
  }
}

checkOrdersColumns();
