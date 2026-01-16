import React, { useState } from 'react';
import { Lock, Save, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { estudianteAPI } from '../../services/api';

export default function ForcePasswordChange({ token, user, initialPassword, onSuccess, onCancel }) {
    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (passwordData.newPassword.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('Las nuevas contraseñas no coinciden.');
            return;
        }

        if (passwordData.newPassword === initialPassword) {
            setError('La nueva contraseña no puede ser igual a la actual.');
            return;
        }

        setLoading(true);
        try {
            // Pasamos el token explícitamente porque aún no está en el contexto global/localStorage
            // O si está, nos aseguramos de usar el de esta sesión.
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            const response = await estudianteAPI.cambiarPassword(
                initialPassword, // Contraseña actual (temporal)
                passwordData.newPassword,
                config
            );

            if (response.success) {
                setSuccess(true);
                // Esperar un momento para mostrar el éxito antes de redirigir
                setTimeout(() => {
                    onSuccess();
                }, 1500);
            } else {
                setError(response.message || 'Error al cambiar la contraseña');
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Error de conexión al cambiar contraseña');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fadeIn">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-8 text-center animate-scaleIn">
                    <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        ¡Contraseña Actualizada!
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                        Redirigiendo al dashboard...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
                {/* Header */}
                <div className="bg-indigo-600 p-6 text-center">
                    <div className="mx-auto w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3 backdrop-blur-sm">
                        <Lock className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-white">
                        Cambio de Contraseña Obligatorio
                    </h2>
                    <p className="text-indigo-100 text-sm mt-1">
                        Por seguridad, debes actualizar tu contraseña antes de continuar.
                    </p>
                </div>

                <div className="p-8">
                    {/* User Info */}
                    <div className="mb-6 flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700">
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-400">
                            {user.nombres.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {user.nombres} {user.apellidos}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {user.email}
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Nueva Contraseña
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    placeholder="Mínimo 6 caracteres"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Confirmar Contraseña
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    placeholder="Repite la contraseña"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="flex flex-col gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                {loading ? 'Actualizando...' : 'Actualizar y Entrar'}
                            </button>

                            <button
                                type="button"
                                onClick={onCancel}
                                disabled={loading}
                                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                            >
                                Cancelar y salir
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
