-- Create storage bucket for prompt images
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true);

-- Create policy to allow authenticated users to upload images
CREATE POLICY "Users can upload their own images" ON storage.objects
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND
  bucket_id = 'images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create policy to allow public read access to images
CREATE POLICY "Images are publicly readable" ON storage.objects
FOR SELECT USING (bucket_id = 'images');

-- Create policy to allow users to update their own images
CREATE POLICY "Users can update their own images" ON storage.objects
FOR UPDATE USING (
  auth.role() = 'authenticated' AND
  bucket_id = 'images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create policy to allow users to delete their own images
CREATE POLICY "Users can delete their own images" ON storage.objects
FOR DELETE USING (
  auth.role() = 'authenticated' AND
  bucket_id = 'images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
