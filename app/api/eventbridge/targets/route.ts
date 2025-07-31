import { NextRequest, NextResponse } from "next/server";
import { eventBridgeClient } from "@/lib/aws-config";
import {
  ListTargetsByRuleCommand,
  PutTargetsCommand,
  RemoveTargetsCommand,
} from "@aws-sdk/client-eventbridge";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rule = searchParams.get("rule");
    const eventBusName = searchParams.get("eventBusName") || "default";

    if (!rule) {
      return NextResponse.json(
        { error: "Rule name is required" },
        { status: 400 },
      );
    }

    const command = new ListTargetsByRuleCommand({
      Rule: rule,
      EventBusName: eventBusName,
    });

    const response = await eventBridgeClient.send(command);

    const targets =
      response.Targets?.map((target) => ({
        id: target.Id,
        arn: target.Arn,
        roleArn: target.RoleArn,
        input: target.Input,
        inputPath: target.InputPath,
        inputTransformer: target.InputTransformer,
        kinesisParameters: target.KinesisParameters,
        runCommandParameters: target.RunCommandParameters,
        ecsParameters: target.EcsParameters,
        batchParameters: target.BatchParameters,
        sqsParameters: target.SqsParameters,
        httpParameters: target.HttpParameters,
        redshiftDataParameters: target.RedshiftDataParameters,
        sageMakerPipelineParameters: target.SageMakerPipelineParameters,
        deadLetterConfig: target.DeadLetterConfig,
        retryPolicy: target.RetryPolicy,
      })) || [];

    return NextResponse.json(targets);
  } catch (error: any) {
    console.error("Error listing targets:", error);
    return NextResponse.json(
      { error: error.message || "Failed to list targets" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rule, eventBusName = "default", targets } = body;

    if (!rule || !targets || !Array.isArray(targets)) {
      return NextResponse.json(
        { error: "Rule name and targets array are required" },
        { status: 400 },
      );
    }

    const command = new PutTargetsCommand({
      Rule: rule,
      EventBusName: eventBusName,
      Targets: targets.map((target) => ({
        Id: target.id,
        Arn: target.arn,
        RoleArn: target.roleArn,
        Input: target.input,
        InputPath: target.inputPath,
        InputTransformer: target.inputTransformer,
        KinesisParameters: target.kinesisParameters,
        RunCommandParameters: target.runCommandParameters,
        EcsParameters: target.ecsParameters,
        BatchParameters: target.batchParameters,
        SqsParameters: target.sqsParameters,
        HttpParameters: target.httpParameters,
        RedshiftDataParameters: target.redshiftDataParameters,
        SageMakerPipelineParameters: target.sageMakerPipelineParameters,
        DeadLetterConfig: target.deadLetterConfig,
        RetryPolicy: target.retryPolicy,
      })),
    });

    const response = await eventBridgeClient.send(command);

    return NextResponse.json({
      failedEntryCount: response.FailedEntryCount,
      failedEntries: response.FailedEntries,
    });
  } catch (error: any) {
    console.error("Error adding targets:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add targets" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rule = searchParams.get("rule");
    const eventBusName = searchParams.get("eventBusName") || "default";
    const ids = searchParams.get("ids");

    if (!rule || !ids) {
      return NextResponse.json(
        { error: "Rule name and target IDs are required" },
        { status: 400 },
      );
    }

    const targetIds = ids.split(",");

    const command = new RemoveTargetsCommand({
      Rule: rule,
      EventBusName: eventBusName,
      Ids: targetIds,
    });

    const response = await eventBridgeClient.send(command);

    return NextResponse.json({
      failedEntryCount: response.FailedEntryCount,
      failedEntries: response.FailedEntries,
    });
  } catch (error: any) {
    console.error("Error removing targets:", error);
    return NextResponse.json(
      { error: error.message || "Failed to remove targets" },
      { status: 500 },
    );
  }
}
