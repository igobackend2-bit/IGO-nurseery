//
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Read from .env.local
const env = fs.readFileSync('.env.local', 'utf-8');
const SUPABASE_URL = env.match(/VITE_SUPABASE_URL=(.*)/)?.[1]?.trim();
const SUPABASE_KEY = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim();

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testNotifications() {
  console.log("Fetching a customer...");
  const { data: customer } = await supabase.from('customers').select('id').limit(1).single();
  
  if (!customer) {
    console.log("No customer found.");
    return;
  }
  
  console.log("Attempting to insert notification for customer:", customer.id);
  const { data, error } = await supabase.from('notifications').insert({
    customer_id: customer.id,
    title: "Test Notification",
    message: "This is a test notification.",
    type: "order",
    target_page: "customer-profile",
    target_id: "test",
    is_read: false
  });
  
  if (error) {
    console.error("Failed to insert notification:", error);
  } else {
    console.log("Successfully inserted notification!");
  }
}

testNotifications();
