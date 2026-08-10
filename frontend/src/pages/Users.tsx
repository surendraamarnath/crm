import { useEffect, useState } from 'react';
import { authApi } from '../api';

interface User { id: number; name: string; email: string; role: string; }
const empty = { name: '', email: '', password: '', role: 'Sales' };

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');

  const load = () => authApi.getUsers().then(r => setUsers(r.data));
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    try {
      await authApi.createUser(form);
      setForm(empty); load();
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0]?.msg || err.response?.data?.error || 'Error');
    }
  };

  const del = async (id: number) => { await authApi.deleteUser(id); load(); };

  return (
    <div>
      <h2 className="page-title">User Management</h2>
      <div className="card">
        <form onSubmit={submit}>
          <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <input placeholder="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          <input placeholder="Password (min 6)" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
            <option>Admin</option>
            <option>Sales</option>
            <option>Warehouse</option>
            <option>Accounts</option>
          </select>
          <button className="btn-primary" type="submit">Add User</button>
        </form>
        {error && <p className="error">{error}</p>}
      </div>
      <div className="card">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.name}</td><td>{u.email}</td>
                <td><span className={`role-badge role-${u.role.toLowerCase()}`}>{u.role}</span></td>
                <td><button className="btn-danger" onClick={() => del(u.id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
