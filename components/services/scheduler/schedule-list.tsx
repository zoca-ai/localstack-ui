"use client";

import { useState } from "react";
import {
  useSchedules,
  useDeleteSchedule,
  useUpdateSchedule,
} from "@/hooks/use-scheduler";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Search, Trash2, Clock, Calendar, Layers } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CreateScheduleDialog } from "./create-schedule-dialog";
import { ScheduleViewer } from "./schedule-viewer";

interface ScheduleListProps {
  groupName?: string;
}

export function ScheduleList({ groupName }: ScheduleListProps) {
  const { data: schedules, isLoading, error } = useSchedules(groupName);
  const deleteSchedule = useDeleteSchedule();
  const updateSchedule = useUpdateSchedule();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSchedule, setSelectedSchedule] = useState<{
    name: string;
    groupName: string;
  } | null>(null);
  const [scheduleToDelete, setScheduleToDelete] = useState<{
    name: string;
    groupName: string;
  } | null>(null);

  const filteredSchedules =
    schedules?.filter((schedule) =>
      schedule.name?.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];

  const handleDelete = async () => {
    if (!scheduleToDelete) return;

    try {
      await deleteSchedule.mutateAsync({
        name: scheduleToDelete.name,
        groupName: scheduleToDelete.groupName,
      });
      toast.success(`Schedule "${scheduleToDelete.name}" deleted successfully`);
      setScheduleToDelete(null);
    } catch (error: any) {
      toast.error(`Failed to delete schedule: ${error.message}`);
    }
  };

  const handleToggle = async (schedule: any) => {
    try {
      const newState = schedule.state === "ENABLED" ? "DISABLED" : "ENABLED";
      await updateSchedule.mutateAsync({
        name: schedule.name,
        groupName: schedule.groupName,
        state: newState,
      });
      toast.success(`Schedule "${schedule.name}" ${newState.toLowerCase()}`);
    } catch (error: any) {
      toast.error(`Failed to update schedule: ${error.message}`);
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
        Error loading schedules: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search schedules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <CreateScheduleDialog groupName={groupName} />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>State</TableHead>
              <TableHead>Group</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Last Modified</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSchedules.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground"
                >
                  No schedules found
                </TableCell>
              </TableRow>
            ) : (
              filteredSchedules.map((schedule) => (
                <TableRow
                  key={`${schedule.groupName}-${schedule.name}`}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() =>
                    setSelectedSchedule({
                      name: schedule.name || "",
                      groupName: schedule.groupName || "default",
                    })
                  }
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {schedule.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">
                      {schedule.scheduleExpression}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={schedule.state === "ENABLED"}
                        onCheckedChange={() => handleToggle(schedule)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Badge
                        variant={
                          schedule.state === "ENABLED" ? "default" : "secondary"
                        }
                      >
                        {schedule.state}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Layers className="h-3 w-3 text-muted-foreground" />
                      {schedule.groupName || "default"}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {schedule.target?.arn || "-"}
                  </TableCell>
                  <TableCell>
                    {schedule.lastModificationDate
                      ? new Date(schedule.lastModificationDate).toLocaleString()
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setScheduleToDelete({
                          name: schedule.name || "",
                          groupName: schedule.groupName || "default",
                        });
                      }}
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

      {selectedSchedule && (
        <ScheduleViewer
          scheduleName={selectedSchedule.name}
          groupName={selectedSchedule.groupName}
          open={!!selectedSchedule}
          onOpenChange={(open) => !open && setSelectedSchedule(null)}
        />
      )}

      <AlertDialog
        open={!!scheduleToDelete}
        onOpenChange={(open) => !open && setScheduleToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Schedule</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the schedule "
              {scheduleToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
