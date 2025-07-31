import { NextRequest, NextResponse } from "next/server";
import {
  DescribeTableCommand,
  UpdateTableCommand,
} from "@aws-sdk/client-dynamodb";
import { dynamoClient } from "@/lib/aws-config";

// GET /api/dynamodb/tables/[tableName] - Get table details
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ tableName: string }> },
) {
  try {
    const { tableName } = await context.params;

    const response = await dynamoClient.send(
      new DescribeTableCommand({ TableName: tableName }),
    );

    const table = response.Table;

    return NextResponse.json({
      tableName: table?.TableName,
      tableStatus: table?.TableStatus,
      creationDateTime: table?.CreationDateTime,
      itemCount: table?.ItemCount || 0,
      tableSizeBytes: table?.TableSizeBytes || 0,
      tableArn: table?.TableArn,
      keySchema: table?.KeySchema,
      attributeDefinitions: table?.AttributeDefinitions,
      globalSecondaryIndexes: table?.GlobalSecondaryIndexes,
      localSecondaryIndexes: table?.LocalSecondaryIndexes,
      billingMode: table?.BillingModeSummary?.BillingMode,
      provisionedThroughput: table?.ProvisionedThroughput,
      streamSpecification: table?.StreamSpecification,
    });
  } catch (error: any) {
    console.error("Error describing table:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get table details" },
      { status: 500 },
    );
  }
}

// PUT /api/dynamodb/tables/[tableName] - Update table settings
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ tableName: string }> },
) {
  try {
    const { tableName } = await context.params;
    const body = await request.json();

    const {
      provisionedThroughput,
      globalSecondaryIndexUpdates,
      streamSpecification,
    } = body;

    const updateParams: any = {
      TableName: tableName,
    };

    if (provisionedThroughput) {
      updateParams.ProvisionedThroughput = provisionedThroughput;
    }

    if (globalSecondaryIndexUpdates) {
      updateParams.GlobalSecondaryIndexUpdates = globalSecondaryIndexUpdates;
    }

    if (streamSpecification) {
      updateParams.StreamSpecification = streamSpecification;
    }

    const response = await dynamoClient.send(
      new UpdateTableCommand(updateParams),
    );

    return NextResponse.json({
      success: true,
      tableDescription: response.TableDescription,
    });
  } catch (error: any) {
    console.error("Error updating table:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update table" },
      { status: 500 },
    );
  }
}
