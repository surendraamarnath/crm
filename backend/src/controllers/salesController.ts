import { Request, Response } from 'express';
import { pool } from '../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export const getSales = async (req: Request, res: Response) => {
  const [rows] = await pool.query<RowDataPacket[]>(`
    SELECT s.id, c.name AS customer, p.name AS product, s.quantity, s.total, s.created_at
    FROM sales s
    JOIN customers c ON s.customer_id = c.id
    JOIN products p ON s.product_id = p.id
    ORDER BY s.id DESC
  `);
  res.json(rows);
};

export const createSale = async (req: Request, res: Response) => {
  const { customer_id, product_id, quantity } = req.body;
  const [products] = await pool.query<RowDataPacket[]>('SELECT * FROM products WHERE id=?', [product_id]);
  if (products.length === 0) { res.status(404).json({ error: 'Product not found' }); return; }
  const { price, quantity: stock } = products[0];
  if (stock < quantity) { res.status(400).json({ error: 'Insufficient stock' }); return; }
  const total = price * quantity;
  await pool.query('UPDATE products SET quantity = quantity - ? WHERE id=?', [quantity, product_id]);
  const [result] = await pool.query<ResultSetHeader>(
    'INSERT INTO sales (customer_id, product_id, quantity, total) VALUES (?, ?, ?, ?)',
    [customer_id, product_id, quantity, total]
  );
  res.status(201).json({ id: result.insertId, customer_id, product_id, quantity, total });
};
