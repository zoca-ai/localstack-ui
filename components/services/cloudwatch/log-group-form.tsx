'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateCloudWatchLogGroup, useUpdateCloudWatchLogGroup } from '@/hooks/use-cloudwatch';
import type { CloudWatchLogGroup } from '@/types';

const RETENTION_OPTIONS = [
  { value: '1', label: '1 day' },
  { value: '3', label: '3 days' },
  { value: '5', label: '5 days' },
  { value: '7', label: '1 week' },
  { value: '14', label: '2 weeks' },
  { value: '30', label: '1 month' },
  { value: '60', label: '2 months' },
  { value: '90', label: '3 months' },
  { value: '120', label: '4 months' },
  { value: '150', label: '5 months' },
  { value: '180', label: '6 months' },
  { value: '365', label: '1 year' },
  { value: '400', label: '400 days' },
  { value: '545', label: '545 days' },
  { value: '731', label: '2 years' },
  { value: '1827', label: '5 years' },
  { value: '3653', label: '10 years' },
];

const formSchema = z.object({
  logGroupName: z.string()
    .min(1, 'Log group name is required')
    .max(512, 'Log group name must be less than 512 characters')
    .regex(/^[\.\-_/#A-Za-z0-9]+$/, 'Log group name contains invalid characters'),
  retentionInDays: z.string().optional(),
  kmsKeyId: z.string().optional(),
});

interface LogGroupFormProps {
  logGroup?: CloudWatchLogGroup;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function LogGroupForm({ logGroup, onSuccess, onCancel }: LogGroupFormProps) {
  const createLogGroupMutation = useCreateCloudWatchLogGroup();
  const updateLogGroupMutation = useUpdateCloudWatchLogGroup();
  const isEditing = !!logGroup;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      logGroupName: logGroup?.logGroupName || '',
      retentionInDays: logGroup?.retentionInDays?.toString() || '',
      kmsKeyId: logGroup?.kmsKeyId || '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (isEditing) {
        await updateLogGroupMutation.mutateAsync({
          logGroupName: values.logGroupName,
          retentionInDays: values.retentionInDays ? parseInt(values.retentionInDays) : undefined,
        });
      } else {
        await createLogGroupMutation.mutateAsync({
          logGroupName: values.logGroupName,
          retentionInDays: values.retentionInDays ? parseInt(values.retentionInDays) : undefined,
          kmsKeyId: values.kmsKeyId || undefined,
        });
      }
      onSuccess?.();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="logGroupName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Log Group Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="/aws/lambda/my-function"
                  {...field}
                  disabled={isEditing}
                />
              </FormControl>
              <FormDescription>
                The name of the log group. Use forward slashes to organize log groups.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="retentionInDays"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Retention Period</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Never expire" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">Never expire</SelectItem>
                  {RETENTION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                How long to retain log events. After this time, they are automatically deleted.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {!isEditing && (
          <FormField
            control={form.control}
            name="kmsKeyId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>KMS Key ID (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="arn:aws:kms:region:account-id:key/key-id"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  The ARN of the KMS key to use for encrypting log data.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? isEditing
                ? 'Updating...'
                : 'Creating...'
              : isEditing
              ? 'Update Log Group'
              : 'Create Log Group'}
          </Button>
        </div>
      </form>
    </Form>
  );
}