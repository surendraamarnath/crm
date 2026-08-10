import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsApi } from '../api';
import { useAuth } from '../context/AuthContext';

interface Movement {
  id: number; quantity: number; movement_type: 'IN' | 'OUT';
  reason: string; created_by: string; created_at: string;
}
interface Product {
  id: number; name: string; sku: string; category: string;
  unit_price: number; current_stock: number; min_stock: number;
  location: string; movements: Movement[];
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canEdit = user?.role === 'Admin' || user?.role === 'Warehouse';

  const [product, setProduct] = useState<Product | null>(null);
  const [showMovement, setShowMovement] = useState(false);
  const [form, setForm] = useState({ quantity: '', movement_type: 'IN', reason: '' });
  const [error, setError] = useState('');

  const load = () => productsApi.getById(Number(id)).then(r => setProduct(r.data));
  useEffect(() => { load(); }, [id]);

  const submitMovement = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    try {
      await productsApi.addMovement(Number(id), form);
      setForm({ quantity: '', movement_type: 'IN', reason: '' });
      setShowMovement(false); load();
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Error');
    }
  };

  if (!product) return <div style={{ padding: '2rem' }}>Loading...</div>;

  const isLow = product.current_stock <= product.min_stock && product.min_stock > 0;

  return (
    <div>
      <button onClick={() => navigate('/products')} className="btn-back">← Back to Inventory</button>

      {/* Header */}
      <div className="detail-header card">
        <div className="detail-avatar" style={{ background: '#27ae60', borderRadius: 10, fontSize: '1.2rem' }}>📦</div>
        <div className="detail-info" style={{ flex: 1 }}>
          <h2>{product.name}</h2>
          <code style={{ background: '#f4f6f9', padding: '0.15rem 0.5rem', borderRadius: 4, fontSize: '0.85rem' }}>{product.sku}</code>
          {product.category && <span style={{ marginLeft: '0.5rem', color: '#888', fontSize: '0.85rem' }}>{product.category}</span>}
        </div>
        {canEdit && (
          <button className="btn-primary" onClick={() => setShowMovement(true)}>+ Stock Movement</button>
        )}
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Current Stock</div>
          <div className="stat-value" style={{ color: isLow ? '#e74c3c' : '#27ae60' }}>
            {product.current_stock}
            {isLow && <span style={{ fontSize: '0.9rem', marginLeft: '0.4rem' }}>⚠ Low</span>}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Min Stock Alert</div>
          <div className="stat-value" style={{ color: '#e67e22' }}>{product.min_stock}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Unit Price</div>
          <div className="stat-value">₹{Number(product.unit_price).toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Stock Value</div>
          <div className="stat-value">₹{(product.current_stock * Number(product.unit_price)).toFixed(2)}</div>
        </div>
      </div>

      {/* Info */}
      <div className="detail-grid">
        <div className="card">
          <h4 className="section-title">Product Info</h4>
          <div className="detail-row"><span>📦 SKU</span><strong>{product.sku}</strong></div>
          <div className="detail-row"><span>🏷 Category</span><strong>{product.category || '—'}</strong></div>
          <div className="detail-row"><span>📍 Location</span><strong>{product.location || '—'}</strong></div>
        </div>
        <div className="card">
          <h4 className="section-title">Stock Summary</h4>
          <div className="detail-row"><span>Total IN</span><strong style={{ color: '#27ae60' }}>
            {product.movements.filter(m => m.movement_type === 'IN').reduce((s, m) => s + m.quantity, 0)}
          </strong></div>
          <div className="detail-row"><span>Total OUT</span><strong style={{ color: '#e74c3c' }}>
            {product.movements.filter(m => m.movement_type === 'OUT').reduce((s, m) => s + m.quantity, 0)}
          </strong></div>
          <div className="detail-row"><span>Movements</span><strong>{product.movements.length}</strong></div>
        </div>
      </div>

      {/* Stock Movement Log */}
      <div className="card">
        <h4 className="section-title">Stock Movement Log</h4>
        {product.movements.length === 0 && <p style={{ color: '#aaa', fontSize: '0.9rem' }}>No movements yet.</p>}
        <table>
          <thead>
            <tr><th>Type</th><th>Quantity</th><th>Reason</th><th>Created By</th><th>Date</th></tr>
          </thead>
          <tbody>
            {product.movements.map(m => (
              <tr key={m.id}>
                <td>
                  <span className="tag" style={{
                    background: m.movement_type === 'IN' ? '#e8fdf0' : '#fde8ec',
                    color: m.movement_type === 'IN' ? '#27ae60' : '#e94560',
                  }}>
                    {m.movement_type === 'IN' ? '▲ IN' : '▼ OUT'}
                  </span>
                </td>
                <td style={{ fontWeight: 600 }}>{m.quantity}</td>
                <td>{m.reason || '—'}</td>
                <td style={{ fontSize: '0.85rem', color: '#666' }}>{m.created_by}</td>
                <td style={{ fontSize: '0.85rem', color: '#666' }}>{new Date(m.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Stock Movement Modal */}
      {showMovement && (
        <div className="modal-overlay" onClick={() => setShowMovement(false)}>
          <div className="modal" style={{ maxWidth: '420px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Stock Movement</h3>
              <button className="modal-close" onClick={() => setShowMovement(false)}>✕</button>
            </div>
            <form onSubmit={submitMovement} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Movement Type *</label>
                  <select value={form.movement_type} onChange={e => setForm({ ...form, movement_type: e.target.value })}>
                    <option value="IN">▲ Stock IN</option>
                    <option value="OUT">▼ Stock OUT</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Quantity *</label>
                  <input type="number" min="1" placeholder="0" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label>Reason</label>
                <input placeholder="e.g. Purchase order, Sale, Damage..." value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} />
              </div>
              <div style={{ background: '#f8f9fa', borderRadius: 8, padding: '0.75rem', fontSize: '0.85rem', color: '#555' }}>
                Current Stock: <strong>{product.current_stock}</strong> →{' '}
                <strong style={{ color: form.movement_type === 'IN' ? '#27ae60' : '#e74c3c' }}>
                  {form.movement_type === 'IN'
                    ? product.current_stock + (Number(form.quantity) || 0)
                    : product.current_stock - (Number(form.quantity) || 0)}
                </strong>
              </div>
              {error && <p className="error">{error}</p>}
              <div className="modal-footer">
                <button type="button" onClick={() => setShowMovement(false)}>Cancel</button>
                <button type="submit" className="btn-primary"
                  style={{ background: form.movement_type === 'IN' ? '#27ae60' : '#e94560' }}>
                  Confirm {form.movement_type}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
