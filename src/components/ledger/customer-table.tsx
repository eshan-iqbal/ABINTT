
"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CustomerSummary } from "@/lib/types";
import {
    ArrowDown,
    ArrowRight,
    ArrowUp,
  ArrowUpDown,
} from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

type SortKey = keyof CustomerSummary | 'balance';

export function CustomerTable({
  customers,
}: {
  customers: CustomerSummary[];
}) {
  const [sortKey, setSortKey] = React.useState<SortKey>("name");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("asc");

  const sortedCustomers = React.useMemo(() => {
    return [...customers].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (aValue < bValue) {
        return sortOrder === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortOrder === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [customers, sortKey, sortOrder]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const SortableHeader = ({
    columnKey,
    children,
    className,
  }: {
    columnKey: SortKey;
    children: React.ReactNode;
    className?: string;
  }) => (
    <TableHead className={className} onClick={() => handleSort(columnKey)}>
      <div className="flex items-center gap-2 cursor-pointer">
        {children}
        {sortKey === columnKey ? (
          sortOrder === "asc" ? (
            <ArrowUp className="h-4 w-4" />
          ) : (
            <ArrowDown className="h-4 w-4" />
          )
        ) : (
          <ArrowUpDown className="h-4 w-4 text-muted-foreground/50" />
        )}
      </div>
    </TableHead>
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };
  
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHeader columnKey="name">Name</SortableHeader>
            <SortableHeader columnKey="phone">Phone</SortableHeader>
            <SortableHeader columnKey="balance" className="text-right">Balance</SortableHeader>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedCustomers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell className="font-medium">{customer.name}</TableCell>
              <TableCell>{customer.phone}</TableCell>
              <TableCell className={`text-right font-medium ${customer.balance > 0 ? 'text-destructive' : 'text-green-400'}`}>
                {formatCurrency(customer.balance)}
              </TableCell>
              <TableCell className="text-right">
                <Link href={`/customers/${customer.id}`}>
                    <Button variant="ghost" size="sm">
                        View <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
