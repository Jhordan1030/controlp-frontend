import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, Clock, CheckCircle, AlertCircle, TrendingUp, Download, Loader2 } from 'lucide-react';
import Card from '../common/Card';
import MisPeriodosSkeleton from './MisPeriodosSkeleton';
import { estudianteAPI } from '../../services/api';
import { handleApiError, formatDateShort } from '../../utils/helpers';
import { generatePeriodReport } from '../../utils/pdfGenerator';

export default function MisPeriodos() {
    const [periodos, setPeriodos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [downloadingId, setDownloadingId] = useState(null);

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

    const handleDownloadReport = async (periodo) => {
        try {
            setDownloadingId(periodo.id);
            // 1. Fetch Profile for Name/Uni
            let registrosForPDF = [];

            // 2. Try fetching specific period registers (optimized)
            // If fails (404), fallback to fetching all registers and filtering (legacy)
            try {
                const [perfilRes, registrosRes] = await Promise.all([
                    estudianteAPI.getPerfil(),
                    estudianteAPI.getRegistrosPeriodo(periodo.id)
                ]);

                if (perfilRes.success && registrosRes.success) {
                    generatePeriodReport(periodo, registrosRes.registros, perfilRes.estudiante);
                } else {
                    throw new Error('API reported unsuccessful');
                }
            } catch (err) {
                // Fallback catch: validation for 404 or other errors
                console.warn('Optimized PDF fetch failed, trying legacy method...', err);

                const [perfilRes, registrosRes] = await Promise.all([
                    estudianteAPI.getPerfil(),
                    estudianteAPI.getRegistros() // Legacy: fetch all
                ]);

                if (perfilRes.success && registrosRes.success) {
                    const registrosDelPeriodo = registrosRes.registros.filter(r => r.periodo_id === periodo.id);
                    generatePeriodReport(periodo, registrosDelPeriodo, perfilRes.estudiante);
                } else {
                    console.error('Error fetching data for report (legacy method)');
                }
            }
        } catch (err) {
            console.error('Download error:', err);
        } finally {
            setDownloadingId(null);
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

            <div className="hidden md:block overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 w-full table-fixed">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                            <th scope="col" className="w-[30%] px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Periodo
                            </th>
                            <th scope="col" className="w-[20%] px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                                Fechas
                            </th>
                            <th scope="col" className="w-[20%] px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Progreso
                            </th>
                            <th scope="col" className="w-[15%] px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Reporte
                            </th>
                            <th scope="col" className="w-[15%] px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Estado
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {periodos.length > 0 ? (
                            periodos.map((registro) => {
                                const periodo = registro;
                                const matricula = registro.matricula || {};
                                const esActivo = periodo.activo;
                                const horasRequeridas = periodo.horas_totales_requeridas || 0;
                                const horasAcumuladas = periodo.horas_acumuladas || matricula.horas_acumuladas || 0;
                                const progreso = horasRequeridas > 0
                                    ? Math.min(100, (horasAcumuladas / horasRequeridas) * 100)
                                    : 0;

                                return (
                                    <tr key={periodo.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center">
                                                <div className={`flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg ${esActivo ? 'bg-indigo-100 dark:bg-indigo-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                                    <BookOpen className={`h-5 w-5 ${esActivo ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`} />
                                                </div>
                                                <div className="ml-3 overflow-hidden">
                                                    <div className="text-sm font-bold text-gray-900 dark:text-white truncate" title={periodo.nombre}>{periodo.nombre}</div>
                                                    {matricula.fecha && (
                                                        <div className="text-xs text-indigo-500 dark:text-indigo-400 mt-0.5 truncate">
                                                            Matriculado: {formatDateShort(matricula.fecha)}
                                                        </div>
                                                    )}
                                                    {/* Show dates here on medium screens where the separate column is hidden */}
                                                    <div className="lg:hidden text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                        {formatDateShort(periodo.fecha_inicio)} - {formatDateShort(periodo.fecha_fin)}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 hidden lg:table-cell">
                                            <div className="flex flex-col gap-1">
                                                <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 flex-shrink-0" />
                                                    <span className="truncate">{formatDateShort(periodo.fecha_inicio)} - {formatDateShort(periodo.fecha_fin)}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="w-full">
                                                <div className="flex items-center justify-between text-xs mb-1">
                                                    <span className="font-medium text-gray-700 dark:text-gray-300">{Math.round(progreso)}%</span>
                                                    <span className="text-gray-500 dark:text-gray-400 whitespace-nowrap">{horasAcumuladas.toFixed(1)}/{horasRequeridas}h</span>
                                                </div>
                                                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-1000 ${progreso >= 100 ? 'bg-emerald-500' : esActivo ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-gray-400 dark:bg-gray-500'
                                                            }`}
                                                        style={{ width: `${progreso}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <button
                                                onClick={() => handleDownloadReport(periodo)}
                                                disabled={downloadingId === periodo.id}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors disabled:opacity-50 whitespace-nowrap"
                                            >
                                                {downloadingId === periodo.id ? (
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                ) : (
                                                    <Download className="w-3.5 h-3.5" />
                                                )}
                                                Descargar
                                            </button>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${esActivo
                                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${esActivo ? 'bg-emerald-500' : 'bg-gray-500'}`}></span>
                                                {esActivo ? 'Activo' : 'Finalizado'}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-full mb-3">
                                            <Clock className="w-8 h-8 text-gray-300 dark:text-gray-500" />
                                        </div>
                                        <p className="font-medium">No hay periodos registrados</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile View: Cards */}
            <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-700">
                {periodos.length > 0 ? (
                    periodos.map((registro) => {
                        const periodo = registro;
                        const matricula = registro.matricula || {};
                        const esActivo = periodo.activo;
                        const horasRequeridas = periodo.horas_totales_requeridas || 0;
                        const horasAcumuladas = periodo.horas_acumuladas || matricula.horas_acumuladas || 0;
                        const progreso = horasRequeridas > 0
                            ? Math.min(100, (horasAcumuladas / horasRequeridas) * 100)
                            : 0;

                        return (
                            <div key={periodo.id} className="p-5 flex flex-col gap-4 bg-white dark:bg-gray-800">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2.5 rounded-lg ${esActivo ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                                            <BookOpen className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white">{periodo.nombre}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${esActivo
                                                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                                    }`}>
                                                    {esActivo ? 'Activo' : 'Finalizado'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span>{formatDateShort(periodo.fecha_inicio)} - {formatDateShort(periodo.fecha_fin)}</span>
                                    </div>
                                    {matricula.fecha && (
                                        <div className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400">
                                            <CheckCircle className="w-4 h-4" />
                                            <span>Matriculado: {formatDateShort(matricula.fecha)}</span>
                                        </div>
                                    )}

                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
                                        <div className="flex justify-between text-xs mb-1.5">
                                            <span className="font-medium text-gray-700 dark:text-gray-300">Progreso General</span>
                                            <span className="text-gray-500 dark:text-gray-400 font-medium">{Math.round(progreso)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 mb-2">
                                            <div
                                                className={`h-full rounded-full ${progreso >= 100 ? 'bg-emerald-500' : esActivo ? 'bg-indigo-500' : 'bg-gray-400'}`}
                                                style={{ width: `${progreso}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-gray-500 dark:text-gray-400">Total Acumulado</span>
                                            <span className="font-bold text-gray-900 dark:text-white">{horasAcumuladas.toFixed(1)} / {horasRequeridas}h</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleDownloadReport(periodo)}
                                    disabled={downloadingId === periodo.id}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors disabled:opacity-50 border border-indigo-100 dark:border-indigo-900/30"
                                >
                                    {downloadingId === periodo.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Download className="w-4 h-4" />
                                    )}
                                    Descargar Reporte PDF
                                </button>
                            </div>
                        );
                    })
                ) : (
                    <div className="p-8 text-center bg-white dark:bg-gray-800">
                        <Clock className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">No hay periodos registrados</p>
                    </div>
                )}
            </div>
        </div>
    );
}
