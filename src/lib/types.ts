export type Transaction = {
  id: string;
  customerId: string;
  date: string;
  amount: number;
  type: 'DEBIT' | 'CREDIT';
  mode: 'CASH' | 'UPI' | 'CARD' | 'OTHER';
  notes: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  transactions: Transaction[];
};

export type CustomerSummary = Omit<Customer, 'transactions'> & {
  totalDue: number;
  totalPaid: number;
  balance: number;
};

export type CustomerWithSummary = Customer & {
  totalDue: number;
  totalPaid: number;
  balance: number;
};
