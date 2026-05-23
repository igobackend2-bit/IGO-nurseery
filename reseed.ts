import { createClient } from '@supabase/supabase-js';
import { INITIAL_STORE_PRODUCTS } from './data/storeProducts.ts';

const supabaseUrl = 'https://coeqpwckaepquphacwws.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvZXFwd2NrYWVwcXVwaGFjd3dzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NTk2OTIsImV4cCI6MjA5MzAzNTY5Mn0.pcpHeZjjY5AwSTkZLuzmIHIJ23IIhQ0-rUCKNHgkIi0';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Deleting all existing products...');
  const { error: delError } = await supabase.from('products').delete().neq('id', 'non-existent-12345');
  if (delError) console.error('Delete error:', delError);

  console.log('Seeding initial products with explicit IDs...');
  const dbProducts = INITIAL_STORE_PRODUCTS.map((p, index) => ({
    id: p.id || `store-seeded-${Date.now()}-${index}`,
    name: p.name,
    slug: p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
    price: p.price,
    category: p.category,
    image: p.image,
    description: p.description,
    out_of_stock: p.outOfStock || false,
    is_archived: p.isArchived || false
  }));

  const batchSize = 50;
  for (let i = 0; i < dbProducts.length; i += batchSize) {
    const batch = dbProducts.slice(i, i + batchSize);
    const { error } = await supabase.from('products').insert(batch);
    if (error) {
      console.error('Failed to seed batch:', error);
    } else {
      console.log(`Seeded batch ${i / batchSize + 1}`);
    }
  }
  console.log('Database successfully re-seeded with proper IDs.');
}

run();
