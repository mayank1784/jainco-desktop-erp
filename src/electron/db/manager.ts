import { app } from "electron";
import { join } from "path";
import Database, { Database as SQLiteDatabase } from "better-sqlite3";
import Store from "electron-store";

export class DatabaseManager {
  private store: Store;
  private dbPath: string;
  private db: SQLiteDatabase | null;

  constructor() {
    this.store = new Store();
    this.dbPath = join(app.getPath("userData"), `erp.db`);
    this.db = null;
  }

  // Method to add the 'last_updated' column and create trigger for each table
  private createUpdateTrigger(table: string) {
    if (!this.db) throw new Error("Database not initialized");

    // Create a trigger for the specified table
    // Add last_updated column to the table first
    const triggerQuery = `
      CREATE TRIGGER IF NOT EXISTS update_last_updated_${table}
      AFTER UPDATE ON ${table}
      BEGIN
        UPDATE ${table} SET last_updated = CURRENT_TIMESTAMP WHERE id = OLD.id;
      END;
    `;

    // Execute the trigger query
    this.db.exec(triggerQuery);
  }

  initialize(): boolean {
    try {
      // Initialize database connection
      this.db = new Database(this.dbPath, {
        verbose: console.log,
        fileMustExist: false, // Allow creating a new database
        readonly: false,
      });

      // Enable foreign keys
      this.db.pragma("foreign_keys = ON");

      // Create tables
      this.createTables();

      // Check if this is the first run
      const isFirstRun = this.store.get("firstRun", true);
      if (isFirstRun) {
        this.initializeDefaultData();
        this.store.set("firstRun", false);
      }
      const tables = [
        "customers",
        "orders",
        "products",
        "invoices",
        "invoice_items",
        "transactions",
        "payment_methods",
      ]; // Add all your table names here
      tables.forEach((table) => {
        try {
          this.createUpdateTrigger(table);
        } catch (triggerError) {
          console.warn(`Failed to create trigger for ${table}:`, triggerError);
        }
      });

      console.log("Database initialized successfully at:", this.dbPath);
      return true;
    } catch (error) {
      console.error("Failed to initialize database:", error);
      return false;
    }
  }

