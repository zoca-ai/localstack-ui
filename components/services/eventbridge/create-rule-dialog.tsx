"use client";

import { useState } from "react";
import { useCreateEventRule } from "@/hooks/use-eventbridge";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Plus } from "lucide-react";

interface CreateRuleDialogProps {
  eventBusName?: string;
}

export function CreateRuleDialog({
  eventBusName = "default",
}: CreateRuleDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [ruleType, setRuleType] = useState<"event" | "schedule">("event");
  const [eventPattern, setEventPattern] = useState("");
  const [scheduleExpression, setScheduleExpression] = useState("");
  const [state, setState] = useState<"ENABLED" | "DISABLED">("ENABLED");
  const createRule = useCreateEventRule();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name) {
      toast.error("Rule name is required");
      return;
    }

    if (ruleType === "event" && !eventPattern) {
      toast.error("Event pattern is required for event rules");
      return;
    }

    if (ruleType === "schedule" && !scheduleExpression) {
      toast.error("Schedule expression is required for scheduled rules");
      return;
    }

    try {
      await createRule.mutateAsync({
        name,
        description: description || undefined,
        eventPattern: ruleType === "event" ? eventPattern : undefined,
        scheduleExpression:
          ruleType === "schedule" ? scheduleExpression : undefined,
        state,
        eventBusName,
      });

      toast.success(`Rule "${name}" created successfully`);
      setOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(`Failed to create rule: ${error.message}`);
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setRuleType("event");
    setEventPattern("");
    setScheduleExpression("");
    setState("ENABLED");
  };

  const sampleEventPattern = `{
  "source": ["my.app"],
  "detail-type": ["User Action"],
  "detail": {
    "action": ["login", "logout"]
  }
}`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Rule
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Rule</DialogTitle>
            <DialogDescription>
              Create a new rule to match events or run on a schedule.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="my-event-rule"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Rule to process user events"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>

            <div className="grid gap-2">
              <Label>Rule Type</Label>
              <RadioGroup
                value={ruleType}
                onValueChange={(value) =>
                  setRuleType(value as "event" | "schedule")
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="event" id="event" />
                  <Label htmlFor="event">Event Pattern</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="schedule" id="schedule" />
                  <Label htmlFor="schedule">Schedule</Label>
                </div>
              </RadioGroup>
            </div>

            {ruleType === "event" && (
              <div className="grid gap-2">
                <Label htmlFor="eventPattern">Event Pattern (JSON)</Label>
                <Textarea
                  id="eventPattern"
                  placeholder={sampleEventPattern}
                  value={eventPattern}
                  onChange={(e) => setEventPattern(e.target.value)}
                  rows={6}
                  className="font-mono text-sm"
                />
              </div>
            )}

            {ruleType === "schedule" && (
              <div className="grid gap-2">
                <Label htmlFor="scheduleExpression">Schedule Expression</Label>
                <Input
                  id="scheduleExpression"
                  placeholder="rate(5 minutes) or cron(0 12 * * ? *)"
                  value={scheduleExpression}
                  onChange={(e) => setScheduleExpression(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Use rate() for simple intervals or cron() for complex
                  schedules
                </p>
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
            <Button type="submit" disabled={createRule.isPending}>
              {createRule.isPending ? "Creating..." : "Create Rule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
