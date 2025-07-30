import { NextRequest, NextResponse } from 'next/server';
import { schedulerClient } from '@/lib/aws-config';
import {
  ListScheduleGroupsCommand,
  CreateScheduleGroupCommand,
  DeleteScheduleGroupCommand,
} from '@aws-sdk/client-scheduler';

export async function GET() {
  try {
    const command = new ListScheduleGroupsCommand({
      MaxResults: 100,
    });
    
    const response = await schedulerClient.send(command);
    
    const groups = response.ScheduleGroups?.map(group => ({
      arn: group.Arn,
      name: group.Name,
      state: group.State,
      creationDate: group.CreationDate,
      lastModificationDate: group.LastModificationDate,
    })) || [];
    
    return NextResponse.json(groups);
  } catch (error: any) {
    console.error('Error listing schedule groups:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list schedule groups' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, tags } = body;
    
    if (!name) {
      return NextResponse.json(
        { error: 'Group name is required' },
        { status: 400 }
      );
    }
    
    const command = new CreateScheduleGroupCommand({
      Name: name,
      Tags: tags,
    });
    
    const response = await schedulerClient.send(command);
    
    return NextResponse.json({
      scheduleGroupArn: response.ScheduleGroupArn,
    });
  } catch (error: any) {
    console.error('Error creating schedule group:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create schedule group' },
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
        { error: 'Group name is required' },
        { status: 400 }
      );
    }
    
    const command = new DeleteScheduleGroupCommand({
      Name: name,
    });
    
    await schedulerClient.send(command);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting schedule group:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete schedule group' },
      { status: 500 }
    );
  }
}