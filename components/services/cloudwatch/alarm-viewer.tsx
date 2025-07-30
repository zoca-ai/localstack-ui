'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Bell, BellOff } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  useCloudWatchAlarm,
  useCloudWatchAlarmHistory,
  useUpdateCloudWatchAlarmState,
} from '@/hooks/use-cloudwatch';

interface AlarmViewerProps {
  alarmName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AlarmViewer({ alarmName, open, onOpenChange }: AlarmViewerProps) {
  const [activeTab, setActiveTab] = useState('details');
  const [historyFilter, setHistoryFilter] = useState<string>('all');

  const { data: alarm, isLoading: isLoadingAlarm } = useCloudWatchAlarm(alarmName, open);
  const { data: history, isLoading: isLoadingHistory } = useCloudWatchAlarmHistory(
    alarmName,
    historyFilter !== 'all' ? { historyItemType: historyFilter as any } : undefined,
    open && activeTab === 'history'
  );
  const updateAlarmStateMutation = useUpdateCloudWatchAlarmState();

  const handleToggleActions = async () => {
    if (alarm) {
      await updateAlarmStateMutation.mutateAsync({
        alarmName,
        action: alarm.actionsEnabled ? 'disableActions' : 'enableActions',
      });
    }
  };

  const handleSetState = async (state: 'OK' | 'ALARM' | 'INSUFFICIENT_DATA') => {
    await updateAlarmStateMutation.mutateAsync({
      alarmName,
      action: 'setState',
      stateValue: state,
      stateReason: `Manually set to ${state} state`,
    });
  };

  const getStateBadge = (state?: string) => {
    switch (state) {
      case 'OK':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">OK</Badge>;
      case 'ALARM':
        return <Badge variant="destructive">ALARM</Badge>;
      case 'INSUFFICIENT_DATA':
        return <Badge variant="secondary">INSUFFICIENT DATA</Badge>;
      default:
        return <Badge variant="outline">UNKNOWN</Badge>;
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{alarmName}</span>
            {alarm && getStateBadge(alarm.stateValue)}
          </DialogTitle>
          <DialogDescription>
            View alarm details, configuration, and history
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 overflow-auto">
            {isLoadingAlarm ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : alarm ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Alarm State</h3>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleToggleActions}
                      variant="outline"
                      size="sm"
                    >
                      {alarm.actionsEnabled ? (
                        <>
                          <BellOff className="mr-2 h-4 w-4" />
                          Disable Actions
                        </>
                      ) : (
                        <>
                          <Bell className="mr-2 h-4 w-4" />
                          Enable Actions
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Current State
                    </p>
                    <div className="flex items-center gap-2">
                      {getStateBadge(alarm.stateValue)}
                      <p className="text-sm text-muted-foreground">
                        since {alarm.stateUpdatedTimestamp
                          ? format(new Date(alarm.stateUpdatedTimestamp), 'PPp')
                          : '-'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      State Reason
                    </p>
                    <p className="text-sm">{alarm.stateReason || '-'}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Manually set state:
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetState('OK')}
                  >
                    Set to OK
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetState('ALARM')}
                  >
                    Set to ALARM
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetState('INSUFFICIENT_DATA')}
                  >
                    Set to Insufficient Data
                  </Button>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Metric Configuration</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Namespace
                      </p>
                      <p className="text-sm">{alarm.namespace}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Metric Name
                      </p>
                      <p className="text-sm">{alarm.metricName}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Statistic
                      </p>
                      <p className="text-sm">{alarm.statistic || alarm.extendedStatistic}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Period
                      </p>
                      <p className="text-sm">{alarm.period} seconds</p>
                    </div>
                  </div>
                  {alarm.dimensions && alarm.dimensions.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Dimensions
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {alarm.dimensions.map((dim, idx) => (
                          <Badge key={idx} variant="secondary">
                            {dim.name}: {dim.value}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Alarm Conditions</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Threshold
                      </p>
                      <p className="text-sm">
                        {alarm.comparisonOperator} {alarm.threshold}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Evaluation Periods
                      </p>
                      <p className="text-sm">
                        {alarm.datapointsToAlarm || alarm.evaluationPeriods} out of {alarm.evaluationPeriods}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Treat Missing Data
                      </p>
                      <p className="text-sm">{alarm.treatMissingData || 'missing'}</p>
                    </div>
                  </div>
                </div>

                {alarm.alarmDescription && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Description
                    </p>
                    <p className="text-sm">{alarm.alarmDescription}</p>
                  </div>
                )}

                {(alarm.alarmActions?.length || alarm.okActions?.length || alarm.insufficientDataActions?.length) ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Actions</h3>
                    {alarm.alarmActions?.length ? (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">
                          Alarm Actions
                        </p>
                        <div className="space-y-1">
                          {alarm.alarmActions.map((action, idx) => (
                            <p key={idx} className="text-sm font-mono">{action}</p>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    {alarm.okActions?.length ? (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">
                          OK Actions
                        </p>
                        <div className="space-y-1">
                          {alarm.okActions.map((action, idx) => (
                            <p key={idx} className="text-sm font-mono">{action}</p>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    {alarm.insufficientDataActions?.length ? (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">
                          Insufficient Data Actions
                        </p>
                        <div className="space-y-1">
                          {alarm.insufficientDataActions.map((action, idx) => (
                            <p key={idx} className="text-sm font-mono">{action}</p>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}
          </TabsContent>

          <TabsContent value="history" className="space-y-4 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Alarm state and configuration history
              </p>
              <Select value={historyFilter} onValueChange={setHistoryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All History</SelectItem>
                  <SelectItem value="ConfigurationUpdate">Configuration Updates</SelectItem>
                  <SelectItem value="StateUpdate">State Updates</SelectItem>
                  <SelectItem value="Action">Actions</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoadingHistory ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ScrollArea className="flex-1">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Summary</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {history?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center">
                            No history found
                          </TableCell>
                        </TableRow>
                      ) : (
                        history?.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              {item.timestamp
                                ? format(new Date(item.timestamp), 'PPp')
                                : '-'}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {item.historyItemType}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-md">
                              <p className="text-sm truncate">
                                {item.historySummary}
                              </p>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}