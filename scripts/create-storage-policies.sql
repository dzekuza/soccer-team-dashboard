-- Create a bucket for event cover images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('covers', 'covers', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies to ensure a clean slate
DROP POLICY IF EXISTS "authenticated_user_can_upload_covers" ON storage.objects;
DROP POLICY IF EXISTS "anyone_can_view_covers" ON storage.objects;

-- Allow any authenticated user to upload to the 'covers' bucket
CREATE POLICY "authenticated_user_can_upload_covers"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'covers');

-- Allow anyone to view images in the 'covers' bucket
CREATE POLICY "anyone_can_view_covers"
ON storage.objects
FOR SELECT
USING (bucket_id = 'covers'); 