  private createTables(): void {
    if (!this.db) throw new Error("Database not initialized");

    // Customers table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fs_cust_id TEXT, 
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      address TEXT,
      stateName TEXT,
      districtName TEXT,
      country TEXT DEFAULT 'india',
      pincode TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      credit_balance DECIMAL(12,2) DEFAULT 0,
      debit_balance DECIMAL(12,2) DEFAULT 0,
      sp_synced BOOLEAN DEFAULT 0
      )`);
    this.db.exec(
      `CREATE INDEX IF NOT EXISTS idx_cust_id ON customers(fs_cust_id)`
    );

    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_cust_name ON customers(name)`);
    // Products table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fs_sku TEXT NOT NULL UNIQUE,
        fs_prod_id TEXT NOT NULL UNIQUE,
        fs_variation_id TEXT NOT NULL UNIQUE,
        fs_category_id TEXT NOT NULL UNIQUE,
        category_name TEXT NOT NULL,
        prod_name TEXT NOT NULL,
        price DECIMAL(10, 2) NOT NULL CHECK(price > 0),
        stock INTEGER DEFAULT 0,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        sp_synced BOOLEAN DEFAULT 0
      )`);

    this.db.exec(`
        CREATE INDEX IF NOT EXISTS idx_sku ON products (fs_sku)
        `);
    this.db.exec(`
        CREATE INDEX IF NOT EXISTS idx_prod_name ON products (prod_name)
        `);
    // Orders table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id TEXT NOT NULL UNIQUE,
        customer_id INTEGER NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('pending', 'completed')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        sp_synced BOOLEAN DEFAULT 0,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE 
      )`);

    this.db.exec(`
        CREATE INDEX IF NOT EXISTS idx_order_id ON orders (order_id)
        `);

    // Invoices table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_id TEXT NOT NULL UNIQUE,
        cust_id INTEGER NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('unpaid', 'paid')),
        date TEXT DEFAULT (DATE('now')),
        total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
        add_on DECIMAL(10, 2) DEFAULT 0,
        discount DECIMAL(10, 2) DEFAULT 0,
        net_amount DECIMAL(10,2) DEFAULT 0,
        narration TEXT,
        transport TEXT,
        nugs INTEGER DEFAULT 0,
        place_of_supply TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        sp_synced BOOLEAN DEFAULT 0,
        FOREIGN KEY (cust_id) REFERENCES customers(id) ON DELETE CASCADE
        )`);

    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_invoice_id ON invoices (invoice_id)
      `);
    this.db.exec(`
        CREATE TRIGGER IF NOT EXISTS update_net_amount
        AFTER INSERT ON invoices
        BEGIN
          UPDATE invoices
          SET net_amount = NEW.total_amount + NEW.add_on - NEW.discount
          WHERE id = NEW.id;
        END
      `);

    this.db.exec(`
        CREATE TRIGGER IF NOT EXISTS update_net_amount_on_update
        AFTER UPDATE ON invoices
        WHEN OLD.net_amount != NEW.net_amount OR OLD.add_on != NEW.add_on OR OLD.discount != NEW.discount
        BEGIN
          UPDATE invoices
          SET net_amount = NEW.total_amount + NEW.add_on - NEW.discount
          WHERE id = NEW.id;
        END
      `);
    this.db.exec(`
        CREATE TRIGGER IF NOT EXISTS after_invoice_insert_update_debit_balance
        AFTER INSERT ON invoices
        BEGIN
          UPDATE customers
          SET debit_balance = debit_balance + NEW.net_amount
          WHERE id = NEW.cust_id;
        END
      `);
    this.db.exec(`
        CREATE TRIGGER IF NOT EXISTS after_invoice_insert_update_credit_balance
        AFTER INSERT ON invoices
        WHEN NEW.status = 'paid'
        BEGIN
          UPDATE customers
          SET credit_balance = credit_balance + NEW.net_amount
          WHERE id = NEW.cust_id;
        END
      `);

    this.db.exec(`
      CREATE TRIGGER IF NOT EXISTS after_invoice_net_amount_update
      AFTER UPDATE OF net_amount ON invoices
      BEGIN
        UPDATE customers
        SET debit_balance = debit_balance + (NEW.net_amount - OLD.net_amount)
        WHERE id = NEW.cust_id;
      END
      `);
    this.db.exec(`
      CREATE TRIGGER IF NOT EXISTS after_invoice_status_to_paid
      AFTER UPDATE OF status ON invoices
      WHEN OLD.status = 'unpaid' AND NEW.status = 'paid'
      BEGIN
        UPDATE customers
        SET credit_balance = credit_balance + NEW.net_amount
        WHERE id = NEW.cust_id;
      END
      `);
    this.db.exec(`
      CREATE TRIGGER IF NOT EXISTS after_invoice_status_to_unpaid
      AFTER UPDATE OF status ON invoices
      WHEN OLD.status = 'paid' AND NEW.status = 'unpaid'
      BEGIN
        UPDATE customers
        SET credit_balance = credit_balance - OLD.net_amount
        WHERE id = NEW.cust_id;
      END
      `);
    this.db.exec(`
      CREATE TRIGGER IF NOT EXISTS after_invoice_cust_id_update
      AFTER UPDATE OF cust_id ON invoices
      BEGIN
        UPDATE customers
        SET debit_balance = debit_balance - OLD.net_amount
        WHERE id = OLD.cust_id;

        UPDATE customers
        SET credit_balance = credit_balance - OLD.net_amount
        WHERE id = OLD.cust_id AND OLD.status = 'paid';

        UPDATE customers
        SET debit_balance = debit_balance + NEW.net_amount
        WHERE id = NEW.cust_id;

        UPDATE customers
        SET credit_balance = credit_balance + NEW.net_amount
        WHERE id = NEW.cust_id AND NEW.status = 'paid';
      END
      `);

    this.db.exec(`
      CREATE TRIGGER IF NOT EXISTS after_invoice_delete_debit_balance
      AFTER DELETE ON invoices
      BEGIN
        UPDATE customers
        SET debit_balance = debit_balance - OLD.net_amount
        WHERE id = OLD.cust_id;
      END
      `);

    this.db.exec(`
      CREATE TRIGGER IF NOT EXISTS after_invoice_delete_credit_balance
      AFTER DELETE ON invoices
      WHEN OLD.status = 'paid'
      BEGIN
        UPDATE customers
        SET credit_balance = credit_balance - OLD.net_amount
        WHERE id = OLD.cust_id;
      END
      `);
    // Invoice items table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS invoice_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_id INTEGER NOT NULL UNIQUE,
        item_id INTEGER NOT NULL UNIQUE,
        sku TEXT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        qty INTEGER NOT NULL CHECK (qty > 0),
        amount DECIMAL(12,2) DEFAULT 0,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        sp_synced BOOLEAN DEFAULT 0,
        FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
        FOREIGN KEY (sku) REFERENCES products(fs_sku),
        FOREIGN KEY (item_id) REFERENCES products(id)
        )`);

    this.db.exec(`
          CREATE INDEX IF NOT EXISTS idx_inv_id_invoice_items ON invoice_items (invoice_id)
          `);
    this.db.exec(`
            CREATE INDEX IF NOT EXISTS idx_sku_invoice_items ON invoice_items (sku)
            `);

    this.db.exec(`
        CREATE TRIGGER IF NOT EXISTS update_invoice_items_amount
        AFTER INSERT ON invoice_items
        BEGIN
          UPDATE invoice_items
          SET amount = NEW.price * NEW.qty
          WHERE id = NEW.id;
        END
      `);
    this.db.exec(`
        CREATE TRIGGER IF NOT EXISTS update_invoice_items_amount_on_update
        AFTER UPDATE ON invoice_items
        WHEN OLD.amount != NEW.amount OR OLD.price != NEW.price OR OLD.qty != NEW.qty
        BEGIN
          UPDATE invoice_items
          SET amount = NEW.price * NEW.qty
          WHERE id = NEW.id;
        END
      `);

    // Transactions table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      transaction_id TEXT NOT NULL UNIQUE,          
      invoice_id INTEGER NOT NULL,
      payment_method INTEGER,
      transaction_date TEXT DEFAULT (DATE('now')),
      amount DECIMAL(12, 2) NOT NULL,
      transaction_type TEXT CHECK (transaction_type IN ('payment', 'refund', 'adjustment')),
      status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
      narration TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      sp_synced BOOLEAN DEFAULT 0,
      FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
      FOREIGN KEY (payment_method) REFERENCES payment_methods(id) ON DELETE SET NULL
      )`);
    this.db.exec(`
      CREATE TRIGGER IF NOT EXISTS after_transaction_insert_payment
      AFTER INSERT ON transactions
      WHEN NEW.status = 'completed' AND NEW.transaction_type = 'payment'
      BEGIN
        UPDATE customers
        SET credit_balance = credit_balance + NEW.amount
        WHERE id = (SELECT cust_id FROM invoices WHERE id = NEW.invoice_id);
      END
      `);
    this.db.exec(`
      CREATE TRIGGER IF NOT EXISTS after_transaction_insert_refund
      AFTER INSERT ON transactions
      WHEN NEW.status = 'completed' AND NEW.transaction_type = 'refund'
      BEGIN
        UPDATE customers
        SET credit_balance = credit_balance - NEW.amount
        WHERE id = (SELECT cust_id FROM invoices WHERE id = NEW.invoice_id);
      END
      `);
    this.db.exec(`
      CREATE TRIGGER IF NOT EXISTS after_transaction_insert_adjustment
      AFTER INSERT ON transactions
      WHEN NEW.status = 'completed' AND NEW.transaction_type = 'adjustment'
      BEGIN
        UPDATE customers
        SET credit_balance = credit_balance + NEW.amount
        WHERE id = (SELECT cust_id FROM invoices WHERE id = NEW.invoice_id);
      END
      `);
    this.db.exec(`
      CREATE TRIGGER IF NOT EXISTS after_transaction_update_old_completed
      AFTER UPDATE ON transactions
      WHEN OLD.status = 'completed'
      BEGIN
        UPDATE customers
        SET credit_balance = CASE
          WHEN OLD.transaction_type = 'payment' THEN credit_balance - OLD.amount
          WHEN OLD.transaction_type = 'refund' THEN credit_balance + OLD.amount
          WHEN OLD.transaction_type = 'adjustment' THEN credit_balance - OLD.amount
          ELSE credit_balance
        END
        WHERE id = (SELECT cust_id FROM invoices WHERE id = OLD.invoice_id);
      END
      `);

    this.db.exec(`
      CREATE TRIGGER IF NOT EXISTS after_transaction_update_new_completed
      AFTER UPDATE ON transactions
      WHEN NEW.status = 'completed'
      BEGIN
        UPDATE customers
        SET credit_balance = CASE
          WHEN NEW.transaction_type = 'payment' THEN credit_balance + NEW.amount
          WHEN NEW.transaction_type = 'refund' THEN credit_balance - NEW.amount
          WHEN NEW.transaction_type = 'adjustment' THEN credit_balance + NEW.amount
          ELSE credit_balance
        END
        WHERE id = (SELECT cust_id FROM invoices WHERE id = NEW.invoice_id);
      END
      `);

    this.db.exec(`
      CREATE TRIGGER IF NOT EXISTS after_transaction_delete_payment
      AFTER DELETE ON transactions
      WHEN OLD.status = 'completed' AND OLD.transaction_type = 'payment'
      BEGIN
        UPDATE customers
        SET credit_balance = credit_balance - OLD.amount
        WHERE id = (SELECT cust_id FROM invoices WHERE id = OLD.invoice_id);
      END
      `);

    this.db.exec(`
      CREATE TRIGGER IF NOT EXISTS after_transaction_delete_refund
      AFTER DELETE ON transactions
      WHEN OLD.status = 'completed' AND OLD.transaction_type = 'refund'
      BEGIN
        UPDATE customers
        SET credit_balance = credit_balance + OLD.amount
        WHERE id = (SELECT cust_id FROM invoices WHERE id = OLD.invoice_id);
      END
      `);
    this.db.exec(`
      CREATE TRIGGER IF NOT EXISTS after_transaction_delete_adjustment
      AFTER DELETE ON transactions
      WHEN OLD.status = 'completed' AND OLD.transaction_type = 'adjustment'
      BEGIN
        UPDATE customers
        SET credit_balance = credit_balance - OLD.amount
        WHERE id = (SELECT cust_id FROM invoices WHERE id = OLD.invoice_id);
      END
      `);

    this.db.exec(`
        CREATE INDEX IF NOT EXISTS idx_trans_id ON transactions (transaction_id)
        `);

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS payment_methods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      ac_no TEXT NOT NULL,
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      sp_synced BOOLEAN DEFAULT 0
      )`);

    // Sync status table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS supabase_sync_status (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entity TEXT NOT NULL,
      last_sync TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status TEXT CHECK (status IN ('success', 'failed')),
      error TEXT
      )`);
  }

  private initializeDefaultData(): void {
    if (!this.db) throw new Error("Database not initialized");

    // Add a sample customer
    this.db
      .prepare(
        `
      INSERT INTO customers (name, fs_cust_id, email, phone, address, stateName, districtName)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `
      )
      .run(
        "Demo Customer",
        "akdsnfj233",
        "demo@example.com",
        "1234567890",
        "123 Main St",
        "Demo State",
        "Demo District"
      );

    // Add a sample product
    this.db
      .prepare(
        `
      INSERT INTO products (fs_sku, fs_prod_id, fs_variation_id, fs_category_id, category_name, prod_name, price, stock)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `
      )
      .run(
        "DEMO-001",
        "prod1",
        "var1",
        "cat1",
        "Demo Category",
        "Demo Product",
        100.0,
        10
      );
  }

  getDatabase(): SQLiteDatabase | null {
    return this.db;
  }

  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  getCustomersByFilters(filters: CustomerFilters) {
    if (!this.db) {
      throw new Error("Database is not initialized.");
    }
  
    // Initialize query components
    const conditions: string[] = [];
    const values: (string | number | bigint)[] = [];
  
    for (const [field, value] of Object.entries(filters)) {
      if (value === undefined) continue; // Skip undefined filters
  
      // Handle string fields with LIKE for partial matching
      if (typeof value === "string") {
        conditions.push(`${field} LIKE ?`);
        values.push(`%${value}%`); // Add wildcards for partial matching
      } else if (typeof value === "number" || typeof value === "bigint") {
        conditions.push(`${field} = ?`);
        values.push(value);
      } else {
        throw new Error(`Invalid value type for field: ${field}`);
      }
    }
  
    // Construct the WHERE clause
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  
    // Build and execute the query
    const query = `
      SELECT *
      FROM customers
      ${whereClause}
    `;
  
    try {
      const results = this.db.prepare(query).all(...values);
      return { success: true, data: results };
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }
  

  getAllCustomers() {
    if (!this.db) {
      throw new Error("Database is not initialized.");
    }
    const query = `SELECT * FROM customers`;
    const results = this.db.prepare(query).all();
    return { success: true, data: results };
  }

  createCustomer(customerData: Partial<Customer>) {
    if (!this.db) {
      throw new Error("Database is not initialized.");
    }
    try {
      // Extract provided keys and values dynamically
      const keys = Object.keys(customerData);
      const values = Object.values(customerData);

      // Construct dynamic SQL query
      const placeholders = keys.map(() => "?").join(", ");
      const insertQuery = `
      INSERT INTO customers (${keys.join(", ")})
      VALUES (${placeholders})
    `;

      // Execute the query to insert customer data
      const result = this.db.prepare(insertQuery).run(...values);

      // Check if the insert was successful
      if (result.changes > 0) {
        const createdCustomer = this.db
          .prepare("SELECT * FROM customers WHERE id = ?")
          .get(result.lastInsertRowid);
        return { success: true, data: createdCustomer };
      }

      return {
        success: false,
        createdCustomer: null,
        error: "Failed to create customer",
      };
    } catch (error) {
      console.error("Error creating customer:", error);
      return {
        success: false,
        createdCustomer: null,
        error: (error as Error).message,
      };
    }
  }

  updateCustomer(
    customerId: number,
    updates: Omit<Customer, "id" | "fs_cust_id" | "created_at">
  ) {
    if (!this.db) {
      throw new Error("Database is not initialized.");
    }
    const keys = Object.keys(updates) as (keyof typeof updates)[];
    if (keys.length === 0) {
      throw new Error("No fields provided to update.");
    }

    // Construct the SET clause dynamically
    const setClause = keys.map((key) => `${key} = ?`).join(", ");
    const values = keys.map((key) => updates[key]);
    const query = `
    UPDATE customers
    SET ${setClause}
    WHERE id = ?
  `;

    // Execute the update query
    const stmt = this.db.prepare(query);
    const result = stmt.run(...values, customerId);

    // Fetch the updated rows if any changes were made
    let updatedRows: unknown[] = [];
    if (result.changes > 0) {
      const selectQuery = `SELECT * FROM customers WHERE id = ?`;
      updatedRows = this.db.prepare(selectQuery).all(customerId);
    }
    return { success: true, changes: result.changes, data: updatedRows };
  }

  deleteCustomer(customerId: number) {
    if (!this.db) {
      throw new Error("Database is not initialized.");
    }
    // Select the rows that will be deleted (for returning later)
    const selectQuery = `SELECT * FROM customers WHERE id = ?`;
    const deletedRows = this.db.prepare(selectQuery).all(customerId);

    if (deletedRows.length === 0) {
      return { success: false, changes: 0, data: [] }; // No rows to delete
    }

    // Delete the customer
    const deleteQuery = `DELETE FROM customers WHERE id = ?`;
    const result = this.db.prepare(deleteQuery).run(customerId);

    return { success: true, changes: result.changes, data: deletedRows };
  }

  createInvoice(invoiceData: Invoice, invoiceItems: InvoiceItem[]) {
    if (!this.db) {
      throw new Error("Database is not initialized.");
    }
    const db = this.db;
    const { invoice_id, cust_id, ...invoiceFields } = invoiceData;

    try {
      if (!invoice_id || !cust_id) {
        throw new Error("Invoice ID and Customer ID are required");
      }

      // Start a transaction
      db.exec("BEGIN TRANSACTION");

      // Insert invoice
      const invoiceKeys = [
        "invoice_id",
        "cust_id",
        ...Object.keys(invoiceFields),
      ];
      const invoiceValues = [
        invoice_id,
        cust_id,
        ...Object.values(invoiceFields),
      ];
      const invoicePlaceholders = invoiceKeys.map(() => "?").join(", ");
      const insertInvoiceQuery = `
        INSERT INTO invoices (${invoiceKeys.join(", ")})
        VALUES (${invoicePlaceholders})
      `;
      const invoiceResult = db
        .prepare(insertInvoiceQuery)
        .run(...invoiceValues);

      if (invoiceResult.changes === 0) {
        throw new Error("Failed to insert invoice");
      }

      // Insert invoice items
      const itemsInsertionResult = this.createInvoiceItems(
        invoiceResult.lastInsertRowid,
        invoiceItems
      );
      if (!itemsInsertionResult.success) {
        throw new Error(
          itemsInsertionResult.error || "Failed to insert invoice items"
        );
      }

      // Commit transaction
      db.exec("COMMIT");

      // Fetch the newly created invoice
      const createdInvoice = db
        .prepare("SELECT * FROM invoices WHERE id = ?")
        .get(invoiceResult.lastInsertRowid) as Invoice;

      const finalInvoice = {
        ...createdInvoice,
        invoice_items: itemsInsertionResult.invoice_items,
      };

      return { success: true, createdInvoice: finalInvoice };
    } catch (error) {
      // Rollback transaction on error
      db.exec("ROLLBACK");
      console.error("Error creating invoice:", error);
      return {
        success: false,
        createdInvoice: null,
        error: (error as Error).message,
      };
    }
  }

  private createInvoiceItems(invoiceId: number | bigint, items: InvoiceItem[]) {
    if (!this.db) {
      throw new Error("Database is not initialized.");
    }
    try {
      this.db.exec("BEGIN TRANSACTION");

      for (const item of items) {
        const { item_id, sku, ...itemFields } = item;
        const invoiceItemKeys = [
          "invoice_id",
          "item_id",
          "sku",
          ...Object.keys(itemFields),
        ];
        const invoiceItemValues = [
          invoiceId,
          item_id,
          sku,
          ...Object.values(itemFields),
        ];
        const invoiceItemPlaceholders = invoiceItemKeys
          .map(() => "?")
          .join(", ");
        const insertInvoiceItemQuery = `
        INSERT INTO invoice_items (${invoiceItemKeys.join(", ")})
        VALUES (${invoiceItemPlaceholders})
      `;
        const result = this.db
          .prepare(insertInvoiceItemQuery)
          .run(...invoiceItemValues);

        if (result.changes === 0) {
          throw new Error(`Failed to insert item: ${item.sku}`);
        }
      }
      this.db.exec("COMMIT");
      const createdInvoiceItems = this.db
        .prepare("SELECT * FROM invoice_items WHERE invoice_id = ?")
        .get(invoiceId);

      return { success: true, invoice_items: createdInvoiceItems };
    } catch (error) {
      this.db.exec("ROLLBACK");
      console.error("Error inserting invoice items:", error);
      return { success: false, error: (error as Error).message };
    }
  }

  getInvoice(identifier: { id?: number; invoice_id?: string }) {
    if (!this.db) {
      throw new Error("Database is not initialized.");
    }

    try {
      const { id, invoice_id } = identifier;

      // Validate input
      if (!id && !invoice_id) {
        throw new Error("Either 'id' or 'invoice_id' must be provided.");
      }

      // Select the appropriate query based on the provided identifier
      const invoiceQuery = `
        SELECT *
        FROM invoices 
        WHERE ${id ? "id = ?" : "invoice_id = ?"}
      `;
      const invoice = this.db.prepare(invoiceQuery).get(id ?? invoice_id) as
        | Invoice
        | undefined;

      if (!invoice) {
        throw new Error("Invoice not found");
      }

      // Fetch the associated invoice items
      const itemsQuery = `
        SELECT * 
        FROM invoice_items 
        WHERE invoice_id = ?
      `;
      const invoiceItems = this.db
        .prepare(itemsQuery)
        .all(invoice.id) as InvoiceItem[];

      // Combine invoice and its items
      const result = { ...invoice, invoice_items: invoiceItems };

      return { success: true, invoice: result };
    } catch (error) {
      console.error("Error fetching invoice:", error);
      return { success: false, error: (error as Error).message, invoice: null };
    }
  }

  updateInvoice(
    identifier: { id?: number; invoice_id?: string },
    updatedInvoiceData: Partial<Omit<Invoice, "id" | "invoice_id">>,
    updatedItems: InvoiceItem[]
  ) {
    if (!this.db) {
      throw new Error("Database is not initialized.");
    }

    const db = this.db;

    try {
      const { id, invoice_id } = identifier;

      // Validate input
      if (!id && !invoice_id) {
        throw new Error("Either 'id' or 'invoice_id' must be provided.");
      }

      db.exec("BEGIN TRANSACTION");

      let invoiceId: number | bigint;

      // Update invoice data if any fields are provided
      if (Object.keys(updatedInvoiceData).length > 0) {
        const updateInvoiceQuery = `
          UPDATE invoices
          SET ${Object.keys(updatedInvoiceData)
            .map((key) => `${key} = ?`)
            .join(", ")}
          WHERE ${id ? "id = ?" : "invoice_id = ?"}
        `;

        const updateInvoiceValues = [
          ...Object.values(updatedInvoiceData),
          id ?? invoice_id,
        ];

        const invoiceUpdateResult = db
          .prepare(updateInvoiceQuery)
          .run(updateInvoiceValues);

        if (invoiceUpdateResult.changes === 0) {
          throw new Error("Failed to update invoice.");
        }

        // Fetch the updated invoice_id
        const fetchQuery = `
          SELECT id FROM invoices WHERE ${id ? "id = ?" : "invoice_id = ?"}
        `;
        const result = db.prepare(fetchQuery).get(id ?? invoice_id) as {
          id: number | bigint;
        };
        invoiceId = result.id;
      } else {
        // Fetch existing invoice_id if no updates are done to the invoice fields
        const fetchQuery = `
          SELECT id FROM invoices WHERE ${id ? "id = ?" : "invoice_id = ?"}
        `;
        const result = db.prepare(fetchQuery).get(id ?? invoice_id) as {
          id: number;
        };
        invoiceId = result.id;
      }

      // Delegate invoice item updates to the helper function
      const invoiceItemsResult = this.updateInvoiceItems(
        invoiceId,
        updatedItems
      );

      if (!invoiceItemsResult.success) {
        throw new Error(invoiceItemsResult.error);
      }

      db.exec("COMMIT");

      // Fetch updated invoice and items
      const updatedInvoice = db
        .prepare("SELECT * FROM invoices WHERE id = ?")
        .get(invoiceId) as Invoice;

      const updatedInvoiceItems = invoiceItemsResult.updatedItems;

      return {
        success: true,
        updatedInvoice: {
          ...updatedInvoice,
          invoice_items: updatedInvoiceItems,
        },
      };
    } catch (error) {
      db.exec("ROLLBACK");
      console.error("Error updating invoice:", error);
      return { success: false, error: (error as Error).message };
    }
  }
  private updateInvoiceItems(
    invoiceId: number | bigint,
    updatedItems: InvoiceItem[]
  ) {
    if (!this.db) {
      throw new Error("Database is not initialized.");
    }

    try {
      // Fetch existing items for the given invoice
      const existingItemsQuery = `
        SELECT * FROM invoice_items WHERE invoice_id = ?
      `;
      const existingItems: InvoiceItem[] = this.db
        .prepare(existingItemsQuery)
        .all(invoiceId) as InvoiceItem[];

      const existingItemIds = existingItems.map((item) => item.item_id);
      const updatedItemIds = updatedItems.map((item) => item.item_id);

      // Determine items to delete, update, and add
      const itemsToRemove = existingItems.filter(
        (item) => !updatedItemIds.includes(item.item_id)
      );
      const itemsToUpdate = updatedItems.filter((item) =>
        existingItemIds.includes(item.item_id)
      );
      const itemsToAdd = updatedItems.filter(
        (item) => !existingItemIds.includes(item.item_id)
      );
      this.db.exec("BEGIN TRANSACTION");
      // Delete items no longer present
      if (itemsToRemove.length > 0) {
        const deleteItemQuery = `
          DELETE FROM invoice_items WHERE invoice_id = ? AND item_id = ?
        `;
        const deleteStmt = this.db.prepare(deleteItemQuery);

        for (const item of itemsToRemove) {
          const result = deleteStmt.run(invoiceId, item.item_id);
          if (result.changes === 0) {
            throw new Error(`Failed to delete item with ID: ${item.item_id}`);
          }
        }
      }

      // Update existing items
      if (itemsToUpdate.length > 0) {
        for (const item of itemsToUpdate) {
          // Restrict updates to 'price' and 'quantity' only
          const allowedKeys = ["price", "quantity"];
          const invoiceItemKeys = Object.keys(item).filter(
            (key) => allowedKeys.includes(key) && key !== "item_id" // Exclude item_id
          );

          const invoiceItemValues = invoiceItemKeys.map(
            (key) => item[key as keyof InvoiceItem]
          ); // Corresponding values

          // Dynamically construct SET clause
          const setClause = invoiceItemKeys
            .map((key) => `${key} = ?`)
            .join(", ");

          if (setClause.length === 0) {
            throw new Error(
              `No allowed fields to update for item with ID: ${item.item_id}`
            );
          }

          const updateQuery = `
            UPDATE invoice_items 
            SET ${setClause}
            WHERE invoice_id = ? AND item_id = ?
          `;

          // Prepare values for the query: dynamic values + conditions
          const queryValues = [...invoiceItemValues, invoiceId, item.item_id];

          const result = this.db.prepare(updateQuery).run(...queryValues);

          if (result.changes === 0) {
            throw new Error(`Failed to update item with ID: ${item.item_id}`);
          }
        }
      }

      // Add new items
      if (itemsToAdd.length > 0) {
        const res = this.createInvoiceItems(invoiceId, itemsToAdd);
        if (!res.success) {
          throw new Error(res.error);
        }
      }
      this.db.exec("COMMIT");
      const finalUpdatedItems = this.db
        .prepare("SELECT * FROM invoice_items WHERE invoice_id = ?")
        .all(invoiceId) as InvoiceItem[];
      return { success: true, updatedItems: finalUpdatedItems };
    } catch (error) {
      this.db.exec("ROLLBACK");
      console.error("Error updating invoice items:", error);
      return { success: false, error: (error as Error).message };
    }
  }

  deleteInvoice(identifier: { id?: number; invoice_id?: string }) {
    if (!this.db) {
      throw new Error("Database is not initialized.");
    }
    const { id, invoice_id } = identifier;
    const deleteQuery = `
      DELETE FROM invoices WHERE ${id ? "id = ?" : "invoice_id = ?"}
    `;
    const result = this.db.prepare(deleteQuery).run(id ?? invoice_id);
    return { success: result.changes > 0, changes: result.changes };
  }

  getProductsByFilters(filters: ProductFilters) {
    if (!this.db) {
      throw new Error("Database is not initialized.");
    }
  
    const conditions: string[] = [];
    const parameters: (string | number | bigint | undefined)[] = [];
  
    // Add filters to the query dynamically
    if (filters.id !== undefined) {
      conditions.push("id = ?");
      parameters.push(filters.id); // Exact match for numeric ID
    }
    if (filters.prod_name) {
      conditions.push("prod_name LIKE ?");
      parameters.push(`%${filters.prod_name}%`); // Partial match for product name
    }
    if (filters.fs_sku) {
      conditions.push("fs_sku LIKE ?");
      parameters.push(`%${filters.fs_sku}%`); // Partial match for SKU
    }
    if (filters.category_name) {
      conditions.push("category_name LIKE ?");
      parameters.push(`%${filters.category_name}%`); // Partial match for category
    }
  
    // Construct the WHERE clause
    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" OR ")}` : "";
  
    const query = `
      SELECT *
      FROM products
      ${whereClause}
    `;
  
    try {
      const result = this.db.prepare(query).all(...parameters);
      return { success: true, data: result };
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }
  
}

export const dbManager = new DatabaseManager();
