import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { usePatientStore } from '@/lib/patientStore';
import { useInvoiceStore } from '@/lib/invoiceStore';
import { useAppointmentStore } from '@/lib/appointmentStore';
import { ActivityLog } from '@shared/types';
import { formatDistanceToNow } from 'date-fns';
import { Users, FileText, Calendar } from 'lucide-react';
export function RecentActivity() {
  const patients = usePatientStore((state) => state.patients);
  const invoices = useInvoiceStore((state) => state.invoices);
  const appointments = useAppointmentStore((state) => state.appointments);
  const activities: ActivityLog[] = useMemo(() => {
    const patientActivities: ActivityLog[] = patients.map(p => ({
      id: `p-${p.id}`,
      type: 'PATIENT',
      description: `${p.full_name} was registered.`,
      timestamp: p.createdAt,
    }));
    const invoiceActivities: ActivityLog[] = invoices.map(i => ({
      id: `i-${i.id}`,
      type: 'INVOICE',
      description: `Invoice ${i.invoice_number} for ₨${i.total_amount.toLocaleString()} was created.`,
      timestamp: i.createdAt,
    }));
    const appointmentActivities: ActivityLog[] = appointments.map(a => ({
        id: `a-${a.id}`,
        type: 'APPOINTMENT',
        description: `Appointment scheduled for ${patients.find(p => p.id === a.patient_id)?.full_name || 'a patient'}.`,
        timestamp: a.start_time,
    }));
    return [...patientActivities, ...invoiceActivities, ...appointmentActivities]
      .sort((a, b) => {
        const dateA = new Date(a.timestamp);
        const dateB = new Date(b.timestamp);
        if (isNaN(dateA.getTime())) return 1;
        if (isNaN(dateB.getTime())) return -1;
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 10);
  }, [patients, invoices, appointments]);
  const IconMap = {
    PATIENT: <Users className="h-4 w-4" />,
    INVOICE: <FileText className="h-4 w-4" />,
    APPOINTMENT: <Calendar className="h-4 w-4" />,
    INVENTORY: <Users className="h-4 w-4" />,
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>A log of the latest activities in the clinic.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.length > 0 ? (
          activities.map((activity) => (
            <div key={activity.id} className="flex items-center gap-4">
              <Avatar className="hidden h-9 w-9 sm:flex">
                <AvatarFallback>{IconMap[activity.type]}</AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <p className="text-sm font-medium leading-none">{activity.description}</p>
                <p className="text-sm text-muted-foreground">
                  {(() => {
                    const date = new Date(activity.timestamp);
                    return !isNaN(date.getTime())
                      ? formatDistanceToNow(date, { addSuffix: true })
                      : 'Invalid date';
                  })()}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">No recent activity.</p>
        )}
      </CardContent>
    </Card>
  );
}