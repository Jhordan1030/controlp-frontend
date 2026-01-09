
// ==================== src/components/estudiante/EstudianteDashboard.jsx ====================
import React, { useState, useEffect } from 'react';
import { Clock, TrendingUp, Calendar, CheckCircle } from 'lucide-react';
import StatCard from '../common/StatCard';
import ProgressBar from '../common/ProgressBar';
import LoadingSpinner from '../common/LoadingSpinner';
import Card from '../common/Card';
import { estudianteAPI } from '../../services/api';
import { handleApiError, formatDateShort } from '../../utils/helpers';

export default function EstudianteDashboard() {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            const data = await estudianteAPI.getDashboard();

            if (data.success) {
                setDashboardData(data);
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

    const stats = dashboardData.estadisticas;
    const totalHoras = parseFloat(stats.totalHoras) || 0;
    const horasRequeridas = parseFloat(stats.horasRequeridas) || 0;
    const horasFaltantes = parseFloat(stats.horasFaltantes) || 0;
    const porcentaje = parseFloat(stats.porcentaje) || 0;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">
                    ¡Hola, {dashboardData.estudiante.nombres}!
                </h2>
                <p className="text-gray-600 mt-1">Aquí está tu progreso de prácticas</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Horas Completadas"
                    value={totalHoras.toFixed(1)}
                    icon={CheckCircle}
                    color="green"
                />
                <StatCard
                    title="Horas Requeridas"
                    value={horasRequeridas}
                    icon={Clock}
                    color="blue"
                />
                <StatCard
                    title="Horas Faltantes"
                    value={horasFaltantes.toFixed(1)}
                    icon={TrendingUp}
                    color="yellow"
                />
                <StatCard
                    title="Progreso"
                    value={`${porcentaje}%`}
                    icon={Calendar}
                    color={porcentaje >= 100 ? 'green' : 'indigo'}
                />
            </div>

            {/* Progress Card */}
            <Card title="Progreso General" icon={TrendingUp}>
                <ProgressBar
                    current={totalHoras}
                    total={horasRequeridas}
                    showLabel={true}
                />
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                        {porcentaje >= 100
                            ? '¡Felicidades! Has completado tus horas de prácticas.'
                            : `Te faltan ${horasFaltantes.toFixed(1)} horas para completar tus prácticas.`
                        }
                    </p>
                </div>
            </Card>

            {/* Últimos registros */}
            <Card title="Últimos Registros" icon={Calendar}>
                {stats.ultimosRegistros && stats.ultimosRegistros.length > 0 ? (
                    <div className="space-y-3">
                        {stats.ultimosRegistros.slice(0, 5).map((registro) => (
                            <div
                                key={registro.id}
                                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                            >
                                <div>
                                    <p className="font-medium text-gray-900">
                                        {formatDateShort(registro.fecha)}
                                    </p>
                                    <p className="text-sm text-gray-600 line-clamp-1">
                                        {registro.descripcion}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-indigo-600">
                                        {registro.horas}h
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No hay registros aún</p>
                        <p className="text-sm">Comienza registrando tus horas de prácticas</p>
                    </div>
                )}
            </Card>
        </div>
    );
}
