"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCreateCloudWatchLogStream } from "@/hooks/use-cloudwatch";

const formSchema = z.object({
  logStreamName: z
    .string()
    .min(1, "Log stream name is required")
    .max(512, "Log stream name must be less than 512 characters")
    .regex(
      /^[\.\-_/#A-Za-z0-9]+$/,
      "Log stream name contains invalid characters",
    ),
});

interface LogStreamFormProps {
  logGroupName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function LogStreamForm({
  logGroupName,
  onSuccess,
  onCancel,
}: LogStreamFormProps) {
  const createLogStreamMutation = useCreateCloudWatchLogStream();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      logStreamName: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await createLogStreamMutation.mutateAsync({
        logGroupName,
        logStreamName: values.logStreamName,
      });
      onSuccess?.();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  return (
    <div className="rounded-lg border p-4 space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="logStreamName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Log Stream Name</FormLabel>
                <FormControl>
                  <Input placeholder="my-application-instance-1" {...field} />
                </FormControl>
                <FormDescription>
                  A unique name for the log stream within this log group
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Creating..." : "Create Stream"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
