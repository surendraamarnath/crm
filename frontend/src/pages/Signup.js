import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api';
import { useAuth } from '../context/AuthContext';
const ROLES = [
    { role: 'Admin', color: '#e94560', bg: '#fde8ec', icon: '👑' },
    { role: 'Sales', color: '#2980b9', bg: '#e8f4fd', icon: '💼' },
    { role: 'Warehouse', color: '#27ae60', bg: '#e8fdf0', icon: '📦' },
    { role: 'Accounts', color: '#e67e22', bg: '#fdf6e8', icon: '📊' },
];
export default function Signup() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState(null);
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const activeRole = ROLES.find(r => r.role === selectedRole);
    const submit = async (e) => {
        e.preventDefault();
        setError('');
        if (!selectedRole) {
            setError('Please select a role');
            return;
        }
        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setLoading(true);
        try {
            const res = await authApi.signup({ name: form.name, email: form.email, password: form.password, role: selectedRole });
            login(res.data.token, res.data.user);
            navigate('/');
        }
        catch (err) {
            setError(err.response?.data?.errors?.[0]?.msg || err.response?.data?.error || 'Signup failed');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "login-wrapper", children: _jsxs("div", { className: "login-card", style: { maxWidth: '440px' }, children: [_jsxs("div", { className: "login-header", children: [_jsx("h1", { className: "brand", style: { fontSize: '2rem' }, children: "Mini ERP" }), _jsx("p", { style: { color: '#888', fontSize: '0.9rem', marginTop: '0.25rem' }, children: "Create your account" })] }), _jsx("p", { className: "quick-login-label", style: { marginBottom: '0.6rem' }, children: "Select Your Role" }), _jsx("div", { className: "role-grid", style: { marginBottom: '1.25rem' }, children: ROLES.map(r => (_jsxs("button", { type: "button", className: `role-select-btn ${selectedRole === r.role ? 'selected' : ''}`, style: {
                            borderColor: selectedRole === r.role ? r.color : '#e0e0e0',
                            background: selectedRole === r.role ? r.bg : 'white',
                            color: selectedRole === r.role ? r.color : '#555',
                        }, onClick: () => { setSelectedRole(r.role); setError(''); }, children: [_jsx("span", { className: "role-select-icon", children: r.icon }), _jsx("span", { className: "role-select-name", children: r.role }), selectedRole === r.role && _jsx("span", { className: "role-check", style: { color: r.color }, children: "\u2713" })] }, r.role))) }), _jsxs("form", { onSubmit: submit, style: { flexDirection: 'column', gap: '0.6rem' }, children: [_jsx("input", { placeholder: "Full Name", value: form.name, onChange: e => setForm({ ...form, name: e.target.value }), required: true, style: { minWidth: '100%' } }), _jsx("input", { type: "email", placeholder: "Email Address", value: form.email, onChange: e => setForm({ ...form, email: e.target.value }), required: true, style: { minWidth: '100%' } }), _jsx("input", { type: "password", placeholder: "Password (min 6 characters)", value: form.password, onChange: e => setForm({ ...form, password: e.target.value }), required: true, style: { minWidth: '100%' } }), _jsx("input", { type: "password", placeholder: "Confirm Password", value: form.confirmPassword, onChange: e => setForm({ ...form, confirmPassword: e.target.value }), required: true, style: { minWidth: '100%' } }), _jsx("button", { className: "btn-primary", type: "submit", disabled: loading, style: {
                                width: '100%', padding: '0.65rem', marginTop: '0.25rem',
                                background: activeRole ? activeRole.color : '#e94560',
                                opacity: loading ? 0.7 : 1,
                            }, children: loading ? 'Creating Account...' : `Create Account${selectedRole ? ` as ${selectedRole}` : ''}` })] }), error && _jsx("p", { className: "error", style: { marginTop: '0.5rem' }, children: error }), _jsxs("p", { style: { textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: '#888' }, children: ["Already have an account?", ' ', _jsx(Link, { to: "/login", style: { color: '#e94560', textDecoration: 'none', fontWeight: 600 }, children: "Sign In" })] })] }) }));
}
