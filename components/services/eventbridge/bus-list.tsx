'use client';

import { useState } from 'react';
import { useEventBuses, useDeleteEventBus } from '@/hooks/use-eventbridge';
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
import { Search, Trash2, Calendar } from 'lucide-react';
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
import { CreateBusDialog } from './create-bus-dialog';
import { BusViewer } from './bus-viewer';

export function BusList() {
  const { data: buses, isLoading, error } = useEventBuses();
  const deleteBus = useDeleteEventBus();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBus, setSelectedBus] = useState<string | null>(null);
  const [busToDelete, setBusToDelete] = useState<string | null>(null);

  const filteredBuses = buses?.filter(bus =>
    bus.name?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleDelete = async () => {
    if (!busToDelete) return;

    try {
      await deleteBus.mutateAsync(busToDelete);
      toast.success(`Event bus "${busToDelete}" deleted successfully`);
      setBusToDelete(null);
    } catch (error: any) {
      toast.error(`Failed to delete event bus: ${error.message}`);
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
        Error loading event buses: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search buses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <CreateBusDialog />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>State</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBuses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No event buses found
                </TableCell>
              </TableRow>
            ) : (
              filteredBuses.map((bus) => (
                <TableRow
                  key={bus.name}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedBus(bus.name || null)}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {bus.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={bus.state === 'ACTIVE' ? 'default' : 'secondary'}
                    >
                      {bus.state || 'ACTIVE'}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-md truncate">
                    {bus.description || '-'}
                  </TableCell>
                  <TableCell>
                    {bus.creationTime
                      ? new Date(bus.creationTime).toLocaleString()
                      : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setBusToDelete(bus.name || null);
                      }}
                      disabled={bus.name === 'default'}
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

      {selectedBus && (
        <BusViewer
          busName={selectedBus}
          open={!!selectedBus}
          onOpenChange={(open) => !open && setSelectedBus(null)}
        />
      )}

      <AlertDialog open={!!busToDelete} onOpenChange={(open) => !open && setBusToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event Bus</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the event bus "{busToDelete}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}