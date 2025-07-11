'use server';

/**
 * @fileOverview Summarizes customer transactions using Genkit.
 *
 * - summarizeTransactions - A function that summarizes customer transaction history.
 * - SummarizeTransactionsInput - The input type for the summarizeTransactions function.
 * - SummarizeTransactionsOutput - The return type for the summarizeTransactions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeTransactionsInputSchema = z.object({
  transactionHistory: z.string().describe('A list of transactions for a customer.'),
  summaryType: z
    .enum(['latest', 'all', 'balance'])
    .describe(
      'The type of summary to generate: latest (recent transactions), all (all transactions), or balance (balance amounts).'
    ),
});

export type SummarizeTransactionsInput = z.infer<typeof SummarizeTransactionsInputSchema>;

const SummarizeTransactionsOutputSchema = z.object({
  summary: z.string().describe('A summary of the customer transactions.'),
});

export type SummarizeTransactionsOutput = z.infer<typeof SummarizeTransactionsOutputSchema>;

export async function summarizeTransactions(input: SummarizeTransactionsInput): Promise<SummarizeTransactionsOutput> {
  return summarizeTransactionsFlow(input);
}

const summarizeTransactionsPrompt = ai.definePrompt({
  name: 'summarizeTransactionsPrompt',
  input: {schema: SummarizeTransactionsInputSchema},
  output: {schema: SummarizeTransactionsOutputSchema},
  prompt: `You are a financial assistant specializing in summarizing customer payment activity.

You will receive a transaction history and a summary type. Based on the summary type, you will generate a summary of the transaction history.

Transaction History: {{{transactionHistory}}}
Summary Type: {{{summaryType}}}

Summary:`,
});

const summarizeTransactionsFlow = ai.defineFlow(
  {
    name: 'summarizeTransactionsFlow',
    inputSchema: SummarizeTransactionsInputSchema,
    outputSchema: SummarizeTransactionsOutputSchema,
  },
  async input => {
    const {output} = await summarizeTransactionsPrompt(input);
    return output!;
  }
);
