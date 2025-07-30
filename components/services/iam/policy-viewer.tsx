'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  FileText,
  Clock,
  Copy,
  AlertTriangle,
  RefreshCw,
  Edit,
  History,
  Link
} from 'lucide-react';
import { formatDistanceToNow } from '@/lib/utils';
import { useIAMPolicy, useUpdateIAMPolicy } from '@/hooks/use-iam';
import { toast } from 'sonner';
import { PolicyEditor } from './policy-editor';

interface PolicyViewerProps {
  policyArn: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PolicyViewer({ policyArn, open, onOpenChange }: PolicyViewerProps) {
  const [activeTab, setActiveTab] = useState('details');
  const [editingPolicy, setEditingPolicy] = useState(false);
  const [newPolicyDocument, setNewPolicyDocument] = useState('');
  const { data: policy, isLoading, error, refetch } = useIAMPolicy(policyArn, open);
  const updateMutation = useUpdateIAMPolicy();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const formatJson = (jsonString: string) => {
    try {
      return JSON.stringify(JSON.parse(jsonString), null, 2);
    } catch {
      return jsonString;
    }
  };

  const isAWSManaged = policy?.arn?.includes(':aws:policy/');

  const handleUpdatePolicy = async () => {
    try {
      await updateMutation.mutateAsync({
        policyArn,
        policyDocument: newPolicyDocument,
      });
      setEditingPolicy(false);
      refetch();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            IAM Policy: {policy?.policyName || 'Loading...'}
          </DialogTitle>
        </DialogHeader>

        {error ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Error loading policy: {(error as Error).message}
            </AlertDescription>
          </Alert>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="document">Policy Document</TabsTrigger>
              <TabsTrigger value="versions">
                Versions {policy && `(${policy.versions?.length || 1})`}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ) : policy ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Policy Information</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Policy Name</span>
                        <code className="text-sm">{policy.policyName}</code>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Policy ID</span>
                        <code className="text-sm">{policy.policyId}</code>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">ARN</span>
                        <div className="flex items-center gap-2">
                          <code className="text-xs">{policy.arn}</code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyToClipboard(policy.arn)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Type</span>
                        <Badge variant={isAWSManaged ? 'secondary' : 'default'}>
                          {isAWSManaged ? 'AWS Managed' : 'Customer Managed'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Path</span>
                        <code className="text-sm">{policy.path}</code>
                      </div>
                      {policy.description && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Description</span>
                          <span className="text-sm">{policy.description}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Attached To</span>
                        <Badge variant="outline" className="gap-1">
                          <Link className="h-3 w-3" />
                          {policy.attachmentCount || 0} entities
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Created</span>
                        <span className="text-sm">
                          {formatDistanceToNow(new Date(policy.createDate))} ago
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Last Updated</span>
                        <span className="text-sm">
                          {formatDistanceToNow(new Date(policy.updateDate))} ago
                        </span>
                      </div>
                    </div>
                  </div>

                  {policy.tags && policy.tags.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {policy.tags.map((tag: any) => (
                          <Badge key={tag.key} variant="secondary">
                            {tag.key}: {tag.value}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </TabsContent>

            <TabsContent value="document" className="space-y-4">
              {isLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : policy ? (
                <div className="space-y-4">
                  {!isAWSManaged && (
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">Policy Document</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (editingPolicy) {
                            setEditingPolicy(false);
                            setNewPolicyDocument('');
                          } else {
                            setEditingPolicy(true);
                            setNewPolicyDocument(formatJson(policy.policyDocument || ''));
                          }
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        {editingPolicy ? 'Cancel' : 'Edit'}
                      </Button>
                    </div>
                  )}
                  {editingPolicy ? (
                    <PolicyEditor
                      initialValue={newPolicyDocument}
                      onSave={handleUpdatePolicy}
                      onCancel={() => {
                        setEditingPolicy(false);
                        setNewPolicyDocument('');
                      }}
                    />
                  ) : (
                    <PolicyEditor
                      initialValue={formatJson(policy.policyDocument || '')}
                      onSave={() => {}}
                      readOnly
                    />
                  )}
                </div>
              ) : null}
            </TabsContent>

            <TabsContent value="versions" className="space-y-4">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : policy?.versions?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No version history available</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium mb-2">Version History</h3>
                  {policy?.versions?.map((version: any) => (
                    <div
                      key={version.versionId}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">Version {version.versionId}</p>
                          {version.isDefaultVersion && (
                            <Badge variant="default" className="text-xs">Default</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Created {formatDistanceToNow(new Date(version.createDate))} ago
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}