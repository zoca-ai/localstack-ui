'use client';

import { useRestApi } from '@/hooks/use-apigateway';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Globe, Shield, Zap, Link, Calendar } from 'lucide-react';
import { ResourceTree } from './resource-tree';
import { StageList } from './stage-list';

interface ApiViewerProps {
  apiId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApiViewer({ apiId, open, onOpenChange }: ApiViewerProps) {
  const { data: api, isLoading } = useRestApi(apiId, open);

  const getEndpointIcon = (endpointType?: string) => {
    if (endpointType?.includes('EDGE')) {
      return <Zap className="h-4 w-4 text-yellow-500" />;
    } else if (endpointType?.includes('PRIVATE')) {
      return <Shield className="h-4 w-4 text-blue-500" />;
    } else {
      return <Globe className="h-4 w-4 text-green-500" />;
    }
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Loading...</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const endpointUrl = `https://${api?.id}.execute-api.${process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1'}.localhost.localstack.cloud:4566`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            API: {api?.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="stages">Stages</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <div className="mt-4 max-h-[calc(90vh-200px)] overflow-y-auto">
            <TabsContent value="overview" className="space-y-4">
              <Card className="p-4">
                <h3 className="text-sm font-semibold mb-3">API Details</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Name</span>
                    <span className="text-sm font-medium">{api?.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">API ID</span>
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">
                      {api?.id}
                    </code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Endpoint Type</span>
                    <div className="flex items-center gap-2">
                      {getEndpointIcon(api?.endpointConfiguration?.types?.[0])}
                      <Badge variant="outline">
                        {api?.endpointConfiguration?.types?.[0] || 'REGIONAL'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Created</span>
                    <span className="text-sm">
                      {api?.createdDate
                        ? new Date(api.createdDate).toLocaleString()
                        : '-'}
                    </span>
                  </div>
                  {api?.version && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Version</span>
                      <span className="text-sm">{api.version}</span>
                    </div>
                  )}
                  {api?.description && (
                    <div className="pt-2">
                      <span className="text-sm text-muted-foreground">Description</span>
                      <p className="text-sm mt-1">{api.description}</p>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Link className="h-4 w-4" />
                  Endpoint URL
                </h3>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Use this URL to invoke your API (append stage name):
                  </p>
                  <code className="block text-xs bg-muted p-2 rounded">
                    {endpointUrl}/{'{stage}'}
                  </code>
                </div>
              </Card>

              {api?.binaryMediaTypes && api.binaryMediaTypes.length > 0 && (
                <Card className="p-4">
                  <h3 className="text-sm font-semibold mb-3">Binary Media Types</h3>
                  <div className="flex flex-wrap gap-2">
                    {api.binaryMediaTypes.map(type => (
                      <Badge key={type} variant="secondary">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="resources" className="space-y-4">
              <ResourceTree apiId={apiId} rootResourceId={api?.rootResourceId} />
            </TabsContent>
            
            <TabsContent value="stages" className="space-y-4">
              <StageList apiId={apiId} />
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-4">
              <Card className="p-4">
                <h3 className="text-sm font-semibold mb-3">API Settings</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">API Key Source</span>
                    <Badge variant="outline">
                      {api?.apiKeySource || 'HEADER'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Minimum Compression Size</span>
                    <span className="text-sm">
                      {api?.minimumCompressionSize ? `${api.minimumCompressionSize} bytes` : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Execute API Endpoint</span>
                    <Badge variant={api?.disableExecuteApiEndpoint ? 'destructive' : 'default'}>
                      {api?.disableExecuteApiEndpoint ? 'Disabled' : 'Enabled'}
                    </Badge>
                  </div>
                </div>
              </Card>

              {api?.tags && Object.keys(api.tags).length > 0 && (
                <Card className="p-4">
                  <h3 className="text-sm font-semibold mb-3">Tags</h3>
                  <div className="space-y-2">
                    {Object.entries(api.tags).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{key}</span>
                        <span className="text-sm text-muted-foreground">{value}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}