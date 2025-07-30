import { NextRequest, NextResponse } from 'next/server';
import { eventBridgeClient } from '@/lib/aws-config';
import {
  ListRulesCommand,
  PutRuleCommand,
  DeleteRuleCommand,
  EnableRuleCommand,
  DisableRuleCommand,
  DescribeRuleCommand,
} from '@aws-sdk/client-eventbridge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventBusName = searchParams.get('eventBusName') || 'default';
    const namePrefix = searchParams.get('namePrefix') || undefined;
    
    const command = new ListRulesCommand({
      EventBusName: eventBusName,
      NamePrefix: namePrefix,
    });
    
    const response = await eventBridgeClient.send(command);
    
    const rules = response.Rules?.map(rule => ({
      name: rule.Name,
      arn: rule.Arn,
      eventPattern: rule.EventPattern,
      state: rule.State,
      description: rule.Description,
      scheduleExpression: rule.ScheduleExpression,
      roleArn: rule.RoleArn,
      managedBy: rule.ManagedBy,
      eventBusName: rule.EventBusName,
      createdBy: null, // This property doesn't exist in the SDK
    })) || [];
    
    return NextResponse.json(rules);
  } catch (error: any) {
    console.error('Error listing rules:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list rules' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      eventPattern,
      scheduleExpression,
      description,
      state,
      eventBusName = 'default',
      roleArn,
      tags,
    } = body;
    
    // Validate that either eventPattern or scheduleExpression is provided
    if (!eventPattern && !scheduleExpression) {
      return NextResponse.json(
        { error: 'Either eventPattern or scheduleExpression must be provided' },
        { status: 400 }
      );
    }
    
    const command = new PutRuleCommand({
      Name: name,
      EventPattern: eventPattern,
      ScheduleExpression: scheduleExpression,
      Description: description,
      State: state || 'ENABLED',
      EventBusName: eventBusName,
      RoleArn: roleArn,
      Tags: tags,
    });
    
    const response = await eventBridgeClient.send(command);
    
    return NextResponse.json({
      ruleArn: response.RuleArn,
    });
  } catch (error: any) {
    console.error('Error creating rule:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create rule' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, eventBusName = 'default', action } = body;
    
    if (!name) {
      return NextResponse.json(
        { error: 'Rule name is required' },
        { status: 400 }
      );
    }
    
    if (action === 'enable') {
      const command = new EnableRuleCommand({
        Name: name,
        EventBusName: eventBusName,
      });
      await eventBridgeClient.send(command);
      return NextResponse.json({ success: true, action: 'enabled' });
    } else if (action === 'disable') {
      const command = new DisableRuleCommand({
        Name: name,
        EventBusName: eventBusName,
      });
      await eventBridgeClient.send(command);
      return NextResponse.json({ success: true, action: 'disabled' });
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "enable" or "disable"' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error updating rule state:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update rule state' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    const eventBusName = searchParams.get('eventBusName') || 'default';
    
    if (!name) {
      return NextResponse.json(
        { error: 'Rule name is required' },
        { status: 400 }
      );
    }
    
    const command = new DeleteRuleCommand({
      Name: name,
      EventBusName: eventBusName,
    });
    
    await eventBridgeClient.send(command);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting rule:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete rule' },
      { status: 500 }
    );
  }
}