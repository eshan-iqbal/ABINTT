
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { summarizeTransactions } from "@/ai/flows/summarize-transactions";
import { getCustomers as getCustomersData, getCustomerById as getCustomerData, formatTransactionsForAI, addCustomer as addCustomerData, addPayment as addPaymentData, deleteCustomer as deleteCustomerData, updateCustomer as updateCustomerData, updateTransaction as updateTransactionData, deleteTransaction as deleteTransactionData, getLabours as getLaboursData, addLabour as addLabourData, addLabourPayment as addLabourPaymentData, deleteLabourPayment as deleteLabourPaymentData, deleteLabour as deleteLabourData } from "@/lib/data";
import type { SummarizeTransactionsInput } from '@/ai/flows/summarize-transactions';
import { addCustomerSchema, paymentSchema, customerSchema, labourSchema, labourPaymentSchema } from "@/lib/schemas";
import type { Transaction } from "@/lib/types";

export const getCustomers = async () => {
    const customers = await getCustomersData();
    // Return null on db connection error to be handled by the UI
    if (customers === null) return null;
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
    // Re-validate against a schema that expects the full phone number
    const updateSchema = customerSchema.extend({ phone: z.string() });
    const validatedFields = updateSchema.safeParse(data);

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

export const getLabours = async () => {
  const labours = await getLaboursData();
  return JSON.parse(JSON.stringify(labours));
};

export const addLabour = async (data: z.infer<typeof labourSchema>) => {
  const validatedFields = labourSchema.safeParse(data);
  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }
  try {
    await addLabourData(validatedFields.data);
    revalidatePath('/labour');
    return { success: true };
  } catch (e) {
    console.error(e);
    return { errors: { _form: ['An unexpected error occurred.'] } };
  }
};

export const addLabourPayment = async (labourId: string, data: z.infer<typeof labourPaymentSchema>) => {
  const validatedFields = labourPaymentSchema.safeParse(data);
  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }
  try {
    await addLabourPaymentData(labourId, validatedFields.data);
    revalidatePath('/labour');
    return { success: true };
  } catch (e) {
    console.error(e);
    return { errors: { _form: ['An unexpected error occurred.'] } };
  }
};

export const deleteLabourPayment = async (labourId: string, paymentId: string) => {
  try {
    await deleteLabourPaymentData(labourId, paymentId);
    revalidatePath('/labour');
    return { success: true };
  } catch (e) {
    console.error(e);
    return { errors: { _form: ['An unexpected error occurred.'] } };
  }
};

export const deleteLabour = async (labourId: string) => {
  try {
    await deleteLabourData(labourId);
    revalidatePath('/labour');
    return { success: true };
  } catch (e) {
    console.error(e);
    return { errors: { _form: ['An unexpected error occurred.'] } };
  }
};
