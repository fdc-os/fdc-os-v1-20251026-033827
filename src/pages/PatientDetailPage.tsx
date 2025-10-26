import { useParams, Link } from 'react-router-dom';
import { usePatientStore } from '@/lib/patientStore';
import { useAppointmentStore } from '@/lib/appointmentStore';
import { useInvoiceStore } from '@/lib/invoiceStore';
import { useServiceStore } from '@/lib/serviceStore';
import { useAuthStore } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Phone, Mail, Calendar as CalendarIcon } from 'lucide-react';
import { format, differenceInYears } from 'date-fns';
import { InvoiceStatus } from '@shared/types';
export function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { patients, loading: patientsLoading } = usePatientStore();
  const { appointments, loading: appointmentsLoading } = useAppointmentStore();
  const { invoices, loading: invoicesLoading } = useInvoiceStore();
  const { services } = useServiceStore();
  const { doctors } = useAuthStore();
  const patient = patients.find((p) => p.id === id);
  const patientAppointments = appointments.filter((a) => a.patient_id === id);
  const patientInvoices = invoices.filter((i) => i.patient_id === id);
  const isLoading = patientsLoading || appointmentsLoading || invoicesLoading;
  const getDoctorName = (doctorId: string) => doctors.find(d => d.id === doctorId)?.full_name || 'N/A';
  const getServiceName = (serviceId: string) => services.find(s => s.id === serviceId)?.name || 'N/A';
  const getStatusVariant = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.Paid: return 'default';
      case InvoiceStatus.Unpaid: return 'destructive';
      case InvoiceStatus.PartiallyPaid: return 'secondary';
      default: return 'outline';
    }
  };
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full md:col-span-2" />
        </div>
      </div>
    );
  }
  if (!patient) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold">Patient not found</h2>
        <p className="text-muted-foreground">The patient you are looking for does not exist.</p>
        <Button asChild className="mt-4">
          <Link to="/patients">
            <ArrowLeft className="mr-2 h-4 w-4" /> Go back to Patients
          </Link>
        </Button>
      </div>
    );
  }
  const age = differenceInYears(new Date(), new Date(patient.dob));
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link to="/patients">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{patient.full_name}</h1>
          <p className="text-muted-foreground">Patient Profile</p>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <User className="h-5 w-5 text-muted-foreground" />
                <span>{patient.gender}, {age} years old</span>
              </div>
              <div className="flex items-center gap-4">
                <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                <span>Born on {format(new Date(patient.dob), 'MMMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-4">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <span>{patient.phone}</span>
              </div>
              {patient.email && (
                <div className="flex items-center gap-4">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <span>{patient.email}</span>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Medical History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {patient.medical_history || 'No medical history provided.'}
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Tabs defaultValue="appointments">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="appointments">Appointment History</TabsTrigger>
              <TabsTrigger value="invoices">Invoice History</TabsTrigger>
            </TabsList>
            <TabsContent value="appointments">
              <Card>
                <CardHeader>
                  <CardTitle>Appointments</CardTitle>
                  <CardDescription>{patientAppointments.length} appointments found.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {patientAppointments.map(apt => (
                        <TableRow key={apt.id}>
                          <TableCell>{format(new Date(apt.start_time), 'PPpp')}</TableCell>
                          <TableCell>{getServiceName(apt.service_id)}</TableCell>
                          <TableCell>{getDoctorName(apt.doctor_user_id)}</TableCell>
                          <TableCell><Badge>{apt.status}</Badge></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="invoices">
              <Card>
                <CardHeader>
                  <CardTitle>Invoices</CardTitle>
                  <CardDescription>{patientInvoices.length} invoices found.</CardDescription>
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
                      {patientInvoices.map(inv => (
                        <TableRow key={inv.id}>
                          <TableCell>{inv.invoice_number}</TableCell>
                          <TableCell>{format(new Date(inv.createdAt), 'PP')}</TableCell>
                          <TableCell>₨{inv.total_amount.toLocaleString()}</TableCell>
                          <TableCell><Badge variant={getStatusVariant(inv.status)}>{inv.status}</Badge></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}