// ==================== src/App.jsx ====================
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { Suspense } from 'react';
import LoadingSpinner from './components/common/LoadingSpinner';
import AutoLogout from './components/common/AutoLogout';

// Lazy load de páginas para mejorar rendimiento (Code Splitting)
const Login = React.lazy(() => import('./pages/Login'));
const AdminPanel = React.lazy(() => import('./pages/AdminPanel'));
const EstudiantePanel = React.lazy(() => import('./pages/EstudiantePanel'));

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
        <Suspense fallback={<LoadingSpinner fullScreen />}>
            <Routes>
                {/* Ruta pública */}
                <Route path="/login" element={<Login />} />

                {/* Ruta raíz - redirige según rol */}
                <Route path="/" element={<RoleBasedRedirect />} />

                {/* Rutas de Admin */}
                <Route
                    path="/admin/*"
                    element={
                        <ProtectedRoute requiredRole="administrador">
                            <AdminPanel />
                        </ProtectedRoute>
                    }
                />

                {/* Rutas de Estudiante */}
                <Route
                    path="/estudiante/*"
                    element={
                        <ProtectedRoute requiredRole="estudiante">
                            <EstudiantePanel />
                        </ProtectedRoute>
                    }
                />

                {/* Ruta 404 */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Suspense>
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