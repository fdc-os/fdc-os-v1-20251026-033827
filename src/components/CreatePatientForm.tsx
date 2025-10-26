import { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { usePatientStore } from "@/lib/patientStore";
import { Patient } from "@shared/types";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from 'sonner';
import { format } from 'date-fns';
const patientFormSchema = z.object({
  full_name: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  dob: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date of birth" }),
  gender: z.enum(['Male', 'Female', 'Other']),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits." }),
  email: z.string().email({ message: "Please enter a valid email." }).optional().or(z.literal('')),
  medical_history: z.string().optional(),
});
type PatientFormValues = z.infer<typeof patientFormSchema>;
interface CreatePatientFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  patient?: Patient | null;
}
export function CreatePatientForm({ isOpen, onOpenChange, patient: editingPatient }: CreatePatientFormProps) {
  const { addPatient, updatePatient } = usePatientStore();
  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
  });
  useEffect(() => {
    if (isOpen && editingPatient) {
      reset({ ...editingPatient, dob: format(new Date(editingPatient.dob), 'yyyy-MM-dd') });
    } else if (isOpen && !editingPatient) {
      reset({ full_name: '', dob: '', gender: 'Other', phone: '', email: '', medical_history: '' });
    }
  }, [isOpen, editingPatient, reset]);
  const onSubmit: SubmitHandler<PatientFormValues> = async (data) => {
    if (editingPatient) {
      const result = await updatePatient({ ...editingPatient, ...data });
      if (result) toast.success("Patient updated successfully!");
      else toast.error("Failed to update patient.");
    } else {
      const result = await addPatient(data);
      if (result) toast.success("Patient added successfully!");
      else toast.error("Failed to add patient.");
    }
    onOpenChange(false);
  };
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editingPatient ? 'Edit Patient' : 'Add New Patient'}</DialogTitle>
          <DialogDescription>
            Fill in the details to {editingPatient ? 'update the' : 'create a new'} patient record.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input id="full_name" {...register("full_name")} />
              {errors.full_name && <p className="text-red-500 text-sm">{errors.full_name.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input id="dob" type="date" {...register("dob")} />
                    {errors.dob && <p className="text-red-500 text-sm">{errors.dob.message}</p>}
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Controller
                        control={control}
                        name="gender"
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Male">Male</SelectItem>
                                    <SelectItem value="Female">Female</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.gender && <p className="text-red-500 text-sm">{errors.gender.message}</p>}
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" {...register("phone")} />
                    {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="email">Email (Optional)</Label>
                    <Input id="email" type="email" {...register("email")} />
                    {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="medical_history">Medical History (Optional)</Label>
              <Textarea id="medical_history" {...register("medical_history")} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Patient'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}