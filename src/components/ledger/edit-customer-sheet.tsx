
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { updateCustomer } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { useState, useTransition } from "react";
import { customerSchema } from "@/lib/schemas";
import type { CustomerWithSummary, CustomerSummary } from "@/lib/types";
import { Edit } from "lucide-react";

export function EditCustomerSheet({ customer, children }: { customer: CustomerWithSummary | CustomerSummary, children?: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    
    const phoneWithoutPrefix = customer.phone.startsWith('+91') ? customer.phone.slice(3) : customer.phone;

    const form = useForm<z.infer<typeof customerSchema>>({
        resolver: zodResolver(customerSchema),
        defaultValues: {
            name: customer.name,
            phone: phoneWithoutPrefix,
            address: customer.address,
            billNumber: (customer as any).billNumber || "",
            amountPaid: (customer as any).amountPaid || 0,
            amountDue: (customer as any).amountDue || 0,
        },
    });

    React.useEffect(() => {
        if (open) {
            const phoneToSet = customer.phone.startsWith('+91') ? customer.phone.slice(3) : customer.phone;
            form.reset({
                name: customer.name,
                phone: phoneToSet,
                address: customer.address,
                billNumber: (customer as any).billNumber || "",
                amountPaid: (customer as any).amountPaid || 0,
                amountDue: (customer as any).amountDue || 0,
            });
        }
    }, [open, customer, form]);

    function onSubmit(values: z.infer<typeof customerSchema>) {
        startTransition(async () => {
            const dataToSubmit = {
                ...values,
                phone: `+91${values.phone}`
            };

            const result = await updateCustomer(customer.id, dataToSubmit);
            if (result?.errors) {
                 toast({
                    title: "Error updating customer",
                    description: "Please check the form for errors.",
                    variant: "destructive"
                });
            } else {
                toast({
                    title: "Success",
                    description: "Customer has been updated successfully.",
                });
                setOpen(false);
            }
        });
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                {children || (
                    <Button variant="outline">
                        <Edit className="mr-2 h-4 w-4" /> Edit Customer
                    </Button>
                )}
            </SheetTrigger>
            <SheetContent className="overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Edit Customer</SheetTitle>
                    <SheetDescription>
                        Update the details for {customer.name}.
                    </SheetDescription>
                </SheetHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone Number</FormLabel>
                                     <div className="flex items-center">
                                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-background text-sm text-muted-foreground">
                                            +91
                                        </span>
                                        <FormControl>
                                            <Input 
                                                type="tel" 
                                                placeholder="9876543210" 
                                                className="rounded-l-none" 
                                                {...field} 
                                            />
                                        </FormControl>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address</FormLabel>
                                    <FormControl>
                                        <Input placeholder="123 Main St, Anytown" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="billNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Bill Number</FormLabel>
                                    <FormControl>
                                        <Input placeholder="BILL001" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="amountPaid"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Amount Paid</FormLabel>
                                        <FormControl>
                                            <Input 
                                                type="number" 
                                                placeholder="0" 
                                                {...field}
                                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="amountDue"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Amount Due</FormLabel>
                                        <FormControl>
                                            <Input 
                                                type="number" 
                                                placeholder="0" 
                                                {...field}
                                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <SheetFooter className="mt-8 pt-8 sticky bottom-0 bg-background py-4">
                            <SheetClose asChild>
                                <Button type="button" variant="ghost">Cancel</Button>
                            </SheetClose>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? "Saving..." : "Save Changes"}
                            </Button>
                        </SheetFooter>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    );
}
