import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { employeesApi } from '../api';
const empty = { name: '', email: '', role: '', salary: '' };
export default function Employees() {
    const [employees, setEmployees] = useState([]);
    const [form, setForm] = useState(empty);
    const [editId, setEditId] = useState(null);
    const [error, setError] = useState('');
    const load = () => employeesApi.getAll().then(r => setEmployees(r.data));
    useEffect(() => { load(); }, []);
    const submit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (editId) {
                await employeesApi.update(editId, form);
                setEditId(null);
            }
            else {
                await employeesApi.create(form);
            }
            setForm(empty);
            load();
        }
        catch (err) {
            setError(err.response?.data?.errors?.[0]?.msg || 'Error');
        }
    };
    const del = async (id) => { await employeesApi.delete(id); load(); };
    const edit = (e) => { setForm({ name: e.name, email: e.email, role: e.role, salary: String(e.salary) }); setEditId(e.id); };
    return (_jsxs("div", { children: [_jsx("h2", { className: "page-title", children: "Employees" }), _jsxs("div", { className: "card", children: [_jsxs("form", { onSubmit: submit, children: [_jsx("input", { placeholder: "Name", value: form.name, onChange: e => setForm({ ...form, name: e.target.value }), required: true }), _jsx("input", { placeholder: "Email", type: "email", value: form.email, onChange: e => setForm({ ...form, email: e.target.value }), required: true }), _jsx("input", { placeholder: "Role", value: form.role, onChange: e => setForm({ ...form, role: e.target.value }) }), _jsx("input", { placeholder: "Salary", type: "number", value: form.salary, onChange: e => setForm({ ...form, salary: e.target.value }), required: true }), _jsx("button", { className: "btn-primary", type: "submit", children: editId ? 'Update' : 'Add' }), editId && _jsx("button", { type: "button", onClick: () => { setEditId(null); setForm(empty); }, children: "Cancel" })] }), error && _jsx("p", { className: "error", children: error })] }), _jsx("div", { className: "card", children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Name" }), _jsx("th", { children: "Email" }), _jsx("th", { children: "Role" }), _jsx("th", { children: "Salary" }), _jsx("th", { children: "Actions" })] }) }), _jsx("tbody", { children: employees.map(e => (_jsxs("tr", { children: [_jsx("td", { children: e.name }), _jsx("td", { children: e.email }), _jsx("td", { children: e.role }), _jsxs("td", { children: ["$", e.salary] }), _jsxs("td", { className: "actions", children: [_jsx("button", { className: "btn-edit", onClick: () => edit(e), children: "Edit" }), _jsx("button", { className: "btn-danger", onClick: () => del(e.id), children: "Delete" })] })] }, e.id))) })] }) })] }));
}
