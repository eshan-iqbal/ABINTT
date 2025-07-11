import { getCustomerById } from "@/app/actions";
import { Logo } from "@/components/icons";
import { ShareStatementButton } from "@/components/ledger/share-statement-button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { notFound } from "next/navigation";
import type { Transaction } from "@/lib/types";

export default async function StatementPage({
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
  
  const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
          return 'Invalid Date';
      }
      return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: 'UTC'
      });
  }

  return (
    <div className="bg-white text-black min-h-screen p-4 sm:p-8 lg:p-12 font-sans">
      <div id="statement-content" className="max-w-4xl mx-auto border rounded-lg p-8 shadow-lg print:border-none print:shadow-none bg-white">
        <header className="flex justify-between items-start mb-8">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <Logo className="size-10 text-gray-800" />
                    <h1 className="text-4xl font-bold text-gray-800 font-headline">AB INTERIOR</h1>
                </div>
                <p className="text-gray-500">Payment Statement</p>
            </div>
            <div className="text-right">
                <h2 className="text-2xl font-semibold">{customer.name}</h2>
                <p className="text-gray-600">{customer.address}</p>
                <p className="text-gray-600">{customer.email}</p>
                <p className="text-gray-600">{customer.phone}</p>
            </div>
        </header>

        <Separator className="my-8 bg-gray-300" />

        <main>
          <h3 className="text-xl font-semibold mb-4">Transaction History</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customer.transactions.map((t: Transaction) => (
                <TableRow key={t.id}>
                  <TableCell>{formatDate(t.date)}</TableCell>
                  <TableCell className="max-w-[300px]">{t.notes}</TableCell>
                  <TableCell>
                    <Badge variant={t.type === 'CREDIT' ? "default" : "destructive"} 
                           className={t.type === 'CREDIT' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {t.type === 'CREDIT' ? 'Payment Received' : 'New Bill'}
                    </Badge>
                  </TableCell>
                  <TableCell className={`text-right font-medium ${t.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(t.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
                <TableRow>
                    <TableCell colSpan={3} className="text-right font-bold text-lg">Total Due</TableCell>
                    <TableCell className="text-right font-bold text-lg">{formatCurrency(customer.totalDue)}</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell colSpan={3} className="text-right font-bold text-lg">Total Paid</TableCell>
                    <TableCell className="text-right font-bold text-lg text-green-600">{formatCurrency(customer.totalPaid)}</TableCell>
                </TableRow>
                <TableRow className="bg-gray-100">
                    <TableCell colSpan={3} className="text-right font-bold text-xl">Balance</TableCell>
                    <TableCell className="text-right font-bold text-xl text-blue-500">
                        {formatCurrency(customer.balance)}
                    </TableCell>
                </TableRow>
            </TableFooter>
          </Table>
        </main>
        
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>Thank you for your business!</p>
          <p>Generated on {new Date().toLocaleDateString()}</p>
        </footer>
      </div>
      <div className="max-w-4xl mx-auto mt-4 flex justify-center gap-4 print:hidden">
        <ShareStatementButton customer={customer} />
      </div>
    </div>
  );
}
