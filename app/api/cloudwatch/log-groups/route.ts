import { NextRequest, NextResponse } from 'next/server';
import { cloudWatchLogsClient } from '@/lib/aws-config';
import {
  DescribeLogGroupsCommand,
  CreateLogGroupCommand,
  type DescribeLogGroupsCommandInput,
  type CreateLogGroupCommandInput,
} from '@aws-sdk/client-cloudwatch-logs';

// GET /api/cloudwatch/log-groups - List all log groups
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const logGroupNamePrefix = searchParams.get('prefix') || undefined;
    const nextToken = searchParams.get('nextToken') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;

    const params: DescribeLogGroupsCommandInput = {
      logGroupNamePrefix,
      nextToken,
      limit,
    };

    const command = new DescribeLogGroupsCommand(params);
    const response = await cloudWatchLogsClient.send(command);

    return NextResponse.json({
      logGroups: response.logGroups || [],
      nextToken: response.nextToken,
    });
  } catch (error: any) {
    console.error('Error listing log groups:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list log groups' },
      { status: 500 }
    );
  }
}

// POST /api/cloudwatch/log-groups - Create a new log group
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { logGroupName, kmsKeyId, tags, retentionInDays } = body;

    if (!logGroupName) {
      return NextResponse.json(
        { error: 'Log group name is required' },
        { status: 400 }
      );
    }

    const params: CreateLogGroupCommandInput = {
      logGroupName,
      kmsKeyId,
      tags,
    };

    const command = new CreateLogGroupCommand(params);
    await cloudWatchLogsClient.send(command);

    // If retention is specified, set it in a separate call
    if (retentionInDays) {
      const { PutRetentionPolicyCommand } = await import('@aws-sdk/client-cloudwatch-logs');
      const retentionCommand = new PutRetentionPolicyCommand({
        logGroupName,
        retentionInDays,
      });
      await cloudWatchLogsClient.send(retentionCommand);
    }

    return NextResponse.json({
      message: 'Log group created successfully',
      logGroupName,
    });
  } catch (error: any) {
    console.error('Error creating log group:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create log group' },
      { status: 500 }
    );
  }
}