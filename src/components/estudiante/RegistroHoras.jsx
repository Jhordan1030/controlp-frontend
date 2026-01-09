// ==================== src/components/estudiante/RegistroHoras.jsx ====================
import React, { useState } from 'react';
import { Plus, Calendar, Clock, FileText } from 'lucide-react';
import Card from '../common/Card';
import Alert from '../common/Alert';
import { estudianteAPI } from '../../services/api';
import { handleApiError } from '../../utils/helpers';

export default function RegistroHoras({ onSuccess }) {
    const [formData, setFormData] = useState({
        fecha: new Date().toISOString().split('T')[0],
        horas: '',
        descripcion: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        // Validaciones
        if (parseFloat(formData.horas) < 0.5 || parseFloat(formData.horas) > 24) {
            setError('Las horas deben estar entre 0.5 y 24');
            setLoading(false);
            return;
        }

        const hoy = new Date().toISOString().split('T')[0];
        if (formData.fecha > hoy) {
            setError('No puedes registrar horas para fechas futuras');
            setLoading(false);
            return;
        }

        try {
            const data = await estudianteAPI.registrarHoras(formData);

            if (data.success) {
                setSuccess('¡Horas registradas exitosamente!');
                setFormData({
                    fecha: new Date().toISOString().split('T')[0],
                    horas: '',
                    descripcion: ''
                });
                if (onSuccess) onSuccess();
            } else {
                setError(data.error || 'Error al registrar horas');
            }
        } catch (err) {
            setError(handleApiError(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Registrar Horas</h2>
                <p className="text-gray-600 mt-1">Registra tus horas de prácticas diarias</p>
            </div>

            {error && <Alert type="error" message={error} onClose={() => setError('')} />}
            {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

            <Card>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Fecha */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Fecha
                            </div>
                        </label>
                        <input
                            type="date"
                            name="fecha"
                            value={formData.fecha}
                            onChange={handleChange}
                            max={new Date().toISOString().split('T')[0]}
                            className="input-field"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Selecciona la fecha en la que realizaste las prácticas
                        </p>
                    </div>

                    {/* Horas */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Horas Trabajadas
                            </div>
                        </label>
                        <input
                            type="number"
                            name="horas"
                            value={formData.horas}
                            onChange={handleChange}
                            step="0.5"
                            min="0.5"
                            max="24"
                            className="input-field"
                            placeholder="Ej: 8 o 4.5"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Ingresa las horas trabajadas (mínimo 0.5, máximo 24)
                        </p>
                    </div>

                    {/* Descripción */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Descripción de Actividades
                            </div>
                        </label>
                        <textarea
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleChange}
                            rows="4"
                            className="input-field resize-none"
                            placeholder="Describe las actividades realizadas durante las prácticas..."
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Describe brevemente las tareas y actividades que realizaste
                        </p>
                    </div>

                    {/* Botones */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => {
                                setFormData({
                                    fecha: new Date().toISOString().split('T')[0],
                                    horas: '',
                                    descripcion: ''
                                });
                                setError('');
                                setSuccess('');
                            }}
                            className="btn-secondary"
                        >
                            Limpiar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            {loading ? 'Registrando...' : 'Registrar Horas'}
                        </button>
                    </div>
                </form>
            </Card>

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Consejos para el registro
                </h3>
                <ul className="space-y-1 text-sm text-blue-800">
                    <li>• Registra tus horas diariamente para no olvidar detalles</li>
                    <li>• Sé específico en la descripción de actividades</li>
                    <li>• No puedes registrar más de 24 horas por día</li>
                    <li>• Solo puedes registrar un registro por fecha</li>
                </ul>
            </div>
        </div>
    );
}
