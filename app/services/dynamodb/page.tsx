'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Database, RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';

export default function DynamoDBPage() {
  const queryClient = useQueryClient();

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">DynamoDB</h1>
            <p className="text-muted-foreground">
              Manage your DynamoDB tables and data
            </p>
          </div>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['dynamodb'] })} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        <Alert>
          <Database className="h-4 w-4" />
          <AlertDescription>
            DynamoDB in LocalStack provides a fast, flexible NoSQL database service for local development. Create tables, manage items, and test your DynamoDB integrations locally.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>DynamoDB Dashboard</CardTitle>
            <CardDescription>Complete DynamoDB management interface</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Badge variant="secondary" className="mb-4">In Development</Badge>
              <p className="text-muted-foreground">
                Table management, data browser, and query builder functionality coming soon.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}