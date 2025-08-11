import { z } from "zod";

const customerCoreSchema = {
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    phone: z.string().min(10, { message: "Phone number must be at least 10 digits." }),
    address: z.string().min(5, { message: "Address must be at least 5 characters." }),
    billNumber: z.string().optional(),
    amountPaid: z.number().min(0, { message: "Amount paid must be 0 or greater." }),
    amountDue: z.number().min(0, { message: "Amount due must be 0 or greater." }),
}

export const customerSchema = z.object(customerCoreSchema);

export const addCustomerSchema = z.object(customerCoreSchema);


export const paymentSchema = z.object({
    customerId: z.string(),
    amount: z.number().positive({ message: "Amount must be greater than 0." }),
    type: z.enum(["CREDIT", "DEBIT"]),
    mode: z.enum(["CASH", "UPI", "CARD", "OTHER"]),
    billNumber: z.string().optional(),
    notes: z.string().optional(),
    date: z.date(),
});

export const labourSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  phone: z.string().min(10, { message: 'Phone number must be at least 10 digits.' }),
});

export const labourPaymentSchema = z.object({
  date: z.string(),
  amount: z.number().min(1, { message: 'Amount must be at least 1.' }),
});
