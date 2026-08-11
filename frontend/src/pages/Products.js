import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsApi } from '../api';
import { useAuth } from '../context/AuthContext';
const empty = { name: '', sku: '', category: '', unit_price: '', current_stock: '0', min_stock: '0', location: '' };
export default function Products() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const canEdit = user?.role === 'Admin' || user?.role === 'Warehouse';
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(empty);
    const [editId, setEditId] = useState(null);
    const [error, setError] = useState('');
    const load = (s = search) => productsApi.getAll(s).then(r => setProducts(r.data));
    useEffect(() => { load(); }, []);
    const openAdd = () => { setForm(empty); setEditId(null); setError(''); setShowModal(true); };
    const openEdit = (p) => {
        setForm({
            name: p.name, sku: p.sku, category: p.category || '',
            unit_price: String(p.unit_price), current_stock: String(p.current_stock),
            min_stock: String(p.min_stock), location: p.location || '',
        });
        setEditId(p.id);
        setError('');
        setShowModal(true);
    };
    const submit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (editId)
                await productsApi.update(editId, form);
            else
                await productsApi.create(form);
            setShowModal(false);
            load();
        }
        catch (err) {
            setError(err.response?.data?.errors?.[0]?.msg || err.response?.data?.error || 'Error');
        }
    };
    const del = async (id) => {
        if (!confirm('Delete this product?'))
            return;
        await productsApi.delete(id);
        load();
    };
    const lowStock = products.filter(p => p.current_stock <= p.min_stock && p.min_stock > 0);
    return (_jsxs("div", { children: [_jsxs("div", { className: "page-header", children: [_jsx("h2", { className: "page-title", children: "Inventory" }), canEdit && _jsx("button", { className: "btn-primary", onClick: openAdd, children: "+ Add Product" })] }), lowStock.length > 0 && (_jsxs("div", { className: "alert-box", children: ["\u26A0\uFE0F ", _jsxs("strong", { children: [lowStock.length, " product", lowStock.length > 1 ? 's' : '', " low on stock:"] }), ' ', lowStock.map(p => _jsxs("span", { className: "alert-tag", children: [p.name, " (", p.current_stock, ")"] }, p.id))] })), _jsx("div", { className: "card", style: { padding: '0.75rem 1rem' }, children: _jsx("input", { placeholder: "\uD83D\uDD0D  Search by name, SKU, category, location...", value: search, onChange: e => { setSearch(e.target.value); load(e.target.value); }, style: { width: '100%', border: 'none', outline: 'none', fontSize: '0.95rem' } }) }), _jsx("div", { className: "card", style: { padding: 0, overflow: 'hidden' }, children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Product" }), _jsx("th", { children: "SKU" }), _jsx("th", { children: "Category" }), _jsx("th", { children: "Price" }), _jsx("th", { children: "Stock" }), _jsx("th", { children: "Location" }), _jsx("th", { children: "Actions" })] }) }), _jsxs("tbody", { children: [products.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 7, style: { textAlign: 'center', color: '#aaa', padding: '2rem' }, children: "No products found" }) })), products.map(p => {
                                    const isLow = p.current_stock <= p.min_stock && p.min_stock > 0;
                                    return (_jsxs("tr", { children: [_jsx("td", { children: _jsx("span", { style: { color: '#e94560', cursor: 'pointer', fontWeight: 600 }, onClick: () => navigate(`/products/${p.id}`), children: p.name }) }), _jsx("td", { children: _jsx("code", { style: { background: '#f4f6f9', padding: '0.1rem 0.4rem', borderRadius: 4, fontSize: '0.8rem' }, children: p.sku }) }), _jsx("td", { children: p.category || '—' }), _jsxs("td", { children: ["\u20B9", Number(p.unit_price).toFixed(2)] }), _jsxs("td", { children: [_jsx("span", { style: { color: isLow ? '#e74c3c' : '#27ae60', fontWeight: 600 }, children: p.current_stock }), isLow && _jsx("span", { style: { color: '#e74c3c', fontSize: '0.75rem', marginLeft: '0.3rem' }, children: "\u26A0 Low" }), _jsxs("div", { style: { fontSize: '0.75rem', color: '#aaa' }, children: ["min: ", p.min_stock] })] }), _jsx("td", { children: p.location || '—' }), _jsxs("td", { className: "actions", children: [_jsx("button", { className: "btn-edit", onClick: () => navigate(`/products/${p.id}`), children: "View" }), canEdit && _jsx("button", { className: "btn-edit", style: { background: '#27ae60' }, onClick: () => openEdit(p), children: "Edit" }), user?.role === 'Admin' && _jsx("button", { className: "btn-danger", onClick: () => del(p.id), children: "Del" })] })] }, p.id));
                                })] })] }) }), showModal && (_jsx("div", { className: "modal-overlay", onClick: () => setShowModal(false), children: _jsxs("div", { className: "modal", onClick: e => e.stopPropagation(), children: [_jsxs("div", { className: "modal-header", children: [_jsx("h3", { children: editId ? 'Edit Product' : 'Add Product' }), _jsx("button", { className: "modal-close", onClick: () => setShowModal(false), children: "\u2715" })] }), _jsxs("form", { onSubmit: submit, className: "modal-form", children: [_jsxs("div", { className: "form-row", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Product Name *" }), _jsx("input", { placeholder: "Product name", value: form.name, onChange: e => setForm({ ...form, name: e.target.value }), required: true })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "SKU / Code *" }), _jsx("input", { placeholder: "e.g. PRD-001", value: form.sku, onChange: e => setForm({ ...form, sku: e.target.value }), required: true })] })] }), _jsxs("div", { className: "form-row", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Category" }), _jsx("input", { placeholder: "e.g. Electronics", value: form.category, onChange: e => setForm({ ...form, category: e.target.value }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Unit Price (\u20B9) *" }), _jsx("input", { type: "number", placeholder: "0.00", value: form.unit_price, onChange: e => setForm({ ...form, unit_price: e.target.value }), required: true })] })] }), _jsxs("div", { className: "form-row", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: editId ? 'Current Stock (read-only)' : 'Opening Stock' }), _jsx("input", { type: "number", placeholder: "0", value: form.current_stock, onChange: e => setForm({ ...form, current_stock: e.target.value }), disabled: !!editId })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Min Stock Alert" }), _jsx("input", { type: "number", placeholder: "0", value: form.min_stock, onChange: e => setForm({ ...form, min_stock: e.target.value }) })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Location / Warehouse" }), _jsx("input", { placeholder: "e.g. Warehouse A, Shelf 3", value: form.location, onChange: e => setForm({ ...form, location: e.target.value }) })] }), error && _jsx("p", { className: "error", children: error }), _jsxs("div", { className: "modal-footer", children: [_jsx("button", { type: "button", onClick: () => setShowModal(false), children: "Cancel" }), _jsx("button", { type: "submit", className: "btn-primary", children: editId ? 'Update' : 'Add Product' })] })] })] }) }))] }));
}
