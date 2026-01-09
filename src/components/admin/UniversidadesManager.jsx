// ==================== src/components/admin/UniversidadesManager.jsx ====================
import React, { useState, useEffect } from 'react';
import { Plus, Building2, Edit2, Trash2 } from 'lucide-react';
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

    const handleCreate = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const data = await adminAPI.crearUniversidad(nombre);

            if (data.success) {
                setSuccess('Universidad creada exitosamente');
                setNombre('');
                setShowModal(false);
                loadUniversidades();
            } else {
                setError(data.error || 'Error al crear universidad');
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
                    <h2 className="text-2xl font-bold text-gray-900">Universidades</h2>
                    <p className="text-gray-600 mt-1">Gestiona las universidades del sistema</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
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
                        </div>
                    </Card>
                ))}
            </div>

            {/* Modal crear universidad */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Nueva Universidad"
                size="md"
            >
                <form onSubmit={handleCreate} className="space-y-4">
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

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="btn-secondary"
                        >
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary">
                            Crear Universidad
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
