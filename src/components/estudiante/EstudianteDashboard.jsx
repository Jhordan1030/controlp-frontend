import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, Calendar, CheckCircle, GraduationCap, School, MapPin, AlertCircle, Plus, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '../common/Card';
import Modal from '../common/Modal';
import Alert from '../common/Alert';
import StudentDashboardSkeleton from './StudentDashboardSkeleton';
import RegistroHoras from './RegistroHoras';
import ActivityCalendar from './ActivityCalendar';
import { estudianteAPI } from '../../services/api';
import { handleApiError, formatDateShort } from '../../utils/helpers';

export default function EstudianteDashboard() {
    const [dashboardData, setDashboardData] = useState(null);
    const [allRegistros, setAllRegistros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showRegistroModal, setShowRegistroModal] = useState(false);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            setLoading(true);

            // Cargar dashboard y registros en paralelo
            const [dashData, regsData] = await Promise.all([
                estudianteAPI.getDashboard(),
                estudianteAPI.getRegistros()
            ]);

            if (dashData.success) {
                console.log('Dashboard Data Full:', dashData);
                setDashboardData(dashData);
            } else {
                setError(dashData.error || 'Error al cargar el dashboard');
            }

            if (regsData.success) {
                setAllRegistros(regsData.registros);
            }
        } catch (err) {
            setError(handleApiError(err));
        } finally {
            setLoading(false);
        }
    };

    const handleRegistroSuccess = () => {
        setShowRegistroModal(false);
        loadDashboard();
        setSuccess('¡Horas registradas exitosamente!');
        // Auto-limpiar mensaje de éxito después de 3s
        setTimeout(() => setSuccess(''), 3000);
    };

    // Procesar datos por semana
    const getWeeklyData = () => {
        if (!allRegistros.length) return [];

        const weeks = {};
        allRegistros.forEach(reg => {
            const date = new Date(reg.fecha);
            // Obtener fecha de inicio de semana (Domingo)
            const d = new Date(date);
            const day = d.getDay();
            const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday start
            const monday = new Date(d.setDate(diff));
            const key = monday.toISOString().split('T')[0];

            // Formatear etiqueta (e.g., "12 Oct")
            const label = new Intl.DateTimeFormat('es-EC', { day: 'numeric', month: 'short' }).format(monday);

            if (!weeks[key]) {
                weeks[key] = { date: key, name: `Sem ${label}`, horas: 0 };
            }
            weeks[key].horas += parseFloat(reg.horas);
        });

        // Convertir a array y ordenar por fecha (últimas 8 semanas)
        return Object.values(weeks)
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(-8);
    };

    const weeklyData = getWeeklyData();

    if (loading) return <StudentDashboardSkeleton />;
    if (!dashboardData) return null;

    // Adapt destructuring to match backend response keys
    // Previous code used: stats, universidad, perfil, periodo, ultimosRegistros
    // But original code used: const stats = dashboardData.estadisticas; const estudiante = dashboardData.estudiante;
    // I should check what API actually returns.
    // In previous EstudianteDashboard.jsx:
    // const stats = dashboardData.estadisticas;
    // const estudiante = dashboardData.estudiante;
    // So let's stick to that structure to be safe, or map it.

    const stats = dashboardData.estadisticas || {};
    const estudiante = dashboardData.estudiante || {};
    const periodo = estudiante.periodo_obj || null; // inferred, might be just strings.
    // Wait, original file had: 
    // <span className="font-medium">{estudiante.universidad || ...}</span>
    // <span className="font-medium">{estudiante.periodo || ...}</span>
    // So university and period were strings in `estudiante` object.

    // However, I want a richer dashboard. Let's use the data we have.
    const totalHoras = parseFloat(stats.totalHoras) || 0;
    const horasRequeridas = parseFloat(stats.horasRequeridas) || 0;
    const porcentaje = parseFloat(stats.porcentaje) || 0;
    const ultimosRegistros = stats.ultimosRegistros || [];

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header con Bienvenida y Botón */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-200">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Hola, {estudiante.nombres?.split(' ')[0]} 👋
                    </h1>
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mt-1">
                        <School className="w-4 h-4" />
                        <span className="text-sm font-medium">{estudiante.universidad || 'Universidad no asignada'}</span>
                        {estudiante.periodo && (
                            <>
                                <span className="text-gray-300 dark:text-gray-600">•</span>
                                <BookOpen className="w-4 h-4" />
                                <span className="text-sm">{estudiante.periodo}</span>
                            </>
                        )}
                    </div>
                </div>
                <button
                    onClick={() => setShowRegistroModal(true)}
                    className="bg-indigo-400 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl transition-all shadow-lg shadow-indigo-100 dark:shadow-none flex items-center gap-2 font-medium"
                >
                    <Plus className="w-5 h-5" />
                    Registrar Horas
                </button>
            </div>

            {error && <Alert type="error" message={error} onClose={() => setError('')} />}
            {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Horas Acumuladas */}
                <div className="bg-gradient-to-br from-violet-400 to-indigo-400 rounded-2xl p-6 text-white shadow-lg shadow-indigo-100 dark:shadow-none">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-white/30 rounded-lg backdrop-blur-sm">
                            <Clock className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xs font-medium bg-white/30 px-2 py-1 rounded-full backdrop-blur-sm">
                            Total Acumulado
                        </span>
                    </div>
                    <div>
                        <h3 className="text-4xl font-bold mb-1">{totalHoras}</h3>
                        <p className="text-indigo-50 text-sm">Horas registradas</p>
                    </div>
                </div>

                {/* Progreso */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-200">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                            <CheckCircle className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
                        </div>
                        <span className="text-xs font-medium bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-full">
                            Meta: {horasRequeridas}h
                        </span>
                    </div>
                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{porcentaje}%</h3>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                            <div
                                className="bg-emerald-400 h-2 rounded-full transition-all duration-1000 shadow-sm shadow-emerald-200 dark:shadow-none"
                                style={{ width: `${Math.min(porcentaje, 100)}%` }}
                            ></div>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-xs mt-2">
                            {porcentaje >= 100
                                ? '¡Meta completada! 🎉'
                                : `Faltan ${(horasRequeridas - totalHoras).toFixed(1)} horas`
                            }
                        </p>
                    </div>
                </div>

                {/* Info Card (Placeholder for now since we have strings only) */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-200">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-sky-50 dark:bg-sky-900/20 rounded-lg">
                            <Calendar className="w-6 h-6 text-sky-500 dark:text-sky-400" />
                        </div>
                        <span className="text-xs font-medium bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 px-2 py-1 rounded-full">
                            En curso
                        </span>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                            {estudiante.periodo || 'Sin periodo'}
                        </h3>
                        <div className="space-y-1 mt-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                Estado: <span className="font-medium text-emerald-500 dark:text-emerald-400">Activo</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Análisis Semanal Chart */}
            {weeklyData.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-200">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-indigo-600" />
                        Progreso Semanal (Horas)
                    </h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} tickMargin={10} />
                                <YAxis axisLine={false} tickLine={false} fontSize={12} />
                                <Tooltip
                                    cursor={{ fill: '#EEF2FF' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="horas" fill="#818CF8" radius={[4, 4, 0, 0]} barSize={40} name="Horas" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Content Grid: Stats & Calendar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Recent Activity */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Actividad Reciente</h2>
                    </div>

                    <Card className="overflow-hidden bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700">
                        {ultimosRegistros && ultimosRegistros.length > 0 ? (
                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                {ultimosRegistros.map((registro) => (
                                    <div key={registro.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center justify-between group">
                                        <div className="flex items-start gap-4">
                                            <div className="p-2 bg-violet-50 dark:bg-violet-900/20 text-violet-500 dark:text-violet-400 rounded-lg group-hover:bg-violet-100 dark:group-hover:bg-violet-900/40 transition">
                                                <Clock className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{registro.descripcion}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                    {formatDateShort(registro.fecha)}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="px-3 py-1 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-bold border border-gray-100 dark:border-gray-600">
                                            {registro.horas}h
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-full inline-flex mb-3">
                                    <AlertCircle className="w-6 h-6 text-gray-400 dark:text-gray-300" />
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">No hay registros recientes</p>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Right Column: Calendar */}
                <div className="lg:col-span-1">
                    <ActivityCalendar registros={allRegistros} />
                </div>
            </div>

            {/* Modal Registrar Horas */}
            <Modal
                isOpen={showRegistroModal}
                onClose={() => setShowRegistroModal(false)}
                title="Registrar Nuevas Horas"
            >
                <RegistroHoras
                    isModal={true}
                    onSuccess={handleRegistroSuccess}
                    onCancel={() => setShowRegistroModal(false)}
                />
            </Modal>
        </div>
    );
}
