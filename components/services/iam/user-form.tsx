'use client';

import React, { useState } from 'react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Info } from 'lucide-react';
import { useCreateIAMUser } from '@/hooks/use-iam';

interface UserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Tag {
  key: string;
  value: string;
}

export function UserForm({ open, onOpenChange }: UserFormProps) {
  const [userName, setUserName] = useState('');
  const [path, setPath] = useState('/');
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTagKey, setNewTagKey] = useState('');
  const [newTagValue, setNewTagValue] = useState('');
  const [error, setError] = useState('');

  const createMutation = useCreateIAMUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!userName) {
      setError('User name is required');
      return;
    }

    if (!/^[\w+=,.@-]+$/.test(userName)) {
      setError('User name can only contain alphanumeric characters and +=,.@-');
      return;
    }

    try {
      await createMutation.mutateAsync({
        userName,
        path,
        tags: tags.length > 0 ? tags : undefined,
      });
      resetForm();
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const resetForm = () => {
    setUserName('');
    setPath('/');
    setTags([]);
    setNewTagKey('');
    setNewTagValue('');
    setError('');
  };

  const addTag = () => {
    if (newTagKey && newTagValue) {
      if (tags.some(tag => tag.key === newTagKey)) {
        setError('Tag key already exists');
        return;
      }
      setTags([...tags, { key: newTagKey, value: newTagValue }]);
      setNewTagKey('');
      setNewTagValue('');
      setError('');
    }
  };

  const removeTag = (key: string) => {
    setTags(tags.filter(tag => tag.key !== key));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create IAM User</DialogTitle>
            <DialogDescription>
              Create a new IAM user to manage access to AWS services.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="userName">User Name</Label>
              <Input
                id="userName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="my-user"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Can contain alphanumeric characters and +=,.@-
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="path">Path (Optional)</Label>
              <Input
                id="path"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                placeholder="/"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Path for organizing users (e.g., /developers/)
              </p>
            </div>

            <div className="space-y-2">
              <Label>Tags (Optional)</Label>
              <div className="space-y-2">
                {tags.map((tag) => (
                  <div key={tag.key} className="flex items-center gap-2">
                    <Badge variant="secondary" className="flex-1">
                      {tag.key}: {tag.value}
                    </Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removeTag(tag.key)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    placeholder="Key"
                    value={newTagKey}
                    onChange={(e) => setNewTagKey(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Input
                    placeholder="Value"
                    value={newTagValue}
                    onChange={(e) => setNewTagValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={addTag}
                    disabled={!newTagKey || !newTagValue}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                After creating the user, you can attach policies, add them to groups,
                and create access keys for programmatic access.
              </AlertDescription>
            </Alert>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}