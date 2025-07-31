"use client";

import { useState } from "react";
import { useLambdaFunction } from "@/hooks/use-lambda";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LambdaFunction } from "@/types";
import {
  Zap,
  Code2,
  Settings,
  Shield,
  Globe,
  Layers,
  Tag,
  AlertCircle,
  Timer,
  MemoryStick,
  Hash,
  Calendar,
  FileCode,
} from "lucide-react";
import { formatDistanceToNow, formatBytes } from "@/lib/utils";

interface FunctionViewerProps {
  func: LambdaFunction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FunctionViewer({
  func,
  open,
  onOpenChange,
}: FunctionViewerProps) {
  const {
    data: functionDetails,
    isLoading,
    error,
  } = useLambdaFunction(open && func ? func.functionName : null);

  if (!func) return null;

  const details = functionDetails || func;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl">
                {details.functionName}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {details.description || "Lambda function details"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="configuration" className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
            <TabsTrigger value="environment">Environment</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="configuration" className="mt-4 space-y-6">
            {/* Basic Configuration */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Basic Configuration</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 rounded-lg border p-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Runtime</p>
                  <Badge variant="outline" className="font-mono">
                    {details.runtime || "Not specified"}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Handler</p>
                  <p className="text-sm font-medium font-mono">
                    {details.handler || "index.handler"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Memory</p>
                  <div className="flex items-center gap-1">
                    <MemoryStick className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {details.memorySize || 128} MB
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Timeout</p>
                  <div className="flex items-center gap-1">
                    <Timer className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {details.timeout || 3} seconds
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Code Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Code Information</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 rounded-lg border p-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Code Size</p>
                  <p className="text-sm font-medium">
                    {formatBytes(details.codeSize || 0)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Last Modified</p>
                  <p className="text-sm font-medium">
                    {details.lastModified
                      ? formatDistanceToNow(new Date(details.lastModified)) +
                        " ago"
                      : "Unknown"}
                  </p>
                </div>
                <div className="col-span-2 space-y-1">
                  <p className="text-xs text-muted-foreground">Code SHA256</p>
                  <p className="text-xs font-mono text-muted-foreground break-all">
                    {details.codeSha256 || "Not available"}
                  </p>
                </div>
              </div>
            </div>

            {/* Execution Role */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Execution Role</h3>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm font-mono break-all">
                  {details.role || "No role specified"}
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="environment" className="mt-4 space-y-6">
            {/* Environment Variables */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Environment Variables</h3>
              </div>
              {details.environment?.variables &&
              Object.keys(details.environment.variables).length > 0 ? (
                <ScrollArea className="h-[300px] rounded-lg border p-4">
                  <div className="space-y-2">
                    {Object.entries(details.environment.variables).map(
                      ([key, value]) => (
                        <div key={key} className="flex flex-col space-y-1">
                          <p className="text-sm font-medium font-mono">{key}</p>
                          <p className="text-sm text-muted-foreground font-mono break-all">
                            {value}
                          </p>
                          {key !==
                            Object.keys(details.environment?.variables || {})[
                              Object.keys(details.environment?.variables || {})
                                .length - 1
                            ] && <Separator className="mt-2" />}
                        </div>
                      ),
                    )}
                  </div>
                </ScrollArea>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No environment variables configured
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="mt-4 space-y-6">
            {/* VPC Configuration */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">VPC Configuration</h3>
              </div>
              {details.vpcConfig?.vpcId ? (
                <div className="rounded-lg border p-4 space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">VPC ID</p>
                    <p className="text-sm font-mono">
                      {details.vpcConfig.vpcId}
                    </p>
                  </div>
                  {details.vpcConfig.subnetIds &&
                    details.vpcConfig.subnetIds.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Subnets
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {details.vpcConfig.subnetIds.map((subnet) => (
                            <Badge
                              key={subnet}
                              variant="secondary"
                              className="font-mono text-xs"
                            >
                              {subnet}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  {details.vpcConfig.securityGroupIds &&
                    details.vpcConfig.securityGroupIds.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Security Groups
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {details.vpcConfig.securityGroupIds.map((sg) => (
                            <Badge
                              key={sg}
                              variant="secondary"
                              className="font-mono text-xs"
                            >
                              {sg}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>No VPC configuration</AlertDescription>
                </Alert>
              )}
            </div>

            {/* Layers */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Layers</h3>
              </div>
              {details.layers && details.layers.length > 0 ? (
                <div className="space-y-2">
                  {details.layers.map((layer, index) => (
                    <div key={index} className="rounded-lg border p-3">
                      <p className="text-sm font-mono break-all">{layer.arn}</p>
                      {layer.codeSize && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Size: {formatBytes(layer.codeSize)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No layers attached to this function
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Tags */}
            {details.tags && Object.keys(details.tags).length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold">Tags</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(details.tags).map(([key, value]) => (
                    <Badge
                      key={key}
                      variant="secondary"
                      className="font-normal"
                    >
                      <span className="font-medium">{key}:</span> {value}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileCode className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Additional Details</h3>
              </div>
              <div className="rounded-lg border p-4 space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">Function ARN</p>
                  <p className="text-sm font-mono break-all">
                    {details.functionArn || "Not available"}
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground">Version</p>
                  <p className="text-sm font-mono">
                    {details.version || "$LATEST"}
                  </p>
                </div>
                {details.state && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs text-muted-foreground">State</p>
                      <Badge
                        variant={
                          details.state === "Active" ? "default" : "secondary"
                        }
                      >
                        {details.state}
                      </Badge>
                      {details.stateReason && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {details.stateReason}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
