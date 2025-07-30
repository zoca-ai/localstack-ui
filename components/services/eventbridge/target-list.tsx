'use client';

import { useState } from 'react';
import { useEventTargets, useRemoveEventTargets } from '@/hooks/use-eventbridge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Trash2, Target, FileJson } from 'lucide-react';
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
import { AddTargetDialog } from './add-target-dialog';

interface TargetListProps {
  ruleName: string;
  eventBusName?: string;
}

export function TargetList({ ruleName, eventBusName = 'default' }: TargetListProps) {
  const { data: targets, isLoading, error } = useEventTargets(ruleName, eventBusName);
  const removeTargets = useRemoveEventTargets();
  const [targetToDelete, setTargetToDelete] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!targetToDelete) return;

    try {
      await removeTargets.mutateAsync({
        rule: ruleName,
        eventBusName,
        ids: [targetToDelete],
      });
      toast.success('Target removed successfully');
      setTargetToDelete(null);
    } catch (error: any) {
      toast.error(`Failed to remove target: ${error.message}`);
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
        Error loading targets: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Target className="h-4 w-4" />
          Targets ({targets?.length || 0})
        </h3>
        <AddTargetDialog ruleName={ruleName} eventBusName={eventBusName} />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Target ARN</TableHead>
              <TableHead>Input</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!targets || targets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No targets configured
                </TableCell>
              </TableRow>
            ) : (
              targets.map((target) => (
                <TableRow key={target.id}>
                  <TableCell className="font-medium">{target.id}</TableCell>
                  <TableCell>
                    <div className="max-w-md truncate text-sm">
                      {target.arn}
                    </div>
                  </TableCell>
                  <TableCell>
                    {target.input ? (
                      <Badge variant="outline" className="gap-1">
                        <FileJson className="h-3 w-3" />
                        Custom Input
                      </Badge>
                    ) : target.inputPath ? (
                      <Badge variant="outline">Input Path</Badge>
                    ) : target.inputTransformer ? (
                      <Badge variant="outline">Transformer</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setTargetToDelete(target.id)}
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

      <AlertDialog open={!!targetToDelete} onOpenChange={(open) => !open && setTargetToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Target</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this target? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}