"use client";

import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  RefreshCw,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { ServicePageLayout } from "@/components/layout/service-page-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useCloudWatchAlarms,
  useCloudWatchMetrics,
} from "@/hooks/use-cloudwatch";
import { AlarmsList } from "@/components/services/cloudwatch/alarms-list";
import { AlarmForm } from "@/components/services/cloudwatch/alarm-form";
import { AlarmViewer } from "@/components/services/cloudwatch/alarm-viewer";
import { MetricsList } from "@/components/services/cloudwatch/metrics-list";
import type {
  CloudWatchAlarm,
  CloudWatchMetric,
} from "@/types";

export default function CloudWatchPage() {
  const [activeTab, setActiveTab] = useState("metrics");
  const queryClient = useQueryClient();
  const [showCreateAlarm, setShowCreateAlarm] = useState(false);
  const [selectedAlarm, setSelectedAlarm] = useState<CloudWatchAlarm | null>(
    null,
  );
  const [selectedMetric, setSelectedMetric] = useState<CloudWatchMetric | null>(
    null,
  );

  const { data: alarms, isLoading: isLoadingAlarms } = useCloudWatchAlarms();
  const { data: metrics, isLoading: isLoadingMetrics } = useCloudWatchMetrics();

  const alarmsInAlarmState =
    alarms?.filter((a) => a.stateValue === "ALARM").length || 0;
  const totalMetrics = metrics?.length || 0;
  const totalAlarms = alarms?.length || 0;

  const handleRefresh = () => {
    queryClient.invalidateQueries({
      queryKey: ["cloudwatch-metrics"],
    });
    queryClient.invalidateQueries({
      queryKey: ["cloudwatch-alarms"],
    });
  };

  return (
    <ServicePageLayout
      title="CloudWatch"
      description="Monitor metrics and alarms from your LocalStack services"
      icon={Activity}
      secondaryAction={{
        label: "Refresh",
        icon: RefreshCw,
        onClick: handleRefresh,
      }}
      stats={[
        {
          title: "Metrics",
          value: totalMetrics,
          description: "Custom metrics",
          icon: BarChart3,
          loading: isLoadingMetrics,
        },
        {
          title: "Alarms",
          value: totalAlarms,
          description: "Total alarms configured",
          icon: Activity,
          loading: isLoadingAlarms,
        },
        {
          title: "Active Alarms",
          value: alarmsInAlarmState,
          description: "Alarms in ALARM state",
          icon: AlertTriangle,
          loading: isLoadingAlarms,
        },
        {
          title: "Namespaces",
          value: "-",
          description: "Metric namespaces",
          icon: BarChart3,
          loading: false,
        },
      ]}
      alert={{
        icon: Info,
        description:
          "CloudWatch in LocalStack provides monitoring capabilities for your local AWS services. Track metrics and configure alarms to monitor your applications.",
      }}
    >
      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start rounded-none border-b h-auto p-0">
              <TabsTrigger
                value="metrics"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-6"
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Metrics
              </TabsTrigger>
              <TabsTrigger
                value="alarms"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-6"
              >
                <Activity className="mr-2 h-4 w-4" />
                Alarms
                {alarmsInAlarmState > 0 && (
                  <span className="ml-2 rounded-full bg-destructive px-2 py-0.5 text-xs text-destructive-foreground">
                    {alarmsInAlarmState}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="metrics" className="mt-0 space-y-4">
                <div>
                  <h2 className="text-lg font-semibold mb-2">Metrics</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    View custom metrics published to CloudWatch
                  </p>
                  <MetricsList onSelectMetric={setSelectedMetric} />
                </div>
              </TabsContent>

              <TabsContent value="alarms" className="mt-0 space-y-4">
                <div>
                  <h2 className="text-lg font-semibold mb-2">Alarms</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Configure and monitor CloudWatch alarms
                  </p>
                  <AlarmsList
                    onSelectAlarm={setSelectedAlarm}
                    onCreateAlarm={() => setShowCreateAlarm(true)}
                  />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Create Alarm Dialog */}
      <Dialog open={showCreateAlarm} onOpenChange={setShowCreateAlarm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Alarm</DialogTitle>
            <DialogDescription>
              Create a new CloudWatch alarm to monitor metrics and send
              notifications
            </DialogDescription>
          </DialogHeader>
          <AlarmForm
            onSuccess={() => setShowCreateAlarm(false)}
            onCancel={() => setShowCreateAlarm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Alarm Viewer */}
      {selectedAlarm && selectedAlarm.alarmName && (
        <AlarmViewer
          alarmName={selectedAlarm.alarmName}
          open={!!selectedAlarm}
          onOpenChange={(open) => !open && setSelectedAlarm(null)}
        />
      )}

      {/* Metric Viewer Dialog */}
      <Dialog
        open={!!selectedMetric}
        onOpenChange={(open) => !open && setSelectedMetric(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Metric Details</DialogTitle>
            <DialogDescription>
              View metric information and statistics
            </DialogDescription>
          </DialogHeader>
          {selectedMetric && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Metric Name
                  </p>
                  <p className="text-sm">{selectedMetric.metricName}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Namespace
                  </p>
                  <p className="text-sm">{selectedMetric.namespace}</p>
                </div>
              </div>
              {selectedMetric.dimensions &&
                selectedMetric.dimensions.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Dimensions
                    </p>
                    <div className="space-y-1">
                      {selectedMetric.dimensions.map((dim, idx) => (
                        <p key={idx} className="text-sm">
                          <span className="font-medium">{dim.name}:</span>{" "}
                          {dim.value}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              <Alert>
                <AlertDescription>
                  To view metric statistics and create graphs, use the AWS CLI
                  or SDK to query metric data with specific time ranges and
                  statistics.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </ServicePageLayout>
  );
}