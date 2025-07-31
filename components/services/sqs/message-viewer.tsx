"use client";

import { useState } from "react";
import {
  useSQSMessages,
  useSendMessage,
  useDeleteMessage,
} from "@/hooks/use-sqs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, RefreshCw, Send, Trash2, Eye, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "@/lib/utils";

interface MessageViewerProps {
  queueUrl: string;
  queueName: string;
  onBack: () => void;
}

export function MessageViewer({
  queueUrl,
  queueName,
  onBack,
}: MessageViewerProps) {
  const { data: messages, isLoading, refetch } = useSQSMessages(queueUrl);
  const sendMessage = useSendMessage();
  const deleteMessage = useDeleteMessage();
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [messageBody, setMessageBody] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const handleSendMessage = async () => {
    if (!messageBody.trim()) return;

    await sendMessage.mutateAsync({
      queueUrl,
      messageBody,
    });

    setMessageBody("");
    setShowSendDialog(false);
    refetch();
  };

  const handleDeleteMessage = async (receiptHandle: string) => {
    await deleteMessage.mutateAsync({
      queueUrl,
      receiptHandle,
    });
    refetch();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h3 className="text-lg font-semibold">{queueName}</h3>
            <p className="text-sm text-muted-foreground">Queue Messages</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setShowSendDialog(true)}>
            <Send className="mr-2 h-4 w-4" />
            Send Message
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : !messages || messages.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground">No messages in queue</p>
          <p className="text-sm text-muted-foreground mt-2">
            Send a message to see it appear here
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Message ID</TableHead>
              <TableHead>Body Preview</TableHead>
              <TableHead>Sent</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.map((message) => (
              <TableRow key={message.messageId}>
                <TableCell className="font-mono text-sm">
                  {message.messageId}
                </TableCell>
                <TableCell>
                  <div className="max-w-xs truncate">{message.body}</div>
                </TableCell>
                <TableCell>
                  {message.attributes?.SentTimestamp
                    ? formatDistanceToNow(
                        new Date(parseInt(message.attributes.SentTimestamp)),
                      ) + " ago"
                    : "Unknown"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedMessage(message)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteMessage(message.receiptHandle)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Message</DialogTitle>
            <DialogDescription>
              Send a new message to {queueName}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="messageBody">Message Body</Label>
              <Textarea
                id="messageBody"
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                placeholder="Enter your message here..."
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={sendMessage.isPending}
            >
              {sendMessage.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!selectedMessage}
        onOpenChange={() => setSelectedMessage(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Message Details</DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div>
                <Label>Message ID</Label>
                <p className="font-mono text-sm mt-1">
                  {selectedMessage.messageId}
                </p>
              </div>
              <div>
                <Label>Receipt Handle</Label>
                <p className="font-mono text-sm mt-1 break-all">
                  {selectedMessage.receiptHandle}
                </p>
              </div>
              <div>
                <Label>Message Body</Label>
                <pre className="mt-1 p-4 bg-muted rounded-lg overflow-auto">
                  {selectedMessage.body}
                </pre>
              </div>
              {selectedMessage.attributes &&
                Object.keys(selectedMessage.attributes).length > 0 && (
                  <div>
                    <Label>Attributes</Label>
                    <div className="mt-1 space-y-1">
                      {Object.entries(selectedMessage.attributes).map(
                        ([key, value]) => (
                          <div key={key} className="flex gap-2">
                            <Badge variant="secondary">{key}</Badge>
                            <span className="text-sm">{value as string}</span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setSelectedMessage(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
