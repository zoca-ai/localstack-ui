"use client";

import { useState } from "react";
import { Activity, AlertTriangle, FileText, BarChart3 } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCloudWatchLogGroups,
  useCloudWatchAlarms,
  useCloudWatchMetrics,
} from "@/hooks/use-cloudwatch";
import { LogGroupsList } from "@/components/services/cloudwatch/log-groups-list";
import { LogGroupForm } from "@/components/services/cloudwatch/log-group-form";
import { LogGroupViewer } from "@/components/services/cloudwatch/log-group-viewer";
import { AlarmsList } from "@/components/services/cloudwatch/alarms-list";
import { AlarmForm } from "@/components/services/cloudwatch/alarm-form";
import { AlarmViewer } from "@/components/services/cloudwatch/alarm-viewer";
import { MetricsList } from "@/components/services/cloudwatch/metrics-list";
import type {
  CloudWatchLogGroup,
  CloudWatchAlarm,
  CloudWatchMetric,
} from "@/types";

export default function CloudWatchPage() {
  const [activeTab, setActiveTab] = useState("logs");
  const [showCreateLogGroup, setShowCreateLogGroup] = useState(false);
  const [showCreateAlarm, setShowCreateAlarm] = useState(false);
  const [selectedLogGroup, setSelectedLogGroup] =
    useState<CloudWatchLogGroup | null>(null);
  const [selectedAlarm, setSelectedAlarm] = useState<CloudWatchAlarm | null>(
    null,
  );
  const [selectedMetric, setSelectedMetric] = useState<CloudWatchMetric | null>(
    null,
  );

  const { data: logGroups, isLoading: isLoadingLogGroups } =
    useCloudWatchLogGroups();
  const { data: alarms, isLoading: isLoadingAlarms } = useCloudWatchAlarms();
  const { data: metrics, isLoading: isLoadingMetrics } = useCloudWatchMetrics();

  const alarmsInAlarmState =
    alarms?.filter((a) => a.stateValue === "ALARM").length || 0;
  const totalLogGroups = logGroups?.length || 0;
  const totalMetrics = metrics?.length || 0;
  const totalAlarms = alarms?.length || 0;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">CloudWatch</h1>
          <p className="text-muted-foreground">
            Monitor logs, metrics, and alarms from your LocalStack services
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Log Groups</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingLogGroups ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{totalLogGroups}</div>
              )}
              <p className="text-xs text-muted-foreground">Total log groups</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Metrics</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingMetrics ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{totalMetrics}</div>
              )}
              <p className="text-xs text-muted-foreground">Custom metrics</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alarms</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingAlarms ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{totalAlarms}</div>
              )}
              <p className="text-xs text-muted-foreground">
                Total alarms configured
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Alarms
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              {isLoadingAlarms ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold text-destructive">
                  {alarmsInAlarmState}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Alarms in ALARM state
              </p>
            </CardContent>
          </Card>
        </div>

        <Alert>
          <Activity className="h-4 w-4" />
          <AlertDescription>
            CloudWatch in LocalStack provides monitoring capabilities for your
            local AWS services. You can view logs, track metrics, and configure
            alarms just like in AWS.
          </AlertDescription>
        </Alert>

        <Card>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full justify-start rounded-none border-b h-auto p-0">
                <TabsTrigger
                  value="logs"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-6"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Logs
                </TabsTrigger>
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
                <TabsContent value="logs" className="mt-0 space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Log Groups</h2>
                    <p className="text-sm text-muted-foreground mb-4">
                      Manage and view log groups and their streams
                    </p>
                    <LogGroupsList
                      onSelectLogGroup={setSelectedLogGroup}
                      onCreateLogGroup={() => setShowCreateLogGroup(true)}
                    />
                  </div>
                </TabsContent>

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
      </div>

      {/* Create Log Group Dialog */}
      <Dialog open={showCreateLogGroup} onOpenChange={setShowCreateLogGroup}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Log Group</DialogTitle>
            <DialogDescription>
              Create a new CloudWatch log group to collect and store log events
            </DialogDescription>
          </DialogHeader>
          <LogGroupForm
            onSuccess={() => setShowCreateLogGroup(false)}
            onCancel={() => setShowCreateLogGroup(false)}
          />
        </DialogContent>
      </Dialog>

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

      {/* Log Group Viewer */}
      {selectedLogGroup && (
        <LogGroupViewer
          logGroupName={selectedLogGroup.logGroupName}
          open={!!selectedLogGroup}
          onOpenChange={(open) => !open && setSelectedLogGroup(null)}
        />
      )}

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
    </MainLayout>
  );
}

