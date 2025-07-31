import { NextResponse } from "next/server";
import { SQSClient, PurgeQueueCommand } from "@aws-sdk/client-sqs";

const client = new SQSClient({
  endpoint: process.env.LOCALSTACK_ENDPOINT || "http://localhost:4566",
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "test",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "test",
  },
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { queueUrl } = body;

    if (!queueUrl) {
      return NextResponse.json(
        { error: "Queue URL is required" },
        { status: 400 },
      );
    }

    const command = new PurgeQueueCommand({
      QueueUrl: queueUrl,
    });

    await client.send(command);

    return NextResponse.json({ message: "Queue purged successfully" });
  } catch (error: any) {
    console.error("Failed to purge queue:", error);
    return NextResponse.json(
      { error: error.message || "Failed to purge queue" },
      { status: 500 },
    );
  }
}
