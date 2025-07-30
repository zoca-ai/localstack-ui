import { NextRequest, NextResponse } from 'next/server';
import { eventBridgeClient } from '@/lib/aws-config';
import {
  ListEventBusesCommand,
  CreateEventBusCommand,
  DeleteEventBusCommand,
} from '@aws-sdk/client-eventbridge';

export async function GET() {
  try {
    const command = new ListEventBusesCommand({});
    const response = await eventBridgeClient.send(command);
    
    const buses = response.EventBuses?.map(bus => ({
      name: bus.Name,
      arn: bus.Arn,
      description: bus.Description,
      kmsKeyId: null, // These properties don't exist in the SDK
      deadLetterConfig: null,
      state: 'ACTIVE', // Default state
      creationTime: null,
      lastModifiedTime: null,
    })) || [];
    
    return NextResponse.json(buses);
  } catch (error: any) {
    console.error('Error listing event buses:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list event buses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, kmsKeyId, deadLetterConfig, tags } = body;
    
    const command = new CreateEventBusCommand({
      Name: name,
      Description: description,
      Tags: tags,
    });
    
    const response = await eventBridgeClient.send(command);
    
    return NextResponse.json({
      arn: response.EventBusArn,
      deadLetterConfig: null,
      description: description,
      kmsKeyId: null,
      name: name,
      state: 'ACTIVE',
    });
  } catch (error: any) {
    console.error('Error creating event bus:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create event bus' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    
    if (!name) {
      return NextResponse.json(
        { error: 'Event bus name is required' },
        { status: 400 }
      );
    }
    
    const command = new DeleteEventBusCommand({ Name: name });
    await eventBridgeClient.send(command);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting event bus:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete event bus' },
      { status: 500 }
    );
  }
}