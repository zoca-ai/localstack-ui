import { NextRequest, NextResponse } from 'next/server';
import { schedulerClient } from '@/lib/aws-config';
import {
  ListSchedulesCommand,
  CreateScheduleCommand,
  DeleteScheduleCommand,
  UpdateScheduleCommand,
} from '@aws-sdk/client-scheduler';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const groupName = searchParams.get('groupName') || 'default';
    const namePrefix = searchParams.get('namePrefix') || undefined;
    
    const command = new ListSchedulesCommand({
      GroupName: groupName,
      NamePrefix: namePrefix,
      MaxResults: 100,
    });
    
    const response = await schedulerClient.send(command);
    
    const schedules = response.Schedules?.map(schedule => ({
      arn: schedule.Arn,
      name: schedule.Name,
      groupName: schedule.GroupName,
      state: schedule.State,
      creationDate: schedule.CreationDate,
      lastModificationDate: schedule.LastModificationDate,
      scheduleExpression: null, // These properties don't exist in the list response
      scheduleExpressionTimezone: null,
      target: schedule.Target,
    })) || [];
    
    return NextResponse.json(schedules);
  } catch (error: any) {
    console.error('Error listing schedules:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list schedules' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      groupName = 'default',
      description,
      scheduleExpression,
      scheduleExpressionTimezone,
      startDate,
      endDate,
      state = 'ENABLED',
      target,
      flexibleTimeWindow,
      kmsKeyArn,
      actionAfterCompletion,
    } = body;
    
    if (!name || !scheduleExpression || !target) {
      return NextResponse.json(
        { error: 'Name, schedule expression, and target are required' },
        { status: 400 }
      );
    }
    
    const command = new CreateScheduleCommand({
      Name: name,
      GroupName: groupName,
      Description: description,
      ScheduleExpression: scheduleExpression,
      ScheduleExpressionTimezone: scheduleExpressionTimezone,
      StartDate: startDate ? new Date(startDate) : undefined,
      EndDate: endDate ? new Date(endDate) : undefined,
      State: state,
      Target: {
        Arn: target.arn,
        RoleArn: target.roleArn,
        Input: target.input,
        RetryPolicy: target.retryPolicy,
        DeadLetterConfig: target.deadLetterConfig,
        KinesisParameters: target.kinesisParameters,
        EventBridgeParameters: target.eventBridgeParameters,
        SqsParameters: target.sqsParameters,
        // HttpParameters doesn't exist in the SDK
      },
      FlexibleTimeWindow: flexibleTimeWindow || { Mode: 'OFF' },
      KmsKeyArn: kmsKeyArn,
      ActionAfterCompletion: actionAfterCompletion,
    });
    
    const response = await schedulerClient.send(command);
    
    return NextResponse.json({
      scheduleArn: response.ScheduleArn,
    });
  } catch (error: any) {
    console.error('Error creating schedule:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create schedule' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      groupName = 'default',
      description,
      scheduleExpression,
      scheduleExpressionTimezone,
      startDate,
      endDate,
      state,
      target,
      flexibleTimeWindow,
      kmsKeyArn,
      actionAfterCompletion,
    } = body;
    
    if (!name) {
      return NextResponse.json(
        { error: 'Schedule name is required' },
        { status: 400 }
      );
    }
    
    const command = new UpdateScheduleCommand({
      Name: name,
      GroupName: groupName,
      Description: description,
      ScheduleExpression: scheduleExpression,
      ScheduleExpressionTimezone: scheduleExpressionTimezone,
      StartDate: startDate ? new Date(startDate) : undefined,
      EndDate: endDate ? new Date(endDate) : undefined,
      State: state,
      Target: target ? {
        Arn: target.arn,
        RoleArn: target.roleArn,
        Input: target.input,
        RetryPolicy: target.retryPolicy,
        DeadLetterConfig: target.deadLetterConfig,
        KinesisParameters: target.kinesisParameters,
        EventBridgeParameters: target.eventBridgeParameters,
        SqsParameters: target.sqsParameters,
        // HttpParameters doesn't exist in the SDK
      } : undefined,
      FlexibleTimeWindow: flexibleTimeWindow,
      KmsKeyArn: kmsKeyArn,
      ActionAfterCompletion: actionAfterCompletion,
    });
    
    await schedulerClient.send(command);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating schedule:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update schedule' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    const groupName = searchParams.get('groupName') || 'default';
    
    if (!name) {
      return NextResponse.json(
        { error: 'Schedule name is required' },
        { status: 400 }
      );
    }
    
    const command = new DeleteScheduleCommand({
      Name: name,
      GroupName: groupName,
    });
    
    await schedulerClient.send(command);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting schedule:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete schedule' },
      { status: 500 }
    );
  }
}