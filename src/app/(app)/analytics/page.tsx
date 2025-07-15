import { getCustomers } from "@/app/actions";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsDashboard } from "@/components/ledger/analytics-dashboard";

export default async function AnalyticsPage() {
  const customers = await getCustomers();

  return (
    <div className="container py-6 space-y-6">
      <PageHeader
        title="Analytics Dashboard"
        description="View business analytics and insights"
      />
      <AnalyticsDashboard customers={customers} />
    </div>
  );
}