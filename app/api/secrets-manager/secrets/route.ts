import { NextRequest, NextResponse } from "next/server";
import {
  ListSecretsCommand,
  CreateSecretCommand,
  DeleteSecretCommand,
  UpdateSecretCommand,
  DescribeSecretCommand,
  GetSecretValueCommand,
  PutSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import { secretsManagerClient } from "@/lib/aws-config";

// GET /api/secrets-manager/secrets - List all secrets or get secret details
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const secretId = searchParams.get("secretId");
    const includeValue = searchParams.get("includeValue") === "true";

    if (secretId) {
      // Get secret details
      const describeResponse = await secretsManagerClient.send(
        new DescribeSecretCommand({
          SecretId: secretId,
        }),
      );

      let secretValue = null;
      if (includeValue) {
        try {
          const valueResponse = await secretsManagerClient.send(
            new GetSecretValueCommand({
              SecretId: secretId,
            }),
          );
          secretValue = {
            secretString: valueResponse.SecretString,
            secretBinary: valueResponse.SecretBinary,
            versionId: valueResponse.VersionId,
            versionStages: valueResponse.VersionStages,
          };
        } catch (error) {
          console.error("Error getting secret value:", error);
        }
      }

      return NextResponse.json({
        secret: {
          arn: describeResponse.ARN,
          name: describeResponse.Name,
          description: describeResponse.Description,
          createdDate: describeResponse.CreatedDate,
          lastChangedDate: describeResponse.LastChangedDate,
          lastAccessedDate: describeResponse.LastAccessedDate,
          tags: describeResponse.Tags?.reduce(
            (acc, tag) => {
              if (tag.Key && tag.Value) acc[tag.Key] = tag.Value;
              return acc;
            },
            {} as Record<string, string>,
          ),
          versionId: describeResponse.VersionIdsToStages
            ? Object.keys(describeResponse.VersionIdsToStages)[0]
            : undefined,
          versionStages: describeResponse.VersionIdsToStages
            ? Object.values(describeResponse.VersionIdsToStages).flat()
            : undefined,
        },
        value: secretValue,
      });
    } else {
      // List all secrets
      const response = await secretsManagerClient.send(
        new ListSecretsCommand({}),
      );
      const secrets = (response.SecretList || []).map((secret) => ({
        arn: secret.ARN,
        name: secret.Name!,
        description: secret.Description,
        createdDate: secret.CreatedDate,
        lastChangedDate: secret.LastChangedDate,
        lastAccessedDate: secret.LastAccessedDate,
        tags: secret.Tags?.reduce(
          (acc, tag) => {
            if (tag.Key && tag.Value) acc[tag.Key] = tag.Value;
            return acc;
          },
          {} as Record<string, string>,
        ),
      }));

      return NextResponse.json({ secrets });
    }
  } catch (error: any) {
    console.error("Error with secrets:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process secrets request" },
      { status: 500 },
    );
  }
}

// POST /api/secrets-manager/secrets - Create a new secret
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, secretString, secretBinary, tags } = body;

    if (!name || (!secretString && !secretBinary)) {
      return NextResponse.json(
        { error: "Name and either secretString or secretBinary are required" },
        { status: 400 },
      );
    }

    const command: any = {
      Name: name,
      Description: description,
    };

    if (secretString) {
      command.SecretString = secretString;
    }
    if (secretBinary) {
      command.SecretBinary = secretBinary;
    }
    if (tags) {
      command.Tags = Object.entries(tags).map(([key, value]) => ({
        Key: key,
        Value: value as string,
      }));
    }

    const response = await secretsManagerClient.send(
      new CreateSecretCommand(command),
    );

    return NextResponse.json({
      success: true,
      arn: response.ARN,
      name: response.Name,
      versionId: response.VersionId,
    });
  } catch (error: any) {
    console.error("Error creating secret:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create secret" },
      { status: 500 },
    );
  }
}

// PUT /api/secrets-manager/secrets - Update a secret value
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { secretId, secretString, secretBinary } = body;

    if (!secretId || (!secretString && !secretBinary)) {
      return NextResponse.json(
        {
          error:
            "SecretId and either secretString or secretBinary are required",
        },
        { status: 400 },
      );
    }

    const command: any = {
      SecretId: secretId,
    };

    if (secretString) {
      command.SecretString = secretString;
    }
    if (secretBinary) {
      command.SecretBinary = secretBinary;
    }

    const response = await secretsManagerClient.send(
      new PutSecretValueCommand(command),
    );

    return NextResponse.json({
      success: true,
      arn: response.ARN,
      name: response.Name,
      versionId: response.VersionId,
    });
  } catch (error: any) {
    console.error("Error updating secret:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update secret" },
      { status: 500 },
    );
  }
}

// DELETE /api/secrets-manager/secrets - Delete a secret
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const secretId = searchParams.get("secretId");
    const forceDelete = searchParams.get("forceDelete") === "true";

    if (!secretId) {
      return NextResponse.json(
        { error: "SecretId is required" },
        { status: 400 },
      );
    }

    const response = await secretsManagerClient.send(
      new DeleteSecretCommand({
        SecretId: secretId,
        ForceDeleteWithoutRecovery: forceDelete,
        RecoveryWindowInDays: forceDelete ? undefined : 7,
      }),
    );

    return NextResponse.json({
      success: true,
      arn: response.ARN,
      name: response.Name,
      deletionDate: response.DeletionDate,
    });
  } catch (error: any) {
    console.error("Error deleting secret:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete secret" },
      { status: 500 },
    );
  }
}
