"use client";

import { useState } from "react";
import { useEventRules } from "@/hooks/use-eventbridge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { RuleList } from "./rule-list";
import { Calendar, Shield, Clock } from "lucide-react";

interface BusViewerProps {
  busName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BusViewer({ busName, open, onOpenChange }: BusViewerProps) {
  const { data: rules, isLoading } = useEventRules(busName);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Event Bus: {busName}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="rules" className="mt-4">
          <TabsList>
            <TabsTrigger value="rules">Rules</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="rules" className="space-y-4">
            <RuleList eventBusName={busName} />
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <Card className="p-4">
              <h3 className="text-sm font-semibold mb-3">Bus Information</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Name</span>
                  <span className="text-sm font-medium">{busName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Type</span>
                  <Badge
                    variant={busName === "default" ? "default" : "secondary"}
                  >
                    {busName === "default" ? "Default" : "Custom"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Rules</span>
                  <span className="text-sm font-medium">
                    {rules?.length || 0}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="text-sm font-semibold mb-3">Features</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Encryption at rest available with KMS
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Event archive and replay supported
                  </span>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
