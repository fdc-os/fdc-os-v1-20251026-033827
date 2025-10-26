import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { usePatientStore } from "@/lib/patientStore";
import { useUiStore } from '@/lib/uiStore';
import { Patient } from "@shared/types";
import { PlusCircle, MoreHorizontal, Search } from "lucide-react";
import { toast } from 'sonner';
import { format } from 'date-fns';
import { DeleteConfirmationDialog } from '@/components/DeleteConfirmationDialog';
export function PatientsPage() {
  const { patients, loading, error, deletePatient } = usePatientStore();
  const { togglePatientModal } = useUiStore();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const openEditModal = (patient: Patient) => {
    togglePatientModal(patient);
  };
  const openNewModal = () => {
    togglePatientModal(null);
  };
  const openDeleteDialog = (patient: Patient) => {
    setPatientToDelete(patient);
    setIsDeleteConfirmOpen(true);
  };
  const handleDeleteConfirm = async () => {
    if (patientToDelete) {
      const success = await deletePatient(patientToDelete.id);
      if (success) toast.success("Patient deleted successfully!");
      else toast.error("Failed to delete patient.");
      setPatientToDelete(null);
      setIsDeleteConfirmOpen(false);
    }
  };
  const filteredPatients = useMemo(() =>
    patients.filter(patient =>
      patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
    ), [patients, searchTerm]);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Patient Management</h1>
          <p className="text-muted-foreground">View, add, and manage patient records.</p>
        </div>
        <Button size="sm" className="gap-1" onClick={openNewModal}>
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Add Patient
          </span>
        </Button>
      </div>
      <Card>
        <CardHeader>
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search patients by name, phone, or email..."
                    className="w-full appearance-none bg-background pl-8 shadow-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Full Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Date of Birth</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow><TableCell colSpan={5} className="text-center text-red-500">{error}</TableCell></TableRow>
              ) : (
                filteredPatients.map((patient: Patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">
                      <Link to={`/patients/${patient.id}`} className="hover:underline text-primary">
                        {patient.full_name}
                      </Link>
                    </TableCell>
                    <TableCell>{patient.phone}</TableCell>
                    <TableCell>{format(new Date(patient.dob), 'MMMM d, yyyy')}</TableCell>
                    <TableCell>{patient.gender}</TableCell>
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
                          <DropdownMenuItem onClick={() => openEditModal(patient)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => openDeleteDialog(patient)}>Delete</DropdownMenuItem>
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
      <DeleteConfirmationDialog
        isOpen={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        onConfirm={handleDeleteConfirm}
        title="Are you sure you want to delete this patient?"
        description="This action cannot be undone. This will permanently delete the patient's record."
      />
    </div>
  );
}