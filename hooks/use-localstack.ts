import { useQuery } from '@tanstack/react-query';
import { LocalStackHealth, Service } from '@/types';
import { AVAILABLE_SERVICES } from '@/config/services';
import { s3Client, dynamoClient, sqsClient, secretsManagerClient, lambdaClient } from '@/lib/aws-config';
import { ListBucketsCommand } from '@aws-sdk/client-s3';
import { ListTablesCommand } from '@aws-sdk/client-dynamodb';
import { ListQueuesCommand } from '@aws-sdk/client-sqs';
import { ListSecretsCommand } from '@aws-sdk/client-secrets-manager';
import { ListFunctionsCommand } from '@aws-sdk/client-lambda';

async function checkServiceHealth(service: Service): Promise<Service> {
  try {
    switch (service.id) {
      case 's3':
        await s3Client.send(new ListBucketsCommand({}));
        return { ...service, status: 'running' };
      
      case 'dynamodb':
        await dynamoClient.send(new ListTablesCommand({}));
        return { ...service, status: 'running' };
      
      case 'sqs':
        await sqsClient.send(new ListQueuesCommand({}));
        return { ...service, status: 'running' };
      
      case 'secretsmanager':
        await secretsManagerClient.send(new ListSecretsCommand({}));
        return { ...service, status: 'running' };
      
      case 'lambda':
        await lambdaClient.send(new ListFunctionsCommand({}));
        return { ...service, status: 'running' };
      
      default:
        return { ...service, status: service.enabled ? 'unknown' : 'stopped' };
    }
  } catch (error) {
    console.error(`Error checking ${service.name} health:`, error);
    return { ...service, status: 'error' };
  }
}

async function checkLocalStackHealth(): Promise<LocalStackHealth> {
  const endpoint = process.env.NEXT_PUBLIC_LOCALSTACK_ENDPOINT || 'http://localhost:4566';
  
  try {
    const servicePromises = AVAILABLE_SERVICES.map(service => checkServiceHealth(service));
    const services = await Promise.all(servicePromises);
    
    const hasRunningServices = services.some(s => s.status === 'running');
    
    return {
      status: hasRunningServices ? 'healthy' : 'unhealthy',
      endpoint,
      lastChecked: new Date(),
      services,
    };
  } catch (error) {
    console.error('Error checking LocalStack health:', error);
    return {
      status: 'unhealthy',
      endpoint,
      lastChecked: new Date(),
      services: AVAILABLE_SERVICES.map(s => ({ ...s, status: 'error' })),
    };
  }
}

export function useLocalStackHealth() {
  return useQuery({
    queryKey: ['localstack-health'],
    queryFn: checkLocalStackHealth,
    refetchInterval: Number(process.env.NEXT_PUBLIC_REFRESH_INTERVAL) || 5000,
    retry: 1,
  });
}