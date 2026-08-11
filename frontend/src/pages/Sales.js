import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { challanApi, customersApi, productsApi } from '../api';
import { useAuth } from '../context/AuthContext';
const STATUS_COLOR = {
    Draft: { bg: '#fff8e1', color: '#f39c12' },
    Confirmed: { bg: '#e8fdf0', color: '#27ae60' },
    Cancelled: { bg: '#fde8ec', color: '#e94560' },
};
export default function Sales() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const canCreate = user?.role === 'Admin' || user?.role === 'Sales';
    const [challans, setChallans] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [filterStatus, setFilterStatus] = useState('');
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    // Form state
    const [customerId, setCustomerId] = useState('');
    const [items, setItems] = useState([]);
    const [notes, setNotes] = useState('');
    const [saveStatus, setSaveStatus] = useState('Draft');
    const [error, setError] = useState('');
    const load = () => challanApi.getAll({ status: filterStatus, search }).then(r => setChallans(r.data));
    useEffect(() => { load(); }, [filterStatus, search]);
    useEffect(() => {
        customersApi.getAll().then(r => setCustomers(r.data));
        productsApi.getAll().then(r => setProducts(r.data));
    }, []);
    const openModal = () => {
        setCustomerId('');
        setItems([]);
        setNotes('');
        setSaveStatus('Draft');
        setError('');
        setShowModal(true);
    };
    const addItem = () => {
        if (products.length === 0)
            return;
        const available = products.filter(p => !items.find(i => i.product_id === p.id));
        if (available.length === 0)
            return;
        const p = available[0];
        setItems([...items, { product_id: p.id, product: p, quantity: 1 }]);
    };
    const updateItem = (index, field, value) => {
        const updated = [...items];
        if (field === 'product_id') {
            const p = products.find(p => p.id === Number(value));
            if (p)
                updated[index] = { product_id: p.id, product: p, quantity: updated[index].quantity };
        }
        else {
            updated[index].quantity = Number(value);
        }
        setItems(updated);
    };
    const removeItem = (index) => setItems(items.filter((_, i) => i !== index));
    const totalAmount = items.reduce((sum, i) => sum + i.product.unit_price * i.quantity, 0);
    const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);
    const submit = async (status) => {
        setError('');
        if (!customerId) {
            setError('Please select a customer');
            return;
        }
        if (items.length === 0) {
            setError('Please add at least one product');
            return;
        }
        try {
            await challanApi.create({
                customer_id: Number(customerId),
                items: items.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
                status, notes,
            });
            setShowModal(false);
            load();
        }
        catch (err) {
            setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Error');
        }
    };
    const updateStatus = async (id, status) => {
        if (!confirm(`Change status to ${status}?`))
            return;
        try {
            await challanApi.updateStatus(id, status);
            load();
        }
        catch (err) {
            alert(err.response?.data?.error || 'Error');
        }
    };
    return (_jsxs("div", { children: [_jsxs("div", { className: "page-header", children: [_jsx("h2", { className: "page-title", children: "Sales Challans" }), canCreate && _jsx("button", { className: "btn-primary", onClick: openModal, children: "+ New Challan" })] }), _jsxs("div", { className: "card", style: { padding: '0.75rem 1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }, children: [_jsx("input", { placeholder: "\uD83D\uDD0D Search challan, customer...", value: search, onChange: e => setSearch(e.target.value), style: { flex: 1, border: 'none', outline: 'none', fontSize: '0.9rem', minWidth: 200 } }), _jsxs("select", { value: filterStatus, onChange: e => setFilterStatus(e.target.value), style: { flex: 'none', width: 'auto' }, children: [_jsx("option", { value: "", children: "All Status" }), _jsx("option", { children: "Draft" }), _jsx("option", { children: "Confirmed" }), _jsx("option", { children: "Cancelled" })] })] }), _jsx("div", { className: "card", style: { padding: 0, overflow: 'hidden' }, children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Challan #" }), _jsx("th", { children: "Customer" }), _jsx("th", { children: "Qty" }), _jsx("th", { children: "Amount" }), _jsx("th", { children: "Status" }), _jsx("th", { children: "Created By" }), _jsx("th", { children: "Date" }), _jsx("th", { children: "Actions" })] }) }), _jsxs("tbody", { children: [challans.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 8, style: { textAlign: 'center', color: '#aaa', padding: '2rem' }, children: "No challans found" }) })), challans.map(c => (_jsxs("tr", { children: [_jsx("td", { children: _jsx("span", { style: { color: '#e94560', cursor: 'pointer', fontWeight: 600 }, onClick: () => navigate(`/challans/${c.id}`), children: c.challan_number }) }), _jsxs("td", { children: [_jsx("div", { style: { fontWeight: 500 }, children: c.customer_name }), c.customer_business && _jsx("div", { style: { fontSize: '0.78rem', color: '#888' }, children: c.customer_business })] }), _jsx("td", { children: c.total_quantity }), _jsxs("td", { children: ["\u20B9", Number(c.total_amount).toFixed(2)] }), _jsx("td", { children: _jsx("span", { className: "tag", style: { background: STATUS_COLOR[c.status].bg, color: STATUS_COLOR[c.status].color }, children: c.status }) }), _jsx("td", { style: { fontSize: '0.82rem', color: '#666' }, children: c.created_by }), _jsx("td", { style: { fontSize: '0.82rem', color: '#666' }, children: new Date(c.created_at).toLocaleDateString() }), _jsxs("td", { className: "actions", children: [_jsx("button", { className: "btn-edit", onClick: () => navigate(`/challans/${c.id}`), children: "View" }), canCreate && c.status === 'Draft' && (_jsx("button", { className: "btn-primary", style: { fontSize: '0.8rem', padding: '0.3rem 0.7rem' }, onClick: () => updateStatus(c.id, 'Confirmed'), children: "Confirm" })), canCreate && c.status !== 'Cancelled' && (_jsx("button", { className: "btn-danger", style: { fontSize: '0.8rem', padding: '0.3rem 0.7rem' }, onClick: () => updateStatus(c.id, 'Cancelled'), children: "Cancel" }))] })] }, c.id)))] })] }) }), showModal && (_jsx("div", { className: "modal-overlay", onClick: () => setShowModal(false), children: _jsxs("div", { className: "modal", style: { maxWidth: '700px' }, onClick: e => e.stopPropagation(), children: [_jsxs("div", { className: "modal-header", children: [_jsx("h3", { children: "New Sales Challan" }), _jsx("button", { className: "modal-close", onClick: () => setShowModal(false), children: "\u2715" })] }), _jsxs("div", { className: "modal-form", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Customer *" }), _jsxs("select", { value: customerId, onChange: e => setCustomerId(e.target.value), required: true, children: [_jsx("option", { value: "", children: "Select Customer" }), customers.map(c => (_jsxs("option", { value: c.id, children: [c.name, " ", c.business_name ? `— ${c.business_name}` : ''] }, c.id)))] })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }, children: [_jsx("label", { style: { fontWeight: 600, fontSize: '0.85rem', color: '#555' }, children: "Products *" }), _jsx("button", { type: "button", className: "btn-edit", style: { fontSize: '0.8rem', padding: '0.25rem 0.7rem' }, onClick: addItem, children: "+ Add Product" })] }), items.length === 0 && (_jsx("div", { style: { background: '#f8f9fa', borderRadius: 8, padding: '1rem', textAlign: 'center', color: '#aaa', fontSize: '0.9rem', marginBottom: '0.75rem' }, children: "Click \"+ Add Product\" to add items" })), items.map((item, i) => (_jsxs("div", { className: "challan-item-row", children: [_jsx("select", { value: item.product_id, onChange: e => updateItem(i, 'product_id', e.target.value), style: { flex: 2 }, children: products.map(p => (_jsxs("option", { value: p.id, disabled: !!items.find((it, idx) => idx !== i && it.product_id === p.id), children: [p.name, " (Stock: ", p.current_stock, ")"] }, p.id))) }), _jsxs("div", { style: { flex: 1, textAlign: 'center', fontSize: '0.85rem', color: '#666' }, children: ["\u20B9", item.product.unit_price] }), _jsx("input", { type: "number", min: "1", max: item.product.current_stock, value: item.quantity, onChange: e => updateItem(i, 'quantity', e.target.value), style: { flex: 1, textAlign: 'center' } }), _jsxs("div", { style: { flex: 1, textAlign: 'right', fontWeight: 600, fontSize: '0.9rem' }, children: ["\u20B9", (item.product.unit_price * item.quantity).toFixed(2)] }), _jsx("button", { type: "button", onClick: () => removeItem(i), style: { background: 'none', border: 'none', color: '#e94560', cursor: 'pointer', fontSize: '1.1rem', padding: '0 0.25rem' }, children: "\u2715" })] }, i))), items.length > 0 && (_jsxs("div", { className: "challan-totals", children: [_jsxs("div", { children: ["Total Qty: ", _jsx("strong", { children: totalQty })] }), _jsxs("div", { children: ["Total Amount: ", _jsxs("strong", { children: ["\u20B9", totalAmount.toFixed(2)] })] })] })), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Notes" }), _jsx("textarea", { placeholder: "Optional notes...", value: notes, onChange: e => setNotes(e.target.value), rows: 2 })] }), error && _jsx("p", { className: "error", children: error }), _jsxs("div", { className: "modal-footer", children: [_jsx("button", { type: "button", onClick: () => setShowModal(false), children: "Cancel" }), _jsx("button", { type: "button", onClick: () => submit('Draft'), style: { background: '#f39c12', color: 'white', border: 'none', borderRadius: 6, padding: '0.5rem 1.2rem', cursor: 'pointer' }, children: "Save as Draft" }), _jsx("button", { type: "button", className: "btn-primary", onClick: () => submit('Confirmed'), children: "Confirm Challan" })] })] })] }) }))] }));
}
