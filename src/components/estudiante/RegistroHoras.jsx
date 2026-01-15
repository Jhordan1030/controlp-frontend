import React, { useState } from 'react';
import { Plus, Calendar, Clock, FileText } from 'lucide-react';
import Card from '../common/Card';
import { useToast } from '../../context/ToastContext';
import { estudianteAPI } from '../../services/api';
import { handleApiError } from '../../utils/helpers';

export default function RegistroHoras({ onSuccess, onCancel, isModal = false }) {
    const { showToast } = useToast();
    // Función para obtener la fecha local en formato YYYY-MM-DD
    const getLocalISODate = () => {
        const d = new Date();
        const offset = d.getTimezoneOffset() * 60000;
        return new Date(d.getTime() - offset).toISOString().split('T')[0];
    };

    const [formData, setFormData] = useState({
        fecha: getLocalISODate(),
        horas: '',
        descripcion: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Validaciones
        if (parseFloat(formData.horas) < 0.5 || parseFloat(formData.horas) > 24) {
            showToast('Las horas deben estar entre 0.5 y 24', 'error');
            setLoading(false);
            return;
        }

        const hoy = new Date();
        const offset = hoy.getTimezoneOffset() * 60000;
        const hoyLocal = new Date(hoy.getTime() - offset).toISOString().split('T')[0];

        if (formData.fecha > hoyLocal) {
            showToast('No puedes registrar horas para fechas futuras', 'error');
            setLoading(false);
            return;
        }

        try {
            const payload = {
                ...formData,
                horas: parseFloat(formData.horas)
            };
            console.log('Enviando payload:', JSON.stringify(payload, null, 2));
            const data = await estudianteAPI.registrarHoras(payload);

            if (data.success) {
                showToast('¡Horas registradas exitosamente!', 'success');
                setFormData({
                    fecha: new Date().toISOString().split('T')[0],
                    horas: '',
                    descripcion: ''
                });
                if (onSuccess) onSuccess();
            } else {
                showToast(data.error || 'Error al registrar horas', 'error');
            }
        } catch (err) {
            console.error('Error detallado del registro:', err);
            if (err.response) {
                console.error('Respuesta del servidor:', err.response.data);
                console.error('Status:', err.response.status);
            }
            showToast(handleApiError(err), 'error');
        } finally {
            setLoading(false);
        }
    };

    const formContent = (
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
                    max={new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0]}
                    className="input-field"
                    required
                />
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
                    placeholder="Describe las actividades realizadas..."
                    required
                />
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-4 border-t">
                {isModal ? (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="btn-secondary"
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={() => {
                            const d = new Date();
                            const offset = d.getTimezoneOffset() * 60000;
                            const localDate = new Date(d.getTime() - offset).toISOString().split('T')[0];

                            setFormData({
                                fecha: localDate,
                                horas: '',
                                descripcion: ''
                            });
                        }}
                        className="btn-secondary"
                    >
                        Limpiar
                    </button>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    {loading ? 'Registrando...' : 'Registrar'}
                </button>
            </div>
        </form>
    );

    if (isModal) {
        return (
            <div className="space-y-4">
                {formContent}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Registrar Horas</h2>
                <p className="text-gray-600 mt-1">Registra tus horas de prácticas diarias</p>
            </div>

            <Card>
                {formContent}
            </Card>

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Consejos
                </h3>
                <ul className="space-y-1 text-sm text-blue-800">
                    <li>• Registra tus horas diariamente</li>
                    <li>• Sé específico en la descripción</li>
                    <li>• Máximo 24 horas por registro</li>
                </ul>
            </div>
        </div>
    );
}
