-- Run this in the Supabase SQL Editor
-- This removes the NOT NULL constraints from the new columns
-- so that your current live website can place orders successfully!

ALTER TABLE order_items 
  ALTER COLUMN product_name DROP NOT NULL,
  ALTER COLUMN product_image DROP NOT NULL,
  ALTER COLUMN product_category DROP NOT NULL,
  ALTER COLUMN product_price DROP NOT NULL;
