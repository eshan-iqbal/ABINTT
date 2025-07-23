"use client";

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
import { addCustomer } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { useState, useTransition } from "react";
import { addCustomerSchema } from "@/lib/schemas";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { cn } from "@/lib/utils";

export function AddCustomerSheet({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const form = useForm<z.infer<typeof addCustomerSchema>>({
        resolver: zodResolver(addCustomerSchema),
        defaultValues: {
            name: "",
            phone: "",
            address: "",
            initialTransaction: {
                billNumber: "",
                amount: 0,
                mode: "OTHER",
                notes: "",
            }
        },
    });

    function onSubmit(values: z.infer<typeof addCustomerSchema>) {
        startTransition(async () => {
            const result = await addCustomer(values);
            if (result?.errors) {
                 toast({
                    title: "Error submitting form",
                    description: "Please check the form for errors.",
                    variant: "destructive"
                });
            } else {
                toast({
                    title: "Success",
                    description: "Customer has been added successfully.",
                });
                form.reset();
                setOpen(false);
                window.location.reload(); // Force refresh to update customer list
            }
        });
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent className="overflow-y-auto max-w-md mx-auto">
                <SheetHeader className="text-center">
                    <SheetTitle>Add a New Customer</SheetTitle>
                    <SheetDescription>
                        Fill in the details below to add a new customer to your ledger.
                    </SheetDescription>
                </SheetHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6 mx-auto max-w-sm">
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

                        <Separator />
                        
                        <div>
                            <h4 className="text-sm font-medium">Initial Bill (Optional)</h4>
                            <p className="text-sm text-muted-foreground">
                                Add an initial bill or opening balance for this customer. This will be a debit entry.
                            </p>
                        </div>
                        
                        <FormField
                            control={form.control}
                            name="initialTransaction.billNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Bill Number</FormLabel>
                                    <FormControl>
                                        <Input placeholder="INV-001" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        <FormField
                            control={form.control}
                            name="initialTransaction.amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Amount</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="0.00" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        <FormField
                            control={form.control}
                            name="initialTransaction.notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Initial bill, opening balance, etc." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />


                        <SheetFooter className="mt-8 pt-8 sticky bottom-0 bg-background py-4 flex justify-center gap-4">
                            <SheetClose asChild>
                                <Button type="button" variant="ghost">Cancel</Button>
                            </SheetClose>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? "Adding..." : "Add Customer"}
                            </Button>
                        </SheetFooter>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    );
}
