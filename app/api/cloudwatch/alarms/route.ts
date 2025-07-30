import { NextRequest, NextResponse } from 'next/server';
import { cloudWatchClient } from '@/lib/aws-config';
import {
  DescribeAlarmsCommand,
  PutMetricAlarmCommand,
  type DescribeAlarmsCommandInput,
  type PutMetricAlarmCommandInput,
} from '@aws-sdk/client-cloudwatch';

// GET /api/cloudwatch/alarms - List alarms
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const alarmNames = searchParams.getAll('alarmNames');
    const alarmNamePrefix = searchParams.get('alarmNamePrefix') || undefined;
    const stateValue = searchParams.get('stateValue') as 'OK' | 'ALARM' | 'INSUFFICIENT_DATA' | undefined;
    const actionPrefix = searchParams.get('actionPrefix') || undefined;
    const maxRecords = searchParams.get('maxRecords') ? parseInt(searchParams.get('maxRecords')!) : 100;
    const nextToken = searchParams.get('nextToken') || undefined;

    const params: DescribeAlarmsCommandInput = {
      AlarmNames: alarmNames.length > 0 ? alarmNames : undefined,
      AlarmNamePrefix: alarmNamePrefix,
      StateValue: stateValue,
      ActionPrefix: actionPrefix,
      MaxRecords: maxRecords,
      NextToken: nextToken,
    };

    const command = new DescribeAlarmsCommand(params);
    const response = await cloudWatchClient.send(command);

    return NextResponse.json({
      metricAlarms: response.MetricAlarms || [],
      compositeAlarms: response.CompositeAlarms || [],
      nextToken: response.NextToken,
    });
  } catch (error: any) {
    console.error('Error listing alarms:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list alarms' },
      { status: 500 }
    );
  }
}

// POST /api/cloudwatch/alarms - Create or update an alarm
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      alarmName,
      alarmDescription,
      actionsEnabled,
      okActions,
      alarmActions,
      insufficientDataActions,
      metricName,
      namespace,
      statistic,
      extendedStatistic,
      dimensions,
      period,
      unit,
      evaluationPeriods,
      datapointsToAlarm,
      threshold,
      comparisonOperator,
      treatMissingData,
      evaluateLowSampleCountPercentile,
      metrics,
      tags,
      thresholdMetricId,
    } = body;

    if (!alarmName) {
      return NextResponse.json(
        { error: 'Alarm name is required' },
        { status: 400 }
      );
    }

    // Validate based on alarm type
    if (metrics && metrics.length > 0) {
      // Composite alarm validation
      if (!evaluationPeriods || !threshold || !comparisonOperator) {
        return NextResponse.json(
          { error: 'Evaluation periods, threshold, and comparison operator are required for composite alarms' },
          { status: 400 }
        );
      }
    } else {
      // Metric alarm validation
      if (!metricName || !namespace || (!statistic && !extendedStatistic) || 
          !period || !evaluationPeriods || !threshold || !comparisonOperator) {
        return NextResponse.json(
          { error: 'Missing required parameters for metric alarm' },
          { status: 400 }
        );
      }
    }

    const params: PutMetricAlarmCommandInput = {
      AlarmName: alarmName,
      AlarmDescription: alarmDescription,
      ActionsEnabled: actionsEnabled !== false,
      OKActions: okActions,
      AlarmActions: alarmActions,
      InsufficientDataActions: insufficientDataActions,
      MetricName: metricName,
      Namespace: namespace,
      Statistic: statistic as any,
      ExtendedStatistic: extendedStatistic,
      Dimensions: dimensions?.map((d: any) => ({
        Name: d.name,
        Value: d.value,
      })),
      Period: period,
      Unit: unit as any,
      EvaluationPeriods: evaluationPeriods,
      DatapointsToAlarm: datapointsToAlarm,
      Threshold: threshold,
      ComparisonOperator: comparisonOperator as any,
      TreatMissingData: treatMissingData,
      EvaluateLowSampleCountPercentile: evaluateLowSampleCountPercentile,
      Metrics: metrics,
      Tags: tags?.map((t: any) => ({
        Key: t.key,
        Value: t.value,
      })),
      ThresholdMetricId: thresholdMetricId,
    };

    const command = new PutMetricAlarmCommand(params);
    await cloudWatchClient.send(command);

    return NextResponse.json({
      message: 'Alarm created/updated successfully',
      alarmName,
    });
  } catch (error: any) {
    console.error('Error creating/updating alarm:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create/update alarm' },
      { status: 500 }
    );
  }
}