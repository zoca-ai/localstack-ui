'use client';

import { useState, useEffect } from 'react';
import { useSecret } from '@/hooks/use-secrets-manager';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Secret } from '@/types';
import { Eye, EyeOff, Copy, Check, AlertCircle, Key, Calendar, Clock, Tag } from 'lucide-react';
import { formatDistanceToNow } from '@/lib/utils';

interface SecretViewerProps {
  secret: Secret | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
}

export function SecretViewer({ secret, open, onOpenChange, onEdit }: SecretViewerProps) {
  const [copied, setCopied] = useState(false);
  const { data: secretData, isLoading, error } = useSecret(
    secret?.name || null,
    true // Always fetch value when viewing
  );

  // Reset copied state when secret changes
  useEffect(() => {
    setCopied(false);
  }, [secret]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatSecretValue = (value: string) => {
    try {
      const parsed = JSON.parse(value);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return value;
    }
  };

  const isJSON = (value: string) => {
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  };

  if (!secret) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Key className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl">{secret.name}</DialogTitle>
              <DialogDescription className="mt-1">
                {secret.description || 'No description provided'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Metadata</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 rounded-lg border p-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="text-sm font-medium">
                  {secret.createdDate
                    ? formatDistanceToNow(new Date(secret.createdDate)) + ' ago'
                    : 'Unknown'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Last Modified</p>
                <p className="text-sm font-medium">
                  {secret.lastChangedDate
                    ? formatDistanceToNow(new Date(secret.lastChangedDate)) + ' ago'
                    : 'Never'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Last Accessed</p>
                <p className="text-sm font-medium">
                  {secret.lastAccessedDate
                    ? formatDistanceToNow(new Date(secret.lastAccessedDate)) + ' ago'
                    : 'Never'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Version</p>
                <p className="text-sm font-medium">
                  {secret.versionId || 'Current'}
                </p>
              </div>
            </div>
          </div>

          {/* Tags */}
          {secret.tags && Object.keys(secret.tags).length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Tags</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(secret.tags).map(([key, value]) => (
                  <Badge key={key} variant="secondary" className="font-normal">
                    <span className="font-medium">{key}:</span> {value}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Secret Value */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Secret Value</h3>
              </div>
              <Button 
                variant="default" 
                size="sm" 
                onClick={onEdit}
                className="gap-2"
              >
                <Eye className="h-4 w-4" />
                Update Value
              </Button>
            </div>

            {/* Always show value section */}
            <>
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ) : error ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to load secret value: {(error as Error).message}
                  </AlertDescription>
                </Alert>
              ) : secretData?.value?.secretString ? (
                <div className="space-y-3">
                  {isJSON(secretData.value.secretString) ? (
                    <Tabs defaultValue="formatted" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="formatted">Formatted JSON</TabsTrigger>
                        <TabsTrigger value="raw">Raw</TabsTrigger>
                      </TabsList>
                      <TabsContent value="formatted" className="mt-3">
                        <div className="relative">
                          <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-[400px] text-sm font-mono whitespace-pre-wrap break-words">
                            <code>{formatSecretValue(secretData.value.secretString)}</code>
                          </pre>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() =>
                              copyToClipboard(secretData.value.secretString!)
                            }
                          >
                            {copied ? (
                              <>
                                <Check className="mr-2 h-3 w-3" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="mr-2 h-3 w-3" />
                                Copy
                              </>
                            )}
                          </Button>
                        </div>
                      </TabsContent>
                      <TabsContent value="raw" className="mt-3">
                        <div className="relative">
                          <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-[400px] text-sm font-mono whitespace-pre-wrap break-words">
                            <code>{secretData.value.secretString}</code>
                          </pre>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() =>
                              copyToClipboard(secretData.value.secretString!)
                            }
                          >
                            {copied ? (
                              <>
                                <Check className="mr-2 h-3 w-3" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="mr-2 h-3 w-3" />
                                Copy
                              </>
                            )}
                          </Button>
                        </div>
                      </TabsContent>
                    </Tabs>
                  ) : (
                    <div className="relative">
                      <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-[400px] text-sm font-mono whitespace-pre-wrap break-words">
                        <code>{secretData.value.secretString}</code>
                      </pre>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() =>
                          copyToClipboard(secretData.value.secretString!)
                        }
                      >
                        {copied ? (
                          <>
                            <Check className="mr-2 h-3 w-3" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="mr-2 h-3 w-3" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                  {secretData.value.versionId && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Version ID: {secretData.value.versionId}</span>
                    </div>
                  )}
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No secret value available
                  </AlertDescription>
                </Alert>
              )}
            </>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}