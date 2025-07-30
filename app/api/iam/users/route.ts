import { NextRequest, NextResponse } from 'next/server';
import { iamClient } from '@/lib/aws-config';
import { 
  ListUsersCommand, 
  CreateUserCommand,
  ListAttachedUserPoliciesCommand,
  ListGroupsForUserCommand,
  ListAccessKeysCommand
} from '@aws-sdk/client-iam';
import { IAMUser } from '@/types';

// GET /api/iam/users - List all IAM users
export async function GET() {
  try {
    const command = new ListUsersCommand({});
    const response = await iamClient.send(command);
    
    const users: IAMUser[] = (response.Users || []).map(user => ({
      userName: user.UserName!,
      userId: user.UserId!,
      arn: user.Arn!,
      path: user.Path!,
      createDate: user.CreateDate!,
      passwordLastUsed: user.PasswordLastUsed,
      permissionsBoundary: user.PermissionsBoundary ? {
        permissionsBoundaryType: user.PermissionsBoundary.PermissionsBoundaryType,
        permissionsBoundaryArn: user.PermissionsBoundary.PermissionsBoundaryArn
      } : undefined,
      tags: user.Tags?.map(tag => ({
        key: tag.Key!,
        value: tag.Value!
      }))
    }));

    // For each user, get additional details
    const usersWithDetails = await Promise.all(
      users.map(async (user) => {
        try {
          // Get attached policies count
          const policiesCmd = new ListAttachedUserPoliciesCommand({
            UserName: user.userName
          });
          const policiesResp = await iamClient.send(policiesCmd);
          const attachedPoliciesCount = policiesResp.AttachedPolicies?.length || 0;

          // Get groups count
          const groupsCmd = new ListGroupsForUserCommand({
            UserName: user.userName
          });
          const groupsResp = await iamClient.send(groupsCmd);
          const groupsCount = groupsResp.Groups?.length || 0;

          // Get access keys count
          const keysCmd = new ListAccessKeysCommand({
            UserName: user.userName
          });
          const keysResp = await iamClient.send(keysCmd);
          const accessKeysCount = keysResp.AccessKeyMetadata?.length || 0;

          return {
            ...user,
            attachedPoliciesCount,
            groupsCount,
            accessKeysCount
          };
        } catch (error) {
          console.error(`Error fetching details for user ${user.userName}:`, error);
          return {
            ...user,
            attachedPoliciesCount: 0,
            groupsCount: 0,
            accessKeysCount: 0
          };
        }
      })
    );

    return NextResponse.json(usersWithDetails);
  } catch (error) {
    console.error('Error listing IAM users:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to list IAM users' },
      { status: 500 }
    );
  }
}

// POST /api/iam/users - Create a new IAM user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userName, path = '/', tags, permissionsBoundary } = body;

    if (!userName) {
      return NextResponse.json(
        { error: 'User name is required' },
        { status: 400 }
      );
    }

    const command = new CreateUserCommand({
      UserName: userName,
      Path: path,
      Tags: tags?.map((tag: { key: string; value: string }) => ({
        Key: tag.key,
        Value: tag.value
      })),
      PermissionsBoundary: permissionsBoundary
    });

    const response = await iamClient.send(command);
    const user = response.User;

    if (!user) {
      throw new Error('User creation failed');
    }

    const newUser: IAMUser = {
      userName: user.UserName!,
      userId: user.UserId!,
      arn: user.Arn!,
      path: user.Path!,
      createDate: user.CreateDate!,
      permissionsBoundary: user.PermissionsBoundary ? {
        permissionsBoundaryType: user.PermissionsBoundary.PermissionsBoundaryType,
        permissionsBoundaryArn: user.PermissionsBoundary.PermissionsBoundaryArn
      } : undefined,
      tags: user.Tags?.map(tag => ({
        key: tag.Key!,
        value: tag.Value!
      }))
    };

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error creating IAM user:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create IAM user' },
      { status: 500 }
    );
  }
}