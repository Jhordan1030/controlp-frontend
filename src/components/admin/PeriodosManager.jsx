import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Edit2, Eye, User, GraduationCap, Trash2, Filter, Search } from 'lucide-react';
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

    // Filtros
    const [filterUniversidad, setFilterUniversidad] = useState('');
    const [filterAnio, setFilterAnio] = useState('');

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
            setCurrentId(periodo.id); // Asegurar que tenemos el ID para inscribir luego
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

    // Estados para inscripción
    const [showInscripcionModal, setShowInscripcionModal] = useState(false);
    const [candidatos, setCandidatos] = useState([]);
    const [selectedStudentIds, setSelectedStudentIds] = useState([]); // Changed to array for multiple selection
    const [searchTerm, setSearchTerm] = useState('');

    const handlePrepareInscripcion = async () => {
        try {
            setLoading(true);
            const userResponse = await adminAPI.getEstudiantes();

            if (userResponse.success) {
                const periodoActual = periodos.find(p => p.id === currentId);

                // Filtrar: Estudiantes de la misma universidad Y que NO estén ya en este periodo
                // Robustez: verificar universidad_id o objeto anidado Universidad/universidad

                const disponibles = userResponse.estudiantes.filter(est => {
                    const estUniId = est.universidad_id || est.Universidad?.id || est.universidad?.id;
                    // Comparación laxa (==) por si uno es string y otro número
                    return estUniId == periodoActual.universidad_id && est.periodo_id != periodoActual.id;
                });

                setCandidatos(disponibles);
                setSelectedStudentIds([]); // Visual reset
                setSearchTerm(''); // Reset search
                setShowInscripcionModal(true);
            }
        } catch (err) {
            console.error(err);
            setError('Error al cargar candidatos para inscripción');
        } finally {
            setLoading(false);
        }
    };

    const handleInscribir = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (selectedStudentIds.length === 0) {
            setError('Seleccione al menos un estudiante');
            return;
        }

        try {
            setLoading(true);
            // Procesar inscripciones en paralelo o serie
            const promises = selectedStudentIds.map(id =>
                adminAPI.actualizarEstudiante(id, {
                    periodo_id: currentId
                })
            );

            await Promise.all(promises);

            setSuccess(`${selectedStudentIds.length} estudiantes inscritos correctamente`);
            setShowInscripcionModal(false);

            const periodoActual = periodos.find(p => p.id === currentId);
            if (periodoActual) handleVerEstudiantes(periodoActual);

        } catch (err) {
            setError(handleApiError(err));
        } finally {
            setLoading(false);
        }
    };

    const toggleStudentSelection = (id) => {
        setSelectedStudentIds(prev => {
            if (prev.includes(id)) {
                return prev.filter(sid => sid !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const filteredCandidatos = candidatos.filter(est =>
        est.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
        est.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
        est.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleSelectAll = () => {
        if (selectedStudentIds.length === filteredCandidatos.length && filteredCandidatos.length > 0) {
            setSelectedStudentIds([]);
        } else {
            setSelectedStudentIds(filteredCandidatos.map(c => c.id));
        }
    };

    const candidatesLength = candidatos.length;

    const handleRemoverEstudiante = async (estudianteId) => {
        if (!window.confirm('¿Estás seguro de quitar a este estudiante del periodo?')) return;

        try {
            await adminAPI.actualizarEstudiante(estudianteId, {
                periodo_id: null // Desvincular del periodo
            });

            // Recargar lista de estudiantes del periodo actual
            const periodoActual = periodos.find(p => p.id === currentId);
            if (periodoActual) handleVerEstudiantes(periodoActual);

        } catch (err) {
            console.error(err);
            setError('Error al remover estudiante');
        }
    };

    const handleToggleStatus = async (periodo) => {
        if (!window.confirm(`¿Seguro que deseas ${periodo.activo ? 'desactivar' : 'activar'} este periodo?`)) return;

        try {
            const data = await adminAPI.togglePeriodo(periodo.id);
            if (data.success) {
                setSuccess(`Periodo ${data.periodo.activo ? 'activado' : 'desactivado'} correctamente`);
                loadData();
            } else {
                setError(data.error || 'Error al cambiar estado');
            }
        } catch (err) {
            setError(handleApiError(err));
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

            {/* Filtros */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por Universidad</label>
                    <select
                        value={filterUniversidad}
                        onChange={(e) => setFilterUniversidad(e.target.value)}
                        className="input-field"
                    >
                        <option value="">Todas las Universidades</option>
                        {universidades.map(uni => (
                            <option key={uni.id} value={uni.id}>{uni.nombre}</option>
                        ))}
                    </select>
                </div>
                <div className="w-40">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
                    <select
                        value={filterAnio}
                        onChange={(e) => setFilterAnio(e.target.value)}
                        className="input-field"
                    >
                        <option value="">Todos</option>
                        {/* Generar años dinámicamente o estáticos */}
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                    </select>
                </div>
                <div className="pb-1 text-gray-500 text-sm flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <span>{periodos.filter(p =>
                        (!filterUniversidad || p.universidad_id == filterUniversidad) &&
                        (!filterAnio || p.fecha_inicio.includes(filterAnio))
                    ).length} resultados</span>

                    {(filterUniversidad || filterAnio) && (
                        <button
                            onClick={() => {
                                setFilterUniversidad('');
                                setFilterAnio('');
                            }}
                            className="text-xs text-red-600 hover:text-red-800 underline ml-2"
                        >
                            Limpiar filtros
                        </button>
                    )}
                </div>
            </div>

            {/* Lista de periodos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {periodos
                    .filter(periodo => {
                        const cumpleUni = !filterUniversidad || periodo.universidad_id == filterUniversidad;
                        const cumpleAnio = !filterAnio || periodo.fecha_inicio.includes(filterAnio);
                        return cumpleUni && cumpleAnio;
                    })
                    .map((periodo) => (
                        <Card key={periodo.id}>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Calendar className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{periodo.nombre}</h3>
                                        <p className="text-sm text-gray-600">
                                            {universidades.find(u => u.id === periodo.universidad_id)?.nombre || 'Sin universidad'}
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

                                <div className="flex gap-2 justify-end pt-2">
                                    <button
                                        onClick={() => handleVerEstudiantes(periodo)}
                                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition flex items-center gap-1 text-sm font-medium"
                                        title="Ver Estudiantes"
                                    >
                                        <Eye className="w-4 h-4" />
                                        <span className="hidden md:inline">Ver Estudiantes</span>
                                    </button>
                                    <button
                                        onClick={() => handleEdit(periodo)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition flex items-center gap-1 text-sm font-medium"
                                        title="Editar Periodo"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        <span className="hidden md:inline">Editar</span>
                                    </button>
                                    <button
                                        onClick={() => handleToggleStatus(periodo)}
                                        className={`p-2 rounded-lg transition flex items-center gap-1 text-sm font-medium ${periodo.activo
                                            ? 'text-red-600 hover:bg-red-50'
                                            : 'text-green-600 hover:bg-green-50'
                                            }`}
                                        title={periodo.activo ? 'Desactivar' : 'Activar'}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        <span className="hidden md:inline">{periodo.activo ? 'Desactivar' : 'Activar'}</span>
                                    </button>
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
                <div className="space-y-4">
                    <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                        <span className="text-sm text-gray-600">Estudiantes matriculados: <span className="font-bold text-gray-900">{estudiantes.length}</span></span>
                        <button
                            onClick={() => {
                                // currentId ya debe estar seteado cuando se abrió este modal?
                                // handleVerEstudiantes no setea currentId, vamos a tener problemas.
                                // Debemos asegurarnos que currentId se setee al ver estudiantes.
                                // Fix: handleVerEstudiantes setea setSelectedPeriodoName pero no currentId.
                                // Vamos a usar una función wrapper segura o confiar en el estado si lo corregimos.
                                // Asumiremos que corregiremos handleVerEstudiantes para setear currentId.
                                handlePrepareInscripcion();
                            }}
                            className="btn-primary text-sm py-1.5 px-3 flex items-center gap-1"
                        >
                            <Plus className="w-4 h-4" />
                            Inscribir Estudiante
                        </button>
                    </div>

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
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
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
                                                            <div className="text-sm font-medium text-gray-900">{est.nombres} {est.apellidos}</div>
                                                            <div className="text-sm text-gray-500">{est.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => handleRemoverEstudiante(est.id)}
                                                        className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-full hover:bg-red-100 transition"
                                                        title="Quitar del periodo"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </td>
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
                </div>
            </Modal>

            {/* Modal Inscripción */}
            <Modal
                isOpen={showInscripcionModal}
                onClose={() => setShowInscripcionModal(false)}
                title="Inscribir Estudiante"
                size="md"
            >
                <form onSubmit={handleInscribir} className="space-y-4">
                    <div>
                        <p className="mb-4 text-gray-600">
                            Matricular estudiante en: <span className="font-semibold">{selectedPeriodoName}</span>
                        </p>
                        {/* Debug Info para el usuario */}
                        {currentId && (
                            <p className="mb-3 text-xs text-blue-600 bg-blue-50 p-2 rounded">
                                <strong>Filtro aplicado:</strong> Mostrando estudiantes de la universidad <span className="font-bold uppercase">{periodos.find(p => p.id === currentId)?.universidad_id && universidades.find(u => u.id === periodos.find(p => p.id === currentId).universidad_id)?.nombre}</span>
                            </p>
                        )}

                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Seleccionar Estudiante
                        </label>

                        {candidatos.length === 0 ? (
                            <div className="p-3 bg-yellow-50 text-yellow-700 rounded-lg text-sm">
                                No hay estudiantes disponibles de esta universidad para inscribir.
                            </div>
                        ) : (
                            <div className="border rounded-md max-h-60 overflow-y-auto p-2 space-y-2 bg-gray-50">
                                {/* Barra de búsqueda integrada */}
                                <div className="p-2 border-b border-gray-200 bg-white sticky top-0 z-10">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Search className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                                            placeholder="Buscar por nombre o correo..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center p-2 border-b border-gray-200 mb-0 bg-gray-100">
                                    <input
                                        type="checkbox"
                                        id="select-all"
                                        checked={filteredCandidatos.length > 0 && selectedStudentIds.length === filteredCandidatos.length}
                                        onChange={toggleSelectAll}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="select-all" className="ml-2 block text-xs font-semibold text-gray-700 uppercase tracking-wide cursor-pointer">
                                        Seleccionar Todo ({selectedStudentIds.length})
                                    </label>
                                </div>

                                {filteredCandidatos.length === 0 ? (
                                    <p className="text-center text-gray-500 text-sm py-4">No se encontraron estudiantes.</p>
                                ) : (
                                    filteredCandidatos.map(est => (
                                        <div key={est.id} className="flex items-start p-2 hover:bg-white rounded transition-colors cursor-pointer" onClick={() => toggleStudentSelection(est.id)}>
                                            <div className="flex items-center h-5">
                                                <input
                                                    id={`student-${est.id}`}
                                                    type="checkbox"
                                                    checked={selectedStudentIds.includes(est.id)}
                                                    onChange={() => { }} // Handled by div onClick
                                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded pointer-events-none"
                                                />
                                            </div>
                                            <div className="ml-3 text-sm">
                                                <label htmlFor={`student-${est.id}`} className="font-medium text-gray-700 block cursor-pointer select-none pointer-events-none">
                                                    {est.nombres} {est.apellidos}
                                                </label>
                                                <span className="text-gray-500 text-xs block pointer-events-none">{est.email}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setShowInscripcionModal(false)}
                            className="btn-secondary"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={selectedStudentIds.length === 0}
                        >
                            Inscribir
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}