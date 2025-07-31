"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BusList } from "@/components/services/eventbridge/bus-list";
import { ServicePageLayout } from "@/components/layout/service-page-layout";
import { Calendar, FileCode, Target, Info } from "lucide-react";
import { useEventBuses, useEventRules } from "@/hooks/use-eventbridge";

export default function EventBridgePage() {
  const { data: buses } = useEventBuses();
  const { data: rules } = useEventRules();

  const totalBuses = buses?.length || 0;
  const totalRules = rules?.length || 0;
  const activeRules = rules?.filter((r) => r.state === "ENABLED").length || 0;

  return (
    <ServicePageLayout
      title="EventBridge"
      description="Serverless event bus service"
      icon={Calendar}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Event Buses</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBuses}</div>
            <p className="text-xs text-muted-foreground">
              Including default bus
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rules</CardTitle>
            <FileCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRules}</div>
            <p className="text-xs text-muted-foreground">Across all buses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRules}</div>
            <p className="text-xs text-muted-foreground">Processing events</p>
          </CardContent>
        </Card>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          EventBridge allows you to build event-driven applications using events
          from your applications, integrated SaaS applications, and AWS
          services. Create rules to match events and route them to targets.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Event Buses</CardTitle>
          <CardDescription>
            Manage your EventBridge event buses and their rules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BusList />
        </CardContent>
      </Card>
    </ServicePageLayout>
  );
}
