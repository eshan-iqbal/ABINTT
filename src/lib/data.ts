import { MongoClient, ObjectId } from 'mongodb';
import type { Customer, CustomerSummary, CustomerWithSummary, Transaction } from './types';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'tjid'; // Using 'tjid' as the database name as requested

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!process.env.MONGODB_URI) {
  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    let globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>
    }
    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(MONGODB_URI);
      globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise;
  } else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(MONGODB_URI);
    clientPromise = client.connect();
  }
} else {
    client = new MongoClient(MONGODB_URI);
    clientPromise = client.connect();
}


const getDb = async () => {
  const client = await clientPromise;
  return client.db(DB_NAME);
};


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

const mapMongoId = (doc: any) => {
    const { _id, ...rest } = doc;
    return { id: _id.toHexString(), ...rest };
}

export const getCustomers = async (): Promise<CustomerSummary[]> => {
    const db = await getDb();
    const customersCollection = db.collection<Customer>('customers');
    const customers = await customersCollection.find({}).toArray();
    
    return customers.map(customer => {
        const { totalDue, totalPaid, balance } = calculateSummary(customer.transactions || []);
        const { transactions, ...customerWithoutTransactions } = customer;
        const mappedCustomer = mapMongoId(customerWithoutTransactions);
        
        return {
            ...mappedCustomer,
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


export const getCustomerById = async (id: string): Promise<CustomerWithSummary | null> => {
    if (!ObjectId.isValid(id)) {
        return null;
    }
    const db = await getDb();
    const customersCollection = db.collection<Customer>('customers');
    const customer = await customersCollection.findOne({ _id: new ObjectId(id) });
    
    if (!customer) return null;

    const { totalDue, totalPaid, balance } = calculateSummary(customer.transactions || []);
    const mappedCustomer = mapMongoId(customer);

    return {
        ...mappedCustomer,
        transactions: (customer.transactions || []).map(t => ({...t, id: new ObjectId().toHexString()})), // add temp id for keys
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
