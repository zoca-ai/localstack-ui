import { NextRequest, NextResponse } from 'next/server';
import { cloudWatchClient } from '@/lib/aws-config';
import {
  ListMetricsCommand,
  PutMetricDataCommand,
  type ListMetricsCommandInput,
  type PutMetricDataCommandInput,
  type MetricDatum,
} from '@aws-sdk/client-cloudwatch';

// GET /api/cloudwatch/metrics - List metrics
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const namespace = searchParams.get('namespace') || undefined;
    const metricName = searchParams.get('metricName') || undefined;
    const nextToken = searchParams.get('nextToken') || undefined;
    const recentlyActive = searchParams.get('recentlyActive') === 'true' ? 'PT3H' : undefined;

    const params: ListMetricsCommandInput = {
      Namespace: namespace,
      MetricName: metricName,
      NextToken: nextToken,
      RecentlyActive: recentlyActive,
    };

    // Add dimensions if provided
    const dimensions = searchParams.get('dimensions');
    if (dimensions) {
      try {
        params.Dimensions = JSON.parse(dimensions);
      } catch {
        // Ignore parse errors
      }
    }

    const command = new ListMetricsCommand(params);
    const response = await cloudWatchClient.send(command);

    // Transform the response to match our TypeScript types
    const metrics = (response.Metrics || []).map(metric => ({
      namespace: metric.Namespace,
      metricName: metric.MetricName,
      dimensions: metric.Dimensions?.map(dim => ({
        name: dim.Name || '',
        value: dim.Value || ''
      }))
    }));

    return NextResponse.json({
      metrics,
      nextToken: response.NextToken,
    });
  } catch (error: any) {
    console.error('Error listing metrics:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list metrics' },
      { status: 500 }
    );
  }
}

// POST /api/cloudwatch/metrics - Put metric data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { namespace, metricData } = body;

    if (!namespace || !metricData || !Array.isArray(metricData)) {
      return NextResponse.json(
        { error: 'Namespace and metricData array are required' },
        { status: 400 }
      );
    }

    // Format metric data
    const formattedMetricData: MetricDatum[] = metricData.map(datum => ({
      MetricName: datum.metricName,
      Value: datum.value,
      Unit: datum.unit,
      Timestamp: datum.timestamp ? new Date(datum.timestamp) : new Date(),
      Dimensions: datum.dimensions?.map((d: any) => ({
        Name: d.name,
        Value: d.value,
      })),
      StatisticValues: datum.statisticValues ? {
        SampleCount: datum.statisticValues.sampleCount,
        Sum: datum.statisticValues.sum,
        Minimum: datum.statisticValues.minimum,
        Maximum: datum.statisticValues.maximum,
      } : undefined,
      StorageResolution: datum.storageResolution,
    }));

    const params: PutMetricDataCommandInput = {
      Namespace: namespace,
      MetricData: formattedMetricData,
    };

    const command = new PutMetricDataCommand(params);
    await cloudWatchClient.send(command);

    return NextResponse.json({
      message: 'Metric data published successfully',
      namespace,
      count: metricData.length,
    });
  } catch (error: any) {
    console.error('Error putting metric data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to put metric data' },
      { status: 500 }
    );
  }
}