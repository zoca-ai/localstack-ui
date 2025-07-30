'use client';

import { useState } from 'react';
import { useApiResources, useCreateResource, useDeleteResource } from '@/hooks/use-apigateway';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { 
  ChevronRight, 
  ChevronDown, 
  FolderOpen, 
  FileCode, 
  Plus, 
  Trash2,
  Globe
} from 'lucide-react';
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

interface ResourceTreeProps {
  apiId: string;
  rootResourceId?: string;
}

interface ResourceNodeProps {
  resource: any;
  allResources: any[];
  apiId: string;
  level: number;
  onRefresh: () => void;
}

function ResourceNode({ resource, allResources, apiId, level, onRefresh }: ResourceNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newPathPart, setNewPathPart] = useState('');
  const createResource = useCreateResource();
  const deleteResource = useDeleteResource();

  const children = allResources.filter(r => r.parentId === resource.id);
  const hasChildren = children.length > 0;
  const hasMethods = resource.resourceMethods && Object.keys(resource.resourceMethods).length > 0;

  const handleCreate = async () => {
    if (!newPathPart) {
      toast.error('Path part is required');
      return;
    }

    try {
      await createResource.mutateAsync({
        restApiId: apiId,
        parentId: resource.id,
        pathPart: newPathPart,
      });
      toast.success(`Resource "${newPathPart}" created successfully`);
      setShowCreateDialog(false);
      setNewPathPart('');
      onRefresh();
    } catch (error: any) {
      toast.error(`Failed to create resource: ${error.message}`);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteResource.mutateAsync({
        restApiId: apiId,
        resourceId: resource.id,
      });
      toast.success('Resource deleted successfully');
      setShowDeleteDialog(false);
      onRefresh();
    } catch (error: any) {
      toast.error(`Failed to delete resource: ${error.message}`);
    }
  };

  return (
    <>
      <div
        className={`flex items-center gap-2 p-2 hover:bg-muted/50 rounded cursor-pointer`}
        style={{ paddingLeft: `${level * 20}px` }}
      >
        <div className="flex items-center gap-2 flex-1" onClick={() => setIsExpanded(!isExpanded)}>
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )
          ) : (
            <div className="w-4" />
          )}
          {hasChildren || hasMethods ? (
            <FolderOpen className="h-4 w-4 text-blue-500" />
          ) : (
            <FileCode className="h-4 w-4 text-gray-500" />
          )}
          <span className="text-sm font-medium">{resource.path}</span>
          {hasMethods && (
            <div className="flex gap-1">
              {Object.keys(resource.resourceMethods).map(method => (
                <span
                  key={method}
                  className="text-xs px-1.5 py-0.5 bg-primary/10 text-primary rounded font-semibold"
                >
                  {method}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setShowCreateDialog(true);
            }}
          >
            <Plus className="h-3 w-3" />
          </Button>
          {resource.path !== '/' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteDialog(true);
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {isExpanded && hasChildren && (
        <div>
          {children.map(child => (
            <ResourceNode
              key={child.id}
              resource={child}
              allResources={allResources}
              apiId={apiId}
              level={level + 1}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      )}

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Resource</DialogTitle>
            <DialogDescription>
              Add a new resource under {resource.path}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="pathPart">Path Part</Label>
              <Input
                id="pathPart"
                placeholder="{id} or users"
                value={newPathPart}
                onChange={(e) => setNewPathPart(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Use curly braces for path parameters: {'{id}'}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createResource.isPending}>
              {createResource.isPending ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Resource</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the resource "{resource.path}"? 
              This will also delete all child resources and methods.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function ResourceTree({ apiId, rootResourceId }: ResourceTreeProps) {
  const { data: resources, isLoading, error, refetch } = useApiResources(apiId, true);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500">
        Error loading resources: {error.message}
      </div>
    );
  }

  const rootResource = resources?.find(r => r.id === rootResourceId) || 
                      resources?.find(r => r.path === '/');

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Resources
        </h3>
      </div>
      
      <div className="space-y-1">
        {rootResource ? (
          <ResourceNode
            resource={rootResource}
            allResources={resources || []}
            apiId={apiId}
            level={0}
            onRefresh={() => refetch()}
          />
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No resources found
          </p>
        )}
      </div>
    </Card>
  );
}