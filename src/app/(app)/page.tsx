import { getCustomers } from "@/app/actions";
import { CustomerCard } from "@/components/ledger/customer-card";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search } from "lucide-react";

export default async function DashboardPage() {
  const customers = await getCustomers();

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Customers"
        description="An overview of all your customers and their balances."
      >
        <div className="flex items-center gap-2">
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search customers..." className="pl-8 w-48 md:w-64" />
            </div>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Customer
            </Button>
        </div>
      </PageHeader>
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
        {customers.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {customers.map((customer) => (
              <CustomerCard key={customer.id} customer={customer} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <h2 className="text-2xl font-semibold">No Customers Found</h2>
            <p className="text-muted-foreground mt-2">
              Get started by adding your first customer.
            </p>
            <Button className="mt-4">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Customer
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
