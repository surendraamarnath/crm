import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
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
    { to: '/customers', label: 'Customers', roles: ['Admin', 'Sales'] },
    { to: '/employees', label: 'Employees', roles: ['Admin', 'Accounts'] },
    { to: '/products', label: 'Inventory', roles: ['Admin', 'Warehouse', 'Sales'] },
    { to: '/sales', label: 'Sales', roles: ['Admin', 'Sales', 'Accounts'] },
    { to: '/users', label: 'Users', roles: ['Admin'] },
];
function ProtectedRoute({ children, roles }) {
    const { user, token } = useAuth();
    if (!token)
        return _jsx(Navigate, { to: "/login", replace: true });
    if (!roles.includes(user.role))
        return _jsx(Navigate, { to: "/", replace: true });
    return children;
}
function Layout() {
    const { user, logout } = useAuth();
    const visibleNav = NAV.filter(n => n.roles.includes(user.role));
    const defaultPath = visibleNav[0]?.to ?? '/login';
    return (_jsxs(_Fragment, { children: [_jsxs("nav", { className: "navbar", children: [_jsx("span", { className: "brand", children: "Mini ERP" }), _jsx("div", { className: "nav-links", children: visibleNav.map(n => _jsx(NavLink, { to: n.to, children: n.label }, n.to)) }), _jsxs("div", { className: "nav-user", children: [_jsx("span", { className: `role-badge role-${user.role.toLowerCase()}`, children: user.role }), _jsx("span", { style: { color: '#ccc', fontSize: '0.85rem' }, children: user.name }), _jsx("button", { className: "btn-logout", onClick: logout, children: "Logout" })] })] }), _jsx("main", { className: "container", children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Navigate, { to: defaultPath, replace: true }) }), _jsx(Route, { path: "/customers", element: _jsx(ProtectedRoute, { roles: ['Admin', 'Sales'], children: _jsx(Customers, {}) }) }), _jsx(Route, { path: "/customers/:id", element: _jsx(ProtectedRoute, { roles: ['Admin', 'Sales'], children: _jsx(CustomerDetail, {}) }) }), _jsx(Route, { path: "/employees", element: _jsx(ProtectedRoute, { roles: ['Admin', 'Accounts'], children: _jsx(Employees, {}) }) }), _jsx(Route, { path: "/products", element: _jsx(ProtectedRoute, { roles: ['Admin', 'Warehouse', 'Sales'], children: _jsx(Products, {}) }) }), _jsx(Route, { path: "/products/:id", element: _jsx(ProtectedRoute, { roles: ['Admin', 'Warehouse', 'Sales'], children: _jsx(ProductDetail, {}) }) }), _jsx(Route, { path: "/sales", element: _jsx(ProtectedRoute, { roles: ['Admin', 'Sales', 'Accounts'], children: _jsx(Sales, {}) }) }), _jsx(Route, { path: "/challans/:id", element: _jsx(ProtectedRoute, { roles: ['Admin', 'Sales', 'Accounts'], children: _jsx(ChallanDetail, {}) }) }), _jsx(Route, { path: "/users", element: _jsx(ProtectedRoute, { roles: ['Admin'], children: _jsx(Users, {}) }) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: defaultPath, replace: true }) })] }) })] }));
}
export default function App() {
    const { token } = useAuth();
    return (_jsx(BrowserRouter, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: token ? _jsx(Navigate, { to: "/", replace: true }) : _jsx(Login, {}) }), _jsx(Route, { path: "/signup", element: token ? _jsx(Navigate, { to: "/", replace: true }) : _jsx(Signup, {}) }), _jsx(Route, { path: "/*", element: token ? _jsx(Layout, {}) : _jsx(Navigate, { to: "/login", replace: true }) })] }) }));
}
