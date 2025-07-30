'use client';

import { useState } from 'react';
import { Search, RefreshCw, BarChart3 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCloudWatchMetrics } from '@/hooks/use-cloudwatch';
import type { CloudWatchMetric } from '@/types';

interface MetricsListProps {
  onSelectMetric: (metric: CloudWatchMetric) => void;
}

export function MetricsList({ onSelectMetric }: MetricsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [namespaceFilter, setNamespaceFilter] = useState<string>('all');
  
  const { data: metrics, isLoading, refetch } = useCloudWatchMetrics({
    namespace: namespaceFilter !== 'all' ? namespaceFilter : undefined,
  });

  const namespaces = [...new Set(metrics?.map(m => m.namespace).filter(Boolean) || [])];

  const filteredMetrics = metrics?.filter(metric =>
    metric.metricName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    metric.namespace?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search metrics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={namespaceFilter} onValueChange={setNamespaceFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Namespaces</SelectItem>
            {namespaces.map((ns) => (
              <SelectItem key={ns} value={ns}>
                {ns}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => refetch()} variant="outline" size="icon">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Metric Name</TableHead>
              <TableHead>Namespace</TableHead>
              <TableHead>Dimensions</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMetrics?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No metrics found
                </TableCell>
              </TableRow>
            ) : (
              filteredMetrics?.map((metric, index) => (
                <TableRow
                  key={`${metric.namespace}-${metric.metricName}-${index}`}
                  className="cursor-pointer"
                  onClick={() => onSelectMetric(metric)}
                >
                  <TableCell className="font-medium">
                    {metric.metricName}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{metric.namespace}</Badge>
                  </TableCell>
                  <TableCell>
                    {metric.dimensions && metric.dimensions.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {metric.dimensions.map((dim, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {dim.name}: {dim.value}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectMetric(metric);
                      }}
                    >
                      <BarChart3 className="h-4 w-4" />
                    </Button>
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