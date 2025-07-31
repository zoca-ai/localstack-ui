import { NextRequest, NextResponse } from "next/server";
import { eventBridgeClient } from "@/lib/aws-config";
import { DescribeRuleCommand } from "@aws-sdk/client-eventbridge";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  try {
    const { name } = await params;
    const { searchParams } = new URL(request.url);
    const eventBusName = searchParams.get("eventBusName") || "default";

    const command = new DescribeRuleCommand({
      Name: name,
      EventBusName: eventBusName,
    });

    const response = await eventBridgeClient.send(command);

    return NextResponse.json({
      name: response.Name,
      arn: response.Arn,
      eventPattern: response.EventPattern,
      scheduleExpression: response.ScheduleExpression,
      state: response.State,
      description: response.Description,
      roleArn: response.RoleArn,
      managedBy: response.ManagedBy,
      eventBusName: response.EventBusName,
      createdBy: response.CreatedBy,
    });
  } catch (error: any) {
    console.error("Error describing rule:", error);
    return NextResponse.json(
      { error: error.message || "Failed to describe rule" },
      { status: 500 },
    );
  }
}
