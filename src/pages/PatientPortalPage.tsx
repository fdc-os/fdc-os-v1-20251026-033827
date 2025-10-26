import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/lib/auth";
import { useAppointmentStore } from "@/lib/appointmentStore";
import { useInvoiceStore } from "@/lib/invoiceStore";
import { useServiceStore } from "@/lib/serviceStore";
import { format } from 'date-fns';
import { InvoiceStatus } from "@shared/types";
export function PatientPortalPage() {
  const user = useAuthStore((state) => state.user);
  const { appointments, loading: appointmentsLoading } = useAppointmentStore();
  const { invoices, loading: invoicesLoading } = useInvoiceStore();
  const { services } = useServiceStore();
  const upcomingAppointments = appointments
    .filter(a => new Date(a.start_time) >= new Date())
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  const getStatusVariant = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.Paid: return 'default';
      case InvoiceStatus.Unpaid: return 'destructive';
      case InvoiceStatus.PartiallyPaid: return 'secondary';
      default: return 'outline';
    }
  };
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome to your Patient Portal, {user?.full_name}!</h1>
        <p className="text-muted-foreground">Here you can view your upcoming appointments and invoice history.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointmentsLoading ? (
                <TableRow><TableCell colSpan={3} className="text-center">Loading appointments...</TableCell></TableRow>
              ) : upcomingAppointments.length > 0 ? (
                upcomingAppointments.map(apt => (
                  <TableRow key={apt.id}>
                    <TableCell>{format(new Date(apt.start_time), 'MMMM d, yyyy @ h:mm a')}</TableCell>
                    <TableCell>{services.find(s => s.id === apt.service_id)?.name || 'N/A'}</TableCell>
                    <TableCell><Badge>{apt.status}</Badge></TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={3} className="text-center">No upcoming appointments.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoicesLoading ? (
                <TableRow><TableCell colSpan={4} className="text-center">Loading invoices...</TableCell></TableRow>
              ) : invoices.length > 0 ? (
                invoices.map(inv => (
                  <TableRow key={inv.id}>
                    <TableCell>{inv.invoice_number}</TableCell>
                    <TableCell>{format(new Date(inv.createdAt), 'MMMM d, yyyy')}</TableCell>
                    <TableCell>₨{inv.total_amount.toLocaleString()}</TableCell>
                    <TableCell><Badge variant={getStatusVariant(inv.status)}>{inv.status}</Badge></TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={4} className="text-center">No invoices found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}