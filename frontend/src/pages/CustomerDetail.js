import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { customersApi } from '../api';
const STATUS_COLOR = { Lead: '#f39c12', Active: '#27ae60', Inactive: '#95a5a6' };
const TYPE_COLOR = { Retail: '#2980b9', Wholesale: '#8e44ad', Distributor: '#16a085' };
export default function CustomerDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState(null);
    const [note, setNote] = useState('');
    const [error, setError] = useState('');
    const load = () => customersApi.getById(Number(id)).then(r => setCustomer(r.data));
    useEffect(() => { load(); }, [id]);
    const submitFollowup = async (e) => {
        e.preventDefault();
        setError('');
        if (!note.trim())
            return;
        try {
            await customersApi.addFollowup(Number(id), note);
            setNote('');
            load();
        }
        catch {
            setError('Failed to add follow-up');
        }
    };
    if (!customer)
        return _jsx("div", { className: "container", style: { padding: '2rem' }, children: "Loading..." });
    return (_jsxs("div", { children: [_jsx("button", { onClick: () => navigate('/customers'), className: "btn-back", children: "\u2190 Back to Customers" }), _jsxs("div", { className: "detail-header card", children: [_jsx("div", { className: "detail-avatar", children: customer.name[0].toUpperCase() }), _jsxs("div", { className: "detail-info", children: [_jsx("h2", { children: customer.name }), customer.business_name && _jsx("p", { style: { color: '#666' }, children: customer.business_name }), _jsxs("div", { style: { display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }, children: [_jsx("span", { className: "tag", style: { background: STATUS_COLOR[customer.status] + '20', color: STATUS_COLOR[customer.status] }, children: customer.status }), _jsx("span", { className: "tag", style: { background: TYPE_COLOR[customer.customer_type] + '20', color: TYPE_COLOR[customer.customer_type] }, children: customer.customer_type })] })] })] }), _jsxs("div", { className: "detail-grid", children: [_jsxs("div", { className: "card", children: [_jsx("h4", { className: "section-title", children: "Contact Info" }), _jsxs("div", { className: "detail-row", children: [_jsx("span", { children: "\uD83D\uDCF1 Mobile" }), _jsx("strong", { children: customer.mobile })] }), _jsxs("div", { className: "detail-row", children: [_jsx("span", { children: "\uD83D\uDCE7 Email" }), _jsx("strong", { children: customer.email || '—' })] }), _jsxs("div", { className: "detail-row", children: [_jsx("span", { children: "\uD83D\uDCCD Address" }), _jsx("strong", { children: customer.address || '—' })] })] }), _jsxs("div", { className: "card", children: [_jsx("h4", { className: "section-title", children: "Business Info" }), _jsxs("div", { className: "detail-row", children: [_jsx("span", { children: "\uD83C\uDFE2 Business" }), _jsx("strong", { children: customer.business_name || '—' })] }), _jsxs("div", { className: "detail-row", children: [_jsx("span", { children: "\uD83E\uDDFE GST" }), _jsx("strong", { children: customer.gst_number || '—' })] }), _jsxs("div", { className: "detail-row", children: [_jsx("span", { children: "\uD83D\uDCC5 Follow-up" }), _jsx("strong", { children: customer.followup_date ? new Date(customer.followup_date).toLocaleDateString() : '—' })] })] })] }), customer.notes && (_jsxs("div", { className: "card", children: [_jsx("h4", { className: "section-title", children: "Notes" }), _jsx("p", { style: { color: '#555', lineHeight: 1.6 }, children: customer.notes })] })), _jsxs("div", { className: "card", children: [_jsx("h4", { className: "section-title", children: "Follow-up History" }), _jsxs("form", { onSubmit: submitFollowup, style: { display: 'flex', gap: '0.5rem', marginBottom: '1rem' }, children: [_jsx("input", { placeholder: "Add a follow-up note...", value: note, onChange: e => setNote(e.target.value), style: { flex: 1 }, required: true }), _jsx("button", { type: "submit", className: "btn-primary", children: "Add" })] }), error && _jsx("p", { className: "error", children: error }), customer.followups.length === 0 && _jsx("p", { style: { color: '#aaa', fontSize: '0.9rem' }, children: "No follow-ups yet." }), _jsx("div", { className: "followup-list", children: customer.followups.map(f => (_jsxs("div", { className: "followup-item", children: [_jsx("div", { className: "followup-note", children: f.note }), _jsxs("div", { className: "followup-meta", children: [_jsxs("span", { children: ["\uD83D\uDC64 ", f.created_by] }), _jsxs("span", { children: ["\uD83D\uDD50 ", new Date(f.created_at).toLocaleString()] })] })] }, f.id))) })] })] }));
}
