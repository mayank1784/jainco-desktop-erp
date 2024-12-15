import { IpcRenderer } from "electron";
declare global {
  interface Window {
    /**
     * Provides access to Firebase configuration.
     */
    ipcRenderer: import("electron").IpcRenderer;
    electronAPI: {
      ipcRenderer: Pick<
        IpcRenderer,
        | "on"
        | "once"
        | "removeListener"
        | "removeAllListeners"
        | "send"
        | "invoke"
        | "off"
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
        fetchCustomers: (
          input: string
        ) => Promise<{ success: boolean; data: Customer[] }>;
        createCustomer: (
          customer: Customer
        ) => Promise<{ success: boolean; data: Customer }>;
        filterCustomers: (
          filters: Record<string, string | number>
        ) => Promise<{ success: boolean; data: Customer[] }>;
        updateCustomer: (
          customer: Customer
        ) => Promise<{ success: boolean; data: Customer }>;
        deleteCustomer: (customerId: number) => Promise<{ success: boolean }>;
      };
    };
  }
  interface Customer {
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
  interface Product {
    id?: number;
    fs_sku: string;
    fs_prod_id?: string;
    fs_variation_id?: string;
    fs_category_id?: string;
    category_name?: string;
    prod_name?: string;
    price: number;
    stock: number;
  }

  interface Invoice {
    id: number;
    invoice_id: string;
    cust_id: number;
    status: "unpaid" | "paid";
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

  interface Transaction {
    id: number;
    transaction_id: number;
    invoice_id: number;
    payment_method: number | null;
    transaction_date: string;
    amount: number;
    transaction_type: "payment" | "refund" | "adjustment";
    status: "pending" | "completed" | "failed";
    narration?: string;
    created_at: string;
    last_updated?: string;
  }

  interface Order {
    id: number;
    order_id: string;
    customer_id: string;
    status: "pending" | "completed";
    created_at: string;
    updated_at: string;
  }
}

export {};
