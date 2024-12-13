import { app } from 'electron';
import { join } from 'path';
import Database, { Database as SQLiteDatabase } from 'better-sqlite3';
import Store from 'electron-store';

// interface Customer {
//   id?: number;
//   remote_id?: number;
//   name: string;
//   email?: string;
//   phone?: string;
//   address?: string;
//   stateName?: string;
//   districtName?: string;
//   country?: string;
//   pincode?: string;
//   created_at?: string;
//   synced?: number;
// }

// interface Product {
//   id?: number;
//   sku: string;
//   prod_id: string;
//   variation_id: string;
//   category_id: string;
//   category_name: string;
//   name: string;
//   price: number;
//   stock?: number;
//   synced?: number;
// }

class DatabaseManager {
  private store: Store;
  private dbPath: string;
  private db: SQLiteDatabase | null;

  constructor() {
    this.store = new Store();
    this.dbPath = join(app.getPath('userData'), `erp.db`);
    this.db = null;
  }

  initialize(): boolean {
    try {
      // Initialize database connection
      this.db = new Database(this.dbPath, {
        verbose: console.log,
        fileMustExist: false, // Allow creating a new database
        readonly: false
      });

      // Enable foreign keys
      this.db.pragma('foreign_keys = ON');

      // Create tables
      this.createTables();

      // Check if this is the first run
      const isFirstRun = this.store.get('firstRun', true);
      if (isFirstRun) {
        this.initializeDefaultData();
        this.store.set('firstRun', false);
      }

      console.log('Database initialized successfully at:', this.dbPath);
      return true;
    } catch (error) {
      console.error('Failed to initialize database:', error);
      return false;
    }
  }

  private createTables(): void {
    if (!this.db) throw new Error('Database not initialized');

    // Customers table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        remote_id INTEGER UNIQUE,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        address TEXT,
        stateName TEXT,
        districtName TEXT,
        country TEXT DEFAULT 'india',
        pincode TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        synced INTEGER DEFAULT 0
      )
    `);

    // Products table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sku TEXT NOT NULL UNIQUE,
        prod_id TEXT NOT NULL,
        variation_id TEXT NOT NULL,
        category_id TEXT NOT NULL,
        category_name TEXT NOT NULL,
        name TEXT NOT NULL,
        price DECIMAL(10, 2) NOT NULL CHECK(price > 0),
        stock INTEGER DEFAULT 0,
        synced INTEGER DEFAULT 0
      )
    `);

    // Orders table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id TEXT NOT NULL UNIQUE,
        customer_id INTEGER NOT NULL,
        status TEXT CHECK (status IN ('pending', 'completed')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        synced INTEGER DEFAULT 0,
        FOREIGN KEY (customer_id) REFERENCES customers(id)
      )
    `);

    // Invoices table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_id TEXT NOT NULL UNIQUE,
        cust_id INTEGER NOT NULL,
        status TEXT CHECK (status IN ('unpaid', 'paid')),
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        total_amount DECIMAL(12, 2) NOT NULL,
        add_on DECIMAL(10, 2) DEFAULT 0,
        discount DECIMAL(10, 2) DEFAULT 0,
        narration TEXT,
        transport TEXT,
        nugs INTEGER DEFAULT 0,
        place_of_supply TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        synced INTEGER DEFAULT 0,
        FOREIGN KEY (cust_id) REFERENCES customers(id)
      )
    `);

    // Invoice items table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS invoice_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_id INTEGER NOT NULL,
        sku TEXT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        qty INTEGER NOT NULL CHECK (qty > 0),
        synced INTEGER DEFAULT 0,
        FOREIGN KEY (invoice_id) REFERENCES invoices(id),
        FOREIGN KEY (sku) REFERENCES products(sku)
      )
    `);

    // Transactions table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transaction_id TEXT NOT NULL UNIQUE,
        invoice_id INTEGER NOT NULL,
        transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        amount DECIMAL(12, 2) NOT NULL,
        transaction_type TEXT CHECK (transaction_type IN ('payment', 'refund', 'adjustment')),
        status TEXT CHECK (status IN ('pending', 'completed', 'failed')),
        narration TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        synced INTEGER DEFAULT 0,
        FOREIGN KEY (invoice_id) REFERENCES invoices(id)
      )
    `);

    // Sync status table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sync_status (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entity TEXT NOT NULL,
        last_sync TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status TEXT CHECK (status IN ('success', 'failed')),
        error TEXT
      )
    `);
  }

  private initializeDefaultData(): void {
    if (!this.db) throw new Error('Database not initialized');

    // Add a sample customer
    this.db.prepare(`
      INSERT INTO customers (name, email, phone, address, stateName, districtName)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run('Demo Customer', 'demo@example.com', '1234567890', '123 Main St', 'Demo State', 'Demo District');

    // Add a sample product
    this.db.prepare(`
      INSERT INTO products (sku, prod_id, variation_id, category_id, category_name, name, price, stock)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run('DEMO-001', 'prod1', 'var1', 'cat1', 'Demo Category', 'Demo Product', 100.0, 10);
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