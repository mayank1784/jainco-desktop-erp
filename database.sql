CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  fs_cust_id VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(15),
  address TEXT,
  stateName VARCHAR(100),
  districtName VARCHAR(100),
  country VARCHAR(100) DEFAULT 'india',
  pincode VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  synced BOOLEAN DEFAULT FALSE 
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  fs_sku VARCHAR(50) NOT NULL UNIQUE,
  fs_prod_id VARCHAR(50) NOT NULL UNIQUE,
  fs_variation_id VARCHAR(50) NOT NULL UNIQUE,
  fs_category_id VARCHAR(50) NOT NULL UNIQUE,
  category_name VARCHAR(255) NOT NULL,
  prod_name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL CHECK(price>0.0),
  stock INT DEFAULT 0,
  synced BOOLEAN DEFAULT FALSE 
 
);

-- {
--   "customerId": "string",              // Firestore document ID of the customer
--   "status": "pending" | "completed",   // Order status
--   "items": [                           // Array of order items
--     {
--       "sku": "string",                 // SKU of the product
--       "price": 250.00,                 // Price of the product
--       "qty": 5                         // Quantity of the product
--     }
--   ],
--   "created_at": "timestamp",           // Timestamp when the order was created
--   "updated_at": "timestamp"            // Timestamp when the order was last updated
-- }

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,                     -- Internal order ID
  order_id TEXT NOT NULL UNIQUE,             -- Firestore document ID for reference
  fs_customer_id INT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'completed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,                     -- Internal item ID
  order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE, -- Links to orders table
  fs_sku VARCHAR(50) NOT NULL REFERENCES products(fs_sku),                  -- SKU of the product
  price DECIMAL(10, 2) NOT NULL,             -- Price of the product
  qty INT NOT NULL CHECK (qty > 0),          -- Quantity of the product
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE invoices (
  id SERIAL PRIMARY KEY,
  invoice_id TEXT NOT NULL UNIQUE,
  cust_id INT REFERENCES customers(id) ON DELETE CASCADE,
  status VARCHAR(10) NOT NULL CHECK (status IN ('unpaid', 'paid')),
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total_amount DECIMAL(12, 2) NOT NULL,
  add_on DECIMAL(10, 2) DEFAULT 0.0,
  discount DECIMAL(10, 2) DEFAULT 0.0,
  narration TEXT,
  net_amount DECIMAL(12, 2) GENERATED ALWAYS AS (total_amount + add_on - discount) STORED,
  transport VARCHAR(255),
  nugs INT DEFAULT 0,
  place_of_supply VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE invoice_items (
  id SERIAL PRIMARY KEY,
  invoice_id INT REFERENCES invoices(id) ON DELETE CASCADE,
  item_id INT REFERENCES products(id),
  sku VARCHAR(50) REFERENCES products(fs_sku),
  price DECIMAL(10, 2) NOT NULL,
  qty INT NOT NULL CHECK (qty > 0),
  amount DECIMAL(12, 2) GENERATED ALWAYS AS (price * qty) STORED
);

CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  transaction_id TEXT NOT NULL UNIQUE,
  invoice_id INT REFERENCES invoices(id) ON DELETE CASCADE,  -- Reference to the invoice being paid or adjusted
  payment_method INT REFERENCES payment_methods(id) ON DELETE SET NULL,
  transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,       -- Date of transaction
  amount DECIMAL(12, 2) NOT NULL,                             -- Amount paid or adjusted
  transaction_type VARCHAR(50) CHECK (transaction_type IN ('payment', 'refund', 'adjustment')), -- Type of transaction
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'completed', 'failed')), -- Payment status
  narration TEXT,                                             -- Additional notes or description
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP              -- Timestamp for transaction creation
);

CREATE TABLE payment_methods(
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  ac_no VARCHAR(50) NOT NULL,
)