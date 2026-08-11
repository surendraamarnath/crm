import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { challanApi } from '../api';
import { useAuth } from '../context/AuthContext';
const STATUS_COLOR = {
    Draft: { bg: '#fff8e1', color: '#f39c12' },
    Confirmed: { bg: '#e8fdf0', color: '#27ae60' },
    Cancelled: { bg: '#fde8ec', color: '#e94560' },
};
export default function ChallanDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const canUpdate = user?.role === 'Admin' || user?.role === 'Sales';
    const [challan, setChallan] = useState(null);
    const load = () => challanApi.getById(Number(id)).then(r => setChallan(r.data));
    useEffect(() => { load(); }, [id]);
    const updateStatus = async (status) => {
        if (!confirm(`Change status to ${status}?`))
            return;
        try {
            await challanApi.updateStatus(Number(id), status);
            load();
        }
        catch (err) {
            alert(err.response?.data?.error || 'Error');
        }
    };
    if (!challan)
        return _jsx("div", { style: { padding: '2rem' }, children: "Loading..." });
    const sc = STATUS_COLOR[challan.status];
    return (_jsxs("div", { children: [_jsx("button", { onClick: () => navigate('/sales'), className: "btn-back", children: "\u2190 Back to Challans" }), _jsxs("div", { className: "detail-header card", style: { justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '1rem' }, children: [_jsx("div", { className: "detail-avatar", style: { background: '#2980b9', borderRadius: 10, fontSize: '1.2rem' }, children: "\uD83E\uDDFE" }), _jsxs("div", { children: [_jsx("h2", { style: { fontSize: '1.4rem' }, children: challan.challan_number }), _jsxs("div", { style: { display: 'flex', gap: '0.5rem', marginTop: '0.3rem', alignItems: 'center' }, children: [_jsx("span", { className: "tag", style: { background: sc.bg, color: sc.color }, children: challan.status }), _jsxs("span", { style: { fontSize: '0.82rem', color: '#888' }, children: ["by ", challan.created_by] }), _jsx("span", { style: { fontSize: '0.82rem', color: '#888' }, children: new Date(challan.created_at).toLocaleString() })] })] })] }), canUpdate && (_jsxs("div", { style: { display: 'flex', gap: '0.5rem' }, children: [challan.status === 'Draft' && (_jsx("button", { className: "btn-primary", onClick: () => updateStatus('Confirmed'), children: "\u2713 Confirm Challan" })), challan.status !== 'Cancelled' && (_jsx("button", { className: "btn-danger", onClick: () => updateStatus('Cancelled'), children: "\u2715 Cancel" }))] }))] }), _jsxs("div", { className: "detail-grid", children: [_jsxs("div", { className: "card", children: [_jsx("h4", { className: "section-title", children: "Customer Info" }), _jsxs("div", { className: "detail-row", children: [_jsx("span", { children: "\uD83D\uDC64 Name" }), _jsx("strong", { children: challan.customer_name })] }), _jsxs("div", { className: "detail-row", children: [_jsx("span", { children: "\uD83D\uDCF1 Mobile" }), _jsx("strong", { children: challan.customer_mobile || '—' })] }), _jsxs("div", { className: "detail-row", children: [_jsx("span", { children: "\uD83C\uDFE2 Business" }), _jsx("strong", { children: challan.customer_business || '—' })] })] }), _jsxs("div", { className: "card", children: [_jsx("h4", { className: "section-title", children: "Challan Summary" }), _jsxs("div", { className: "detail-row", children: [_jsx("span", { children: "\uD83D\uDCE6 Total Qty" }), _jsx("strong", { children: challan.total_quantity })] }), _jsxs("div", { className: "detail-row", children: [_jsx("span", { children: "\uD83D\uDCB0 Total Amount" }), _jsxs("strong", { children: ["\u20B9", Number(challan.total_amount).toFixed(2)] })] }), challan.notes && _jsxs("div", { className: "detail-row", children: [_jsx("span", { children: "\uD83D\uDCDD Notes" }), _jsx("strong", { children: challan.notes })] })] })] }), _jsxs("div", { className: "card", children: [_jsx("h4", { className: "section-title", children: "Products" }), _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "#" }), _jsx("th", { children: "Product" }), _jsx("th", { children: "SKU" }), _jsx("th", { children: "Unit Price" }), _jsx("th", { children: "Quantity" }), _jsx("th", { children: "Total" })] }) }), _jsx("tbody", { children: challan.items.map((item, i) => (_jsxs("tr", { children: [_jsx("td", { style: { color: '#888' }, children: i + 1 }), _jsx("td", { style: { fontWeight: 500 }, children: item.product_name }), _jsx("td", { children: _jsx("code", { style: { background: '#f4f6f9', padding: '0.1rem 0.4rem', borderRadius: 4, fontSize: '0.8rem' }, children: item.product_sku }) }), _jsxs("td", { children: ["\u20B9", Number(item.unit_price).toFixed(2)] }), _jsx("td", { style: { fontWeight: 600 }, children: item.quantity }), _jsxs("td", { style: { fontWeight: 700, color: '#1a1a2e' }, children: ["\u20B9", Number(item.total).toFixed(2)] })] }, item.id))) }), _jsx("tfoot", { children: _jsxs("tr", { style: { background: '#f8f9fa' }, children: [_jsx("td", { colSpan: 4, style: { textAlign: 'right', fontWeight: 600, padding: '0.75rem 1rem' }, children: "Total" }), _jsx("td", { style: { fontWeight: 700 }, children: challan.total_quantity }), _jsxs("td", { style: { fontWeight: 700, color: '#e94560' }, children: ["\u20B9", Number(challan.total_amount).toFixed(2)] })] }) })] })] })] }));
}
