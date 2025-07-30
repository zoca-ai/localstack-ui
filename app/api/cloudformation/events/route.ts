import { NextRequest, NextResponse } from 'next/server';
import { cloudFormationClient } from '@/lib/aws-config';
import { DescribeStackEventsCommand } from '@aws-sdk/client-cloudformation';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stackName = searchParams.get('stackName');
    
    if (!stackName) {
      return NextResponse.json(
        { error: 'Stack name is required' },
        { status: 400 }
      );
    }
    
    const command = new DescribeStackEventsCommand({
      StackName: stackName,
    });
    
    const response = await cloudFormationClient.send(command);
    
    const events = response.StackEvents?.map(event => ({
      stackId: event.StackId,
      eventId: event.EventId,
      stackName: event.StackName,
      logicalResourceId: event.LogicalResourceId,
      physicalResourceId: event.PhysicalResourceId,
      resourceType: event.ResourceType,
      timestamp: event.Timestamp,
      resourceStatus: event.ResourceStatus,
      resourceStatusReason: event.ResourceStatusReason,
      resourceProperties: event.ResourceProperties,
      clientRequestToken: event.ClientRequestToken,
      hookType: event.HookType,
      hookStatus: event.HookStatus,
      hookStatusReason: event.HookStatusReason,
      hookInvocationPoint: event.HookInvocationPoint,
      hookFailureMode: event.HookFailureMode,
    })) || [];
    
    return NextResponse.json(events);
  } catch (error: any) {
    console.error('Error listing stack events:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list stack events' },
      { status: 500 }
    );
  }
}