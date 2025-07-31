import { NextRequest, NextResponse } from "next/server";
import { cloudWatchClient } from "@/lib/aws-config";
import {
  DescribeAlarmsCommand,
  DeleteAlarmsCommand,
  SetAlarmStateCommand,
  EnableAlarmActionsCommand,
  DisableAlarmActionsCommand,
  type DescribeAlarmsCommandInput,
  type DeleteAlarmsCommandInput,
  type SetAlarmStateCommandInput,
  type EnableAlarmActionsCommandInput,
  type DisableAlarmActionsCommandInput,
} from "@aws-sdk/client-cloudwatch";

// GET /api/cloudwatch/alarms/[name] - Get a specific alarm
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ name: string }> },
) {
  try {
    const params = await context.params;
    const alarmName = decodeURIComponent(params.name);

    const describeParams: DescribeAlarmsCommandInput = {
      AlarmNames: [alarmName],
      MaxRecords: 1,
    };

    const command = new DescribeAlarmsCommand(describeParams);
    const response = await cloudWatchClient.send(command);

    const alarm = response.MetricAlarms?.[0] || response.CompositeAlarms?.[0];

    if (!alarm) {
      return NextResponse.json({ error: "Alarm not found" }, { status: 404 });
    }

    return NextResponse.json(alarm);
  } catch (error: any) {
    console.error("Error getting alarm:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get alarm" },
      { status: 500 },
    );
  }
}

// PUT /api/cloudwatch/alarms/[name] - Update alarm state or actions
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ name: string }> },
) {
  try {
    const params = await context.params;
    const alarmName = decodeURIComponent(params.name);
    const body = await request.json();
    const { action, stateValue, stateReason, stateReasonData } = body;

    switch (action) {
      case "setState":
        if (!stateValue || !stateReason) {
          return NextResponse.json(
            { error: "State value and reason are required" },
            { status: 400 },
          );
        }

        const setStateParams: SetAlarmStateCommandInput = {
          AlarmName: alarmName,
          StateValue: stateValue as any,
          StateReason: stateReason,
          StateReasonData: stateReasonData,
        };

        const setStateCommand = new SetAlarmStateCommand(setStateParams);
        await cloudWatchClient.send(setStateCommand);
        break;

      case "enableActions":
        const enableParams: EnableAlarmActionsCommandInput = {
          AlarmNames: [alarmName],
        };

        const enableCommand = new EnableAlarmActionsCommand(enableParams);
        await cloudWatchClient.send(enableCommand);
        break;

      case "disableActions":
        const disableParams: DisableAlarmActionsCommandInput = {
          AlarmNames: [alarmName],
        };

        const disableCommand = new DisableAlarmActionsCommand(disableParams);
        await cloudWatchClient.send(disableCommand);
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({
      message: `Alarm ${action} completed successfully`,
      alarmName,
    });
  } catch (error: any) {
    console.error("Error updating alarm:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update alarm" },
      { status: 500 },
    );
  }
}

// DELETE /api/cloudwatch/alarms/[name] - Delete an alarm
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ name: string }> },
) {
  try {
    const params = await context.params;
    const alarmName = decodeURIComponent(params.name);

    const deleteParams: DeleteAlarmsCommandInput = {
      AlarmNames: [alarmName],
    };

    const command = new DeleteAlarmsCommand(deleteParams);
    await cloudWatchClient.send(command);

    return NextResponse.json({
      message: "Alarm deleted successfully",
      alarmName,
    });
  } catch (error: any) {
    console.error("Error deleting alarm:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete alarm" },
      { status: 500 },
    );
  }
}
