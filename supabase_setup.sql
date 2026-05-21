-- SUPABASE INITIALIZATION SCRIPT FOR IGO NURSERY

-- 1. Create Tables
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  category TEXT NOT NULL,
  image TEXT NOT NULL,
  description TEXT,
  stock_quantity INTEGER DEFAULT 100
);

CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE,
  access_key TEXT NOT NULL,
  customer_id UUID REFERENCES customers(id),
  shipping_address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  subtotal NUMERIC NOT NULL,
  tax NUMERIC NOT NULL,
  delivery_charge NUMERIC NOT NULL,
  total NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  estimated_delivery TEXT,
  order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price NUMERIC NOT NULL
);

CREATE TABLE cart (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id),
  quantity INTEGER NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Auto-Generate Order Numbers via Postgres Function & Trigger
CREATE OR SEQUENCE order_number_seq START 10000;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := 'IGO-' || nextval('order_number_seq')::TEXT || '-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 4));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_order_number
BEFORE INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION generate_order_number();

-- 3. Row Level Security (RLS) Configuration

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;

-- PRODUCTS: Anyone can read, only admin can write
CREATE POLICY "Public products read" ON products FOR SELECT USING (true);
CREATE POLICY "Admin products full" ON products USING (auth.role() = 'authenticated');

-- CUSTOMERS: Anon can insert (on checkout), Admins can see all. (Customers tied to anon session don't query this directly).
CREATE POLICY "Anon create customer" ON customers FOR INSERT WITH CHECK (auth.role() = 'anon' OR auth.role() = 'authenticated');
CREATE POLICY "Admin customers full" ON customers USING (auth.role() = 'authenticated');

-- ORDERS: 
-- Admins can do everything
CREATE POLICY "Admin orders full" ON orders USING (auth.role() = 'authenticated');
-- Anonymous customers can CREATE orders
CREATE POLICY "Anon create orders" ON orders FOR INSERT WITH CHECK (auth.role() = 'anon' OR auth.role() = 'authenticated');
-- Anonymous customers can READ orders ONLY IF they have the exact access_key (App layer enforces this via token/query).
CREATE POLICY "Anon read orders with key" ON orders FOR SELECT USING (auth.role() = 'anon');

-- ORDER ITEMS:
CREATE POLICY "Admin order items full" ON order_items USING (auth.role() = 'authenticated');
CREATE POLICY "Anon create order items" ON order_items FOR INSERT WITH CHECK (auth.role() = 'anon' OR auth.role() = 'authenticated');
CREATE POLICY "Anon read order items" ON order_items FOR SELECT USING (auth.role() = 'anon' OR auth.role() = 'authenticated');

-- CART: (Requires local device uuid matching in production, simplified here for anon inserts)
CREATE POLICY "Cart general access" ON cart USING (true); 

-- 4. Create proper Admin user role connection
-- NOTE: In Supabase, you must create your Admin User via "Authentication -> Add User" in the UI. Ensure they have an Email + Password.
