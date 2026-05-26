-- Run this in the Supabase SQL Editor to fix the Foreign Key error
-- This allows orders to be placed by test users created in the Supabase UI 
-- who do not exist in the public customers table.

ALTER TABLE orders
  DROP CONSTRAINT IF EXISTS orders_customer_id_fkey;
