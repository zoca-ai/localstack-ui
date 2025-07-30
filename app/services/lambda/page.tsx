'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function LambdaPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Lambda Functions</h2>
          <p className="text-muted-foreground">
            Manage your Lambda functions
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lambda Dashboard</CardTitle>
            <CardDescription>Serverless function management</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Badge variant="secondary" className="mb-4">Coming Soon</Badge>
              <p className="text-muted-foreground">
                Lambda function management will be available in a future release.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}