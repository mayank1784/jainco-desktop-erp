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
        filterCustomers: (
          filters: Record<string, string | number>
        ) => Promise<{ success: boolean; data: Customer[] }>;
        getAllCustomers: () => Promise<{ success: boolean; data: Customer[] }>;
        createCustomer: (
          customerData: Partial<Customer>
        ) => Promise<{ success: boolean; data: Customer }>;
        updateCustomer: (
          customerId: number,
          updates: Omit<Customer, "id" | "fs_cust_id" | "created_at">
        ) => Promise<{ success: boolean; changes: number; data: Customer }>;
        deleteCustomer: (
          customerId: number
        ) => Promise<{ success: boolean; changes: number; data: Customer }>;
      };
      invoice: {
        createInvoice: (
          invoiceData: Invoice,
          invoiceItems: InvoiceItem[]
        ) => Promise<{ success: boolean; createdInvoice: unknown }>;
        getInvoice: (
          identifier: number | string
        ) => Promise<{ success: boolean; invoice: unknown }>;
        updateInvoice: (
          identifier: number | string,
          updatedInvoiceData: Partial<Omit<Invoice, "id" | "invoice_id">>,
          updatedItems: InvoiceItem[]
        ) => Promise<{ success: boolean; updatedInvoice: unknown }>;
        deleteInvoice: (
          identifier: number | string
        ) => Promise<{ success: boolean; changes: number }>;
      };
      product: {
        filterProducts: (
          filters: Record<string, string | undefined>
        ) => Promise<{ success: boolean; data: Product[] }>;
      };
    };
  }
  interface Customer {
    id?: number | bigint;
    fs_cust_id?: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    stateName?: string;
    districtName?: string;
    country?: string;
    pincode?: string;
    created_at?: string;
    credit_balance?: number;
    debit_balance?: number;
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
    id?: number | bigint;
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
    id: number | bigint;
    invoice_id: string;
    cust_id: number | bigint;
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
  interface InvoiceItem {
    id: number | bigint;
    invoice_id: string;
    item_id: number | bigint;
    sku: string;
    price: number;
    quantity: number;
    amount?: number;
  }

  interface Transaction {
    id: number | bigint;
    transaction_id: number | bigint;
    invoice_id: number | bigint;
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
    id: number | bigint;
    order_id: string;
    customer_id: string;
    status: "pending" | "completed";
    created_at: string;
    updated_at: string;
  }

  interface ProductFilters {
    id?: number | bigint;
    prod_name?: string;
    fs_sku?: string;
    category_name?: string;
  }

  type CustomerFilters = {
    id?: number | bigint;
    name?: string;
    email?: string;
    phone?: string;
    credit_balance?: number;
    debit_balance?: number;
  };
  
}

export {};
