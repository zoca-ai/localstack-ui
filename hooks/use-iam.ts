import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { IAMUser, IAMRole, IAMPolicy, IAMAccessKey } from "@/types";

// User hooks
export function useIAMUsers() {
  return useQuery({
    queryKey: ["iam-users"],
    queryFn: async () => {
      const response = await fetch("/api/iam/users");
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch IAM users");
      }
      return response.json();
    },
  });
}

export function useIAMUser(userName: string, enabled = false) {
  return useQuery({
    queryKey: ["iam-user", userName],
    queryFn: async () => {
      const response = await fetch(`/api/iam/users/${userName}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch IAM user");
      }
      return response.json();
    },
    enabled: enabled && !!userName,
  });
}

export function useCreateIAMUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      userName: string;
      path?: string;
      tags?: Array<{ key: string; value: string }>;
      permissionsBoundary?: string;
    }) => {
      const response = await fetch("/api/iam/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create IAM user");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["iam-users"] });
      toast.success("IAM user created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateIAMUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userName,
      newUserName,
      newPath,
    }: {
      userName: string;
      newUserName?: string;
      newPath?: string;
    }) => {
      const response = await fetch(`/api/iam/users/${userName}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newUserName, newPath }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update IAM user");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["iam-users"] });
      toast.success("IAM user updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteIAMUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userName: string) => {
      const response = await fetch(`/api/iam/users/${userName}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete IAM user");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["iam-users"] });
      toast.success("IAM user deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Access key hooks
export function useAccessKeys(userName: string, enabled = false) {
  return useQuery({
    queryKey: ["iam-access-keys", userName],
    queryFn: async () => {
      const response = await fetch(`/api/iam/users/${userName}/access-keys`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch access keys");
      }
      return response.json() as Promise<IAMAccessKey[]>;
    },
    enabled: enabled && !!userName,
  });
}

export function useCreateAccessKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userName: string) => {
      const response = await fetch(`/api/iam/users/${userName}/access-keys`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create access key");
      }

      return response.json() as Promise<IAMAccessKey>;
    },
    onSuccess: (_, userName) => {
      queryClient.invalidateQueries({
        queryKey: ["iam-access-keys", userName],
      });
      toast.success("Access key created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateAccessKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userName,
      accessKeyId,
      status,
    }: {
      userName: string;
      accessKeyId: string;
      status: "Active" | "Inactive";
    }) => {
      const response = await fetch(`/api/iam/users/${userName}/access-keys`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessKeyId, status }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update access key");
      }

      return response.json();
    },
    onSuccess: (_, { userName }) => {
      queryClient.invalidateQueries({
        queryKey: ["iam-access-keys", userName],
      });
      toast.success("Access key updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteAccessKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userName,
      accessKeyId,
    }: {
      userName: string;
      accessKeyId: string;
    }) => {
      const response = await fetch(
        `/api/iam/users/${userName}/access-keys?accessKeyId=${accessKeyId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete access key");
      }

      return response.json();
    },
    onSuccess: (_, { userName }) => {
      queryClient.invalidateQueries({
        queryKey: ["iam-access-keys", userName],
      });
      toast.success("Access key deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Role hooks
export function useIAMRoles() {
  return useQuery({
    queryKey: ["iam-roles"],
    queryFn: async () => {
      const response = await fetch("/api/iam/roles");
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch IAM roles");
      }
      return response.json();
    },
  });
}

export function useIAMRole(roleName: string, enabled = false) {
  return useQuery({
    queryKey: ["iam-role", roleName],
    queryFn: async () => {
      const response = await fetch(`/api/iam/roles/${roleName}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch IAM role");
      }
      return response.json();
    },
    enabled: enabled && !!roleName,
  });
}

export function useCreateIAMRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      roleName: string;
      assumeRolePolicyDocument: string;
      path?: string;
      description?: string;
      maxSessionDuration?: number;
      tags?: Array<{ key: string; value: string }>;
      permissionsBoundary?: string;
    }) => {
      const response = await fetch("/api/iam/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create IAM role");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["iam-roles"] });
      toast.success("IAM role created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateIAMRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      roleName,
      description,
      maxSessionDuration,
      assumeRolePolicyDocument,
    }: {
      roleName: string;
      description?: string;
      maxSessionDuration?: number;
      assumeRolePolicyDocument?: string;
    }) => {
      const response = await fetch(`/api/iam/roles/${roleName}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          maxSessionDuration,
          assumeRolePolicyDocument,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update IAM role");
      }

      return response.json();
    },
    onSuccess: (_, { roleName }) => {
      queryClient.invalidateQueries({ queryKey: ["iam-roles"] });
      queryClient.invalidateQueries({ queryKey: ["iam-role", roleName] });
      toast.success("IAM role updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteIAMRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roleName: string) => {
      const response = await fetch(`/api/iam/roles/${roleName}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete IAM role");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["iam-roles"] });
      toast.success("IAM role deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Policy hooks
export function useIAMPolicies(scope: "All" | "AWS" | "Local" = "All") {
  return useQuery({
    queryKey: ["iam-policies", scope],
    queryFn: async () => {
      const response = await fetch(`/api/iam/policies?scope=${scope}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch IAM policies");
      }
      return response.json();
    },
  });
}

export function useIAMPolicy(policyArn: string, enabled = false) {
  return useQuery({
    queryKey: ["iam-policy", policyArn],
    queryFn: async () => {
      const response = await fetch(
        `/api/iam/policies/${encodeURIComponent(policyArn)}`,
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch IAM policy");
      }
      return response.json();
    },
    enabled: enabled && !!policyArn,
  });
}

export function useCreateIAMPolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      policyName: string;
      policyDocument: string;
      path?: string;
      description?: string;
      tags?: Array<{ key: string; value: string }>;
    }) => {
      const response = await fetch("/api/iam/policies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create IAM policy");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["iam-policies"] });
      toast.success("IAM policy created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateIAMPolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      policyArn,
      policyDocument,
      setAsDefault = true,
    }: {
      policyArn: string;
      policyDocument: string;
      setAsDefault?: boolean;
    }) => {
      const response = await fetch(
        `/api/iam/policies/${encodeURIComponent(policyArn)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ policyDocument, setAsDefault }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update IAM policy");
      }

      return response.json();
    },
    onSuccess: (_, { policyArn }) => {
      queryClient.invalidateQueries({ queryKey: ["iam-policies"] });
      queryClient.invalidateQueries({ queryKey: ["iam-policy", policyArn] });
      toast.success("IAM policy updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteIAMPolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (policyArn: string) => {
      const response = await fetch(
        `/api/iam/policies/${encodeURIComponent(policyArn)}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete IAM policy");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["iam-policies"] });
      toast.success("IAM policy deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
