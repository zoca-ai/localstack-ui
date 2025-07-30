import { NextRequest, NextResponse } from 'next/server';
import {
  ListObjectsV2Command,
  GetObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3';
import { s3Client } from '@/lib/aws-config';

// GET /api/s3/objects - List objects in a bucket
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bucketName = searchParams.get('bucketName');
    const prefix = searchParams.get('prefix') || '';
    
    if (!bucketName) {
      return NextResponse.json(
        { error: 'Bucket name is required' },
        { status: 400 }
      );
    }
    
    const response = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: prefix,
        Delimiter: '/',
      })
    );
    
    const objects = (response.Contents || []).map((obj) => ({
      key: obj.Key!,
      size: obj.Size!,
      lastModified: obj.LastModified!,
      eTag: obj.ETag,
      storageClass: obj.StorageClass,
    }));
    
    const prefixes = (response.CommonPrefixes || []).map((p) => p.Prefix!);
    
    return NextResponse.json({
      objects,
      prefixes,
      isTruncated: response.IsTruncated || false,
      nextContinuationToken: response.NextContinuationToken,
    });
  } catch (error: any) {
    console.error('Error listing objects:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list objects' },
      { status: 500 }
    );
  }
}

// DELETE /api/s3/objects - Delete object(s)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bucketName = searchParams.get('bucketName');
    const keys = searchParams.getAll('key');
    
    if (!bucketName || keys.length === 0) {
      return NextResponse.json(
        { error: 'Bucket name and keys are required' },
        { status: 400 }
      );
    }
    
    if (keys.length === 1) {
      // Delete single object
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: bucketName,
          Key: keys[0],
        })
      );
    } else {
      // Delete multiple objects
      await s3Client.send(
        new DeleteObjectsCommand({
          Bucket: bucketName,
          Delete: {
            Objects: keys.map((key) => ({ Key: key })),
          },
        })
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting objects:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete objects' },
      { status: 500 }
    );
  }
}