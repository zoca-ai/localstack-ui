'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function DynamoDBPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">DynamoDB Management</h2>
          <p className="text-muted-foreground">
            Manage your DynamoDB tables and data
          </p>
        </div>

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