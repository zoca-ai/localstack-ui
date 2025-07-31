import { NextRequest, NextResponse } from "next/server";
import {
  ListTablesCommand,
  CreateTableCommand,
  DeleteTableCommand,
  DescribeTableCommand,
  AttributeDefinition,
  KeySchemaElement,
} from "@aws-sdk/client-dynamodb";
import { dynamoClient } from "@/lib/aws-config";

// GET /api/dynamodb/tables - List all tables
export async function GET() {
  try {
    const response = await dynamoClient.send(new ListTablesCommand({}));
    const tableNames = response.TableNames || [];

    // Get details for each table
    const tableDetails = await Promise.all(
      tableNames.map(async (tableName) => {
        try {
          const describeResponse = await dynamoClient.send(
            new DescribeTableCommand({ TableName: tableName }),
          );
          const table = describeResponse.Table;

          return {
            tableName: table?.TableName || tableName,
            tableStatus: table?.TableStatus || "UNKNOWN",
            creationDateTime: table?.CreationDateTime,
            itemCount: table?.ItemCount || 0,
            tableSizeBytes: table?.TableSizeBytes || 0,
            tableArn: table?.TableArn,
            keySchema: table?.KeySchema,
          };
        } catch (error) {
          console.error(`Error describing table ${tableName}:`, error);
          return {
            tableName,
            tableStatus: "UNKNOWN",
            creationDateTime: new Date(),
            itemCount: 0,
            tableSizeBytes: 0,
          };
        }
      }),
    );

    return NextResponse.json({ tables: tableDetails });
  } catch (error: any) {
    console.error("Error listing tables:", error);
    return NextResponse.json(
      { error: error.message || "Failed to list tables" },
      { status: 500 },
    );
  }
}

// POST /api/dynamodb/tables - Create a new table
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      tableName,
      attributeDefinitions,
      keySchema,
      billingMode = "PAY_PER_REQUEST",
      provisionedThroughput,
      globalSecondaryIndexes,
      localSecondaryIndexes,
    } = body;

    if (!tableName || !attributeDefinitions || !keySchema) {
      return NextResponse.json(
        {
          error:
            "Table name, attribute definitions, and key schema are required",
        },
        { status: 400 },
      );
    }

    const params: any = {
      TableName: tableName,
      AttributeDefinitions: attributeDefinitions as AttributeDefinition[],
      KeySchema: keySchema as KeySchemaElement[],
      BillingMode: billingMode,
    };

    if (billingMode === "PROVISIONED" && provisionedThroughput) {
      params.ProvisionedThroughput = provisionedThroughput;
    }

    if (globalSecondaryIndexes) {
      params.GlobalSecondaryIndexes = globalSecondaryIndexes;
    }

    if (localSecondaryIndexes) {
      params.LocalSecondaryIndexes = localSecondaryIndexes;
    }

    const response = await dynamoClient.send(new CreateTableCommand(params));

    return NextResponse.json({
      success: true,
      tableName,
      tableDescription: response.TableDescription,
    });
  } catch (error: any) {
    console.error("Error creating table:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create table" },
      { status: 500 },
    );
  }
}

// DELETE /api/dynamodb/tables - Delete a table
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tableName = searchParams.get("tableName");

    if (!tableName) {
      return NextResponse.json(
        { error: "Table name is required" },
        { status: 400 },
      );
    }

    await dynamoClient.send(
      new DeleteTableCommand({
        TableName: tableName,
      }),
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting table:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete table" },
      { status: 500 },
    );
  }
}
