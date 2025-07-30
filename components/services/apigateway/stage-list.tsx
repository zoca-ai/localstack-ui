'use client';

import { useState } from 'react';
import { useApiStages, useApiDeployments, useCreateDeployment, useDeleteStage } from '@/hooks/use-apigateway';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Rocket, Trash2, ExternalLink, Copy } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface StageListProps {
  apiId: string;
}

export function StageList({ apiId }: StageListProps) {
  const { data: stages, isLoading: stagesLoading } = useApiStages(apiId, true);
  const { data: deployments, isLoading: deploymentsLoading } = useApiDeployments(apiId, true);
  const createDeployment = useCreateDeployment();
  const deleteStage = useDeleteStage();
  
  const [showDeployDialog, setShowDeployDialog] = useState(false);
  const [stageName, setStageName] = useState('');
  const [stageDescription, setStageDescription] = useState('');
  const [deploymentDescription, setDeploymentDescription] = useState('');
  const [stageToDelete, setStageToDelete] = useState<string | null>(null);

  const isLoading = stagesLoading || deploymentsLoading;

  const handleDeploy = async () => {
    if (!stageName) {
      toast.error('Stage name is required');
      return;
    }

    try {
      await createDeployment.mutateAsync({
        restApiId: apiId,
        stageName,
        stageDescription,
        description: deploymentDescription,
      });
      toast.success(`Deployment to stage "${stageName}" created successfully`);
      setShowDeployDialog(false);
      resetForm();
    } catch (error: any) {
      toast.error(`Failed to create deployment: ${error.message}`);
    }
  };

  const handleDeleteStage = async () => {
    if (!stageToDelete) return;

    try {
      await deleteStage.mutateAsync({
        restApiId: apiId,
        stageName: stageToDelete,
      });
      toast.success(`Stage "${stageToDelete}" deleted successfully`);
      setStageToDelete(null);
    } catch (error: any) {
      toast.error(`Failed to delete stage: ${error.message}`);
    }
  };

  const resetForm = () => {
    setStageName('');
    setStageDescription('');
    setDeploymentDescription('');
  };

  const copyUrl = (stage: string) => {
    const url = `https://${apiId}.execute-api.${process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1'}.localhost.localstack.cloud:4566/${stage}`;
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">Stages</h3>
          <Button size="sm" onClick={() => setShowDeployDialog(true)}>
            <Rocket className="mr-2 h-4 w-4" />
            Deploy API
          </Button>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Stage Name</TableHead>
                <TableHead>Deployment ID</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>URL</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!stages || stages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No stages deployed. Deploy your API to create a stage.
                  </TableCell>
                </TableRow>
              ) : (
                stages.map((stage) => {
                  const stageUrl = `https://${apiId}.execute-api.${process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1'}.localhost.localstack.cloud:4566/${stage.stageName}`;
                  
                  return (
                    <TableRow key={stage.stageName}>
                      <TableCell className="font-medium">
                        <Badge variant="outline">{stage.stageName}</Badge>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">
                          {stage.deploymentId}
                        </code>
                      </TableCell>
                      <TableCell>
                        {stage.lastUpdatedDate
                          ? new Date(stage.lastUpdatedDate).toLocaleString()
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-muted px-1 py-0.5 rounded max-w-xs truncate">
                            {stageUrl}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyUrl(stage.stageName || '')}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(stageUrl, '_blank')}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setStageToDelete(stage.stageName || null)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-4">Recent Deployments</h3>
        <div className="space-y-2">
          {!deployments || deployments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No deployments yet
            </p>
          ) : (
            deployments.slice(0, 5).map((deployment) => (
              <div key={deployment.id} className="flex items-center justify-between p-2 border rounded">
                <div>
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">
                    {deployment.id}
                  </code>
                  {deployment.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {deployment.description}
                    </p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {deployment.createdDate
                    ? new Date(deployment.createdDate).toLocaleString()
                    : '-'}
                </span>
              </div>
            ))
          )}
        </div>
      </Card>

      <Dialog open={showDeployDialog} onOpenChange={setShowDeployDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deploy API</DialogTitle>
            <DialogDescription>
              Create a new deployment and optionally a new stage
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="stageName">Stage Name *</Label>
              <Input
                id="stageName"
                placeholder="prod, dev, or test"
                value={stageName}
                onChange={(e) => setStageName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Use an existing stage name or create a new one
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stageDescription">Stage Description</Label>
              <Input
                id="stageDescription"
                placeholder="Production stage"
                value={stageDescription}
                onChange={(e) => setStageDescription(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="deploymentDescription">Deployment Description</Label>
              <Input
                id="deploymentDescription"
                placeholder="Initial deployment"
                value={deploymentDescription}
                onChange={(e) => setDeploymentDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowDeployDialog(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleDeploy} disabled={createDeployment.isPending}>
              {createDeployment.isPending ? 'Deploying...' : 'Deploy'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!stageToDelete} onOpenChange={(open) => !open && setStageToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Stage</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the stage "{stageToDelete}"? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteStage} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}