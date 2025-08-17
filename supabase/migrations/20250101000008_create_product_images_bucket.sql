-- Create product-images storage bucket
INSERT INTO STORAGE.BUCKETS (
    ID,
    NAME,
    PUBLIC,
    FILE_SIZE_LIMIT,
    ALLOWED_MIME_TYPES
) VALUES (
    'product-images',
    'product-images',
    TRUE,
    5242880, -- 5MB
    ARRAY['image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif']
) ON CONFLICT (
    ID
) DO NOTHING;

-- Create storage policy for public read access
CREATE POLICY "Public read access for product images" ON STORAGE.OBJECTS
FOR SELECT USING (BUCKET_ID = 'product-images');

-- Create storage policy for authenticated users to upload
CREATE POLICY "Authenticated users can upload product images" ON STORAGE.OBJECTS
FOR INSERT WITH CHECK (
  BUCKET_ID = 'product-images'
  AND AUTH.ROLE() = 'authenticated'
);

-- Create storage policy for authenticated users to update their uploads
CREATE POLICY "Authenticated users can update product images" ON STORAGE.OBJECTS
FOR UPDATE USING (
  BUCKET_ID = 'product-images'
  AND AUTH.ROLE() = 'authenticated'
);

-- Create storage policy for authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete product images" ON STORAGE.OBJECTS
FOR DELETE USING (
  BUCKET_ID = 'product-images'
  AND AUTH.ROLE() = 'authenticated'
);