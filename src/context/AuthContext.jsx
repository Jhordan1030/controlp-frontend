// ==================== src/context/AuthContext.jsx ====================
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { isTokenExpired } from '../utils/helpers';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            // Verificar si el token ha expirado
            if (isTokenExpired(storedToken)) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            } else {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));

                // Configurar axios con el token para futuras peticiones
                axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            }
        }
        setLoading(false);
    }, []);

    // Efecto para verificar periódicamente la expiración del token
    useEffect(() => {
        if (!token) return;

        // Verificar cada minuto (60000ms)
        const intervalId = setInterval(() => {
            if (isTokenExpired(token)) {
                logout();
                // Opcional: Redirigir explícitamente si es necesario, aunque el cambio de estado 'user' a null
                // debería disparar la redirección en los componentes protegidos.
                window.location.href = '/login';
            }
        }, 60000);

        return () => clearInterval(intervalId);
    }, [token]);

    // Función login actualizada - ahora solo guarda datos, no hace la petición
    const login = (token, usuario) => {
        setToken(token);
        setUser(usuario);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(usuario));

        // Configurar axios para futuras peticiones
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Remover el header de autorización de axios
        delete axios.defaults.headers.common['Authorization'];
    };

    const updateUser = (userData) => {
        const newUser = { ...user, ...userData };
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
    };

    const value = {
        user,
        token,
        loading,
        login,
        logout,
        updateUser,
        isAuthenticated: !!user && !!token,
        isAdmin: user?.tipo === 'administrador',
        isEstudiante: user?.tipo === 'estudiante'
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de AuthProvider');
    }
    return context;
};