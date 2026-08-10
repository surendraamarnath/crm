import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM users WHERE email = ?', [email]);
  if (rows.length === 0) { res.status(401).json({ error: 'Invalid credentials' }); return; }
  const user = rows[0];
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) { res.status(401).json({ error: 'Invalid credentials' }); return; }
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: '8h' }
  );
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
};

export const signup = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;
  const [existing] = await pool.query<RowDataPacket[]>('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length > 0) { res.status(400).json({ error: 'Email already registered' }); return; }
  const hash = await bcrypt.hash(password, 10);
  const [result] = await pool.query<ResultSetHeader>(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    [name, email, hash, role]
  );
  const token = jwt.sign(
    { id: result.insertId, email, role },
    process.env.JWT_SECRET!,
    { expiresIn: '8h' }
  );
  res.status(201).json({ token, user: { id: result.insertId, name, email, role } });
};

export const getUsers = async (req: Request, res: Response) => {
  const [rows] = await pool.query<RowDataPacket[]>('SELECT id, name, email, role, created_at FROM users ORDER BY id DESC');
  res.json(rows);
};

export const createUser = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;
  const hash = await bcrypt.hash(password, 10);
  const [result] = await pool.query<ResultSetHeader>(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    [name, email, hash, role]
  );
  res.status(201).json({ id: result.insertId, name, email, role });
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const [result] = await pool.query<ResultSetHeader>('DELETE FROM users WHERE id = ?', [id]);
  if (result.affectedRows === 0) { res.status(404).json({ error: 'User not found' }); return; }
  res.json({ message: 'User deleted' });
};
