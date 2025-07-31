"use client";

import { useState } from "react";
import {
  useScheduleGroups,
  useDeleteScheduleGroup,
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Trash2, Layers } from "lucide-react";
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
import { CreateGroupDialog } from "./create-group-dialog";

interface GroupListProps {
  selectedGroup?: string;
  onSelectGroup: (group: string) => void;
}

export function GroupList({ selectedGroup, onSelectGroup }: GroupListProps) {
  const { data: groups, isLoading, error } = useScheduleGroups();
  const deleteGroup = useDeleteScheduleGroup();
  const [groupToDelete, setGroupToDelete] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!groupToDelete) return;

    try {
      await deleteGroup.mutateAsync(groupToDelete);
      toast.success(`Schedule group "${groupToDelete}" deleted successfully`);
      setGroupToDelete(null);
      if (selectedGroup === groupToDelete) {
        onSelectGroup("default");
      }
    } catch (error: any) {
      toast.error(`Failed to delete group: ${error.message}`);
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
        Error loading schedule groups: {error.message}
      </div>
    );
  }

  // Add default group if not in list
  const hasDefaultGroup = groups?.some((group) => group.name === "default");
  const allGroups = hasDefaultGroup
    ? groups || []
    : [
        {
          name: "default",
          state: "ACTIVE" as const,
          arn: "arn:aws:scheduler:::schedule-group/default",
        },
        ...(groups || []),
      ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Layers className="h-4 w-4" />
          Schedule Groups
        </h3>
        <CreateGroupDialog />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>State</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allGroups.map((group) => (
              <TableRow
                key={group.name}
                className={`cursor-pointer hover:bg-muted/50 ${
                  selectedGroup === group.name ? "bg-muted/50" : ""
                }`}
                onClick={() => onSelectGroup(group.name || "default")}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-muted-foreground" />
                    {group.name}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={group.state === "ACTIVE" ? "default" : "secondary"}
                  >
                    {group.state}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setGroupToDelete(group.name || null);
                    }}
                    disabled={group.name === "default"}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={!!groupToDelete}
        onOpenChange={(open) => !open && setGroupToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Schedule Group</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the schedule group "
              {groupToDelete}"? All schedules in this group will also be
              deleted. This action cannot be undone.
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
