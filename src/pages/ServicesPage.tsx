import { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useServiceStore } from "@/lib/serviceStore";
import { Service } from "@shared/types";
import { PlusCircle, MoreHorizontal, Search } from "lucide-react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from 'sonner';
import { DeleteConfirmationDialog } from '@/components/DeleteConfirmationDialog';
import { EmptyState } from '@/components/EmptyState';
const serviceFormSchema = z.object({
  name: z.string().min(3, { message: "Service name must be at least 3 characters." }),
  description: z.string().optional(),
  category: z.string().optional(),
  default_price: z.coerce.number().min(0, { message: "Price must be a positive number." }),
  estimated_duration_minutes: z.coerce.number().int().min(5, { message: "Duration must be at least 5 minutes." }),
  is_active: z.boolean().default(true),
});
type ServiceFormValues = z.output<typeof serviceFormSchema>;
export function ServicesPage() {
  const { services, loading, error, addService, updateService, deleteService } = useServiceStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
  });
  const openEditModal = (service: Service) => {
    setEditingService(service);
    reset(service);
    setIsModalOpen(true);
  };
  const openNewModal = () => {
    setEditingService(null);
    reset({ name: '', description: '', category: '', default_price: 0, estimated_duration_minutes: 30, is_active: true });
    setIsModalOpen(true);
  };
  const openDeleteDialog = (service: Service) => {
    setServiceToDelete(service);
    setIsDeleteConfirmOpen(true);
  };
  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingService(null);
  };
  const onSubmit: SubmitHandler<ServiceFormValues> = async (data) => {
    if (editingService) {
      const result = await updateService({ ...editingService, ...data });
      if (result) toast.success("Service updated successfully!");
      else toast.error("Failed to update service.");
    } else {
      const result = await addService(data);
      if (result) toast.success("Service added successfully!");
      else toast.error("Failed to add service.");
    }
    handleModalClose();
  };
  const handleDeleteConfirm = async () => {
    if (serviceToDelete) {
      const success = await deleteService(serviceToDelete.id);
      if (success) toast.success("Service deleted successfully!");
      else toast.error("Failed to delete service.");
      setServiceToDelete(null);
      setIsDeleteConfirmOpen(false);
    }
  };
  const filteredServices = useMemo(() =>
    services.filter(service =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.category && service.category.toLowerCase().includes(searchTerm.toLowerCase()))
    ), [services, searchTerm]);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Service Management</h1>
          <p className="text-muted-foreground">Manage the dental services your clinic offers.</p>
        </div>
        <Button size="sm" className="gap-1" onClick={openNewModal}>
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Add Service
          </span>
        </Button>
      </div>
      <Card>
        <CardHeader>
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search services by name or category..."
                    className="w-full appearance-none bg-background pl-8 shadow-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </CardHeader>
        <CardContent className="p-0">
          {!loading && filteredServices.length === 0 ? (
            <EmptyState
              title="No services found"
              description="Get started by adding your first dental service."
              buttonText="Add Service"
              onButtonClick={openNewModal}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price (PKR)</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-8" /></TableCell>
                    </TableRow>
                  ))
                ) : error ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-red-500">{error}</TableCell></TableRow>
                ) : (
                  filteredServices.map((service: Service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">{service.name}</TableCell>
                      <TableCell>{service.category || 'N/A'}</TableCell>
                      <TableCell>{`₨ ${service.default_price.toLocaleString()}`}</TableCell>
                      <TableCell>{`${service.estimated_duration_minutes} min`}</TableCell>
                      <TableCell>
                        <Badge variant={service.is_active ? 'default' : 'outline'}>
                          {service.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
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
                            <DropdownMenuItem onClick={() => openEditModal(service)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => openDeleteDialog(service)}>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <Dialog open={isModalOpen} onOpenChange={handleModalClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
            <DialogDescription>
              Fill in the details for the service.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Service Name</Label>
                <Input id="name" {...register("name")} />
                {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input id="description" {...register("description")} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category (Optional)</Label>
                <Input id="category" {...register("category")} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                      <Label htmlFor="default_price">Price (PKR)</Label>
                      <Input id="default_price" type="number" {...register("default_price")} />
                      {errors.default_price && <p className="text-red-500 text-sm">{errors.default_price.message}</p>}
                  </div>
                  <div className="grid gap-2">
                      <Label htmlFor="estimated_duration_minutes">Duration (min)</Label>
                      <Input id="estimated_duration_minutes" type="number" {...register("estimated_duration_minutes")} />
                      {errors.estimated_duration_minutes && <p className="text-red-500 text-sm">{errors.estimated_duration_minutes.message}</p>}
                  </div>
              </div>
              <div className="flex items-center space-x-2">
                  <Controller
                      control={control}
                      name="is_active"
                      render={({ field }) => (
                          <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              id="is_active"
                          />
                      )}
                  />
                  <Label htmlFor="is_active">Service is Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Service'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <DeleteConfirmationDialog
        isOpen={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        onConfirm={handleDeleteConfirm}
        title="Are you sure you want to delete this service?"
        description="This action cannot be undone and will permanently remove the service from your clinic."
      />
    </div>
  );
}