import React, { useState, useEffect } from 'react';
import { User, Lock, Save, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import Card from '../common/Card';
import Alert from '../common/Alert';
import { handleApiError } from '../../utils/helpers';

export default function AdminProfile() {
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Profile Form Data
    const [profileData, setProfileData] = useState({
        nombres: '',
        apellidos: '',
        email: ''
    });

    // Password Form Data
    const [passwordData, setPasswordData] = useState({
        password_actual: '',
        nueva_password: '',
        confirmar_password: ''
    });

    useEffect(() => {
        if (user) {
            setProfileData({
                nombres: user.nombres || '',
                apellidos: user.apellidos || '',
                email: user.email || ''
            });
        }
    }, [user]);

    const handleProfileChange = (e) => {
        setProfileData({
            ...profileData,
            [e.target.name]: e.target.value
        });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value
        });
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        setLoading(true);

        try {
            const data = await authAPI.actualizarPerfil(profileData);
            if (data.success) {
                updateUser(data.user || profileData);
                setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
            } else {
                setMessage({ type: 'error', text: data.error || 'Error al actualizar perfil' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: handleApiError(err) });
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (passwordData.nueva_password !== passwordData.confirmar_password) {
            setMessage({ type: 'error', text: 'las nuevas contraseñas no coinciden' });
            return;
        }

        if (passwordData.nueva_password.length < 6) {
            setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres' });
            return;
        }

        setLoading(true);

        try {
            const data = await authAPI.cambiarPassword(
                passwordData.password_actual,
                passwordData.nueva_password
            );

            if (data.success) {
                setMessage({ type: 'success', text: 'Contraseña actualizada correctamente' });
                setPasswordData({
                    password_actual: '',
                    nueva_password: '',
                    confirmar_password: ''
                });
            } else {
                setMessage({ type: 'error', text: data.error || 'Error al cambiar contraseña' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: handleApiError(err) });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Perfil de Administrador</h2>
                <p className="text-gray-600 mt-1">Gestiona tu información personal y seguridad</p>
            </div>

            {message.text && (
                <Alert type={message.type} message={message.text} onClose={() => setMessage({ type: '', text: '' })} />
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Columna Izquierda - Resumen */}
                <div className="md:col-span-1 space-y-6">
                    <Card>
                        <div className="flex flex-col items-center text-center p-4">
                            <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-4 text-indigo-600">
                                <User className="w-12 h-12" />
                            </div>
                            <h3 className="font-bold text-lg text-gray-900">
                                {user?.nombres} {user?.apellidos}
                            </h3>
                            <p className="text-gray-500 text-sm mb-2">{user?.email}</p>
                            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold uppercase">
                                {user?.tipo}
                            </span>
                        </div>
                    </Card>

                    <Card>
                        <div className="p-2 space-y-4">
                            <div className="flex items-center gap-3 text-gray-700">
                                <Shield className="w-5 h-5 text-green-600" />
                                <span className="text-sm">Cuenta Segura</span>
                            </div>
                            <p className="text-xs text-gray-500">
                                Último acceso: {new Date().toLocaleDateString()}
                            </p>
                        </div>
                    </Card>
                </div>

                {/* Columna Derecha - Formularios */}
                <div className="md:col-span-2 space-y-6">
                    {/* Información Personal */}
                    <Card>
                        <div className="mb-4 pb-4 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <User className="w-5 h-5 text-indigo-600" />
                                Información Personal
                            </h3>
                        </div>
                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nombres
                                    </label>
                                    <input
                                        type="text"
                                        name="nombres"
                                        value={profileData.nombres}
                                        onChange={handleProfileChange}
                                        className="input-field"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Apellidos
                                    </label>
                                    <input
                                        type="text"
                                        name="apellidos"
                                        value={profileData.apellidos}
                                        onChange={handleProfileChange}
                                        className="input-field"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Correo Electrónico
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={profileData.email}
                                    onChange={handleProfileChange}
                                    className="input-field bg-gray-50 text-gray-500"
                                    required
                                // disabled // Usualmente el email es identificador único
                                />
                            </div>
                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary flex items-center gap-2"
                                >
                                    {loading ? 'Guardando...' : (
                                        <>
                                            <Save className="w-4 h-4" /> Guardar Cambios
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </Card>

                    {/* Seguridad */}
                    <Card>
                        <div className="mb-4 pb-4 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Lock className="w-5 h-5 text-indigo-600" />
                                Seguridad
                            </h3>
                        </div>
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Contraseña Actual
                                </label>
                                <input
                                    type="password"
                                    name="password_actual"
                                    value={passwordData.password_actual}
                                    onChange={handlePasswordChange}
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nueva Contraseña
                                    </label>
                                    <input
                                        type="password"
                                        name="nueva_password"
                                        value={passwordData.nueva_password}
                                        onChange={handlePasswordChange}
                                        className="input-field"
                                        required
                                        minLength={6}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Confirmar Contraseña
                                    </label>
                                    <input
                                        type="password"
                                        name="confirmar_password"
                                        value={passwordData.confirmar_password}
                                        onChange={handlePasswordChange}
                                        className="input-field"
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-secondary flex items-center gap-2 hover:text-indigo-600 hover:bg-indigo-50"
                                >
                                    {loading ? 'Procesando...' : (
                                        <>
                                            <Save className="w-4 h-4" /> Actualizar Contraseña
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
}
