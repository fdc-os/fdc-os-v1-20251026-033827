import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/lib/auth";
import { useAppointmentStore } from "@/lib/appointmentStore";
import { useInvoiceStore } from "@/lib/invoiceStore";
import { useInventoryStore } from "@/lib/inventoryStore";
import { usePatientStore } from "@/lib/patientStore";
import { useServiceStore } from "@/lib/serviceStore";
import { InvoiceStatus } from "@shared/types";
import { DollarSign, Users, Calendar, AlertCircle, ArrowUpRight } from "lucide-react";
import { isToday, isFuture, parseISO, format } from "date-fns";
import { RecentActivity } from "@/components/RecentActivity";
export function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const { appointments, loading: appointmentsLoading } = useAppointmentStore();
  const { invoices, loading: invoicesLoading } = useInvoiceStore();
  const { inventoryItems, loading: inventoryLoading } = useInventoryStore();
  const { patients } = usePatientStore();
  const { services } = useServiceStore();
  const isLoading = appointmentsLoading || invoicesLoading || inventoryLoading;
  const todayAppointments = appointments.filter(a => isToday(parseISO(a.start_time)));
  const upcomingAppointmentsToday = todayAppointments
    .filter(a => isFuture(parseISO(a.start_time)))
    .sort((a, b) => parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime())
    .slice(0, 5);
  const todayRevenue = invoices
    .filter(i => i.status === InvoiceStatus.Paid && isToday(parseISO(i.createdAt)))
    .reduce((sum, i) => sum + i.total_amount, 0);
  const outstandingInvoices = invoices.filter(i => i.status === InvoiceStatus.Unpaid);
  const outstandingAmount = outstandingInvoices.reduce((sum, i) => sum + i.total_amount, 0);
  const lowStockItems = inventoryItems.filter(item => item.quantity_on_hand <= item.reorder_threshold);
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome back, {user?.full_name}!</h1>
        <p className="text-muted-foreground">Here's a quick overview of your clinic's status today.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-32" /> : <div className="text-2xl font-bold">₨ {todayRevenue.toLocaleString()}</div>}
            <p className="text-xs text-muted-foreground">
              Based on today's paid invoices
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Appointments
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-12" /> : <div className="text-2xl font-bold">{todayAppointments.length}</div>}
            <p className="text-xs text-muted-foreground">
              Total appointments scheduled for today
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Invoices</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-32" /> : <div className="text-2xl font-bold">₨ {outstandingAmount.toLocaleString()}</div>}
            <p className="text-xs text-muted-foreground">
              Total from {outstandingInvoices.length} invoices
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-12" /> : <div className="text-2xl font-bold">{lowStockItems.length}</div>}
            <p className="text-xs text-muted-foreground">
              Items need reordering
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Today's Appointments</CardTitle>
            <CardDescription>
              You have {upcomingAppointmentsToday.length} upcoming appointments today.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
              ) : upcomingAppointmentsToday.length > 0 ? (
                upcomingAppointmentsToday.map(apt => {
                  const patient = patients.find(p => p.id === apt.patient_id);
                  const service = services.find(s => s.id === apt.service_id);
                  return (
                    <div key={apt.id} className="flex items-center">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>{patient?.full_name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{patient?.full_name}</p>
                        <p className="text-sm text-muted-foreground">{service?.name}</p>
                      </div>
                      <div className="ml-auto font-medium text-right">
                        <p>{format(parseISO(apt.start_time), 'h:mm a')}</p>
                        <Badge variant="outline">{apt.status}</Badge>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No upcoming appointments for today.</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild size="sm" className="ml-auto gap-1">
              <Link to="/appointments">
                View Calendar
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        <RecentActivity />
      </div>
    </div>
  );
}