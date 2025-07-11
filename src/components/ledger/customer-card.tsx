import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { CustomerSummary } from "@/lib/types";
import { ArrowRight, Mail, Phone, MapPin } from "lucide-react";

export function CustomerCard({ customer }: { customer: CustomerSummary }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD", // Or use a relevant currency
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const balanceColor = customer.balance > 0 ? "text-destructive" : "text-green-400";

  return (
    <Card className="flex flex-col h-full transition-all duration-300 hover:shadow-lg hover:border-primary/50">
      <CardHeader>
        <CardTitle className="font-headline">{customer.name}</CardTitle>
        <CardDescription className="flex items-center gap-2 pt-1">
          <Mail className="h-4 w-4" /> {customer.email}
        </CardDescription>
        <CardDescription className="flex items-center gap-2">
          <Phone className="h-4 w-4" /> {customer.phone}
        </CardDescription>
         <CardDescription className="flex items-center gap-2">
          <MapPin className="h-4 w-4" /> {customer.address}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <Separator />
        <div className="grid grid-cols-3 gap-4 text-center py-4">
          <div>
            <p className="text-sm text-muted-foreground">Paid</p>
            <p className="font-semibold text-green-400">{formatCurrency(customer.totalPaid)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Due</p>
            <p className="font-semibold text-orange-400">{formatCurrency(customer.totalDue)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Balance</p>
            <p className={`font-semibold ${balanceColor}`}>{formatCurrency(customer.balance)}</p>
          </div>
        </div>
        <Separator />
      </CardContent>
      <CardFooter>
        <Link href={`/customers/${customer.id}`} className="flex items-center text-sm text-primary hover:underline w-full">
          View Details
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </CardFooter>
    </Card>
  );
}
