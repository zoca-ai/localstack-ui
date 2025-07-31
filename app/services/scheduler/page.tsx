"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScheduleList } from "@/components/services/scheduler/schedule-list";
import { GroupList } from "@/components/services/scheduler/group-list";
import { ServicePageLayout } from "@/components/layout/service-page-layout";
import { Clock, Calendar, Layers, Info } from "lucide-react";
import { useSchedules, useScheduleGroups } from "@/hooks/use-scheduler";

export default function SchedulerPage() {
  const [selectedGroup, setSelectedGroup] = useState<string>("default");
  const { data: schedules } = useSchedules();
  const { data: groups } = useScheduleGroups();

  const totalSchedules = schedules?.length || 0;
  const activeSchedules =
    schedules?.filter((s) => s.state === "ENABLED").length || 0;
  const totalGroups = (groups?.length || 0) + 1; // +1 for default group

  return (
    <ServicePageLayout
      title="EventBridge Scheduler"
      description="Schedule tasks at specific times or intervals"
      icon={Clock}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Schedules
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSchedules}</div>
            <p className="text-xs text-muted-foreground">Across all groups</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Schedules
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSchedules}</div>
            <p className="text-xs text-muted-foreground">Currently enabled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Schedule Groups
            </CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGroups}</div>
            <p className="text-xs text-muted-foreground">Including default</p>
          </CardContent>
        </Card>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          EventBridge Scheduler is a serverless scheduler that allows you to
          create, run, and manage tasks from one central, managed service.
          Create schedules using cron or rate expressions and invoke targets
          like Lambda functions, SQS queues, and more.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 lg:grid-cols-4">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Groups</CardTitle>
            <CardDescription>Organize schedules into groups</CardDescription>
          </CardHeader>
          <CardContent>
            <GroupList
              selectedGroup={selectedGroup}
              onSelectGroup={setSelectedGroup}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Schedules - {selectedGroup}</CardTitle>
            <CardDescription>
              Manage scheduled tasks in this group
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScheduleList groupName={selectedGroup} />
          </CardContent>
        </Card>
      </div>
    </ServicePageLayout>
  );
}
