import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { customersApi } from '../api';

interface Customer {
  id: number; name: string; mobile: string; email: string;
  business_name: string; gst_number: string;
  customer_type: string; address: string;
  status: string; followup_date: string; notes: string;
}

const empty = {
  name: '', mobile: '', email: '', business_name: '', gst_number: '',
  customer_type: 'Retail', address: '', status: 'Lead', followup_date: '', notes: '',
};

const STATUS_COLOR: Record<string, string> = {
  Lead: '#f39c12', Active: '#27ae60', Inactive: '#95a5a6',
};
const TYPE_COLOR: Record<string, string> = {
  Retail: '#2980b9', Wholesale: '#8e44ad', Distributor: '#16a085',
};

export default function Customers() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const load = (s = search) => customersApi.getAll(s).then(r => setCustomers(r.data));
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(empty); setEditId(null); setError(''); setShowModal(true); };
  const openEdit = (c: Customer) => {
    setForm({
      name: c.name, mobile: c.mobile, email: c.email || '',
      business_name: c.business_name || '', gst_number: c.gst_number || '',
      customer_type: c.customer_type, address: c.address || '',
      status: c.status, followup_date: c.followup_date?.split('T')[0] || '', notes: c.notes || '',
    });
    setEditId(c.id); setError(''); setShowModal(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    try {
      if (editId) await customersApi.update(editId, form);
      else await customersApi.create(form);
      setShowModal(false); load();
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0]?.msg || err.response?.data?.error || 'Error');
    }
  };

  const del = async (id: number) => {
    if (!confirm('Delete this customer?')) return;
    await customersApi.delete(id); load();
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    load(e.target.value);
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Customers</h2>
        <button className="btn-primary" onClick={openAdd}>+ Add Customer</button>
      </div>

      {/* Search */}
      <div className="card" style={{ padding: '0.75rem 1rem' }}>
        <input
          placeholder="🔍  Search by name, mobile, email, business..."
          value={search} onChange={handleSearch}
          style={{ width: '100%', border: 'none', outline: 'none', fontSize: '0.95rem' }}
        />
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>Name</th><th>Mobile</th><th>Business</th>
              <th>Type</th><th>Status</th><th>Follow-up</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: '#aaa', padding: '2rem' }}>No customers found</td></tr>
            )}
            {customers.map(c => (
              <tr key={c.id}>
                <td>
                  <span
                    style={{ color: '#e94560', cursor: 'pointer', fontWeight: 600 }}
                    onClick={() => navigate(`/customers/${c.id}`)}
                  >{c.name}</span>
                  {c.email && <div style={{ fontSize: '0.78rem', color: '#888' }}>{c.email}</div>}
                </td>
                <td>{c.mobile}</td>
                <td>{c.business_name || '—'}</td>
                <td><span className="tag" style={{ background: TYPE_COLOR[c.customer_type] + '20', color: TYPE_COLOR[c.customer_type] }}>{c.customer_type}</span></td>
                <td><span className="tag" style={{ background: STATUS_COLOR[c.status] + '20', color: STATUS_COLOR[c.status] }}>{c.status}</span></td>
                <td style={{ fontSize: '0.85rem' }}>{c.followup_date ? new Date(c.followup_date).toLocaleDateString() : '—'}</td>
                <td className="actions">
                  <button className="btn-edit" onClick={() => openEdit(c)}>Edit</button>
                  <button className="btn-danger" onClick={() => del(c.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editId ? 'Edit Customer' : 'Add Customer'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={submit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Customer Name *</label>
                  <input placeholder="Full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Mobile *</label>
                  <input placeholder="Mobile number" value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" placeholder="Email address" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Business Name</label>
                  <input placeholder="Business / Company" value={form.business_name} onChange={e => setForm({ ...form, business_name: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>GST Number (optional)</label>
                  <input placeholder="GST number" value={form.gst_number} onChange={e => setForm({ ...form, gst_number: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Customer Type *</label>
                  <select value={form.customer_type} onChange={e => setForm({ ...form, customer_type: e.target.value })}>
                    <option>Retail</option><option>Wholesale</option><option>Distributor</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Status *</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option>Lead</option><option>Active</option><option>Inactive</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Follow-up Date</label>
                  <input type="date" value={form.followup_date} onChange={e => setForm({ ...form, followup_date: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Address</label>
                <input placeholder="Full address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea placeholder="Any notes..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} />
              </div>
              {error && <p className="error">{error}</p>}
              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">{editId ? 'Update' : 'Add Customer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
