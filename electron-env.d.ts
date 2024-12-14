
import { IpcRenderer } from 'electron';
declare global{
interface Window {
   /**
     * Provides access to Firebase configuration.
     */
  ipcRenderer: import('electron').IpcRenderer,
  electronAPI: {
    ipcRenderer: Pick<
        IpcRenderer,
        'on' | 'once' | 'removeListener' | 'removeAllListeners' | 'send' | 'invoke' | 'off'
      >;
    getFirebaseConfig: () => Promise<FirebaseConfig>;
    getSupabaseConfig: () => Promise<SupabaseConfig>;
    // customers: {
    //    /**
    //      * Retrieves all customers.
    //      * @returns A promise resolving to an array of customers.
    //      */
    //   getAll: () => Promise<Customer[]>;
    //    /**
    //      * Creates a new customer.
    //      * @param customer - The customer details.
    //      * @returns A promise resolving to the created customer.
    //      */
    //   create: (customer: Customer) => Promise<Customer>;
    // };
    // invoices: {
    //   getAll: () => Promise<Invoice[]>;
    //   create: (invoice: Invoice) => Promise<Invoice>;
    // };
    // products: {
    //   getAll: () => Promise<Product[]>;
    //   updateStock: (data: { sku: string; stock: number }) => Promise<Product>;
    // };
    customer: {
      fetchCustomers: (input: string) => Promise<{ success: boolean; data: Customer[] }>;
      createCustomer: (customer: Customer) => Promise<{ success: boolean; data: Customer }>;
      updateCustomer: (customer: Customer) => Promise<{ success: boolean; data: Customer }>;
      deleteCustomer: (customerId: number) => Promise<{ success: boolean }>;
    };
  };
}}

// Define configuration interfaces
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
}

interface SupabaseConfig {
  url: string;
  key: string;
}

export interface Customer {
  id?: number;
  fs_cust_id?: number; 
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  stateName?: string;
  districtName?: string;
  country?: string;
  pincode?: string;
  created_at?: string;
}

export interface Product {
  id?: number;
  fs_sku: string;
  fs_prod_id?: string;
  fs_variation_id?: string;
  fs_category_id?: string;
  category_name?: string;
  prod_name?: string;
  price: number;
  stock?: number;
}

export interface Invoice {
  id?: number;
  invoice_id: string;
  cust_id: number;
  status: 'unpaid' | 'paid';
  date?: string;
  total_amount: number;
  add_on?: number;
  discount?: number;
  net_amount: number;
  narration?: string;
  transport?: string;
  nugs?: number;
  place_of_supply?: string;
  created_at: string;
}

export {};