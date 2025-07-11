import { getCustomers } from "@/app/actions";
import { AddCustomerSheet } from "@/components/ledger/add-customer-sheet";
import { CustomerTable } from "@/components/ledger/customer-table";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default async function DashboardPage() {
  const customers = await getCustomers();

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Customers"
        description="An overview of all your customers and their balances."
      >
        <AddCustomerSheet>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Customer
          </Button>
        </AddCustomerSheet>
      </PageHeader>
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
        <div className="max-w-5xl mx-auto">
          {customers.length > 0 ? (
            <CustomerTable customers={customers} />
          ) : (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center border-2 border-dashed rounded-lg">
              <h2 className="text-2xl font-semibold">No Customers Found</h2>
              <p className="text-muted-foreground mt-2">
                Get started by adding your first customer.
              </p>
              <AddCustomerSheet>
                  <Button className="mt-4">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Customer
                  </Button>
              </AddCustomerSheet>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
