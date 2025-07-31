import { NextRequest, NextResponse } from "next/server";
import { apiGatewayClient } from "@/lib/aws-config";
import {
  GetRestApisCommand,
  CreateRestApiCommand,
  DeleteRestApiCommand,
} from "@aws-sdk/client-api-gateway";

export async function GET() {
  try {
    const command = new GetRestApisCommand({
      limit: 500,
    });

    const response = await apiGatewayClient.send(command);

    const apis =
      response.items?.map((api) => ({
        id: api.id,
        name: api.name,
        description: api.description,
        createdDate: api.createdDate,
        version: api.version,
        warnings: api.warnings,
        binaryMediaTypes: api.binaryMediaTypes,
        minimumCompressionSize: api.minimumCompressionSize,
        apiKeySource: api.apiKeySource,
        endpointConfiguration: api.endpointConfiguration,
        policy: api.policy,
        tags: api.tags,
        disableExecuteApiEndpoint: api.disableExecuteApiEndpoint,
      })) || [];

    return NextResponse.json(apis);
  } catch (error: any) {
    console.error("Error listing REST APIs:", error);
    return NextResponse.json(
      { error: error.message || "Failed to list REST APIs" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      version,
      cloneFrom,
      binaryMediaTypes,
      minimumCompressionSize,
      apiKeySource,
      endpointConfiguration,
      policy,
      tags,
      disableExecuteApiEndpoint,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: "API name is required" },
        { status: 400 },
      );
    }

    const command = new CreateRestApiCommand({
      name,
      description,
      version,
      cloneFrom,
      binaryMediaTypes,
      minimumCompressionSize,
      apiKeySource,
      endpointConfiguration,
      policy,
      tags,
      disableExecuteApiEndpoint,
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
    console.error("Error creating REST API:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create REST API" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restApiId = searchParams.get("restApiId");

    if (!restApiId) {
      return NextResponse.json(
        { error: "REST API ID is required" },
        { status: 400 },
      );
    }

    const command = new DeleteRestApiCommand({
      restApiId,
    });

    await apiGatewayClient.send(command);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting REST API:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete REST API" },
      { status: 500 },
    );
  }
}
