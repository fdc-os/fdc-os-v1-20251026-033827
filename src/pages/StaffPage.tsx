import { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/lib/auth";
import { User, UserRole } from "@shared/types";
import { PlusCircle, MoreHorizontal } from "lucide-react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from 'sonner';
import { DeleteConfirmationDialog } from '@/components/DeleteConfirmationDialog';
import { format } from 'date-fns';
const staffFormSchema = z.object({
  full_name: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  username: z.string().min(3, { message: "Username must be at least 3 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }).optional(),
  role: z.nativeEnum(UserRole),
  phone: z.string().optional(),
});
type StaffFormValues = z.infer<typeof staffFormSchema>;
export function StaffPage() {
  const { users, loading, error, addUser, updateUser, deleteUser } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm<StaffFormValues>({
    resolver: zodResolver(staffFormSchema),
  });
  const openEditModal = (user: User) => {
    setEditingUser(user);
    reset({ ...user, password: '' });
    setIsModalOpen(true);
  };
  const openDeleteDialog = (user: User) => {
    setUserToDelete(user);
    setIsDeleteConfirmOpen(true);
  };
  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    reset({ full_name: '', username: '', email: '', password: '', role: UserRole.Manager });
  };
  const onSubmit: SubmitHandler<StaffFormValues> = async (data) => {
    if (editingUser) {
      const result = await updateUser({ ...editingUser, ...data });
      if (result) toast.success("Staff member updated successfully!");
      else toast.error("Failed to update staff member.");
    } else {
      const result = await addUser(data);
      if (result) toast.success("Staff member added successfully!");
      else toast.error("Failed to add staff member.");
    }
    handleModalClose();
  };
  const handleDeleteConfirm = async () => {
    if (userToDelete) {
      const success = await deleteUser(userToDelete.id);
      if (success) toast.success("Staff member deleted successfully!");
      else toast.error("Failed to delete staff member.");
      setUserToDelete(null);
      setIsDeleteConfirmOpen(false);
    }
  };
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Staff Management</h1>
          <p className="text-muted-foreground">Manage your clinic's staff members.</p>
        </div>
        <Button size="sm" className="gap-1" onClick={() => setIsModalOpen(true)}>
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Add Staff
          </span>
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Full Name</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow><TableCell colSpan={6} className="text-center text-red-500">{error}</TableCell></TableRow>
              ) : (
                users.map((user: User) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.full_name}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{format(new Date(user.createdAt), 'MMMM d, yyyy')}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => openEditModal(user)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => openDeleteDialog(user)}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog open={isModalOpen} onOpenChange={handleModalClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit Staff Member' : 'Add New Staff Member'}</DialogTitle>
            <DialogDescription>
              Fill in the details to {editingUser ? 'update the' : 'create a new'} staff account.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input id="full_name" {...register("full_name")} />
                {errors.full_name && <p className="text-red-500 text-sm">{errors.full_name.message}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" {...register("username")} />
                {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email")} />
                {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">{editingUser ? 'New Password (Optional)' : 'Password'}</Label>
                <Input id="password" type="password" {...register("password")} />
                {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Controller
                  control={control}
                  name="role"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(UserRole).map(role => (
                          <SelectItem key={role} value={role}>{role}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.role && <p className="text-red-500 text-sm">{errors.role.message}</p>}
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <DeleteConfirmationDialog
        isOpen={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        onConfirm={handleDeleteConfirm}
        title="Are you sure you want to delete this staff member?"
        description="This action cannot be undone. This will permanently delete the user account."
      />
    </div>
  );
}