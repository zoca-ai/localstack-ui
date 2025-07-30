import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { S3Bucket, S3Object } from '@/types';
import { toast } from 'sonner';

// List all buckets
export function useS3Buckets() {
  return useQuery({
    queryKey: ['s3-buckets'],
    queryFn: async () => {
      const response = await fetch('/api/s3/buckets');
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch buckets');
      }
      const data = await response.json();
      return data.buckets as S3Bucket[];
    },
  });
}

// Create bucket
export function useCreateBucket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bucketName: string) => {
      const response = await fetch('/api/s3/buckets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bucketName }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create bucket');
      }
      
      return response.json();
    },
    onSuccess: (_, bucketName) => {
      queryClient.invalidateQueries({ queryKey: ['s3-buckets'] });
      toast.success(`Bucket "${bucketName}" created successfully`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create bucket');
    },
  });
}

// Delete bucket
export function useDeleteBucket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bucketName: string) => {
      const response = await fetch(`/api/s3/buckets?bucketName=${encodeURIComponent(bucketName)}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete bucket');
      }
      
      return response.json();
    },
    onSuccess: (_, bucketName) => {
      queryClient.invalidateQueries({ queryKey: ['s3-buckets'] });
      toast.success(`Bucket "${bucketName}" deleted successfully`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete bucket');
    },
  });
}

// List objects in a bucket
export function useS3Objects(bucketName: string, prefix?: string) {
  return useQuery({
    queryKey: ['s3-objects', bucketName, prefix],
    queryFn: async () => {
      if (!bucketName) return { objects: [], prefixes: [] };

      const params = new URLSearchParams({
        bucketName,
        ...(prefix && { prefix }),
      });
      
      const response = await fetch(`/api/s3/objects?${params}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch objects');
      }
      
      return response.json();
    },
    enabled: !!bucketName,
  });
}

// Upload object
export function useUploadObject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bucketName,
      key,
      file,
      onProgress,
    }: {
      bucketName: string;
      key: string;
      file: File;
      onProgress?: (progress: number) => void;
    }) => {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('file', file);
        formData.append('bucketName', bucketName);
        formData.append('key', key);

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable && onProgress) {
            const percentComplete = (e.loaded / e.total) * 100;
            onProgress(Math.round(percentComplete));
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(JSON.parse(xhr.responseText).error || 'Upload failed'));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network error'));
        });

        xhr.open('POST', '/api/s3/objects/upload');
        xhr.send(formData);
      });
    },
    onSuccess: (_, { bucketName, key }) => {
      queryClient.invalidateQueries({ queryKey: ['s3-objects', bucketName] });
      toast.success(`File "${key}" uploaded successfully`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to upload file');
    },
  });
}

// Download object
export function useDownloadObject() {
  return useMutation({
    mutationFn: async ({ bucketName, key }: { bucketName: string; key: string }) => {
      const params = new URLSearchParams({
        bucketName,
        key,
      });
      
      const response = await fetch(`/api/s3/objects/download?${params}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to download file');
      }
      
      return response.blob();
    },
    onSuccess: (blob, { key }) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = key.split('/').pop() || key;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success(`Downloaded "${key}"`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to download file');
    },
  });
}

// Delete object
export function useDeleteObject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bucketName, key }: { bucketName: string; key: string }) => {
      const params = new URLSearchParams({
        bucketName,
        key,
      });
      
      const response = await fetch(`/api/s3/objects?${params}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete object');
      }
      
      return response.json();
    },
    onSuccess: (_, { bucketName, key }) => {
      queryClient.invalidateQueries({ queryKey: ['s3-objects', bucketName] });
      toast.success(`Object "${key}" deleted successfully`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete object');
    },
  });
}

// Delete multiple objects
export function useDeleteObjects() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bucketName, keys }: { bucketName: string; keys: string[] }) => {
      const params = new URLSearchParams({
        bucketName,
      });
      keys.forEach(key => params.append('key', key));
      
      const response = await fetch(`/api/s3/objects?${params}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete objects');
      }
      
      return response.json();
    },
    onSuccess: (_, { bucketName, keys }) => {
      queryClient.invalidateQueries({ queryKey: ['s3-objects', bucketName] });
      toast.success(`${keys.length} objects deleted successfully`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete objects');
    },
  });
}

// Check if bucket exists
export function useBucketExists(bucketName: string) {
  return useQuery({
    queryKey: ['s3-bucket-exists', bucketName],
    queryFn: async () => {
      if (!bucketName) return false;
      
      try {
        const response = await fetch('/api/s3/buckets');
        if (!response.ok) return false;
        
        const data = await response.json();
        return data.buckets.some((bucket: S3Bucket) => bucket.name === bucketName);
      } catch {
        return false;
      }
    },
    enabled: !!bucketName,
  });
}