-- ============================================================
-- IGO Nursery — Complete Schema Migration
-- Run this ONCE in Supabase SQL Editor → SQL Editor → New Query
-- ============================================================

-- PART 1: Orders table — add missing columns
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS tracking_number  TEXT,
  ADD COLUMN IF NOT EXISTS customer_name    TEXT,
  ADD COLUMN IF NOT EXISTS customer_email   TEXT,
  ADD COLUMN IF NOT EXISTS customer_phone   TEXT,
  ADD COLUMN IF NOT EXISTS last_four        TEXT;

-- PART 2: order_items — add inline product data columns
ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS product_name     TEXT,
  ADD COLUMN IF NOT EXISTS product_image    TEXT,
  ADD COLUMN IF NOT EXISTS product_category TEXT,
  ADD COLUMN IF NOT EXISTS product_price    DECIMAL(10, 2);

-- PART 3: Drop the FK constraint on order_items.product_id
ALTER TABLE order_items
  DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;

-- PART 4: Notifications table (cross-browser inbox — replaces localStorage)
CREATE TABLE IF NOT EXISTS notifications (
  id           BIGSERIAL PRIMARY KEY,
  customer_id  UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title        TEXT        NOT NULL,
  message      TEXT        NOT NULL,
  type         TEXT        NOT NULL DEFAULT 'info',
  target_page  TEXT,
  target_id    TEXT,
  is_read      BOOLEAN     NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Customers can only read their own notifications
DROP POLICY IF EXISTS notif_select ON notifications;
CREATE POLICY notif_select ON notifications
  FOR SELECT USING (auth.uid() = customer_id);

-- Customers can mark their own as read
DROP POLICY IF EXISTS notif_update ON notifications;
CREATE POLICY notif_update ON notifications
  FOR UPDATE USING (auth.uid() = customer_id);

-- Any authenticated user (admin) can insert notifications for customers
DROP POLICY IF EXISTS notif_insert ON notifications;
CREATE POLICY notif_insert ON notifications
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- PART 5: Verify all columns exist
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('orders', 'order_items', 'notifications')
  AND column_name IN (
    'tracking_number','customer_name','customer_email','customer_phone','last_four',
    'product_name','product_image','product_category','product_price',
    'customer_id','is_read','target_page','target_id'
  )
ORDER BY table_name, column_name;
