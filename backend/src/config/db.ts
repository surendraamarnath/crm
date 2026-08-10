import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

export const initDB = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('Admin','Sales','Warehouse','Accounts') NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS customers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      mobile VARCHAR(20) NOT NULL,
      email VARCHAR(100),
      business_name VARCHAR(150),
      gst_number VARCHAR(20),
      customer_type ENUM('Retail','Wholesale','Distributor') NOT NULL DEFAULT 'Retail',
      address TEXT,
      status ENUM('Lead','Active','Inactive') NOT NULL DEFAULT 'Lead',
      followup_date DATE,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS customer_followups (
      id INT AUTO_INCREMENT PRIMARY KEY,
      customer_id INT NOT NULL,
      note TEXT NOT NULL,
      created_by VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS employees (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      role VARCHAR(50),
      salary DECIMAL(10,2),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      sku VARCHAR(50) UNIQUE NOT NULL,
      category VARCHAR(100),
      unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
      current_stock INT NOT NULL DEFAULT 0,
      min_stock INT NOT NULL DEFAULT 0,
      location VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS stock_movements (
      id INT AUTO_INCREMENT PRIMARY KEY,
      product_id INT NOT NULL,
      quantity INT NOT NULL,
      movement_type ENUM('IN','OUT') NOT NULL,
      reason VARCHAR(255),
      created_by VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS challans (
      id INT AUTO_INCREMENT PRIMARY KEY,
      challan_number VARCHAR(50) UNIQUE NOT NULL,
      customer_id INT NOT NULL,
      customer_name VARCHAR(100) NOT NULL,
      customer_mobile VARCHAR(20),
      customer_business VARCHAR(150),
      total_quantity INT NOT NULL DEFAULT 0,
      total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
      status ENUM('Draft','Confirmed','Cancelled') NOT NULL DEFAULT 'Draft',
      created_by VARCHAR(100),
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS challan_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      challan_id INT NOT NULL,
      product_id INT NOT NULL,
      product_name VARCHAR(100) NOT NULL,
      product_sku VARCHAR(50) NOT NULL,
      unit_price DECIMAL(10,2) NOT NULL,
      quantity INT NOT NULL,
      total DECIMAL(10,2) NOT NULL,
      FOREIGN KEY (challan_id) REFERENCES challans(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);
  console.log('Database initialized');

  const defaultUsers = [
    { name: 'Admin User',     email: 'admin@erp.com',     password: 'admin123',     role: 'Admin' },
    { name: 'Sales User',     email: 'sales@erp.com',     password: 'sales123',     role: 'Sales' },
    { name: 'Warehouse User', email: 'warehouse@erp.com', password: 'warehouse123', role: 'Warehouse' },
    { name: 'Accounts User',  email: 'accounts@erp.com',  password: 'accounts123',  role: 'Accounts' },
  ];

  for (const u of defaultUsers) {
    const [rows] = await pool.query<mysql.RowDataPacket[]>('SELECT id FROM users WHERE email = ?', [u.email]);
    if (rows.length === 0) {
      const hash = await bcrypt.hash(u.password, 10);
      await pool.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [u.name, u.email, hash, u.role]);
      console.log(`Created ${u.role} user: ${u.email} / ${u.password}`);
    }
  }
};
