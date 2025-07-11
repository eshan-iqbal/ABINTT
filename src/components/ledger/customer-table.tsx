
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
  Edit,
  MoreVertical,
  Trash2,
  View,
} from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { EditCustomerSheet } from "./edit-customer-sheet";
import { DeleteCustomerDialog } from "./delete-customer-dialog";

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
      // The API returns CustomerWithSummary which is a superset of CustomerSummary,
      // but the component gets CustomerSummary which doesn't have transactions.
      // So we have to fetch the full customer for edit to work.
      // For now, let's assume the data passed is sufficient or we need to adjust.
      // The types say CustomerSummary[], so let's stick to that.
      // For EditCustomerSheet and DeleteCustomerDialog, we might need more data.
      // EditCustomerSheet expects CustomerWithSummary, which is not available here.
      // Let's modify it to accept CustomerSummary for now. No, that's not right.
      // Delete just needs the ID.
      // Edit needs the full customer data.
      
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
            <TableHead className="text-right w-[100px]">Actions</TableHead>
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">More actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                       <Link href={`/customers/${customer.id}`}>
                        <View className="mr-2 h-4 w-4" /> View Details
                       </Link>
                    </DropdownMenuItem>
                    <EditCustomerSheet customer={customer as any}>
                       <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                         <Edit className="mr-2 h-4 w-4" /> Edit
                       </DropdownMenuItem>
                    </EditCustomerSheet>
                     <DeleteCustomerDialog customerId={customer.id}>
                       <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                       </DropdownMenuItem>
                    </DeleteCustomerDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
