import React, { useState, useEffect } from 'react';
import { Users, Building2, Calendar, TrendingUp, Clock, Shield, Activity, Bell, RefreshCcw, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatCard from '../common/StatCard';
import DashboardSkeleton from './DashboardSkeleton';
import { adminAPI } from '../../services/api';
import { downloadCSV } from '../../utils/exportHelpers';

export default function AdminDashboard({ setActiveTab }) {
    const [stats, setStats] = useState(null);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [lastUpdated, setLastUpdated] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            if (!stats) setLoading(true); // Solo mostrar skeleton en carga inicial completa
            else setRefreshing(true); // Mostrar spinner de refresh si ya hay datos

            const [statsData, activityData, periodosData] = await Promise.all([
                adminAPI.getDashboard(),
                adminAPI.getAuditoria({ limit: 10 }), // Aumentamos a 10 para mejor export
                adminAPI.getPeriodos()
            ]);

            if (statsData.success) {
                // Fix: Calcular periodos activos localmente si la API de periodos responde
                let periodosActivosCalc = statsData.estadisticas.periodosActivos;

                if (periodosData.success && periodosData.periodos) {
                    // Consideramos activos aquellos marcados como true en la BD
                    // Opcional: Podríamos validar fechas aquí también si se requiere "En curso por fecha"
                    periodosActivosCalc = periodosData.periodos.filter(p => p.activo).length;
                }

                setStats({
                    ...statsData.estadisticas,
                    periodosActivos: periodosActivosCalc
                });
            } else {
                setError(statsData.error || 'Error al cargar estadísticas');
            }

            if (activityData.success) {
                setRecentActivity(activityData.data);
            }
            setLastUpdated(new Date());
        } catch (err) {
            console.error(err);
            setError('Error cargando datos del dashboard');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleExportActivity = () => {
        if (!recentActivity.length) return;

        const dataToExport = recentActivity.map(log => ({
            ID: log.id,
            Accion: log.accion,
            Detalles: log.detalles ? JSON.stringify(log.detalles) : '',
            Fecha: new Date(log.created_at).toLocaleString(),
            UsuarioID: log.usuario_id
        }));

        downloadCSV(dataToExport, `actividad_sistema_${new Date().toISOString().split('T')[0]}.csv`);
        adminAPI.registrarAuditoria('DESCARGA_REPORTE', { tipo: 'CSV', modulo: 'DASHBOARD_ACTIVITY' });
    };

    if (loading) return <DashboardSkeleton />;

    // Prepare chart data
    const chartData = stats ? [
        { name: 'Universidades', total: stats.totalUniversidades, activas: stats.universidadesActivas },
        { name: 'Periodos', total: stats.totalPeriodos, activas: stats.periodosActivos },
        { name: 'Estudiantes', total: stats.totalEstudiantes, activas: stats.estudiantesActivos },
    ] : [];

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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Administrativo</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Bienvenido al panel de control general del sistema.</p>
                </div>
                <div className="flex items-center gap-4">
                    {lastUpdated && (
                        <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                            Actualizado: {lastUpdated.toLocaleTimeString()}
                        </span>
                    )}
                    <button
                        onClick={loadDashboardData}
                        disabled={refreshing}
                        className={`p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all ${refreshing ? 'animate-spin' : 'hover:rotate-180'}`}
                        title="Actualizar datos"
                    >
                        <RefreshCcw className="w-5 h-5" />
                    </button>
                </div>
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
                {/* Columna Izquierda: Charts & Accesos Rápidos (2/3 ancho) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Charts Section */}
                    <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            Resumen de Entidades
                        </h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <Tooltip
                                        cursor={{ fill: '#F3F4F6' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="total" fill="#4F46E5" radius={[4, 4, 0, 0]} name="Total" />
                                    <Bar dataKey="activas" fill="#818CF8" radius={[4, 4, 0, 0]} name="Activas" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </section>

                    {/* Quick Actions */}
                    <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-200">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                Accesos Rápidos
                            </h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {quickActions.map((item, idx) => (
                                <button
                                    key={idx}
                                    onClick={item.action}
                                    className="flex items-start p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-900 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all duration-200 group text-left"
                                >
                                    <div className={`p-3 rounded-lg ${item.color} mr-4 group-hover:scale-110 transition-transform`}>
                                        <item.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 dark:text-gray-200 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                                            {item.title}
                                        </h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
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
                    <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-full flex flex-col transition-colors duration-200">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-700/30">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                Actividad
                            </h3>
                            <button
                                onClick={handleExportActivity}
                                className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors"
                                title="Exportar a CSV"
                            >
                                <Download className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto max-h-[600px]">
                            {recentActivity?.length > 0 ? (
                                <div className="divide-y divide-gray-100">
                                    {recentActivity.map((log) => (
                                        <div key={log.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <div className="flex items-start gap-3">
                                                <div className={`mt-1 p-1.5 rounded-full flex-shrink-0 ${log.accion.includes('CREAR') ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                                                    log.accion.includes('ELIMINAR') || log.accion.includes('DESACTIVAR') ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                                                        'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                                    }`}>
                                                    <Bell className="w-3 h-3" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-200 truncate">
                                                        {log.accion}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={log.detalles ? JSON.stringify(log.detalles) : ''}>
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
                        <div className="p-4 border-t border-gray-100 dark:border-gray-700 text-center bg-gray-50/50 dark:bg-gray-700/30 rounded-b-xl">
                            <button
                                onClick={() => setActiveTab('auditoria')}
                                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium hover:underline"
                            >
                                Ver historial completo
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
