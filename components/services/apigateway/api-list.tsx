'use client';

import { useState } from 'react';
import { useRestApis, useDeleteRestApi } from '@/hooks/use-apigateway';
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
import { Search, Trash2, Globe, Shield, Zap } from 'lucide-react';
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
import { CreateApiDialog } from './create-api-dialog';
import { ApiViewer } from './api-viewer';

export function ApiList() {
  const { data: apis, isLoading, error } = useRestApis();
  const deleteApi = useDeleteRestApi();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApi, setSelectedApi] = useState<string | null>(null);
  const [apiToDelete, setApiToDelete] = useState<{ id: string; name: string } | null>(null);

  const filteredApis = apis?.filter(api =>
    api.name?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleDelete = async () => {
    if (!apiToDelete) return;

    try {
      await deleteApi.mutateAsync(apiToDelete.id);
      toast.success(`API "${apiToDelete.name}" deleted successfully`);
      setApiToDelete(null);
    } catch (error: any) {
      toast.error(`Failed to delete API: ${error.message}`);
    }
  };

  const getEndpointIcon = (endpointType?: string) => {
    if (endpointType?.includes('EDGE')) {
      return <Zap className="h-4 w-4 text-yellow-500" />;
    } else if (endpointType?.includes('PRIVATE')) {
      return <Shield className="h-4 w-4 text-blue-500" />;
    } else {
      return <Globe className="h-4 w-4 text-green-500" />;
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
        Error loading APIs: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search APIs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <CreateApiDialog />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Endpoint Type</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Version</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredApis.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No APIs found
                </TableCell>
              </TableRow>
            ) : (
              filteredApis.map((api) => (
                <TableRow
                  key={api.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedApi(api.id || null)}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      {api.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">
                      {api.id}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getEndpointIcon(api.endpointConfiguration?.types?.[0])}
                      <Badge variant="outline">
                        {api.endpointConfiguration?.types?.[0] || 'REGIONAL'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    {api.createdDate
                      ? new Date(api.createdDate).toLocaleString()
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {api.version || '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setApiToDelete({
                          id: api.id || '',
                          name: api.name || 'Unnamed API'
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

      {selectedApi && (
        <ApiViewer
          apiId={selectedApi}
          open={!!selectedApi}
          onOpenChange={(open) => !open && setSelectedApi(null)}
        />
      )}

      <AlertDialog open={!!apiToDelete} onOpenChange={(open) => !open && setApiToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete API</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the API "{apiToDelete?.name}"? 
              This will delete all resources, methods, and deployments. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete API
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}