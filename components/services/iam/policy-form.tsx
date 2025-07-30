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
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, X, Info, FileText } from 'lucide-react';
import { useCreateIAMPolicy } from '@/hooks/use-iam';
import { PolicyEditor } from './policy-editor';

interface PolicyFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Tag {
  key: string;
  value: string;
}

const POLICY_TEMPLATES = {
  s3ReadOnly: {
    name: 'S3 Read Only',
    description: 'Provides read-only access to all S3 buckets',
    policy: {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Action: [
            's3:GetObject',
            's3:ListBucket',
            's3:ListAllMyBuckets',
            's3:GetBucketLocation'
          ],
          Resource: '*'
        }
      ]
    }
  },
  s3FullAccess: {
    name: 'S3 Full Access',
    description: 'Provides full access to all S3 buckets',
    policy: {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Action: 's3:*',
          Resource: '*'
        }
      ]
    }
  },
  lambdaBasicExecution: {
    name: 'Lambda Basic Execution',
    description: 'Basic execution role for Lambda functions',
    policy: {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Action: [
            'logs:CreateLogGroup',
            'logs:CreateLogStream',
            'logs:PutLogEvents'
          ],
          Resource: 'arn:aws:logs:*:*:*'
        }
      ]
    }
  },
  dynamoDBReadOnly: {
    name: 'DynamoDB Read Only',
    description: 'Provides read-only access to DynamoDB',
    policy: {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Action: [
            'dynamodb:GetItem',
            'dynamodb:Query',
            'dynamodb:Scan',
            'dynamodb:DescribeTable',
            'dynamodb:ListTables'
          ],
          Resource: '*'
        }
      ]
    }
  },
  custom: {
    name: 'Custom Policy',
    description: 'Create a custom policy',
    policy: null
  }
};

export function PolicyForm({ open, onOpenChange }: PolicyFormProps) {
  const [policyName, setPolicyName] = useState('');
  const [description, setDescription] = useState('');
  const [path, setPath] = useState('/');
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTagKey, setNewTagKey] = useState('');
  const [newTagValue, setNewTagValue] = useState('');
  const [policyTemplate, setPolicyTemplate] = useState('custom');
  const [policyDocument, setPolicyDocument] = useState('');
  const [error, setError] = useState('');

  const createMutation = useCreateIAMPolicy();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!policyName) {
      setError('Policy name is required');
      return;
    }

    if (!/^[\w+=,.@-]+$/.test(policyName)) {
      setError('Policy name can only contain alphanumeric characters and +=,.@-');
      return;
    }

    if (!policyDocument) {
      setError('Policy document is required');
      return;
    }

    try {
      JSON.parse(policyDocument);
    } catch (e) {
      setError('Invalid JSON in policy document');
      return;
    }

    try {
      await createMutation.mutateAsync({
        policyName,
        policyDocument,
        path,
        description: description || undefined,
        tags: tags.length > 0 ? tags : undefined,
      });
      resetForm();
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const resetForm = () => {
    setPolicyName('');
    setDescription('');
    setPath('/');
    setTags([]);
    setNewTagKey('');
    setNewTagValue('');
    setPolicyTemplate('custom');
    setPolicyDocument('');
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

  const handleTemplateChange = (template: string) => {
    setPolicyTemplate(template);
    const selectedTemplate = POLICY_TEMPLATES[template as keyof typeof POLICY_TEMPLATES];
    if (selectedTemplate.policy) {
      setPolicyDocument(JSON.stringify(selectedTemplate.policy, null, 2));
      setDescription(selectedTemplate.description);
    } else {
      setPolicyDocument('');
      setDescription('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Create IAM Policy
            </DialogTitle>
            <DialogDescription>
              Create a new IAM policy to define permissions for users and roles.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="policyName">Policy Name</Label>
              <Input
                id="policyName"
                value={policyName}
                onChange={(e) => setPolicyName(e.target.value)}
                placeholder="my-custom-policy"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Can contain alphanumeric characters and +=,.@-
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this policy allows"
                rows={2}
              />
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
                Path for organizing policies (e.g., /custom-policies/)
              </p>
            </div>

            <div className="space-y-2">
              <Label>Policy Template</Label>
              <RadioGroup value={policyTemplate} onValueChange={handleTemplateChange}>
                {Object.entries(POLICY_TEMPLATES).map(([key, template]) => (
                  <div key={key} className="flex items-start space-x-2">
                    <RadioGroupItem value={key} id={key} className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor={key} className="font-normal cursor-pointer">
                        {template.name}
                      </Label>
                      {template.description && (
                        <p className="text-xs text-muted-foreground">{template.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <PolicyEditor
              initialValue={policyDocument}
              onSave={setPolicyDocument}
              className="mt-4"
            />

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
                After creating the policy, you can attach it to users, groups, or roles
                to grant the specified permissions.
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
              {createMutation.isPending ? 'Creating...' : 'Create Policy'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}