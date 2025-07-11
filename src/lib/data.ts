import type { Customer, CustomerSummary, CustomerWithSummary, Transaction } from './types';

const customers: Customer[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice.j@example.com',
    phone: '123-456-7890',
    address: '123 Maple Street, Anytown',
    transactions: [
      { id: 't1', customerId: '1', date: '2024-07-01', amount: 5000, type: 'DEBIT', mode: 'OTHER', notes: 'Initial consultation fee' },
      { id: 't2', customerId: '1', date: '2024-07-05', amount: 2000, type: 'CREDIT', mode: 'UPI', notes: 'Partial payment' },
      { id: 't3', customerId: '1', date: '2024-07-15', amount: 1500, type: 'CREDIT', mode: 'CASH', notes: 'Final settlement' },
    ],
  },
  {
    id: '2',
    name: 'Bob Williams',
    email: 'bob.w@example.com',
    phone: '234-567-8901',
    address: '456 Oak Avenue, Somecity',
    transactions: [
      { id: 't4', customerId: '2', date: '2024-06-20', amount: 10000, type: 'DEBIT', mode: 'OTHER', notes: 'Project X deposit' },
      { id: 't5', customerId: '2', date: '2024-07-10', amount: 5000, type: 'CREDIT', mode: 'CARD', notes: 'Milestone 1 payment' },
      { id: 't6', customerId: '2', date: '2024-07-25', amount: 5000, type: 'DEBIT', mode: 'OTHER', notes: 'Additional materials' },
    ],
  },
  {
    id: '3',
    name: 'Charlie Brown',
    email: 'charlie.b@example.com',
    phone: '345-678-9012',
    address: '789 Pine Lane, Yourtown',
    transactions: [
      { id: 't7', customerId: '3', date: '2024-07-22', amount: 750, type: 'DEBIT', mode: 'OTHER', notes: 'Service charge' },
      { id: 't8', customerId: '3', date: '2024-07-22', amount: 750, type: 'CREDIT', mode: 'UPI', notes: 'Paid in full' },
    ],
  },
  {
    id: '4',
    name: 'Diana Miller',
    email: 'diana.m@example.com',
    phone: '456-789-0123',
    address: '101 Birch Road, Heretown',
    transactions: [
      { id: 't9', customerId: '4', date: '2024-05-10', amount: 1200, type: 'DEBIT', mode: 'OTHER', notes: 'Product A' },
      { id: 't10', customerId: '4', date: '2024-06-15', amount: 800, type: 'DEBIT', mode: 'OTHER', notes: 'Product B' },
    ],
  },
];

const calculateSummary = (transactions: Transaction[]) => {
  const totalDue = transactions
    .filter(t => t.type === 'DEBIT')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalPaid = transactions
    .filter(t => t.type === 'CREDIT')
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalDue - totalPaid;
  return { totalDue, totalPaid, balance };
};

export const getCustomers = (): CustomerSummary[] => {
  return customers.map(customer => {
    const { totalDue, totalPaid, balance } = calculateSummary(customer.transactions);
    return {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      totalDue,
      totalPaid,
      balance,
    };
  });
};

export const getCustomerById = (id: string): CustomerWithSummary | undefined => {
  const customer = customers.find(c => c.id === id);
  if (!customer) return undefined;

  const { totalDue, totalPaid, balance } = calculateSummary(customer.transactions);
  return {
    ...customer,
    totalDue,
    totalPaid,
    balance,
  };
};

export const formatTransactionsForAI = (transactions: Transaction[]): string => {
  return transactions
    .map(t => 
      `On ${t.date}, an amount of ${t.amount} was ${t.type === 'CREDIT' ? 'paid' : 'billed'} via ${t.mode}. Notes: ${t.notes || 'N/A'}`
    )
    .join('\n');
};
