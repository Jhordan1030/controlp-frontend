
// ==================== src/components/estudiante/MisRegistros.jsx ====================
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, FileText, Trash2, AlertCircle, Plus } from 'lucide-react';
import Card from '../common/Card';
import Alert from '../common/Alert';
import Modal from '../common/Modal';
import MisRegistrosSkeleton from './MisRegistrosSkeleton';
import RegistroHoras from './RegistroHoras';
import { estudianteAPI } from '../../services/api';
import { handleApiError, formatDateShort } from '../../utils/helpers';

export default function MisRegistros() {
    const [registros, setRegistros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showRegistroModal, setShowRegistroModal] = useState(false);
    const [registroToDelete, setRegistroToDelete] = useState(null);
    const [periodoEstado, setPeriodoEstado] = useState({ finalizado: false, mensaje: '' });

    useEffect(() => {
        loadRegistros();
    }, []);

    const loadRegistros = async () => {
        try {
            setLoading(true);

            // 1. Primero obtenemos el contexto (Dashboard y Perfil) para saber el periodo activo
            const [dashboardData, perfilData] = await Promise.all([
                estudianteAPI.getDashboard(),
                estudianteAPI.getPerfil()
            ]);

            // 2. Determinamos el ID del periodo activo
            const currentPeriodId = dashboardData.success ? dashboardData.estudiante?.periodo_info?.id : null;

            // 3. Obtenemos los registros específicos según el periodo
            let registrosData;
            if (currentPeriodId) {
                // Si hay periodo activo, traemos SOLO los registros de ese periodo
                registrosData = await estudianteAPI.getRegistrosPeriodo(currentPeriodId);
            } else {
                // Si no hay periodo activo, traemos todo el historial (legacy fallback)
                registrosData = await estudianteAPI.getRegistros();
            }

            if (registrosData.success) {
                setRegistros(registrosData.registros);
            } else {
                setError(registrosData.error || 'Error al cargar registros');
            }

            // Validación usando el nuevo campo del backend 'periodo_info'
            if (dashboardData.success && dashboardData.estudiante?.periodo_info) {
                const { activo } = dashboardData.estudiante.periodo_info;
                if (activo === false) {
                    setPeriodoEstado({
                        finalizado: true,
                        mensaje: 'El periodo académico actual ha finalizado.'
                    });
                }
            }

        } catch (err) {
            setError(handleApiError(err));
        } finally {
            setLoading(false);
        }
    };

    const handleRegistroSuccess = () => {
        setShowRegistroModal(false);
        loadRegistros();
        setSuccess('Registro agregado exitosamente');
    };

    const handleDelete = async () => {
        if (!registroToDelete) return;

        try {
            const data = await estudianteAPI.eliminarRegistro(registroToDelete.id);

            if (data.success) {
                setSuccess('Registro eliminado exitosamente');
                setShowDeleteModal(false);
                setRegistroToDelete(null);
                loadRegistros();
            } else {
                setError(data.error || 'Error al eliminar registro');
            }
        } catch (err) {
            setError(handleApiError(err));
        }
    };

    const confirmDelete = (registro) => {
        setRegistroToDelete(registro);
        setShowDeleteModal(true);
    };

    if (loading) return <MisRegistrosSkeleton />;

    const totalHoras = registros.reduce((sum, r) => sum + parseFloat(r.horas), 0);

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Mis Registros</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Historial completo de tus horas de prácticas
                    </p>
                </div>
                <button
                    onClick={() => setShowRegistroModal(true)}
                    disabled={periodoEstado.finalizado}
                    className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 font-medium ${periodoEstado.finalizado
                        ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        : 'bg-indigo-400 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-100 dark:shadow-none'
                        }`}
                >
                    <Plus className="w-5 h-5" />
                    {periodoEstado.finalizado ? 'Finalizado' : 'Registrar Horas'}
                </button>
            </div>

            {periodoEstado.finalizado && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 p-4 rounded-r-lg flex items-center gap-3">
                    <AlertCircle className="w-6 h-6 text-amber-500" />
                    <div>
                        <p className="font-bold text-amber-800 dark:text-amber-200">Periodo Finalizado</p>
                        <p className="text-sm text-amber-700 dark:text-amber-300">
                            No es posible registrar más horas en este periodo.
                        </p>
                    </div>
                </div>
            )}

            {error && <Alert type="error" message={error} onClose={() => setError('')} />}
            {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

            {/* Resumen */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700 transition-colors duration-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Registros</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{registros.length}</p>
                        </div>
                        <div className="p-3 bg-violet-50 dark:bg-violet-900/20 rounded-lg">
                            <FileText className="w-8 h-8 text-violet-500 dark:text-violet-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700 transition-colors duration-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Horas</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{totalHoras.toFixed(1)}</p>
                        </div>
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                            <Clock className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700 transition-colors duration-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Promedio Diario</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                                {registros.length > 0 ? (totalHoras / registros.length).toFixed(1) : '0.0'}
                            </p>
                        </div>
                        <div className="p-3 bg-sky-50 dark:bg-sky-900/20 rounded-lg">
                            <Calendar className="w-8 h-8 text-sky-500 dark:text-sky-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Lista de registros */}
            <Card>
                {registros.length > 0 ? (
                    <div className="space-y-3">
                        {registros.map((registro) => (
                            <div
                                key={registro.id}
                                className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center flex-wrap gap-2 sm:gap-3 mb-2">
                                            <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {formatDateShort(registro.fecha)}
                                            </span>
                                            <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-bold uppercase tracking-wide">
                                                {registro.horas} horas
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 sm:ml-8 leading-relaxed">
                                            {registro.descripcion}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2 sm:ml-8 text-xs text-gray-400">
                                            <span>Registrado el {formatDateShort(registro.created_at)}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => confirmDelete(registro)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Eliminar registro"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 flex flex-col items-center">
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-full mb-4">
                            <AlertCircle className="w-12 h-12 text-gray-300 dark:text-gray-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                            No hay registros aún
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                            Tu historial de actividades aparecerá aquí una vez que comiences a registrar tus horas.
                        </p>
                    </div>
                )}
            </Card>

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

            {/* Modal confirmar eliminación */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Confirmar Eliminación"
                size="sm"
            >
                <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-100">
                        <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm text-red-900 font-bold">
                                ¿Estás seguro de eliminar este registro?
                            </p>
                            <p className="text-xs text-red-700 mt-1">
                                Esta acción eliminará las horas acumuladas y no se puede deshacer.
                            </p>
                        </div>
                    </div>

                    {registroToDelete && (
                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm border border-gray-200 dark:border-gray-600">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-gray-500 dark:text-gray-400 text-xs uppercase font-bold">Fecha</span>
                                <span className="font-medium text-gray-900 dark:text-white">{formatDateShort(registroToDelete.fecha)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 dark:text-gray-400 text-xs uppercase font-bold">Horas</span>
                                <span className="font-medium text-indigo-600 dark:text-indigo-400">{registroToDelete.horas}h</span>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4">
                        <button
                            onClick={() => setShowDeleteModal(false)}
                            className="btn-secondary"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleDelete}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition shadow-sm hover:shadow"
                        >
                            Sí, Eliminar
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
