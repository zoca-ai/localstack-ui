'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { SecretList } from '@/components/services/secretsmanager/secret-list';
import { CreateSecretDialog } from '@/components/services/secretsmanager/create-secret-dialog';
import { SecretViewer } from '@/components/services/secretsmanager/secret-viewer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Key, Shield, RefreshCw } from 'lucide-react';
import { Secret } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function SecretsManagerPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedSecret, setSelectedSecret] = useState<Secret | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [editingSecret, setEditingSecret] = useState<Secret | null>(null);
  const queryClient = useQueryClient();

  const handleViewSecret = (secret: Secret) => {
    setSelectedSecret(secret);
    setViewerOpen(true);
  };

  const handleEditSecret = (secret: Secret) => {
    setEditingSecret(secret);
    setCreateDialogOpen(true);
    setViewerOpen(false);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['secrets'] });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Secrets Manager</h2>
            <p className="text-muted-foreground">
              Securely store and manage your application secrets
            </p>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Secure Storage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Store API keys, database passwords, and other sensitive data securely
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Version Control
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Automatic versioning of secrets with the ability to restore previous versions
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Rotation Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Schedule automatic rotation of secrets to maintain security best practices
              </p>
            </CardContent>
          </Card>
        </div>

        <Alert>
          <AlertTitle>LocalStack Secrets Manager</AlertTitle>
          <AlertDescription>
            This interface manages secrets in your LocalStack instance. All secrets are stored
            locally and are not synchronized with AWS.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Secrets</CardTitle>
                <CardDescription>
                  Manage your stored secrets and credentials
                </CardDescription>
              </div>
              <Button 
                onClick={() => {
                  setEditingSecret(null);
                  setCreateDialogOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Secret
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <SecretList
              onViewSecret={handleViewSecret}
              onEditSecret={handleEditSecret}
            />
          </CardContent>
        </Card>

        <CreateSecretDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          editingSecret={editingSecret}
        />

        <SecretViewer
          secret={selectedSecret}
          open={viewerOpen}
          onOpenChange={setViewerOpen}
          onEdit={() => {
            if (selectedSecret) {
              handleEditSecret(selectedSecret);
            }
          }}
        />
      </div>
    </MainLayout>
  );
}