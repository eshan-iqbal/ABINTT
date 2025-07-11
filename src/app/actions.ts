
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { summarizeTransactions } from "@/ai/flows/summarize-transactions";
import { getCustomers as getCustomersData, getCustomerById as getCustomerData, formatTransactionsForAI, addCustomer as addCustomerData, addPayment as addPaymentData, deleteCustomer as deleteCustomerData, updateCustomer as updateCustomerData, updateTransaction as updateTransactionData, deleteTransaction as deleteTransactionData } from "@/lib/data";
import type { SummarizeTransactionsInput } from '@/ai/flows/summarize-transactions';
import { addCustomerSchema, paymentSchema, customerSchema } from "@/lib/schemas";
import type { Transaction } from "@/lib/types";

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

export const addCustomer = async (data: z.infer<typeof addCustomerSchema>) => {
    const validatedFields = addCustomerSchema.safeParse(data);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    const processedData = {
        ...validatedFields.data,
        phone: `+91${validatedFields.data.phone}`,
    }

    try {
        await addCustomerData(processedData);
        revalidatePath('/customers');
        return { success: true };
    } catch (e) {
        console.error(e);
        return {
            errors: { _form: ["An unexpected error occurred."] },
        };
    }
};

export const addPayment = async (data: z.infer<typeof paymentSchema>) => {
    const validatedFields = paymentSchema.safeParse(data);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    try {
        await addPaymentData(validatedFields.data);
        revalidatePath(`/customers/${data.customerId}`);
        revalidatePath('/customers');
        return { success: true };
    } catch (e) {
        console.error(e);
        return {
             errors: { _form: ["An unexpected error occurred."] },
        }
    }
}


export const deleteCustomer = async (customerId: string) => {
    try {
        await deleteCustomerData(customerId);
        revalidatePath('/customers');
        return { success: true };
    } catch (e) {
        console.error(e);
        return {
             errors: { _form: ["An unexpected error occurred."] },
        }
    }
}

export const updateCustomer = async (customerId: string, data: z.infer<typeof customerSchema>) => {
    const validatedFields = customerSchema.safeParse(data);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    try {
        await updateCustomerData(customerId, validatedFields.data);
        revalidatePath(`/customers/${customerId}`);
        revalidatePath('/customers');
        return { success: true };
    } catch (e) {
        console.error(e);
        return {
            errors: { _form: ["An unexpected error occurred."] },
        };
    }
};

export const updateTransaction = async (customerId: string, transactionId: string, data: z.infer<typeof paymentSchema>) => {
    const validatedFields = paymentSchema.safeParse(data);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    try {
        await updateTransactionData(customerId, transactionId, validatedFields.data);
        revalidatePath(`/customers/${customerId}`);
        revalidatePath('/customers');
        return { success: true };
    } catch (e) {
        console.error(e);
        return {
            errors: { _form: ["An unexpected error occurred."] },
        };
    }
};

export const deleteTransaction = async (customerId: string, transactionId: string) => {
    try {
        await deleteTransactionData(customerId, transactionId);
        revalidatePath(`/customers/${customerId}`);
        revalidatePath('/customers');
        return { success: true };
    } catch (e) {
        console.error(e);
        return {
            errors: { _form: ["An unexpected error occurred."] },
        };
    }
};
