-- ============================================================
-- IGO Nursery — Order Schema Fix Migration
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Add missing customer/tracking columns to orders table
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS tracking_number  TEXT,
  ADD COLUMN IF NOT EXISTS customer_name    TEXT,
  ADD COLUMN IF NOT EXISTS customer_email   TEXT,
  ADD COLUMN IF NOT EXISTS customer_phone   TEXT,
  ADD COLUMN IF NOT EXISTS last_four        TEXT;

-- 2. Add inline product data columns to order_items
--    (so we don't depend on a FK join to reconstruct cart items)
ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS product_name     TEXT,
  ADD COLUMN IF NOT EXISTS product_image    TEXT,
  ADD COLUMN IF NOT EXISTS product_category TEXT;

-- 3. Drop the FK constraint on product_id
--    (store product IDs like "store-1" / "shop-store-1" won't exist in the products table)
ALTER TABLE order_items
  DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;

-- 4. Verify
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('orders', 'order_items')
  AND column_name IN (
    'tracking_number','customer_name','customer_email','customer_phone','last_four',
    'product_name','product_image','product_category'
  )
ORDER BY table_name, column_name;
