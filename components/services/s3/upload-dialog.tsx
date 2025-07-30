'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useUploadObject } from '@/hooks/use-s3';
import { formatBytes } from '@/lib/utils';
import { Upload, X, FileIcon, CheckCircle, AlertCircle } from 'lucide-react';

interface FileUpload {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bucketName: string;
  currentPrefix: string;
}

export function UploadDialog({
  open,
  onOpenChange,
  bucketName,
  currentPrefix,
}: UploadDialogProps) {
  const [files, setFiles] = useState<Map<string, FileUpload>>(new Map());
  const uploadObject = useUploadObject();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = new Map(files);
    acceptedFiles.forEach((file) => {
      if (!newFiles.has(file.name)) {
        newFiles.set(file.name, {
          file,
          progress: 0,
          status: 'pending',
        });
      }
    });
    setFiles(newFiles);
  }, [files]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  });

  const removeFile = (fileName: string) => {
    const newFiles = new Map(files);
    newFiles.delete(fileName);
    setFiles(newFiles);
  };

  const uploadFiles = async () => {
    const filesToUpload = Array.from(files.values()).filter(
      (f) => f.status === 'pending'
    );

    for (const fileUpload of filesToUpload) {
      const newFiles = new Map(files);
      newFiles.set(fileUpload.file.name, {
        ...fileUpload,
        status: 'uploading',
      });
      setFiles(newFiles);

      try {
        await uploadObject.mutateAsync({
          bucketName,
          key: currentPrefix + fileUpload.file.name,
          file: fileUpload.file,
          onProgress: (progress) => {
            setFiles((prev) => {
              const updated = new Map(prev);
              const current = updated.get(fileUpload.file.name);
              if (current) {
                updated.set(fileUpload.file.name, {
                  ...current,
                  progress,
                });
              }
              return updated;
            });
          },
        });

        setFiles((prev) => {
          const updated = new Map(prev);
          const current = updated.get(fileUpload.file.name);
          if (current) {
            updated.set(fileUpload.file.name, {
              ...current,
              status: 'success',
              progress: 100,
            });
          }
          return updated;
        });
      } catch (error: any) {
        setFiles((prev) => {
          const updated = new Map(prev);
          const current = updated.get(fileUpload.file.name);
          if (current) {
            updated.set(fileUpload.file.name, {
              ...current,
              status: 'error',
              error: error.message || 'Upload failed',
            });
          }
          return updated;
        });
      }
    }
  };

  const allUploaded = Array.from(files.values()).every(
    (f) => f.status === 'success'
  );
  const hasFiles = files.size > 0;
  const isUploading = Array.from(files.values()).some(
    (f) => f.status === 'uploading'
  );

  const handleClose = () => {
    if (!isUploading) {
      setFiles(new Map());
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
          <DialogDescription>
            Upload files to {bucketName}/{currentPrefix || 'root'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
              transition-colors duration-200
              ${
                isDragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-muted-foreground/50'
              }
            `}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm font-medium">
              {isDragActive
                ? 'Drop the files here...'
                : 'Drag & drop files here, or click to select'}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              You can upload multiple files at once
            </p>
          </div>

          {hasFiles && (
            <ScrollArea className="h-64 rounded-lg border p-4">
              <div className="space-y-2">
                {Array.from(files.entries()).map(([name, upload]) => (
                  <div
                    key={name}
                    className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
                  >
                    <FileIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatBytes(upload.file.size)}
                      </p>
                      {upload.status === 'uploading' && (
                        <Progress value={upload.progress} className="h-1 mt-1" />
                      )}
                      {upload.error && (
                        <p className="text-xs text-destructive mt-1">{upload.error}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {upload.status === 'pending' && (
                        <Badge variant="secondary">Pending</Badge>
                      )}
                      {upload.status === 'uploading' && (
                        <Badge>{upload.progress}%</Badge>
                      )}
                      {upload.status === 'success' && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                      {upload.status === 'error' && (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      )}
                      {upload.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removeFile(name)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isUploading}>
            {allUploaded ? 'Close' : 'Cancel'}
          </Button>
          {!allUploaded && (
            <Button onClick={uploadFiles} disabled={!hasFiles || isUploading}>
              {isUploading ? 'Uploading...' : 'Upload Files'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}