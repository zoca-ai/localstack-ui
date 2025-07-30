import { NextRequest, NextResponse } from 'next/server';
import { iamClient } from '@/lib/aws-config';
import { 
  GetPolicyCommand, 
  GetPolicyVersionCommand,
  CreatePolicyVersionCommand,
  DeletePolicyCommand,
  ListPolicyVersionsCommand
} from '@aws-sdk/client-iam';
import { IAMPolicyVersion } from '@/types';

// GET /api/iam/policies/[policyArn] - Get policy details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ policyArn: string }> }
) {
  try {
    const { policyArn: encodedArn } = await params;
    const policyArn = decodeURIComponent(encodedArn);

    // Get policy details
    const getPolicyCmd = new GetPolicyCommand({ PolicyArn: policyArn });
    const policyResponse = await iamClient.send(getPolicyCmd);
    const policy = policyResponse.Policy;

    if (!policy) {
      return NextResponse.json(
        { error: 'Policy not found' },
        { status: 404 }
      );
    }

    // Get policy document
    const getPolicyVersionCmd = new GetPolicyVersionCommand({
      PolicyArn: policyArn,
      VersionId: policy.DefaultVersionId
    });
    const versionResponse = await iamClient.send(getPolicyVersionCmd);
    const policyVersion = versionResponse.PolicyVersion;

    // Get all versions
    const listVersionsCmd = new ListPolicyVersionsCommand({ PolicyArn: policyArn });
    const versionsResponse = await iamClient.send(listVersionsCmd);
    
    const versions: IAMPolicyVersion[] = (versionsResponse.Versions || []).map(v => ({
      versionId: v.VersionId!,
      isDefaultVersion: v.IsDefaultVersion!,
      createDate: v.CreateDate!,
      document: '' // We'll only fetch the document for the default version
    }));

    const policyDetails = {
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
      policyDocument: decodeURIComponent(policyVersion?.Document || ''),
      versions,
      tags: policy.Tags?.map(tag => ({
        key: tag.Key!,
        value: tag.Value!
      }))
    };

    return NextResponse.json(policyDetails);
  } catch (error) {
    console.error('Error getting IAM policy:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get IAM policy' },
      { status: 500 }
    );
  }
}

// PUT /api/iam/policies/[policyArn] - Update policy (create new version)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ policyArn: string }> }
) {
  try {
    const { policyArn: encodedArn } = await params;
    const policyArn = decodeURIComponent(encodedArn);
    const body = await request.json();
    const { policyDocument, setAsDefault = true } = body;

    if (!policyDocument) {
      return NextResponse.json(
        { error: 'Policy document is required' },
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

    const command = new CreatePolicyVersionCommand({
      PolicyArn: policyArn,
      PolicyDocument: policyDocument,
      SetAsDefault: setAsDefault
    });

    const response = await iamClient.send(command);

    return NextResponse.json({ 
      message: 'Policy updated successfully',
      versionId: response.PolicyVersion?.VersionId
    });
  } catch (error) {
    console.error('Error updating IAM policy:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update IAM policy' },
      { status: 500 }
    );
  }
}

// DELETE /api/iam/policies/[policyArn] - Delete policy
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ policyArn: string }> }
) {
  try {
    const { policyArn: encodedArn } = await params;
    const policyArn = decodeURIComponent(encodedArn);

    // Note: Policy must not be attached to any users, groups, or roles
    const command = new DeletePolicyCommand({ PolicyArn: policyArn });
    await iamClient.send(command);

    return NextResponse.json({ message: 'Policy deleted successfully' });
  } catch (error) {
    console.error('Error deleting IAM policy:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete IAM policy' },
      { status: 500 }
    );
  }
}