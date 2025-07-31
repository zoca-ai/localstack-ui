import { NextRequest, NextResponse } from "next/server";
import { cloudWatchLogsClient } from "@/lib/aws-config";
import {
  DeleteLogStreamCommand,
  type DeleteLogStreamCommandInput,
} from "@aws-sdk/client-cloudwatch-logs";

// DELETE /api/cloudwatch/log-groups/[name]/streams/[streamName] - Delete a log stream
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ name: string; streamName: string }> },
) {
  try {
    const params = await context.params;
    const logGroupName = decodeURIComponent(params.name);
    const logStreamName = decodeURIComponent(params.streamName);

    const deleteParams: DeleteLogStreamCommandInput = {
      logGroupName,
      logStreamName,
    };

    const command = new DeleteLogStreamCommand(deleteParams);
    await cloudWatchLogsClient.send(command);

    return NextResponse.json({
      message: "Log stream deleted successfully",
      logGroupName,
      logStreamName,
    });
  } catch (error: any) {
    console.error("Error deleting log stream:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete log stream" },
      { status: 500 },
    );
  }
}
