"use client";

import { useState } from "react";
import {
  FileText,
  Plus,
  RefreshCw,
  Info,
  FolderOpen,
  Archive,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { ServicePageLayout } from "@/components/layout/service-page-layout";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useCloudWatchLogGroups,
  useCloudWatchLogStreams,
} from "@/hooks/use-cloudwatch";
import { LogGroupsList } from "@/components/services/cloudwatch/log-groups-list";
import { LogGroupForm } from "@/components/services/cloudwatch/log-group-form";
import { LogGroupViewer } from "@/components/services/cloudwatch/log-group-viewer";
import type { CloudWatchLogGroup } from "@/types";

export default function CloudWatchLogsPage() {
  const queryClient = useQueryClient();
  const [showCreateLogGroup, setShowCreateLogGroup] = useState(false);
  const [selectedLogGroup, setSelectedLogGroup] =
    useState<CloudWatchLogGroup | null>(null);

  const { data: logGroups, isLoading: isLoadingLogGroups } =
    useCloudWatchLogGroups();

  const totalLogGroups = logGroups?.length || 0;
  const totalLogStreams = logGroups?.reduce((total, group) => {
    return total + (group.storedBytes ? 1 : 0);
  }, 0) || 0;
  const totalStorageSize = logGroups?.reduce((total, group) => {
    return total + (group.storedBytes || 0);
  }, 0) || 0;

  const handleRefresh = () => {
    queryClient.invalidateQueries({
      queryKey: ["cloudwatch-log-groups"],
    });
    queryClient.invalidateQueries({
      queryKey: ["cloudwatch-log-streams"],
    });
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <ServicePageLayout
      title="CloudWatch Logs"
      description="Collect, monitor, and analyze log data from your AWS resources"
      icon={FileText}
      primaryAction={{
        label: "Create Log Group",
        icon: Plus,
        onClick: () => setShowCreateLogGroup(true),
      }}
      secondaryAction={{
        label: "Refresh",
        icon: RefreshCw,
        onClick: handleRefresh,
      }}
      stats={[
        {
          title: "Log Groups",
          value: totalLogGroups,
          description: "Total log groups",
          icon: FolderOpen,
          loading: isLoadingLogGroups,
        },
        {
          title: "Active Streams",
          value: totalLogStreams,
          description: "Log streams with data",
          icon: FileText,
          loading: isLoadingLogGroups,
        },
        {
          title: "Storage Used",
          value: formatBytes(totalStorageSize),
          description: "Total log storage",
          icon: Archive,
          loading: isLoadingLogGroups,
        },
        {
          title: "Retention",
          value: "Various",
          description: "Retention policies",
          icon: Info,
          loading: false,
        },
      ]}
      alert={{
        icon: Info,
        description:
          "CloudWatch Logs in LocalStack allows you to collect and monitor log data from your local AWS services. Create log groups, manage retention policies, and search through log events.",
      }}
    >
      <Card>
        <CardContent className="p-6">
          <div>
            <h2 className="text-lg font-semibold mb-2">Log Groups</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Manage log groups and their associated log streams
            </p>
            <LogGroupsList
              onSelectLogGroup={setSelectedLogGroup}
              onCreateLogGroup={() => setShowCreateLogGroup(true)}
            />
          </div>
        </CardContent>
      </Card>

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

      {/* Log Group Viewer */}
      {selectedLogGroup && (
        <LogGroupViewer
          logGroupName={selectedLogGroup.logGroupName}
          open={!!selectedLogGroup}
          onOpenChange={(open) => !open && setSelectedLogGroup(null)}
        />
      )}
    </ServicePageLayout>
  );
}