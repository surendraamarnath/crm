import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  { role: 'Admin',     color: '#e94560', bg: '#fde8ec', icon: '👑' },
  { role: 'Sales',     color: '#2980b9', bg: '#e8f4fd', icon: '💼' },
  { role: 'Warehouse', color: '#27ae60', bg: '#e8fdf0', icon: '📦' },
  { role: 'Accounts',  color: '#e67e22', bg: '#fdf6e8', icon: '📊' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    try {
      const res = await authApi.login(form);
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid credentials');
    }
  };

  const activeRole = ROLES.find(r => r.role === selectedRole);

  return (
    <div className="login-wrapper">
      <div className="login-card">

        {/* Header */}
        <div className="login-header">
          <h1 className="brand" style={{ fontSize: '2rem' }}>Mini ERP</h1>
          <p style={{ color: '#888', fontSize: '0.9rem', marginTop: '0.25rem' }}>Select your role to continue</p>
        </div>

        {/* Role Selection */}
        <div className="role-grid">
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
              onClick={() => { setSelectedRole(r.role); setForm({ email: '', password: '' }); setError(''); }}
            >
              <span className="role-select-icon">{r.icon}</span>
              <span className="role-select-name">{r.role}</span>
              {selectedRole === r.role && <span className="role-check" style={{ color: r.color }}>✓</span>}
            </button>
          ))}
        </div>

        {/* Login Form — shown after role selected */}
        {selectedRole && (
          <div className="login-form-section">
            <div className="login-form-title" style={{ background: activeRole!.bg, color: activeRole!.color }}>
              {activeRole!.icon} Sign in as <strong>{selectedRole}</strong>
            </div>
            <form onSubmit={submit}>
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                style={{ minWidth: '100%' }}
              />
              <input
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                style={{ minWidth: '100%' }}
              />
              <button
                className="btn-primary"
                type="submit"
                style={{ width: '100%', padding: '0.65rem', background: activeRole!.color }}
              >
                Sign In as {selectedRole}
              </button>
            </form>
            {error && <p className="error" style={{ marginTop: '0.5rem' }}>{error}</p>}
          </div>
        )}

        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: '#888' }}>
          Don't have an account?{' '}
          <a href="/signup" style={{ color: '#e94560', textDecoration: 'none', fontWeight: 600 }}>Sign Up</a>
        </p>

      </div>
    </div>
  );
}
