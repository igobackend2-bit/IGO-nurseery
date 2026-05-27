//
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf-8');
const SUPABASE_URL = env.match(/VITE_SUPABASE_URL=(.*)/)?.[1]?.trim();
const SUPABASE_KEY = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim();

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function inspectSchema2() {
  const { error } = await supabase.from('notifications').insert({
    customer_id: '0807c958-49f0-4462-9db3-0289886444cd',
    order_number: '123',
    type: 'order_shipped'
  });
  console.log("Insert result:", error);
}
inspectSchema2();
