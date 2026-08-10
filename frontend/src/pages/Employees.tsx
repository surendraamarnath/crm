import { useEffect, useState } from 'react';
import { employeesApi } from '../api';

interface Employee { id: number; name: string; email: string; role: string; salary: number; }
const empty = { name: '', email: '', role: '', salary: '' };

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const load = () => employeesApi.getAll().then(r => setEmployees(r.data));
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    try {
      if (editId) { await employeesApi.update(editId, form); setEditId(null); }
      else { await employeesApi.create(form); }
      setForm(empty); load();
    } catch (err: any) { setError(err.response?.data?.errors?.[0]?.msg || 'Error'); }
  };

  const del = async (id: number) => { await employeesApi.delete(id); load(); };
  const edit = (e: Employee) => { setForm({ name: e.name, email: e.email, role: e.role, salary: String(e.salary) }); setEditId(e.id); };

  return (
    <div>
      <h2 className="page-title">Employees</h2>
      <div className="card">
        <form onSubmit={submit}>
          <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <input placeholder="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          <input placeholder="Role" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} />
          <input placeholder="Salary" type="number" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} required />
          <button className="btn-primary" type="submit">{editId ? 'Update' : 'Add'}</button>
          {editId && <button type="button" onClick={() => { setEditId(null); setForm(empty); }}>Cancel</button>}
        </form>
        {error && <p className="error">{error}</p>}
      </div>
      <div className="card">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Salary</th><th>Actions</th></tr></thead>
          <tbody>
            {employees.map(e => (
              <tr key={e.id}>
                <td>{e.name}</td><td>{e.email}</td><td>{e.role}</td><td>${e.salary}</td>
                <td className="actions">
                  <button className="btn-edit" onClick={() => edit(e)}>Edit</button>
                  <button className="btn-danger" onClick={() => del(e.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
