'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Key,
  Plus,
  Copy,
  Download,
  Trash2,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  Info
} from 'lucide-react';
import { formatDistanceToNow } from '@/lib/utils';
import {
  useAccessKeys,
  useCreateAccessKey,
  useUpdateAccessKey,
  useDeleteAccessKey,
} from '@/hooks/use-iam';
import { toast } from 'sonner';
import { IAMAccessKey } from '@/types';

interface AccessKeyManagerProps {
  userName: string;
}

export function AccessKeyManager({ userName }: AccessKeyManagerProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newAccessKey, setNewAccessKey] = useState<IAMAccessKey | null>(null);
  const [keyToDelete, setKeyToDelete] = useState<string | null>(null);

  const { data: accessKeys, isLoading } = useAccessKeys(userName, true);
  const createMutation = useCreateAccessKey();
  const updateMutation = useUpdateAccessKey();
  const deleteMutation = useDeleteAccessKey();

  const handleCreateAccessKey = async () => {
    try {
      const result = await createMutation.mutateAsync(userName);
      setNewAccessKey(result);
      setShowCreateDialog(true);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleToggleStatus = async (accessKeyId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    await updateMutation.mutateAsync({
      userName,
      accessKeyId,
      status: newStatus,
    });
  };

  const handleDeleteAccessKey = async (accessKeyId: string) => {
    await deleteMutation.mutateAsync({
      userName,
      accessKeyId,
    });
    setKeyToDelete(null);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const downloadCredentials = () => {
    if (!newAccessKey) return;

    const credentials = `[default]
aws_access_key_id = ${newAccessKey.accessKeyId}
aws_secret_access_key = ${newAccessKey.secretAccessKey}`;

    const blob = new Blob([credentials], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${userName}-credentials.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Access Keys</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Access keys allow programmatic access to AWS services
          </p>
        </div>
        <Button
          onClick={handleCreateAccessKey}
          disabled={createMutation.isPending || (accessKeys?.length || 0) >= 2}
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Access Key
        </Button>
      </div>

      {accessKeys?.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Key className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No access keys created for this user</p>
        </div>
      ) : (
        <div className="space-y-2">
          {accessKeys?.map((key) => (
            <div
              key={key.accessKeyId}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-muted-foreground" />
                  <code className="text-sm font-medium">{key.accessKeyId}</code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => copyToClipboard(key.accessKeyId, 'Access Key ID')}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Created {formatDistanceToNow(new Date(key.createDate))} ago</span>
                  <Badge variant={key.status === 'Active' ? 'default' : 'secondary'}>
                    {key.status}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleToggleStatus(key.accessKeyId, key.status)}
                  disabled={updateMutation.isPending}
                >
                  {key.status === 'Active' ? (
                    <ToggleRight className="h-4 w-4" />
                  ) : (
                    <ToggleLeft className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setKeyToDelete(key.accessKeyId)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {accessKeys && accessKeys.length >= 2 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            IAM users can have a maximum of 2 access keys. Delete an existing key to create a new one.
          </AlertDescription>
        </Alert>
      )}

      {/* New Access Key Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Access Key Created Successfully</DialogTitle>
            <DialogDescription>
              This is the only time you can view or download the secret access key.
              Save it securely now.
            </DialogDescription>
          </DialogHeader>
          {newAccessKey && (
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Make sure to copy or download your secret access key now.
                  You won't be able to see it again!
                </AlertDescription>
              </Alert>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Access Key ID</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 p-2 bg-muted rounded text-sm">
                      {newAccessKey.accessKeyId}
                    </code>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(newAccessKey.accessKeyId, 'Access Key ID')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Secret Access Key</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 p-2 bg-muted rounded text-sm font-mono">
                      {newAccessKey.secretAccessKey}
                    </code>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(newAccessKey.secretAccessKey!, 'Secret Access Key')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={downloadCredentials}>
                  <Download className="h-4 w-4 mr-2" />
                  Download .csv
                </Button>
                <Button
                  onClick={() => {
                    setShowCreateDialog(false);
                    setNewAccessKey(null);
                  }}
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!keyToDelete} onOpenChange={() => setKeyToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Access Key</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this access key? This action cannot be undone.
              Any applications using this key will lose access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => keyToDelete && handleDeleteAccessKey(keyToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}