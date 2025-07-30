import { NextRequest, NextResponse } from 'next/server';
import { ScanCommand, PutItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';
import { dynamoDocClient } from '@/lib/aws-config';
import { ScanCommand as DocScanCommand, PutCommand, QueryCommand as DocQueryCommand } from '@aws-sdk/lib-dynamodb';

// GET /api/dynamodb/items - Scan or Query items from a table
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tableName = searchParams.get('tableName');
    const operation = searchParams.get('operation') || 'scan';
    const limit = parseInt(searchParams.get('limit') || '50');
    const exclusiveStartKey = searchParams.get('exclusiveStartKey');
    
    if (!tableName) {
      return NextResponse.json(
        { error: 'Table name is required' },
        { status: 400 }
      );
    }
    
    let response;
    
    if (operation === 'query') {
      // For query operation, we need key conditions
      const keyConditionExpression = searchParams.get('keyConditionExpression');
      const expressionAttributeNames = searchParams.get('expressionAttributeNames');
      const expressionAttributeValues = searchParams.get('expressionAttributeValues');
      
      if (!keyConditionExpression) {
        return NextResponse.json(
          { error: 'Key condition expression is required for query operation' },
          { status: 400 }
        );
      }
      
      const queryParams: any = {
        TableName: tableName,
        KeyConditionExpression: keyConditionExpression,
        Limit: limit,
      };
      
      if (expressionAttributeNames) {
        queryParams.ExpressionAttributeNames = JSON.parse(expressionAttributeNames);
      }
      
      if (expressionAttributeValues) {
        queryParams.ExpressionAttributeValues = JSON.parse(expressionAttributeValues);
      }
      
      if (exclusiveStartKey) {
        queryParams.ExclusiveStartKey = JSON.parse(exclusiveStartKey);
      }
      
      response = await dynamoDocClient.send(new DocQueryCommand(queryParams));
    } else {
      // Default to scan operation
      const scanParams: any = {
        TableName: tableName,
        Limit: limit,
      };
      
      if (exclusiveStartKey) {
        scanParams.ExclusiveStartKey = JSON.parse(exclusiveStartKey);
      }
      
      response = await dynamoDocClient.send(new DocScanCommand(scanParams));
    }
    
    return NextResponse.json({
      items: response.Items || [],
      count: response.Count || 0,
      scannedCount: response.ScannedCount || 0,
      lastEvaluatedKey: response.LastEvaluatedKey,
    });
  } catch (error: any) {
    console.error('Error fetching items:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch items' },
      { status: 500 }
    );
  }
}

// POST /api/dynamodb/items - Create or update an item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tableName, item } = body;
    
    if (!tableName || !item) {
      return NextResponse.json(
        { error: 'Table name and item are required' },
        { status: 400 }
      );
    }
    
    await dynamoDocClient.send(new PutCommand({
      TableName: tableName,
      Item: item,
    }));
    
    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    console.error('Error creating item:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create item' },
      { status: 500 }
    );
  }
}