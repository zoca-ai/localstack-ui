'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { FileText, Trash2, Plus, RefreshCw } from 'lucide-react';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { formatBytes } from '@/lib/utils';
import {
  useCloudWatchLogGroup,
  useCloudWatchLogStreams,
  useDeleteCloudWatchLogStream,
} from '@/hooks/use-cloudwatch';
import { LogGroupForm } from './log-group-form';
import { LogViewer } from './log-viewer';
import { LogStreamForm } from './log-stream-form';
import type { CloudWatchLogGroup, CloudWatchLogStream } from '@/types';

interface LogGroupViewerProps {
  logGroupName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LogGroupViewer({ logGroupName, open, onOpenChange }: LogGroupViewerProps) {
  const [activeTab, setActiveTab] = useState('details');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedStream, setSelectedStream] = useState<CloudWatchLogStream | null>(null);
  const [deleteStream, setDeleteStream] = useState<string | null>(null);
  const [showCreateStream, setShowCreateStream] = useState(false);

  const { data: logGroup, isLoading: isLoadingGroup } = useCloudWatchLogGroup(logGroupName, open);
  const { data: logStreams, isLoading: isLoadingStreams, refetch: refetchStreams } = useCloudWatchLogStreams(
    logGroupName,
    { orderBy: 'LastEventTime', descending: true }
  );
  const deleteStreamMutation = useDeleteCloudWatchLogStream();

  const handleDeleteStream = async () => {
    if (deleteStream) {
      await deleteStreamMutation.mutateAsync({
        logGroupName,
        logStreamName: deleteStream,
      });
      setDeleteStream(null);
    }
  };

  const handleStreamCreated = () => {
    setShowCreateStream(false);
    refetchStreams();
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{logGroupName}</DialogTitle>
          <DialogDescription>
            View and manage log group details, streams, and events
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="streams">Log Streams</TabsTrigger>
            <TabsTrigger value="logs">View Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 overflow-auto">
            {isLoadingGroup ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : (
              <>
                {!isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">
                          Log Group Name
                        </p>
                        <p className="text-sm">{logGroup?.logGroupName}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">
                          Creation Time
                        </p>
                        <p className="text-sm">
                          {logGroup?.creationTime
                            ? format(new Date(logGroup.creationTime), 'PPp')
                            : '-'}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">
                          Retention Period
                        </p>
                        <p className="text-sm">
                          {logGroup?.retentionInDays
                            ? `${logGroup.retentionInDays} days`
                            : 'Never expire'}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">
                          Stored Bytes
                        </p>
                        <p className="text-sm">
                          {logGroup?.storedBytes
                            ? formatBytes(logGroup.storedBytes)
                            : '0 B'}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">
                          Metric Filter Count
                        </p>
                        <p className="text-sm">{logGroup?.metricFilterCount || 0}</p>
                      </div>
                      {logGroup?.arn && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">
                            ARN
                          </p>
                          <p className="text-sm font-mono break-all">{logGroup.arn}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end">
                      <Button onClick={() => setIsEditing(true)}>
                        Edit Log Group
                      </Button>
                    </div>
                  </div>
                ) : (
                  <LogGroupForm
                    logGroup={logGroup}
                    onSuccess={() => {
                      setIsEditing(false);
                    }}
                    onCancel={() => setIsEditing(false)}
                  />
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="streams" className="space-y-4 overflow-auto">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {logStreams?.length || 0} log streams
              </p>
              <div className="flex gap-2">
                <Button onClick={() => refetchStreams()} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button onClick={() => setShowCreateStream(true)} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Stream
                </Button>
              </div>
            </div>

            {showCreateStream && (
              <LogStreamForm
                logGroupName={logGroupName}
                onSuccess={handleStreamCreated}
                onCancel={() => setShowCreateStream(false)}
              />
            )}

            {isLoadingStreams ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Stream Name</TableHead>
                      <TableHead>Last Event</TableHead>
                      <TableHead>Stored Bytes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logStreams?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">
                          No log streams found
                        </TableCell>
                      </TableRow>
                    ) : (
                      logStreams?.map((stream) => (
                        <TableRow
                          key={stream.logStreamName}
                          className="cursor-pointer"
                          onClick={() => setSelectedStream(stream)}
                        >
                          <TableCell className="font-medium">
                            {stream.logStreamName}
                          </TableCell>
                          <TableCell>
                            {stream.lastEventTimestamp
                              ? format(new Date(stream.lastEventTimestamp), 'PPp')
                              : '-'}
                          </TableCell>
                          <TableCell>
                            {stream.storedBytes
                              ? formatBytes(stream.storedBytes)
                              : '0 B'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedStream(stream);
                                  setActiveTab('logs');
                                }}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteStream(stream.logStreamName);
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
            )}
          </TabsContent>

          <TabsContent value="logs" className="overflow-auto">
            {selectedStream ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Log Stream</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedStream.logStreamName}
                    </p>
                  </div>
                  <Badge variant="outline">
                    Last event: {selectedStream.lastEventTimestamp
                      ? format(new Date(selectedStream.lastEventTimestamp), 'PPp')
                      : 'No events'}
                  </Badge>
                </div>
                <LogViewer
                  logGroupName={logGroupName}
                  logStreamName={selectedStream.logStreamName}
                />
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Select a log stream to view its events
              </div>
            )}
          </TabsContent>
        </Tabs>

        <AlertDialog open={!!deleteStream} onOpenChange={() => setDeleteStream(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the log stream "{deleteStream}" and all its events.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteStream}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
}