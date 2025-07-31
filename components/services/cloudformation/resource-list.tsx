"use client";

import { useStackResources } from "@/hooks/use-cloudformation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Package,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
} from "lucide-react";

interface ResourceListProps {
  stackName: string;
}

export function ResourceList({ stackName }: ResourceListProps) {
  const {
    data: resources,
    isLoading,
    error,
  } = useStackResources(stackName, true);

  const getStatusIcon = (status: string) => {
    if (status.includes("COMPLETE") && !status.includes("FAILED")) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (status.includes("IN_PROGRESS")) {
      return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />;
    } else if (status.includes("FAILED") || status.includes("DELETE")) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    } else {
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusVariant = (
    status: string,
  ): "default" | "secondary" | "destructive" | "outline" => {
    if (status.includes("COMPLETE") && !status.includes("FAILED")) {
      return "default";
    } else if (status.includes("IN_PROGRESS")) {
      return "secondary";
    } else if (status.includes("FAILED") || status.includes("DELETE")) {
      return "destructive";
    } else {
      return "outline";
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
      <div className="text-red-500">
        Error loading resources: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Package className="h-4 w-4" />
        <h3 className="text-sm font-semibold">
          Resources ({resources?.length || 0})
        </h3>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Logical ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Physical ID</TableHead>
              <TableHead>Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!resources || resources.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground"
                >
                  No resources in this stack
                </TableCell>
              </TableRow>
            ) : (
              resources.map((resource) => (
                <TableRow key={resource.logicalResourceId}>
                  <TableCell className="font-medium">
                    {resource.logicalResourceId}
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">
                      {resource.resourceType}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(resource.resourceStatus)}
                      <Badge
                        variant={getStatusVariant(resource.resourceStatus)}
                      >
                        {resource.resourceStatus}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {resource.physicalResourceId || "-"}
                  </TableCell>
                  <TableCell>
                    {resource.timestamp
                      ? new Date(resource.timestamp).toLocaleString()
                      : "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
