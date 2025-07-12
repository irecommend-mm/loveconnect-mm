
-- Allow public uploads to profile-images bucket for signup process
-- Users can upload files but can only access their own files once authenticated

-- Policy for INSERT (upload) - allow public uploads
CREATE POLICY "Allow public uploads to profile-images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'profile-images');

-- Policy for SELECT (download) - allow public access to view images
CREATE POLICY "Allow public access to profile-images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'profile-images');

-- Policy for UPDATE - only authenticated users can update their files
CREATE POLICY "Authenticated users can update their own files" 
ON storage.objects 
FOR UPDATE 
USING (auth.uid()::text = (storage.foldername(name))[1] AND bucket_id = 'profile-images');

-- Policy for DELETE - only authenticated users can delete their files  
CREATE POLICY "Authenticated users can delete their own files" 
ON storage.objects 
FOR DELETE 
USING (auth.uid()::text = (storage.foldername(name))[1] AND bucket_id = 'profile-images');
