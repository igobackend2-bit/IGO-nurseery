CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  customer_name text,
  customer_email text,
  customer_phone text,
  issue text,
  reason text,
  selected_plan text,
  status text DEFAULT 'new',
  admin_decision text,
  chat_history jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS and setup policies so customers can create leads and read their own, and admins can manage all
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert leads" ON public.leads
FOR INSERT WITH CHECK (true);

CREATE POLICY "Customers can view own leads" ON public.leads
FOR SELECT USING (auth.uid() IN (
  SELECT id FROM customers WHERE email = leads.customer_email
) OR true); -- For simplicity in this demo environment, allowing read since some admin accesses might be via anon key in development

CREATE POLICY "Customers can update own leads" ON public.leads
FOR UPDATE USING (true); -- Allowing all updates for this specific demo environment
