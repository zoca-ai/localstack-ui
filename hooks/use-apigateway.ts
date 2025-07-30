import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RestApi, ApiResource, ApiDeployment, ApiStage } from '@/types';

// REST API hooks
export function useRestApis() {
  return useQuery<RestApi[]>({
    queryKey: ['rest-apis'],
    queryFn: async () => {
      const response = await fetch('/api/apigateway/apis');
      if (!response.ok) throw new Error('Failed to fetch REST APIs');
      return response.json();
    },
  });
}

export function useRestApi(apiId: string, enabled?: boolean) {
  return useQuery<RestApi>({
    queryKey: ['rest-api', apiId],
    queryFn: async () => {
      const response = await fetch(`/api/apigateway/apis/${apiId}`);
      if (!response.ok) throw new Error('Failed to fetch REST API');
      return response.json();
    },
    enabled: enabled !== false && !!apiId,
  });
}

export function useCreateRestApi() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      name: string;
      description?: string;
      version?: string;
      cloneFrom?: string;
      binaryMediaTypes?: string[];
      minimumCompressionSize?: number;
      apiKeySource?: 'HEADER' | 'AUTHORIZER';
      endpointConfiguration?: {
        types?: Array<'REGIONAL' | 'EDGE' | 'PRIVATE'>;
        vpcEndpointIds?: string[];
      };
      policy?: string;
      tags?: Record<string, string>;
      disableExecuteApiEndpoint?: boolean;
    }) => {
      const response = await fetch('/api/apigateway/apis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create REST API');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rest-apis'] });
    },
  });
}

export function useUpdateRestApi() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      apiId,
      patchOperations,
    }: {
      apiId: string;
      patchOperations: Array<{
        op: 'add' | 'remove' | 'replace' | 'move' | 'copy' | 'test';
        path: string;
        value?: string;
        from?: string;
      }>;
    }) => {
      const response = await fetch(`/api/apigateway/apis/${apiId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patchOperations }),
      });
      if (!response.ok) throw new Error('Failed to update REST API');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rest-apis'] });
      queryClient.invalidateQueries({ queryKey: ['rest-api', variables.apiId] });
    },
  });
}

export function useDeleteRestApi() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (restApiId: string) => {
      const response = await fetch(`/api/apigateway/apis?restApiId=${restApiId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete REST API');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rest-apis'] });
    },
  });
}

// Resource hooks
export function useApiResources(restApiId: string, enabled?: boolean) {
  return useQuery<ApiResource[]>({
    queryKey: ['api-resources', restApiId],
    queryFn: async () => {
      const response = await fetch(`/api/apigateway/resources?restApiId=${restApiId}`);
      if (!response.ok) throw new Error('Failed to fetch resources');
      return response.json();
    },
    enabled: enabled !== false && !!restApiId,
  });
}

export function useCreateResource() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      restApiId: string;
      parentId: string;
      pathPart: string;
    }) => {
      const response = await fetch('/api/apigateway/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create resource');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['api-resources', variables.restApiId] });
    },
  });
}

export function useDeleteResource() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ restApiId, resourceId }: { restApiId: string; resourceId: string }) => {
      const params = new URLSearchParams({ restApiId, resourceId });
      const response = await fetch(`/api/apigateway/resources?${params}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete resource');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['api-resources', variables.restApiId] });
    },
  });
}

// Deployment hooks
export function useApiDeployments(restApiId: string, enabled?: boolean) {
  return useQuery<ApiDeployment[]>({
    queryKey: ['api-deployments', restApiId],
    queryFn: async () => {
      const response = await fetch(`/api/apigateway/deployments?restApiId=${restApiId}`);
      if (!response.ok) throw new Error('Failed to fetch deployments');
      return response.json();
    },
    enabled: enabled !== false && !!restApiId,
  });
}

export function useApiStages(restApiId: string, enabled?: boolean) {
  return useQuery<ApiStage[]>({
    queryKey: ['api-stages', restApiId],
    queryFn: async () => {
      const response = await fetch(`/api/apigateway/deployments?restApiId=${restApiId}&type=stages`);
      if (!response.ok) throw new Error('Failed to fetch stages');
      return response.json();
    },
    enabled: enabled !== false && !!restApiId,
  });
}

export function useCreateDeployment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      restApiId: string;
      stageName?: string;
      stageDescription?: string;
      description?: string;
      cacheClusterEnabled?: boolean;
      cacheClusterSize?: string;
      variables?: Record<string, string>;
      canarySettings?: {
        percentTraffic?: number;
        stageVariableOverrides?: Record<string, string>;
        useStageCache?: boolean;
      };
    }) => {
      const response = await fetch('/api/apigateway/deployments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create deployment');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['api-deployments', variables.restApiId] });
      queryClient.invalidateQueries({ queryKey: ['api-stages', variables.restApiId] });
    },
  });
}

export function useCreateStage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      restApiId: string;
      deploymentId: string;
      stageName: string;
      description?: string;
      variables?: Record<string, string>;
      cacheClusterEnabled?: boolean;
      cacheClusterSize?: string;
    }) => {
      const response = await fetch('/api/apigateway/deployments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, type: 'stage' }),
      });
      if (!response.ok) throw new Error('Failed to create stage');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['api-stages', variables.restApiId] });
    },
  });
}

export function useDeleteStage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ restApiId, stageName }: { restApiId: string; stageName: string }) => {
      const params = new URLSearchParams({ restApiId, stageName });
      const response = await fetch(`/api/apigateway/deployments?${params}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete stage');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['api-stages', variables.restApiId] });
    },
  });
}