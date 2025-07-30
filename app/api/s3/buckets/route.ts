import { NextRequest, NextResponse } from 'next/server';
import {
  ListBucketsCommand,
  CreateBucketCommand,
  DeleteBucketCommand,
} from '@aws-sdk/client-s3';
import { s3Client } from '@/lib/aws-config';

// GET /api/s3/buckets - List all buckets
export async function GET() {
  try {
    const response = await s3Client.send(new ListBucketsCommand({}));
    const buckets = (response.Buckets || []).map((bucket) => ({
      name: bucket.Name!,
      creationDate: bucket.CreationDate!,
    }));
    
    return NextResponse.json({ buckets });
  } catch (error: any) {
    console.error('Error listing buckets:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list buckets' },
      { status: 500 }
    );
  }
}

// POST /api/s3/buckets - Create a new bucket
export async function POST(request: NextRequest) {
  try {
    const { bucketName } = await request.json();
    
    if (!bucketName) {
      return NextResponse.json(
        { error: 'Bucket name is required' },
        { status: 400 }
      );
    }
    
    await s3Client.send(
      new CreateBucketCommand({
        Bucket: bucketName,
      })
    );
    
    return NextResponse.json({ success: true, bucketName });
  } catch (error: any) {
    console.error('Error creating bucket:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create bucket' },
      { status: 500 }
    );
  }
}

// DELETE /api/s3/buckets - Delete a bucket
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bucketName = searchParams.get('bucketName');
    
    if (!bucketName) {
      return NextResponse.json(
        { error: 'Bucket name is required' },
        { status: 400 }
      );
    }
    
    await s3Client.send(
      new DeleteBucketCommand({
        Bucket: bucketName,
      })
    );
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting bucket:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete bucket' },
      { status: 500 }
    );
  }
}