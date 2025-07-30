'use client';

import { useState } from 'react';
import { useS3Buckets, useDeleteBucket } from '@/hooks/use-s3';
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
import { MoreVertical, Trash2, FolderOpen } from 'lucide-react';
import { formatDistanceToNow } from '@/lib/utils';

interface BucketListProps {
  onSelectBucket: (bucketName: string) => void;
}

export function BucketList({ onSelectBucket }: BucketListProps) {
  const { data: buckets, isLoading } = useS3Buckets();
  const deleteBucket = useDeleteBucket();
  const [bucketToDelete, setBucketToDelete] = useState<string | null>(null);

  const handleDeleteBucket = async () => {
    if (!bucketToDelete) return;
    
    await deleteBucket.mutateAsync(bucketToDelete);
    setBucketToDelete(null);
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

  if (!buckets || buckets.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No buckets found</p>
        <p className="text-sm text-muted-foreground mt-2">
          Create a bucket to get started
        </p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Bucket Name</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {buckets.map((bucket) => (
            <TableRow key={bucket.name}>
              <TableCell className="font-medium">{bucket.name}</TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(bucket.creationDate))} ago
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onSelectBucket(bucket.name)}>
                      <FolderOpen className="mr-2 h-4 w-4" />
                      Browse Objects
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => setBucketToDelete(bucket.name)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Bucket
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={!!bucketToDelete} onOpenChange={() => setBucketToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bucket</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the bucket &quot;{bucketToDelete}&quot;? This action
              cannot be undone. The bucket must be empty to be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBucket}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}