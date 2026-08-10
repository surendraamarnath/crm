import { Request, Response } from 'express';
import { pool } from '../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export const getEmployees = async (req: Request, res: Response) => {
  const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM employees ORDER BY id DESC');
  res.json(rows);
};

export const createEmployee = async (req: Request, res: Response) => {
  const { name, email, role, salary } = req.body;
  const [result] = await pool.query<ResultSetHeader>(
    'INSERT INTO employees (name, email, role, salary) VALUES (?, ?, ?, ?)',
    [name, email, role, salary]
  );
  res.status(201).json({ id: result.insertId, name, email, role, salary });
};

export const updateEmployee = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, role, salary } = req.body;
  const [result] = await pool.query<ResultSetHeader>(
    'UPDATE employees SET name=?, email=?, role=?, salary=? WHERE id=?',
    [name, email, role, salary, id]
  );
  if (result.affectedRows === 0) { res.status(404).json({ error: 'Employee not found' }); return; }
  res.json({ id: Number(id), name, email, role, salary });
};

export const deleteEmployee = async (req: Request, res: Response) => {
  const { id } = req.params;
  const [result] = await pool.query<ResultSetHeader>('DELETE FROM employees WHERE id=?', [id]);
  if (result.affectedRows === 0) { res.status(404).json({ error: 'Employee not found' }); return; }
  res.json({ message: 'Deleted successfully' });
};
