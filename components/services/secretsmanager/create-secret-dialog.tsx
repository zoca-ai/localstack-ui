"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCreateSecret,
  useUpdateSecretValue,
  useSecret,
} from "@/hooks/use-secrets-manager";
import { Secret } from "@/types";
import { Plus, X, Loader2 } from "lucide-react";

const secretSchema = z.object({
  name: z
    .string()
    .min(1, "Secret name is required")
    .regex(
      /^[a-zA-Z0-9/_+=.@-]+$/,
      "Secret name can only contain alphanumeric characters and /_+=.@-",
    ),
  description: z.string().optional(),
  secretValue: z.string().min(1, "Secret value is required"),
});

type SecretFormValues = z.infer<typeof secretSchema>;

interface CreateSecretDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingSecret?: Secret | null;
}

export function CreateSecretDialog({
  open,
  onOpenChange,
  editingSecret,
}: CreateSecretDialogProps) {
  const createSecret = useCreateSecret();
  const updateSecretValue = useUpdateSecretValue();
  const [tags, setTags] = useState<Record<string, string>>({});
  const [newTagKey, setNewTagKey] = useState("");
  const [newTagValue, setNewTagValue] = useState("");
  const [valueType, setValueType] = useState<"plaintext" | "json">("plaintext");

  const form = useForm<SecretFormValues>({
    resolver: zodResolver(secretSchema),
    defaultValues: {
      name: editingSecret?.name || "",
      description: editingSecret?.description || "",
      secretValue: "",
    },
  });

  const isEditing = !!editingSecret;

  // Fetch existing secret value when editing
  const { data: secretData, isLoading: isLoadingSecret } = useSecret(
    editingSecret?.name || null,
    isEditing && open,
  );

  // Update form when secret value is loaded
  useEffect(() => {
    if (isEditing && open) {
      if (secretData?.value?.secretString) {
        form.setValue("secretValue", secretData.value.secretString);
        // Detect if it's JSON
        try {
          JSON.parse(secretData.value.secretString);
          setValueType("json");
        } catch {
          setValueType("plaintext");
        }
      }
    }
  }, [isEditing, secretData, open, form]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      form.reset({
        name: "",
        description: "",
        secretValue: "",
      });
      setTags({});
      setValueType("plaintext");
    } else if (editingSecret) {
      // When opening for editing, set the form values
      form.reset({
        name: editingSecret.name,
        description: editingSecret.description || "",
        secretValue: "", // This will be populated when the secret value loads
      });
      setTags(editingSecret.tags || {});
    }
  }, [open, form, editingSecret]);

  const onSubmit = async (values: SecretFormValues) => {
    try {
      const secretString = values.secretValue;

      // Validate JSON if needed
      if (valueType === "json") {
        try {
          JSON.parse(secretString);
        } catch {
          form.setError("secretValue", {
            type: "manual",
            message: "Invalid JSON format",
          });
          return;
        }
      }

      if (isEditing) {
        await updateSecretValue.mutateAsync({
          secretId: editingSecret.name,
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
      setNewTagKey("");
      setNewTagValue("");
    }
  };

  const removeTag = (key: string) => {
    const newTags = { ...tags };
    delete newTags[key];
    setTags(newTags);
  };

  const formatJSON = () => {
    try {
      const parsed = JSON.parse(form.getValues("secretValue"));
      form.setValue("secretValue", JSON.stringify(parsed, null, 2));
    } catch {
      // Invalid JSON, do nothing
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Update Secret Value" : "Create New Secret"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the value of an existing secret. This will create a new version."
              : "Create a new secret in AWS Secrets Manager."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {!isEditing && (
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
              <FormLabel>Secret Value</FormLabel>
              {isEditing && isLoadingSecret ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-[150px] w-full" />
                </div>
              ) : (
                <Tabs
                  value={valueType}
                  onValueChange={(v) => setValueType(v as "plaintext" | "json")}
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="plaintext">Plaintext</TabsTrigger>
                    <TabsTrigger value="json">JSON</TabsTrigger>
                  </TabsList>
                  <TabsContent value="plaintext" className="mt-3">
                    <FormField
                      control={form.control}
                      name="secretValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              placeholder="Enter your secret value..."
                              className="min-h-[150px] font-mono text-sm resize-y"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  <TabsContent value="json" className="mt-3">
                    <FormField
                      control={form.control}
                      name="secretValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="space-y-2">
                              <Textarea
                                placeholder='{"username": "admin", "password": "secret123"}'
                                className="min-h-[150px] font-mono text-sm resize-y"
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
                  </TabsContent>
                </Tabs>
              )}
            </div>

            {!isEditing && (
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
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isEditing && isLoadingSecret}>
                {isEditing ? "Update Secret" : "Create Secret"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
