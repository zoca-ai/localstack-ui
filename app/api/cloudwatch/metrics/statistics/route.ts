import { NextRequest, NextResponse } from "next/server";
import { cloudWatchClient } from "@/lib/aws-config";
import {
  GetMetricStatisticsCommand,
  GetMetricDataCommand,
  type GetMetricStatisticsCommandInput,
  type GetMetricDataCommandInput,
  type MetricDataQuery,
} from "@aws-sdk/client-cloudwatch";

// GET /api/cloudwatch/metrics/statistics - Get metric statistics
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const namespace = searchParams.get("namespace");
    const metricName = searchParams.get("metricName");
    const startTime = searchParams.get("startTime");
    const endTime = searchParams.get("endTime");
    const period = searchParams.get("period");
    const statistics = searchParams.getAll("statistics");
    const unit = searchParams.get("unit") || undefined;

    if (
      !namespace ||
      !metricName ||
      !startTime ||
      !endTime ||
      !period ||
      statistics.length === 0
    ) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 },
      );
    }

    const params: GetMetricStatisticsCommandInput = {
      Namespace: namespace,
      MetricName: metricName,
      StartTime: new Date(parseInt(startTime)),
      EndTime: new Date(parseInt(endTime)),
      Period: parseInt(period),
      Statistics: statistics as any[],
      Unit: unit as any,
    };

    // Add dimensions if provided
    const dimensions = searchParams.get("dimensions");
    if (dimensions) {
      try {
        params.Dimensions = JSON.parse(dimensions);
      } catch {
        // Ignore parse errors
      }
    }

    const command = new GetMetricStatisticsCommand(params);
    const response = await cloudWatchClient.send(command);

    return NextResponse.json({
      label: response.Label,
      datapoints: response.Datapoints || [],
    });
  } catch (error: any) {
    console.error("Error getting metric statistics:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get metric statistics" },
      { status: 500 },
    );
  }
}

// POST /api/cloudwatch/metrics/statistics - Get metric data (for multiple metrics)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      metricDataQueries,
      startTime,
      endTime,
      nextToken,
      scanBy,
      maxDatapoints,
    } = body;

    if (
      !metricDataQueries ||
      !Array.isArray(metricDataQueries) ||
      !startTime ||
      !endTime
    ) {
      return NextResponse.json(
        { error: "metricDataQueries, startTime, and endTime are required" },
        { status: 400 },
      );
    }

    // Format metric data queries
    const formattedQueries: MetricDataQuery[] = metricDataQueries.map(
      (query) => ({
        Id: query.id,
        MetricStat: query.metricStat
          ? {
              Metric: {
                Namespace: query.metricStat.metric.namespace,
                MetricName: query.metricStat.metric.metricName,
                Dimensions: query.metricStat.metric.dimensions?.map(
                  (d: any) => ({
                    Name: d.name,
                    Value: d.value,
                  }),
                ),
              },
              Period: query.metricStat.period,
              Stat: query.metricStat.stat,
              Unit: query.metricStat.unit,
            }
          : undefined,
        Expression: query.expression,
        Label: query.label,
        ReturnData: query.returnData !== false,
        Period: query.period,
      }),
    );

    const params: GetMetricDataCommandInput = {
      MetricDataQueries: formattedQueries,
      StartTime: new Date(startTime),
      EndTime: new Date(endTime),
      NextToken: nextToken,
      ScanBy: scanBy,
      MaxDatapoints: maxDatapoints,
    };

    const command = new GetMetricDataCommand(params);
    const response = await cloudWatchClient.send(command);

    return NextResponse.json({
      metricDataResults: response.MetricDataResults || [],
      nextToken: response.NextToken,
      messages: response.Messages,
    });
  } catch (error: any) {
    console.error("Error getting metric data:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get metric data" },
      { status: 500 },
    );
  }
}
