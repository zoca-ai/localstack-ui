'use client';

import { useState } from 'react';
import { useCreateEventBus } from '@/hooks/use-eventbridge';
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
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

export function CreateBusDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [kmsKeyId, setKmsKeyId] = useState('');
  const createBus = useCreateEventBus();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name) {
      toast.error('Bus name is required');
      return;
    }

    try {
      await createBus.mutateAsync({
        name,
        description: description || undefined,
        kmsKeyId: kmsKeyId || undefined,
      });
      
      toast.success(`Event bus "${name}" created successfully`);
      setOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(`Failed to create event bus: ${error.message}`);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setKmsKeyId('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Event Bus
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Event Bus</DialogTitle>
            <DialogDescription>
              Create a new EventBridge event bus for routing events.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="my-event-bus"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Event bus for application events"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="kmsKeyId">KMS Key ID (optional)</Label>
              <Input
                id="kmsKeyId"
                placeholder="arn:aws:kms:region:account:key/..."
                value={kmsKeyId}
                onChange={(e) => setKmsKeyId(e.target.value)}
              />
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
            <Button type="submit" disabled={createBus.isPending}>
              {createBus.isPending ? 'Creating...' : 'Create Bus'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}