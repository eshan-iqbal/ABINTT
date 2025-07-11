import { z } from "zod";

const customerCoreSchema = {
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Please enter a valid email." }),
    phone: z.string().min(10, { message: "Phone number must be at least 10 digits." }),
    address: z.string().min(5, { message: "Address must be at least 5 characters." }),
}

export const customerSchema = z.object(customerCoreSchema);

export const addCustomerSchema = z.object({
    ...customerCoreSchema,
    initialTransaction: z.object({
        amount: z.number().min(0).optional(),
        mode: z.enum(["CASH", "UPI", "CARD", "OTHER"]).default("OTHER"),
        notes: z.string().optional(),
    }).optional(),
});


export const paymentSchema = z.object({
    customerId: z.string(),
    amount: z.number().positive({ message: "Amount must be greater than 0." }),
    type: z.enum(["CREDIT", "DEBIT"]),
    mode: z.enum(["CASH", "UPI", "CARD", "OTHER"]),
    notes: z.string().optional(),
    date: z.date(),
});
