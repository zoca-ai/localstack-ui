import { useQuery } from '@tanstack/react-query';
import { LambdaFunction } from '@/types';

// List all Lambda functions
export function useLambdaFunctions() {
  return useQuery({
    queryKey: ['lambda-functions'],
    queryFn: async () => {
      const response = await fetch('/api/lambda/functions');
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch Lambda functions');
      }
      const data = await response.json();
      return data.functions as LambdaFunction[];
    },
  });
}

// Get specific Lambda function details
export function useLambdaFunction(functionName: string | null) {
  return useQuery({
    queryKey: ['lambda-function', functionName],
    queryFn: async () => {
      if (!functionName) return null;
      
      const params = new URLSearchParams({ functionName });
      const response = await fetch(`/api/lambda/functions?${params}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch Lambda function');
      }
      
      const data = await response.json();
      return data.function as LambdaFunction;
    },
    enabled: !!functionName,
  });
}