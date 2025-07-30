'use client';

import { useStack, useStackTemplate } from '@/hooks/use-cloudformation';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Layers, 
  FileCode, 
  Activity, 
  Package, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  XCircle,
  Info
} from 'lucide-react';
import { ResourceList } from './resource-list';
import { EventList } from './event-list';
import { cn } from '@/lib/utils';

interface StackViewerProps {
  stackName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StackViewer({ stackName, open, onOpenChange }: StackViewerProps) {
  const { data: stack, isLoading: stackLoading } = useStack(stackName, open);
  const { data: template, isLoading: templateLoading } = useStackTemplate(stackName, open);

  const getStatusIcon = (status?: string) => {
    if (!status) return null;
    
    if (status.includes('COMPLETE') && !status.includes('FAILED') && !status.includes('ROLLBACK')) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (status.includes('IN_PROGRESS')) {
      return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />;
    } else if (status.includes('FAILED') || status.includes('ROLLBACK')) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    } else {
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusVariant = (status?: string): "default" | "secondary" | "destructive" | "outline" => {
    if (!status) return 'outline';
    
    if (status.includes('COMPLETE') && !status.includes('FAILED') && !status.includes('ROLLBACK')) {
      return 'default';
    } else if (status.includes('IN_PROGRESS')) {
      return 'secondary';
    } else if (status.includes('FAILED') || status.includes('ROLLBACK')) {
      return 'destructive';
    } else {
      return 'outline';
    }
  };

  if (stackLoading) {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Stack: {stackName}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="template">Template</TabsTrigger>
            <TabsTrigger value="outputs">Outputs</TabsTrigger>
          </TabsList>
          
          <div className="mt-4 max-h-[calc(90vh-200px)] overflow-y-auto">
            <TabsContent value="overview" className="space-y-4">
              <Card className="p-4">
                <h3 className="text-sm font-semibold mb-3">Stack Details</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(stack?.stackStatus)}
                      <Badge variant={getStatusVariant(stack?.stackStatus)}>
                        {stack?.stackStatus}
                      </Badge>
                    </div>
                  </div>
                  {stack?.stackStatusReason && (
                    <div className="pt-2">
                      <span className="text-sm text-muted-foreground">Status Reason</span>
                      <p className="text-sm mt-1">{stack.stackStatusReason}</p>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Created</span>
                    <span className="text-sm">
                      {stack?.creationTime
                        ? new Date(stack.creationTime).toLocaleString()
                        : '-'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Last Updated</span>
                    <span className="text-sm">
                      {stack?.lastUpdatedTime
                        ? new Date(stack.lastUpdatedTime).toLocaleString()
                        : '-'}
                    </span>
                  </div>
                  {stack?.description && (
                    <div className="pt-2">
                      <span className="text-sm text-muted-foreground">Description</span>
                      <p className="text-sm mt-1">{stack.description}</p>
                    </div>
                  )}
                </div>
              </Card>

              {stack?.capabilities && stack.capabilities.length > 0 && (
                <Card className="p-4">
                  <h3 className="text-sm font-semibold mb-3">Capabilities</h3>
                  <div className="flex flex-wrap gap-2">
                    {stack.capabilities.map(capability => (
                      <Badge key={capability} variant="outline">
                        {capability}
                      </Badge>
                    ))}
                  </div>
                </Card>
              )}

              {stack?.parameters && stack.parameters.length > 0 && (
                <Card className="p-4">
                  <h3 className="text-sm font-semibold mb-3">Parameters</h3>
                  <div className="space-y-2">
                    {stack.parameters.map((param, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{param.parameterKey}</span>
                        <span className="text-sm text-muted-foreground">
                          {param.parameterValue || '-'}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {stack?.stackId && (
                <Card className="p-4">
                  <h3 className="text-sm font-semibold mb-3">Stack ID</h3>
                  <p className="text-xs font-mono break-all bg-muted p-2 rounded">
                    {stack.stackId}
                  </p>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="resources" className="space-y-4">
              <ResourceList stackName={stackName} />
            </TabsContent>
            
            <TabsContent value="events" className="space-y-4">
              <EventList stackName={stackName} />
            </TabsContent>
            
            <TabsContent value="template" className="space-y-4">
              {templateLoading ? (
                <Skeleton className="h-96 w-full" />
              ) : template?.templateBody ? (
                <Card className="p-4">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <FileCode className="h-4 w-4" />
                    Template
                  </h3>
                  <pre className="text-xs bg-muted p-4 rounded-md overflow-auto max-h-[500px]">
                    {template.templateBody}
                  </pre>
                </Card>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Template not available
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
            
            <TabsContent value="outputs" className="space-y-4">
              {stack?.outputs && stack.outputs.length > 0 ? (
                <Card className="p-4">
                  <h3 className="text-sm font-semibold mb-3">Stack Outputs</h3>
                  <div className="space-y-3">
                    {stack.outputs.map((output, idx) => (
                      <div key={idx} className="space-y-1 pb-3 border-b last:border-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{output.outputKey}</span>
                          {output.exportName && (
                            <Badge variant="outline" className="text-xs">
                              Export: {output.exportName}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {output.outputValue}
                        </p>
                        {output.description && (
                          <p className="text-xs text-muted-foreground">
                            {output.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              ) : (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    No outputs defined for this stack
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}