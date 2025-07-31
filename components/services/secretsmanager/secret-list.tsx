"use client";

import { useState } from "react";
import { useSecrets, useDeleteSecret } from "@/hooks/use-secrets-manager";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Key, MoreVertical, Trash2, Edit, Search } from "lucide-react";
import { formatDistanceToNow } from "@/lib/utils";
import { Secret } from "@/types";

interface SecretListProps {
  onViewSecret: (secret: Secret) => void;
  onEditSecret: (secret: Secret) => void;
}

export function SecretList({ onViewSecret, onEditSecret }: SecretListProps) {
  const { data: secrets, isLoading } = useSecrets();
  const deleteSecret = useDeleteSecret();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{
    secret: Secret;
    forceDelete: boolean;
  } | null>(null);

  const handleDeleteSecret = async () => {
    if (!deleteTarget) return;

    await deleteSecret.mutateAsync({
      secretId: deleteTarget.secret.name,
      forceDelete: deleteTarget.forceDelete,
    });
    setDeleteTarget(null);
  };

  const filteredSecrets =
    secrets?.filter(
      (secret) =>
        secret.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        secret.description?.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search secrets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {filteredSecrets.length === 0 ? (
        <div className="text-center py-12">
          <Key className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {searchQuery
              ? "No secrets found matching your search"
              : "No secrets found"}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Create a secret to get started
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Last Modified</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSecrets.map((secret) => (
              <TableRow
                key={secret.name}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onViewSecret(secret)}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-muted-foreground" />
                    {secret.name}
                  </div>
                </TableCell>
                <TableCell className="max-w-[300px] truncate">
                  {secret.description || "-"}
                </TableCell>
                <TableCell>
                  {secret.lastChangedDate
                    ? formatDistanceToNow(new Date(secret.lastChangedDate)) +
                      " ago"
                    : "-"}
                </TableCell>
                <TableCell>
                  {secret.tags && Object.keys(secret.tags).length > 0 ? (
                    <div className="flex gap-1">
                      {Object.keys(secret.tags)
                        .slice(0, 2)
                        .map((key) => (
                          <Badge
                            key={key}
                            variant="secondary"
                            className="text-xs"
                          >
                            {key}
                          </Badge>
                        ))}
                      {Object.keys(secret.tags).length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{Object.keys(secret.tags).length - 2}
                        </Badge>
                      )}
                    </div>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditSecret(secret);
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Update Value
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget({ secret, forceDelete: false });
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Secret
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Secret</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the secret &quot;
              {deleteTarget?.secret.name}&quot;?
              {!deleteTarget?.forceDelete && (
                <span className="block mt-2">
                  The secret will be scheduled for deletion with a 7-day
                  recovery window. You can restore it within this period.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-center gap-2 my-4">
            <input
              type="checkbox"
              id="force-delete"
              checked={deleteTarget?.forceDelete || false}
              onChange={(e) =>
                setDeleteTarget(
                  deleteTarget
                    ? { ...deleteTarget, forceDelete: e.target.checked }
                    : null,
                )
              }
              className="rounded border-gray-300"
            />
            <label htmlFor="force-delete" className="text-sm">
              Force delete without recovery (permanent deletion)
            </label>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSecret}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteTarget?.forceDelete
                ? "Delete Permanently"
                : "Schedule Deletion"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
