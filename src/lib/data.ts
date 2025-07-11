import { MongoClient, ObjectId } from 'mongodb';
import type { Customer, CustomerSummary, CustomerWithSummary, Transaction } from './types';

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'tjid'; 

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

let cachedClient: MongoClient | null = null;
let cachedDb: any = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }
  
  try {
    const client = await MongoClient.connect(MONGODB_URI);

    const db = client.db(DB_NAME);

    cachedClient = client;
    cachedDb = db;

    return { client, db };
  } catch(error) {
    console.error("Failed to connect to MongoDB. Please ensure your MongoDB server is running and accessible.", error);
    throw new Error("Could not connect to database.");
  }
}

const getDb = async () => {
  const { db } = await connectToDatabase();
  return db;
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
    try {
        const db = await getDb();
        const customersCollection = db.collection<Customer>('customers');
        const customers = await customersCollection.find({}).toArray();
        
        return customers.map((customer: any) => {
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
    } catch (error) {
        console.error("Error fetching customers: ", error);
        return [];
    }
};


export const getCustomerById = async (id: string): Promise<CustomerWithSummary | null> => {
    try {
        if (!ObjectId.isValid(id)) {
            return null;
        }
        const db = await getDb();
        const customersCollection = db.collection('customers');
        const customer = await customersCollection.findOne({ _id: new ObjectId(id) });
        
        if (!customer) return null;

        const { totalDue, totalPaid, balance } = calculateSummary(customer.transactions || []);
        const mappedCustomer = mapMongoId(customer);

        return {
            ...mappedCustomer,
            transactions: (customer.transactions || []).map((t: any) => ({...t, id: new ObjectId().toHexString()})), // add temp id for keys
            totalDue,
            totalPaid,
            balance,
        };
    } catch(error) {
        console.error(`Error fetching customer by id ${id}: `, error);
        return null;
    }
};

export const formatTransactionsForAI = (transactions: Transaction[]): string => {
  return transactions
    .map(t => 
      `On ${t.date}, an amount of ${t.amount} was ${t.type === 'CREDIT' ? 'paid' : 'billed'} via ${t.mode}. Notes: ${t.notes || 'N/A'}`
    )
    .join('\n');
};
