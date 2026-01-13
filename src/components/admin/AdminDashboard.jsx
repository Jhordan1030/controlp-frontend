import React, { useState, useEffect } from 'react';
import { Users, Building2, Calendar, TrendingUp, Clock, ArrowRight, Shield, Activity, Bell } from 'lucide-react';
import StatCard from '../common/StatCard';
import LoadingSpinner from '../common/LoadingSpinner';
import { adminAPI } from '../../services/api';
import { handleApiError } from '../../utils/helpers';

export default function AdminDashboard({ setActiveTab }) {
    const [stats, setStats] = useState(null);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [statsData, activityData] = await Promise.all([
                adminAPI.getDashboard(),
                adminAPI.getAuditoria({ limit: 5 }) // Obtener ultimas 5 acciones
            ]);

            if (statsData.success) {
                setStats(statsData.estadisticas);
            } else {
                setError(statsData.error || 'Error al cargar estadísticas');
            }

            if (activityData.success) {
                setRecentActivity(activityData.data);
            }
        } catch (err) {
            console.error(err);
            setError('Error cargando datos del dashboard');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    // Quick Actions Configuration
    const quickActions = [
        {
            title: 'Gestionar Estudiantes',
            desc: 'Registrar, editar o desactivar estudiantes',
            icon: Users,
            color: 'bg-blue-100 text-blue-600',
            action: () => setActiveTab('estudiantes')
        },
        {
            title: 'Gestionar Universidades',
            desc: 'Administrar convenios y entidades',
            icon: Building2,
            color: 'bg-indigo-100 text-indigo-600',
            action: () => setActiveTab('universidades')
        },
        {
            title: 'Gestionar Periodos',
            desc: 'Configurar ciclos académicos',
            icon: Calendar,
            color: 'bg-purple-100 text-purple-600',
            action: () => setActiveTab('periodos')
        },
        {
            title: 'Auditoría del Sistema',
            desc: 'Ver registro de todas las acciones',
            icon: Shield,
            color: 'bg-green-100 text-green-600',
            action: () => setActiveTab('auditoria')
        }
    ];

    const formatActivityTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h2>
                <p className="text-gray-500 mt-1">Bienvenido al panel de control general del sistema.</p>
            </div>

            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
                    {error}
                </div>
            )}

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
                    trend={`${stats?.periodosActivos || 0} en curso`}
                />
                <StatCard
                    title="Total Estudiantes"
                    value={stats?.totalEstudiantes || 0}
                    icon={Users}
                    color="green"
                    trend={`${stats?.estudiantesActivos || 0} activos`}
                />
                <StatCard
                    title="Registros de Actividad"
                    value={recentActivity?.length > 0 ? '+Active' : 'N/A'}
                    icon={Activity}
                    color="purple"
                    trend="Sistema monitoreado"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Columna Izquierda: Accesos Rápidos (2/3 ancho en desktop) */}
                <div className="lg:col-span-2 space-y-6">
                    <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-gray-500" />
                                Accesos Rápidos
                            </h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {quickActions.map((item, idx) => (
                                <button
                                    key={idx}
                                    onClick={item.action}
                                    className="flex items-start p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all duration-200 group text-left"
                                >
                                    <div className={`p-3 rounded-lg ${item.color} mr-4 group-hover:scale-110 transition-transform`}>
                                        <item.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                                            {item.title}
                                        </h4>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {item.desc}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Columna Derecha: Actividad Reciente (1/3 ancho) */}
                <div className="lg:col-span-1">
                    <section className="bg-white rounded-xl shadow-sm border border-gray-200 h-full">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-gray-500" />
                                Actividad Reciente
                            </h3>
                            <button
                                onClick={() => setActiveTab('auditoria')}
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline"
                            >
                                Ver todo
                            </button>
                        </div>
                        <div className="p-0">
                            {recentActivity?.length > 0 ? (
                                <div className="divide-y divide-gray-100">
                                    {recentActivity.map((log) => (
                                        <div key={log.id} className="p-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-start gap-3">
                                                <div className={`mt-1 p-1.5 rounded-full flex-shrink-0 ${log.accion.includes('CREAR') ? 'bg-green-100 text-green-600' :
                                                    log.accion.includes('ELIMINAR') ? 'bg-red-100 text-red-600' :
                                                        'bg-blue-100 text-blue-600'
                                                    }`}>
                                                    <Bell className="w-3 h-3" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {log.accion}
                                                    </p>
                                                    <p className="text-xs text-gray-500 truncate" title={log.detalles ? JSON.stringify(log.detalles) : ''}>
                                                        {log.detalles ? JSON.stringify(log.detalles) : 'Sin detalles'}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {formatActivityTime(log.created_at)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-gray-500 text-sm">
                                    No hay actividad reciente registrada.
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
