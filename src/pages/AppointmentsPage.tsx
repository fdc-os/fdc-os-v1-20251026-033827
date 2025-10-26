import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAppointmentStore } from "@/lib/appointmentStore";
import { usePatientStore } from "@/lib/patientStore";
import { useServiceStore } from "@/lib/serviceStore";
import { useUiStore } from '@/lib/uiStore';
import { Appointment } from "@shared/types";
import { PlusCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfWeek, addDays, eachDayOfInterval, isSameDay, parseISO, getHours, getMinutes, differenceInMinutes } from 'date-fns';
const timeSlots = Array.from({ length: 20 }, (_, i) => {
    const hour = 8 + Math.floor(i / 2);
    const minute = (i % 2) * 30;
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
});
export function AppointmentsPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { toggleAppointmentModal } = useUiStore();
  const { appointments, loading: appointmentsLoading } = useAppointmentStore();
  const { patients, loading: patientsLoading } = usePatientStore();
  const { services, loading: servicesLoading } = useServiceStore();
  const isLoading = appointmentsLoading || patientsLoading || servicesLoading;
  const openEditModal = (appointment: Appointment) => {
    toggleAppointmentModal(appointment);
  };
  const openNewModal = () => {
    toggleAppointmentModal(null);
  };
  const start = startOfWeek(currentDate, { weekStartsOn: 1 });
  const end = addDays(start, 6);
  const weekDays = eachDayOfInterval({ start, end });
  const goToPreviousWeek = () => setCurrentDate(addDays(currentDate, -7));
  const goToNextWeek = () => setCurrentDate(addDays(currentDate, 7));
  const goToToday = () => setCurrentDate(new Date());
  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold tracking-tight">Appointments</h1>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={goToPreviousWeek}><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="outline" onClick={goToToday}>Today</Button>
                <Button variant="outline" size="icon" onClick={goToNextWeek}><ChevronRight className="h-4 w-4" /></Button>
            </div>
            <h2 className="text-xl font-semibold text-muted-foreground">{format(start, 'MMMM yyyy')}</h2>
        </div>
        <Button size="sm" className="gap-1" onClick={openNewModal}>
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            New Appointment
          </span>
        </Button>
      </div>
      <Card className="flex-1 flex flex-col">
        <div className="grid grid-cols-7 border-b">
            {weekDays.map(day => (
                <div key={day.toString()} className="p-2 text-center font-semibold">
                    <div>{format(day, 'EEE')}</div>
                    <div className={`text-2xl ${isSameDay(day, new Date()) ? 'text-primary' : ''}`}>{format(day, 'd')}</div>
                </div>
            ))}
        </div>
        {isLoading ? (
          <div className="flex-1 center p-8"><p>Loading appointments...</p></div>
        ) : (
          <div className="flex-1 grid grid-cols-7 h-full overflow-y-auto">
              {weekDays.map(day => (
                  <div key={day.toString()} className="border-r relative">
                      {timeSlots.map(time => (
                          <div key={time} className="h-16 border-b"></div>
                      ))}
                      {appointments.filter(a => isSameDay(parseISO(a.start_time), day)).map(apt => {
                          const top = (getHours(parseISO(apt.start_time)) - 8) * 2 * 32 + (getMinutes(parseISO(apt.start_time)) / 30) * 32;
                          const height = Math.max(32, differenceInMinutes(parseISO(apt.end_time), parseISO(apt.start_time)) * (64 / 60));
                          const patient = patients.find(p => p.id === apt.patient_id);
                          return (
                              <div key={apt.id} className="absolute w-[95%] left-1 p-2 rounded-lg bg-primary/80 text-primary-foreground shadow-md cursor-pointer hover:bg-primary" style={{ top: `${top}px`, height: `${height}px` }} onClick={() => openEditModal(apt)}>
                                  <p className="text-xs font-bold truncate">{patient?.full_name}</p>
                                  <p className="text-xs truncate">{services.find(s => s.id === apt.service_id)?.name}</p>
                              </div>
                          )
                      })}
                  </div>
              ))}
          </div>
        )}
      </Card>
    </div>
  );
}