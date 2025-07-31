"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { SecretList } from "@/components/services/secretsmanager/secret-list";
import { SecretDialog } from "@/components/services/secretsmanager/secret-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Key, Shield, RefreshCw, Info } from "lucide-react";
import { Secret } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SecretsManagerPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSecret, setSelectedSecret] = useState<Secret | null>(null);
  const [dialogMode, setDialogMode] = useState<"create" | "view" | "edit">(
    "create",
  );
  const queryClient = useQueryClient();

  const handleViewSecret = (secret: Secret) => {
    setSelectedSecret(secret);
    setDialogMode("view");
    setDialogOpen(true);
  };

  const handleEditSecret = (secret: Secret) => {
    setSelectedSecret(secret);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleCreateSecret = () => {
    setSelectedSecret(null);
    setDialogMode("create");
    setDialogOpen(true);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["secrets"] });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Secrets Manager</h1>
            <p className="text-muted-foreground">
              Securely store and manage your application secrets
            </p>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            This interface manages secrets in your LocalStack instance. All
            secrets are stored locally and are not synchronized with AWS.
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
              <Button onClick={handleCreateSecret}>
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

        <SecretDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          secret={selectedSecret}
          mode={dialogMode}
        />
      </div>
    </MainLayout>
  );
}
