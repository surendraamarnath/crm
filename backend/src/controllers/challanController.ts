import { Response } from 'express';
import { pool } from '../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { AuthRequest } from '../types/auth';

// Generate challan number: CHN-YYYYMMDD-XXXX
const generateChallanNumber = async (): Promise<string> => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT COUNT(*) as count FROM challans WHERE challan_number LIKE ?",
    [`CHN-${date}-%`]
  );
  const count = rows[0].count + 1;
  return `CHN-${date}-${String(count).padStart(4, '0')}`;
};

export const getChallans = async (req: AuthRequest, res: Response) => {
  const { status, search } = req.query;
  let query = `SELECT c.*, cu.name as customer_name_live FROM challans c
    JOIN customers cu ON c.customer_id = cu.id`;
  const params: any[] = [];
  const conditions: string[] = [];
  if (status) { conditions.push('c.status = ?'); params.push(status); }
  if (search) {
    conditions.push('(c.challan_number LIKE ? OR c.customer_name LIKE ? OR c.customer_business LIKE ?)');
    const s = `%${search}%`;
    params.push(s, s, s);
  }
  if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
  query += ' ORDER BY c.id DESC';
  const [rows] = await pool.query<RowDataPacket[]>(query, params);
  res.json(rows);
};

export const getChallanById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const [challans] = await pool.query<RowDataPacket[]>('SELECT * FROM challans WHERE id=?', [id]);
  if (challans.length === 0) { res.status(404).json({ error: 'Challan not found' }); return; }
  const [items] = await pool.query<RowDataPacket[]>('SELECT * FROM challan_items WHERE challan_id=?', [id]);
  res.json({ ...challans[0], items });
};

export const createChallan = async (req: AuthRequest, res: Response) => {
  const { customer_id, items, status = 'Draft', notes } = req.body;
  const created_by = req.user?.email || 'unknown';

  // Validate items
  if (!items || items.length === 0) { res.status(400).json({ error: 'At least one product is required' }); return; }

  // Get customer snapshot
  const [customers] = await pool.query<RowDataPacket[]>('SELECT * FROM customers WHERE id=?', [customer_id]);
  if (customers.length === 0) { res.status(404).json({ error: 'Customer not found' }); return; }
  const customer = customers[0];

  // Validate stock for each product if confirming
  if (status === 'Confirmed') {
    for (const item of items) {
      const [products] = await pool.query<RowDataPacket[]>('SELECT * FROM products WHERE id=?', [item.product_id]);
      if (products.length === 0) { res.status(404).json({ error: `Product ID ${item.product_id} not found` }); return; }
      if (products[0].current_stock < item.quantity) {
        res.status(400).json({ error: `Insufficient stock for "${products[0].name}". Available: ${products[0].current_stock}, Requested: ${item.quantity}` });
        return;
      }
    }
  }

  const challan_number = await generateChallanNumber();
  let total_quantity = 0;
  let total_amount = 0;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Insert challan
    const [result] = await conn.query<ResultSetHeader>(
      `INSERT INTO challans (challan_number, customer_id, customer_name, customer_mobile, customer_business, total_quantity, total_amount, status, created_by, notes)
       VALUES (?, ?, ?, ?, ?, 0, 0, ?, ?, ?)`,
      [challan_number, customer_id, customer.name, customer.mobile, customer.business_name || null, status, created_by, notes || null]
    );
    const challan_id = result.insertId;

    // Insert items with product snapshot
    for (const item of items) {
      const [products] = await conn.query<RowDataPacket[]>('SELECT * FROM products WHERE id=?', [item.product_id]);
      const product = products[0];
      const itemTotal = product.unit_price * item.quantity;
      total_quantity += item.quantity;
      total_amount += itemTotal;

      await conn.query(
        `INSERT INTO challan_items (challan_id, product_id, product_name, product_sku, unit_price, quantity, total)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [challan_id, product.id, product.name, product.sku, product.unit_price, item.quantity, itemTotal]
      );

      // Deduct stock if confirmed
      if (status === 'Confirmed') {
        await conn.query('UPDATE products SET current_stock = current_stock - ? WHERE id=?', [item.quantity, product.id]);
        await conn.query(
          'INSERT INTO stock_movements (product_id, quantity, movement_type, reason, created_by) VALUES (?, ?, ?, ?, ?)',
          [product.id, item.quantity, 'OUT', `Challan ${challan_number}`, created_by]
        );
      }
    }

    // Update totals
    await conn.query('UPDATE challans SET total_quantity=?, total_amount=? WHERE id=?', [total_quantity, total_amount, challan_id]);
    await conn.commit();
    res.status(201).json({ id: challan_id, challan_number, status, total_quantity, total_amount });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

export const updateChallanStatus = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const created_by = req.user?.email || 'unknown';

  const [challans] = await pool.query<RowDataPacket[]>('SELECT * FROM challans WHERE id=?', [id]);
  if (challans.length === 0) { res.status(404).json({ error: 'Challan not found' }); return; }
  const challan = challans[0];

  if (challan.status === 'Cancelled') { res.status(400).json({ error: 'Cannot update a cancelled challan' }); return; }
  if (challan.status === 'Confirmed' && status === 'Draft') { res.status(400).json({ error: 'Cannot revert confirmed challan to draft' }); return; }

  const [items] = await pool.query<RowDataPacket[]>('SELECT * FROM challan_items WHERE challan_id=?', [id]);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Confirming from Draft — validate and deduct stock
    if (status === 'Confirmed' && challan.status === 'Draft') {
      for (const item of items) {
        const [products] = await conn.query<RowDataPacket[]>('SELECT * FROM products WHERE id=?', [item.product_id]);
        if (products[0].current_stock < item.quantity) {
          await conn.rollback();
          res.status(400).json({ error: `Insufficient stock for "${item.product_name}". Available: ${products[0].current_stock}` });
          return;
        }
        await conn.query('UPDATE products SET current_stock = current_stock - ? WHERE id=?', [item.quantity, item.product_id]);
        await conn.query(
          'INSERT INTO stock_movements (product_id, quantity, movement_type, reason, created_by) VALUES (?, ?, ?, ?, ?)',
          [item.product_id, item.quantity, 'OUT', `Challan ${challan.challan_number}`, created_by]
        );
      }
    }

    // Cancelling a Confirmed challan — restore stock
    if (status === 'Cancelled' && challan.status === 'Confirmed') {
      for (const item of items) {
        await conn.query('UPDATE products SET current_stock = current_stock + ? WHERE id=?', [item.quantity, item.product_id]);
        await conn.query(
          'INSERT INTO stock_movements (product_id, quantity, movement_type, reason, created_by) VALUES (?, ?, ?, ?, ?)',
          [item.product_id, item.quantity, 'IN', `Cancelled Challan ${challan.challan_number}`, created_by]
        );
      }
    }

    await conn.query('UPDATE challans SET status=? WHERE id=?', [status, id]);
    await conn.commit();
    res.json({ id: Number(id), status });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};
