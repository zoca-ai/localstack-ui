"use client";

import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { Search, Download, RefreshCw, Play, Pause } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCloudWatchLogEvents } from "@/hooks/use-cloudwatch";

interface LogViewerProps {
  logGroupName: string;
  logStreamName: string;
}

export function LogViewer({ logGroupName, logStreamName }: LogViewerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isTailing, setIsTailing] = useState(false);
  const [timeRange, setTimeRange] = useState("1h");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const shouldAutoScroll = useRef(true);

  const getTimeRange = () => {
    const now = Date.now();
    const ranges: Record<string, number> = {
      "5m": 5 * 60 * 1000,
      "15m": 15 * 60 * 1000,
      "30m": 30 * 60 * 1000,
      "1h": 60 * 60 * 1000,
      "3h": 3 * 60 * 60 * 1000,
      "6h": 6 * 60 * 60 * 1000,
      "12h": 12 * 60 * 60 * 1000,
      "1d": 24 * 60 * 60 * 1000,
      "3d": 3 * 24 * 60 * 60 * 1000,
      "7d": 7 * 24 * 60 * 60 * 1000,
    };
    return {
      startTime: now - (ranges[timeRange] || ranges["1h"]),
      endTime: now,
    };
  };

  const { startTime, endTime } = getTimeRange();

  const {
    data: logEvents,
    isLoading,
    refetch,
  } = useCloudWatchLogEvents(
    logGroupName,
    logStreamName,
    {
      startTime,
      endTime,
      limit: 1000,
      startFromHead: !isTailing,
    },
    true,
  );

  const filteredEvents = logEvents?.filter((event) =>
    event.message.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  useEffect(() => {
    if (shouldAutoScroll.current && scrollAreaRef.current && isTailing) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]",
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [filteredEvents, isTailing]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const isAtBottom =
      target.scrollTop + target.clientHeight >= target.scrollHeight - 10;
    shouldAutoScroll.current = isAtBottom;
  };

  const downloadLogs = () => {
    if (!filteredEvents) return;

    const content = filteredEvents
      .map(
        (event) =>
          `${format(new Date(event.timestamp), "yyyy-MM-dd HH:mm:ss.SSS")} ${event.message}`,
      )
      .join("\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${logGroupName}-${logStreamName}-${Date.now()}.log`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getLogLevelBadge = (message: string) => {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes("error") || lowerMessage.includes("fatal")) {
      return <Badge variant="destructive">ERROR</Badge>;
    }
    if (lowerMessage.includes("warn")) {
      return <Badge variant="secondary">WARN</Badge>;
    }
    if (lowerMessage.includes("info")) {
      return <Badge>INFO</Badge>;
    }
    if (lowerMessage.includes("debug")) {
      return <Badge variant="outline">DEBUG</Badge>;
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5m">Last 5 min</SelectItem>
            <SelectItem value="15m">Last 15 min</SelectItem>
            <SelectItem value="30m">Last 30 min</SelectItem>
            <SelectItem value="1h">Last 1 hour</SelectItem>
            <SelectItem value="3h">Last 3 hours</SelectItem>
            <SelectItem value="6h">Last 6 hours</SelectItem>
            <SelectItem value="12h">Last 12 hours</SelectItem>
            <SelectItem value="1d">Last 1 day</SelectItem>
            <SelectItem value="3d">Last 3 days</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => refetch()} variant="outline" size="icon">
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => setIsTailing(!isTailing)}
          variant={isTailing ? "default" : "outline"}
          size="icon"
        >
          {isTailing ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
        <Button onClick={downloadLogs} variant="outline" size="icon">
          <Download className="h-4 w-4" />
        </Button>
      </div>

      <div className="rounded-md border bg-muted/20">
        <ScrollArea
          ref={scrollAreaRef}
          className="h-[600px] w-full"
          onScroll={handleScroll}
        >
          <div className="p-4 font-mono text-sm">
            {filteredEvents?.length === 0 ? (
              <div className="text-center text-muted-foreground">
                No log events found
              </div>
            ) : (
              <div className="space-y-1">
                {filteredEvents?.map((event, index) => (
                  <div
                    key={`${event.timestamp}-${index}`}
                    className="flex items-start gap-2 hover:bg-muted/50 rounded px-2 py-1"
                  >
                    <span className="text-muted-foreground whitespace-nowrap">
                      {format(new Date(event.timestamp), "HH:mm:ss.SSS")}
                    </span>
                    {getLogLevelBadge(event.message)}
                    <span className="flex-1 whitespace-pre-wrap break-all">
                      {event.message}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {isTailing && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
          Live tail is active
        </div>
      )}
    </div>
  );
}
