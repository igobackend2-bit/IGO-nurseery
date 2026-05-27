import { updateAdminOrderStatus } from './services/api.js';

async function test() {
  console.log("Testing updateAdminOrderStatus with DELIVERED status...");
  
  // We need a real order number from the DB
  const { supabase } = await import('./services/supabaseClient.js');
  const { data: order } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(1).single();
  
  if (!order) {
    console.error("No order found");
    return;
  }
  
  console.log("Updating order:", order.order_number);
  
  try {
    const result = await updateAdminOrderStatus('', order.order_number, 'delivered');
    console.log("Result success:", !!result.order);
  } catch (err) {
    console.error("Error calling updateAdminOrderStatus:", err);
  }
}

test();
