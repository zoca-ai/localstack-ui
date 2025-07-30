'use client';

import { useState } from 'react';
import { useCreateRestApi } from '@/hooks/use-apigateway';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

export function CreateApiDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [endpointType, setEndpointType] = useState<'REGIONAL' | 'EDGE' | 'PRIVATE'>('REGIONAL');
  const [apiKeySource, setApiKeySource] = useState<'HEADER' | 'AUTHORIZER'>('HEADER');
  const createApi = useCreateRestApi();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name) {
      toast.error('API name is required');
      return;
    }

    try {
      await createApi.mutateAsync({
        name,
        description: description || undefined,
        endpointConfiguration: {
          types: [endpointType],
        },
        apiKeySource,
      });
      
      toast.success(`API "${name}" created successfully`);
      setOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(`Failed to create API: ${error.message}`);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setEndpointType('REGIONAL');
    setApiKeySource('HEADER');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create API
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create REST API</DialogTitle>
            <DialogDescription>
              Create a new REST API in API Gateway.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="My API"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="API for managing resources"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="endpointType">Endpoint Type</Label>
              <Select value={endpointType} onValueChange={(value) => setEndpointType(value as 'REGIONAL' | 'EDGE' | 'PRIVATE')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="REGIONAL">
                    Regional - For clients in the same region
                  </SelectItem>
                  <SelectItem value="EDGE">
                    Edge - For geographically distributed clients
                  </SelectItem>
                  <SelectItem value="PRIVATE">
                    Private - For clients within a VPC
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="apiKeySource">API Key Source</Label>
              <Select value={apiKeySource} onValueChange={(value) => setApiKeySource(value as 'HEADER' | 'AUTHORIZER')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HEADER">
                    Header - API key in request header
                  </SelectItem>
                  <SelectItem value="AUTHORIZER">
                    Authorizer - API key from Lambda authorizer
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createApi.isPending}>
              {createApi.isPending ? 'Creating...' : 'Create API'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}