import { NextRequest, NextResponse } from 'next/server';
import { cloudWatchClient } from '@/lib/aws-config';
import {
  DescribeAlarmHistoryCommand,
  type DescribeAlarmHistoryCommandInput,
} from '@aws-sdk/client-cloudwatch';

// GET /api/cloudwatch/alarms/[name]/history - Get alarm history
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ name: string }> }
) {
  try {
    const routeParams = await context.params;
    const alarmName = decodeURIComponent(routeParams.name);
    const searchParams = request.nextUrl.searchParams;
    
    const historyItemType = searchParams.get('historyItemType') as 'ConfigurationUpdate' | 'StateUpdate' | 'Action' | undefined;
    const startDate = searchParams.get('startDate') ? new Date(parseInt(searchParams.get('startDate')!)) : undefined;
    const endDate = searchParams.get('endDate') ? new Date(parseInt(searchParams.get('endDate')!)) : undefined;
    const maxRecords = searchParams.get('maxRecords') ? parseInt(searchParams.get('maxRecords')!) : 100;
    const nextToken = searchParams.get('nextToken') || undefined;
    const scanBy = searchParams.get('scanBy') as 'TimestampDescending' | 'TimestampAscending' | undefined;

    const params: DescribeAlarmHistoryCommandInput = {
      AlarmName: alarmName,
      HistoryItemType: historyItemType,
      StartDate: startDate,
      EndDate: endDate,
      MaxRecords: maxRecords,
      NextToken: nextToken,
      ScanBy: scanBy,
    };

    const command = new DescribeAlarmHistoryCommand(params);
    const response = await cloudWatchClient.send(command);

    return NextResponse.json({
      alarmHistoryItems: response.AlarmHistoryItems || [],
      nextToken: response.NextToken,
    });
  } catch (error) {
    console.error('Error getting alarm history:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get alarm history' },
      { status: 500 }
    );
  }
}