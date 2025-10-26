import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppointmentStore } from "@/lib/appointmentStore";
import { usePatientStore } from "@/lib/patientStore";
import { useServiceStore } from "@/lib/serviceStore";
import { useAuthStore } from '@/lib/auth';
import { Appointment, AppointmentStatus } from "@shared/types";
import { Trash2 } from "lucide-react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { DeleteConfirmationDialog } from '@/components/DeleteConfirmationDialog';
const appointmentFormSchema = z.object({
  patient_id: z.string().min(1, "Patient is required."),
  doctor_user_id: z.string().min(1, "Doctor is required."),
  service_id: z.string().min(1, "Service is required."),
  start_time: z.string().min(1, "Appointment time is required."),
  date: z.string(),
});
type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;
const timeSlots = Array.from({ length: 20 }, (_, i) => {
    const hour = 8 + Math.floor(i / 2);
    const minute = (i % 2) * 30;
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
});
interface CreateAppointmentFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  appointment?: Appointment | null;
}
export function CreateAppointmentForm({ isOpen, onOpenChange, appointment: editingAppointment }: CreateAppointmentFormProps) {
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const { addAppointment, updateAppointment, deleteAppointment } = useAppointmentStore();
  const { patients } = usePatientStore();
  const { services } = useServiceStore();
  const { doctors } = useAuthStore();
  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
  });
  useEffect(() => {
    if (isOpen && editingAppointment) {
      const startTime = parseISO(editingAppointment.start_time);
      reset({
        patient_id: editingAppointment.patient_id,
        doctor_user_id: editingAppointment.doctor_user_id,
        service_id: editingAppointment.service_id,
        date: format(startTime, 'yyyy-MM-dd'),
        start_time: format(startTime, 'HH:mm'),
      });
    } else if (isOpen && !editingAppointment) {
      reset({
        patient_id: '',
        doctor_user_id: '',
        service_id: '',
        start_time: '',
        date: format(new Date(), 'yyyy-MM-dd'),
      });
    }
  }, [isOpen, editingAppointment, reset]);
  const onSubmit: SubmitHandler<AppointmentFormValues> = async (data) => {
    const selectedService = services.find(s => s.id === data.service_id);
    if (!selectedService) {
        toast.error("Selected service not found.");
        return;
    }
    const [hour, minute] = data.start_time.split(':').map(Number);
    const startDate = new Date(data.date);
    // Adjust for timezone offset to prevent date from shifting
    const timezoneOffset = startDate.getTimezoneOffset() * 60000;
    const correctedStartDate = new Date(startDate.getTime() + timezoneOffset);
    correctedStartDate.setHours(hour, minute, 0, 0);
    const endDate = new Date(correctedStartDate.getTime() + selectedService.estimated_duration_minutes * 60000);
    const appointmentData = {
        patient_id: data.patient_id,
        doctor_user_id: data.doctor_user_id,
        service_id: data.service_id,
        start_time: correctedStartDate.toISOString(),
        end_time: endDate.toISOString(),
        status: editingAppointment ? editingAppointment.status : AppointmentStatus.Scheduled,
    };
    let result;
    if (editingAppointment) {
      result = await updateAppointment({ ...editingAppointment, ...appointmentData });
      if (result) toast.success("Appointment updated successfully!");
      else toast.error("Failed to update appointment.");
    } else {
      result = await addAppointment(appointmentData);
      if (result) toast.success("Appointment scheduled successfully!");
      else toast.error("Failed to schedule appointment.");
    }
    if (result) {
      onOpenChange(false);
    }
  };
  const handleDeleteConfirm = async () => {
    if (editingAppointment) {
      const success = await deleteAppointment(editingAppointment.id);
      if (success) toast.success("Appointment deleted successfully!");
      else toast.error("Failed to delete appointment.");
      setIsDeleteConfirmOpen(false);
      onOpenChange(false);
    }
  };
  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{editingAppointment ? 'Edit Appointment' : 'Schedule New Appointment'}</DialogTitle>
            <DialogDescription>
              Fill in the details to {editingAppointment ? 'update the' : 'book a new'} appointment.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="patient_id">Patient</Label>
                <Controller name="patient_id" control={control} render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger><SelectValue placeholder="Select a patient" /></SelectTrigger>
                    <SelectContent>{patients.map(p => <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>)}</SelectContent>
                  </Select>
                )} />
                {errors.patient_id && <p className="text-red-500 text-sm">{errors.patient_id.message}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="service_id">Service</Label>
                <Controller name="service_id" control={control} render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger><SelectValue placeholder="Select a service" /></SelectTrigger>
                    <SelectContent>{services.filter(s => s.is_active).map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                  </Select>
                )} />
                {errors.service_id && <p className="text-red-500 text-sm">{errors.service_id.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                      <Label htmlFor="date">Date</Label>
                      <Input id="date" type="date" {...register("date")} />
                  </div>
                  <div className="grid gap-2">
                      <Label htmlFor="start_time">Time</Label>
                      <Controller name="start_time" control={control} render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger><SelectValue placeholder="Select a time" /></SelectTrigger>
                              <SelectContent>{timeSlots.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                          </Select>
                      )} />
                      {errors.start_time && <p className="text-red-500 text-sm">{errors.start_time.message}</p>}
                  </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="doctor_user_id">Doctor</Label>
                <Controller name="doctor_user_id" control={control} render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger><SelectValue placeholder="Select a doctor" /></SelectTrigger>
                    <SelectContent>{doctors.map(d => <SelectItem key={d.id} value={d.id}>{d.full_name}</SelectItem>)}</SelectContent>
                  </Select>
                )} />
                {errors.doctor_user_id && <p className="text-red-500 text-sm">{errors.doctor_user_id.message}</p>}
              </div>
            </div>
            <DialogFooter className="justify-between">
              {editingAppointment ? (
                <Button type="button" variant="destructive" onClick={() => setIsDeleteConfirmOpen(true)}>
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </Button>
              ) : <div />}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Appointment'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <DeleteConfirmationDialog
        isOpen={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete this appointment?"
        description="This action cannot be undone and will permanently remove the appointment from the schedule."
      />
    </>
  );
}