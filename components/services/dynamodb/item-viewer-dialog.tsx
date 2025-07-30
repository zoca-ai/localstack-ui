'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, FileJson } from 'lucide-react';
import { toast } from 'sonner';

interface ItemViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: any;
}

export function ItemViewerDialog({ open, onOpenChange, item }: ItemViewerDialogProps) {
  if (!item) return null;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(item, null, 2));
    toast.success('Copied to clipboard');
  };

  const renderValue = (value: any): React.ReactNode => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground">null</span>;
    }

    if (typeof value === 'boolean') {
      return <Badge variant={value ? 'default' : 'secondary'}>{String(value)}</Badge>;
    }

    if (typeof value === 'number') {
      return <Badge variant="outline">{value}</Badge>;
    }

    if (typeof value === 'string') {
      return <span className="break-all">{value}</span>;
    }

    if (Array.isArray(value)) {
      return (
        <div className="space-y-1">
          <Badge variant="secondary" className="mb-1">
            List ({value.length} items)
          </Badge>
          <div className="ml-4 space-y-1">
            {value.map((item, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="text-muted-foreground">[{index}]</span>
                <div className="flex-1">{renderValue(item)}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (typeof value === 'object') {
      const entries = Object.entries(value);
      return (
        <div className="space-y-1">
          <Badge variant="secondary" className="mb-1">
            Map ({entries.length} fields)
          </Badge>
          <div className="ml-4 space-y-1">
            {entries.map(([key, val]) => (
              <div key={key} className="flex items-start gap-2">
                <span className="font-medium text-muted-foreground min-w-[100px]">
                  {key}:
                </span>
                <div className="flex-1">{renderValue(val)}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return <span>{String(value)}</span>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileJson className="h-5 w-5" />
            Item Details
          </DialogTitle>
          <DialogDescription>
            View the complete item data in different formats
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="formatted" className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="formatted">Formatted</TabsTrigger>
              <TabsTrigger value="json">JSON</TabsTrigger>
            </TabsList>
            <Button variant="outline" size="sm" onClick={copyToClipboard}>
              <Copy className="h-4 w-4 mr-2" />
              Copy JSON
            </Button>
          </div>

          <TabsContent value="formatted" className="mt-0">
            <ScrollArea className="h-[400px] w-full rounded-md border p-4">
              <div className="space-y-3">
                {Object.entries(item).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <div className="font-semibold">{key}</div>
                    <div className="pl-4">{renderValue(value)}</div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="json" className="mt-0">
            <ScrollArea className="h-[400px] w-full rounded-md border">
              <pre className="p-4 text-sm">
                <code>{JSON.stringify(item, null, 2)}</code>
              </pre>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}