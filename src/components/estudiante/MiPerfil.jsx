import React, { useState, useEffect } from 'react';
import { User, Lock, Save, Mail, Building2, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { estudianteAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function MiPerfil() {
    const { user, updateUser } = useAuth();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(false);

    const [userData, setUserData] = useState({
        nombres: user?.nombres || '',
        apellidos: user?.apellidos || '',
        email: user?.email || '',
        universidad: user?.Universidad?.nombre || user?.universidad || '',
        periodo: ''
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Remove local message state and effect
    // const [message, setMessage] = useState({ type: '', text: '' });
    // useEffect for message dismissal removed as ToastContext handles it

    const loadUserProfile = async () => {
        try {
            setLoading(true);
            const data = await estudianteAPI.getPerfil();
            console.log('Datos perfil recibidos:', data);

            if (data.success) {
                setUserData({
                    nombres: data.estudiante.nombres || '',
                    apellidos: data.estudiante.apellidos || '',
                    email: data.estudiante.email || '',
                    universidad: data.estudiante.universidad || 'No asignada',
                    periodo: data.estudiante.periodo_id || 'No activo'
                });
            }
        } catch (error) {
            console.error('Error cargando perfil:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUserProfile();
    }, []);

    const handleInfoSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        // setMessage({ type: '', text: '' }); // toast handles this

        try {
            const payload = {
                nombres: userData.nombres,
                apellidos: userData.apellidos
            };
            console.log('Enviando perfil:', payload);

            const data = await estudianteAPI.actualizarPerfil(payload);

            if (data.success) {
                showToast(data.message || 'Perfil actualizado exitosamente', 'success');
                // Update local context if needed, or just state
                if (data.estudiante) {
                    setUserData(prev => ({
                        ...prev,
                        nombres: data.estudiante.nombres,
                        apellidos: data.estudiante.apellidos,
                        email: data.estudiante.email
                    }));

                    // Update global auth context (Navbar sync)
                    updateUser(data.estudiante);
                }
            } else {
                showToast(data.message || 'Error al actualizar perfil', 'error');
            }
        } catch (error) {
            console.error('Error al actualizar perfil:', error.response?.data);
            showToast(error.response?.data?.message || 'Error de conexión al actualizar perfil', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showToast('Las nuevas contraseñas no coinciden.', 'error');
            return;
        }

        setLoading(true);
        try {
            const data = await estudianteAPI.cambiarPassword(
                passwordData.currentPassword,
                passwordData.newPassword
            );

            if (data.success) {
                showToast(data.message || 'Contraseña actualizada correctamente', 'success');
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                showToast(data.message || 'Error al cambiar contraseña', 'error');
            }
        } catch (error) {
            showToast(error.response?.data?.message || 'Error al cambiar contraseña', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Mi Perfil</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Administra tu información personal y seguridad
                </p>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-white dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700 w-fit">
                <button
                    onClick={() => setActiveTab('general')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'general'
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                >
                    <User className="w-4 h-4" />
                    Información Personal
                </button>
                <button
                    onClick={() => setActiveTab('security')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'security'
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                >
                    <Lock className="w-4 h-4" />
                    Seguridad
                </button>
            </div>

            {/* Content Area */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Global toast system handles messages now */}

                <div className="p-6 md:p-8">
                    {activeTab === 'general' ? (
                        <form onSubmit={handleInfoSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nombres</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            value={userData.nombres}
                                            onChange={(e) => setUserData({ ...userData, nombres: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                                            placeholder="Tus nombres"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Apellidos</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            value={userData.apellidos}
                                            onChange={(e) => setUserData({ ...userData, apellidos: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                                            placeholder="Tus apellidos"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="email"
                                            value={userData.email}
                                            disabled
                                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-600/50 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">El email no se puede cambiar.</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Universidad</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            value={userData.universidad}
                                            disabled
                                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-600/50 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-700">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    Guardar Cambios
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-lg">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Contraseña Actual</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="password"
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                            required
                                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 pt-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nueva Contraseña</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="password"
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            required
                                            minLength={6}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                                            placeholder="Mínimo 6 caracteres"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Confirmar Nueva Contraseña</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="password"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                            required
                                            minLength={6}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                                            placeholder="Repite la nueva contraseña"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-700">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    Actualizar Contraseña
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
