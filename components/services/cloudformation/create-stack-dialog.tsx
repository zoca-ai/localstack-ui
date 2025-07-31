"use client";

import { useState } from "react";
import { useCreateStack } from "@/hooks/use-cloudformation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Plus, Upload } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function CreateStackDialog() {
  const [open, setOpen] = useState(false);
  const [stackName, setStackName] = useState("");
  const [templateBody, setTemplateBody] = useState("");
  const [templateUrl, setTemplateUrl] = useState("");
  const [templateSource, setTemplateSource] = useState<"body" | "url">("body");
  const [capabilities, setCapabilities] = useState({
    CAPABILITY_IAM: false,
    CAPABILITY_NAMED_IAM: false,
    CAPABILITY_AUTO_EXPAND: false,
  });
  const [disableRollback, setDisableRollback] = useState(false);
  const createStack = useCreateStack();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stackName) {
      toast.error("Stack name is required");
      return;
    }

    if (templateSource === "body" && !templateBody) {
      toast.error("Template body is required");
      return;
    }

    if (templateSource === "url" && !templateUrl) {
      toast.error("Template URL is required");
      return;
    }

    // Validate JSON/YAML template if body is provided
    if (templateSource === "body") {
      try {
        // Try to parse as JSON first
        JSON.parse(templateBody);
      } catch {
        // If not JSON, assume it's YAML (we can't validate YAML in browser easily)
        // CloudFormation will validate it server-side
      }
    }

    const enabledCapabilities = Object.entries(capabilities)
      .filter(([_, enabled]) => enabled)
      .map(([capability]) => capability);

    try {
      await createStack.mutateAsync({
        stackName,
        templateBody: templateSource === "body" ? templateBody : undefined,
        templateURL: templateSource === "url" ? templateUrl : undefined,
        capabilities:
          enabledCapabilities.length > 0 ? enabledCapabilities : undefined,
        disableRollback,
      });

      toast.success(`Stack "${stackName}" creation initiated`);
      setOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(`Failed to create stack: ${error.message}`);
    }
  };

  const resetForm = () => {
    setStackName("");
    setTemplateBody("");
    setTemplateUrl("");
    setTemplateSource("body");
    setCapabilities({
      CAPABILITY_IAM: false,
      CAPABILITY_NAMED_IAM: false,
      CAPABILITY_AUTO_EXPAND: false,
    });
    setDisableRollback(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setTemplateBody(event.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const sampleTemplate = `{
  "AWSTemplateFormatVersion": "2010-09-09",
  "Description": "Sample CloudFormation Template",
  "Resources": {
    "MyBucket": {
      "Type": "AWS::S3::Bucket",
      "Properties": {
        "BucketName": "my-sample-bucket"
      }
    }
  }
}`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Stack
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Stack</DialogTitle>
            <DialogDescription>
              Deploy AWS resources using a CloudFormation template.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="stackName">Stack Name *</Label>
              <Input
                id="stackName"
                placeholder="my-stack"
                value={stackName}
                onChange={(e) => setStackName(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Must be unique within the region
              </p>
            </div>

            <Tabs
              value={templateSource}
              onValueChange={(value) =>
                setTemplateSource(value as "body" | "url")
              }
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="body">Template Body</TabsTrigger>
                <TabsTrigger value="url">Template URL</TabsTrigger>
              </TabsList>

              <TabsContent value="body" className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="templateBody">Template (JSON/YAML) *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      document.getElementById("file-upload")?.click()
                    }
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload File
                  </Button>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".json,.yaml,.yml,.template"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
                <Textarea
                  id="templateBody"
                  placeholder={sampleTemplate}
                  value={templateBody}
                  onChange={(e) => setTemplateBody(e.target.value)}
                  rows={12}
                  className="font-mono text-sm"
                />
              </TabsContent>

              <TabsContent value="url" className="space-y-2">
                <Label htmlFor="templateUrl">Template URL *</Label>
                <Input
                  id="templateUrl"
                  placeholder="https://s3.amazonaws.com/mybucket/mytemplate.json"
                  value={templateUrl}
                  onChange={(e) => setTemplateUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  URL to a template stored in S3
                </p>
              </TabsContent>
            </Tabs>

            <div className="space-y-2">
              <Label>Capabilities</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="cap-iam"
                    checked={capabilities.CAPABILITY_IAM}
                    onCheckedChange={(checked) =>
                      setCapabilities((prev) => ({
                        ...prev,
                        CAPABILITY_IAM: !!checked,
                      }))
                    }
                  />
                  <Label htmlFor="cap-iam" className="text-sm font-normal">
                    CAPABILITY_IAM - Allow creation of IAM resources
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="cap-named-iam"
                    checked={capabilities.CAPABILITY_NAMED_IAM}
                    onCheckedChange={(checked) =>
                      setCapabilities((prev) => ({
                        ...prev,
                        CAPABILITY_NAMED_IAM: !!checked,
                      }))
                    }
                  />
                  <Label
                    htmlFor="cap-named-iam"
                    className="text-sm font-normal"
                  >
                    CAPABILITY_NAMED_IAM - Allow creation of named IAM resources
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="cap-auto-expand"
                    checked={capabilities.CAPABILITY_AUTO_EXPAND}
                    onCheckedChange={(checked) =>
                      setCapabilities((prev) => ({
                        ...prev,
                        CAPABILITY_AUTO_EXPAND: !!checked,
                      }))
                    }
                  />
                  <Label
                    htmlFor="cap-auto-expand"
                    className="text-sm font-normal"
                  >
                    CAPABILITY_AUTO_EXPAND - Allow macros to expand
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="disable-rollback"
                checked={disableRollback}
                onCheckedChange={(checked) => setDisableRollback(!!checked)}
              />
              <Label htmlFor="disable-rollback" className="text-sm font-normal">
                Disable rollback on failure
              </Label>
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
            <Button type="submit" disabled={createStack.isPending}>
              {createStack.isPending ? "Creating..." : "Create Stack"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
