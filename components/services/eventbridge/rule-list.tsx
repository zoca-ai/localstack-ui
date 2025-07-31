"use client";

import { useState } from "react";
import {
  useEventRules,
  useDeleteEventRule,
  useToggleRuleState,
} from "@/hooks/use-eventbridge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Search, Trash2, FileCode, Clock } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CreateRuleDialog } from "./create-rule-dialog";
import { RuleViewer } from "./rule-viewer";

interface RuleListProps {
  eventBusName?: string;
}

export function RuleList({ eventBusName = "default" }: RuleListProps) {
  const { data: rules, isLoading, error } = useEventRules(eventBusName);
  const deleteRule = useDeleteEventRule();
  const toggleState = useToggleRuleState();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRule, setSelectedRule] = useState<string | null>(null);
  const [ruleToDelete, setRuleToDelete] = useState<string | null>(null);

  const filteredRules =
    rules?.filter((rule) =>
      rule.name?.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];

  const handleDelete = async () => {
    if (!ruleToDelete) return;

    try {
      await deleteRule.mutateAsync({ name: ruleToDelete, eventBusName });
      toast.success(`Rule "${ruleToDelete}" deleted successfully`);
      setRuleToDelete(null);
    } catch (error: any) {
      toast.error(`Failed to delete rule: ${error.message}`);
    }
  };

  const handleToggle = async (ruleName: string, currentState: string) => {
    try {
      const action = currentState === "ENABLED" ? "disable" : "enable";
      await toggleState.mutateAsync({ name: ruleName, eventBusName, action });
      toast.success(`Rule "${ruleName}" ${action}d successfully`);
    } catch (error: any) {
      toast.error(`Failed to toggle rule: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500">Error loading rules: {error.message}</div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search rules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <CreateRuleDialog eventBusName={eventBusName} />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>State</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRules.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground"
                >
                  No rules found
                </TableCell>
              </TableRow>
            ) : (
              filteredRules.map((rule) => (
                <TableRow
                  key={rule.name}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedRule(rule.name || null)}
                >
                  <TableCell className="font-medium">{rule.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {rule.eventPattern && (
                        <Badge variant="outline" className="gap-1">
                          <FileCode className="h-3 w-3" />
                          Event Pattern
                        </Badge>
                      )}
                      {rule.scheduleExpression && (
                        <Badge variant="outline" className="gap-1">
                          <Clock className="h-3 w-3" />
                          Schedule
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={rule.state === "ENABLED"}
                        onCheckedChange={(checked) => {
                          handleToggle(
                            rule.name || "",
                            rule.state || "DISABLED",
                          );
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Badge
                        variant={
                          rule.state === "ENABLED" ? "default" : "secondary"
                        }
                      >
                        {rule.state}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-md truncate">
                    {rule.description || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setRuleToDelete(rule.name || null);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedRule && (
        <RuleViewer
          ruleName={selectedRule}
          eventBusName={eventBusName}
          open={!!selectedRule}
          onOpenChange={(open) => !open && setSelectedRule(null)}
        />
      )}

      <AlertDialog
        open={!!ruleToDelete}
        onOpenChange={(open) => !open && setRuleToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Rule</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the rule "{ruleToDelete}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
