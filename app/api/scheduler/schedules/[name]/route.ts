import { NextRequest, NextResponse } from "next/server";
import { schedulerClient } from "@/lib/aws-config";
import { GetScheduleCommand } from "@aws-sdk/client-scheduler";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  try {
    const { name } = await params;
    const { searchParams } = new URL(request.url);
    const groupName = searchParams.get("groupName") || "default";

    const command = new GetScheduleCommand({
      Name: name,
      GroupName: groupName,
    });

    const response = await schedulerClient.send(command);

    return NextResponse.json({
      arn: response.Arn,
      name: response.Name,
      groupName: response.GroupName,
      state: response.State,
      description: response.Description,
      scheduleExpression: response.ScheduleExpression,
      scheduleExpressionTimezone: response.ScheduleExpressionTimezone,
      startDate: response.StartDate,
      endDate: response.EndDate,
      target: response.Target,
      flexibleTimeWindow: response.FlexibleTimeWindow,
      creationDate: response.CreationDate,
      lastModificationDate: response.LastModificationDate,
      kmsKeyArn: response.KmsKeyArn,
      actionAfterCompletion: response.ActionAfterCompletion,
    });
  } catch (error: any) {
    console.error("Error getting schedule:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get schedule" },
      { status: 500 },
    );
  }
}
