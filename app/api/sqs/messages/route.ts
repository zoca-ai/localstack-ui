import { NextResponse } from "next/server";
import {
  SQSClient,
  ReceiveMessageCommand,
  SendMessageCommand,
  DeleteMessageCommand,
} from "@aws-sdk/client-sqs";

const client = new SQSClient({
  endpoint: process.env.LOCALSTACK_ENDPOINT || "http://localhost:4566",
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "test",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "test",
  },
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const queueUrl = searchParams.get("queueUrl");

    if (!queueUrl) {
      return NextResponse.json(
        { error: "Queue URL is required" },
        { status: 400 },
      );
    }

    const command = new ReceiveMessageCommand({
      QueueUrl: queueUrl,
      MaxNumberOfMessages: 10,
      VisibilityTimeout: 30,
      WaitTimeSeconds: 0,
      MessageAttributeNames: ["All"],
      AttributeNames: ["All"],
    });

    const response = await client.send(command);

    const messages = (response.Messages || []).map((message) => ({
      messageId: message.MessageId,
      receiptHandle: message.ReceiptHandle,
      body: message.Body,
      attributes: message.Attributes,
      messageAttributes: message.MessageAttributes,
    }));

    return NextResponse.json({ messages });
  } catch (error: any) {
    console.error("Failed to receive messages:", error);
    return NextResponse.json(
      { error: error.message || "Failed to receive messages" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { queueUrl, messageBody, messageAttributes, delaySeconds } = body;

    if (!queueUrl || !messageBody) {
      return NextResponse.json(
        { error: "Queue URL and message body are required" },
        { status: 400 },
      );
    }

    const command = new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageBody: messageBody,
      MessageAttributes: messageAttributes,
      DelaySeconds: delaySeconds,
    });

    const response = await client.send(command);

    return NextResponse.json({
      messageId: response.MessageId,
      message: "Message sent successfully",
    });
  } catch (error: any) {
    console.error("Failed to send message:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send message" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const queueUrl = searchParams.get("queueUrl");
    const receiptHandle = searchParams.get("receiptHandle");

    if (!queueUrl || !receiptHandle) {
      return NextResponse.json(
        { error: "Queue URL and receipt handle are required" },
        { status: 400 },
      );
    }

    const command = new DeleteMessageCommand({
      QueueUrl: queueUrl,
      ReceiptHandle: receiptHandle,
    });

    await client.send(command);

    return NextResponse.json({ message: "Message deleted successfully" });
  } catch (error: any) {
    console.error("Failed to delete message:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete message" },
      { status: 500 },
    );
  }
}
