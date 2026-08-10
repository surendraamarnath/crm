import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  { role: 'Admin',     color: '#e94560', bg: '#fde8ec', icon: '👑' },
  { role: 'Sales',     color: '#2980b9', bg: '#e8f4fd', icon: '💼' },
  { role: 'Warehouse', color: '#27ae60', bg: '#e8fdf0', icon: '📦' },
  { role: 'Accounts',  color: '#e67e22', bg: '#fdf6e8', icon: '📊' },
];

export default function Signup() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const activeRole = ROLES.find(r => r.role === selectedRole);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (!selectedRole) { setError('Please select a role'); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      const res = await authApi.signup({ name: form.name, email: form.email, password: form.password, role: selectedRole });
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0]?.msg || err.response?.data?.error || 'Signup failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card" style={{ maxWidth: '440px' }}>

        {/* Header */}
        <div className="login-header">
          <h1 className="brand" style={{ fontSize: '2rem' }}>Mini ERP</h1>
          <p style={{ color: '#888', fontSize: '0.9rem', marginTop: '0.25rem' }}>Create your account</p>
        </div>

        {/* Role Selection */}
        <p className="quick-login-label" style={{ marginBottom: '0.6rem' }}>Select Your Role</p>
        <div className="role-grid" style={{ marginBottom: '1.25rem' }}>
          {ROLES.map(r => (
            <button
              key={r.role}
              type="button"
              className={`role-select-btn ${selectedRole === r.role ? 'selected' : ''}`}
              style={{
                borderColor: selectedRole === r.role ? r.color : '#e0e0e0',
                background: selectedRole === r.role ? r.bg : 'white',
                color: selectedRole === r.role ? r.color : '#555',
              }}
              onClick={() => { setSelectedRole(r.role); setError(''); }}
            >
              <span className="role-select-icon">{r.icon}</span>
              <span className="role-select-name">{r.role}</span>
              {selectedRole === r.role && <span className="role-check" style={{ color: r.color }}>✓</span>}
            </button>
          ))}
        </div>

        {/* Signup Form */}
        <form onSubmit={submit} style={{ flexDirection: 'column', gap: '0.6rem' }}>
          <input
            placeholder="Full Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            required style={{ minWidth: '100%' }}
          />
          <input
            type="email" placeholder="Email Address"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            required style={{ minWidth: '100%' }}
          />
          <input
            type="password" placeholder="Password (min 6 characters)"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            required style={{ minWidth: '100%' }}
          />
          <input
            type="password" placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
            required style={{ minWidth: '100%' }}
          />
          <button
            className="btn-primary" type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '0.65rem', marginTop: '0.25rem',
              background: activeRole ? activeRole.color : '#e94560',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Creating Account...' : `Create Account${selectedRole ? ` as ${selectedRole}` : ''}`}
          </button>
        </form>

        {error && <p className="error" style={{ marginTop: '0.5rem' }}>{error}</p>}

        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: '#888' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#e94560', textDecoration: 'none', fontWeight: 600 }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}
