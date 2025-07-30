'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCreateBucket } from '@/hooks/use-s3';

const bucketSchema = z.object({
  bucketName: z
    .string()
    .min(3, 'Bucket name must be at least 3 characters')
    .max(63, 'Bucket name must be less than 63 characters')
    .regex(
      /^[a-z0-9][a-z0-9.-]*[a-z0-9]$/,
      'Bucket name must start and end with a lowercase letter or number, and can contain lowercase letters, numbers, hyphens, and dots'
    )
    .refine(
      (name) => !name.includes('..'),
      'Bucket name cannot contain consecutive dots'
    )
    .refine(
      (name) => !name.match(/^\d+\.\d+\.\d+\.\d+$/),
      'Bucket name cannot be formatted as an IP address'
    ),
});

type BucketFormValues = z.infer<typeof bucketSchema>;

interface CreateBucketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateBucketDialog({ open, onOpenChange }: CreateBucketDialogProps) {
  const createBucket = useCreateBucket();
  const [isCreating, setIsCreating] = useState(false);

  const form = useForm<BucketFormValues>({
    resolver: zodResolver(bucketSchema),
    defaultValues: {
      bucketName: '',
    },
  });

  const onSubmit = async (values: BucketFormValues) => {
    setIsCreating(true);
    try {
      await createBucket.mutateAsync(values.bucketName);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the mutation
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create S3 Bucket</DialogTitle>
          <DialogDescription>
            Create a new S3 bucket in your LocalStack instance.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="bucketName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bucket Name</FormLabel>
                  <FormControl>
                    <Input placeholder="my-bucket-name" {...field} />
                  </FormControl>
                  <FormDescription>
                    Must be globally unique and follow S3 naming conventions
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create Bucket'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}