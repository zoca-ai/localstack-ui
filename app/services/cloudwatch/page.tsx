'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function CloudWatchPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">CloudWatch</h2>
          <p className="text-muted-foreground">
            Monitor your AWS resources and applications
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>CloudWatch Dashboard</CardTitle>
            <CardDescription>Monitoring and observability</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Badge variant="secondary" className="mb-4">Coming Soon</Badge>
              <p className="text-muted-foreground">
                CloudWatch monitoring will be available in a future release.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}