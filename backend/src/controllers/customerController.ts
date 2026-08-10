import { Request, Response } from 'express';
import { pool } from '../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { AuthRequest } from '../types/auth';

export const getCustomers = async (req: Request, res: Response) => {
  const { search } = req.query;
  let query = 'SELECT * FROM customers';
  const params: string[] = [];
  if (search) {
    query += ' WHERE name LIKE ? OR mobile LIKE ? OR email LIKE ? OR business_name LIKE ?';
    const s = `%${search}%`;
    params.push(s, s, s, s);
  }
  query += ' ORDER BY id DESC';
  const [rows] = await pool.query<RowDataPacket[]>(query, params);
  res.json(rows);
};

export const getCustomerById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM customers WHERE id=?', [id]);
  if (rows.length === 0) { res.status(404).json({ error: 'Customer not found' }); return; }
  const [followups] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM customer_followups WHERE customer_id=? ORDER BY created_at DESC', [id]
  );
  res.json({ ...rows[0], followups });
};

export const createCustomer = async (req: Request, res: Response) => {
  const { name, mobile, email, business_name, gst_number, customer_type, address, status, followup_date, notes } = req.body;
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO customers (name, mobile, email, business_name, gst_number, customer_type, address, status, followup_date, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, mobile, email || null, business_name || null, gst_number || null, customer_type, address || null, status, followup_date || null, notes || null]
  );
  res.status(201).json({ id: result.insertId, ...req.body });
};

export const updateCustomer = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, mobile, email, business_name, gst_number, customer_type, address, status, followup_date, notes } = req.body;
  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE customers SET name=?, mobile=?, email=?, business_name=?, gst_number=?, customer_type=?, address=?, status=?, followup_date=?, notes=? WHERE id=?`,
    [name, mobile, email || null, business_name || null, gst_number || null, customer_type, address || null, status, followup_date || null, notes || null, id]
  );
  if (result.affectedRows === 0) { res.status(404).json({ error: 'Customer not found' }); return; }
  res.json({ id: Number(id), ...req.body });
};

export const deleteCustomer = async (req: Request, res: Response) => {
  const { id } = req.params;
  const [result] = await pool.query<ResultSetHeader>('DELETE FROM customers WHERE id=?', [id]);
  if (result.affectedRows === 0) { res.status(404).json({ error: 'Customer not found' }); return; }
  res.json({ message: 'Deleted successfully' });
};

export const addFollowup = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { note } = req.body;
  const created_by = req.user?.email || 'unknown';
  const [result] = await pool.query<ResultSetHeader>(
    'INSERT INTO customer_followups (customer_id, note, created_by) VALUES (?, ?, ?)',
    [id, note, created_by]
  );
  res.status(201).json({ id: result.insertId, customer_id: Number(id), note, created_by });
};
