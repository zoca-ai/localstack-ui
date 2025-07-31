"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, X, Info, ShieldCheck } from "lucide-react";
import { useCreateIAMRole } from "@/hooks/use-iam";
import { PolicyEditor } from "./policy-editor";

interface RoleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Tag {
  key: string;
  value: string;
}

const TRUST_POLICY_TEMPLATES = {
  ec2: {
    name: "EC2 Service",
    policy: {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: {
            Service: "ec2.amazonaws.com",
          },
          Action: "sts:AssumeRole",
        },
      ],
    },
  },
  lambda: {
    name: "Lambda Service",
    policy: {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: {
            Service: "lambda.amazonaws.com",
          },
          Action: "sts:AssumeRole",
        },
      ],
    },
  },
  user: {
    name: "IAM User",
    policy: {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: {
            AWS: "arn:aws:iam::000000000000:root",
          },
          Action: "sts:AssumeRole",
        },
      ],
    },
  },
  custom: {
    name: "Custom",
    policy: null,
  },
};

export function RoleForm({ open, onOpenChange }: RoleFormProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");
  const [path, setPath] = useState("/");
  const [maxSessionDuration, setMaxSessionDuration] = useState("3600");
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTagKey, setNewTagKey] = useState("");
  const [newTagValue, setNewTagValue] = useState("");
  const [trustPolicyType, setTrustPolicyType] = useState("ec2");
  const [trustPolicy, setTrustPolicy] = useState(
    JSON.stringify(TRUST_POLICY_TEMPLATES.ec2.policy, null, 2),
  );
  const [error, setError] = useState("");

  const createMutation = useCreateIAMRole();

  const handleSubmit = async () => {
    setError("");

    if (!roleName) {
      setError("Role name is required");
      return;
    }

    if (!/^[\w+=,.@-]+$/.test(roleName)) {
      setError("Role name can only contain alphanumeric characters and +=,.@-");
      return;
    }

    if (!trustPolicy) {
      setError("Trust policy is required");
      return;
    }

    try {
      JSON.parse(trustPolicy);
    } catch (e) {
      setError("Invalid JSON in trust policy");
      return;
    }

    const duration = parseInt(maxSessionDuration);
    if (isNaN(duration) || duration < 3600 || duration > 43200) {
      setError("Max session duration must be between 1 and 12 hours");
      return;
    }

    try {
      await createMutation.mutateAsync({
        roleName,
        assumeRolePolicyDocument: trustPolicy,
        path,
        description: description || undefined,
        maxSessionDuration: duration,
        tags: tags.length > 0 ? tags : undefined,
      });
      resetForm();
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const resetForm = () => {
    setActiveTab("basic");
    setRoleName("");
    setDescription("");
    setPath("/");
    setMaxSessionDuration("3600");
    setTags([]);
    setNewTagKey("");
    setNewTagValue("");
    setTrustPolicyType("ec2");
    setTrustPolicy(JSON.stringify(TRUST_POLICY_TEMPLATES.ec2.policy, null, 2));
    setError("");
  };

  const addTag = () => {
    if (newTagKey && newTagValue) {
      if (tags.some((tag) => tag.key === newTagKey)) {
        setError("Tag key already exists");
        return;
      }
      setTags([...tags, { key: newTagKey, value: newTagValue }]);
      setNewTagKey("");
      setNewTagValue("");
      setError("");
    }
  };

  const removeTag = (key: string) => {
    setTags(tags.filter((tag) => tag.key !== key));
  };

  const handleTrustPolicyTypeChange = (type: string) => {
    setTrustPolicyType(type);
    if (
      type !== "custom" &&
      TRUST_POLICY_TEMPLATES[type as keyof typeof TRUST_POLICY_TEMPLATES].policy
    ) {
      setTrustPolicy(
        JSON.stringify(
          TRUST_POLICY_TEMPLATES[type as keyof typeof TRUST_POLICY_TEMPLATES]
            .policy,
          null,
          2,
        ),
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Create IAM Role
          </DialogTitle>
          <DialogDescription>
            Create a new IAM role to delegate permissions to AWS services or
            users.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="trust">Trust Policy</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="roleName">Role Name</Label>
              <Input
                id="roleName"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="my-service-role"
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
                placeholder="Describe the purpose of this role"
                rows={3}
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
                Path for organizing roles (e.g., /service-roles/)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxSession">Max Session Duration (seconds)</Label>
              <Input
                id="maxSession"
                type="number"
                value={maxSessionDuration}
                onChange={(e) => setMaxSessionDuration(e.target.value)}
                min="3600"
                max="43200"
              />
              <p className="text-xs text-muted-foreground">
                Between 1 hour (3600) and 12 hours (43200)
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
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addTag())
                    }
                  />
                  <Input
                    placeholder="Value"
                    value={newTagValue}
                    onChange={(e) => setNewTagValue(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addTag())
                    }
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
          </TabsContent>

          <TabsContent value="trust" className="space-y-4">
            <div className="space-y-2">
              <Label>Trust Policy Type</Label>
              <RadioGroup
                value={trustPolicyType}
                onValueChange={handleTrustPolicyTypeChange}
              >
                {Object.entries(TRUST_POLICY_TEMPLATES).map(
                  ([key, template]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <RadioGroupItem value={key} id={key} />
                      <Label
                        htmlFor={key}
                        className="font-normal cursor-pointer"
                      >
                        {template.name}
                      </Label>
                    </div>
                  ),
                )}
              </RadioGroup>
            </div>

            <PolicyEditor
              initialValue={trustPolicy}
              onSave={setTrustPolicy}
              className="mt-4"
            />

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                The trust policy defines which entities can assume this role.
                After creating the role, you can attach permission policies.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              resetForm();
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={createMutation.isPending}>
            {createMutation.isPending ? "Creating..." : "Create Role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
