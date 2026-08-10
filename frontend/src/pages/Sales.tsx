import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { challanApi, customersApi, productsApi } from '../api';
import { useAuth } from '../context/AuthContext';

interface Challan {
  id: number; challan_number: string; customer_name: string;
  customer_business: string; total_quantity: number; total_amount: number;
  status: string; created_by: string; created_at: string;
}
interface Customer { id: number; name: string; mobile: string; business_name: string; }
interface Product { id: number; name: string; sku: string; unit_price: number; current_stock: number; }
interface ChallanItem { product_id: number; product: Product; quantity: number; }

const STATUS_COLOR: Record<string, { bg: string; color: string }> = {
  Draft:     { bg: '#fff8e1', color: '#f39c12' },
  Confirmed: { bg: '#e8fdf0', color: '#27ae60' },
  Cancelled: { bg: '#fde8ec', color: '#e94560' },
};

export default function Sales() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canCreate = user?.role === 'Admin' || user?.role === 'Sales';

  const [challans, setChallans] = useState<Challan[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState<ChallanItem[]>([]);
  const [notes, setNotes] = useState('');
  const [saveStatus, setSaveStatus] = useState<'Draft' | 'Confirmed'>('Draft');
  const [error, setError] = useState('');

  const load = () => challanApi.getAll({ status: filterStatus, search }).then(r => setChallans(r.data));
  useEffect(() => { load(); }, [filterStatus, search]);
  useEffect(() => {
    customersApi.getAll().then(r => setCustomers(r.data));
    productsApi.getAll().then(r => setProducts(r.data));
  }, []);

  const openModal = () => {
    setCustomerId(''); setItems([]); setNotes(''); setSaveStatus('Draft'); setError('');
    setShowModal(true);
  };

  const addItem = () => {
    if (products.length === 0) return;
    const available = products.filter(p => !items.find(i => i.product_id === p.id));
    if (available.length === 0) return;
    const p = available[0];
    setItems([...items, { product_id: p.id, product: p, quantity: 1 }]);
  };

  const updateItem = (index: number, field: 'product_id' | 'quantity', value: string) => {
    const updated = [...items];
    if (field === 'product_id') {
      const p = products.find(p => p.id === Number(value));
      if (p) updated[index] = { product_id: p.id, product: p, quantity: updated[index].quantity };
    } else {
      updated[index].quantity = Number(value);
    }
    setItems(updated);
  };

  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  const totalAmount = items.reduce((sum, i) => sum + i.product.unit_price * i.quantity, 0);
  const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);

  const submit = async (status: 'Draft' | 'Confirmed') => {
    setError('');
    if (!customerId) { setError('Please select a customer'); return; }
    if (items.length === 0) { setError('Please add at least one product'); return; }
    try {
      await challanApi.create({
        customer_id: Number(customerId),
        items: items.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
        status, notes,
      });
      setShowModal(false); load();
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Error');
    }
  };

  const updateStatus = async (id: number, status: string) => {
    if (!confirm(`Change status to ${status}?`)) return;
    try {
      await challanApi.updateStatus(id, status); load();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Sales Challans</h2>
        {canCreate && <button className="btn-primary" onClick={openModal}>+ New Challan</button>}
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '0.75rem 1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <input
          placeholder="🔍 Search challan, customer..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.9rem', minWidth: 200 }}
        />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ flex: 'none', width: 'auto' }}>
          <option value="">All Status</option>
          <option>Draft</option><option>Confirmed</option><option>Cancelled</option>
        </select>
      </div>

      {/* Challan Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table>
          <thead>
            <tr><th>Challan #</th><th>Customer</th><th>Qty</th><th>Amount</th><th>Status</th><th>Created By</th><th>Date</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {challans.length === 0 && (
              <tr><td colSpan={8} style={{ textAlign: 'center', color: '#aaa', padding: '2rem' }}>No challans found</td></tr>
            )}
            {challans.map(c => (
              <tr key={c.id}>
                <td>
                  <span style={{ color: '#e94560', cursor: 'pointer', fontWeight: 600 }}
                    onClick={() => navigate(`/challans/${c.id}`)}>
                    {c.challan_number}
                  </span>
                </td>
                <td>
                  <div style={{ fontWeight: 500 }}>{c.customer_name}</div>
                  {c.customer_business && <div style={{ fontSize: '0.78rem', color: '#888' }}>{c.customer_business}</div>}
                </td>
                <td>{c.total_quantity}</td>
                <td>₹{Number(c.total_amount).toFixed(2)}</td>
                <td>
                  <span className="tag" style={{ background: STATUS_COLOR[c.status].bg, color: STATUS_COLOR[c.status].color }}>
                    {c.status}
                  </span>
                </td>
                <td style={{ fontSize: '0.82rem', color: '#666' }}>{c.created_by}</td>
                <td style={{ fontSize: '0.82rem', color: '#666' }}>{new Date(c.created_at).toLocaleDateString()}</td>
                <td className="actions">
                  <button className="btn-edit" onClick={() => navigate(`/challans/${c.id}`)}>View</button>
                  {canCreate && c.status === 'Draft' && (
                    <button className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }}
                      onClick={() => updateStatus(c.id, 'Confirmed')}>Confirm</button>
                  )}
                  {canCreate && c.status !== 'Cancelled' && (
                    <button className="btn-danger" style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }}
                      onClick={() => updateStatus(c.id, 'Cancelled')}>Cancel</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Challan Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: '700px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>New Sales Challan</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-form">

              {/* Customer */}
              <div className="form-group">
                <label>Customer *</label>
                <select value={customerId} onChange={e => setCustomerId(e.target.value)} required>
                  <option value="">Select Customer</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} {c.business_name ? `— ${c.business_name}` : ''}</option>
                  ))}
                </select>
              </div>

              {/* Products */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ fontWeight: 600, fontSize: '0.85rem', color: '#555' }}>Products *</label>
                <button type="button" className="btn-edit" style={{ fontSize: '0.8rem', padding: '0.25rem 0.7rem' }} onClick={addItem}>+ Add Product</button>
              </div>

              {items.length === 0 && (
                <div style={{ background: '#f8f9fa', borderRadius: 8, padding: '1rem', textAlign: 'center', color: '#aaa', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                  Click "+ Add Product" to add items
                </div>
              )}

              {items.map((item, i) => (
                <div key={i} className="challan-item-row">
                  <select
                    value={item.product_id}
                    onChange={e => updateItem(i, 'product_id', e.target.value)}
                    style={{ flex: 2 }}
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id} disabled={!!items.find((it, idx) => idx !== i && it.product_id === p.id)}>
                        {p.name} (Stock: {p.current_stock})
                      </option>
                    ))}
                  </select>
                  <div style={{ flex: 1, textAlign: 'center', fontSize: '0.85rem', color: '#666' }}>
                    ₹{item.product.unit_price}
                  </div>
                  <input
                    type="number" min="1" max={item.product.current_stock}
                    value={item.quantity}
                    onChange={e => updateItem(i, 'quantity', e.target.value)}
                    style={{ flex: 1, textAlign: 'center' }}
                  />
                  <div style={{ flex: 1, textAlign: 'right', fontWeight: 600, fontSize: '0.9rem' }}>
                    ₹{(item.product.unit_price * item.quantity).toFixed(2)}
                  </div>
                  <button type="button" onClick={() => removeItem(i)}
                    style={{ background: 'none', border: 'none', color: '#e94560', cursor: 'pointer', fontSize: '1.1rem', padding: '0 0.25rem' }}>✕</button>
                </div>
              ))}

              {/* Totals */}
              {items.length > 0 && (
                <div className="challan-totals">
                  <div>Total Qty: <strong>{totalQty}</strong></div>
                  <div>Total Amount: <strong>₹{totalAmount.toFixed(2)}</strong></div>
                </div>
              )}

              {/* Notes */}
              <div className="form-group">
                <label>Notes</label>
                <textarea placeholder="Optional notes..." value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
              </div>

              {error && <p className="error">{error}</p>}

              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="button" onClick={() => submit('Draft')}
                  style={{ background: '#f39c12', color: 'white', border: 'none', borderRadius: 6, padding: '0.5rem 1.2rem', cursor: 'pointer' }}>
                  Save as Draft
                </button>
                <button type="button" className="btn-primary" onClick={() => submit('Confirmed')}>
                  Confirm Challan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
