import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ScheduleInfo, ScheduleGroup } from '@/types';

// Schedule hooks
export function useSchedules(groupName?: string, namePrefix?: string) {
  return useQuery<ScheduleInfo[]>({
    queryKey: ['schedules', groupName, namePrefix],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (groupName) params.append('groupName', groupName);
      if (namePrefix) params.append('namePrefix', namePrefix);
      
      const response = await fetch(`/api/scheduler/schedules?${params}`);
      if (!response.ok) throw new Error('Failed to fetch schedules');
      return response.json();
    },
  });
}

export function useSchedule(name: string, groupName?: string, enabled?: boolean) {
  return useQuery<ScheduleInfo>({
    queryKey: ['schedule', name, groupName],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (groupName) params.append('groupName', groupName);
      
      const response = await fetch(`/api/scheduler/schedules/${encodeURIComponent(name)}?${params}`);
      if (!response.ok) throw new Error('Failed to fetch schedule');
      return response.json();
    },
    enabled: enabled !== false && !!name,
  });
}

export function useCreateSchedule() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      name: string;
      groupName?: string;
      description?: string;
      scheduleExpression: string;
      scheduleExpressionTimezone?: string;
      startDate?: string;
      endDate?: string;
      state?: 'ENABLED' | 'DISABLED';
      target: {
        arn: string;
        roleArn: string;
        input?: string;
        retryPolicy?: any;
        deadLetterConfig?: any;
        eventBridgeParameters?: any;
        sqsParameters?: any;
        httpParameters?: any;
        kinesisParameters?: any;
      };
      flexibleTimeWindow?: {
        mode: 'OFF' | 'FLEXIBLE';
        maximumWindowInMinutes?: number;
      };
      kmsKeyArn?: string;
      actionAfterCompletion?: 'NONE' | 'DELETE';
    }) => {
      const response = await fetch('/api/scheduler/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create schedule');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });
}

export function useUpdateSchedule() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      name: string;
      groupName?: string;
      description?: string;
      scheduleExpression?: string;
      scheduleExpressionTimezone?: string;
      startDate?: string;
      endDate?: string;
      state?: 'ENABLED' | 'DISABLED';
      target?: any;
      flexibleTimeWindow?: any;
      kmsKeyArn?: string;
      actionAfterCompletion?: 'NONE' | 'DELETE';
    }) => {
      const response = await fetch('/api/scheduler/schedules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update schedule');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
    },
  });
}

export function useDeleteSchedule() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ name, groupName = 'default' }: { name: string; groupName?: string }) => {
      const params = new URLSearchParams({
        name,
        groupName,
      });
      
      const response = await fetch(`/api/scheduler/schedules?${params}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete schedule');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });
}

// Schedule Group hooks
export function useScheduleGroups() {
  return useQuery<ScheduleGroup[]>({
    queryKey: ['schedule-groups'],
    queryFn: async () => {
      const response = await fetch('/api/scheduler/groups');
      if (!response.ok) throw new Error('Failed to fetch schedule groups');
      return response.json();
    },
  });
}

export function useCreateScheduleGroup() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      name: string;
      tags?: any;
    }) => {
      const response = await fetch('/api/scheduler/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create schedule group');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-groups'] });
    },
  });
}

export function useDeleteScheduleGroup() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (name: string) => {
      const response = await fetch(`/api/scheduler/groups?name=${encodeURIComponent(name)}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete schedule group');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-groups'] });
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });
}