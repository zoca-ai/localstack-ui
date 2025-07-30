'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCreateSecret, useUpdateSecretValue, useSecret } from '@/hooks/use-secrets-manager';
import { Secret } from '@/types';
import { Plus, X, Copy, Check, AlertCircle, Save, Edit3 } from 'lucide-react';
import { formatDistanceToNow } from '@/lib/utils';

const secretSchema = z.object({
  name: z
    .string()
    .min(1, 'Secret name is required')
    .regex(
      /^[a-zA-Z0-9/_+=.@-]+$/,
      'Secret name can only contain alphanumeric characters and /_+=.@-'
    ),
  description: z.string().optional(),
  secretValue: z.string().min(1, 'Secret value is required'),
});

type SecretFormValues = z.infer<typeof secretSchema>;

interface SecretDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  secret: Secret | null;
  mode: 'create' | 'view' | 'edit';
}

export function SecretDialog({
  open,
  onOpenChange,
  secret,
  mode: initialMode,
}: SecretDialogProps) {
  const createSecret = useCreateSecret();
  const updateSecretValue = useUpdateSecretValue();
  const [mode, setMode] = useState(initialMode);
  const [copied, setCopied] = useState(false);
  const [tags, setTags] = useState<Record<string, string>>({});
  const [newTagKey, setNewTagKey] = useState('');
  const [newTagValue, setNewTagValue] = useState('');
  const [valueType, setValueType] = useState<'plaintext' | 'json'>('plaintext');
  const [keyValuePairs, setKeyValuePairs] = useState<Array<{ key: string; value: string }>>([
    { key: '', value: '' }
  ]);
  const [isJsonObject, setIsJsonObject] = useState(false);

  const form = useForm<SecretFormValues>({
    resolver: zodResolver(secretSchema),
    defaultValues: {
      name: '',
      description: '',
      secretValue: '',
    },
  });

  const isEditing = mode === 'edit';
  const isViewing = mode === 'view';
  const isCreating = mode === 'create';

  // Fetch existing secret value when viewing or editing
  const { data: secretData, isLoading: isLoadingSecret } = useSecret(
    secret?.name || null,
    (isViewing || isEditing) && open
  );

  // Update mode when prop changes
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // Parse key-value pairs from plaintext or JSON
  const parseKeyValuePairs = (text: string): Array<{ key: string; value: string }> => {
    // First try to parse as JSON
    try {
      const jsonObj = JSON.parse(text);
      // If it's an object (not array), convert to key-value pairs
      if (typeof jsonObj === 'object' && !Array.isArray(jsonObj) && jsonObj !== null) {
        const pairs = Object.entries(jsonObj).map(([key, value]) => ({
          key,
          value: typeof value === 'string' ? value : JSON.stringify(value)
        }));
        return pairs.length > 0 ? pairs : [{ key: '', value: '' }];
      }
    } catch {
      // Not JSON, parse as plaintext key=value format
    }

    // Parse as plaintext key=value format
    const lines = text.split('\n').filter(line => line.trim());
    const pairs = lines.map(line => {
      const [key, ...valueParts] = line.split('=');
      return {
        key: key?.trim() || '',
        value: valueParts.join('=').trim() || ''
      };
    });
    return pairs.length > 0 ? pairs : [{ key: '', value: '' }];
  };

  // Convert key-value pairs to plaintext
  const keyValuePairsToText = (pairs: Array<{ key: string; value: string }>): string => {
    return pairs
      .filter(pair => pair.key)
      .map(pair => `${pair.key}=${pair.value}`)
      .join('\n');
  };

  // Update form and detect type when secret data is loaded
  useEffect(() => {
    if ((isViewing || isEditing) && secretData?.value?.secretString && open) {
      const secretValue = secretData.value.secretString;
      form.setValue('secretValue', secretValue);
      
      // Detect if it's JSON
      try {
        const parsed = JSON.parse(secretValue);
        const isObj = typeof parsed === 'object' && !Array.isArray(parsed) && parsed !== null;
        setIsJsonObject(isObj);
        setValueType('json');
        // Parse key-value pairs for both JSON objects and plaintext
        setKeyValuePairs(parseKeyValuePairs(secretValue));
      } catch {
        setIsJsonObject(false);
        setValueType('plaintext');
        // Parse key-value pairs for plaintext
        setKeyValuePairs(parseKeyValuePairs(secretValue));
      }
    }
  }, [isViewing, isEditing, secretData, open, form]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      form.reset({
        name: '',
        description: '',
        secretValue: '',
      });
      setTags({});
      setValueType('plaintext');
      setKeyValuePairs([{ key: '', value: '' }]);
      setCopied(false);
      setIsJsonObject(false);
    } else if (secret) {
      // When opening with a secret, set the form values
      form.reset({
        name: secret.name,
        description: secret.description || '',
        secretValue: '', // This will be populated when the secret value loads
      });
      setTags(secret.tags || {});
    }
  }, [open, form, secret]);

  const onSubmit = async (values: SecretFormValues) => {
    try {
      let secretString = values.secretValue;
      
      // For plaintext table mode, check if we should convert to JSON
      if (valueType === 'plaintext' && keyValuePairs.length > 0) {
        if (isJsonObject) {
          // Convert key-value pairs back to JSON object
          const jsonObj: Record<string, any> = {};
          keyValuePairs.forEach(pair => {
            if (pair.key) {
              // Try to parse value as JSON first (for nested objects/arrays)
              try {
                jsonObj[pair.key] = JSON.parse(pair.value);
              } catch {
                // If not valid JSON, treat as string
                jsonObj[pair.key] = pair.value;
              }
            }
          });
          secretString = JSON.stringify(jsonObj, null, 2);
        } else {
          // Keep as plaintext key=value format
          secretString = keyValuePairsToText(keyValuePairs);
        }
      }
      
      // Validate JSON if needed
      if (valueType === 'json') {
        try {
          JSON.parse(secretString);
        } catch {
          form.setError('secretValue', {
            type: 'manual',
            message: 'Invalid JSON format',
          });
          return;
        }
      }

      if (isEditing && secret) {
        await updateSecretValue.mutateAsync({
          secretId: secret.name,
          secretString,
        });
      } else {
        await createSecret.mutateAsync({
          name: values.name,
          description: values.description,
          secretString,
          tags: Object.keys(tags).length > 0 ? tags : undefined,
        });
      }

      onOpenChange(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const addTag = () => {
    if (newTagKey && newTagValue) {
      setTags({ ...tags, [newTagKey]: newTagValue });
      setNewTagKey('');
      setNewTagValue('');
    }
  };

  const removeTag = (key: string) => {
    const newTags = { ...tags };
    delete newTags[key];
    setTags(newTags);
  };

  const formatJSON = () => {
    try {
      const parsed = JSON.parse(form.getValues('secretValue'));
      form.setValue('secretValue', JSON.stringify(parsed, null, 2));
    } catch {
      // Invalid JSON, do nothing
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const addKeyValuePair = () => {
    setKeyValuePairs([...keyValuePairs, { key: '', value: '' }]);
  };

  const updateKeyValuePair = (index: number, field: 'key' | 'value', value: string) => {
    const newPairs = [...keyValuePairs];
    newPairs[index][field] = value;
    setKeyValuePairs(newPairs);
    
    // Update form value
    const textValue = keyValuePairsToText(newPairs);
    form.setValue('secretValue', textValue);
  };

  const removeKeyValuePair = (index: number) => {
    const newPairs = keyValuePairs.filter((_, i) => i !== index);
    setKeyValuePairs(newPairs.length > 0 ? newPairs : [{ key: '', value: '' }]);
    
    // Update form value
    const textValue = keyValuePairsToText(newPairs);
    form.setValue('secretValue', textValue);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isCreating && 'Create New Secret'}
            {isViewing && `Secret: ${secret?.name}`}
            {isEditing && `Edit Secret: ${secret?.name}`}
          </DialogTitle>
          <DialogDescription>
            {isCreating && 'Create a new secret in AWS Secrets Manager.'}
            {isViewing && (secret?.description || 'View secret details and value.')}
            {isEditing && 'Update the secret value. This will create a new version.'}
          </DialogDescription>
        </DialogHeader>

        {/* Metadata for viewing mode */}
        {isViewing && secret && (
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-4 rounded-lg border p-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="text-sm font-medium">
                  {secret.createdDate
                    ? formatDistanceToNow(new Date(secret.createdDate)) + ' ago'
                    : 'Unknown'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Last Modified</p>
                <p className="text-sm font-medium">
                  {secret.lastChangedDate
                    ? formatDistanceToNow(new Date(secret.lastChangedDate)) + ' ago'
                    : 'Never'}
                </p>
              </div>
            </div>

            {secret.tags && Object.keys(secret.tags).length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(secret.tags).map(([key, value]) => (
                    <Badge key={key} variant="secondary" className="font-normal">
                      <span className="font-medium">{key}:</span> {value}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {isCreating && (
              <>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Secret Name</FormLabel>
                      <FormControl>
                        <Input placeholder="my-secret-name" {...field} />
                      </FormControl>
                      <FormDescription>
                        Must be unique within your AWS account and region
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Database credentials for production"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <FormLabel>Secret Value</FormLabel>
                {isViewing && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setMode('edit')}
                  >
                    <Edit3 className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                )}
              </div>

              {isLoadingSecret ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-[200px] w-full" />
                </div>
              ) : (
                <Tabs value={valueType} onValueChange={(v) => setValueType(v as 'plaintext' | 'json')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="plaintext">Plaintext</TabsTrigger>
                    <TabsTrigger value="json">JSON</TabsTrigger>
                  </TabsList>
                  <TabsContent value="plaintext" className="mt-3">
                    {isViewing ? (
                      <div className="relative">
                        {secretData?.value?.secretString ? (
                          (() => {
                            // Try to parse as JSON and display as table
                            try {
                              const jsonObj = JSON.parse(secretData.value.secretString);
                              if (typeof jsonObj === 'object' && !Array.isArray(jsonObj) && jsonObj !== null) {
                                // Display as table for JSON objects
                                return (
                                  <div className="space-y-3">
                                    <div className="rounded-lg border">
                                      <table className="w-full">
                                        <thead>
                                          <tr className="border-b bg-muted/50">
                                            <th className="text-left p-3 font-medium">Key</th>
                                            <th className="text-left p-3 font-medium">Value</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {Object.entries(jsonObj).map(([key, value]) => (
                                            <tr key={key} className="border-b last:border-0">
                                              <td className="p-3 font-mono text-sm">{key}</td>
                                              <td className="p-3 font-mono text-sm">
                                                {typeof value === 'string' ? value : JSON.stringify(value)}
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="secondary"
                                      size="sm"
                                      onClick={() => copyToClipboard(secretData.value.secretString!)}
                                      className="w-full"
                                    >
                                      {copied ? (
                                        <>
                                          <Check className="mr-2 h-3 w-3" />
                                          Copied JSON
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="mr-2 h-3 w-3" />
                                          Copy JSON
                                        </>
                                      )}
                                    </Button>
                                  </div>
                                );
                              }
                            } catch {
                              // Not JSON, display as plaintext
                            }
                            
                            // Display as plaintext if not a JSON object
                            return (
                              <>
                                <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-[400px] text-sm font-mono whitespace-pre-wrap break-words">
                                  <code>{secretData.value.secretString}</code>
                                </pre>
                                <Button
                                  type="button"
                                  variant="secondary"
                                  size="sm"
                                  className="absolute top-2 right-2"
                                  onClick={() => copyToClipboard(secretData.value.secretString!)}
                                >
                                  {copied ? (
                                    <>
                                      <Check className="mr-2 h-3 w-3" />
                                      Copied
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="mr-2 h-3 w-3" />
                                      Copy
                                    </>
                                  )}
                                </Button>
                              </>
                            );
                          })()
                        ) : (
                          <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-[400px] text-sm font-mono whitespace-pre-wrap break-words">
                            <code>No secret value</code>
                          </pre>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="rounded-lg border">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b bg-muted/50">
                                <th className="text-left p-2 font-medium">Key</th>
                                <th className="text-left p-2 font-medium">Value</th>
                                <th className="w-10"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {keyValuePairs.map((pair, index) => (
                                <tr key={index} className="border-b last:border-0">
                                  <td className="p-2">
                                    <Input
                                      placeholder="KEY_NAME"
                                      value={pair.key}
                                      onChange={(e) => updateKeyValuePair(index, 'key', e.target.value)}
                                      className="font-mono text-sm"
                                    />
                                  </td>
                                  <td className="p-2">
                                    <Input
                                      placeholder="value"
                                      value={pair.value}
                                      onChange={(e) => updateKeyValuePair(index, 'value', e.target.value)}
                                      className="font-mono text-sm"
                                    />
                                  </td>
                                  <td className="p-2">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => removeKeyValuePair(index)}
                                      disabled={keyValuePairs.length === 1}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addKeyValuePair}
                          className="w-full"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Key-Value Pair
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="json" className="mt-3">
                    {isViewing ? (
                      <div className="relative">
                        <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-[400px] text-sm font-mono whitespace-pre-wrap break-words">
                          <code>
                            {(() => {
                                  try {
                                    return JSON.stringify(
                                      JSON.parse(secretData?.value?.secretString || '{}'),
                                      null,
                                      2
                                    );
                                  } catch {
                                    return secretData?.value?.secretString || 'Invalid JSON';
                                  }
                                })()}
                          </code>
                        </pre>
                        {secretData?.value?.secretString && (
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => copyToClipboard(secretData.value.secretString!)}
                          >
                            {copied ? (
                              <>
                                <Check className="mr-2 h-3 w-3" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="mr-2 h-3 w-3" />
                                Copy
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    ) : (
                      <FormField
                        control={form.control}
                        name="secretValue"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="space-y-2">
                                <Textarea
                                  placeholder='{"username": "admin", "password": "secret123"}'
                                  className="min-h-[200px] font-mono text-sm resize-y"
                                  {...field}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={formatJSON}
                                >
                                  Format JSON
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </TabsContent>
                </Tabs>
              )}
            </div>

            {isCreating && (
              <div className="space-y-2">
                <FormLabel>Tags (Optional)</FormLabel>
                <div className="flex gap-2">
                  <Input
                    placeholder="Key"
                    value={newTagKey}
                    onChange={(e) => setNewTagKey(e.target.value)}
                  />
                  <Input
                    placeholder="Value"
                    value={newTagValue}
                    onChange={(e) => setNewTagValue(e.target.value)}
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
                <div className="flex flex-wrap gap-2 mt-2">
                  {Object.entries(tags).map(([key, value]) => (
                    <Badge key={key} variant="secondary">
                      {key}: {value}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 ml-1"
                        onClick={() => removeTag(key)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <DialogFooter>
              {isViewing ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Close
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (isEditing) {
                        setMode('view');
                      } else {
                        onOpenChange(false);
                      }
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isEditing && isLoadingSecret}
                  >
                    {isEditing ? (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Update Secret
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Secret
                      </>
                    )}
                  </Button>
                </>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}