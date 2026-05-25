-- Add the stock column to the products table for real-time inventory tracking
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0;
