import { MongoClient, ObjectId } from 'mongodb';
import type { Customer, CustomerSummary, CustomerWithSummary, Transaction } from './types';
import { z } from 'zod';
import { addCustomerSchema, customerSchema, paymentSchema } from './schemas';


const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
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
    const client = new MongoClient(MONGODB_URI, {
        serverSelectionTimeoutMS: 5000 // Shorten timeout for quicker failure
    });
    await client.connect();
    const db = client.db(DB_NAME);

    cachedClient = client;
    cachedDb = db;

    return { client, db };
  } catch(error: any) {
    if (error.name === 'MongoServerSelectionError') {
        console.error("MongoDB connection error: Could not connect to the server. Make sure MongoDB is running.", error);
        // Do not throw, allow getDb to return null
        return { client: null, db: null };
    }
    console.error("An unexpected database error occurred.", error);
    throw new Error("An unexpected database error occurred.");
  }
}

const getDb = async () => {
    try {
        const { db } = await connectToDatabase();
        return db;
    } catch(e) {
        console.error("Failed to connect to database in getDb()", e);
        return null;
    }
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

export const getCustomers = async (): Promise<CustomerSummary[] | null> => {
    try {
        const db = await getDb();
        if (!db) {
            console.log("Database not connected, returning null for customer list.");
            return null; // Return null to indicate connection failure
        }
        const customersCollection = db.collection<Customer>('customers');
        const customers = await customersCollection.find({}).sort({ name: 1 }).toArray();
        
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
        console.error("Failed to fetch customers:", error);
        // Don't re-throw, return null to prevent crash
        return null;
    }
};


export const getCustomerById = async (id: string): Promise<CustomerWithSummary | null> => {
    try {
        if (!ObjectId.isValid(id)) {
            return null;
        }
        const db = await getDb();
        if (!db) {
            console.log(`Database not connected, cannot get customer by id ${id}.`);
            return null;
        }
        const customersCollection = db.collection('customers');
        const customer = await customersCollection.findOne({ _id: new ObjectId(id) });
        
        if (!customer) return null;

        const { totalDue, totalPaid, balance } = calculateSummary(customer.transactions || []);
        const mappedCustomer = mapMongoId(customer);

        return {
            ...mappedCustomer,
            transactions: (customer.transactions || []).map((t: any) => ({...t, id: t.id ? t.id.toString() : new ObjectId().toHexString()})), 
            totalDue,
            totalPaid,
            balance,
        };
    } catch(error) {
        console.error(`Error fetching customer by id ${id}: `, error);
        return null;
    }
};

export const addCustomer = async (data: z.infer<typeof addCustomerSchema>) => {
    const db = await getDb();
    if(!db) throw new Error("Database not connected.");
    const customersCollection = db.collection('customers');
    
    const transactions = [];
    if (data.initialTransaction && data.initialTransaction.amount > 0) {
        transactions.push({
            id: new ObjectId().toHexString(),
            date: new Date().toISOString(),
            amount: data.initialTransaction.amount,
            type: 'DEBIT',
            mode: data.initialTransaction.mode,
            notes: data.initialTransaction.notes || "Initial bill",
        });
    }

    const customerData = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        transactions: transactions,
        createdAt: new Date(),
    };
    await customersCollection.insertOne(customerData);
};

export const addPayment = async (data: z.infer<typeof paymentSchema>) => {
    if (!ObjectId.isValid(data.customerId)) {
        throw new Error("Invalid customer ID");
    }
    const db = await getDb();
    if(!db) throw new Error("Database not connected.");
    const customersCollection = db.collection('customers');

    const paymentData = {
        id: new ObjectId().toHexString(),
        date: data.date.toISOString(),
        amount: data.amount,
        type: data.type,
        mode: data.mode,
        notes: data.notes,
    };

    await customersCollection.updateOne(
        { _id: new ObjectId(data.customerId) },
        { $push: { transactions: paymentData } }
    );
};

export const deleteCustomer = async (customerId: string) => {
    if (!ObjectId.isValid(customerId)) {
        throw new Error("Invalid customer ID");
    }
    const db = await getDb();
    if(!db) throw new Error("Database not connected.");
    const customersCollection = db.collection('customers');

    const result = await customersCollection.deleteOne({ _id: new ObjectId(customerId) });
    if (result.deletedCount === 0) {
        throw new Error("Customer not found");
    }
};

export const updateCustomer = async (customerId: string, data: z.infer<typeof customerSchema>) => {
    if (!ObjectId.isValid(customerId)) {
        throw new Error("Invalid customer ID");
    }
    const db = await getDb();
    if(!db) throw new Error("Database not connected.");
    const customersCollection = db.collection('customers');

    await customersCollection.updateOne(
        { _id: new ObjectId(customerId) },
        { $set: {
            name: data.name,
            email: data.email,
            phone: data.phone,
            address: data.address,
        } }
    );
};

export const updateTransaction = async (customerId: string, transactionId: string, data: z.infer<typeof paymentSchema>) => {
    if (!ObjectId.isValid(customerId)) {
        throw new Error("Invalid ID");
    }
    const db = await getDb();
    if(!db) throw new Error("Database not connected.");
    const customersCollection = db.collection('customers');

    await customersCollection.updateOne(
        { _id: new ObjectId(customerId), "transactions.id": transactionId },
        {
            $set: {
                "transactions.$.date": data.date.toISOString(),
                "transactions.$.amount": data.amount,
                "transactions.$.type": data.type,
                "transactions.$.mode": data.mode,
                "transactions.$.notes": data.notes,
            }
        }
    );
}

export const deleteTransaction = async (customerId: string, transactionId: string) => {
    if (!ObjectId.isValid(customerId)) {
        throw new Error("Invalid ID");
    }
    const db = await getDb();
    if(!db) throw new Error("Database not connected.");
    const customersCollection = db.collection('customers');

    await customersCollection.updateOne(
        { _id: new ObjectId(customerId) },
        { $pull: { transactions: { id: transactionId } } }
    );
}


export const formatTransactionsForAI = (transactions: Transaction[]): string => {
  return transactions
    .map(t => 
      `On ${new Date(t.date).toLocaleDateString()}, an amount of ${t.amount} was ${t.type === 'CREDIT' ? 'paid' : 'billed'} via ${t.mode}. Notes: ${t.notes || 'N/A'}`
    )
    .join('\n');
};
