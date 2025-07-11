"use server";

import { summarizeTransactions } from "@/ai/flows/summarize-transactions";
import { getCustomers as getCustomersData, getCustomerById as getCustomerData, formatTransactionsForAI } from "@/lib/data";
import type { SummarizeTransactionsInput } from '@/ai/flows/summarize-transactions';

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
