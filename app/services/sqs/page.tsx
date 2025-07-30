"use client";

import { useState } from "react";
import { ServicePageLayout } from "@/components/layout/service-page-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, RefreshCw, Info, Inbox, Send, Clock } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { QueueList } from "@/components/services/sqs/queue-list";
import { CreateQueueDialog } from "@/components/services/sqs/create-queue-dialog";
import { MessageViewer } from "@/components/services/sqs/message-viewer";
import { useSQSQueues } from "@/hooks/use-sqs";

export default function SQSPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedQueue, setSelectedQueue] = useState<{
    url: string;
    name: string;
  } | null>(null);
  const queryClient = useQueryClient();
  const { data: queues, isLoading } = useSQSQueues();

  const handleSelectQueue = (queueUrl: string, queueName: string) => {
    setSelectedQueue({ url: queueUrl, name: queueName });
  };

  const handleBackToList = () => {
    setSelectedQueue(null);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["sqs-queues"] });
  };

  // Calculate stats
  const totalQueues = queues?.length || 0;
  const standardQueues = queues?.filter(q => !q.queueName.endsWith('.fifo')).length || 0;
  const fifoQueues = queues?.filter(q => q.queueName.endsWith('.fifo')).length || 0;

  return (
    <ServicePageLayout
      title="SQS"
      description="Manage your SQS queues and messages"
      icon={MessageSquare}
      primaryAction={!selectedQueue ? {
        label: "Create Queue",
        icon: Plus,
        onClick: () => setShowCreateDialog(true),
      } : undefined}
      secondaryAction={{
        label: "Refresh",
        icon: RefreshCw,
        onClick: handleRefresh,
      }}
      stats={[
        {
          title: "Total Queues",
          value: totalQueues,
          description: "All queues",
          icon: Inbox,
          loading: isLoading,
        },
        {
          title: "Standard Queues",
          value: standardQueues,
          description: "Best-effort ordering",
          icon: Send,
          loading: isLoading,
        },
        {
          title: "FIFO Queues",
          value: fifoQueues,
          description: "Exactly-once processing",
          icon: Clock,
          loading: isLoading,
        },
        {
          title: "Messages",
          value: "-",
          description: "Select a queue to view",
          icon: MessageSquare,
          loading: false,
        },
      ]}
      alert={{
        icon: Info,
        description:
          "SQS in LocalStack provides a fully functional message queuing service for local development. Create queues, send messages, and test your messaging workflows without AWS charges.",
      }}
    >
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedQueue ? "Queue Messages" : "SQS Queues"}
          </CardTitle>
          <CardDescription>
            {selectedQueue
              ? `Viewing messages in ${selectedQueue.name}`
              : "View and manage your SQS queues"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedQueue ? (
            <MessageViewer
              queueUrl={selectedQueue.url}
              queueName={selectedQueue.name}
              onBack={handleBackToList}
            />
          ) : (
            <QueueList onSelectQueue={handleSelectQueue} />
          )}
        </CardContent>
      </Card>

      <CreateQueueDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </ServicePageLayout>
  );
}