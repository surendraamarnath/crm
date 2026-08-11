import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState } from 'react';
const AuthContext = createContext(null);
export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(() => {
        const u = localStorage.getItem('user');
        return u ? JSON.parse(u) : null;
    });
    const login = (t, u) => {
        setToken(t);
        setUser(u);
        localStorage.setItem('token', t);
        localStorage.setItem('user', JSON.stringify(u));
    };
    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };
    return _jsx(AuthContext.Provider, { value: { user, token, login, logout }, children: children });
};
export const useAuth = () => useContext(AuthContext);
