"use client";

import React, { useState } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { MoreHorizontal, Search, FileText, Clock, Link } from "lucide-react";
import { formatDistanceToNow } from "@/lib/utils";
import { useIAMPolicies } from "@/hooks/use-iam";
import type { IAMPolicy } from "@/types";

interface PolicyListProps {
  onViewPolicy: (policyArn: string) => void;
  onCreatePolicy: () => void;
  onDeletePolicy: (policyArn: string) => void;
}

export function PolicyList({
  onViewPolicy,
  onCreatePolicy,
  onDeletePolicy,
}: PolicyListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [scope, setScope] = useState<"All" | "AWS" | "Local">("All");
  const { data: policies, isLoading, error } = useIAMPolicies(scope);

  const filteredPolicies = policies?.filter((policy: IAMPolicy) => {
    const query = searchQuery.toLowerCase();
    return (
      policy.policyName.toLowerCase().includes(query) ||
      policy.arn.toLowerCase().includes(query) ||
      policy.description?.toLowerCase().includes(query)
    );
  });

  const isAWSManaged = (arn: string) => {
    return arn.includes(":aws:policy/");
  };

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-800">
          Error loading policies: {(error as Error).message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search policies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select
          value={scope}
          onValueChange={(value) => setScope(value as "All" | "AWS" | "Local")}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Policies</SelectItem>
            <SelectItem value="AWS">AWS Managed</SelectItem>
            <SelectItem value="Local">Customer Managed</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={onCreatePolicy}>
          <FileText className="mr-2 h-4 w-4" />
          Create Policy
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Policy Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Attached To</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-48" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-8" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredPolicies?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground"
                >
                  No policies found
                </TableCell>
              </TableRow>
            ) : (
              filteredPolicies?.map((policy: IAMPolicy) => {
                const isAwsManaged = isAWSManaged(policy.arn);
                return (
                  <TableRow
                    key={policy.arn}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => onViewPolicy(policy.arn)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p>{policy.policyName}</p>
                          <code className="text-xs text-muted-foreground">
                            {policy.arn}
                          </code>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={isAwsManaged ? "secondary" : "default"}>
                        {isAwsManaged ? "AWS Managed" : "Customer"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground line-clamp-1">
                        {policy.description || "No description"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1">
                        <Link className="h-3 w-3" />
                        {policy.attachmentCount || 0}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span className="text-xs">
                          {formatDistanceToNow(new Date(policy.updateDate))} ago
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          asChild
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewPolicy(policy.arn);
                            }}
                          >
                            View Details
                          </DropdownMenuItem>
                          {!isAwsManaged && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeletePolicy(policy.arn);
                              }}
                              className="text-red-600"
                            >
                              Delete Policy
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
