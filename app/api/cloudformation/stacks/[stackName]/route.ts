import { NextRequest, NextResponse } from "next/server";
import { cloudFormationClient } from "@/lib/aws-config";
import {
  DescribeStacksCommand,
  GetTemplateCommand,
} from "@aws-sdk/client-cloudformation";

export async function GET(
  request: NextRequest,
  { params }: { params: { stackName: string } },
) {
  try {
    const { searchParams } = new URL(request.url);
    const getTemplate = searchParams.get("template") === "true";

    if (getTemplate) {
      const command = new GetTemplateCommand({
        StackName: params.stackName,
        TemplateStage: "Processed",
      });

      const response = await cloudFormationClient.send(command);

      return NextResponse.json({
        templateBody: response.TemplateBody,
        stagesAvailable: response.StagesAvailable,
      });
    } else {
      const command = new DescribeStacksCommand({
        StackName: params.stackName,
      });

      const response = await cloudFormationClient.send(command);
      const stack = response.Stacks?.[0];

      if (!stack) {
        return NextResponse.json({ error: "Stack not found" }, { status: 404 });
      }

      return NextResponse.json({
        stackId: stack.StackId,
        stackName: stack.StackName,
        changeSetId: stack.ChangeSetId,
        description: stack.Description,
        parameters: stack.Parameters,
        creationTime: stack.CreationTime,
        deletionTime: stack.DeletionTime,
        lastUpdatedTime: stack.LastUpdatedTime,
        rollbackConfiguration: stack.RollbackConfiguration,
        stackStatus: stack.StackStatus,
        stackStatusReason: stack.StackStatusReason,
        disableRollback: stack.DisableRollback,
        notificationARNs: stack.NotificationARNs,
        timeoutInMinutes: stack.TimeoutInMinutes,
        capabilities: stack.Capabilities,
        outputs: stack.Outputs,
        roleARN: stack.RoleARN,
        tags: stack.Tags,
        enableTerminationProtection: stack.EnableTerminationProtection,
        parentId: stack.ParentId,
        rootId: stack.RootId,
        driftInformation: stack.DriftInformation,
        retainExceptOnCreate: stack.RetainExceptOnCreate,
      });
    }
  } catch (error: any) {
    console.error("Error describing stack:", error);
    return NextResponse.json(
      { error: error.message || "Failed to describe stack" },
      { status: 500 },
    );
  }
}
