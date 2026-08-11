import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api';
import { useAuth } from '../context/AuthContext';
const ROLES = [
    { role: 'Admin', color: '#e94560', bg: '#fde8ec', icon: '👑' },
    { role: 'Sales', color: '#2980b9', bg: '#e8f4fd', icon: '💼' },
    { role: 'Warehouse', color: '#27ae60', bg: '#e8fdf0', icon: '📦' },
    { role: 'Accounts', color: '#e67e22', bg: '#fdf6e8', icon: '📊' },
];
export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState(null);
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const submit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await authApi.login(form);
            login(res.data.token, res.data.user);
            navigate('/');
        }
        catch (err) {
            setError(err.response?.data?.error || 'Invalid credentials');
        }
    };
    const activeRole = ROLES.find(r => r.role === selectedRole);
    return (_jsx("div", { className: "login-wrapper", children: _jsxs("div", { className: "login-card", children: [_jsxs("div", { className: "login-header", children: [_jsx("h1", { className: "brand", style: { fontSize: '2rem' }, children: "Mini ERP" }), _jsx("p", { style: { color: '#888', fontSize: '0.9rem', marginTop: '0.25rem' }, children: "Select your role to continue" })] }), _jsx("div", { className: "role-grid", children: ROLES.map(r => (_jsxs("button", { type: "button", className: `role-select-btn ${selectedRole === r.role ? 'selected' : ''}`, style: {
                            borderColor: selectedRole === r.role ? r.color : '#e0e0e0',
                            background: selectedRole === r.role ? r.bg : 'white',
                            color: selectedRole === r.role ? r.color : '#555',
                        }, onClick: () => { setSelectedRole(r.role); setForm({ email: '', password: '' }); setError(''); }, children: [_jsx("span", { className: "role-select-icon", children: r.icon }), _jsx("span", { className: "role-select-name", children: r.role }), selectedRole === r.role && _jsx("span", { className: "role-check", style: { color: r.color }, children: "\u2713" })] }, r.role))) }), selectedRole && (_jsxs("div", { className: "login-form-section", children: [_jsxs("div", { className: "login-form-title", style: { background: activeRole.bg, color: activeRole.color }, children: [activeRole.icon, " Sign in as ", _jsx("strong", { children: selectedRole })] }), _jsxs("form", { onSubmit: submit, children: [_jsx("input", { type: "email", placeholder: "Email", value: form.email, onChange: e => setForm({ ...form, email: e.target.value }), required: true, style: { minWidth: '100%' } }), _jsx("input", { type: "password", placeholder: "Password", value: form.password, onChange: e => setForm({ ...form, password: e.target.value }), required: true, style: { minWidth: '100%' } }), _jsxs("button", { className: "btn-primary", type: "submit", style: { width: '100%', padding: '0.65rem', background: activeRole.color }, children: ["Sign In as ", selectedRole] })] }), error && _jsx("p", { className: "error", style: { marginTop: '0.5rem' }, children: error })] })), _jsxs("p", { style: { textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: '#888' }, children: ["Don't have an account?", ' ', _jsx("a", { href: "/signup", style: { color: '#e94560', textDecoration: 'none', fontWeight: 600 }, children: "Sign Up" })] })] }) }));
}
