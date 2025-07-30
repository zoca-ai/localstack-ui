import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '@/lib/aws-config';

// POST /api/s3/objects/upload - Upload an object
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const bucketName = formData.get('bucketName') as string;
    const key = formData.get('key') as string;
    
    if (!file || !bucketName || !key) {
      return NextResponse.json(
        { error: 'File, bucket name, and key are required' },
        { status: 400 }
      );
    }
    
    const buffer = Buffer.from(await file.arrayBuffer());
    
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      })
    );
    
    return NextResponse.json({ success: true, key });
  } catch (error: any) {
    console.error('Error uploading object:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload object' },
      { status: 500 }
    );
  }
}