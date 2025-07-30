import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EventBusInfo, EventRule, EventTarget } from '@/types';

// Event Bus hooks
export function useEventBuses() {
  return useQuery<EventBusInfo[]>({
    queryKey: ['event-buses'],
    queryFn: async () => {
      const response = await fetch('/api/eventbridge/buses');
      if (!response.ok) throw new Error('Failed to fetch event buses');
      return response.json();
    },
  });
}

export function useCreateEventBus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      name: string;
      description?: string;
      kmsKeyId?: string;
      deadLetterConfig?: any;
      tags?: any;
    }) => {
      const response = await fetch('/api/eventbridge/buses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create event bus');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-buses'] });
    },
  });
}

export function useDeleteEventBus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (name: string) => {
      const response = await fetch(`/api/eventbridge/buses?name=${encodeURIComponent(name)}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete event bus');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-buses'] });
    },
  });
}

// Rule hooks
export function useEventRules(eventBusName?: string, namePrefix?: string) {
  return useQuery<EventRule[]>({
    queryKey: ['event-rules', eventBusName, namePrefix],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (eventBusName) params.append('eventBusName', eventBusName);
      if (namePrefix) params.append('namePrefix', namePrefix);
      
      const response = await fetch(`/api/eventbridge/rules?${params}`);
      if (!response.ok) throw new Error('Failed to fetch rules');
      return response.json();
    },
  });
}

export function useEventRule(name: string, eventBusName?: string, enabled?: boolean) {
  return useQuery<EventRule>({
    queryKey: ['event-rule', name, eventBusName],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (eventBusName) params.append('eventBusName', eventBusName);
      
      const response = await fetch(`/api/eventbridge/rules/${encodeURIComponent(name)}?${params}`);
      if (!response.ok) throw new Error('Failed to fetch rule');
      return response.json();
    },
    enabled: enabled !== false,
  });
}

export function useCreateEventRule() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      name: string;
      eventPattern?: string;
      scheduleExpression?: string;
      description?: string;
      state?: 'ENABLED' | 'DISABLED';
      eventBusName?: string;
      roleArn?: string;
      tags?: any;
    }) => {
      const response = await fetch('/api/eventbridge/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create rule');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-rules'] });
    },
  });
}

export function useToggleRuleState() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      name,
      eventBusName = 'default',
      action,
    }: {
      name: string;
      eventBusName?: string;
      action: 'enable' | 'disable';
    }) => {
      const response = await fetch('/api/eventbridge/rules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, eventBusName, action }),
      });
      if (!response.ok) throw new Error(`Failed to ${action} rule`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-rules'] });
      queryClient.invalidateQueries({ queryKey: ['event-rule'] });
    },
  });
}

export function useDeleteEventRule() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ name, eventBusName = 'default' }: { name: string; eventBusName?: string }) => {
      const params = new URLSearchParams({
        name,
        eventBusName,
      });
      
      const response = await fetch(`/api/eventbridge/rules?${params}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete rule');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-rules'] });
    },
  });
}

// Target hooks
export function useEventTargets(rule: string, eventBusName?: string) {
  return useQuery<EventTarget[]>({
    queryKey: ['event-targets', rule, eventBusName],
    queryFn: async () => {
      const params = new URLSearchParams({
        rule,
      });
      if (eventBusName) params.append('eventBusName', eventBusName);
      
      const response = await fetch(`/api/eventbridge/targets?${params}`);
      if (!response.ok) throw new Error('Failed to fetch targets');
      return response.json();
    },
    enabled: !!rule,
  });
}

export function useAddEventTargets() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      rule,
      eventBusName = 'default',
      targets,
    }: {
      rule: string;
      eventBusName?: string;
      targets: EventTarget[];
    }) => {
      const response = await fetch('/api/eventbridge/targets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rule, eventBusName, targets }),
      });
      if (!response.ok) throw new Error('Failed to add targets');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['event-targets', variables.rule, variables.eventBusName] });
    },
  });
}

export function useRemoveEventTargets() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      rule,
      eventBusName = 'default',
      ids,
    }: {
      rule: string;
      eventBusName?: string;
      ids: string[];
    }) => {
      const params = new URLSearchParams({
        rule,
        eventBusName,
        ids: ids.join(','),
      });
      
      const response = await fetch(`/api/eventbridge/targets?${params}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to remove targets');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['event-targets', variables.rule, variables.eventBusName] });
    },
  });
}