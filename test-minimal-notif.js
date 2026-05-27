//
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf-8');
const SUPABASE_URL = env.match(/VITE_SUPABASE_URL=(.*)/)?.[1]?.trim();
const SUPABASE_KEY = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim();

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testMinimalInsert() {
  console.log("Fetching a customer...");
  const { data: customer } = await supabase.from('customers').select('id').limit(1).single();
  
  if (!customer) {
    console.log("No customer found.");
    return;
  }
  
  console.log("Attempting to insert minimal notification for customer:", customer.id);
  const { data, error } = await supabase.from('notifications').insert({
    customer_id: customer.id,
    title: "Test Minimal Notification",
    message: "This is a minimal test notification."
  });
  
  if (error) {
    console.error("Failed to insert minimal notification:", error);
  } else {
    console.log("Successfully inserted minimal notification!");
  }
}

testMinimalInsert();
