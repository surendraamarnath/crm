import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsApi } from '../api';
import { useAuth } from '../context/AuthContext';

interface Product {
  id: number; name: string; sku: string; category: string;
  unit_price: number; current_stock: number; min_stock: number; location: string;
}

const empty = { name: '', sku: '', category: '', unit_price: '', current_stock: '0', min_stock: '0', location: '' };

export default function Products() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canEdit = user?.role === 'Admin' || user?.role === 'Warehouse';

  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const load = (s = search) => productsApi.getAll(s).then(r => setProducts(r.data));
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(empty); setEditId(null); setError(''); setShowModal(true); };
  const openEdit = (p: Product) => {
    setForm({
      name: p.name, sku: p.sku, category: p.category || '',
      unit_price: String(p.unit_price), current_stock: String(p.current_stock),
      min_stock: String(p.min_stock), location: p.location || '',
    });
    setEditId(p.id); setError(''); setShowModal(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    try {
      if (editId) await productsApi.update(editId, form);
      else await productsApi.create(form);
      setShowModal(false); load();
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0]?.msg || err.response?.data?.error || 'Error');
    }
  };

  const del = async (id: number) => {
    if (!confirm('Delete this product?')) return;
    await productsApi.delete(id); load();
  };

  const lowStock = products.filter(p => p.current_stock <= p.min_stock && p.min_stock > 0);

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Inventory</h2>
        {canEdit && <button className="btn-primary" onClick={openAdd}>+ Add Product</button>}
      </div>

      {/* Low Stock Alert */}
      {lowStock.length > 0 && (
        <div className="alert-box">
          ⚠️ <strong>{lowStock.length} product{lowStock.length > 1 ? 's' : ''} low on stock:</strong>{' '}
          {lowStock.map(p => <span key={p.id} className="alert-tag">{p.name} ({p.current_stock})</span>)}
        </div>
      )}

      {/* Search */}
      <div className="card" style={{ padding: '0.75rem 1rem' }}>
        <input
          placeholder="🔍  Search by name, SKU, category, location..."
          value={search}
          onChange={e => { setSearch(e.target.value); load(e.target.value); }}
          style={{ width: '100%', border: 'none', outline: 'none', fontSize: '0.95rem' }}
        />
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>Product</th><th>SKU</th><th>Category</th>
              <th>Price</th><th>Stock</th><th>Location</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: '#aaa', padding: '2rem' }}>No products found</td></tr>
            )}
            {products.map(p => {
              const isLow = p.current_stock <= p.min_stock && p.min_stock > 0;
              return (
                <tr key={p.id}>
                  <td>
                    <span
                      style={{ color: '#e94560', cursor: 'pointer', fontWeight: 600 }}
                      onClick={() => navigate(`/products/${p.id}`)}
                    >{p.name}</span>
                  </td>
                  <td><code style={{ background: '#f4f6f9', padding: '0.1rem 0.4rem', borderRadius: 4, fontSize: '0.8rem' }}>{p.sku}</code></td>
                  <td>{p.category || '—'}</td>
                  <td>₹{Number(p.unit_price).toFixed(2)}</td>
                  <td>
                    <span style={{ color: isLow ? '#e74c3c' : '#27ae60', fontWeight: 600 }}>
                      {p.current_stock}
                    </span>
                    {isLow && <span style={{ color: '#e74c3c', fontSize: '0.75rem', marginLeft: '0.3rem' }}>⚠ Low</span>}
                    <div style={{ fontSize: '0.75rem', color: '#aaa' }}>min: {p.min_stock}</div>
                  </td>
                  <td>{p.location || '—'}</td>
                  <td className="actions">
                    <button className="btn-edit" onClick={() => navigate(`/products/${p.id}`)}>View</button>
                    {canEdit && <button className="btn-edit" style={{ background: '#27ae60' }} onClick={() => openEdit(p)}>Edit</button>}
                    {user?.role === 'Admin' && <button className="btn-danger" onClick={() => del(p.id)}>Del</button>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editId ? 'Edit Product' : 'Add Product'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={submit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input placeholder="Product name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>SKU / Code *</label>
                  <input placeholder="e.g. PRD-001" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <input placeholder="e.g. Electronics" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Unit Price (₹) *</label>
                  <input type="number" placeholder="0.00" value={form.unit_price} onChange={e => setForm({ ...form, unit_price: e.target.value })} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>{editId ? 'Current Stock (read-only)' : 'Opening Stock'}</label>
                  <input type="number" placeholder="0" value={form.current_stock} onChange={e => setForm({ ...form, current_stock: e.target.value })} disabled={!!editId} />
                </div>
                <div className="form-group">
                  <label>Min Stock Alert</label>
                  <input type="number" placeholder="0" value={form.min_stock} onChange={e => setForm({ ...form, min_stock: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Location / Warehouse</label>
                <input placeholder="e.g. Warehouse A, Shelf 3" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
              </div>
              {error && <p className="error">{error}</p>}
              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">{editId ? 'Update' : 'Add Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
