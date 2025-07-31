"use client";

import { useState } from "react";
import { useCreateSchedule } from "@/hooks/use-scheduler";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus } from "lucide-react";

interface CreateScheduleDialogProps {
  groupName?: string;
}

export function CreateScheduleDialog({
  groupName = "default",
}: CreateScheduleDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [scheduleExpression, setScheduleExpression] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [targetArn, setTargetArn] = useState("");
  const [targetRoleArn, setTargetRoleArn] = useState("");
  const [targetInput, setTargetInput] = useState("");
  const [state, setState] = useState<"ENABLED" | "DISABLED">("ENABLED");
  const [flexibleWindow, setFlexibleWindow] = useState<"OFF" | "FLEXIBLE">(
    "OFF",
  );
  const [windowMinutes, setWindowMinutes] = useState("15");
  const createSchedule = useCreateSchedule();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !scheduleExpression || !targetArn || !targetRoleArn) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate JSON input if provided
    if (targetInput) {
      try {
        JSON.parse(targetInput);
      } catch {
        toast.error("Invalid JSON in target input field");
        return;
      }
    }

    try {
      await createSchedule.mutateAsync({
        name,
        groupName,
        description: description || undefined,
        scheduleExpression,
        scheduleExpressionTimezone: timezone,
        state,
        target: {
          arn: targetArn,
          roleArn: targetRoleArn,
          input: targetInput || undefined,
        },
        flexibleTimeWindow: {
          mode: flexibleWindow,
          maximumWindowInMinutes:
            flexibleWindow === "FLEXIBLE" ? parseInt(windowMinutes) : undefined,
        },
      });

      toast.success(`Schedule "${name}" created successfully`);
      setOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(`Failed to create schedule: ${error.message}`);
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setScheduleExpression("");
    setTimezone("UTC");
    setTargetArn("");
    setTargetRoleArn("");
    setTargetInput("");
    setState("ENABLED");
    setFlexibleWindow("OFF");
    setWindowMinutes("15");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Schedule
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Schedule</DialogTitle>
            <DialogDescription>
              Create a new scheduled task to run at specific times or intervals.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="my-scheduled-task"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Schedule to process daily reports"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="scheduleExpression">Schedule Expression *</Label>
              <Input
                id="scheduleExpression"
                placeholder="rate(30 minutes) or cron(0 12 * * ? *)"
                value={scheduleExpression}
                onChange={(e) => setScheduleExpression(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Use rate() for intervals or cron() for specific times
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">
                    America/New_York
                  </SelectItem>
                  <SelectItem value="America/Los_Angeles">
                    America/Los_Angeles
                  </SelectItem>
                  <SelectItem value="Europe/London">Europe/London</SelectItem>
                  <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="targetArn">Target ARN *</Label>
              <Input
                id="targetArn"
                placeholder="arn:aws:lambda:region:account:function:name"
                value={targetArn}
                onChange={(e) => setTargetArn(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                ARN of the Lambda function, SQS queue, etc.
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="targetRoleArn">Target Role ARN *</Label>
              <Input
                id="targetRoleArn"
                placeholder="arn:aws:iam::account:role/role-name"
                value={targetRoleArn}
                onChange={(e) => setTargetRoleArn(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="targetInput">Target Input (JSON)</Label>
              <Textarea
                id="targetInput"
                placeholder='{"key": "value"}'
                value={targetInput}
                onChange={(e) => setTargetInput(e.target.value)}
                rows={3}
                className="font-mono text-sm"
              />
            </div>

            <div className="grid gap-2">
              <Label>Flexible Time Window</Label>
              <Select
                value={flexibleWindow}
                onValueChange={(value) =>
                  setFlexibleWindow(value as "OFF" | "FLEXIBLE")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OFF">Off - Run at exact time</SelectItem>
                  <SelectItem value="FLEXIBLE">
                    Flexible - Run within window
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {flexibleWindow === "FLEXIBLE" && (
              <div className="grid gap-2">
                <Label htmlFor="windowMinutes">Window Duration (minutes)</Label>
                <Input
                  id="windowMinutes"
                  type="number"
                  min="1"
                  max="1440"
                  value={windowMinutes}
                  onChange={(e) => setWindowMinutes(e.target.value)}
                />
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="state">Initial State</Label>
              <Select
                value={state}
                onValueChange={(value) =>
                  setState(value as "ENABLED" | "DISABLED")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ENABLED">Enabled</SelectItem>
                  <SelectItem value="DISABLED">Disabled</SelectItem>
                </SelectContent>
              </Select>
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
            <Button type="submit" disabled={createSchedule.isPending}>
              {createSchedule.isPending ? "Creating..." : "Create Schedule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
