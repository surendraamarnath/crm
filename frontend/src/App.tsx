import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { useAuth, Role } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import Employees from './pages/Employees';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Sales from './pages/Sales';
import ChallanDetail from './pages/ChallanDetail';
import Users from './pages/Users';
import './App.css';

const NAV = [
  { to: '/customers',  label: 'Customers', roles: ['Admin','Sales'] },
  { to: '/employees',  label: 'Employees', roles: ['Admin','Accounts'] },
  { to: '/products',   label: 'Inventory',  roles: ['Admin','Warehouse','Sales'] },
  { to: '/sales',      label: 'Sales',      roles: ['Admin','Sales','Accounts'] },
  { to: '/users',      label: 'Users',      roles: ['Admin'] },
] as { to: string; label: string; roles: Role[] }[];

function ProtectedRoute({ children, roles }: { children: JSX.Element; roles: Role[] }) {
  const { user, token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (!roles.includes(user!.role)) return <Navigate to="/" replace />;
  return children;
}

function Layout() {
  const { user, logout } = useAuth();
  const visibleNav = NAV.filter(n => n.roles.includes(user!.role));
  const defaultPath = visibleNav[0]?.to ?? '/login';

  return (
    <>
      <nav className="navbar">
        <span className="brand">Mini ERP</span>
        <div className="nav-links">
          {visibleNav.map(n => <NavLink key={n.to} to={n.to}>{n.label}</NavLink>)}
        </div>
        <div className="nav-user">
          <span className={`role-badge role-${user!.role.toLowerCase()}`}>{user!.role}</span>
          <span style={{ color: '#ccc', fontSize: '0.85rem' }}>{user!.name}</span>
          <button className="btn-logout" onClick={logout}>Logout</button>
        </div>
      </nav>
      <main className="container">
        <Routes>
          <Route path="/" element={<Navigate to={defaultPath} replace />} />
          <Route path="/customers" element={<ProtectedRoute roles={['Admin','Sales']}><Customers /></ProtectedRoute>} />
          <Route path="/customers/:id" element={<ProtectedRoute roles={['Admin','Sales']}><CustomerDetail /></ProtectedRoute>} />
          <Route path="/employees" element={<ProtectedRoute roles={['Admin','Accounts']}><Employees /></ProtectedRoute>} />
          <Route path="/products"  element={<ProtectedRoute roles={['Admin','Warehouse','Sales']}><Products /></ProtectedRoute>} />
          <Route path="/products/:id" element={<ProtectedRoute roles={['Admin','Warehouse','Sales']}><ProductDetail /></ProtectedRoute>} />
          <Route path="/sales"     element={<ProtectedRoute roles={['Admin','Sales','Accounts']}><Sales /></ProtectedRoute>} />
          <Route path="/challans/:id" element={<ProtectedRoute roles={['Admin','Sales','Accounts']}><ChallanDetail /></ProtectedRoute>} />
          <Route path="/users"     element={<ProtectedRoute roles={['Admin']}><Users /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to={defaultPath} replace />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  const { token } = useAuth();
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/signup" element={token ? <Navigate to="/" replace /> : <Signup />} />
        <Route path="/*" element={token ? <Layout /> : <Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
