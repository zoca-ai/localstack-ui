import { NextRequest, NextResponse } from "next/server";
import { cloudWatchLogsClient } from "@/lib/aws-config";
import {
  DescribeLogStreamsCommand,
  CreateLogStreamCommand,
  type DescribeLogStreamsCommandInput,
  type CreateLogStreamCommandInput,
} from "@aws-sdk/client-cloudwatch-logs";

// GET /api/cloudwatch/log-groups/[name]/streams - List log streams
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ name: string }> },
) {
  try {
    const params = await context.params;
    const logGroupName = decodeURIComponent(params.name);
    const searchParams = request.nextUrl.searchParams;
    const logStreamNamePrefix = searchParams.get("prefix") || undefined;
    const nextToken = searchParams.get("nextToken") || undefined;
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!)
      : 50;
    const orderBy = searchParams.get("orderBy") as
      | "LogStreamName"
      | "LastEventTime"
      | undefined;
    const descending = searchParams.get("descending") === "true";

    const streamParams: DescribeLogStreamsCommandInput = {
      logGroupName,
      logStreamNamePrefix,
      nextToken,
      limit,
      orderBy,
      descending,
    };

    const command = new DescribeLogStreamsCommand(streamParams);
    const response = await cloudWatchLogsClient.send(command);

    return NextResponse.json({
      logStreams: response.logStreams || [],
      nextToken: response.nextToken,
    });
  } catch (error: any) {
    console.error("Error listing log streams:", error);
    return NextResponse.json(
      { error: error.message || "Failed to list log streams" },
      { status: 500 },
    );
  }
}

// POST /api/cloudwatch/log-groups/[name]/streams - Create a log stream
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ name: string }> },
) {
  try {
    const params = await context.params;
    const logGroupName = decodeURIComponent(params.name);
    const body = await request.json();
    const { logStreamName } = body;

    if (!logStreamName) {
      return NextResponse.json(
        { error: "Log stream name is required" },
        { status: 400 },
      );
    }

    const createParams: CreateLogStreamCommandInput = {
      logGroupName,
      logStreamName,
    };

    const command = new CreateLogStreamCommand(createParams);
    await cloudWatchLogsClient.send(command);

    return NextResponse.json({
      message: "Log stream created successfully",
      logGroupName,
      logStreamName,
    });
  } catch (error: any) {
    console.error("Error creating log stream:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create log stream" },
      { status: 500 },
    );
  }
}
