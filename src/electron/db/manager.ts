import { app } from "electron";
import { join } from "path";
import Database, { Database as SQLiteDatabase } from "better-sqlite3";
import Store from "electron-store";

class DatabaseManager {
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
      fs_cust_id TEXT NOT NULL, 
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
        fs_customer_id INTEGER NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('pending', 'completed')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        sp_synced BOOLEAN DEFAULT 0,
        FOREIGN KEY (fs_customer_id) REFERENCES customers(id) ON DELETE CASCADE 
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
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
      transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
}

export const dbManager = new DatabaseManager();
