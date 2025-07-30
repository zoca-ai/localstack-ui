'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Search, Plus, Trash2, Eye, Bell, BellOff, RefreshCw } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useCloudWatchAlarms,
  useDeleteCloudWatchAlarm,
  useUpdateCloudWatchAlarmState,
} from '@/hooks/use-cloudwatch';
import type { CloudWatchAlarm } from '@/types';

interface AlarmsListProps {
  onSelectAlarm: (alarm: CloudWatchAlarm) => void;
  onCreateAlarm: () => void;
}

export function AlarmsList({ onSelectAlarm, onCreateAlarm }: AlarmsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [deleteAlarm, setDeleteAlarm] = useState<string | null>(null);
  
  const { data: alarms, isLoading, refetch } = useCloudWatchAlarms(
    stateFilter !== 'all' ? { stateValue: stateFilter as any } : undefined
  );
  const deleteAlarmMutation = useDeleteCloudWatchAlarm();
  const updateAlarmStateMutation = useUpdateCloudWatchAlarmState();

  const filteredAlarms = alarms?.filter(alarm =>
    alarm.alarmName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    alarm.metricName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async () => {
    if (deleteAlarm) {
      await deleteAlarmMutation.mutateAsync(deleteAlarm);
      setDeleteAlarm(null);
    }
  };

  const toggleAlarmActions = async (alarmName: string, currentState: boolean) => {
    await updateAlarmStateMutation.mutateAsync({
      alarmName,
      action: currentState ? 'disableActions' : 'enableActions',
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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search alarms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={stateFilter} onValueChange={setStateFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All States</SelectItem>
            <SelectItem value="OK">OK</SelectItem>
            <SelectItem value="ALARM">ALARM</SelectItem>
            <SelectItem value="INSUFFICIENT_DATA">Insufficient Data</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => refetch()} variant="outline" size="icon">
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Button onClick={onCreateAlarm}>
          <Plus className="mr-2 h-4 w-4" />
          Create Alarm
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Alarm Name</TableHead>
              <TableHead>State</TableHead>
              <TableHead>Metric</TableHead>
              <TableHead>Threshold</TableHead>
              <TableHead>Actions</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAlarms?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No alarms found
                </TableCell>
              </TableRow>
            ) : (
              filteredAlarms?.map((alarm) => (
                <TableRow
                  key={alarm.alarmName}
                  className="cursor-pointer"
                  onClick={() => onSelectAlarm(alarm)}
                >
                  <TableCell className="font-medium">
                    {alarm.alarmName}
                  </TableCell>
                  <TableCell>
                    {getStateBadge(alarm.stateValue)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{alarm.namespace}</div>
                      <div className="text-muted-foreground">{alarm.metricName}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {alarm.comparisonOperator} {alarm.threshold}
                  </TableCell>
                  <TableCell>
                    <Badge variant={alarm.actionsEnabled ? 'default' : 'outline'}>
                      {alarm.actionsEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {alarm.stateUpdatedTimestamp
                      ? format(new Date(alarm.stateUpdatedTimestamp), 'PPp')
                      : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAlarm(alarm);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (alarm.alarmName) {
                            toggleAlarmActions(alarm.alarmName, alarm.actionsEnabled || false);
                          }
                        }}
                      >
                        {alarm.actionsEnabled ? (
                          <BellOff className="h-4 w-4" />
                        ) : (
                          <Bell className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteAlarm(alarm.alarmName || null);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteAlarm} onOpenChange={() => setDeleteAlarm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the alarm "{deleteAlarm}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}