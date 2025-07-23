export type Transaction = {
  id: string; // This will be the MongoDB ObjectId as a string
  customerId: string;
  date: string;
  amount: number;
  type: 'DEBIT' | 'CREDIT';
  mode: 'CASH' | 'UPI' | 'CARD' | 'OTHER';
  billNumber?: string;
  notes: string;
};

export type Customer = {
  id: string; // This will be the MongoDB ObjectId as a string
  name: string;
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

export interface LabourPayment {
  id: string;
  date: string;
  amount: number;
}

export interface Labour {
  id: string;
  name: string;
  phone: string;
  payments: LabourPayment[];
}
