'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Info, 
  Users, 
  ShieldCheck, 
  FileText,
  Key,
  Shield,
  UserCheck,
  Lock
} from 'lucide-react';
import { useDeleteIAMUser, useDeleteIAMRole, useDeleteIAMPolicy } from '@/hooks/use-iam';

// Import IAM components
import { UserList } from '@/components/services/iam/user-list';
import { UserViewer } from '@/components/services/iam/user-viewer';
import { UserForm } from '@/components/services/iam/user-form';
import { RoleList } from '@/components/services/iam/role-list';
import { RoleViewer } from '@/components/services/iam/role-viewer';
import { RoleForm } from '@/components/services/iam/role-form';
import { PolicyList } from '@/components/services/iam/policy-list';
import { PolicyViewer } from '@/components/services/iam/policy-viewer';
import { PolicyForm } from '@/components/services/iam/policy-form';

export default function IAMPage() {
  const [activeTab, setActiveTab] = useState('users');
  
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

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Manage IAM Users</div>
              <p className="text-xs text-muted-foreground">
                Create and manage user identities
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Roles</CardTitle>
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Service Roles</div>
              <p className="text-xs text-muted-foreground">
                Delegate access to AWS services
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Policies</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Permission Policies</div>
              <p className="text-xs text-muted-foreground">
                Define what actions are allowed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Access Keys</CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Programmatic Access</div>
              <p className="text-xs text-muted-foreground">
                Manage API access credentials
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            IAM (Identity and Access Management) allows you to manage access to AWS services and resources securely.
            Create users, roles, and policies to control who can access what in your LocalStack environment.
          </AlertDescription>
        </Alert>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Identity and Access Management
            </CardTitle>
            <CardDescription>
              Manage users, roles, policies, and access keys for your LocalStack AWS services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="users" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Users
                </TabsTrigger>
                <TabsTrigger value="roles" className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  Roles
                </TabsTrigger>
                <TabsTrigger value="policies" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Policies
                </TabsTrigger>
              </TabsList>

              <TabsContent value="users" className="mt-6">
                <UserList
                  onViewUser={setSelectedUser}
                  onCreateUser={() => setShowCreateUser(true)}
                  onDeleteUser={setUserToDelete}
                />
              </TabsContent>

              <TabsContent value="roles" className="mt-6">
                <RoleList
                  onViewRole={setSelectedRole}
                  onCreateRole={() => setShowCreateRole(true)}
                  onDeleteRole={setRoleToDelete}
                />
              </TabsContent>

              <TabsContent value="policies" className="mt-6">
                <PolicyList
                  onViewPolicy={setSelectedPolicy}
                  onCreatePolicy={() => setShowCreatePolicy(true)}
                  onDeletePolicy={setPolicyToDelete}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* User Dialogs */}
      <UserViewer
        userName={selectedUser || ''}
        open={!!selectedUser}
        onOpenChange={(open) => !open && setSelectedUser(null)}
      />
      <UserForm
        open={showCreateUser}
        onOpenChange={setShowCreateUser}
      />

      {/* Role Dialogs */}
      <RoleViewer
        roleName={selectedRole || ''}
        open={!!selectedRole}
        onOpenChange={(open) => !open && setSelectedRole(null)}
      />
      <RoleForm
        open={showCreateRole}
        onOpenChange={setShowCreateRole}
      />

      {/* Policy Dialogs */}
      <PolicyViewer
        policyArn={selectedPolicy || ''}
        open={!!selectedPolicy}
        onOpenChange={(open) => !open && setSelectedPolicy(null)}
      />
      <PolicyForm
        open={showCreatePolicy}
        onOpenChange={setShowCreatePolicy}
      />

      {/* Delete Confirmation Dialogs */}
      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete IAM User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the user "{userToDelete}"? 
              This will also delete all access keys and remove the user from all groups.
              This action cannot be undone.
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

      <AlertDialog open={!!roleToDelete} onOpenChange={() => setRoleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete IAM Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the role "{roleToDelete}"? 
              Make sure no services are currently using this role.
              This action cannot be undone.
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

      <AlertDialog open={!!policyToDelete} onOpenChange={() => setPolicyToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete IAM Policy</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this policy? 
              Make sure it's not attached to any users, groups, or roles.
              This action cannot be undone.
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
    </MainLayout>
  );
}