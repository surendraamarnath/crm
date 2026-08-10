import { Request, Response } from 'express';
import { pool } from '../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { AuthRequest } from '../types/auth';

export const getProducts = async (req: Request, res: Response) => {
  const { search } = req.query;
  let query = 'SELECT * FROM products';
  const params: string[] = [];
  if (search) {
    query += ' WHERE name LIKE ? OR sku LIKE ? OR category LIKE ? OR location LIKE ?';
    const s = `%${search}%`;
    params.push(s, s, s, s);
  }
  query += ' ORDER BY id DESC';
  const [rows] = await pool.query<RowDataPacket[]>(query, params);
  res.json(rows);
};

export const getProductById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM products WHERE id=?', [id]);
  if (rows.length === 0) { res.status(404).json({ error: 'Product not found' }); return; }
  const [movements] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM stock_movements WHERE product_id=? ORDER BY created_at DESC', [id]
  );
  res.json({ ...rows[0], movements });
};

export const createProduct = async (req: Request, res: Response) => {
  const { name, sku, category, unit_price, current_stock, min_stock, location } = req.body;
  const [result] = await pool.query<ResultSetHeader>(
    'INSERT INTO products (name, sku, category, unit_price, current_stock, min_stock, location) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [name, sku, category || null, unit_price, current_stock || 0, min_stock || 0, location || null]
  );
  // Log initial stock as IN movement if stock > 0
  if (Number(current_stock) > 0) {
    await pool.query(
      'INSERT INTO stock_movements (product_id, quantity, movement_type, reason, created_by) VALUES (?, ?, ?, ?, ?)',
      [result.insertId, current_stock, 'IN', 'Initial stock', (req as AuthRequest).user?.email || 'system']
    );
  }
  res.status(201).json({ id: result.insertId, ...req.body });
};

export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, sku, category, unit_price, min_stock, location } = req.body;
  const [result] = await pool.query<ResultSetHeader>(
    'UPDATE products SET name=?, sku=?, category=?, unit_price=?, min_stock=?, location=? WHERE id=?',
    [name, sku, category || null, unit_price, min_stock || 0, location || null, id]
  );
  if (result.affectedRows === 0) { res.status(404).json({ error: 'Product not found' }); return; }
  res.json({ id: Number(id), ...req.body });
};

export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const [result] = await pool.query<ResultSetHeader>('DELETE FROM products WHERE id=?', [id]);
  if (result.affectedRows === 0) { res.status(404).json({ error: 'Product not found' }); return; }
  res.json({ message: 'Deleted successfully' });
};

export const addStockMovement = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { quantity, movement_type, reason } = req.body;
  const created_by = req.user?.email || 'unknown';

  const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM products WHERE id=?', [id]);
  if (rows.length === 0) { res.status(404).json({ error: 'Product not found' }); return; }

  const current = rows[0].current_stock;
  const qty = Number(quantity);

  if (movement_type === 'OUT' && current < qty) {
    res.status(400).json({ error: `Insufficient stock. Available: ${current}` }); return;
  }

  const newStock = movement_type === 'IN' ? current + qty : current - qty;
  await pool.query('UPDATE products SET current_stock=? WHERE id=?', [newStock, id]);

  const [result] = await pool.query<ResultSetHeader>(
    'INSERT INTO stock_movements (product_id, quantity, movement_type, reason, created_by) VALUES (?, ?, ?, ?, ?)',
    [id, qty, movement_type, reason || null, created_by]
  );
  res.status(201).json({ id: result.insertId, product_id: Number(id), quantity: qty, movement_type, reason, created_by, new_stock: newStock });
};

export const getStockMovements = async (req: Request, res: Response) => {
  const [rows] = await pool.query<RowDataPacket[]>(`
    SELECT sm.*, p.name as product_name, p.sku
    FROM stock_movements sm
    JOIN products p ON sm.product_id = p.id
    ORDER BY sm.created_at DESC
    LIMIT 200
  `);
  res.json(rows);
};
