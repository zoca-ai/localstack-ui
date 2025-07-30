'use client';

import { useSchedule } from '@/hooks/use-scheduler';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, Target, Calendar, Globe, Layers } from 'lucide-react';

interface ScheduleViewerProps {
  scheduleName: string;
  groupName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ScheduleViewer({ scheduleName, groupName, open, onOpenChange }: ScheduleViewerProps) {
  const { data: schedule, isLoading } = useSchedule(scheduleName, groupName, open);

  if (isLoading) {
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
            <Clock className="h-5 w-5" />
            Schedule: {scheduleName}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="mt-4">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="target">Target</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            <Card className="p-4">
              <h3 className="text-sm font-semibold mb-3">Schedule Information</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Name</span>
                  <span className="text-sm font-medium">{schedule?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Group</span>
                  <div className="flex items-center gap-1">
                    <Layers className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm font-medium">{schedule?.groupName || 'default'}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">State</span>
                  <Badge variant={schedule?.state === 'ENABLED' ? 'default' : 'secondary'}>
                    {schedule?.state}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Created</span>
                  <span className="text-sm">
                    {schedule?.creationDate
                      ? new Date(schedule.creationDate).toLocaleString()
                      : '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Last Modified</span>
                  <span className="text-sm">
                    {schedule?.lastModificationDate
                      ? new Date(schedule.lastModificationDate).toLocaleString()
                      : '-'}
                  </span>
                </div>
                {schedule?.description && (
                  <div className="pt-2">
                    <span className="text-sm text-muted-foreground">Description</span>
                    <p className="text-sm mt-1">{schedule.description}</p>
                  </div>
                )}
              </div>
            </Card>
            
            {schedule?.arn && (
              <Card className="p-4">
                <h3 className="text-sm font-semibold mb-3">ARN</h3>
                <p className="text-xs font-mono break-all bg-muted p-2 rounded">
                  {schedule.arn}
                </p>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="target" className="space-y-4">
            <Card className="p-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Target Configuration
              </h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-muted-foreground">Target ARN</span>
                  <p className="text-sm font-mono mt-1 break-all bg-muted p-2 rounded">
                    {schedule?.target?.arn || '-'}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Role ARN</span>
                  <p className="text-sm font-mono mt-1 break-all bg-muted p-2 rounded">
                    {schedule?.target?.roleArn || '-'}
                  </p>
                </div>
                {schedule?.target?.input && (
                  <div>
                    <span className="text-sm text-muted-foreground">Input</span>
                    <pre className="text-sm mt-1 bg-muted p-2 rounded overflow-auto">
                      {JSON.stringify(JSON.parse(schedule.target.input), null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </Card>

            {schedule?.target?.retryPolicy && (
              <Card className="p-4">
                <h3 className="text-sm font-semibold mb-3">Retry Policy</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Maximum Retry Attempts</span>
                    <span className="text-sm">{schedule.target.retryPolicy.maximumRetryAttempts || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Maximum Event Age</span>
                    <span className="text-sm">{schedule.target.retryPolicy.maximumEventAgeInSeconds || 0}s</span>
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="schedule" className="space-y-4">
            <Card className="p-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Schedule Configuration
              </h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-muted-foreground">Expression</span>
                  <p className="text-sm font-mono mt-1 bg-muted p-2 rounded">
                    {schedule?.scheduleExpression}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Timezone</span>
                  <div className="flex items-center gap-1">
                    <Globe className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">{schedule?.scheduleExpressionTimezone || 'UTC'}</span>
                  </div>
                </div>
                {schedule?.startDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Start Date</span>
                    <span className="text-sm">{new Date(schedule.startDate).toLocaleString()}</span>
                  </div>
                )}
                {schedule?.endDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">End Date</span>
                    <span className="text-sm">{new Date(schedule.endDate).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="text-sm font-semibold mb-3">Flexible Time Window</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Mode</span>
                  <Badge variant={schedule?.flexibleTimeWindow?.mode === 'OFF' ? 'secondary' : 'default'}>
                    {schedule?.flexibleTimeWindow?.mode}
                  </Badge>
                </div>
                {schedule?.flexibleTimeWindow?.mode === 'FLEXIBLE' && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Maximum Window</span>
                    <span className="text-sm">{schedule.flexibleTimeWindow.maximumWindowInMinutes} minutes</span>
                  </div>
                )}
              </div>
            </Card>

            {schedule?.actionAfterCompletion && (
              <Card className="p-4">
                <h3 className="text-sm font-semibold mb-3">After Completion</h3>
                <p className="text-sm">
                  Action: <Badge variant="outline">{schedule.actionAfterCompletion}</Badge>
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}