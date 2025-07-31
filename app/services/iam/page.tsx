"use client";

import React, { useState } from "react";
import { ServicePageLayout } from "@/components/layout/service-page-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Info,
  Users,
  ShieldCheck,
  FileText,
  Key,
  Shield,
  UserCheck,
  Lock,
  RefreshCw,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useDeleteIAMUser,
  useDeleteIAMRole,
  useDeleteIAMPolicy,
  useIAMUsers,
  useIAMRoles,
  useIAMPolicies,
} from "@/hooks/use-iam";

// Import IAM components
import { UserList } from "@/components/services/iam/user-list";
import { UserViewer } from "@/components/services/iam/user-viewer";
import { UserForm } from "@/components/services/iam/user-form";
import { RoleList } from "@/components/services/iam/role-list";
import { RoleViewer } from "@/components/services/iam/role-viewer";
import { RoleForm } from "@/components/services/iam/role-form";
import { PolicyList } from "@/components/services/iam/policy-list";
import { PolicyViewer } from "@/components/services/iam/policy-viewer";
import { PolicyForm } from "@/components/services/iam/policy-form";

export default function IAMPage() {
  const [activeTab, setActiveTab] = useState("users");
  const queryClient = useQueryClient();

  // User state
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  // Role state
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null);

  // Policy state
  const [selectedPolicy, setSelectedPolicy] = useState<string | null>(null);
  const [showCreatePolicy, setShowCreatePolicy] = useState(false);
  const [policyToDelete, setPolicyToDelete] = useState<string | null>(null);

  // Data queries
  const { data: users, isLoading: isLoadingUsers } = useIAMUsers();
  const { data: roles, isLoading: isLoadingRoles } = useIAMRoles();
  const { data: policies, isLoading: isLoadingPolicies } =
    useIAMPolicies("Local");

  // Delete mutations
  const deleteUserMutation = useDeleteIAMUser();
  const deleteRoleMutation = useDeleteIAMRole();
  const deletePolicyMutation = useDeleteIAMPolicy();

  const handleDeleteUser = async () => {
    if (userToDelete) {
      await deleteUserMutation.mutateAsync(userToDelete);
      setUserToDelete(null);
    }
  };

  const handleDeleteRole = async () => {
    if (roleToDelete) {
      await deleteRoleMutation.mutateAsync(roleToDelete);
      setRoleToDelete(null);
    }
  };

  const handleDeletePolicy = async () => {
    if (policyToDelete) {
      await deletePolicyMutation.mutateAsync(policyToDelete);
      setPolicyToDelete(null);
    }
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["iam-users"] });
    queryClient.invalidateQueries({ queryKey: ["iam-roles"] });
    queryClient.invalidateQueries({ queryKey: ["iam-policies"] });
  };

  // Calculate stats
  const totalUsers = users?.length || 0;
  const totalRoles = roles?.length || 0;
  const totalPolicies = policies?.length || 0;
  const usersWithAccessKeys =
    users?.filter((u: any) => u.hasAccessKeys).length || 0;

  return (
    <ServicePageLayout
      title="IAM"
      description="Manage identities and access permissions"
      icon={Shield}
      secondaryAction={{
        label: "Refresh",
        icon: RefreshCw,
        onClick: handleRefresh,
      }}
      stats={[
        {
          title: "Users",
          value: totalUsers,
          description: "Total IAM users",
          icon: Users,
          loading: isLoadingUsers,
        },
        {
          title: "Roles",
          value: totalRoles,
          description: "Service roles",
          icon: ShieldCheck,
          loading: isLoadingRoles,
        },
        {
          title: "Policies",
          value: totalPolicies,
          description: "Custom policies",
          icon: FileText,
          loading: isLoadingPolicies,
        },
        {
          title: "Access Keys",
          value: usersWithAccessKeys,
          description: "Users with keys",
          icon: Key,
          loading: isLoadingUsers,
        },
      ]}
      alert={{
        icon: Info,
        description:
          "IAM (Identity and Access Management) allows you to manage access to AWS services and resources securely. Create users, roles, and policies to control who can access what in your LocalStack environment.",
      }}
    >
      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start rounded-none border-b h-auto p-0">
              <TabsTrigger
                value="users"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-6"
              >
                <Users className="mr-2 h-4 w-4" />
                Users
              </TabsTrigger>
              <TabsTrigger
                value="roles"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-6"
              >
                <ShieldCheck className="mr-2 h-4 w-4" />
                Roles
              </TabsTrigger>
              <TabsTrigger
                value="policies"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-6"
              >
                <FileText className="mr-2 h-4 w-4" />
                Policies
              </TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="users" className="mt-0">
                <UserList
                  onViewUser={setSelectedUser}
                  onCreateUser={() => setShowCreateUser(true)}
                  onDeleteUser={setUserToDelete}
                />
              </TabsContent>

              <TabsContent value="roles" className="mt-0">
                <RoleList
                  onViewRole={setSelectedRole}
                  onCreateRole={() => setShowCreateRole(true)}
                  onDeleteRole={setRoleToDelete}
                />
              </TabsContent>

              <TabsContent value="policies" className="mt-0">
                <PolicyList
                  onViewPolicy={setSelectedPolicy}
                  onCreatePolicy={() => setShowCreatePolicy(true)}
                  onDeletePolicy={setPolicyToDelete}
                />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* User Dialogs */}
      <UserViewer
        userName={selectedUser || ""}
        open={!!selectedUser}
        onOpenChange={(open) => !open && setSelectedUser(null)}
      />
      <UserForm open={showCreateUser} onOpenChange={setShowCreateUser} />

      {/* Role Dialogs */}
      <RoleViewer
        roleName={selectedRole || ""}
        open={!!selectedRole}
        onOpenChange={(open) => !open && setSelectedRole(null)}
      />
      <RoleForm open={showCreateRole} onOpenChange={setShowCreateRole} />

      {/* Policy Dialogs */}
      <PolicyViewer
        policyArn={selectedPolicy || ""}
        open={!!selectedPolicy}
        onOpenChange={(open) => !open && setSelectedPolicy(null)}
      />
      <PolicyForm open={showCreatePolicy} onOpenChange={setShowCreatePolicy} />

      {/* Delete Confirmation Dialogs */}
      <AlertDialog
        open={!!userToDelete}
        onOpenChange={() => setUserToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete IAM User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the user "{userToDelete}"? This
              will also delete all access keys and remove the user from all
              groups. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!roleToDelete}
        onOpenChange={() => setRoleToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete IAM Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the role "{roleToDelete}"? Make
              sure no services are currently using this role. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRole}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!policyToDelete}
        onOpenChange={() => setPolicyToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete IAM Policy</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this policy? Make sure it's not
              attached to any users, groups, or roles. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePolicy}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Policy
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ServicePageLayout>
  );
}
