'use client';

import { useState, useMemo } from 'react';
import { useS3Objects, useDownloadObject, useDeleteObject, useDeleteObjects } from '@/hooks/use-s3';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  ChevronLeft,
  Download,
  File,
  Folder,
  MoreVertical,
  Search,
  Trash2,
  Upload,
} from 'lucide-react';
import { formatDistanceToNow, formatBytes } from '@/lib/utils';

interface ObjectBrowserProps {
  bucketName: string;
  onBack: () => void;
  onUploadClick: (prefix: string) => void;
}

export function ObjectBrowser({ bucketName, onBack, onUploadClick }: ObjectBrowserProps) {
  const [currentPrefix, setCurrentPrefix] = useState('');
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ key: string } | { keys: string[] } | null>(
    null
  );

  const { data, isLoading } = useS3Objects(bucketName, currentPrefix);
  const downloadObject = useDownloadObject();
  const deleteObject = useDeleteObject();
  const deleteObjects = useDeleteObjects();

  const breadcrumbs = useMemo(() => {
    if (!currentPrefix) return [];
    return currentPrefix.split('/').filter(Boolean);
  }, [currentPrefix]);

  const filteredObjects = useMemo(() => {
    if (!data || !searchQuery) return data?.objects || [];
    return data.objects.filter((obj: any) =>
      obj.key.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  const handleNavigate = (prefix: string) => {
    setCurrentPrefix(prefix);
    setSelectedKeys(new Set());
  };

  const handleBreadcrumbNavigate = (index: number) => {
    const newPrefix = breadcrumbs.slice(0, index + 1).join('/') + '/';
    handleNavigate(index === -1 ? '' : newPrefix);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedKeys(new Set(filteredObjects.map((obj: any) => obj.key)));
    } else {
      setSelectedKeys(new Set());
    }
  };

  const handleSelectOne = (key: string, checked: boolean) => {
    const newSelection = new Set(selectedKeys);
    if (checked) {
      newSelection.add(key);
    } else {
      newSelection.delete(key);
    }
    setSelectedKeys(newSelection);
  };

  const handleDownload = async (key: string) => {
    await downloadObject.mutateAsync({ bucketName, key });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    if ('key' in deleteTarget) {
      await deleteObject.mutateAsync({ bucketName, key: deleteTarget.key });
    } else {
      await deleteObjects.mutateAsync({ bucketName, keys: deleteTarget.keys });
    }
    setDeleteTarget(null);
    setSelectedKeys(new Set());
  };

  const handleBulkDelete = () => {
    const keys = Array.from(selectedKeys);
    if (keys.length > 0) {
      setDeleteTarget({ keys });
    }
  };

  const getObjectName = (key: string) => {
    const parts = key.split('/');
    return parts[parts.length - 1] || parts[parts.length - 2];
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  className="cursor-pointer"
                  onClick={() => handleBreadcrumbNavigate(-1)}
                >
                  {bucketName}
                </BreadcrumbLink>
              </BreadcrumbItem>
              {breadcrumbs.map((crumb, index) => [
                <BreadcrumbSeparator key={`sep-${index}`} />,
                <BreadcrumbItem key={`crumb-${index}`}>
                  {index === breadcrumbs.length - 1 ? (
                    <BreadcrumbPage>{crumb}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      className="cursor-pointer"
                      onClick={() => handleBreadcrumbNavigate(index)}
                    >
                      {crumb}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              ]).flat()}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search objects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-64"
            />
          </div>
          {selectedKeys.size > 0 && (
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete ({selectedKeys.size})
            </Button>
          )}
          <Button onClick={() => onUploadClick(currentPrefix)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={
                  filteredObjects.length > 0 &&
                  selectedKeys.size === filteredObjects.length
                }
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Last Modified</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.prefixes.map((prefix: any) => (
            <TableRow
              key={prefix}
              className="cursor-pointer"
              onClick={() => handleNavigate(prefix)}
            >
              <TableCell>
                <Checkbox disabled />
              </TableCell>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Folder className="h-4 w-4 text-muted-foreground" />
                  {prefix.slice(currentPrefix.length, -1)}
                </div>
              </TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell />
            </TableRow>
          ))}
          {filteredObjects.map((object: any) => (
            <TableRow key={object.key}>
              <TableCell>
                <Checkbox
                  checked={selectedKeys.has(object.key)}
                  onCheckedChange={(checked) =>
                    handleSelectOne(object.key, checked as boolean)
                  }
                />
              </TableCell>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <File className="h-4 w-4 text-muted-foreground" />
                  {getObjectName(object.key)}
                </div>
              </TableCell>
              <TableCell>{formatBytes(object.size)}</TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(object.lastModified))} ago
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleDownload(object.key)}>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => setDeleteTarget({ key: object.key })}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {(!data?.objects.length && !data?.prefixes.length) && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No objects found</p>
          <p className="text-sm text-muted-foreground mt-2">
            Upload files to see them here
          </p>
        </div>
      )}

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Objects</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && 'key' in deleteTarget
                ? `Are you sure you want to delete "${getObjectName(
                    deleteTarget.key
                  )}"? This action cannot be undone.`
                : `Are you sure you want to delete ${
                    deleteTarget && 'keys' in deleteTarget ? deleteTarget.keys.length : 0
                  } objects? This action cannot be undone.`}
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