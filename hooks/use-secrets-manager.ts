import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Secret, SecretValue, SecretVersion } from '@/types';
import { toast } from 'sonner';

// List all secrets
export function useSecrets() {
  return useQuery({
    queryKey: ['secrets'],
    queryFn: async () => {
      const response = await fetch('/api/secrets-manager/secrets');
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch secrets');
      }
      const data = await response.json();
      return data.secrets as Secret[];
    },
  });
}

// Get secret details with optional value
export function useSecret(secretId: string | null, includeValue: boolean = false) {
  return useQuery({
    queryKey: ['secret', secretId, includeValue],
    queryFn: async () => {
      if (!secretId) return null;
      
      const params = new URLSearchParams({
        secretId,
        includeValue: includeValue.toString(),
      });
      
      const response = await fetch(`/api/secrets-manager/secrets?${params}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch secret');
      }
      
      return response.json();
    },
    enabled: !!secretId,
  });
}

// Create secret
export function useCreateSecret() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      description,
      secretString,
      secretBinary,
      tags,
    }: {
      name: string;
      description?: string;
      secretString?: string;
      secretBinary?: string;
      tags?: Record<string, string>;
    }) => {
      const response = await fetch('/api/secrets-manager/secrets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, secretString, secretBinary, tags }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create secret');
      }
      
      return response.json();
    },
    onSuccess: (_, { name }) => {
      queryClient.invalidateQueries({ queryKey: ['secrets'] });
      toast.success(`Secret "${name}" created successfully`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create secret');
    },
  });
}

// Update secret value
export function useUpdateSecretValue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      secretId,
      secretString,
      secretBinary,
    }: {
      secretId: string;
      secretString?: string;
      secretBinary?: string;
    }) => {
      const response = await fetch('/api/secrets-manager/secrets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secretId, secretString, secretBinary }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update secret');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['secret', data.name] });
      queryClient.invalidateQueries({ queryKey: ['secret-versions'] });
      toast.success('Secret value updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update secret');
    },
  });
}

// Delete secret
export function useDeleteSecret() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      secretId,
      forceDelete = false,
    }: {
      secretId: string;
      forceDelete?: boolean;
    }) => {
      const params = new URLSearchParams({
        secretId,
        forceDelete: forceDelete.toString(),
      });
      
      const response = await fetch(`/api/secrets-manager/secrets?${params}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete secret');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['secrets'] });
      const message = data.deletionDate
        ? `Secret scheduled for deletion on ${new Date(data.deletionDate).toLocaleDateString()}`
        : 'Secret deleted permanently';
      toast.success(message);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete secret');
    },
  });
}

// List secret versions
export function useSecretVersions(secretId: string | null) {
  return useQuery({
    queryKey: ['secret-versions', secretId],
    queryFn: async () => {
      if (!secretId) return [];
      
      const params = new URLSearchParams({ secretId });
      const response = await fetch(`/api/secrets-manager/versions?${params}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch versions');
      }
      
      const data = await response.json();
      return data.versions as SecretVersion[];
    },
    enabled: !!secretId,
  });
}

// Get specific version value
export function useSecretVersionValue(secretId: string | null, versionId: string | null) {
  return useQuery({
    queryKey: ['secret-version-value', secretId, versionId],
    queryFn: async () => {
      if (!secretId || !versionId) return null;
      
      const params = new URLSearchParams({ secretId, versionId });
      const response = await fetch(`/api/secrets-manager/versions?${params}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch version value');
      }
      
      return await response.json() as SecretValue;
    },
    enabled: !!secretId && !!versionId,
  });
}