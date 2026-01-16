import React, { useState, useEffect } from 'react';
import { Plus, Building2, Edit2, Trash2, Eye, Search, Download, FileText } from 'lucide-react';
import Card from '../common/Card';
import Modal from '../common/Modal';
import LoadingSpinner from '../common/LoadingSpinner';
import { CardSkeleton } from '../common/Skeleton';
import { downloadCSV, downloadPDF } from '../../utils/exportHelpers';
import { useToast } from '../../context/ToastContext';
import { adminAPI } from '../../services/api'; // Check path
import { handleApiError } from '../../utils/helpers'; // Check path

export default function UniversidadesManager() {
    const [universidades, setUniversidades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [nombre, setNombre] = useState('');
    const { showToast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [activa, setActiva] = useState(true);
    const [showPeriodosModal, setShowPeriodosModal] = useState(false);
    const [periodos, setPeriodos] = useState([]);
    const [selectedUniName, setSelectedUniName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

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
            showToast(handleApiError(err), 'error');
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

        try {
            // Fix: Find original name to avoid sending it if unchanged (backend has a bug with unchanged names)
            const uniOriginal = universidades.find(u => u.id === currentId);
            const nombreOriginal = uniOriginal ? uniOriginal.nombre : '';

            const data = isEditing
                ? await adminAPI.actualizarUniversidad(currentId, nombre, activa, nombreOriginal)
                : await adminAPI.crearUniversidad(nombre);

            if (data.success) {
                showToast(isEditing ? 'Universidad actualizada exitosamente' : 'Universidad creada exitosamente', 'success');
                setNombre('');
                setIsEditing(false);
                setCurrentId(null);
                setActiva(true);
                setShowModal(false);
                loadUniversidades();
            } else {
                showToast(data.error || 'Error al procesar la solicitud', 'error');
            }
        } catch (err) {
            showToast(handleApiError(err), 'error');
        }
    };

    const handleExport = () => {
        if (!universidades.length) return;
        const dataToExport = universidades.map(uni => ({
            ID: uni.id,
            Nombre: uni.nombre,
            Estado: uni.activa ? 'Activa' : 'Inactiva',
            'Fecha Registro': new Date(uni.createdAt || Date.now()).toLocaleDateString() // Fallback date
        }));
        downloadCSV(dataToExport, 'universidades.csv');
    };

    const handleExportPDF = () => {
        if (!universidades.length) return;
        const dataToExport = universidades.map(uni => ({
            ID: uni.id,
            Nombre: uni.nombre,
            Estado: uni.activa ? 'Activa' : 'Inactiva',
            'Fecha Registro': formatDateForDisplay(uni.createdAt || Date.now())
        }));
        downloadPDF(dataToExport, 'universidades.pdf', 'Reporte de Universidades');
    };

    const filteredUniversidades = universidades.filter(uni =>
        uni.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Universidades</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Gestiona las universidades del sistema</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleExport}
                        className="btn-secondary flex items-center gap-2"
                        title="Exportar CSV"
                    >
                        <Download className="w-5 h-5" />
                        <span className="hidden sm:inline">CSV</span>
                    </button>
                    <button
                        onClick={handleExportPDF}
                        className="btn-secondary flex items-center gap-2"
                        title="Exportar PDF"
                    >
                        <FileText className="w-5 h-5" />
                        <span className="hidden sm:inline">PDF</span>
                    </button>
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
            </div>



            {/* Search Bar */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar universidad por nombre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    />
                </div>
            </div>

            {/* Lista de universidades */}
            {loading ? (
                <CardSkeleton count={6} />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredUniversidades.length > 0 ? (
                        filteredUniversidades.map((uni) => (
                            <Card key={uni.id}>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                                            <Building2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white">{uni.nombre}</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
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
                                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"
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
                                            className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition"
                                            title="Editar Universidad"
                                        >
                                            <Edit2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <div className="col-span-full py-8 text-center text-gray-500 dark:text-gray-400">
                            No se encontraron universidades con ese nombre.
                        </div>
                    )}
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
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Nombre de la Universidad
                        </label>
                        <input
                            type="text"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                            <label htmlFor="activa" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                        <p className="text-gray-500 dark:text-gray-400 text-center py-4">No hay periodos registrados para esta universidad.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nombre</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Inicio</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fin</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {periodos
                                        .filter(p => p.universidad_id === currentId)
                                        .map((periodo) => (
                                            <tr key={periodo.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{periodo.nombre}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDateForDisplay(periodo.fecha_inicio)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDateForDisplay(periodo.fecha_fin)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${periodo.activo ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
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
