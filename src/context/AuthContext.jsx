// ==================== src/context/AuthContext.jsx ====================
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));

            // Configurar axios con el token para futuras peticiones
            axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
        setLoading(false);
    }, []);

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

    const value = {
        user,
        token,
        loading,
        login,
        logout,
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