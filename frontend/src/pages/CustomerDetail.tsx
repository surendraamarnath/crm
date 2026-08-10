import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { customersApi } from '../api';

interface Followup { id: number; note: string; created_by: string; created_at: string; }
interface Customer {
  id: number; name: string; mobile: string; email: string;
  business_name: string; gst_number: string; customer_type: string;
  address: string; status: string; followup_date: string; notes: string;
  followups: Followup[];
}

const STATUS_COLOR: Record<string, string> = { Lead: '#f39c12', Active: '#27ae60', Inactive: '#95a5a6' };
const TYPE_COLOR: Record<string, string> = { Retail: '#2980b9', Wholesale: '#8e44ad', Distributor: '#16a085' };

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const load = () => customersApi.getById(Number(id)).then(r => setCustomer(r.data));
  useEffect(() => { load(); }, [id]);

  const submitFollowup = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (!note.trim()) return;
    try {
      await customersApi.addFollowup(Number(id), note);
      setNote(''); load();
    } catch { setError('Failed to add follow-up'); }
  };

  if (!customer) return <div className="container" style={{ padding: '2rem' }}>Loading...</div>;

  return (
    <div>
      {/* Back */}
      <button onClick={() => navigate('/customers')} className="btn-back">← Back to Customers</button>

      {/* Header */}
      <div className="detail-header card">
        <div className="detail-avatar">{customer.name[0].toUpperCase()}</div>
        <div className="detail-info">
          <h2>{customer.name}</h2>
          {customer.business_name && <p style={{ color: '#666' }}>{customer.business_name}</p>}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
            <span className="tag" style={{ background: STATUS_COLOR[customer.status] + '20', color: STATUS_COLOR[customer.status] }}>{customer.status}</span>
            <span className="tag" style={{ background: TYPE_COLOR[customer.customer_type] + '20', color: TYPE_COLOR[customer.customer_type] }}>{customer.customer_type}</span>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="detail-grid">
        <div className="card">
          <h4 className="section-title">Contact Info</h4>
          <div className="detail-row"><span>📱 Mobile</span><strong>{customer.mobile}</strong></div>
          <div className="detail-row"><span>📧 Email</span><strong>{customer.email || '—'}</strong></div>
          <div className="detail-row"><span>📍 Address</span><strong>{customer.address || '—'}</strong></div>
        </div>
        <div className="card">
          <h4 className="section-title">Business Info</h4>
          <div className="detail-row"><span>🏢 Business</span><strong>{customer.business_name || '—'}</strong></div>
          <div className="detail-row"><span>🧾 GST</span><strong>{customer.gst_number || '—'}</strong></div>
          <div className="detail-row"><span>📅 Follow-up</span><strong>{customer.followup_date ? new Date(customer.followup_date).toLocaleDateString() : '—'}</strong></div>
        </div>
      </div>

      {/* Notes */}
      {customer.notes && (
        <div className="card">
          <h4 className="section-title">Notes</h4>
          <p style={{ color: '#555', lineHeight: 1.6 }}>{customer.notes}</p>
        </div>
      )}

      {/* Follow-up Section */}
      <div className="card">
        <h4 className="section-title">Follow-up History</h4>
        <form onSubmit={submitFollowup} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input
            placeholder="Add a follow-up note..."
            value={note} onChange={e => setNote(e.target.value)}
            style={{ flex: 1 }} required
          />
          <button type="submit" className="btn-primary">Add</button>
        </form>
        {error && <p className="error">{error}</p>}
        {customer.followups.length === 0 && <p style={{ color: '#aaa', fontSize: '0.9rem' }}>No follow-ups yet.</p>}
        <div className="followup-list">
          {customer.followups.map(f => (
            <div key={f.id} className="followup-item">
              <div className="followup-note">{f.note}</div>
              <div className="followup-meta">
                <span>👤 {f.created_by}</span>
                <span>🕐 {new Date(f.created_at).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
