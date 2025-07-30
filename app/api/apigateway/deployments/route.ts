import { NextRequest, NextResponse } from 'next/server';
import { apiGatewayClient } from '@/lib/aws-config';
import {
  GetDeploymentsCommand,
  CreateDeploymentCommand,
  GetStagesCommand,
  CreateStageCommand,
  DeleteStageCommand,
} from '@aws-sdk/client-api-gateway';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restApiId = searchParams.get('restApiId');
    const type = searchParams.get('type'); // 'deployments' or 'stages'
    
    if (!restApiId) {
      return NextResponse.json(
        { error: 'REST API ID is required' },
        { status: 400 }
      );
    }
    
    if (type === 'stages') {
      const command = new GetStagesCommand({
        restApiId,
      });
      
      const response = await apiGatewayClient.send(command);
      
      const stages = response.item?.map(stage => ({
        deploymentId: stage.deploymentId,
        clientCertificateId: stage.clientCertificateId,
        stageName: stage.stageName,
        description: stage.description,
        cacheClusterEnabled: stage.cacheClusterEnabled,
        cacheClusterSize: stage.cacheClusterSize,
        cacheClusterStatus: stage.cacheClusterStatus,
        methodSettings: stage.methodSettings,
        variables: stage.variables,
        documentationVersion: stage.documentationVersion,
        accessLogSettings: stage.accessLogSettings,
        canarySettings: stage.canarySettings,
        tracingEnabled: stage.tracingEnabled,
        webAclArn: stage.webAclArn,
        tags: stage.tags,
        createdDate: stage.createdDate,
        lastUpdatedDate: stage.lastUpdatedDate,
      })) || [];
      
      return NextResponse.json(stages);
    } else {
      const command = new GetDeploymentsCommand({
        restApiId,
        limit: 500,
      });
      
      const response = await apiGatewayClient.send(command);
      
      const deployments = response.items?.map(deployment => ({
        id: deployment.id,
        description: deployment.description,
        createdDate: deployment.createdDate,
        apiSummary: deployment.apiSummary,
        canarySettings: null, // This property doesn't exist in the SDK
      })) || [];
      
      return NextResponse.json(deployments);
    }
  } catch (error: any) {
    console.error('Error listing deployments/stages:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list deployments/stages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { restApiId, type, ...data } = body;
    
    if (!restApiId) {
      return NextResponse.json(
        { error: 'REST API ID is required' },
        { status: 400 }
      );
    }
    
    if (type === 'stage') {
      const { deploymentId, stageName, description, variables, cacheClusterEnabled, cacheClusterSize } = data;
      
      if (!deploymentId || !stageName) {
        return NextResponse.json(
          { error: 'Deployment ID and stage name are required' },
          { status: 400 }
        );
      }
      
      const command = new CreateStageCommand({
        restApiId,
        deploymentId,
        stageName,
        description,
        variables,
        cacheClusterEnabled,
        cacheClusterSize,
      });
      
      const response = await apiGatewayClient.send(command);
      
      return NextResponse.json({
        deploymentId: response.deploymentId,
        stageName: response.stageName,
        description: response.description,
        createdDate: response.createdDate,
        lastUpdatedDate: response.lastUpdatedDate,
        variables: response.variables,
        cacheClusterEnabled: response.cacheClusterEnabled,
        cacheClusterSize: response.cacheClusterSize,
      });
    } else {
      const { stageName, stageDescription, description, cacheClusterEnabled, cacheClusterSize, variables, canarySettings } = data;
      
      const command = new CreateDeploymentCommand({
        restApiId,
        stageName,
        stageDescription,
        description,
        cacheClusterEnabled,
        cacheClusterSize,
        variables,
        canarySettings,
      });
      
      const response = await apiGatewayClient.send(command);
      
      return NextResponse.json({
        id: response.id,
        description: response.description,
        createdDate: response.createdDate,
        apiSummary: response.apiSummary,
      });
    }
  } catch (error: any) {
    console.error('Error creating deployment/stage:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create deployment/stage' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restApiId = searchParams.get('restApiId');
    const stageName = searchParams.get('stageName');
    
    if (!restApiId || !stageName) {
      return NextResponse.json(
        { error: 'REST API ID and stage name are required' },
        { status: 400 }
      );
    }
    
    const command = new DeleteStageCommand({
      restApiId,
      stageName,
    });
    
    await apiGatewayClient.send(command);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting stage:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete stage' },
      { status: 500 }
    );
  }
}