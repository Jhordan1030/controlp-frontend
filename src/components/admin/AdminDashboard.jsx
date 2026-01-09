import React, { useState, useEffect } from 'react';
import { Users, Building2, Calendar, TrendingUp } from 'lucide-react';
import StatCard from '../common/StatCard';
import LoadingSpinner from '../common/LoadingSpinner';
import { adminAPI } from '../../services/api';
import { handleApiError } from '../../utils/helpers';

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            const data = await adminAPI.getDashboard();

            if (data.success) {
                setStats(data.estadisticas);
            } else {
                setError(data.error || 'Error al cargar el dashboard');
            }
        } catch (err) {
            setError(handleApiError(err));
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="text-red-600 text-center p-4">{error}</div>;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Dashboard Administrativo</h2>
                <p className="text-gray-600 mt-1">Vista general del sistema</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Universidades"
                    value={stats?.totalUniversidades || 0}
                    icon={Building2}
                    color="indigo"
                    trend={`${stats?.universidadesActivas || 0} activas`}
                />
                <StatCard
                    title="Total Periodos"
                    value={stats?.totalPeriodos || 0}
                    icon={Calendar}
                    color="blue"
                />
                <StatCard
                    title="Total Estudiantes"
                    value={stats?.totalEstudiantes || 0}
                    icon={Users}
                    color="green"
                    trend={`${stats?.estudiantesActivos || 0} activos`}
                />
                <StatCard
                    title="Actividad"
                    value="100%"
                    icon={TrendingUp}
                    color="purple"
                />
            </div>

            {/* Información adicional */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Resumen del Sistema
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-gray-600">Universidades Activas</span>
                            <span className="font-semibold text-gray-900">
                {stats?.universidadesActivas || 0}
              </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-gray-600">Estudiantes Activos</span>
                            <span className="font-semibold text-gray-900">
                {stats?.estudiantesActivos || 0}
              </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-gray-600">Total de Periodos</span>
                            <span className="font-semibold text-gray-900">
                {stats?.totalPeriodos || 0}
              </span>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                    <h3 className="text-lg font-semibold mb-4">Acceso Rápido</h3>
                    <div className="space-y-2">
                        <p className="text-indigo-100 text-sm">
                            • Gestiona universidades y periodos
                        </p>
                        <p className="text-indigo-100 text-sm">
                            • Administra estudiantes
                        </p>
                        <p className="text-indigo-100 text-sm">
                            • Monitorea el progreso de prácticas
                        </p>
                        <p className="text-indigo-100 text-sm">
                            • Genera reportes del sistema
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
