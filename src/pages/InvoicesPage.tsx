import { useState, useMemo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useInvoiceStore } from "@/lib/invoiceStore";
import { usePatientStore } from "@/lib/patientStore";
import { useUiStore } from '@/lib/uiStore';
import { Invoice, InvoiceStatus } from "@shared/types";
import { PlusCircle, MoreHorizontal, Search } from "lucide-react";
import { format } from 'date-fns';
import { toast } from 'sonner';
export function InvoicesPage() {
  const { invoices, loading, error, recordPayment } = useInvoiceStore();
  const { patients } = usePatientStore();
  const { toggleInvoiceModal } = useUiStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const getPatientName = useCallback((patientId: string) => {
    return patients.find(p => p.id === patientId)?.full_name || 'Unknown Patient';
  }, [patients]);
  const filteredInvoices = useMemo(() =>
    invoices.filter(invoice => {
      const patientName = getPatientName(invoice.patient_id).toLowerCase();
      const term = searchTerm.toLowerCase();
      return patientName.includes(term) || invoice.invoice_number.toLowerCase().includes(term);
    }), [invoices, searchTerm, getPatientName]);
  const getStatusVariant = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.Paid: return 'default';
      case InvoiceStatus.Unpaid: return 'destructive';
      case InvoiceStatus.PartiallyPaid: return 'secondary';
      default: return 'outline';
    }
  };
  const openPaymentModal = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPaymentAmount(invoice.total_amount);
    setIsPaymentModalOpen(true);
  };
  const handleRecordPayment = async () => {
    if (selectedInvoice) {
      const result = await recordPayment(selectedInvoice.id, paymentAmount);
      if (result) {
        toast.success("Payment recorded successfully!");
        setIsPaymentModalOpen(false);
        setSelectedInvoice(null);
      } else {
        toast.error("Failed to record payment.");
      }
    }
  };
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invoice Management</h1>
          <p className="text-muted-foreground">View, create, and manage patient invoices.</p>
        </div>
        <Button size="sm" className="gap-1" onClick={toggleInvoiceModal}>
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Create Invoice
          </span>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by invoice # or patient name..."
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
                <TableHead>Invoice #</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount (PKR)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow><TableCell colSpan={6} className="text-center text-red-500">{error}</TableCell></TableRow>
              ) : (
                filteredInvoices.map((invoice: Invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                    <TableCell>{getPatientName(invoice.patient_id)}</TableCell>
                    <TableCell>{format(new Date(invoice.createdAt), 'MMMM d, yyyy')}</TableCell>
                    <TableCell>{`₨ ${invoice.total_amount.toLocaleString()}`}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </TableCell>
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
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openPaymentModal(invoice)}>Record Payment</DropdownMenuItem>
                          <DropdownMenuItem>Print</DropdownMenuItem>
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
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment for Invoice {selectedInvoice?.invoice_number}</DialogTitle>
            <DialogDescription>
              Enter the payment details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Payment Amount (PKR)</Label>
              <Input
                id="amount"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleRecordPayment}>Record Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}