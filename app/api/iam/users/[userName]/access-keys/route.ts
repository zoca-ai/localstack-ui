import { NextRequest, NextResponse } from 'next/server';
import { iamClient } from '@/lib/aws-config';
import { 
  ListAccessKeysCommand, 
  CreateAccessKeyCommand,
  UpdateAccessKeyCommand,
  DeleteAccessKeyCommand
} from '@aws-sdk/client-iam';
import { IAMAccessKey } from '@/types';

// GET /api/iam/users/[userName]/access-keys - List access keys for a user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userName: string }> }
) {
  try {
    const { userName } = await params;

    const command = new ListAccessKeysCommand({ UserName: userName });
    const response = await iamClient.send(command);

    const accessKeys: IAMAccessKey[] = (response.AccessKeyMetadata || []).map(key => ({
      accessKeyId: key.AccessKeyId!,
      userName: key.UserName!,
      status: key.Status! as 'Active' | 'Inactive',
      createDate: key.CreateDate!
    }));

    return NextResponse.json(accessKeys);
  } catch (error) {
    console.error('Error listing access keys:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to list access keys' },
      { status: 500 }
    );
  }
}

// POST /api/iam/users/[userName]/access-keys - Create a new access key
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userName: string }> }
) {
  try {
    const { userName } = await params;

    const command = new CreateAccessKeyCommand({ UserName: userName });
    const response = await iamClient.send(command);

    if (!response.AccessKey) {
      throw new Error('Failed to create access key');
    }

    const accessKey: IAMAccessKey = {
      accessKeyId: response.AccessKey.AccessKeyId!,
      secretAccessKey: response.AccessKey.SecretAccessKey!,
      userName: response.AccessKey.UserName!,
      status: response.AccessKey.Status! as 'Active' | 'Inactive',
      createDate: response.AccessKey.CreateDate!
    };

    // Return the access key with secret (only time it's available)
    return NextResponse.json(accessKey, { status: 201 });
  } catch (error) {
    console.error('Error creating access key:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create access key' },
      { status: 500 }
    );
  }
}

// PUT /api/iam/users/[userName]/access-keys - Update access key status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userName: string }> }
) {
  try {
    const { userName } = await params;
    const body = await request.json();
    const { accessKeyId, status } = body;

    if (!accessKeyId || !status) {
      return NextResponse.json(
        { error: 'Access key ID and status are required' },
        { status: 400 }
      );
    }

    const command = new UpdateAccessKeyCommand({
      UserName: userName,
      AccessKeyId: accessKeyId,
      Status: status
    });

    await iamClient.send(command);

    return NextResponse.json({ message: 'Access key updated successfully' });
  } catch (error) {
    console.error('Error updating access key:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update access key' },
      { status: 500 }
    );
  }
}

// DELETE /api/iam/users/[userName]/access-keys - Delete access key
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userName: string }> }
) {
  try {
    const { userName } = await params;
    const { searchParams } = new URL(request.url);
    const accessKeyId = searchParams.get('accessKeyId');

    if (!accessKeyId) {
      return NextResponse.json(
        { error: 'Access key ID is required' },
        { status: 400 }
      );
    }

    const command = new DeleteAccessKeyCommand({
      UserName: userName,
      AccessKeyId: accessKeyId
    });

    await iamClient.send(command);

    return NextResponse.json({ message: 'Access key deleted successfully' });
  } catch (error) {
    console.error('Error deleting access key:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete access key' },
      { status: 500 }
    );
  }
}