"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { summarizeTransactions } from "@/ai/flows/summarize-transactions";
import { getCustomers as getCustomersData, getCustomerById as getCustomerData, formatTransactionsForAI, addCustomer as addCustomerData } from "@/lib/data";
import type { SummarizeTransactionsInput } from '@/ai/flows/summarize-transactions';
import { customerSchema } from "@/lib/schemas";

export const getCustomers = async () => {
    const customers = await getCustomersData();
    return JSON.parse(JSON.stringify(customers));
}

export const getCustomerById = async (id: string) => {
    const customer =  await getCustomerData(id);
    return customer ? JSON.parse(JSON.stringify(customer)) : null;
}

export const generateSummary = async (customerId: string, summaryType: SummarizeTransactionsInput['summaryType']) => {
    const customer = await getCustomerData(customerId);

    if (!customer) {
        throw new Error("Customer not found");
    }

    const transactionHistory = formatTransactionsForAI(customer.transactions);
    
    try {
        const result = await summarizeTransactions({
            transactionHistory,
            summaryType
        });
        return result.summary;
    } catch(e) {
        console.error(e);
        return "Sorry, I couldn't generate a summary at this time.";
    }
}

export const addCustomer = async (data: z.infer<typeof customerSchema>) => {
    const validatedFields = customerSchema.safeParse(data);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    try {
        await addCustomerData(validatedFields.data);
        revalidatePath('/customers');
        return { success: true };
    } catch (e) {
        console.error(e);
        return {
            errors: { _form: ["An unexpected error occurred."] },
        };
    }
};
