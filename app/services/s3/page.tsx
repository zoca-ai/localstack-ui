'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { BucketList } from '@/components/services/s3/bucket-list';
import { CreateBucketDialog } from '@/components/services/s3/create-bucket-dialog';
import { ObjectBrowser } from '@/components/services/s3/object-browser';
import { UploadDialog } from '@/components/services/s3/upload-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function S3Page() {
  const [selectedBucket, setSelectedBucket] = useState<string | null>(null);
  const [createBucketOpen, setCreateBucketOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [currentPrefix, setCurrentPrefix] = useState('');

  const handleSelectBucket = (bucketName: string) => {
    setSelectedBucket(bucketName);
    setCurrentPrefix('');
  };

  const handleBack = () => {
    setSelectedBucket(null);
    setCurrentPrefix('');
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">S3 Management</h2>
          <p className="text-muted-foreground">
            Manage your S3 buckets and objects
          </p>
        </div>

        {!selectedBucket ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>S3 Buckets</CardTitle>
                  <CardDescription>
                    View and manage your S3 buckets
                  </CardDescription>
                </div>
                <Button onClick={() => setCreateBucketOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Bucket
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <BucketList onSelectBucket={handleSelectBucket} />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Objects in {selectedBucket}</CardTitle>
              <CardDescription>
                Browse and manage objects in this bucket
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ObjectBrowser
                bucketName={selectedBucket}
                onBack={handleBack}
                onUploadClick={(prefix) => {
                  setCurrentPrefix(prefix);
                  setUploadOpen(true);
                }}
              />
            </CardContent>
          </Card>
        )}

        <CreateBucketDialog
          open={createBucketOpen}
          onOpenChange={setCreateBucketOpen}
        />

        {selectedBucket && (
          <UploadDialog
            open={uploadOpen}
            onOpenChange={setUploadOpen}
            bucketName={selectedBucket}
            currentPrefix={currentPrefix}
          />
        )}
      </div>
    </MainLayout>
  );
}