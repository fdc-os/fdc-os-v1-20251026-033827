import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Search, User, Calendar, FileText } from 'lucide-react';
import { usePatientStore } from '@/lib/patientStore';
import { useServiceStore } from '@/lib/serviceStore';
import { useAppointmentStore } from '@/lib/appointmentStore';
import { format } from 'date-fns';
export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const patients = usePatientStore((state) => state.patients);
  const services = useServiceStore((state) => state.services);
  const appointments = useAppointmentStore((state) => state.appointments);
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);
  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };
  return (
    <>
      <Button
        variant="outline"
        className="w-full justify-start text-sm text-muted-foreground md:w-2/3 lg:w-1/3"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-block">Search patients, services, appointments...</span>
        <span className="inline-block lg:hidden">Search...</span>
        <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Patients">
            {patients.slice(0, 5).map((patient) => (
              <CommandItem
                key={patient.id}
                value={`patient-${patient.full_name}`}
                onSelect={() => runCommand(() => navigate(`/patients/${patient.id}`))}
              >
                <User className="mr-2 h-4 w-4" />
                <span>{patient.full_name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Services">
            {services.slice(0, 5).map((service) => (
              <CommandItem
                key={service.id}
                value={`service-${service.name}`}
                onSelect={() => runCommand(() => navigate('/services'))}
              >
                <FileText className="mr-2 h-4 w-4" />
                <span>{service.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Appointments">
            {appointments.slice(0, 5).map((appointment) => {
              const patient = patients.find(p => p.id === appointment.patient_id);
              return (
                <CommandItem
                  key={appointment.id}
                  value={`appointment-${patient?.full_name}-${appointment.start_time}`}
                  onSelect={() => runCommand(() => navigate('/appointments'))}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>
                    {patient?.full_name} on {format(new Date(appointment.start_time), 'MMM d, yyyy')}
                  </span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}