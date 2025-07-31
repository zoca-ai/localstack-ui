"use client";

import { useEventRule, useEventTargets } from "@/hooks/use-eventbridge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileCode, Clock, Target, Calendar } from "lucide-react";
import { TargetList } from "./target-list";

interface RuleViewerProps {
  ruleName: string;
  eventBusName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RuleViewer({
  ruleName,
  eventBusName = "default",
  open,
  onOpenChange,
}: RuleViewerProps) {
  const { data: rule, isLoading: ruleLoading } = useEventRule(
    ruleName,
    eventBusName,
    open,
  );
  const { data: targets, isLoading: targetsLoading } = useEventTargets(
    ruleName,
    eventBusName,
  );

  if (ruleLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Loading...</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {rule?.eventPattern ? (
              <FileCode className="h-5 w-5" />
            ) : (
              <Clock className="h-5 w-5" />
            )}
            Rule: {ruleName}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="targets" className="mt-4">
          <TabsList>
            <TabsTrigger value="targets">Targets</TabsTrigger>
            <TabsTrigger value="pattern">Pattern</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="targets" className="space-y-4">
            <TargetList ruleName={ruleName} eventBusName={eventBusName} />
          </TabsContent>

          <TabsContent value="pattern" className="space-y-4">
            {rule?.eventPattern && (
              <Card className="p-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <FileCode className="h-4 w-4" />
                  Event Pattern
                </h3>
                <pre className="text-sm bg-muted p-3 rounded-md overflow-auto">
                  {JSON.stringify(JSON.parse(rule.eventPattern), null, 2)}
                </pre>
              </Card>
            )}

            {rule?.scheduleExpression && (
              <Card className="p-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Schedule Expression
                </h3>
                <p className="text-sm font-mono bg-muted p-3 rounded-md">
                  {rule.scheduleExpression}
                </p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <Card className="p-4">
              <h3 className="text-sm font-semibold mb-3">Rule Information</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Name</span>
                  <span className="text-sm font-medium">{rule?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">State</span>
                  <Badge
                    variant={
                      rule?.state === "ENABLED" ? "default" : "secondary"
                    }
                  >
                    {rule?.state}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Event Bus
                  </span>
                  <span className="text-sm font-medium">
                    {rule?.eventBusName || eventBusName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Targets</span>
                  <span className="text-sm font-medium">
                    {targets?.length || 0}
                  </span>
                </div>
                {rule?.description && (
                  <div className="pt-2">
                    <span className="text-sm text-muted-foreground">
                      Description
                    </span>
                    <p className="text-sm mt-1">{rule.description}</p>
                  </div>
                )}
              </div>
            </Card>

            {rule?.arn && (
              <Card className="p-4">
                <h3 className="text-sm font-semibold mb-3">ARN</h3>
                <p className="text-xs font-mono break-all bg-muted p-2 rounded">
                  {rule.arn}
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
