'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function SQSPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">SQS Management</h2>
          <p className="text-muted-foreground">
            Manage your SQS queues and messages
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>SQS Dashboard</CardTitle>
            <CardDescription>Complete SQS management interface</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Badge variant="secondary" className="mb-4">In Development</Badge>
              <p className="text-muted-foreground">
                Queue management, message operations, and monitoring functionality coming soon.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}