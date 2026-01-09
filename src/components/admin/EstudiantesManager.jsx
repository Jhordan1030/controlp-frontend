// ==================== src/components/admin/EstudiantesManager.jsx ====================
import React, { useState, useEffect } from 'react';
import { Plus, Users, Eye } from 'lucide-react';
import Card from '../common/Card';
import Modal from '../common/Modal';
import LoadingSpinner from '../common/LoadingSpinner';
import Alert from '../common/Alert';
import ProgressBar from '../common/ProgressBar';
import { adminAPI } from '../../services/api';
import { handleApiError } from '../../utils/helpers';

export default function EstudiantesManager() {
    const [estudiantes, setEstudiantes] = useState([]);
    const [universidades, setUniversidades] = useState([]);
    const [periodos, setPeriodos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        nombres: '',
        apellidos: '',
        email: '',
        password: '',
        universidad_id: '',
        periodo_id: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [estudiantesData, universidadesData, periodosData] = await Promise.all([
                adminAPI.getEstudiantes(),
                adminAPI.getUniversidades(),
                adminAPI.getPeriodos()
            ]);

            if (estudiantesData.success) setEstudiantes(estudiantesData.estudiantes);
            if (universidadesData.success) setUniversidades(universidadesData.universidades);
            if (periodosData.success) setPeriodos(periodosData.periodos);
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
            const data = await adminAPI.crearEstudiante(formData);

            if (data.success) {
                setSuccess('Estudiante creado exitosamente');
                setFormData({
                    nombres: '',
                    apellidos: '',
                    email: '',
                    password: '',
                    universidad_id: '',
                    periodo_id: ''
                });
                setShowModal(false);
                loadData();
            } else {
                setError(data.error || 'Error al crear estudiante');
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
                    <h2 className="text-2xl font-bold text-gray-900">Estudiantes</h2>
                    <p className="text-gray-600 mt-1">Gestiona los estudiantes del sistema</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Nuevo Estudiante
                </button>
            </div>

            {error && <Alert type="error" message={error} onClose={() => setError('')} />}
            {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

            {/* Lista de estudiantes */}
            <div className="space-y-4">
                {estudiantes.map((estudiante) => (
                    <Card key={estudiante.id}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                    <Users className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">
                                        {estudiante.nombres} {estudiante.apellidos}
                                    </h3>
                                    <p className="text-sm text-gray-600">{estudiante.email}</p>
                                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                                        <span>{estudiante.universidad?.nombre || 'Sin universidad'}</span>
                                        <span>•</span>
                                        <span>{estudiante.periodo?.nombre || 'Sin periodo'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    estudiante.activo
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                }`}>
                  {estudiante.activo ? 'Activo' : 'Inactivo'}
                </span>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Modal crear estudiante */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Nuevo Estudiante"
                size="md"
            >
                <form onSubmit={handleCreate} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nombres
                            </label>
                            <input
                                type="text"
                                name="nombres"
                                value={formData.nombres}
                                onChange={handleChange}
                                className="input-field"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Apellidos
                            </label>
                            <input
                                type="text"
                                name="apellidos"
                                value={formData.apellidos}
                                onChange={handleChange}
                                className="input-field"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="input-field"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="input-field"
                            minLength="6"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Universidad
                        </label>
                        <select
                            name="universidad_id"
                            value={formData.universidad_id}
                            onChange={handleChange}
                            className="input-field"
                        >
                            <option value="">Sin asignar</option>
                            {universidades.map((uni) => (
                                <option key={uni.id} value={uni.id}>
                                    {uni.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Periodo
                        </label>
                        <select
                            name="periodo_id"
                            value={formData.periodo_id}
                            onChange={handleChange}
                            className="input-field"
                        >
                            <option value="">Sin asignar</option>
                            {periodos.map((periodo) => (
                                <option key={periodo.id} value={periodo.id}>
                                    {periodo.nombre} - {periodo.universidad?.nombre}
                                </option>
                            ))}
                        </select>
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
                            Crear Estudiante
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
