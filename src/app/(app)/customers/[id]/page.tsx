import { getCustomerById } from "@/app/actions";
import { AddPaymentSheet } from "@/components/ledger/add-payment-sheet";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FileText, Mail, MapPin, Phone, PlusCircle, Trash2, MessageCircle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PaymentHistoryTable } from "@/components/ledger/payment-history-table";
import { SummaryTool } from "@/components/ledger/summary-tool";
import { DeleteCustomerDialog } from "@/components/ledger/delete-customer-dialog";
import { EditCustomerSheet } from "@/components/ledger/edit-customer-sheet";

export default async function CustomerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const customer = await getCustomerById(params.id);

  if (!customer) {
    notFound();
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };
  
  const balanceColor = customer.balance > 0 ? "text-destructive" : "text-green-400";
  
  const whatsAppMessage = encodeURIComponent(`Hello ${customer.name}, here is your latest payment statement from AB INTERIOR. Your current outstanding balance is ${formatCurrency(customer.balance)}. You can view your full statement here: ${process.env.NEXT_PUBLIC_APP_URL}/customers/${customer.id}/statement. Thank you!`);
  const whatsappUrl = `https://wa.me/${customer.phone}?text=${whatsAppMessage}`;


  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title={customer.name}
        description={`Manage ${customer.name}'s payment ledger.`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <EditCustomerSheet customer={customer} />
          <DeleteCustomerDialog customerId={customer.id}>
             <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          </DeleteCustomerDialog>
          <Link href={`/customers/${customer.id}/statement`} target="_blank">
            <Button>
              <FileText className="mr-2 h-4 w-4" /> View Statement
            </Button>
          </Link>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
             <Button variant="secondary">
                <MessageCircle className="mr-2 h-4 w-4" /> Send Reminder
            </Button>
          </a>
        </div>
      </PageHeader>
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Customer Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground"/> <span>{customer.email}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground"/> <span>{customer.phone}</span>
                </div>
                 <div className="flex items-center gap-2 col-span-full sm:col-span-1">
                    <MapPin className="h-4 w-4 text-muted-foreground"/> <span>{customer.address}</span>
                </div>
            </div>
            <Separator/>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center pt-2">
                <div>
                    <p className="text-sm text-muted-foreground">Total Paid</p>
                    <p className="text-2xl font-bold text-green-400">{formatCurrency(customer.totalPaid)}</p>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Total Due</p>
                    <p className="text-2xl font-bold text-orange-400">{formatCurrency(customer.totalDue)}</p>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Balance</p>
                    <p className={`text-2xl font-bold ${balanceColor}`}>{formatCurrency(customer.balance)}</p>
                </div>
            </div>
          </CardContent>
        </Card>

        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="font-headline">Payment History</CardTitle>
                </div>
                <AddPaymentSheet customerId={customer.id}>
                    <Button variant="secondary">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Transaction
                    </Button>
                </AddPaymentSheet>
            </CardHeader>
            <CardContent>
                <PaymentHistoryTable transactions={customer.transactions} customerId={customer.id} />
            </CardContent>
        </Card>
        
        <SummaryTool customerId={customer.id} />

      </main>
    </div>
  );
}
