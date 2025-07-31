import { NextRequest, NextResponse } from "next/server";
import {
  ListFunctionsCommand,
  GetFunctionCommand,
  GetFunctionConfigurationCommand,
} from "@aws-sdk/client-lambda";
import { lambdaClient } from "@/lib/aws-config";

// GET /api/lambda/functions - List all functions or get function details
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const functionName = searchParams.get("functionName");

    if (functionName) {
      // Get specific function details
      try {
        const [configResponse, functionResponse] = await Promise.all([
          lambdaClient.send(
            new GetFunctionConfigurationCommand({
              FunctionName: functionName,
            }),
          ),
          lambdaClient.send(
            new GetFunctionCommand({
              FunctionName: functionName,
            }),
          ),
        ]);

        const functionData = {
          functionName: configResponse.FunctionName,
          functionArn: configResponse.FunctionArn,
          runtime: configResponse.Runtime,
          role: configResponse.Role,
          handler: configResponse.Handler,
          codeSize: configResponse.CodeSize,
          description: configResponse.Description,
          timeout: configResponse.Timeout,
          memorySize: configResponse.MemorySize,
          lastModified: configResponse.LastModified,
          codeSha256: configResponse.CodeSha256,
          version: configResponse.Version,
          environment: configResponse.Environment,
          state: configResponse.State,
          stateReason: configResponse.StateReason,
          stateReasonCode: configResponse.StateReasonCode,
          vpcConfig: configResponse.VpcConfig,
          layers: configResponse.Layers,
          tags: functionResponse.Tags,
          code: {
            repositoryType: functionResponse.Code?.RepositoryType,
            location: functionResponse.Code?.Location,
          },
          configuration: functionResponse.Configuration,
        };

        return NextResponse.json({ function: functionData });
      } catch (error: any) {
        if (error.name === "ResourceNotFoundException") {
          return NextResponse.json(
            { error: `Function ${functionName} not found` },
            { status: 404 },
          );
        }
        throw error;
      }
    } else {
      // List all functions
      const response = await lambdaClient.send(new ListFunctionsCommand({}));
      const functions = (response.Functions || []).map((func) => ({
        functionName: func.FunctionName!,
        functionArn: func.FunctionArn,
        runtime: func.Runtime,
        role: func.Role,
        handler: func.Handler,
        codeSize: func.CodeSize,
        description: func.Description,
        timeout: func.Timeout,
        memorySize: func.MemorySize,
        lastModified: func.LastModified,
        codeSha256: func.CodeSha256,
        version: func.Version,
        environment: func.Environment,
        state: func.State,
        stateReason: func.StateReason,
        stateReasonCode: func.StateReasonCode,
        vpcConfig: func.VpcConfig,
        layers: func.Layers,
      }));

      return NextResponse.json({ functions });
    }
  } catch (error: any) {
    console.error("Error with Lambda functions:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process Lambda request" },
      { status: 500 },
    );
  }
}
