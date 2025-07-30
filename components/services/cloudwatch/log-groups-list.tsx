'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Search, Plus, Trash2, Eye, RefreshCw } from 'lucide-react';
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
import { formatBytes } from '@/lib/utils';
import { useCloudWatchLogGroups, useDeleteCloudWatchLogGroup } from '@/hooks/use-cloudwatch';
import type { CloudWatchLogGroup } from '@/types';

interface LogGroupsListProps {
  onSelectLogGroup: (logGroup: CloudWatchLogGroup) => void;
  onCreateLogGroup: () => void;
}

export function LogGroupsList({ onSelectLogGroup, onCreateLogGroup }: LogGroupsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteLogGroup, setDeleteLogGroup] = useState<string | null>(null);
  
  const { data: logGroups, isLoading, refetch } = useCloudWatchLogGroups();
  const deleteLogGroupMutation = useDeleteCloudWatchLogGroup();

  const filteredLogGroups = logGroups?.filter(logGroup =>
    logGroup.logGroupName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async () => {
    if (deleteLogGroup) {
      await deleteLogGroupMutation.mutateAsync(deleteLogGroup);
      setDeleteLogGroup(null);
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
            placeholder="Search log groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => refetch()} variant="outline" size="icon">
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Button onClick={onCreateLogGroup}>
          <Plus className="mr-2 h-4 w-4" />
          Create Log Group
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Log Group Name</TableHead>
              <TableHead>Retention (days)</TableHead>
              <TableHead>Stored Bytes</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogGroups?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No log groups found
                </TableCell>
              </TableRow>
            ) : (
              filteredLogGroups?.map((logGroup) => (
                <TableRow
                  key={logGroup.logGroupName}
                  className="cursor-pointer"
                  onClick={() => onSelectLogGroup(logGroup)}
                >
                  <TableCell className="font-medium">
                    {logGroup.logGroupName}
                  </TableCell>
                  <TableCell>
                    {logGroup.retentionInDays || 'Never expire'}
                  </TableCell>
                  <TableCell>
                    {logGroup.storedBytes ? formatBytes(logGroup.storedBytes) : '0 B'}
                  </TableCell>
                  <TableCell>
                    {logGroup.creationTime
                      ? format(new Date(logGroup.creationTime), 'PPp')
                      : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectLogGroup(logGroup);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteLogGroup(logGroup.logGroupName);
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

      <AlertDialog open={!!deleteLogGroup} onOpenChange={() => setDeleteLogGroup(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the log group "{deleteLogGroup}" and all its log streams.
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