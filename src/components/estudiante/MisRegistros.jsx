// ==================== src/components/estudiante/MisRegistros.jsx ====================
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, FileText, Edit2, Trash2, AlertCircle } from 'lucide-react';
import Card from '../common/Card';
import LoadingSpinner from '../common/LoadingSpinner';
import Alert from '../common/Alert';
import Modal from '../common/Modal';
import { estudianteAPI } from '../../services/api';
import { handleApiError, formatDateShort } from '../../utils/helpers';

export default function MisRegistros() {
    const [registros, setRegistros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [registroToDelete, setRegistroToDelete] = useState(null);

    useEffect(() => {
        loadRegistros();
    }, []);

    const loadRegistros = async () => {
        try {
            setLoading(true);
            const data = await estudianteAPI.getRegistros();

            if (data.success) {
                setRegistros(data.registros);
            } else {
                setError(data.error || 'Error al cargar registros');
            }
        } catch (err) {
            setError(handleApiError(err));
        } finally {
            setLoading(false);
        }
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

    if (loading) return <LoadingSpinner />;

    const totalHoras = registros.reduce((sum, r) => sum + parseFloat(r.horas), 0);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Mis Registros</h2>
                <p className="text-gray-600 mt-1">
                    Historial completo de tus horas de prácticas
                </p>
            </div>

            {error && <Alert type="error" message={error} onClose={() => setError('')} />}
            {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

            {/* Resumen */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Registros</p>
                            <p className="text-3xl font-bold text-gray-900">{registros.length}</p>
                        </div>
                        <FileText className="w-10 h-10 text-indigo-600" />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Horas</p>
                            <p className="text-3xl font-bold text-gray-900">{totalHoras.toFixed(1)}</p>
                        </div>
                        <Clock className="w-10 h-10 text-green-600" />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Promedio Diario</p>
                            <p className="text-3xl font-bold text-gray-900">
                                {registros.length > 0 ? (totalHoras / registros.length).toFixed(1) : '0.0'}
                            </p>
                        </div>
                        <Calendar className="w-10 h-10 text-blue-600" />
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
                                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Calendar className="w-5 h-5 text-indigo-600" />
                                            <span className="font-semibold text-gray-900">
                        {formatDateShort(registro.fecha)}
                      </span>
                                            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                        {registro.horas}h
                      </span>
                                        </div>
                                        <p className="text-sm text-gray-700 ml-8">
                                            {registro.descripcion}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-2 ml-8">
                                            Registrado: {formatDateShort(registro.created_at)}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => confirmDelete(registro)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                        title="Eliminar registro"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No hay registros aún
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Comienza registrando tus horas de prácticas
                        </p>
                    </div>
                )}
            </Card>

            {/* Modal confirmar eliminación */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Confirmar Eliminación"
                size="sm"
            >
                <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg">
                        <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm text-red-900 font-medium">
                                ¿Estás seguro de eliminar este registro?
                            </p>
                            <p className="text-xs text-red-700 mt-1">
                                Esta acción no se puede deshacer.
                            </p>
                        </div>
                    </div>

                    {registroToDelete && (
                        <div className="p-3 bg-gray-50 rounded-lg text-sm">
                            <p className="font-medium text-gray-900">
                                Fecha: {formatDateShort(registroToDelete.fecha)}
                            </p>
                            <p className="text-gray-600">Horas: {registroToDelete.horas}</p>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            onClick={() => setShowDeleteModal(false)}
                            className="btn-secondary"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleDelete}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
                        >
                            Eliminar
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
