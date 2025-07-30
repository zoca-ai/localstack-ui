import { NextRequest, NextResponse } from 'next/server';
import { apiGatewayClient } from '@/lib/aws-config';
import {
  GetResourcesCommand,
  CreateResourceCommand,
  DeleteResourceCommand,
} from '@aws-sdk/client-api-gateway';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restApiId = searchParams.get('restApiId');
    
    if (!restApiId) {
      return NextResponse.json(
        { error: 'REST API ID is required' },
        { status: 400 }
      );
    }
    
    const command = new GetResourcesCommand({
      restApiId,
      limit: 500,
    });
    
    const response = await apiGatewayClient.send(command);
    
    const resources = response.items?.map(resource => ({
      id: resource.id,
      parentId: resource.parentId,
      pathPart: resource.pathPart,
      path: resource.path,
      resourceMethods: resource.resourceMethods,
    })) || [];
    
    return NextResponse.json(resources);
  } catch (error: any) {
    console.error('Error listing resources:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list resources' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { restApiId, parentId, pathPart } = body;
    
    if (!restApiId || !parentId || !pathPart) {
      return NextResponse.json(
        { error: 'REST API ID, parent ID, and path part are required' },
        { status: 400 }
      );
    }
    
    const command = new CreateResourceCommand({
      restApiId,
      parentId,
      pathPart,
    });
    
    const response = await apiGatewayClient.send(command);
    
    return NextResponse.json({
      id: response.id,
      parentId: response.parentId,
      pathPart: response.pathPart,
      path: response.path,
      resourceMethods: response.resourceMethods,
    });
  } catch (error: any) {
    console.error('Error creating resource:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create resource' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restApiId = searchParams.get('restApiId');
    const resourceId = searchParams.get('resourceId');
    
    if (!restApiId || !resourceId) {
      return NextResponse.json(
        { error: 'REST API ID and resource ID are required' },
        { status: 400 }
      );
    }
    
    const command = new DeleteResourceCommand({
      restApiId,
      resourceId,
    });
    
    await apiGatewayClient.send(command);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting resource:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete resource' },
      { status: 500 }
    );
  }
}