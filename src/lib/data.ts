import { MongoClient, ObjectId } from 'mongodb';
import type { Customer, CustomerSummary, CustomerWithSummary, Transaction, Labour, LabourPayment } from './types';
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
        serverSelectionTimeoutMS: 10000, // Increase timeout to 10 seconds
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        minPoolSize: 1
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
        
        const customersCollection = db.collection('customers');
        
        // Get total count and all customers
        const totalCount = await customersCollection.countDocuments({});
        const customers = await customersCollection.find({}).sort({ name: 1 }).toArray();
        
        // Ensure we're returning all customers
        if (customers.length === 0) {
            return [];
        }
        
        // Return all customers without any artificial limits
        return customers.map((customer: any) => {
            const { totalDue, totalPaid, balance } = calculateSummary(customer.transactions || []);
            const { transactions, ...customerWithoutTransactions } = customer;
            const mappedCustomer = mapMongoId(customerWithoutTransactions);
            
            return {
                ...mappedCustomer,
                name: customer.name,
                phone: customer.phone,
                address: customer.address,
                billNumber: customer.billNumber || "",
                amountPaid: customer.amountPaid || 0,
                amountDue: customer.amountDue || 0,
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
    
    // Create initial transactions based on imported amounts
    const transactions = [];
    
    // If there's an amount due, create a DEBIT transaction (bill)
    if (data.amountDue && data.amountDue > 0) {
        transactions.push({
            id: new ObjectId().toHexString(),
            date: new Date().toISOString(),
            amount: data.amountDue,
            type: 'DEBIT',
            mode: 'OTHER',
            billNumber: data.billNumber || "",
            notes: 'Initial bill from customer creation',
        });
    }
    
    // If there's an amount paid, create a CREDIT transaction (payment)
    if (data.amountPaid && data.amountPaid > 0) {
        transactions.push({
            id: new ObjectId().toHexString(),
            date: new Date().toISOString(),
            amount: data.amountPaid,
            type: 'CREDIT',
            mode: 'OTHER',
            billNumber: data.billNumber || "",
            notes: 'Initial payment from customer creation',
        });
    }

    const customerData = {
        name: data.name,
        phone: data.phone,
        address: data.address,
        billNumber: data.billNumber || "",
        amountPaid: data.amountPaid || 0,
        amountDue: data.amountDue || 0,
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
        billNumber: data.billNumber,
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
            phone: data.phone,
            address: data.address,
            billNumber: data.billNumber || "",
            amountPaid: data.amountPaid || 0,
            amountDue: data.amountDue || 0,
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
                "transactions.$.billNumber": data.billNumber,
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

export const getLabours = async (): Promise<Labour[]> => {
  const db = await getDb();
  if (!db) return [];
  const laboursCollection = db.collection('labours');
  const labours = await laboursCollection.find({}).toArray();
  return labours.map((labour: any) => ({
    ...mapMongoId(labour),
    payments: (labour.payments || []).map((p: any) => ({ ...p, id: p.id || new ObjectId().toHexString() }))
  }));
};

export const addLabour = async (data: { name: string; phone: string; }): Promise<void> => {
  const db = await getDb();
  if (!db) throw new Error('Database not connected.');
  const laboursCollection = db.collection('labours');
  await laboursCollection.insertOne({
    name: data.name,
    phone: data.phone,
    payments: [],
    createdAt: new Date(),
  });
};

export const addLabourPayment = async (labourId: string, payment: { date: string; amount: number; }): Promise<void> => {
  const db = await getDb();
  if (!db) throw new Error('Database not connected.');
  const laboursCollection = db.collection('labours');
  await laboursCollection.updateOne(
    { _id: new ObjectId(labourId) },
    { $push: { payments: { id: new ObjectId().toHexString(), ...payment } } }
  );
};

export const deleteLabourPayment = async (labourId: string, paymentId: string): Promise<void> => {
  const db = await getDb();
  if (!db) throw new Error('Database not connected.');
  const laboursCollection = db.collection('labours');
  await laboursCollection.updateOne(
    { _id: new ObjectId(labourId) },
    { $pull: { payments: { id: paymentId } } }
  );
};

export const deleteLabour = async (labourId: string): Promise<void> => {
  const db = await getDb();
  if (!db) throw new Error('Database not connected.');
  const laboursCollection = db.collection('labours');
  await laboursCollection.deleteOne({ _id: new ObjectId(labourId) });
};

// Export customers data to CSV format
export const exportCustomersToCSV = async (): Promise<string> => {
  const db = await getDb();
  if (!db) throw new Error('Database not connected.');
  
  const customersCollection = db.collection('customers');
  const customers = await customersCollection.find({}).toArray();
  
  // Convert to CSV format with new fields
  const headers = ['Name', 'Phone', 'Address', 'Bill Number', 'Amount Paid', 'Amount Due', 'Total Due', 'Total Paid', 'Balance'];
  const csvRows = [headers.join(',')];
  
  customers.forEach((customer: any) => {
    const { totalDue, totalPaid, balance } = calculateSummary(customer.transactions || []);
    const row = [
      `"${customer.name || ''}"`,
      `"${customer.phone || ''}"`,
      `"${customer.address || ''}"`,
      `"${customer.billNumber || ''}"`,
      (customer.amountPaid || 0).toString(),
      (customer.amountDue || 0).toString(),
      totalDue.toString(),
      totalPaid.toString(),
      balance.toString()
    ];
    csvRows.push(row.join(','));
  });
  
  return csvRows.join('\n');
};

// Export customers data to JSON format
export const exportCustomersToJSON = async (): Promise<string> => {
  const db = await getDb();
  if (!db) throw new Error('Database not connected.');
  
  const customersCollection = db.collection('customers');
  const customers = await customersCollection.find({}).toArray();
  
  // Format customers with summaries and new fields
  const formattedCustomers = customers.map((customer: any) => {
    const { totalDue, totalPaid, balance } = calculateSummary(customer.transactions || []);
    return {
      id: customer._id.toHexString(),
      name: customer.name || '',
      phone: customer.phone || '',
      address: customer.address || '',
      billNumber: customer.billNumber || '',
      amountPaid: customer.amountPaid || 0,
      amountDue: customer.amountDue || 0,
      totalDue,
      totalPaid,
      balance,
      transactions: customer.transactions || []
    };
  });
  
  return JSON.stringify(formattedCustomers, null, 2);
};

// Import customers from CSV data
export const importCustomersFromCSV = async (csvData: string): Promise<{ success: number; errors: string[]; duplicates: number }> => {
  const db = await getDb();
  if (!db) throw new Error('Database not connected.');
  
  const lines = csvData.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV must have at least a header row and one data row');
  }
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const dataLines = lines.slice(1);
  
  const customersCollection = db.collection('customers');
  const results = { success: 0, errors: [] as string[], duplicates: 0 };
  
  for (let i = 0; i < dataLines.length; i++) {
    try {
      const line = dataLines[i];
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      
      if (values.length < headers.length) {
        results.errors.push(`Row ${i + 2}: Insufficient data columns`);
        continue;
      }
      
      const customerData: any = {};
      headers.forEach((header, index) => {
        if (values[index]) {
          const headerLower = header.toLowerCase().replace(/\s+/g, '');
          customerData[headerLower] = values[index];
        }
      });
      
      // Validate required fields
      if (!customerData.name) {
        results.errors.push(`Row ${i + 2}: Name is required`);
        continue;
      }
      
      // Format phone number
      if (customerData.phone && !customerData.phone.startsWith('+91')) {
        customerData.phone = `+91${customerData.phone}`;
      }
      
      // Parse numeric fields
      const amountPaid = parseFloat(customerData.amountpaid || customerData.amountpaid || '0') || 0;
      const amountDue = parseFloat(customerData.amountdue || customerData.amountdue || '0') || 0;
      
      // Check if customer already exists
      const existingCustomer = await customersCollection.findOne({ 
        phone: customerData.phone 
      });
      
      if (existingCustomer) {
        // Skip duplicate silently - don't add to errors, just count it
        results.duplicates++;
        continue;
      }
      
      // Create initial transactions based on imported amounts
      const transactions = [];
      
      // If there's an amount due, create a DEBIT transaction (bill)
      if (amountDue > 0) {
        transactions.push({
          id: new ObjectId().toHexString(),
          date: new Date().toISOString(),
          amount: amountDue,
          type: 'DEBIT',
          mode: 'OTHER',
          billNumber: customerData.billnumber || customerData.billNumber || '',
          notes: 'Initial bill from import',
        });
      }
      
      // If there's an amount paid, create a CREDIT transaction (payment)
      if (amountPaid > 0) {
        transactions.push({
          id: new ObjectId().toHexString(),
          date: new Date().toISOString(),
          amount: amountPaid,
          type: 'CREDIT',
          mode: 'OTHER',
          billNumber: customerData.billnumber || customerData.billNumber || '',
          notes: 'Initial payment from import',
        });
      }
      
      // Insert customer with new fields and transactions
      await customersCollection.insertOne({
        name: customerData.name,
        phone: customerData.phone || '',
        address: customerData.address || '',
        billNumber: customerData.billnumber || customerData.billNumber || '',
        amountPaid: amountPaid,
        amountDue: amountDue,
        transactions: transactions,
        createdAt: new Date()
      });
      
      results.success++;
    } catch (error) {
      results.errors.push(`Row ${i + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  return results;
};

// Import customers from JSON data
export const importCustomersFromJSON = async (jsonData: string): Promise<{ success: number; errors: string[]; duplicates: number }> => {
  const db = await getDb();
  if (!db) throw new Error('Database not connected.');
  
  let customers;
  try {
    customers = JSON.parse(jsonData);
  } catch (error) {
    throw new Error('Invalid JSON format');
  }
  
  if (!Array.isArray(customers)) {
    throw new Error('JSON data must be an array of customers');
  }
  
  const customersCollection = db.collection('customers');
  const results = { success: 0, errors: [] as string[], duplicates: 0 };
  
  for (let i = 0; i < customers.length; i++) {
    try {
      const customerData = customers[i];
      
      // Validate required fields
      if (!customerData.name) {
        results.errors.push(`Customer ${i + 1}: Name is required`);
        continue;
      }
      
      // Check if customer already exists
      const existingCustomer = await customersCollection.findOne({ 
        phone: customerData.phone 
      });
      
      if (existingCustomer) {
        // Skip duplicate silently - don't add to errors, just count it
        results.duplicates++;
        continue;
      }
      
      // Parse numeric fields
      const amountPaid = parseFloat(customerData.amountPaid) || 0;
      const amountDue = parseFloat(customerData.amountDue) || 0;
      
      // Create initial transactions based on imported amounts (if no transactions provided)
      let transactions = customerData.transactions || [];
      
      if (transactions.length === 0) {
        // If there's an amount due, create a DEBIT transaction (bill)
        if (amountDue > 0) {
          transactions.push({
            id: new ObjectId().toHexString(),
            date: new Date().toISOString(),
            amount: amountDue,
            type: 'DEBIT',
            mode: 'OTHER',
            billNumber: customerData.billNumber || '',
            notes: 'Initial bill from import',
          });
        }
        
        // If there's an amount paid, create a CREDIT transaction (payment)
        if (amountPaid > 0) {
          transactions.push({
            id: new ObjectId().toHexString(),
            date: new Date().toISOString(),
            amount: amountPaid,
            type: 'CREDIT',
            mode: 'OTHER',
            billNumber: customerData.billNumber || '',
            notes: 'Initial payment from import',
          });
        }
      }
      
      // Insert customer with new fields and transactions
      await customersCollection.insertOne({
        name: customerData.name,
        phone: customerData.phone || '',
        address: customerData.address || '',
        billNumber: customerData.billNumber || '',
        amountPaid: amountPaid,
        amountDue: amountDue,
        transactions: transactions,
        createdAt: new Date()
      });
      
      results.success++;
    } catch (error) {
      results.errors.push(`Customer ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  return results;
};
