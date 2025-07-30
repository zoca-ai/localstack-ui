import { NextResponse } from 'next/server';
import { SQSClient, ListQueuesCommand, CreateQueueCommand, DeleteQueueCommand, GetQueueAttributesCommand } from '@aws-sdk/client-sqs';

const client = new SQSClient({
  endpoint: process.env.LOCALSTACK_ENDPOINT || 'http://localhost:4566',
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
  },
});

export async function GET() {
  try {
    const command = new ListQueuesCommand({});
    const response = await client.send(command);
    
    if (!response.QueueUrls || response.QueueUrls.length === 0) {
      return NextResponse.json({ queues: [] });
    }

    // Get attributes for each queue
    const queuesWithAttributes = await Promise.all(
      response.QueueUrls.map(async (queueUrl) => {
        try {
          const attributesCommand = new GetQueueAttributesCommand({
            QueueUrl: queueUrl,
            AttributeNames: ['All'],
          });
          const attributesResponse = await client.send(attributesCommand);
          
          // Extract queue name from URL
          const queueName = queueUrl.split('/').pop() || '';
          
          return {
            queueUrl,
            queueName,
            attributes: attributesResponse.Attributes,
          };
        } catch (error) {
          // If we can't get attributes, return basic info
          const queueName = queueUrl.split('/').pop() || '';
          return {
            queueUrl,
            queueName,
            attributes: {},
          };
        }
      })
    );

    return NextResponse.json({ queues: queuesWithAttributes });
  } catch (error: any) {
    console.error('Failed to list queues:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list queues' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { queueName, attributes } = body;

    if (!queueName) {
      return NextResponse.json(
        { error: 'Queue name is required' },
        { status: 400 }
      );
    }

    const command = new CreateQueueCommand({
      QueueName: queueName,
      Attributes: attributes,
    });

    const response = await client.send(command);

    return NextResponse.json({
      queueUrl: response.QueueUrl,
      message: 'Queue created successfully',
    });
  } catch (error: any) {
    console.error('Failed to create queue:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create queue' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const queueUrl = searchParams.get('queueUrl');

    if (!queueUrl) {
      return NextResponse.json(
        { error: 'Queue URL is required' },
        { status: 400 }
      );
    }

    const command = new DeleteQueueCommand({
      QueueUrl: queueUrl,
    });

    await client.send(command);

    return NextResponse.json({ message: 'Queue deleted successfully' });
  } catch (error: any) {
    console.error('Failed to delete queue:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete queue' },
      { status: 500 }
    );
  }
}