"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, MessageSquare, RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { QueueList } from "@/components/services/sqs/queue-list";
import { CreateQueueDialog } from "@/components/services/sqs/create-queue-dialog";
import { MessageViewer } from "@/components/services/sqs/message-viewer";

export default function SQSPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedQueue, setSelectedQueue] = useState<{
    url: string;
    name: string;
  } | null>(null);
  const queryClient = useQueryClient();

  const handleSelectQueue = (queueUrl: string, queueName: string) => {
    setSelectedQueue({ url: queueUrl, name: queueName });
  };

  const handleBackToList = () => {
    setSelectedQueue(null);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">SQS</h1>
            <p className="text-muted-foreground">
              Manage your SQS queues and messages
            </p>
          </div>
          <Button
            onClick={() => queryClient.invalidateQueries({ queryKey: ["sqs-queues"] })}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        <Alert>
          <MessageSquare className="h-4 w-4" />
          <AlertDescription>
            SQS in LocalStack provides a fully functional message queuing
            service for local development. Create queues, send messages, and
            test your messaging workflows without AWS charges.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {selectedQueue ? "Queue Messages" : "SQS Queues"}
                </CardTitle>
                <CardDescription>
                  {selectedQueue
                    ? `Viewing messages in ${selectedQueue.name}`
                    : "View and manage your SQS queues"}
                </CardDescription>
              </div>
              {!selectedQueue && (
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Queue
                </Button>
              )}
            </div>
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
      </div>
    </MainLayout>
  );
}

