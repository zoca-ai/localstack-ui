'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function IAMPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">IAM</h2>
          <p className="text-muted-foreground">
            Identity and Access Management
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>IAM Dashboard</CardTitle>
            <CardDescription>Manage users, roles, and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Badge variant="secondary" className="mb-4">Coming Soon</Badge>
              <p className="text-muted-foreground">
                IAM management will be available in a future release.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}