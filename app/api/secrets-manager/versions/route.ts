import { NextRequest, NextResponse } from "next/server";
import {
  ListSecretVersionIdsCommand,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import { secretsManagerClient } from "@/lib/aws-config";

// GET /api/secrets-manager/versions - List secret versions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const secretId = searchParams.get("secretId");
    const versionId = searchParams.get("versionId");

    if (!secretId) {
      return NextResponse.json(
        { error: "SecretId is required" },
        { status: 400 },
      );
    }

    if (versionId) {
      // Get specific version value
      const response = await secretsManagerClient.send(
        new GetSecretValueCommand({
          SecretId: secretId,
          VersionId: versionId,
        }),
      );

      return NextResponse.json({
        arn: response.ARN,
        name: response.Name,
        versionId: response.VersionId,
        secretString: response.SecretString,
        secretBinary: response.SecretBinary,
        versionStages: response.VersionStages,
        createdDate: response.CreatedDate,
      });
    } else {
      // List all versions
      const response = await secretsManagerClient.send(
        new ListSecretVersionIdsCommand({
          SecretId: secretId,
        }),
      );

      const versions = Object.entries(response.Versions || {}).map(
        ([versionId, stages]) => ({
          versionId,
          versionStages: stages as string[],
          createdDate: new Date(), // LocalStack might not provide dates
        }),
      );

      return NextResponse.json({ versions });
    }
  } catch (error: any) {
    console.error("Error with secret versions:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process versions request" },
      { status: 500 },
    );
  }
}
