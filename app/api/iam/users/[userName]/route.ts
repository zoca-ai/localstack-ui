import { NextRequest, NextResponse } from "next/server";
import { iamClient } from "@/lib/aws-config";
import {
  GetUserCommand,
  UpdateUserCommand,
  DeleteUserCommand,
  ListAttachedUserPoliciesCommand,
  ListGroupsForUserCommand,
  ListAccessKeysCommand,
  ListUserPoliciesCommand,
  GetLoginProfileCommand,
} from "@aws-sdk/client-iam";

// GET /api/iam/users/[userName] - Get user details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userName: string }> },
) {
  try {
    const { userName } = await params;

    // Get user details
    const getUserCmd = new GetUserCommand({ UserName: userName });
    const userResponse = await iamClient.send(getUserCmd);
    const user = userResponse.User;

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get attached policies
    const attachedPoliciesCmd = new ListAttachedUserPoliciesCommand({
      UserName: userName,
    });
    const attachedPoliciesResp = await iamClient.send(attachedPoliciesCmd);

    // Get inline policies
    const inlinePoliciesCmd = new ListUserPoliciesCommand({
      UserName: userName,
    });
    const inlinePoliciesResp = await iamClient.send(inlinePoliciesCmd);

    // Get groups
    const groupsCmd = new ListGroupsForUserCommand({ UserName: userName });
    const groupsResp = await iamClient.send(groupsCmd);

    // Get access keys
    const keysCmd = new ListAccessKeysCommand({ UserName: userName });
    const keysResp = await iamClient.send(keysCmd);

    // Check if user has login profile (console access)
    let hasConsoleAccess = false;
    try {
      const loginProfileCmd = new GetLoginProfileCommand({
        UserName: userName,
      });
      await iamClient.send(loginProfileCmd);
      hasConsoleAccess = true;
    } catch (error) {
      // No login profile means no console access
    }

    const userDetails = {
      userName: user.UserName!,
      userId: user.UserId!,
      arn: user.Arn!,
      path: user.Path!,
      createDate: user.CreateDate!,
      passwordLastUsed: user.PasswordLastUsed,
      permissionsBoundary: user.PermissionsBoundary
        ? {
            permissionsBoundaryType:
              user.PermissionsBoundary.PermissionsBoundaryType,
            permissionsBoundaryArn:
              user.PermissionsBoundary.PermissionsBoundaryArn,
          }
        : undefined,
      tags: user.Tags?.map((tag) => ({
        key: tag.Key!,
        value: tag.Value!,
      })),
      attachedPolicies: attachedPoliciesResp.AttachedPolicies || [],
      inlinePolicies: inlinePoliciesResp.PolicyNames || [],
      groups: groupsResp.Groups || [],
      accessKeys: keysResp.AccessKeyMetadata || [],
      hasConsoleAccess,
    };

    return NextResponse.json(userDetails);
  } catch (error) {
    console.error("Error getting IAM user:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to get IAM user",
      },
      { status: 500 },
    );
  }
}

// PUT /api/iam/users/[userName] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userName: string }> },
) {
  try {
    const { userName } = await params;
    const body = await request.json();
    const { newUserName, newPath } = body;

    const command = new UpdateUserCommand({
      UserName: userName,
      NewUserName: newUserName,
      NewPath: newPath,
    });

    await iamClient.send(command);

    return NextResponse.json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Error updating IAM user:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update IAM user",
      },
      { status: 500 },
    );
  }
}

// DELETE /api/iam/users/[userName] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userName: string }> },
) {
  try {
    const { userName } = await params;

    // Note: In a real implementation, you would need to:
    // 1. Delete access keys
    // 2. Delete login profile
    // 3. Remove from groups
    // 4. Detach managed policies
    // 5. Delete inline policies
    // Then delete the user

    const command = new DeleteUserCommand({ UserName: userName });
    await iamClient.send(command);

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting IAM user:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete IAM user",
      },
      { status: 500 },
    );
  }
}
