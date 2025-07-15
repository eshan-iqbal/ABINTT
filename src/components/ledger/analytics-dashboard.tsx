"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerSummary } from "@/lib/types";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface AnalyticsDashboardProps {
  customers: CustomerSummary[] | null;
}

export function AnalyticsDashboard({ customers }: AnalyticsDashboardProps) {
  // Calculate total metrics
  const metrics = useMemo(() => {
    if (!customers) return { totalCustomers: 0, totalDue: 0, totalPaid: 0, totalBalance: 0 };
    
    return {
      totalCustomers: customers.length,
      totalDue: customers.reduce((sum, customer) => sum + customer.totalDue, 0),
      totalPaid: customers.reduce((sum, customer) => sum + customer.totalPaid, 0),
      totalBalance: customers.reduce((sum, customer) => sum + customer.balance, 0),
    };
  }, [customers]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  // Prepare data for payment mode distribution chart
  const paymentModeData = useMemo(() => {
    if (!customers) return [];
    
    // Since we don't have direct access to all transactions in the customers summary
    // We'll use a placeholder for now
    // In a real implementation, you would fetch this data from the server
    const modeData = [
      { name: "CASH", value: 35 },
      { name: "UPI", value: 40 },
      { name: "CARD", value: 15 },
      { name: "OTHER", value: 10 },
    ];
    
    return modeData;
  }, [customers]);

  // Prepare data for top customers chart
  const topCustomersData = useMemo(() => {
    if (!customers) return [];
    
    return [...customers]
      .sort((a, b) => b.totalDue - a.totalDue)
      .slice(0, 5)
      .map(customer => ({
        name: customer.name,
        totalDue: customer.totalDue,
        totalPaid: customer.totalPaid,
        balance: customer.balance,
      }));
  }, [customers]);

  // Prepare data for balance distribution chart
  const balanceDistributionData = useMemo(() => {
    if (!customers) return [];
    
    const positiveBalance = customers.filter(c => c.balance > 0).length;
    const zeroBalance = customers.filter(c => c.balance === 0).length;
    const negativeBalance = customers.filter(c => c.balance < 0).length;
    
    return [
      { name: "Due Balance", value: positiveBalance },
      { name: "Zero Balance", value: zeroBalance },
      { name: "Advance Payment", value: negativeBalance },
    ];
  }, [customers]);

  // Colors for charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalCustomers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Due</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalDue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalPaid)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalBalance)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Customers Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Top Customers by Due Amount</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topCustomersData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="totalDue" fill="#8884d8" name="Total Due" />
                <Bar dataKey="totalPaid" fill="#82ca9d" name="Total Paid" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Balance Distribution Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Customer Balance Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={balanceDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {balanceDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Payment Mode Distribution */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Payment Mode Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentModeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {paymentModeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Trend Chart (Placeholder) */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Monthly Transaction Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={[
                  { month: 'Jan', credit: 4000, debit: 2400 },
                  { month: 'Feb', credit: 3000, debit: 1398 },
                  { month: 'Mar', credit: 2000, debit: 9800 },
                  { month: 'Apr', credit: 2780, debit: 3908 },
                  { month: 'May', credit: 1890, debit: 4800 },
                  { month: 'Jun', credit: 2390, debit: 3800 },
                ]}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Line type="monotone" dataKey="credit" stroke="#82ca9d" name="Credit" />
                <Line type="monotone" dataKey="debit" stroke="#8884d8" name="Debit" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}