-- 1. Ensure the products table has the correct columns and data types
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    price NUMERIC NOT NULL,
    category TEXT NOT NULL,
    image TEXT NOT NULL,
    description TEXT,
    out_of_stock BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Make sure the table allows operations from the frontend
-- Since the frontend uses the "anon" key and custom localStorage admin login,
-- we need to disable Row Level Security (RLS) for the products table 
-- OR create a wide-open policy.

-- Disable RLS so your custom admin panel can freely insert/update/delete products
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;

-- 3. Grant full access to the anon and authenticated roles
GRANT ALL ON TABLE public.products TO anon;
GRANT ALL ON TABLE public.products TO authenticated;
GRANT ALL ON TABLE public.products TO service_role;
