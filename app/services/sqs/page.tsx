'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { QueueList } from '@/components/services/sqs/queue-list';
import { CreateQueueDialog } from '@/components/services/sqs/create-queue-dialog';
import { MessageViewer } from '@/components/services/sqs/message-viewer';

export default function SQSPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedQueue, setSelectedQueue] = useState<{ url: string; name: string } | null>(null);

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
            <h2 className="text-3xl font-bold tracking-tight">SQS Management</h2>
            <p className="text-muted-foreground">
              Manage your SQS queues and messages
            </p>
          </div>
          {!selectedQueue && (
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Queue
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{selectedQueue ? 'Queue Messages' : 'SQS Queues'}</CardTitle>
            <CardDescription>
              {selectedQueue 
                ? `Viewing messages in ${selectedQueue.name}`
                : 'View and manage your SQS queues'
              }
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
      </div>
    </MainLayout>
  );
}