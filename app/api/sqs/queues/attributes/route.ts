import { NextResponse } from 'next/server';
import { SQSClient, GetQueueAttributesCommand } from '@aws-sdk/client-sqs';

const client = new SQSClient({
  endpoint: process.env.LOCALSTACK_ENDPOINT || 'http://localhost:4566',
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
  },
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const queueUrl = searchParams.get('queueUrl');

    if (!queueUrl) {
      return NextResponse.json(
        { error: 'Queue URL is required' },
        { status: 400 }
      );
    }

    const command = new GetQueueAttributesCommand({
      QueueUrl: queueUrl,
      AttributeNames: ['All'],
    });

    const response = await client.send(command);

    return NextResponse.json({ attributes: response.Attributes || {} });
  } catch (error: any) {
    console.error('Failed to get queue attributes:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get queue attributes' },
      { status: 500 }
    );
  }
}