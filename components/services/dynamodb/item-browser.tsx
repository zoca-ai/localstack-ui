'use client';

import { useState } from 'react';
import { useDynamoDBItems, useDeleteItem } from '@/hooks/use-dynamodb';
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
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Plus, Trash2, Edit, RefreshCw, FileJson } from 'lucide-react';
import { ItemFormDialog } from './item-form-dialog';
import { ItemViewerDialog } from './item-viewer-dialog';

interface ItemBrowserProps {
  tableName: string;
  keySchema?: Array<{
    attributeName: string;
    keyType: 'HASH' | 'RANGE';
  }>;
}

export function ItemBrowser({ tableName, keySchema }: ItemBrowserProps) {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewerDialog, setShowViewerDialog] = useState(false);
  
  const { data, isLoading, error, refetch } = useDynamoDBItems(tableName);
  const deleteItem = useDeleteItem();

  const getItemKey = (item: Record<string, any>) => {
    const key: Record<string, any> = {};
    keySchema?.forEach((k) => {
      if (item[k.attributeName] !== undefined) {
        key[k.attributeName] = item[k.attributeName];
      }
    });
    return key;
  };

  const handleDelete = (item: Record<string, any>) => {
    const key = getItemKey(item);
    deleteItem.mutate({ tableName, key });
  };

  const handleEdit = (item: Record<string, any>) => {
    setSelectedItem(item);
    setShowEditDialog(true);
  };

  const handleView = (item: Record<string, any>) => {
    setSelectedItem(item);
    setShowViewerDialog(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Failed to load items: {error.message}</p>
        <Button onClick={() => refetch()} variant="outline" className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  const items = data?.items || [];
  const itemCount = data?.count || 0;
  const scannedCount = data?.scannedCount || 0;

  // Get all unique keys from items
  const allKeys = new Set<string>();
  items.forEach((item: Record<string, any>) => {
    Object.keys(item).forEach((key) => allKeys.add(key));
  });
  const sortedKeys = Array.from(allKeys).sort();

  // Move key attributes to the front
  const keyAttributeNames = keySchema?.map((k) => k.attributeName) || [];
  const orderedKeys = [
    ...keyAttributeNames,
    ...sortedKeys.filter((k) => !keyAttributeNames.includes(k)),
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Showing {itemCount} items{' '}
            {scannedCount > itemCount && `(scanned ${scannedCount})`}
          </p>
          {data?.lastEvaluatedKey && (
            <p className="text-xs text-muted-foreground">
              More items available - implement pagination
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateDialog(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <FileJson className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No items found</h3>
          <p className="text-muted-foreground">Add your first item to this table.</p>
        </div>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {orderedKeys.map((key) => (
                  <TableHead key={key}>
                    {key}
                    {keyAttributeNames.includes(key) && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        Key
                      </Badge>
                    )}
                  </TableHead>
                ))}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item: Record<string, any>, index: number) => (
                <TableRow
                  key={index}
                  className="cursor-pointer"
                  onClick={() => handleView(item)}
                >
                  {orderedKeys.map((key) => (
                    <TableCell key={key} className="max-w-[200px] truncate">
                      {item[key] !== undefined ? (
                        typeof item[key] === 'object' ? (
                          <Badge variant="secondary">
                            {Array.isArray(item[key]) ? 'List' : 'Map'}
                          </Badge>
                        ) : (
                          String(item[key])
                        )
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  ))}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(item);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => e.stopPropagation()}
                            disabled={deleteItem.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Item</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this item? This action cannot be
                              undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(item)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ItemFormDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        tableName={tableName}
        keySchema={keySchema}
        mode="create"
      />

      <ItemFormDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        tableName={tableName}
        keySchema={keySchema}
        mode="edit"
        item={selectedItem}
      />

      <ItemViewerDialog
        open={showViewerDialog}
        onOpenChange={setShowViewerDialog}
        item={selectedItem}
      />
    </div>
  );
}