'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ApiList } from '@/components/services/apigateway/api-list';
import { ServicePageLayout } from '@/components/layout/service-page-layout';
import { Globe, Rocket, Shield, Info } from 'lucide-react';
import { useRestApis, useApiStages } from '@/hooks/use-apigateway';

export default function ApiGatewayPage() {
  const { data: apis } = useRestApis();
  
  const totalApis = apis?.length || 0;
  const regionalApis = apis?.filter(api => 
    api.endpointConfiguration?.types?.[0] === 'REGIONAL'
  ).length || 0;
  const edgeApis = apis?.filter(api => 
    api.endpointConfiguration?.types?.[0] === 'EDGE'
  ).length || 0;
  const privateApis = apis?.filter(api => 
    api.endpointConfiguration?.types?.[0] === 'PRIVATE'
  ).length || 0;

  return (
    <ServicePageLayout 
      title="API Gateway" 
      description="Create, deploy, and manage APIs"
      icon={Globe}
    >
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total APIs</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalApis}</div>
            <p className="text-xs text-muted-foreground">
              REST APIs
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Regional</CardTitle>
            <Globe className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{regionalApis}</div>
            <p className="text-xs text-muted-foreground">
              Same region
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Edge</CardTitle>
            <Rocket className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{edgeApis}</div>
            <p className="text-xs text-muted-foreground">
              Global distribution
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Private</CardTitle>
            <Shield className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{privateApis}</div>
            <p className="text-xs text-muted-foreground">
              VPC only
            </p>
          </CardContent>
        </Card>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Amazon API Gateway is a fully managed service that makes it easy for developers to create, 
          publish, maintain, monitor, and secure APIs at any scale. Create REST APIs that act as 
          "front doors" for applications to access data, business logic, or functionality from your 
          backend services.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>REST APIs</CardTitle>
          <CardDescription>
            Manage your REST APIs, resources, methods, and deployments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ApiList />
        </CardContent>
      </Card>
    </ServicePageLayout>
  );
}