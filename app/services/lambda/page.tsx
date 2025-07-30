'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { FunctionList } from '@/components/services/lambda/function-list';
import { FunctionViewer } from '@/components/services/lambda/function-viewer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Cpu, Timer, Package, RefreshCw } from 'lucide-react';
import { LambdaFunction } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function LambdaPage() {
  const [selectedFunction, setSelectedFunction] = useState<LambdaFunction | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleViewFunction = (func: LambdaFunction) => {
    setSelectedFunction(func);
    setViewerOpen(true);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['lambda-functions'] });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Lambda Functions</h2>
            <p className="text-muted-foreground">
              View and monitor your serverless functions
            </p>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Serverless Compute
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Run code without managing servers
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4" />
                  Event-Driven
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Trigger functions from various AWS services
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4" />
                  Multiple Runtimes
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Support for Node.js, Python, Java, and more
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Layers Support
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Share code and libraries across functions
              </p>
            </CardContent>
          </Card>
        </div>

        <Alert>
          <AlertTitle>LocalStack Lambda</AlertTitle>
          <AlertDescription>
            This interface provides read-only access to Lambda functions in your LocalStack instance.
            Use the AWS CLI or SDK to deploy and manage functions.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Lambda Functions</CardTitle>
                <CardDescription>
                  View your deployed Lambda functions and their configurations
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <FunctionList onViewFunction={handleViewFunction} />
          </CardContent>
        </Card>

        <FunctionViewer
          func={selectedFunction}
          open={viewerOpen}
          onOpenChange={setViewerOpen}
        />
      </div>
    </MainLayout>
  );
}