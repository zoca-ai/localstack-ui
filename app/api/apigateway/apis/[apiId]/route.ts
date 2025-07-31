import { NextRequest, NextResponse } from "next/server";
import { apiGatewayClient } from "@/lib/aws-config";
import {
  GetRestApiCommand,
  UpdateRestApiCommand,
} from "@aws-sdk/client-api-gateway";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ apiId: string }> },
) {
  try {
    const params = await context.params;
    const command = new GetRestApiCommand({
      restApiId: params.apiId,
    });

    const response = await apiGatewayClient.send(command);

    return NextResponse.json({
      id: response.id,
      name: response.name,
      description: response.description,
      createdDate: response.createdDate,
      version: response.version,
      warnings: response.warnings,
      binaryMediaTypes: response.binaryMediaTypes,
      minimumCompressionSize: response.minimumCompressionSize,
      apiKeySource: response.apiKeySource,
      endpointConfiguration: response.endpointConfiguration,
      policy: response.policy,
      tags: response.tags,
      disableExecuteApiEndpoint: response.disableExecuteApiEndpoint,
      rootResourceId: response.rootResourceId,
    });
  } catch (error: any) {
    console.error("Error getting REST API:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get REST API" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ apiId: string }> },
) {
  try {
    const params = await context.params;
    const body = await request.json();
    const { patchOperations } = body;

    if (!patchOperations || !Array.isArray(patchOperations)) {
      return NextResponse.json(
        { error: "Patch operations are required" },
        { status: 400 },
      );
    }

    const command = new UpdateRestApiCommand({
      restApiId: params.apiId,
      patchOperations,
    });

    const response = await apiGatewayClient.send(command);

    return NextResponse.json({
      id: response.id,
      name: response.name,
      description: response.description,
      createdDate: response.createdDate,
      version: response.version,
      warnings: response.warnings,
      binaryMediaTypes: response.binaryMediaTypes,
      minimumCompressionSize: response.minimumCompressionSize,
      apiKeySource: response.apiKeySource,
      endpointConfiguration: response.endpointConfiguration,
      policy: response.policy,
      tags: response.tags,
      disableExecuteApiEndpoint: response.disableExecuteApiEndpoint,
    });
  } catch (error: any) {
    console.error("Error updating REST API:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update REST API" },
      { status: 500 },
    );
  }
}
