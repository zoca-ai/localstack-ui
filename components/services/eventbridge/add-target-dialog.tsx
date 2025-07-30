'use client';

import { useState } from 'react';
import { useAddEventTargets } from '@/hooks/use-eventbridge';
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

interface AddTargetDialogProps {
  ruleName: string;
  eventBusName?: string;
}

export function AddTargetDialog({ ruleName, eventBusName = 'default' }: AddTargetDialogProps) {
  const [open, setOpen] = useState(false);
  const [targetId, setTargetId] = useState('');
  const [targetArn, setTargetArn] = useState('');
  const [roleArn, setRoleArn] = useState('');
  const [input, setInput] = useState('');
  const addTargets = useAddEventTargets();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!targetId || !targetArn) {
      toast.error('Target ID and ARN are required');
      return;
    }

    // Validate JSON input if provided
    if (input) {
      try {
        JSON.parse(input);
      } catch {
        toast.error('Invalid JSON in input field');
        return;
      }
    }

    try {
      await addTargets.mutateAsync({
        rule: ruleName,
        eventBusName,
        targets: [{
          id: targetId,
          arn: targetArn,
          roleArn: roleArn || undefined,
          input: input || undefined,
        }],
      });
      
      toast.success('Target added successfully');
      setOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(`Failed to add target: ${error.message}`);
    }
  };

  const resetForm = () => {
    setTargetId('');
    setTargetArn('');
    setRoleArn('');
    setInput('');
  };

  const generateTargetId = () => {
    setTargetId(`target-${Date.now()}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Target
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Target</DialogTitle>
            <DialogDescription>
              Add a target to receive events matching this rule.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="targetId">Target ID</Label>
              <div className="flex gap-2">
                <Input
                  id="targetId"
                  placeholder="unique-target-id"
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  required
                />
                <Button type="button" variant="outline" onClick={generateTargetId}>
                  Generate
                </Button>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="targetArn">Target ARN</Label>
              <Input
                id="targetArn"
                placeholder="arn:aws:lambda:region:account:function:name"
                value={targetArn}
                onChange={(e) => setTargetArn(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                ARN of the Lambda function, SNS topic, SQS queue, etc.
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="roleArn">IAM Role ARN (optional)</Label>
              <Input
                id="roleArn"
                placeholder="arn:aws:iam::account:role/role-name"
                value={roleArn}
                onChange={(e) => setRoleArn(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Required for some target types
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="input">Custom Input (optional, JSON)</Label>
              <Textarea
                id="input"
                placeholder='{"key": "value"}'
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={4}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Static JSON to send to the target instead of the matched event
              </p>
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
            <Button type="submit" disabled={addTargets.isPending}>
              {addTargets.isPending ? 'Adding...' : 'Add Target'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}