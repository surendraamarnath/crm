import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { challanApi } from '../api';
import { useAuth } from '../context/AuthContext';

interface ChallanItem {
  id: number; product_name: string; product_sku: string;
  unit_price: number; quantity: number; total: number;
}
interface Challan {
  id: number; challan_number: string; customer_name: string;
  customer_mobile: string; customer_business: string;
  total_quantity: number; total_amount: number;
  status: string; created_by: string; notes: string;
  created_at: string; items: ChallanItem[];
}

const STATUS_COLOR: Record<string, { bg: string; color: string }> = {
  Draft:     { bg: '#fff8e1', color: '#f39c12' },
  Confirmed: { bg: '#e8fdf0', color: '#27ae60' },
  Cancelled: { bg: '#fde8ec', color: '#e94560' },
};

export default function ChallanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canUpdate = user?.role === 'Admin' || user?.role === 'Sales';

  const [challan, setChallan] = useState<Challan | null>(null);

  const load = () => challanApi.getById(Number(id)).then(r => setChallan(r.data));
  useEffect(() => { load(); }, [id]);

  const updateStatus = async (status: string) => {
    if (!confirm(`Change status to ${status}?`)) return;
    try {
      await challanApi.updateStatus(Number(id), status); load();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error');
    }
  };

  if (!challan) return <div style={{ padding: '2rem' }}>Loading...</div>;

  const sc = STATUS_COLOR[challan.status];

  return (
    <div>
      <button onClick={() => navigate('/sales')} className="btn-back">← Back to Challans</button>

      {/* Header */}
      <div className="detail-header card" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="detail-avatar" style={{ background: '#2980b9', borderRadius: 10, fontSize: '1.2rem' }}>🧾</div>
          <div>
            <h2 style={{ fontSize: '1.4rem' }}>{challan.challan_number}</h2>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem', alignItems: 'center' }}>
              <span className="tag" style={{ background: sc.bg, color: sc.color }}>{challan.status}</span>
              <span style={{ fontSize: '0.82rem', color: '#888' }}>by {challan.created_by}</span>
              <span style={{ fontSize: '0.82rem', color: '#888' }}>{new Date(challan.created_at).toLocaleString()}</span>
            </div>
          </div>
        </div>
        {canUpdate && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {challan.status === 'Draft' && (
              <button className="btn-primary" onClick={() => updateStatus('Confirmed')}>✓ Confirm Challan</button>
            )}
            {challan.status !== 'Cancelled' && (
              <button className="btn-danger" onClick={() => updateStatus('Cancelled')}>✕ Cancel</button>
            )}
          </div>
        )}
      </div>

      {/* Customer + Summary */}
      <div className="detail-grid">
        <div className="card">
          <h4 className="section-title">Customer Info</h4>
          <div className="detail-row"><span>👤 Name</span><strong>{challan.customer_name}</strong></div>
          <div className="detail-row"><span>📱 Mobile</span><strong>{challan.customer_mobile || '—'}</strong></div>
          <div className="detail-row"><span>🏢 Business</span><strong>{challan.customer_business || '—'}</strong></div>
        </div>
        <div className="card">
          <h4 className="section-title">Challan Summary</h4>
          <div className="detail-row"><span>📦 Total Qty</span><strong>{challan.total_quantity}</strong></div>
          <div className="detail-row"><span>💰 Total Amount</span><strong>₹{Number(challan.total_amount).toFixed(2)}</strong></div>
          {challan.notes && <div className="detail-row"><span>📝 Notes</span><strong>{challan.notes}</strong></div>}
        </div>
      </div>

      {/* Items Table */}
      <div className="card">
        <h4 className="section-title">Products</h4>
        <table>
          <thead>
            <tr><th>#</th><th>Product</th><th>SKU</th><th>Unit Price</th><th>Quantity</th><th>Total</th></tr>
          </thead>
          <tbody>
            {challan.items.map((item, i) => (
              <tr key={item.id}>
                <td style={{ color: '#888' }}>{i + 1}</td>
                <td style={{ fontWeight: 500 }}>{item.product_name}</td>
                <td><code style={{ background: '#f4f6f9', padding: '0.1rem 0.4rem', borderRadius: 4, fontSize: '0.8rem' }}>{item.product_sku}</code></td>
                <td>₹{Number(item.unit_price).toFixed(2)}</td>
                <td style={{ fontWeight: 600 }}>{item.quantity}</td>
                <td style={{ fontWeight: 700, color: '#1a1a2e' }}>₹{Number(item.total).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: '#f8f9fa' }}>
              <td colSpan={4} style={{ textAlign: 'right', fontWeight: 600, padding: '0.75rem 1rem' }}>Total</td>
              <td style={{ fontWeight: 700 }}>{challan.total_quantity}</td>
              <td style={{ fontWeight: 700, color: '#e94560' }}>₹{Number(challan.total_amount).toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
