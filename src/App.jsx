// ==================== src/App.jsx ====================
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import LoadingSpinner from './components/common/LoadingSpinner';
// Lazy load de páginas para mejorar rendimiento
import Login from './pages/Login';
import AdminPanel from './pages/AdminPanel';
import EstudiantePanel from './pages/EstudiantePanel';
import AutoLogout from './components/common/AutoLogout';

// Componente para rutas protegidas
function ProtectedRoute({ children, requiredRole }) {
    const { user, loading } = useAuth();

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && user.tipo !== requiredRole) {
        return <Navigate to="/" replace />;
    }

    return children;
}

// Componente de redirección según rol
function RoleBasedRedirect() {
    const { user, loading } = useAuth();

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.tipo === 'administrador') {
        return <Navigate to="/admin" replace />;
    }

    return <Navigate to="/estudiante" replace />;
}

// Componente principal de rutas
function AppRoutes() {
    return (
        <Routes>
            {/* Ruta pública */}
            <Route path="/login" element={<Login />} />

            {/* Ruta raíz - redirige según rol */}
            <Route path="/" element={<RoleBasedRedirect />} />

            {/* Rutas de Admin */}
            <Route
                path="/admin"
                element={
                    <ProtectedRoute requiredRole="administrador">
                        <AdminPanel />
                    </ProtectedRoute>
                }
            />

            {/* Rutas de Estudiante */}
            <Route
                path="/estudiante"
                element={
                    <ProtectedRoute requiredRole="estudiante">
                        <EstudiantePanel />
                    </ProtectedRoute>
                }
            />

            {/* Ruta 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

// Componente principal App
export default function App() {
    return (
        <Router>
            <ThemeProvider>
                <ToastProvider>
                    <AuthProvider>
                        <AutoLogout />
                        <AppRoutes />
                    </AuthProvider>
                </ToastProvider>
            </ThemeProvider>
        </Router>
    );
}