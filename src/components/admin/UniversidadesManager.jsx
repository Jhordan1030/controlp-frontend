// ==================== src/components/admin/UniversidadesManager.jsx ====================
import React, { useState, useEffect } from 'react';
import { Plus, Building2, Edit2, Trash2, Eye } from 'lucide-react';
import Card from '../common/Card';
import Modal from '../common/Modal';
import LoadingSpinner from '../common/LoadingSpinner';
import Alert from '../common/Alert';
import { adminAPI } from '../../services/api';
import { handleApiError } from '../../utils/helpers';

export default function UniversidadesManager() {
    const [universidades, setUniversidades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [nombre, setNombre] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [activa, setActiva] = useState(true);
    const [showPeriodosModal, setShowPeriodosModal] = useState(false);
    const [periodos, setPeriodos] = useState([]);
    const [selectedUniName, setSelectedUniName] = useState('');

    useEffect(() => {
        loadUniversidades();
    }, []);

    const loadUniversidades = async () => {
        try {
            setLoading(true);
            const data = await adminAPI.getUniversidades();
            if (data.success) {
                setUniversidades(data.universidades);
            }
        } catch (err) {
            setError(handleApiError(err));
        } finally {
            setLoading(false);
        }
    };


    const loadPeriodos = async () => {
        try {
            const data = await adminAPI.getPeriodos();
            if (data.success) {
                setPeriodos(data.periodos);
            }
        } catch (err) {
            console.error('Error al cargar periodos:', err);
        }
    };

    const handleVerPeriodos = async (uni) => {
        setCurrentId(uni.id);
        setSelectedUniName(uni.nombre);
        await loadPeriodos(); // Cargar periodos frescos
        setShowPeriodosModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            // Fix: Find original name to avoid sending it if unchanged (backend has a bug with unchanged names)
            const uniOriginal = universidades.find(u => u.id === currentId);
            const nombreOriginal = uniOriginal ? uniOriginal.nombre : '';

            const data = isEditing
                ? await adminAPI.actualizarUniversidad(currentId, nombre, activa, nombreOriginal)
                : await adminAPI.crearUniversidad(nombre);

            if (data.success) {
                setSuccess(isEditing ? 'Universidad actualizada exitosamente' : 'Universidad creada exitosamente');
                setNombre('');
                setIsEditing(false);
                setCurrentId(null);
                setActiva(true);
                setShowModal(false);
                loadUniversidades();
            } else {
                setError(data.error || 'Error al procesar la solicitud');
            }
        } catch (err) {
            setError(handleApiError(err));
        }
    };

    // if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Universidades</h2>
                    <p className="text-gray-600 mt-1">Gestiona las universidades del sistema</p>
                </div>
                <button
                    onClick={() => {
                        setIsEditing(false);
                        setNombre('');
                        setActiva(true);
                        setShowModal(true);
                    }}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Nueva Universidad
                </button>
            </div>

            {/* Alerts */}
            {error && <Alert type="error" message={error} onClose={() => setError('')} />}
            {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

            {/* Lista de universidades */}
            {/* Lista de universidades */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Card key={i}>
                            <div className="animate-pulse flex items-start justify-between">
                                <div className="flex items-center gap-3 flex-1">
                                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                                    <div className="space-y-2 flex-1">
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                                    </div>
                                </div>
                                <div className="flex gap-1 ml-4">
                                    <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                                    <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {universidades.map((uni) => (
                        <Card key={uni.id}>
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                                        <Building2 className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{uni.nombre}</h3>
                                        <p className="text-sm text-gray-600">
                                            {uni.activa ? (
                                                <span className="text-green-600">Activa</span>
                                            ) : (
                                                <span className="text-red-600">Inactiva</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => handleVerPeriodos(uni)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                        title="Ver Periodos"
                                    >
                                        <Eye className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsEditing(true);
                                            setCurrentId(uni.id);
                                            setNombre(uni.nombre);
                                            setActiva(uni.activa);
                                            setShowModal(true);
                                        }}
                                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                        title="Editar Universidad"
                                    >
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Modal crear/editar universidad */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={isEditing ? 'Editar Universidad' : 'Nueva Universidad'}
                size="md"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nombre de la Universidad
                        </label>
                        <input
                            type="text"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            className="input-field"
                            placeholder="Ej: Universidad Técnica del Norte"
                            required
                        />
                    </div>

                    {isEditing && (
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="activa"
                                checked={activa}
                                onChange={(e) => setActiva(e.target.checked)}
                                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            />
                            <label htmlFor="activa" className="text-sm font-medium text-gray-700">
                                Universidad Activa
                            </label>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="btn-secondary"
                        >
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary">
                            {isEditing ? 'Actualizar' : 'Crear'} Universidad
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal ver periodos */}
            <Modal
                isOpen={showPeriodosModal}
                onClose={() => setShowPeriodosModal(false)}
                title={`Periodos - ${selectedUniName}`}
                size="lg"
            >
                <div className="space-y-4">
                    {periodos.filter(p => p.universidad_id === currentId).length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No hay periodos registrados para esta universidad.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inicio</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fin</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {periodos
                                        .filter(p => p.universidad_id === currentId)
                                        .map((periodo) => (
                                            <tr key={periodo.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{periodo.nombre}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(periodo.fecha_inicio).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(periodo.fecha_fin).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${periodo.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                        {periodo.activo ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <div className="flex justify-end pt-4">
                        <button
                            onClick={() => setShowPeriodosModal(false)}
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
