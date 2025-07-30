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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useCreateCloudWatchAlarm } from '@/hooks/use-cloudwatch';
import type { CloudWatchAlarm } from '@/types';

const STATISTICS = [
  { value: 'Average', label: 'Average' },
  { value: 'Sum', label: 'Sum' },
  { value: 'SampleCount', label: 'Sample Count' },
  { value: 'Maximum', label: 'Maximum' },
  { value: 'Minimum', label: 'Minimum' },
];

const COMPARISON_OPERATORS = [
  { value: 'GreaterThanThreshold', label: 'Greater than (>)' },
  { value: 'GreaterThanOrEqualToThreshold', label: 'Greater than or equal (≥)' },
  { value: 'LessThanThreshold', label: 'Less than (<)' },
  { value: 'LessThanOrEqualToThreshold', label: 'Less than or equal (≤)' },
  { value: 'LessThanLowerOrGreaterThanUpperThreshold', label: 'Outside range' },
  { value: 'LessThanLowerThreshold', label: 'Less than lower' },
  { value: 'GreaterThanUpperThreshold', label: 'Greater than upper' },
];

const TREAT_MISSING_DATA = [
  { value: 'breaching', label: 'Treat as breaching threshold' },
  { value: 'notBreaching', label: 'Treat as not breaching threshold' },
  { value: 'ignore', label: 'Ignore and maintain current state' },
  { value: 'missing', label: 'Treat as missing data' },
];

const formSchema = z.object({
  alarmName: z.string()
    .min(1, 'Alarm name is required')
    .max(255, 'Alarm name must be less than 255 characters'),
  alarmDescription: z.string().optional(),
  metricName: z.string().min(1, 'Metric name is required'),
  namespace: z.string().min(1, 'Namespace is required'),
  statistic: z.string().min(1, 'Statistic is required'),
  period: z.string().min(1, 'Period is required'),
  evaluationPeriods: z.string().min(1, 'Evaluation periods is required'),
  threshold: z.string().min(1, 'Threshold is required'),
  comparisonOperator: z.string().min(1, 'Comparison operator is required'),
  treatMissingData: z.string().optional(),
  actionsEnabled: z.boolean(),
  alarmActions: z.string().optional(),
  okActions: z.string().optional(),
  insufficientDataActions: z.string().optional(),
});

interface AlarmFormProps {
  alarm?: CloudWatchAlarm;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AlarmForm({ alarm, onSuccess, onCancel }: AlarmFormProps) {
  const createAlarmMutation = useCreateCloudWatchAlarm();
  const isEditing = !!alarm;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      alarmName: alarm?.alarmName || '',
      alarmDescription: alarm?.alarmDescription || '',
      metricName: alarm?.metricName || '',
      namespace: alarm?.namespace || 'AWS/EC2',
      statistic: alarm?.statistic || 'Average',
      period: alarm?.period?.toString() || '300',
      evaluationPeriods: alarm?.evaluationPeriods?.toString() || '1',
      threshold: alarm?.threshold?.toString() || '',
      comparisonOperator: alarm?.comparisonOperator || 'GreaterThanThreshold',
      treatMissingData: alarm?.treatMissingData || 'notBreaching',
      actionsEnabled: alarm?.actionsEnabled ?? true,
      alarmActions: alarm?.alarmActions?.join(',') || '',
      okActions: alarm?.okActions?.join(',') || '',
      insufficientDataActions: alarm?.insufficientDataActions?.join(',') || '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const alarmData = {
        alarmName: values.alarmName,
        alarmDescription: values.alarmDescription,
        actionsEnabled: values.actionsEnabled,
        okActions: values.okActions ? values.okActions.split(',').filter(Boolean) : undefined,
        alarmActions: values.alarmActions ? values.alarmActions.split(',').filter(Boolean) : undefined,
        insufficientDataActions: values.insufficientDataActions ? values.insufficientDataActions.split(',').filter(Boolean) : undefined,
        metricName: values.metricName,
        namespace: values.namespace,
        statistic: values.statistic,
        period: parseInt(values.period),
        evaluationPeriods: parseInt(values.evaluationPeriods),
        threshold: parseFloat(values.threshold),
        comparisonOperator: values.comparisonOperator,
        treatMissingData: values.treatMissingData,
      };

      await createAlarmMutation.mutateAsync(alarmData);
      onSuccess?.();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="alarmName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alarm Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="high-cpu-usage"
                    {...field}
                    disabled={isEditing}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="actionsEnabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Enable Actions</FormLabel>
                  <FormDescription>
                    Allow this alarm to trigger actions
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="alarmDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Alert when CPU usage is too high"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Metric Configuration</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="namespace"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Namespace</FormLabel>
                  <FormControl>
                    <Input placeholder="AWS/EC2" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="metricName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Metric Name</FormLabel>
                  <FormControl>
                    <Input placeholder="CPUUtilization" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="statistic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Statistic</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a statistic" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {STATISTICS.map((stat) => (
                        <SelectItem key={stat.value} value={stat.value}>
                          {stat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="period"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Period (seconds)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="300"
                      min="60"
                      step="60"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Must be 60 seconds or a multiple of 60
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Alarm Conditions</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="threshold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Threshold</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="80"
                      step="any"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comparisonOperator"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comparison Operator</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an operator" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {COMPARISON_OPERATORS.map((op) => (
                        <SelectItem key={op.value} value={op.value}>
                          {op.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="evaluationPeriods"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Evaluation Periods</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="1"
                      min="1"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Number of periods to evaluate
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="treatMissingData"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Treat Missing Data</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select treatment" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TREAT_MISSING_DATA.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Actions (Optional)</h3>
          
          <FormField
            control={form.control}
            name="alarmActions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alarm Actions</FormLabel>
                <FormControl>
                  <Input
                    placeholder="arn:aws:sns:region:account:topic-name"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Comma-separated list of ARNs to notify when alarm triggers
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="okActions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>OK Actions</FormLabel>
                <FormControl>
                  <Input
                    placeholder="arn:aws:sns:region:account:topic-name"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Comma-separated list of ARNs to notify when alarm returns to OK
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="insufficientDataActions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Insufficient Data Actions</FormLabel>
                <FormControl>
                  <Input
                    placeholder="arn:aws:sns:region:account:topic-name"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Comma-separated list of ARNs to notify when alarm has insufficient data
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? 'Creating...'
              : 'Create Alarm'}
          </Button>
        </div>
      </form>
    </Form>
  );
}