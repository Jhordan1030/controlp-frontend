// ==================== src/pages/Login.jsx ====================
import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { BookOpen, Mail, Lock, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function Login() {
    const { user, login } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

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
            // Llamada DIRECTA a la API usando axios
            const response = await axios.post(
                'http://localhost:3000/api/v1/auth/login',
                formData  // Ya contiene email y password
            );

            console.log('✅ Respuesta del servidor:', response.data);

            if (response.data.success) {
                // ¡CORREGIDO! Acceder directamente a response.data
                const { token, usuario } = response.data;  // No es response.data.data

                console.log('🔑 Token recibido:', token);
                console.log('👤 Usuario recibido:', usuario);

                // Usar la función login del contexto
                login(token, usuario);

                // Redirigir a la página principal
                navigate('/', { replace: true });
            } else {
                setError(response.data.error || 'Error al iniciar sesión');
            }
        } catch (err) {
            // Manejar errores de axios
            let errorMessage = 'Error al iniciar sesión';

            if (err.response) {
                // El servidor respondió con un error
                console.error('❌ Error del servidor:', err.response.data);
                errorMessage = err.response.data?.error ||
                    err.response.data?.message ||
                    `Error ${err.response.status}`;
            } else if (err.request) {
                // La solicitud fue hecha pero no se recibió respuesta
                console.error('❌ No hay respuesta del servidor');
                errorMessage = 'No se pudo conectar con el servidor';
            } else {
                // Error en la configuración de la solicitud
                console.error('❌ Error en la solicitud:', err.message);
                errorMessage = err.message || 'Error de configuración';
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const fillDemoCredentials = (type) => {
        if (type === 'admin') {
            setFormData({
                email: 'admin@controlpracticas.com',
                password: 'Admin123!'
            });
        } else {
            setFormData({
                email: 'juan.perez@ejemplo.com',
                password: 'Estudiante123!'
            });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Logo y título */}
                <div className="text-center mb-8 animate-fade-in">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
                        <BookOpen className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Control de Prácticas
                    </h1>
                    <p className="text-gray-600">
                        Sistema de gestión universitaria
                    </p>
                </div>

                {/* Formulario */}
                <div className="bg-white rounded-2xl shadow-2xl p-8 animate-slide-up">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Correo Electrónico
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                    placeholder="tu@email.com"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Contraseña
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                    placeholder="••••••••"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Error message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2 animate-shake">
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

                    {/* Demo credentials */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <p className="text-xs text-gray-600 font-semibold mb-3 text-center">
                            Credenciales de prueba:
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => fillDemoCredentials('admin')}
                                className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium hover:bg-indigo-100 transition"
                            >
                                Cargar Admin
                            </button>
                            <button
                                type="button"
                                onClick={() => fillDemoCredentials('estudiante')}
                                className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium hover:bg-purple-100 transition"
                            >
                                Cargar Estudiante
                            </button>
                        </div>
                        <div className="mt-3 space-y-1 text-xs text-gray-500">
                            <p>Admin: admin@controlpracticas.com</p>
                            <p>Estudiante: juan.perez@ejemplo.com</p>
                            <p>Contraseña: <span className="font-mono">Admin123!</span> para admin</p>
                            <p>Contraseña: <span className="font-mono">Estudiante123!</span> para estudiante</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 text-center text-sm text-gray-600">
                    <p>Sistema de Control de Prácticas Universitarias</p>
                    <p className="text-xs text-gray-400 mt-1">v1.0.0 - 2025</p>
                </div>
            </div>
        </div>
    );
}