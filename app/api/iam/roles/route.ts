import { NextRequest, NextResponse } from "next/server";
import { iamClient } from "@/lib/aws-config";
import {
  ListRolesCommand,
  CreateRoleCommand,
  ListAttachedRolePoliciesCommand,
} from "@aws-sdk/client-iam";
import { IAMRole } from "@/types";

// GET /api/iam/roles - List all IAM roles
export async function GET() {
  try {
    const command = new ListRolesCommand({});
    const response = await iamClient.send(command);

    const roles: IAMRole[] = (response.Roles || []).map((role) => ({
      roleName: role.RoleName!,
      roleId: role.RoleId!,
      arn: role.Arn!,
      path: role.Path!,
      createDate: role.CreateDate!,
      assumeRolePolicyDocument: decodeURIComponent(
        role.AssumeRolePolicyDocument || "",
      ),
      description: role.Description,
      maxSessionDuration: role.MaxSessionDuration,
      permissionsBoundary: role.PermissionsBoundary
        ? {
            permissionsBoundaryType:
              role.PermissionsBoundary.PermissionsBoundaryType,
            permissionsBoundaryArn:
              role.PermissionsBoundary.PermissionsBoundaryArn,
          }
        : undefined,
      tags: role.Tags?.map((tag) => ({
        key: tag.Key!,
        value: tag.Value!,
      })),
    }));

    // For each role, get attached policies count
    const rolesWithDetails = await Promise.all(
      roles.map(async (role) => {
        try {
          const policiesCmd = new ListAttachedRolePoliciesCommand({
            RoleName: role.roleName,
          });
          const policiesResp = await iamClient.send(policiesCmd);
          const attachedPoliciesCount =
            policiesResp.AttachedPolicies?.length || 0;

          return {
            ...role,
            attachedPoliciesCount,
          };
        } catch (error) {
          console.error(
            `Error fetching details for role ${role.roleName}:`,
            error,
          );
          return {
            ...role,
            attachedPoliciesCount: 0,
          };
        }
      }),
    );

    return NextResponse.json(rolesWithDetails);
  } catch (error) {
    console.error("Error listing IAM roles:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to list IAM roles",
      },
      { status: 500 },
    );
  }
}

// POST /api/iam/roles - Create a new IAM role
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      roleName,
      assumeRolePolicyDocument,
      path = "/",
      description,
      maxSessionDuration,
      tags,
      permissionsBoundary,
    } = body;

    if (!roleName || !assumeRolePolicyDocument) {
      return NextResponse.json(
        { error: "Role name and assume role policy document are required" },
        { status: 400 },
      );
    }

    // Validate JSON policy document
    try {
      JSON.parse(assumeRolePolicyDocument);
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid JSON in assume role policy document" },
        { status: 400 },
      );
    }

    const command = new CreateRoleCommand({
      RoleName: roleName,
      AssumeRolePolicyDocument: assumeRolePolicyDocument,
      Path: path,
      Description: description,
      MaxSessionDuration: maxSessionDuration,
      PermissionsBoundary: permissionsBoundary,
      Tags: tags?.map((tag: { key: string; value: string }) => ({
        Key: tag.key,
        Value: tag.value,
      })),
    });

    const response = await iamClient.send(command);
    const role = response.Role;

    if (!role) {
      throw new Error("Role creation failed");
    }

    const newRole: IAMRole = {
      roleName: role.RoleName!,
      roleId: role.RoleId!,
      arn: role.Arn!,
      path: role.Path!,
      createDate: role.CreateDate!,
      assumeRolePolicyDocument: decodeURIComponent(
        role.AssumeRolePolicyDocument || "",
      ),
      description: role.Description,
      maxSessionDuration: role.MaxSessionDuration,
      permissionsBoundary: role.PermissionsBoundary
        ? {
            permissionsBoundaryType:
              role.PermissionsBoundary.PermissionsBoundaryType,
            permissionsBoundaryArn:
              role.PermissionsBoundary.PermissionsBoundaryArn,
          }
        : undefined,
      tags: role.Tags?.map((tag) => ({
        key: tag.Key!,
        value: tag.Value!,
      })),
    };

    return NextResponse.json(newRole, { status: 201 });
  } catch (error) {
    console.error("Error creating IAM role:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create IAM role",
      },
      { status: 500 },
    );
  }
}
