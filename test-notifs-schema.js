//
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf-8');
const SUPABASE_URL = env.match(/VITE_SUPABASE_URL=(.*)/)?.[1]?.trim();
const SUPABASE_KEY = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim();

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function inspectSchema() {
  console.log("We can't use information_schema from anon key. Let's try inserting an object with everything to see what fails.");
  const payload = {
    customer_id: '0807c958-49f0-4462-9db3-0289886444cd', // valid uuid
    title: 'test',
    message: 'test',
    type: 'test',
    target_page: 'test',
    target_id: 'test',
    is_read: false,
    order_number: 'test'
  };
  
  // Try inserting just order_number and customer_id
  const { error } = await supabase.from('notifications').insert({
    customer_id: payload.customer_id,
    order_number: '123'
  });
  console.log("Insert with only order_number + customer_id result:", error);
}
inspectSchema();
