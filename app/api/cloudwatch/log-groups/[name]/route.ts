import { NextRequest, NextResponse } from 'next/server';
import { cloudWatchLogsClient } from '@/lib/aws-config';
import {
  DeleteLogGroupCommand,
  DescribeLogGroupsCommand,
  PutRetentionPolicyCommand,
  type DeleteLogGroupCommandInput,
  type DescribeLogGroupsCommandInput,
  type PutRetentionPolicyCommandInput,
} from '@aws-sdk/client-cloudwatch-logs';

// GET /api/cloudwatch/log-groups/[name] - Get a specific log group
export async function GET(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const logGroupName = decodeURIComponent(params.name);

    const describeParams: DescribeLogGroupsCommandInput = {
      logGroupNamePrefix: logGroupName,
      limit: 1,
    };

    const command = new DescribeLogGroupsCommand(describeParams);
    const response = await cloudWatchLogsClient.send(command);

    const logGroup = response.logGroups?.find(lg => lg.logGroupName === logGroupName);

    if (!logGroup) {
      return NextResponse.json(
        { error: 'Log group not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(logGroup);
  } catch (error: any) {
    console.error('Error getting log group:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get log group' },
      { status: 500 }
    );
  }
}

// PUT /api/cloudwatch/log-groups/[name] - Update a log group (retention policy)
export async function PUT(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const logGroupName = decodeURIComponent(params.name);
    const body = await request.json();
    const { retentionInDays } = body;

    if (retentionInDays !== undefined) {
      const retentionParams: PutRetentionPolicyCommandInput = {
        logGroupName,
        retentionInDays,
      };

      const command = new PutRetentionPolicyCommand(retentionParams);
      await cloudWatchLogsClient.send(command);
    }

    return NextResponse.json({
      message: 'Log group updated successfully',
      logGroupName,
    });
  } catch (error: any) {
    console.error('Error updating log group:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update log group' },
      { status: 500 }
    );
  }
}

// DELETE /api/cloudwatch/log-groups/[name] - Delete a log group
export async function DELETE(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const logGroupName = decodeURIComponent(params.name);

    const deleteParams: DeleteLogGroupCommandInput = {
      logGroupName,
    };

    const command = new DeleteLogGroupCommand(deleteParams);
    await cloudWatchLogsClient.send(command);

    return NextResponse.json({
      message: 'Log group deleted successfully',
      logGroupName,
    });
  } catch (error: any) {
    console.error('Error deleting log group:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete log group' },
      { status: 500 }
    );
  }
}