'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ShieldCheck,
  Shield,
  Clock,
  Copy,
  AlertTriangle,
  RefreshCw,
  Edit
} from 'lucide-react';
import { formatDistanceToNow } from '@/lib/utils';
import { useIAMRole } from '@/hooks/use-iam';
import { toast } from 'sonner';
import { PolicyEditor } from './policy-editor';

interface RoleViewerProps {
  roleName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RoleViewer({ roleName, open, onOpenChange }: RoleViewerProps) {
  const [activeTab, setActiveTab] = useState('details');
  const [editingTrustPolicy, setEditingTrustPolicy] = useState(false);
  const { data: role, isLoading, error, refetch } = useIAMRole(roleName, open);

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

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            IAM Role: {roleName}
          </DialogTitle>
        </DialogHeader>

        {error ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Error loading role: {(error as Error).message}
            </AlertDescription>
          </Alert>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="trust-policy">Trust Policy</TabsTrigger>
              <TabsTrigger value="policies">
                Policies {role && `(${role.attachedPolicies?.length || 0})`}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ) : role ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Role Information</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Role Name</span>
                        <code className="text-sm">{role.roleName}</code>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Role ID</span>
                        <code className="text-sm">{role.roleId}</code>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">ARN</span>
                        <div className="flex items-center gap-2">
                          <code className="text-xs">{role.arn}</code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyToClipboard(role.arn)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Path</span>
                        <code className="text-sm">{role.path}</code>
                      </div>
                      {role.description && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Description</span>
                          <span className="text-sm">{role.description}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Max Session Duration</span>
                        <span className="text-sm">
                          {role.maxSessionDuration 
                            ? `${role.maxSessionDuration / 3600} hours`
                            : '1 hour'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Created</span>
                        <span className="text-sm">
                          {formatDistanceToNow(new Date(role.createDate))} ago
                        </span>
                      </div>
                    </div>
                  </div>

                  {role.tags && role.tags.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {role.tags.map((tag: any) => (
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

            <TabsContent value="trust-policy" className="space-y-4">
              {isLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : role ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Assume Role Policy Document</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingTrustPolicy(!editingTrustPolicy)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {editingTrustPolicy ? 'Cancel' : 'Edit'}
                    </Button>
                  </div>
                  {editingTrustPolicy ? (
                    <PolicyEditor
                      initialValue={formatJson(role.assumeRolePolicyDocument)}
                      onSave={(newPolicy) => {
                        // TODO: Implement update trust policy
                        setEditingTrustPolicy(false);
                        toast.success('Trust policy updated');
                      }}
                      onCancel={() => setEditingTrustPolicy(false)}
                    />
                  ) : (
                    <div className="relative">
                      <pre className="p-4 bg-muted rounded-lg overflow-auto text-xs">
                        <code>{formatJson(role.assumeRolePolicyDocument)}</code>
                      </pre>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(role.assumeRolePolicyDocument)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ) : null}
            </TabsContent>

            <TabsContent value="policies" className="space-y-4">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : role?.attachedPolicies?.length === 0 && role?.inlinePolicies?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No policies attached to this role</p>
                  <Button variant="outline" size="sm" className="mt-4">
                    Attach Policy
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {role?.attachedPolicies && role.attachedPolicies.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium mb-2">Attached Managed Policies</h3>
                      <div className="space-y-2">
                        {role.attachedPolicies.map((policy: any) => (
                          <div
                            key={policy.policyArn}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div>
                              <p className="font-medium">{policy.policyName}</p>
                              <code className="text-xs text-muted-foreground">{policy.policyArn}</code>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {role?.inlinePolicies && role.inlinePolicies.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium mb-2">Inline Policies</h3>
                      <div className="space-y-2">
                        {role.inlinePolicies.map((policyName: string) => (
                          <div
                            key={policyName}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <p className="font-medium">{policyName}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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