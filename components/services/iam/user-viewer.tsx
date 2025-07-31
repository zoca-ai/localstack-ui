"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  User,
  Shield,
  Key,
  Users,
  Clock,
  Copy,
  AlertTriangle,
  Plus,
  RefreshCw,
} from "lucide-react";
import { formatDistanceToNow } from "@/lib/utils";
import { useIAMUser } from "@/hooks/use-iam";
import { toast } from "sonner";
import { AccessKeyManager } from "./access-key-manager";

interface UserViewerProps {
  userName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserViewer({ userName, open, onOpenChange }: UserViewerProps) {
  const [activeTab, setActiveTab] = useState("details");
  const { data: user, isLoading, error, refetch } = useIAMUser(userName, open);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            IAM User: {userName}
          </DialogTitle>
        </DialogHeader>

        {error ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Error loading user: {(error as Error).message}
            </AlertDescription>
          </Alert>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="policies">
                Policies {user && `(${user.attachedPolicies?.length || 0})`}
              </TabsTrigger>
              <TabsTrigger value="groups">
                Groups {user && `(${user.groups?.length || 0})`}
              </TabsTrigger>
              <TabsTrigger value="access-keys">
                Access Keys {user && `(${user.accessKeys?.length || 0})`}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ) : user ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">
                      User Information
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          User Name
                        </span>
                        <code className="text-sm">{user.userName}</code>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          User ID
                        </span>
                        <code className="text-sm">{user.userId}</code>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          ARN
                        </span>
                        <div className="flex items-center gap-2">
                          <code className="text-xs">{user.arn}</code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyToClipboard(user.arn)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Path
                        </span>
                        <code className="text-sm">{user.path}</code>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Created
                        </span>
                        <span className="text-sm">
                          {formatDistanceToNow(new Date(user.createDate))} ago
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Console Access
                        </span>
                        <Badge
                          variant={
                            user.hasConsoleAccess ? "default" : "secondary"
                          }
                        >
                          {user.hasConsoleAccess ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                      {user.passwordLastUsed && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Last Login
                          </span>
                          <span className="text-sm">
                            {formatDistanceToNow(
                              new Date(user.passwordLastUsed),
                            )}{" "}
                            ago
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {user.tags && user.tags.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {user.tags.map((tag: any) => (
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

            <TabsContent value="policies" className="space-y-4">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : user?.attachedPolicies?.length === 0 &&
                user?.inlinePolicies?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No policies attached to this user</p>
                  <Button variant="outline" size="sm" className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Attach Policy
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {user?.attachedPolicies &&
                    user.attachedPolicies.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium mb-2">
                          Attached Managed Policies
                        </h3>
                        <div className="space-y-2">
                          {user.attachedPolicies.map((policy: any) => (
                            <div
                              key={policy.policyArn}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div>
                                <p className="font-medium">
                                  {policy.policyName}
                                </p>
                                <code className="text-xs text-muted-foreground">
                                  {policy.policyArn}
                                </code>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {user?.inlinePolicies && user.inlinePolicies.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium mb-2">
                        Inline Policies
                      </h3>
                      <div className="space-y-2">
                        {user.inlinePolicies.map((policyName: string) => (
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

            <TabsContent value="groups" className="space-y-4">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : user?.groups?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>User is not a member of any groups</p>
                  <Button variant="outline" size="sm" className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add to Group
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {user?.groups?.map((group: any) => (
                    <div
                      key={group.GroupName}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{group.GroupName}</p>
                        <code className="text-xs text-muted-foreground">
                          {group.Arn}
                        </code>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="access-keys">
              <AccessKeyManager userName={userName} />
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
