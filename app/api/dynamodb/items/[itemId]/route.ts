import { NextRequest, NextResponse } from 'next/server';
import { GetCommand, DeleteCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDocClient } from '@/lib/aws-config';

// GET /api/dynamodb/items/[itemId] - Get a single item
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ itemId: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const tableName = searchParams.get('tableName');
    const key = searchParams.get('key');
    
    if (!tableName || !key) {
      return NextResponse.json(
        { error: 'Table name and key are required' },
        { status: 400 }
      );
    }
    
    const response = await dynamoDocClient.send(new GetCommand({
      TableName: tableName,
      Key: JSON.parse(key),
    }));
    
    if (!response.Item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ item: response.Item });
  } catch (error: any) {
    console.error('Error getting item:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get item' },
      { status: 500 }
    );
  }
}

// PUT /api/dynamodb/items/[itemId] - Update an item
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ itemId: string }> }
) {
  try {
    const body = await request.json();
    const {
      tableName,
      key,
      updateExpression,
      expressionAttributeNames,
      expressionAttributeValues,
    } = body;
    
    if (!tableName || !key || !updateExpression) {
      return NextResponse.json(
        { error: 'Table name, key, and update expression are required' },
        { status: 400 }
      );
    }
    
    const updateParams: any = {
      TableName: tableName,
      Key: key,
      UpdateExpression: updateExpression,
      ReturnValues: 'ALL_NEW',
    };
    
    if (expressionAttributeNames) {
      updateParams.ExpressionAttributeNames = expressionAttributeNames;
    }
    
    if (expressionAttributeValues) {
      updateParams.ExpressionAttributeValues = expressionAttributeValues;
    }
    
    const response = await dynamoDocClient.send(new UpdateCommand(updateParams));
    
    return NextResponse.json({
      success: true,
      item: response.Attributes,
    });
  } catch (error: any) {
    console.error('Error updating item:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update item' },
      { status: 500 }
    );
  }
}

// DELETE /api/dynamodb/items/[itemId] - Delete an item
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ itemId: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const tableName = searchParams.get('tableName');
    const key = searchParams.get('key');
    
    if (!tableName || !key) {
      return NextResponse.json(
        { error: 'Table name and key are required' },
        { status: 400 }
      );
    }
    
    await dynamoDocClient.send(new DeleteCommand({
      TableName: tableName,
      Key: JSON.parse(key),
    }));
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting item:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete item' },
      { status: 500 }
    );
  }
}