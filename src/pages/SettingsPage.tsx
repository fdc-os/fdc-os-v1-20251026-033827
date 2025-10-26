import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuthStore } from "@/lib/auth";
import { useSettingsStore } from "@/lib/settingsStore";
import { User, UserRole, PermissionsMap } from "@shared/types";
import { Toaster, toast } from 'sonner';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
const profileFormSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  username: z.string().min(3, 'Username is required'),
  email: z.string().email('Invalid email address'),
});
type ProfileFormValues = z.infer<typeof profileFormSchema>;
const modules = [
  'Dashboard', 'Appointments', 'Patients', 'Staff', 'Services', 'Invoices', 'Inventory', 'Reports', 'Settings', 'Portal'
];
const roles = Object.values(UserRole).filter(role => role !== UserRole.Patient);
export function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const { permissions: initialPermissions, fetchPermissions, updatePermissions, loading: settingsLoading } = useSettingsStore();
  const [localPermissions, setLocalPermissions] = useState<PermissionsMap>({});
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      full_name: user?.full_name || '',
      username: user?.username || '',
      email: user?.email || '',
    },
  });
  useEffect(() => {
    if (user) {
      reset({
        full_name: user.full_name,
        username: user.username,
        email: user.email,
      });
    }
  }, [user, reset]);
  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);
  useEffect(() => {
    setLocalPermissions(initialPermissions);
  }, [initialPermissions]);
  const handlePermissionChange = (role: UserRole, module: string, checked: boolean) => {
    setLocalPermissions(prev => {
      const rolePermissions = prev[role] ? [...prev[role]!] : [];
      if (checked) {
        if (!rolePermissions.includes(module)) {
          rolePermissions.push(module);
        }
      } else {
        const index = rolePermissions.indexOf(module);
        if (index > -1) {
          rolePermissions.splice(index, 1);
        }
      }
      return { ...prev, [role]: rolePermissions };
    });
  };
  const handleSavePermissions = async () => {
    const success = await updatePermissions(localPermissions);
    if (success) {
      toast.success("Permissions updated successfully!");
    } else {
      toast.error("Failed to update permissions.");
    }
  };
  const onProfileSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
    if (!user) return;
    const updatedUserData: User = { ...user, ...data };
    const result = await updateUser(updatedUserData);
    if (result) {
      toast.success("Profile updated successfully!");
    } else {
      toast.error("Failed to update profile.");
    }
  };
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account and application settings.</p>
      </div>
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="clinic">Clinic Info</TabsTrigger>
          <TabsTrigger value="permissions" disabled={user?.role !== UserRole.Admin}>Role Permissions</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Update your personal information and password.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" {...register('full_name')} />
                  {errors.full_name && <p className="text-sm text-red-500">{errors.full_name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" {...register('username')} />
                  {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...register('email')} />
                  {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" disabled />
                </div>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="clinic">
          <Card>
            <CardHeader>
              <CardTitle>Clinic Information</CardTitle>
              <CardDescription>Manage your clinic's details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clinicName">Clinic Name</Label>
                <Input id="clinicName" defaultValue="Family Dental Clinic" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clinicAddress">Address</Label>
                <Input id="clinicAddress" defaultValue="123 Dental St, Lahore, Pakistan" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clinicContact">Contact</Label>
                <Input id="clinicContact" defaultValue="+92 300 1234567" />
              </div>
              <Button onClick={() => toast.info("This feature is not yet implemented.")}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="permissions">
          <Card>
            <CardHeader>
              <CardTitle>Role Permissions</CardTitle>
              <CardDescription>Control which modules each role can access.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Module</TableHead>
                      {roles.map(role => <TableHead key={role} className="text-center">{role}</TableHead>)}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {modules.map(module => (
                      <TableRow key={module}>
                        <TableCell className="font-medium">{module}</TableCell>
                        {roles.map(role => (
                          <TableCell key={role} className="text-center">
                            <Checkbox
                              checked={localPermissions[role]?.includes(module) ?? false}
                              onCheckedChange={(checked) => handlePermissionChange(role, module, !!checked)}
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <Button className="mt-4" onClick={handleSavePermissions} disabled={settingsLoading}>
                {settingsLoading ? 'Saving...' : 'Save Permissions'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Toaster richColors />
    </div>
  );
}