
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
import type { Transaction } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Edit,
  MoreVertical,
  Trash2,
} from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { EditTransactionSheet } from "./edit-transaction-sheet";
import { DeleteTransactionDialog } from "./delete-transaction-dialog";


type SortKey = keyof Omit<Transaction, 'customerId'>;

export function PaymentHistoryTable({
  transactions,
  customerId,
}: {
  transactions: Transaction[];
  customerId: string;
}) {
  const [sortKey, setSortKey] = React.useState<SortKey>("date");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");

  const sortedTransactions = React.useMemo(() => {
    return [...transactions].sort((a, b) => {
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
  }, [transactions, sortKey, sortOrder]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("desc");
    }
  };

  const SortableHeader = ({
    columnKey,
    children,
  }: {
    columnKey: SortKey;
    children: React.ReactNode;
  }) => (
    <TableHead onClick={() => handleSort(columnKey)}>
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
  
  const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
      });
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHeader columnKey="date">Date</SortableHeader>
            <SortableHeader columnKey="type">Type</SortableHeader>
            <SortableHeader columnKey="amount">Amount</SortableHeader>
            <SortableHeader columnKey="mode">Mode</SortableHeader>
            <TableHead>Notes</TableHead>
            <TableHead className="text-right w-[60px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTransactions.length > 0 ? sortedTransactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>{formatDate(transaction.date)}</TableCell>
              <TableCell>
                <Badge
                  variant={transaction.type === "CREDIT" ? "secondary" : "outline"}
                  className={`${
                    transaction.type === "CREDIT"
                      ? "bg-green-400/10 text-green-400 border-green-400/20"
                      : "bg-orange-400/10 text-orange-400 border-orange-400/20"
                  }`}
                >
                  {transaction.type}
                </Badge>
              </TableCell>
              <TableCell
                className={`font-medium ${
                  transaction.type === "CREDIT"
                    ? "text-green-400"
                    : "text-orange-400"
                }`}
              >
                {formatCurrency(transaction.amount)}
              </TableCell>
              <TableCell>{transaction.mode}</TableCell>
              <TableCell className="max-w-[200px] truncate">
                {transaction.notes}
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
                    <EditTransactionSheet customerId={customerId} transaction={transaction}>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                    </EditTransactionSheet>
                    <DeleteTransactionDialog customerId={customerId} transactionId={transaction.id}>
                       <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DeleteTransactionDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          )) : (
             <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                    No transactions found.
                </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
