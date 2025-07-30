'use client';

import { useState, useEffect } from 'react';
import { usePutItem } from '@/hooks/use-dynamodb';
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
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface ItemFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tableName: string;
  keySchema?: Array<{
    attributeName: string;
    keyType: 'HASH' | 'RANGE';
  }>;
  mode: 'create' | 'edit';
  item?: any;
}

export function ItemFormDialog({
  open,
  onOpenChange,
  tableName,
  keySchema,
  mode,
  item,
}: ItemFormDialogProps) {
  const [jsonInput, setJsonInput] = useState('{}');
  const [jsonError, setJsonError] = useState('');
  const putItem = usePutItem();

  useEffect(() => {
    if (mode === 'edit' && item) {
      setJsonInput(JSON.stringify(item, null, 2));
    } else if (mode === 'create') {
      // Pre-populate with key attributes
      const template: Record<string, any> = {};
      keySchema?.forEach((key) => {
        template[key.attributeName] = '';
      });
      setJsonInput(JSON.stringify(template, null, 2));
    }
  }, [mode, item, keySchema]);

  const validateJson = (value: string) => {
    try {
      JSON.parse(value);
      setJsonError('');
      return true;
    } catch (e) {
      setJsonError('Invalid JSON format');
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateJson(jsonInput)) {
      return;
    }

    try {
      const itemData = JSON.parse(jsonInput);

      // Validate that key attributes are present
      const missingKeys = keySchema?.filter(
        (key) => !itemData[key.attributeName]
      );
      if (missingKeys && missingKeys.length > 0) {
        setJsonError(
          `Missing required key attributes: ${missingKeys
            .map((k) => k.attributeName)
            .join(', ')}`
        );
        return;
      }

      putItem.mutate(
        { tableName, item: itemData },
        {
          onSuccess: () => {
            onOpenChange(false);
            setJsonInput('{}');
            setJsonError('');
          },
        }
      );
    } catch (error) {
      setJsonError('Failed to parse JSON');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {mode === 'create' ? 'Create Item' : 'Edit Item'}
            </DialogTitle>
            <DialogDescription>
              {mode === 'create'
                ? 'Add a new item to the DynamoDB table.'
                : 'Modify the existing item in the DynamoDB table.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Enter the item data as JSON. Key attributes are required:
                {keySchema?.map((key) => (
                  <span key={key.attributeName} className="font-mono mx-1">
                    {key.attributeName}
                  </span>
                ))}
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="json">Item Data (JSON)</Label>
              <Textarea
                id="json"
                value={jsonInput}
                onChange={(e) => {
                  setJsonInput(e.target.value);
                  validateJson(e.target.value);
                }}
                placeholder='{"id": "123", "name": "Example Item"}'
                className="font-mono min-h-[300px]"
                required
              />
              {jsonError && (
                <p className="text-sm text-destructive">{jsonError}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={putItem.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!!jsonError || putItem.isPending}
            >
              {putItem.isPending
                ? mode === 'create'
                  ? 'Creating...'
                  : 'Updating...'
                : mode === 'create'
                ? 'Create Item'
                : 'Update Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}