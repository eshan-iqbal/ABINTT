import { getCustomers } from "@/app/actions";
import { CustomerTable } from "@/components/ledger/customer-table";

export default async function DashboardPage() {
  const customers = await getCustomers();

  return <CustomerTable customers={customers} />;
}
