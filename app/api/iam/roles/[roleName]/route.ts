import { NextRequest, NextResponse } from 'next/server';
import { iamClient } from '@/lib/aws-config';
import { 
  GetRoleCommand, 
  UpdateRoleCommand, 
  DeleteRoleCommand,
  UpdateAssumeRolePolicyCommand,
  ListAttachedRolePoliciesCommand,
  ListRolePoliciesCommand
} from '@aws-sdk/client-iam';

// GET /api/iam/roles/[roleName] - Get role details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roleName: string }> }
) {
  try {
    const { roleName } = await params;

    // Get role details
    const getRoleCmd = new GetRoleCommand({ RoleName: roleName });
    const roleResponse = await iamClient.send(getRoleCmd);
    const role = roleResponse.Role;

    if (!role) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      );
    }

    // Get attached policies
    const attachedPoliciesCmd = new ListAttachedRolePoliciesCommand({ RoleName: roleName });
    const attachedPoliciesResp = await iamClient.send(attachedPoliciesCmd);

    // Get inline policies
    const inlinePoliciesCmd = new ListRolePoliciesCommand({ RoleName: roleName });
    const inlinePoliciesResp = await iamClient.send(inlinePoliciesCmd);

    const roleDetails = {
      roleName: role.RoleName!,
      roleId: role.RoleId!,
      arn: role.Arn!,
      path: role.Path!,
      createDate: role.CreateDate!,
      assumeRolePolicyDocument: decodeURIComponent(role.AssumeRolePolicyDocument || ''),
      description: role.Description,
      maxSessionDuration: role.MaxSessionDuration,
      permissionsBoundary: role.PermissionsBoundary ? {
        permissionsBoundaryType: role.PermissionsBoundary.PermissionsBoundaryType,
        permissionsBoundaryArn: role.PermissionsBoundary.PermissionsBoundaryArn
      } : undefined,
      tags: role.Tags?.map(tag => ({
        key: tag.Key!,
        value: tag.Value!
      })),
      attachedPolicies: attachedPoliciesResp.AttachedPolicies || [],
      inlinePolicies: inlinePoliciesResp.PolicyNames || []
    };

    return NextResponse.json(roleDetails);
  } catch (error) {
    console.error('Error getting IAM role:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get IAM role' },
      { status: 500 }
    );
  }
}

// PUT /api/iam/roles/[roleName] - Update role
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ roleName: string }> }
) {
  try {
    const { roleName } = await params;
    const body = await request.json();
    const { description, maxSessionDuration, assumeRolePolicyDocument } = body;

    // Update basic role properties if provided
    if (description !== undefined || maxSessionDuration !== undefined) {
      const updateCmd = new UpdateRoleCommand({
        RoleName: roleName,
        Description: description,
        MaxSessionDuration: maxSessionDuration
      });
      await iamClient.send(updateCmd);
    }

    // Update assume role policy if provided
    if (assumeRolePolicyDocument) {
      // Validate JSON policy document
      try {
        JSON.parse(assumeRolePolicyDocument);
      } catch (e) {
        return NextResponse.json(
          { error: 'Invalid JSON in assume role policy document' },
          { status: 400 }
        );
      }

      const updatePolicyCmd = new UpdateAssumeRolePolicyCommand({
        RoleName: roleName,
        PolicyDocument: assumeRolePolicyDocument
      });
      await iamClient.send(updatePolicyCmd);
    }

    return NextResponse.json({ message: 'Role updated successfully' });
  } catch (error) {
    console.error('Error updating IAM role:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update IAM role' },
      { status: 500 }
    );
  }
}

// DELETE /api/iam/roles/[roleName] - Delete role
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ roleName: string }> }
) {
  try {
    const { roleName } = await params;

    // Note: In a real implementation, you would need to:
    // 1. Detach managed policies
    // 2. Delete inline policies
    // Then delete the role

    const command = new DeleteRoleCommand({ RoleName: roleName });
    await iamClient.send(command);

    return NextResponse.json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Error deleting IAM role:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete IAM role' },
      { status: 500 }
    );
  }
}