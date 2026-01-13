import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, Clock, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import Card from '../common/Card';
import MisPeriodosSkeleton from './MisPeriodosSkeleton';
import { estudianteAPI } from '../../services/api';
import { handleApiError, formatDateShort } from '../../utils/helpers';

export default function MisPeriodos() {
    const [periodos, setPeriodos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadPeriodos();
    }, []);

    const loadPeriodos = async () => {
        try {
            setLoading(true);
            const data = await estudianteAPI.getMisPeriodos();

            if (data.success) {
                setPeriodos(data.periodos);
            } else {
                setError(data.error || 'Error al cargar periodos');
            }
        } catch (err) {
            setError(handleApiError(err));
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <MisPeriodosSkeleton />;

    return (
        <div className="space-y-6 animate-fadeIn">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Mis Periodos</h2>
                <p className="text-gray-600 mt-1">
                    Historial completo de matriculación
                </p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Periodo
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                                    Fechas
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Progreso
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Estado
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {periodos.length > 0 ? (
                                periodos.map((registro) => {
                                    const { periodo } = registro;
                                    const esActivo = registro.activa;
                                    const progreso = periodo.horas_totales_requeridas > 0
                                        ? Math.min(100, (registro.horas_acumuladas || 0) / periodo.horas_totales_requeridas * 100)
                                        : 0;

                                    return (
                                        <tr key={registro.id || periodo.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className={`flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg ${esActivo ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                                                        <BookOpen className={`h-5 w-5 ${esActivo ? 'text-indigo-600' : 'text-gray-500'}`} />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-bold text-gray-900">{periodo.nombre}</div>
                                                        <div className="text-xs text-gray-500 md:hidden">
                                                            {formatDateShort(periodo.fecha_inicio)} - {formatDateShort(periodo.fecha_fin)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                                                <div className="text-sm text-gray-500 flex items-center gap-2">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{formatDateShort(periodo.fecha_inicio)} - {formatDateShort(periodo.fecha_fin)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="w-full max-w-xs">
                                                    <div className="flex items-center justify-between text-xs mb-1">
                                                        <span className="font-medium text-gray-700">{Math.round(progreso)}%</span>
                                                        <span className="text-gray-500">{registro.horas_acumuladas || 0}/{periodo.horas_totales_requeridas}h</span>
                                                    </div>
                                                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${progreso >= 100 ? 'bg-green-500' : esActivo ? 'bg-indigo-600' : 'bg-gray-400'
                                                                }`}
                                                            style={{ width: `${progreso}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${esActivo
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${esActivo ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                                                    {esActivo ? 'Activo' : 'Finalizado'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colspan="4" className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="bg-gray-50 p-4 rounded-full mb-3">
                                                <Clock className="w-8 h-8 text-gray-300" />
                                            </div>
                                            <p className="font-medium">No hay periodos registrados</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
