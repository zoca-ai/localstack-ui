'use client';

import { useState } from 'react';
import { useStacks, useDeleteStack } from '@/hooks/use-cloudformation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Search, Trash2, Layers, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
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
import { CreateStackDialog } from './create-stack-dialog';
import { StackViewer } from './stack-viewer';

export function StackList() {
  const { data: stacks, isLoading, error } = useStacks();
  const deleteStack = useDeleteStack();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStack, setSelectedStack] = useState<string | null>(null);
  const [stackToDelete, setStackToDelete] = useState<string | null>(null);

  const filteredStacks = stacks?.filter(stack =>
    stack.stackName.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleDelete = async () => {
    if (!stackToDelete) return;

    try {
      await deleteStack.mutateAsync({ stackName: stackToDelete });
      toast.success(`Stack "${stackToDelete}" deletion initiated`);
      setStackToDelete(null);
    } catch (error: any) {
      toast.error(`Failed to delete stack: ${error.message}`);
    }
  };

  const getStatusIcon = (status: string) => {
    if (status.includes('COMPLETE') && !status.includes('FAILED') && !status.includes('ROLLBACK')) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (status.includes('IN_PROGRESS')) {
      return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />;
    } else if (status.includes('FAILED') || status.includes('ROLLBACK')) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    } else {
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    if (status.includes('COMPLETE') && !status.includes('FAILED') && !status.includes('ROLLBACK')) {
      return 'default';
    } else if (status.includes('IN_PROGRESS')) {
      return 'secondary';
    } else if (status.includes('FAILED') || status.includes('ROLLBACK')) {
      return 'destructive';
    } else {
      return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500">
        Error loading stacks: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search stacks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <CreateStackDialog />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Drift Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStacks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No stacks found
                </TableCell>
              </TableRow>
            ) : (
              filteredStacks.map((stack) => (
                <TableRow
                  key={stack.stackId}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedStack(stack.stackName)}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-muted-foreground" />
                      {stack.stackName}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(stack.stackStatus)}
                      <Badge variant={getStatusVariant(stack.stackStatus)}>
                        {stack.stackStatus}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    {stack.creationTime
                      ? new Date(stack.creationTime).toLocaleString()
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {stack.lastUpdatedTime
                      ? new Date(stack.lastUpdatedTime).toLocaleString()
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {stack.driftInformation ? (
                      <Badge variant={
                        stack.driftInformation.stackDriftStatus === 'IN_SYNC' ? 'outline' : 'secondary'
                      }>
                        {stack.driftInformation.stackDriftStatus}
                      </Badge>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setStackToDelete(stack.stackName);
                      }}
                      disabled={stack.stackStatus.includes('IN_PROGRESS')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedStack && (
        <StackViewer
          stackName={selectedStack}
          open={!!selectedStack}
          onOpenChange={(open) => !open && setSelectedStack(null)}
        />
      )}

      <AlertDialog open={!!stackToDelete} onOpenChange={(open) => !open && setStackToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Stack</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the stack "{stackToDelete}"? 
              This will delete all resources created by this stack. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete Stack
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}