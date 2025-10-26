import { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useInventoryStore } from "@/lib/inventoryStore";
import { InventoryItem } from "@shared/types";
import { PlusCircle, MoreHorizontal, Search } from "lucide-react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from 'sonner';
import { DeleteConfirmationDialog } from '@/components/DeleteConfirmationDialog';
import { EmptyState } from '@/components/EmptyState';
const itemFormSchema = z.object({
  name: z.string().min(3, "Item name is required."),
  sku: z.string().optional(),
  unit: z.string().min(1, "Unit is required."),
  quantity_on_hand: z.coerce.number().min(0, "Quantity must be non-negative."),
  reorder_threshold: z.coerce.number().min(0, "Threshold must be non-negative."),
  unit_price: z.coerce.number().min(0, "Price must be non-negative."),
});
type ItemFormValues = z.output<typeof itemFormSchema>;
export function InventoryPage() {
  const { inventoryItems, loading, error, addItem, updateItem, deleteItem, adjustStock } = useInventoryStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdjustStockModalOpen, setIsAdjustStockModalOpen] = useState(false);
  const [itemToAdjust, setItemToAdjust] = useState<InventoryItem | null>(null);
  const [adjustmentValue, setAdjustmentValue] = useState(0);
  const [adjustmentType, setAdjustmentType] = useState<'receive' | 'adjust'>('receive');
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ItemFormValues>({
    resolver: zodResolver(itemFormSchema),
  });
  const openEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    reset(item);
    setIsModalOpen(true);
  };
  const openNewModal = () => {
    setEditingItem(null);
    reset({ name: '', sku: '', unit: '', quantity_on_hand: 0, reorder_threshold: 0, unit_price: 0 });
    setIsModalOpen(true);
  };
  const openDeleteDialog = (item: InventoryItem) => {
    setItemToDelete(item);
    setIsDeleteConfirmOpen(true);
  };
  const openAdjustStockModal = (item: InventoryItem, type: 'receive' | 'adjust') => {
    setItemToAdjust(item);
    setAdjustmentType(type);
    setAdjustmentValue(0);
    setIsAdjustStockModalOpen(true);
  };
  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };
  const onSubmit: SubmitHandler<ItemFormValues> = async (data) => {
    if (editingItem) {
      const result = await updateItem({ ...editingItem, ...data });
      if (result) toast.success("Item updated successfully!");
      else toast.error("Failed to update item.");
    } else {
      const result = await addItem(data);
      if (result) toast.success("Inventory item added successfully!");
      else toast.error("Failed to add inventory item.");
    }
    handleModalClose();
  };
  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      const success = await deleteItem(itemToDelete.id);
      if (success) toast.success("Item deleted successfully!");
      else toast.error("Failed to delete item.");
      setItemToDelete(null);
      setIsDeleteConfirmOpen(false);
    }
  };
  const handleAdjustStock = async () => {
    if (itemToAdjust) {
      const currentQuantity = itemToAdjust.quantity_on_hand;
      const newQuantity = adjustmentType === 'receive' ? currentQuantity + adjustmentValue : adjustmentValue;
      const result = await adjustStock(itemToAdjust.id, newQuantity);
      if (result) {
        toast.success("Stock quantity updated successfully!");
        setIsAdjustStockModalOpen(false);
        setItemToAdjust(null);
      } else {
        toast.error("Failed to update stock quantity.");
      }
    }
  };
  const filteredItems = useMemo(() =>
    inventoryItems.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    ), [inventoryItems, searchTerm]);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground">Track and manage your clinic's supplies.</p>
        </div>
        <Button size="sm" className="gap-1" onClick={openNewModal}>
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Add Item
          </span>
        </Button>
      </div>
      <Card>
        <CardHeader>
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search by item name or SKU..."
                    className="w-full appearance-none bg-background pl-8 shadow-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </CardHeader>
        <CardContent className="p-0">
          {!loading && filteredItems.length === 0 ? (
            <EmptyState
              title="No inventory items"
              description="You can start managing your inventory by adding the first item."
              buttonText="Add Item"
              onButtonClick={openNewModal}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Threshold</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-8" /></TableCell>
                    </TableRow>
                  ))
                ) : error ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-red-500">{error}</TableCell></TableRow>
                ) : (
                  filteredItems.map((item: InventoryItem) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.sku || 'N/A'}</TableCell>
                      <TableCell>{item.quantity_on_hand} {item.unit}</TableCell>
                      <TableCell>{item.reorder_threshold}</TableCell>
                      <TableCell>
                        {item.quantity_on_hand <= item.reorder_threshold ? (
                          <Badge variant="destructive">Low Stock</Badge>
                        ) : (
                          <Badge variant="default">In Stock</Badge>
                        )}
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
                            <DropdownMenuItem onClick={() => openEditModal(item)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openAdjustStockModal(item, 'receive')}>Receive Stock</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openAdjustStockModal(item, 'adjust')}>Adjust Stock</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => openDeleteDialog(item)}>Delete</DropdownMenuItem>
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
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Item' : 'Add New Inventory Item'}</DialogTitle>
            <DialogDescription>
              Fill in the details for the supply item.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Item Name</Label>
                <Input id="name" {...register("name")} />
                {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                      <Label htmlFor="sku">SKU (Optional)</Label>
                      <Input id="sku" {...register("sku")} />
                  </div>
                  <div className="grid gap-2">
                      <Label htmlFor="unit">Unit (e.g., box, piece)</Label>
                      <Input id="unit" {...register("unit")} />
                      {errors.unit && <p className="text-red-500 text-sm">{errors.unit.message}</p>}
                  </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                      <Label htmlFor="quantity_on_hand">Quantity on Hand</Label>
                      <Input id="quantity_on_hand" type="number" {...register("quantity_on_hand")} />
                      {errors.quantity_on_hand && <p className="text-red-500 text-sm">{errors.quantity_on_hand.message}</p>}
                  </div>
                  <div className="grid gap-2">
                      <Label htmlFor="reorder_threshold">Reorder Threshold</Label>
                      <Input id="reorder_threshold" type="number" {...register("reorder_threshold")} />
                      {errors.reorder_threshold && <p className="text-red-500 text-sm">{errors.reorder_threshold.message}</p>}
                  </div>
              </div>
              <div className="grid gap-2">
                  <Label htmlFor="unit_price">Unit Price (PKR)</Label>
                  <Input id="unit_price" type="number" {...register("unit_price")} />
                  {errors.unit_price && <p className="text-red-500 text-sm">{errors.unit_price.message}</p>}
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Item'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={isAdjustStockModalOpen} onOpenChange={setIsAdjustStockModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{adjustmentType === 'receive' ? 'Receive Stock' : 'Adjust Stock'} for {itemToAdjust?.name}</DialogTitle>
            <DialogDescription>
              Current quantity: {itemToAdjust?.quantity_on_hand}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="adjustmentValue">
                {adjustmentType === 'receive' ? 'Quantity to Add' : 'New Total Quantity'}
              </Label>
              <Input
                id="adjustmentValue"
                type="number"
                value={adjustmentValue}
                onChange={(e) => setAdjustmentValue(Number(e.target.value))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAdjustStock}>Update Quantity</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <DeleteConfirmationDialog
        isOpen={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        onConfirm={handleDeleteConfirm}
        title="Are you sure you want to delete this item?"
        description="This action cannot be undone and will permanently remove this item from your inventory."
      />
    </div>
  );
}