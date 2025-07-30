'use client';

import { useState } from 'react';
import { useCreateTable } from '@/hooks/use-dynamodb';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Trash2, AlertCircle } from 'lucide-react';

interface CreateTableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface AttributeDefinition {
  attributeName: string;
  attributeType: 'S' | 'N' | 'B';
}

interface KeySchemaElement {
  attributeName: string;
  keyType: 'HASH' | 'RANGE';
}

export function CreateTableDialog({ open, onOpenChange }: CreateTableDialogProps) {
  const [tableName, setTableName] = useState('');
  const [billingMode, setBillingMode] = useState<'PAY_PER_REQUEST' | 'PROVISIONED'>(
    'PAY_PER_REQUEST'
  );
  const [readCapacity, setReadCapacity] = useState('5');
  const [writeCapacity, setWriteCapacity] = useState('5');
  const [attributes, setAttributes] = useState<AttributeDefinition[]>([
    { attributeName: '', attributeType: 'S' },
  ]);
  const [partitionKey, setPartitionKey] = useState('');
  const [sortKey, setSortKey] = useState('');

  const createTable = useCreateTable();

  const handleAddAttribute = () => {
    setAttributes([...attributes, { attributeName: '', attributeType: 'S' }]);
  };

  const handleRemoveAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  const handleAttributeChange = (
    index: number,
    field: keyof AttributeDefinition,
    value: string
  ) => {
    const newAttributes = [...attributes];
    newAttributes[index] = { ...newAttributes[index], [field]: value };
    setAttributes(newAttributes);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Filter out empty attributes
    const validAttributes = attributes.filter((attr) => attr.attributeName);

    // Build key schema
    const keySchema: KeySchemaElement[] = [
      { attributeName: partitionKey, keyType: 'HASH' },
    ];
    if (sortKey) {
      keySchema.push({ attributeName: sortKey, keyType: 'RANGE' });
    }

    // Ensure key attributes are in attribute definitions
    const keyAttributeNames = keySchema.map((k) => k.attributeName);
    const definedAttributeNames = validAttributes.map((a) => a.attributeName);
    const missingKeyAttributes = keyAttributeNames.filter(
      (name) => !definedAttributeNames.includes(name)
    );

    if (missingKeyAttributes.length > 0) {
      // Add missing key attributes with default type 'S'
      missingKeyAttributes.forEach((name) => {
        validAttributes.push({ attributeName: name, attributeType: 'S' });
      });
    }

    const tableConfig: any = {
      tableName,
      attributeDefinitions: validAttributes,
      keySchema,
      billingMode,
    };

    if (billingMode === 'PROVISIONED') {
      tableConfig.provisionedThroughput = {
        readCapacityUnits: parseInt(readCapacity),
        writeCapacityUnits: parseInt(writeCapacity),
      };
    }

    createTable.mutate(tableConfig, {
      onSuccess: () => {
        onOpenChange(false);
        resetForm();
      },
    });
  };

  const resetForm = () => {
    setTableName('');
    setBillingMode('PAY_PER_REQUEST');
    setReadCapacity('5');
    setWriteCapacity('5');
    setAttributes([{ attributeName: '', attributeType: 'S' }]);
    setPartitionKey('');
    setSortKey('');
  };

  const isValid = tableName && partitionKey;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create DynamoDB Table</DialogTitle>
            <DialogDescription>
              Create a new DynamoDB table with primary key configuration.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tableName">Table Name</Label>
              <Input
                id="tableName"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                placeholder="my-table"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Primary Key</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="partitionKey" className="text-sm text-muted-foreground">
                    Partition Key (Required)
                  </Label>
                  <Input
                    id="partitionKey"
                    value={partitionKey}
                    onChange={(e) => setPartitionKey(e.target.value)}
                    placeholder="id"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="sortKey" className="text-sm text-muted-foreground">
                    Sort Key (Optional)
                  </Label>
                  <Input
                    id="sortKey"
                    value={sortKey}
                    onChange={(e) => setSortKey(e.target.value)}
                    placeholder="timestamp"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Attribute Definitions</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddAttribute}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Attribute
                </Button>
              </div>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Define attributes that will be used in indexes. Key attributes will be added
                  automatically.
                </AlertDescription>
              </Alert>
              <div className="space-y-2">
                {attributes.map((attr, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={attr.attributeName}
                      onChange={(e) =>
                        handleAttributeChange(index, 'attributeName', e.target.value)
                      }
                      placeholder="Attribute name"
                      className="flex-1"
                    />
                    <Select
                      value={attr.attributeType}
                      onValueChange={(value) =>
                        handleAttributeChange(index, 'attributeType', value as any)
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="S">String</SelectItem>
                        <SelectItem value="N">Number</SelectItem>
                        <SelectItem value="B">Binary</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveAttribute(index)}
                      disabled={attributes.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Billing Mode</Label>
              <RadioGroup value={billingMode} onValueChange={setBillingMode as any}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="PAY_PER_REQUEST" id="on-demand" />
                  <Label htmlFor="on-demand" className="font-normal">
                    On-Demand (Pay per request)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="PROVISIONED" id="provisioned" />
                  <Label htmlFor="provisioned" className="font-normal">
                    Provisioned (Fixed capacity)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {billingMode === 'PROVISIONED' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="readCapacity">Read Capacity Units</Label>
                  <Input
                    id="readCapacity"
                    type="number"
                    min="1"
                    value={readCapacity}
                    onChange={(e) => setReadCapacity(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="writeCapacity">Write Capacity Units</Label>
                  <Input
                    id="writeCapacity"
                    type="number"
                    min="1"
                    value={writeCapacity}
                    onChange={(e) => setWriteCapacity(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createTable.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid || createTable.isPending}>
              {createTable.isPending ? 'Creating...' : 'Create Table'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}