'use client';

import { useState } from 'react';
import { useCreateQueue } from '@/hooks/use-sqs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';

interface CreateQueueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateQueueDialog({ open, onOpenChange }: CreateQueueDialogProps) {
  const [queueName, setQueueName] = useState('');
  const [queueType, setQueueType] = useState<'standard' | 'fifo'>('standard');
  const [contentBasedDeduplication, setContentBasedDeduplication] = useState(false);
  const createQueue = useCreateQueue();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queueName.trim()) return;

    const attributes: Record<string, string> = {};
    
    if (queueType === 'fifo') {
      attributes.FifoQueue = 'true';
      if (contentBasedDeduplication) {
        attributes.ContentBasedDeduplication = 'true';
      }
    }

    await createQueue.mutateAsync({
      queueName: queueType === 'fifo' && !queueName.endsWith('.fifo') 
        ? `${queueName}.fifo` 
        : queueName,
      attributes,
    });

    setQueueName('');
    setQueueType('standard');
    setContentBasedDeduplication(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Queue</DialogTitle>
            <DialogDescription>
              Create a new SQS queue with custom configuration
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="queueName">Queue Name</Label>
              <Input
                id="queueName"
                value={queueName}
                onChange={(e) => setQueueName(e.target.value)}
                placeholder="my-queue"
                required
              />
              {queueType === 'fifo' && !queueName.endsWith('.fifo') && queueName && (
                <p className="text-sm text-muted-foreground">
                  Will be created as: {queueName}.fifo
                </p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="queueType">Queue Type</Label>
              <Select value={queueType} onValueChange={(value: 'standard' | 'fifo') => setQueueType(value)}>
                <SelectTrigger id="queueType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="fifo">FIFO</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {queueType === 'fifo' && (
              <div className="flex items-center justify-between">
                <Label htmlFor="deduplication" className="flex-1">
                  Content-Based Deduplication
                  <p className="text-sm font-normal text-muted-foreground">
                    Automatically deduplicate messages based on content
                  </p>
                </Label>
                <Switch
                  id="deduplication"
                  checked={contentBasedDeduplication}
                  onCheckedChange={setContentBasedDeduplication}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createQueue.isPending}>
              {createQueue.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Queue
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}