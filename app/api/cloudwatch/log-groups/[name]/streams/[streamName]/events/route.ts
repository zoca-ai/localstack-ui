import { NextRequest, NextResponse } from 'next/server';
import { cloudWatchLogsClient } from '@/lib/aws-config';
import {
  GetLogEventsCommand,
  PutLogEventsCommand,
  type GetLogEventsCommandInput,
  type PutLogEventsCommandInput,
  type InputLogEvent,
} from '@aws-sdk/client-cloudwatch-logs';

// GET /api/cloudwatch/log-groups/[name]/streams/[streamName]/events - Get log events
export async function GET(
  request: NextRequest,
  { params }: { params: { name: string; streamName: string } }
) {
  try {
    const logGroupName = decodeURIComponent(params.name);
    const logStreamName = decodeURIComponent(params.streamName);
    const searchParams = request.nextUrl.searchParams;
    
    const startTime = searchParams.get('startTime') ? parseInt(searchParams.get('startTime')!) : undefined;
    const endTime = searchParams.get('endTime') ? parseInt(searchParams.get('endTime')!) : undefined;
    const nextToken = searchParams.get('nextToken') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100;
    const startFromHead = searchParams.get('startFromHead') === 'true';

    const eventsParams: GetLogEventsCommandInput = {
      logGroupName,
      logStreamName,
      startTime,
      endTime,
      nextToken,
      limit,
      startFromHead,
    };

    const command = new GetLogEventsCommand(eventsParams);
    const response = await cloudWatchLogsClient.send(command);

    return NextResponse.json({
      events: response.events || [],
      nextForwardToken: response.nextForwardToken,
      nextBackwardToken: response.nextBackwardToken,
    });
  } catch (error: any) {
    console.error('Error getting log events:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get log events' },
      { status: 500 }
    );
  }
}

// POST /api/cloudwatch/log-groups/[name]/streams/[streamName]/events - Put log events
export async function POST(
  request: NextRequest,
  { params }: { params: { name: string; streamName: string } }
) {
  try {
    const logGroupName = decodeURIComponent(params.name);
    const logStreamName = decodeURIComponent(params.streamName);
    const body = await request.json();
    const { events, sequenceToken } = body;

    if (!events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: 'Events array is required' },
        { status: 400 }
      );
    }

    // Format events for AWS
    const logEvents: InputLogEvent[] = events.map(event => ({
      timestamp: event.timestamp || Date.now(),
      message: event.message,
    }));

    const putParams: PutLogEventsCommandInput = {
      logGroupName,
      logStreamName,
      logEvents,
      sequenceToken,
    };

    const command = new PutLogEventsCommand(putParams);
    const response = await cloudWatchLogsClient.send(command);

    return NextResponse.json({
      message: 'Log events added successfully',
      nextSequenceToken: response.nextSequenceToken,
      rejectedLogEventsInfo: response.rejectedLogEventsInfo,
    });
  } catch (error: any) {
    console.error('Error putting log events:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to put log events' },
      { status: 500 }
    );
  }
}