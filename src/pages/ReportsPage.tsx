import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { useInvoiceStore } from "@/lib/invoiceStore";
import { useAppointmentStore } from "@/lib/appointmentStore";
import { usePatientStore } from "@/lib/patientStore";
import { InvoiceStatus } from "@shared/types";
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DollarSign, Users, Calendar, FileText } from "lucide-react";
export function ReportsPage() {
  const invoices = useInvoiceStore((state) => state.invoices);
  const appointments = useAppointmentStore((state) => state.appointments);
  const patients = usePatientStore((state) => state.patients);
  // KPI Calculations
  const totalRevenue = invoices.filter(i => i.status === InvoiceStatus.Paid).reduce((sum, i) => sum + i.total_amount, 0);
  const totalAppointments = appointments.length;
  const totalPatients = patients.length;
  const unpaidInvoices = invoices.filter(i => i.status === InvoiceStatus.Unpaid).length;
  // Chart Data Preparation
  const last7Days = eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() });
  const dailyRevenueData = last7Days.map(day => {
    const dayStr = format(day, 'MMM d');
    const revenue = invoices
      .filter(i => i.status === InvoiceStatus.Paid && format(new Date(i.createdAt), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'))
      .reduce((sum, i) => sum + i.total_amount, 0);
    return { name: dayStr, revenue };
  });
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Clinic Reports</h1>
        <p className="text-muted-foreground">An overview of your clinic's performance.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₨ {totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All-time paid invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPatients}</div>
            <p className="text-xs text-muted-foreground">Total patient records</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAppointments}</div>
            <p className="text-xs text-muted-foreground">All scheduled appointments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unpaid Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unpaidInvoices}</div>
            <p className="text-xs text-muted-foreground">Invoices awaiting payment</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Revenue Over Last 7 Days</CardTitle>
          <CardDescription>A look at the daily revenue from paid invoices.</CardDescription>
        </CardHeader>
        <CardContent className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyRevenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis unit="₨" width={80} />
              <Tooltip formatter={(value: number) => `₨ ${value.toLocaleString()}`} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}