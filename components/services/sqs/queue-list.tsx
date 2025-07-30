'use client';

import { useState } from 'react';
import { useSQSQueues, useDeleteQueue, usePurgeQueue } from '@/hooks/use-sqs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { MoreVertical, Trash2, MessageSquare, Eraser } from 'lucide-react';
import { formatDistanceToNow } from '@/lib/utils';

interface QueueListProps {
  onSelectQueue: (queueUrl: string, queueName: string) => void;
}

export function QueueList({ onSelectQueue }: QueueListProps) {
  const { data: queues, isLoading } = useSQSQueues();
  const deleteQueue = useDeleteQueue();
  const purgeQueue = usePurgeQueue();
  const [queueToDelete, setQueueToDelete] = useState<{ url: string; name: string } | null>(null);
  const [queueToPurge, setQueueToPurge] = useState<{ url: string; name: string } | null>(null);

  const handleDeleteQueue = async () => {
    if (!queueToDelete) return;
    
    await deleteQueue.mutateAsync(queueToDelete.url);
    setQueueToDelete(null);
  };

  const handlePurgeQueue = async () => {
    if (!queueToPurge) return;
    
    await purgeQueue.mutateAsync(queueToPurge.url);
    setQueueToPurge(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (!queues || queues.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No queues found</p>
        <p className="text-sm text-muted-foreground mt-2">
          Create a queue to get started
        </p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Queue Name</TableHead>
            <TableHead>Messages Available</TableHead>
            <TableHead>Messages In Flight</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {queues.map((queue) => (
            <TableRow key={queue.queueUrl}>
              <TableCell className="font-medium">{queue.queueName}</TableCell>
              <TableCell>{queue.attributes?.ApproximateNumberOfMessages || '0'}</TableCell>
              <TableCell>{queue.attributes?.ApproximateNumberOfMessagesNotVisible || '0'}</TableCell>
              <TableCell>
                {queue.attributes?.CreatedTimestamp
                  ? formatDistanceToNow(new Date(parseInt(queue.attributes.CreatedTimestamp) * 1000)) + ' ago'
                  : 'Unknown'}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onSelectQueue(queue.queueUrl, queue.queueName)}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      View Messages
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setQueueToPurge({ url: queue.queueUrl, name: queue.queueName })}
                    >
                      <Eraser className="mr-2 h-4 w-4" />
                      Purge Queue
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => setQueueToDelete({ url: queue.queueUrl, name: queue.queueName })}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Queue
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={!!queueToDelete} onOpenChange={() => setQueueToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Queue</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the queue &quot;{queueToDelete?.name}&quot;? This action
              cannot be undone and all messages in the queue will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteQueue}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!queueToPurge} onOpenChange={() => setQueueToPurge(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Purge Queue</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to purge the queue &quot;{queueToPurge?.name}&quot;? This will
              permanently delete all messages in the queue. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePurgeQueue}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Purge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}