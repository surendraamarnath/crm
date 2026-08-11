import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { authApi } from '../api';
const empty = { name: '', email: '', password: '', role: 'Sales' };
export default function Users() {
    const [users, setUsers] = useState([]);
    const [form, setForm] = useState(empty);
    const [error, setError] = useState('');
    const load = () => authApi.getUsers().then(r => setUsers(r.data));
    useEffect(() => { load(); }, []);
    const submit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await authApi.createUser(form);
            setForm(empty);
            load();
        }
        catch (err) {
            setError(err.response?.data?.errors?.[0]?.msg || err.response?.data?.error || 'Error');
        }
    };
    const del = async (id) => { await authApi.deleteUser(id); load(); };
    return (_jsxs("div", { children: [_jsx("h2", { className: "page-title", children: "User Management" }), _jsxs("div", { className: "card", children: [_jsxs("form", { onSubmit: submit, children: [_jsx("input", { placeholder: "Name", value: form.name, onChange: e => setForm({ ...form, name: e.target.value }), required: true }), _jsx("input", { placeholder: "Email", type: "email", value: form.email, onChange: e => setForm({ ...form, email: e.target.value }), required: true }), _jsx("input", { placeholder: "Password (min 6)", type: "password", value: form.password, onChange: e => setForm({ ...form, password: e.target.value }), required: true }), _jsxs("select", { value: form.role, onChange: e => setForm({ ...form, role: e.target.value }), children: [_jsx("option", { children: "Admin" }), _jsx("option", { children: "Sales" }), _jsx("option", { children: "Warehouse" }), _jsx("option", { children: "Accounts" })] }), _jsx("button", { className: "btn-primary", type: "submit", children: "Add User" })] }), error && _jsx("p", { className: "error", children: error })] }), _jsx("div", { className: "card", children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Name" }), _jsx("th", { children: "Email" }), _jsx("th", { children: "Role" }), _jsx("th", { children: "Actions" })] }) }), _jsx("tbody", { children: users.map(u => (_jsxs("tr", { children: [_jsx("td", { children: u.name }), _jsx("td", { children: u.email }), _jsx("td", { children: _jsx("span", { className: `role-badge role-${u.role.toLowerCase()}`, children: u.role }) }), _jsx("td", { children: _jsx("button", { className: "btn-danger", onClick: () => del(u.id), children: "Delete" }) })] }, u.id))) })] }) })] }));
}
