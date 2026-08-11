import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { customersApi } from '../api';
const empty = {
    name: '', mobile: '', email: '', business_name: '', gst_number: '',
    customer_type: 'Retail', address: '', status: 'Lead', followup_date: '', notes: '',
};
const STATUS_COLOR = {
    Lead: '#f39c12', Active: '#27ae60', Inactive: '#95a5a6',
};
const TYPE_COLOR = {
    Retail: '#2980b9', Wholesale: '#8e44ad', Distributor: '#16a085',
};
export default function Customers() {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(empty);
    const [editId, setEditId] = useState(null);
    const [error, setError] = useState('');
    const load = (s = search) => customersApi.getAll(s).then(r => setCustomers(r.data));
    useEffect(() => { load(); }, []);
    const openAdd = () => { setForm(empty); setEditId(null); setError(''); setShowModal(true); };
    const openEdit = (c) => {
        setForm({
            name: c.name, mobile: c.mobile, email: c.email || '',
            business_name: c.business_name || '', gst_number: c.gst_number || '',
            customer_type: c.customer_type, address: c.address || '',
            status: c.status, followup_date: c.followup_date?.split('T')[0] || '', notes: c.notes || '',
        });
        setEditId(c.id);
        setError('');
        setShowModal(true);
    };
    const submit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (editId)
                await customersApi.update(editId, form);
            else
                await customersApi.create(form);
            setShowModal(false);
            load();
        }
        catch (err) {
            setError(err.response?.data?.errors?.[0]?.msg || err.response?.data?.error || 'Error');
        }
    };
    const del = async (id) => {
        if (!confirm('Delete this customer?'))
            return;
        await customersApi.delete(id);
        load();
    };
    const handleSearch = (e) => {
        setSearch(e.target.value);
        load(e.target.value);
    };
    return (_jsxs("div", { children: [_jsxs("div", { className: "page-header", children: [_jsx("h2", { className: "page-title", children: "Customers" }), _jsx("button", { className: "btn-primary", onClick: openAdd, children: "+ Add Customer" })] }), _jsx("div", { className: "card", style: { padding: '0.75rem 1rem' }, children: _jsx("input", { placeholder: "\uD83D\uDD0D  Search by name, mobile, email, business...", value: search, onChange: handleSearch, style: { width: '100%', border: 'none', outline: 'none', fontSize: '0.95rem' } }) }), _jsx("div", { className: "card", style: { padding: 0, overflow: 'hidden' }, children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Name" }), _jsx("th", { children: "Mobile" }), _jsx("th", { children: "Business" }), _jsx("th", { children: "Type" }), _jsx("th", { children: "Status" }), _jsx("th", { children: "Follow-up" }), _jsx("th", { children: "Actions" })] }) }), _jsxs("tbody", { children: [customers.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 7, style: { textAlign: 'center', color: '#aaa', padding: '2rem' }, children: "No customers found" }) })), customers.map(c => (_jsxs("tr", { children: [_jsxs("td", { children: [_jsx("span", { style: { color: '#e94560', cursor: 'pointer', fontWeight: 600 }, onClick: () => navigate(`/customers/${c.id}`), children: c.name }), c.email && _jsx("div", { style: { fontSize: '0.78rem', color: '#888' }, children: c.email })] }), _jsx("td", { children: c.mobile }), _jsx("td", { children: c.business_name || '—' }), _jsx("td", { children: _jsx("span", { className: "tag", style: { background: TYPE_COLOR[c.customer_type] + '20', color: TYPE_COLOR[c.customer_type] }, children: c.customer_type }) }), _jsx("td", { children: _jsx("span", { className: "tag", style: { background: STATUS_COLOR[c.status] + '20', color: STATUS_COLOR[c.status] }, children: c.status }) }), _jsx("td", { style: { fontSize: '0.85rem' }, children: c.followup_date ? new Date(c.followup_date).toLocaleDateString() : '—' }), _jsxs("td", { className: "actions", children: [_jsx("button", { className: "btn-edit", onClick: () => openEdit(c), children: "Edit" }), _jsx("button", { className: "btn-danger", onClick: () => del(c.id), children: "Delete" })] })] }, c.id)))] })] }) }), showModal && (_jsx("div", { className: "modal-overlay", onClick: () => setShowModal(false), children: _jsxs("div", { className: "modal", onClick: e => e.stopPropagation(), children: [_jsxs("div", { className: "modal-header", children: [_jsx("h3", { children: editId ? 'Edit Customer' : 'Add Customer' }), _jsx("button", { className: "modal-close", onClick: () => setShowModal(false), children: "\u2715" })] }), _jsxs("form", { onSubmit: submit, className: "modal-form", children: [_jsxs("div", { className: "form-row", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Customer Name *" }), _jsx("input", { placeholder: "Full name", value: form.name, onChange: e => setForm({ ...form, name: e.target.value }), required: true })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Mobile *" }), _jsx("input", { placeholder: "Mobile number", value: form.mobile, onChange: e => setForm({ ...form, mobile: e.target.value }), required: true })] })] }), _jsxs("div", { className: "form-row", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Email" }), _jsx("input", { type: "email", placeholder: "Email address", value: form.email, onChange: e => setForm({ ...form, email: e.target.value }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Business Name" }), _jsx("input", { placeholder: "Business / Company", value: form.business_name, onChange: e => setForm({ ...form, business_name: e.target.value }) })] })] }), _jsxs("div", { className: "form-row", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "GST Number (optional)" }), _jsx("input", { placeholder: "GST number", value: form.gst_number, onChange: e => setForm({ ...form, gst_number: e.target.value }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Customer Type *" }), _jsxs("select", { value: form.customer_type, onChange: e => setForm({ ...form, customer_type: e.target.value }), children: [_jsx("option", { children: "Retail" }), _jsx("option", { children: "Wholesale" }), _jsx("option", { children: "Distributor" })] })] })] }), _jsxs("div", { className: "form-row", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Status *" }), _jsxs("select", { value: form.status, onChange: e => setForm({ ...form, status: e.target.value }), children: [_jsx("option", { children: "Lead" }), _jsx("option", { children: "Active" }), _jsx("option", { children: "Inactive" })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Follow-up Date" }), _jsx("input", { type: "date", value: form.followup_date, onChange: e => setForm({ ...form, followup_date: e.target.value }) })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Address" }), _jsx("input", { placeholder: "Full address", value: form.address, onChange: e => setForm({ ...form, address: e.target.value }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Notes" }), _jsx("textarea", { placeholder: "Any notes...", value: form.notes, onChange: e => setForm({ ...form, notes: e.target.value }), rows: 3 })] }), error && _jsx("p", { className: "error", children: error }), _jsxs("div", { className: "modal-footer", children: [_jsx("button", { type: "button", onClick: () => setShowModal(false), children: "Cancel" }), _jsx("button", { type: "submit", className: "btn-primary", children: editId ? 'Update' : 'Add Customer' })] })] })] }) }))] }));
}
