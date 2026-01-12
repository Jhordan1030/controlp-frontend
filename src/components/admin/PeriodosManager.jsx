import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Edit2, Eye, User, GraduationCap } from 'lucide-react';
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
        horas_totales_requeridas: 200,
        activo: true
    });

    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [showEstudiantesModal, setShowEstudiantesModal] = useState(false);
    const [estudiantes, setEstudiantes] = useState([]);
    const [selectedPeriodoName, setSelectedPeriodoName] = useState('');

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

    const resetForm = () => {
        setFormData({
            universidad_id: '',
            nombre: '',
            fecha_inicio: '',
            fecha_fin: '',
            horas_totales_requeridas: 200,
            activo: true
        });
        setIsEditing(false);
        setCurrentId(null);
    };

    const handleEdit = (periodo) => {
        setFormData({
            universidad_id: periodo.universidad_id,
            nombre: periodo.nombre,
            fecha_inicio: periodo.fecha_inicio.split('T')[0],
            fecha_fin: periodo.fecha_fin.split('T')[0],
            horas_totales_requeridas: periodo.horas_totales_requeridas,
            activo: periodo.activo
        });
        setIsEditing(true);
        setCurrentId(periodo.id);
        setShowModal(true);
    };

    const handleVerEstudiantes = async (periodo) => {
        try {
            setSelectedPeriodoName(periodo.nombre);
            // Cargar estudiantes si no se tienen o filtrar
            const data = await adminAPI.getEstudiantes();
            if (data.success) {
                // Filtrar estudiantes por periodo si el backend devuelve todos
                // Asumiendo que el estudiante tiene una propiedad periodo_id o un objeto periodo
                // Si la API getEstudiantes() no filtra, lo hacemos aquí.
                // Ajustar según la estructura real de 'estudiante'. 
                // Suponiendo estudiante.periodo_id o estudiante.Periodo?.id
                const estudiantesFiltrados = data.estudiantes.filter(est => est.Periodo?.id === periodo.id || est.periodo_id === periodo.id);
                setEstudiantes(estudiantesFiltrados);
            }
            setShowEstudiantesModal(true);
        } catch (err) {
            console.error('Error al cargar estudiantes', err);
            setError('Error al cargar estudiantes del periodo');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const data = isEditing
                ? await adminAPI.actualizarPeriodo(currentId, formData)
                : await adminAPI.crearPeriodo(formData);

            if (data.success) {
                setSuccess(isEditing ? 'Periodo actualizado exitosamente' : 'Periodo creado exitosamente');
                resetForm();
                setShowModal(false);
                loadData();
            } else {
                setError(data.error || 'Error al procesar la solicitud');
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
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
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

            {/* Modal crear/editar periodo */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={isEditing ? 'Editar Periodo' : 'Nuevo Periodo Académico'}
                size="md"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            {isEditing ? 'Actualizar' : 'Crear'} Periodo
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal ver estudiantes */}
            <Modal
                isOpen={showEstudiantesModal}
                onClose={() => setShowEstudiantesModal(false)}
                title={`Estudiantes inscritos - ${selectedPeriodoName}`}
                size="lg"
            >
                <div>
                    {estudiantes.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <User className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-500">No hay estudiantes inscritos en este periodo.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estudiante</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cédula</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Carrera</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {estudiantes.map((est) => (
                                        <tr key={est.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                                        <GraduationCap className="h-5 w-5 text-indigo-600" />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{est.nombre} {est.apellido}</div>
                                                        <div className="text-sm text-gray-500">{est.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{est.cedula}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{est.carrera}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <div className="flex justify-end pt-4">
                        <button
                            onClick={() => setShowEstudiantesModal(false)}
                            className="btn-secondary"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}