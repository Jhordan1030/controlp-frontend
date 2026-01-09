import React, { useState, useEffect } from 'react';
import { Plus, Calendar } from 'lucide-react';
import Card from '../common/Card';
import Modal from '../common/Modal';
import LoadingSpinner from '../common/LoadingSpinner';
import Alert from '../common/Alert';
import { adminAPI } from '../../services/api';
import { handleApiError, formatDateShort } from '../../utils/helpers';

export default function PeriodosManager() {
    const [periodos, setPeriodos] = useState([]);
    const [universidades, setUniversidades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        universidad_id: '',
        nombre: '',
        fecha_inicio: '',
        fecha_fin: '',
        horas_totales_requeridas: 200
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [periodosData, universidadesData] = await Promise.all([
                adminAPI.getPeriodos(),
                adminAPI.getUniversidades()
            ]);

            if (periodosData.success) setPeriodos(periodosData.periodos);
            if (universidadesData.success) setUniversidades(universidadesData.universidades);
        } catch (err) {
            setError(handleApiError(err));
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const data = await adminAPI.crearPeriodo(formData);

            if (data.success) {
                setSuccess('Periodo creado exitosamente');
                setFormData({
                    universidad_id: '',
                    nombre: '',
                    fecha_inicio: '',
                    fecha_fin: '',
                    horas_totales_requeridas: 200
                });
                setShowModal(false);
                loadData();
            } else {
                setError(data.error || 'Error al crear periodo');
            }
        } catch (err) {
            setError(handleApiError(err));
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Periodos Académicos</h2>
                    <p className="text-gray-600 mt-1">Gestiona los periodos de prácticas</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Nuevo Periodo
                </button>
            </div>

            {error && <Alert type="error" message={error} onClose={() => setError('')} />}
            {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

            {/* Lista de periodos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {periodos.map((periodo) => (
                    <Card key={periodo.id}>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Calendar className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{periodo.nombre}</h3>
                                    <p className="text-sm text-gray-600">
                                        {periodo.universidad?.nombre || 'Sin universidad'}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-3 border-t space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Inicio:</span>
                                    <span className="font-medium">{formatDateShort(periodo.fecha_inicio)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Fin:</span>
                                    <span className="font-medium">{formatDateShort(periodo.fecha_fin)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Horas:</span>
                                    <span className="font-semibold text-indigo-600">
                                        {periodo.horas_totales_requeridas}h
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Modal crear periodo */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Nuevo Periodo Académico"
                size="md"
            >
                <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Universidad
                        </label>
                        <select
                            name="universidad_id"
                            value={formData.universidad_id}
                            onChange={handleChange}
                            className="input-field"
                            required
                        >
                            <option value="">Seleccionar universidad</option>
                            {universidades.map((uni) => (
                                <option key={uni.id} value={uni.id}>
                                    {uni.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nombre del Periodo
                        </label>
                        <input
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="Ej: ENE-FEB 2025"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Fecha de Inicio
                            </label>
                            <input
                                type="date"
                                name="fecha_inicio"
                                value={formData.fecha_inicio}
                                onChange={handleChange}
                                className="input-field"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Fecha de Fin
                            </label>
                            <input
                                type="date"
                                name="fecha_fin"
                                value={formData.fecha_fin}
                                onChange={handleChange}
                                className="input-field"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Horas Totales Requeridas
                        </label>
                        <input
                            type="number"
                            name="horas_totales_requeridas"
                            value={formData.horas_totales_requeridas}
                            onChange={handleChange}
                            className="input-field"
                            min="1"
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="btn-secondary"
                        >
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary">
                            Crear Periodo
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}