
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
    ArrowUp,
  ArrowUpDown,
  DatabaseZap,
  Edit,
  FileText,
  MessageCircle,
  MoreVertical,
  PlusCircle,
  Search,
  Trash2,
  View,
} from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { EditCustomerSheet } from "./edit-customer-sheet";
import { DeleteCustomerDialog } from "./delete-customer-dialog";
import { PageHeader } from "../page-header";
import { AddCustomerSheet } from "./add-customer-sheet";
import { Input } from "../ui/input";

type SortKey = keyof CustomerSummary | 'balance';

export function CustomerTable({
  customers,
}: {
  customers: CustomerSummary[] | null;
}) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortKey, setSortKey] = React.useState<SortKey>("name");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("asc");
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const filteredCustomers = React.useMemo(() => {
    if (!customers) return [];
    return customers.filter(customer => 
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery)
    );
  }, [customers, searchQuery]);

  const sortedCustomers = React.useMemo(() => {
    return [...filteredCustomers].sort((a, b) => {
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
  }, [filteredCustomers, sortKey, sortOrder]);

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
  
  if (!isClient) {
    return null; 
  }

  // A bit of a hack to detect if the db is offline. If getCustomers returns empty, we show a message.
  // This is not perfect, as an empty customer list is a valid state.
  // A more robust solution would involve a dedicated health check endpoint.
  if (customers === null) {
     return (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center border-2 border-dashed rounded-lg m-8">
            <DatabaseZap className="h-12 w-12 text-destructive" />
            <h2 className="text-2xl font-semibold mt-4">Database Connection Error</h2>
            <p className="text-muted-foreground mt-2 max-w-md">
                The application could not connect to the database. Please make sure your MongoDB server is running and accessible.
            </p>
        </div>
     )
  }
  
  return (
    <div className="flex flex-col h-full">
        <PageHeader
            title="Customers"
            description="An overview of all your customers and their balances."
        >
            <div className="flex items-center gap-4">
                 <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search by name or phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64"
                    />
                </div>
                <AddCustomerSheet>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Customer
                </Button>
                </AddCustomerSheet>
            </div>
        </PageHeader>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
            <div className="max-w-5xl mx-auto">
            {customers.length > 0 ? (
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <SortableHeader columnKey="name">Name</SortableHeader>
                            <SortableHeader columnKey="phone">Phone</SortableHeader>
                            <TableHead>Address</TableHead>
                            <TableHead>Reg Date</TableHead>
                            <SortableHeader columnKey="balance" className="text-right">Balance</SortableHeader>
                            <TableHead className="text-right w-[150px]">Actions</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {sortedCustomers.length > 0 ? sortedCustomers.map((customer) => {
                            const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
                            const statementUrl = `${appUrl}/customers/${customer.id}/statement`;
                            const whatsAppMessage = encodeURIComponent(`Hi ${customer.name}, this is a reminder from AB INTERIOR. Your current balance is ${formatCurrency(customer.balance)}. For details, view your statement: ${statementUrl}. If you have any questions, feel free to contact us!`);
                            const whatsappUrl = `https://wa.me/${customer.phone}?text=${whatsAppMessage}`;
                            
                            return (
                            <TableRow key={customer.id}>
                                <TableCell className="font-medium">{customer.name}</TableCell>
                                <TableCell>{customer.phone}</TableCell>
                                <TableCell>{customer.address}</TableCell>
                                <TableCell>-</TableCell>
                                <TableCell className={`text-right font-medium text-blue-500`}>
                                    {formatCurrency(customer.balance)}
                                </TableCell>
                                <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                <Link href={`/customers/${customer.id}`}>
                                    <Button variant="outline" size="sm">
                                        <View className="mr-2 h-4 w-4" /> View
                                    </Button>
                                </Link>
                                <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                    <span className="sr-only">More actions</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                      <Link href={`/customers/${customer.id}/statement`} target="_blank">
                                          <FileText className="mr-2 h-4 w-4" /> View Statement
                                      </Link>
                                    </DropdownMenuItem>
                                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="block">
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                            <MessageCircle className="mr-2 h-4 w-4" /> Send Reminder
                                        </DropdownMenuItem>
                                    </a>
                                    <DropdownMenuSeparator />
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
                                </div>
                                </TableCell>
                            </TableRow>
                        )}) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    No results found for &quot;{searchQuery}&quot;.
                                </TableCell>
                            </TableRow>
                        )}
                        </TableBody>
                    </Table>
                </div>
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
