'use client';

import { useState } from 'react';
import { useLambdaFunctions } from '@/hooks/use-lambda';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap, Search, Timer, Memory, Code2, AlertCircle } from 'lucide-react';
import { formatDistanceToNow, formatBytes } from '@/lib/utils';
import { LambdaFunction } from '@/types';

interface FunctionListProps {
  onViewFunction: (func: LambdaFunction) => void;
}

const runtimeColors: Record<string, string> = {
  'nodejs': 'bg-green-500/10 text-green-700 border-green-300',
  'python': 'bg-blue-500/10 text-blue-700 border-blue-300',
  'java': 'bg-orange-500/10 text-orange-700 border-orange-300',
  'go': 'bg-cyan-500/10 text-cyan-700 border-cyan-300',
  'ruby': 'bg-red-500/10 text-red-700 border-red-300',
  'dotnet': 'bg-purple-500/10 text-purple-700 border-purple-300',
  'provided': 'bg-gray-500/10 text-gray-700 border-gray-300',
};

const stateColors: Record<string, string> = {
  'Active': 'default',
  'Pending': 'secondary',
  'Inactive': 'outline',
  'Failed': 'destructive',
};

export function FunctionList({ onViewFunction }: FunctionListProps) {
  const { data: functions, isLoading } = useLambdaFunctions();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFunctions = functions?.filter(func =>
    func.functionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    func.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    func.runtime?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const getRuntimeColor = (runtime?: string) => {
    if (!runtime) return '';
    const key = Object.keys(runtimeColors).find(k => runtime.toLowerCase().includes(k));
    return key ? runtimeColors[key] : runtimeColors.provided;
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search functions by name, description, or runtime..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {filteredFunctions.length === 0 ? (
        <div className="text-center py-12">
          <Zap className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {searchQuery ? 'No functions found matching your search' : 'No Lambda functions found'}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Deploy a function to see it here
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Function Name</TableHead>
              <TableHead>Runtime</TableHead>
              <TableHead>State</TableHead>
              <TableHead>Memory</TableHead>
              <TableHead>Timeout</TableHead>
              <TableHead>Last Modified</TableHead>
              <TableHead className="text-right">Code Size</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFunctions.map((func) => (
              <TableRow 
                key={func.functionName}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onViewFunction(func)}
              >
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-muted-foreground" />
                      <span>{func.functionName}</span>
                    </div>
                    {func.description && (
                      <span className="text-xs text-muted-foreground mt-1">
                        {func.description}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {func.runtime && (
                    <Badge 
                      variant="outline" 
                      className={`font-mono text-xs ${getRuntimeColor(func.runtime)}`}
                    >
                      {func.runtime}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={stateColors[func.state || 'Active'] as any}>
                    {func.state || 'Active'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <Memory className="h-3 w-3 text-muted-foreground" />
                    <span>{func.memorySize || 128} MB</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <Timer className="h-3 w-3 text-muted-foreground" />
                    <span>{func.timeout || 3}s</span>
                  </div>
                </TableCell>
                <TableCell>
                  {func.lastModified
                    ? formatDistanceToNow(new Date(func.lastModified)) + ' ago'
                    : '-'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1 text-sm">
                    <Code2 className="h-3 w-3 text-muted-foreground" />
                    <span>{formatBytes(func.codeSize || 0)}</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );
}