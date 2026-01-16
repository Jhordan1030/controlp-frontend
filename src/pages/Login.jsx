import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { BookOpen, Mail, Lock, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import ForcePasswordChange from '../components/auth/ForcePasswordChange';

export default function Login() {
    const { user, login } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Estado para forzar cambio de contraseña
    const [authData, setAuthData] = useState(null); // Guardar token y usuario temporalmente
    const [showForceChange, setShowForceChange] = useState(false);

    // Si ya está autenticado, redirigir según su rol
    if (user) {
        return <Navigate to="/" replace />;
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await authAPI.login(formData.email, formData.password);

            if (data.success) {
                const { token, usuario } = data;

                if (usuario.debe_cambiar_password) {
                    // Si debe cambiar contraseña, guardamos datos temporales y mostramos el modal
                    setAuthData({ token, usuario });
                    setShowForceChange(true);
                } else {
                    // Flujo normal
                    login(token, usuario);
                    navigate('/', { replace: true });
                }
            } else {
                setError(data.error || 'Error al iniciar sesión');
            }
        } catch (err) {
            // Manejar errores
            let errorMessage = 'Error al iniciar sesión';

            if (err.response) {
                console.error('❌ Error del servidor:', err.response.data);
                errorMessage = err.response.data?.error ||
                    err.response.data?.message ||
                    `Error ${err.response.status}`;
            } else if (err.request) {
                console.error('❌ No hay respuesta del servidor');
                errorMessage = 'No se pudo conectar con el servidor';
            } else {
                console.error('❌ Error en la solicitud:', err.message);
                errorMessage = err.message || 'Error de configuración';
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };





    const mainContent = (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 transition-colors duration-200">
            <div className="max-w-md w-full">
                {/* Logo y título */}
                <div className="text-center mb-8 animate-fade-in">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
                        <BookOpen className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        Control de Prácticas
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Sistema de gestión universitaria
                    </p>
                </div>

                {/* Formulario */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 animate-slide-up transition-colors duration-200">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Correo Electrónico
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                                    placeholder="tu@email.com"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Contraseña
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                                    placeholder="••••••••"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Error message */}
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl flex items-center gap-2 animate-shake">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <span className="text-sm">{error}</span>
                            </div>
                        )}

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader className="w-5 h-5 animate-spin" />
                                    <span>Iniciando sesión...</span>
                                </>
                            ) : (
                                <span>Iniciar Sesión</span>
                            )}
                        </button>
                    </form>

                    {/* Demo credentials removed */}
                </div>

                {/* Footer */}
                <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                    <p>Sistema de Control de Prácticas Universitarias</p>
                    <p className="text-xs text-gray-400 mt-1">v2.0.0 - {new Date().getFullYear()}</p>
                </div>
            </div>
        </div>
    );

    // Si debe cambiar contraseña, mostramos el componente encima (o reemplazando)
    if (showForceChange && authData) {
        return (
            <ForcePasswordChange
                token={authData.token}
                user={authData.usuario}
                initialPassword={formData.password}
                onSuccess={() => {
                    // Al tener éxito, completamos el login con los datos que ya teníamos
                    // IMPORTANTE: El backend ya actualizó debe_cambiar_password a false, pero nuestro objeto local usuario aún tiene true.
                    // Podemos actualizarlo manualmente antes de guardarlo.
                    const updatedUser = { ...authData.usuario, debe_cambiar_password: false };
                    login(authData.token, updatedUser);
                    navigate('/', { replace: true });
                }}
                onCancel={() => {
                    setShowForceChange(false);
                    setAuthData(null);
                    setFormData(prev => ({ ...prev, password: '' })); // Limpiar password por seguridad
                }}
            />
        );
    }

    return mainContent;
}