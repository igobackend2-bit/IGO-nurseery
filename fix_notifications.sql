-- Fix notifications table columns
ALTER TABLE notifications 
  ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'info',
  ADD COLUMN IF NOT EXISTS target_page TEXT,
  ADD COLUMN IF NOT EXISTS target_id TEXT,
  ADD COLUMN IF NOT EXISTS is_read BOOLEAN NOT NULL DEFAULT false;

-- Make sure RLS is correct and anon can insert
DROP POLICY IF EXISTS "Allow anon full access to notifications" ON notifications;
CREATE POLICY "Allow anon full access to notifications" ON notifications FOR ALL USING (true) WITH CHECK (true);
