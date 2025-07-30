import { NextRequest, NextResponse } from 'next/server';
import { iamClient } from '@/lib/aws-config';
import { 
  ListPoliciesCommand, 
  CreatePolicyCommand
} from '@aws-sdk/client-iam';
import { IAMPolicy } from '@/types';

// GET /api/iam/policies - List all IAM policies
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get('scope') || 'All'; // All, AWS, Local

    const command = new ListPoliciesCommand({
      Scope: scope as 'All' | 'AWS' | 'Local',
      OnlyAttached: false
    });
    
    const response = await iamClient.send(command);
    
    const policies: IAMPolicy[] = (response.Policies || []).map(policy => ({
      policyName: policy.PolicyName!,
      policyId: policy.PolicyId!,
      arn: policy.Arn!,
      path: policy.Path!,
      defaultVersionId: policy.DefaultVersionId!,
      attachmentCount: policy.AttachmentCount,
      permissionsBoundaryUsageCount: policy.PermissionsBoundaryUsageCount,
      isAttachable: policy.IsAttachable!,
      description: policy.Description,
      createDate: policy.CreateDate!,
      updateDate: policy.UpdateDate!,
      tags: policy.Tags?.map(tag => ({
        key: tag.Key!,
        value: tag.Value!
      }))
    }));

    return NextResponse.json(policies);
  } catch (error) {
    console.error('Error listing IAM policies:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to list IAM policies' },
      { status: 500 }
    );
  }
}

// POST /api/iam/policies - Create a new IAM policy
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      policyName, 
      policyDocument, 
      path = '/', 
      description,
      tags 
    } = body;

    if (!policyName || !policyDocument) {
      return NextResponse.json(
        { error: 'Policy name and document are required' },
        { status: 400 }
      );
    }

    // Validate JSON policy document
    try {
      JSON.parse(policyDocument);
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid JSON in policy document' },
        { status: 400 }
      );
    }

    const command = new CreatePolicyCommand({
      PolicyName: policyName,
      PolicyDocument: policyDocument,
      Path: path,
      Description: description,
      Tags: tags?.map((tag: { key: string; value: string }) => ({
        Key: tag.key,
        Value: tag.value
      }))
    });

    const response = await iamClient.send(command);
    const policy = response.Policy;

    if (!policy) {
      throw new Error('Policy creation failed');
    }

    const newPolicy: IAMPolicy = {
      policyName: policy.PolicyName!,
      policyId: policy.PolicyId!,
      arn: policy.Arn!,
      path: policy.Path!,
      defaultVersionId: policy.DefaultVersionId!,
      attachmentCount: policy.AttachmentCount,
      permissionsBoundaryUsageCount: policy.PermissionsBoundaryUsageCount,
      isAttachable: policy.IsAttachable!,
      description: policy.Description,
      createDate: policy.CreateDate!,
      updateDate: policy.UpdateDate!,
      tags: policy.Tags?.map(tag => ({
        key: tag.Key!,
        value: tag.Value!
      }))
    };

    return NextResponse.json(newPolicy, { status: 201 });
  } catch (error) {
    console.error('Error creating IAM policy:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create IAM policy' },
      { status: 500 }
    );
  }
}