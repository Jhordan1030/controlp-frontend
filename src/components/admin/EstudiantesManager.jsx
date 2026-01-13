import React, { useState, useEffect, useMemo } from 'react';

import { Plus, Users, Search, Filter, Download, Upload, MoreVertical, Edit, Trash2, Eye, X, Check, Lock, FileText, Key, Copy } from 'lucide-react';
import Card from '../common/Card';
import Modal from '../common/Modal';
import LoadingSpinner from '../common/LoadingSpinner';
import Alert from '../common/Alert';
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

    // Filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [filterUniversidad, setFilterUniversidad] = useState('');
    const [filterPeriodo, setFilterPeriodo] = useState('');
    const [filterEstado, setFilterEstado] = useState('all'); // all, active, inactive

    // Estado para edición
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    const [formData, setFormData] = useState({
        nombres: '',
        apellidos: '',
        email: '',
        password: '',
        universidad_id: '',
        periodo_id: '',
        activo: true
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

    const estudiantesFiltrados = useMemo(() => {
        return estudiantes.filter(est => {
            const matchesSearch =
                est.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
                est.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
                est.email.toLowerCase().includes(searchTerm.toLowerCase());

            // Comparación laxa por si vienen como string/number
            const matchesUniversidad = !filterUniversidad || (est.universidad_id == filterUniversidad || est.Universidad?.id == filterUniversidad);
            const matchesPeriodo = !filterPeriodo || (est.periodo_id == filterPeriodo || est.Periodo?.id == filterPeriodo);

            const matchesEstado =
                filterEstado === 'all' ? true :
                    filterEstado === 'active' ? est.activo :
                        !est.activo;

            return matchesSearch && matchesUniversidad && matchesPeriodo && matchesEstado;
        });
    }, [estudiantes, searchTerm, filterUniversidad, filterPeriodo, filterEstado]);

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({
            ...formData,
            [e.target.name]: value
        });
    };

    const resetForm = () => {
        setFormData({
            nombres: '',
            apellidos: '',
            email: '',
            password: '',
            universidad_id: '',
            periodo_id: '',
            activo: true
        });
        setIsEditing(false);
        setCurrentId(null);
    };

    const handleGeneratePassword = async (estudiante) => {
        if (!window.confirm(`¿Estás seguro de generar una nueva contraseña temporal para ${estudiante.nombres}?`)) {
            return;
        }

        const newPass = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4).toUpperCase(); // Algo random alphanumeric

        try {
            const res = await adminAPI.reestablecerPassword(estudiante.id, newPass);
            if (res.success) {
                setTempPassword(newPass);
                setPasswordCopied(false);
                setShowPasswordModal(true);
            } else {
                setError(res.error || 'Error al generar contraseña');
            }
        } catch (err) {
            setError(handleApiError(err));
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(tempPassword);
        setPasswordCopied(true);
        setTimeout(() => setPasswordCopied(false), 2000);
    };

    const saveStudent = async (shouldClose = true) => {
        setError('');
        setSuccess('');

        try {
            // Separar lógica de creación vs edición
            if (isEditing) {
                // 1. Actualizar datos generales (SIN password)
                const payload = { ...formData };
                delete payload.password; // Nunca enviamos password aquí

                const data = await adminAPI.actualizarEstudiante(currentId, payload);

                if (!data.success) {
                    throw new Error(data.error || 'Error al actualizar datos del estudiante');
                }

                // 2. Si hay password, actualizarla por separado
                if (formData.password && formData.password.trim() !== '') {
                    const passRes = await adminAPI.reestablecerPassword(currentId, formData.password);
                    if (!passRes.success) {
                        // Warning: datos guardados pero password falló
                        setSuccess('Datos actualizados, pero hubo un error cambiando la contraseña: ' + (passRes.error || 'desconocido'));
                        return;
                    }
                }

                setSuccess('Estudiante actualizado exitosamente');
                resetForm();
                setShowModal(false);
                loadData();

            } else {
                // Creación (se envía todo junto)
                const payload = { ...formData };
                const data = await adminAPI.crearEstudiante(payload);

                if (data.success) {
                    setSuccess('Estudiante creado exitosamente');

                    if (shouldClose) {
                        resetForm();
                        setShowModal(false);
                    } else {
                        // Mantener modal abierto pero limpiar campos clave
                        setFormData(prev => ({
                            ...prev,
                            nombres: '',
                            apellidos: '',
                            email: '',
                            password: '', // Reset password
                            // Mantener universidad y periodo para agilizar carga masiva
                        }));
                    }
                    loadData();
                } else {
                    setError(data.error || 'Error al guardar estudiante');
                }
            }
        } catch (err) {
            setError(handleApiError(err));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await saveStudent(true);
    };

    const handleEdit = (estudiante) => {
        setFormData({
            nombres: estudiante.nombres,
            apellidos: estudiante.apellidos,
            email: estudiante.email,
            password: '',
            universidad_id: estudiante.universidad_id || estudiante.Universidad?.id || '',
            periodo_id: estudiante.periodo_id || estudiante.Periodo?.id || '',
            activo: estudiante.activo
        });
        setIsEditing(true);
        setCurrentId(estudiante.id);
        setShowModal(true);
    };

    // Estados para detalle e importación
    const [showDetailModal, setShowDetailModal] = useState(false);

    // Estado para modal de contraseña temporal
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [tempPassword, setTempPassword] = useState('');
    const [passwordCopied, setPasswordCopied] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [activeTab, setActiveTab] = useState(0); // Índice del tab activo
    const [importing, setImporting] = useState(false);

    // Referencia para input file
    const fileInputRef = React.useRef(null);

    // Agrupación inteligente de registros y matriculaciones por periodo
    const studentPeriodData = useMemo(() => {
        if (!selectedStudent) return [];

        const groups = {};

        // 1. Inicializar grupos basados en Matriculaciones (Historial oficial)
        if (selectedStudent.matriculaciones) {
            selectedStudent.matriculaciones.forEach(mat => {
                // Resolver el periodo: puede venir anidado (mat.periodo) o solo id (mat.periodo_id)
                let periodObj = mat.periodo;
                if (!periodObj && mat.periodo_id) {
                    periodObj = periodos.find(p => p.id == mat.periodo_id); // Loose equality para soportar string/number
                }

                if (periodObj) {
                    groups[periodObj.id] = {
                        id: periodObj.id,
                        name: periodObj.nombre,
                        totalHoras: 0,
                        horasAprobadas: 0,
                        estado: mat.estado, // activo, completado, etc.
                        registros: []
                    };
                }
            });
        }

        // 2. Procesar registros y asignarlos a grupos
        if (selectedStudent.registros) {
            selectedStudent.registros.forEach(reg => {
                let periodId = reg.periodo_id;
                let periodName = 'Sin Asignar';

                // A. Intentar por ID directo
                if (periodId) {
                    const period = periodos.find(p => p.id === periodId);
                    if (period) periodName = period.nombre;
                } else {
                    // B. "Smart Grouping" por fecha si falta ID
                    const regDate = new Date(reg.fecha);
                    const match = periodos.find(p => {
                        const start = new Date(p.fecha_inicio);
                        const end = new Date(p.fecha_fin);
                        return regDate >= start && regDate <= end;
                    });
                    if (match) {
                        periodId = match.id;
                        periodName = match.nombre;
                    }
                }

                // Si no existe el grupo (ej. registro sin matricula o periodo antiguo), crearlo
                const key = periodId || 'unknown';
                if (!groups[key]) {
                    groups[key] = {
                        id: key,
                        name: periodId ? periodName : 'Periodo Desconocido',
                        totalHoras: 0,
                        horasAprobadas: 0,
                        registros: []
                    };
                }

                groups[key].registros.push(reg);
                groups[key].totalHoras += parseFloat(reg.horas || 0);
                if (reg.estado?.nombre === 'Aprobado') {
                    groups[key].horasAprobadas += parseFloat(reg.horas_aprobadas || reg.horas || 0);
                }
            });
        }

        // Ordenar: Primero el periodo actual (si existe), luego por nombre descendente (más recientes primero)
        return Object.values(groups).sort((a, b) => {
            // Si queremos lógica específica para "Periodo Actual" primero, necesitaríamos saber cuál es.
            // Por defecto ordenamos por nombre descendente asumiendo formato "2024-2025"
            return b.name.localeCompare(a.name);
        });
    }, [selectedStudent, periodos]);

    const handleViewDetails = async (estudiante) => {
        try {
            setLoading(true);
            setLoading(true);
            const data = await adminAPI.getEstudiante(estudiante.id);
            if (data.success) {
                // Combinar datos frescos con las matriculaciones que ya tenemos en la lista
                // porque getEstudiante (backend) a veces no retorna matriculaciones
                setSelectedStudent({
                    ...data.estudiante,
                    matriculaciones: data.estudiante.matriculaciones || estudiante.matriculaciones || []
                });
                setActiveTab(0); // Reset ear al primer tab
                setShowDetailModal(true);
            } else {
                setError('No se pudieron cargar los detalles');
            }
        } catch (err) {
            setError('Error al cargar detalles');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        if (!estudiantes.length) return;

        const headers = ['ID', 'Nombres', 'Apellidos', 'Email', 'Universidad', 'Periodo', 'Estado'];
        const rows = estudiantes.map(est => [
            est.id,
            est.nombres,
            est.apellidos,
            est.email,
            universidades.find(u => u.id === est.universidad_id)?.nombre || 'N/A',
            periodos.find(p => p.id === est.periodo_id)?.nombre || 'N/A',
            est.activo ? 'Activo' : 'Inactivo'
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "estudiantes.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImportClick = () => {
        fileInputRef.current.click();
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setImporting(true);
        const reader = new FileReader();

        reader.onload = async (evt) => {
            const text = evt.target.result;
            const rows = text.split('\n').slice(1); // Ignorar header
            let successCount = 0;
            let errorCount = 0;

            for (const row of rows) {
                if (!row.trim()) continue;
                const cols = row.split(',');
                if (cols.length < 3) continue; // Mínimo nombre, apellido, email

                // Formato esperado CSV: Nombres,Apellidos,Email,Password,UniversidadID,PeriodoID
                const [nombres, apellidos, email, password, uniId, perId] = cols.map(c => c.trim());

                try {
                    const payload = {
                        nombres,
                        apellidos,
                        email,
                        password: password || '123456', // Password por defecto si falta
                        universidad_id: uniId || '',
                        periodo_id: perId || ''
                    };
                    const res = await adminAPI.crearEstudiante(payload);
                    if (res.success) successCount++;
                    else errorCount++;
                } catch (err) {
                    errorCount++;
                }
            }

            setSuccess(`Importación finalizada: ${successCount} creados, ${errorCount} fallidos.`);
            setImporting(false);
            loadData();
            e.target.value = ''; // Reset input
        };

        reader.readAsText(file);
    };

    const handleToggleStatus = async (estudiante) => {
        if (!window.confirm(`¿Seguro que deseas ${estudiante.activo ? 'desactivar' : 'activar'} a este estudiante?`)) return;

        try {
            const data = await adminAPI.toggleEstudiante(estudiante.id);

            if (data.success) {
                setSuccess(`Estudiante ${data.estudiante.activo ? 'activado' : 'desactivado'} correctamente`);
                loadData();
            } else {
                setError(data.error || 'Error al cambiar estado');
            }
        } catch (err) {
            console.error(err);
            setError('Error al actualizar estado');
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Estudiantes</h2>
                    <p className="text-gray-600 mt-1">
                        Gestión completa de estudiantes ({estudiantes.length} total)
                    </p>
                </div>
                <div className="flex gap-2">
                    {/* Input oculto para importación */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        accept=".csv"
                        onChange={handleFileUpload}
                    />

                    <button
                        onClick={handleImportClick}
                        disabled={importing}
                        className="btn-secondary flex items-center gap-2 text-sm"
                    >
                        {importing ? <LoadingSpinner size="sm" /> : <Upload className="w-4 h-4" />}
                        <span className="hidden sm:inline">{importing ? 'Importando...' : 'Importar CSV'}</span>
                    </button>
                    <button
                        onClick={handleExport}
                        className="btn-secondary flex items-center gap-2 text-sm"
                    >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Exportar CSV</span>
                    </button>
                    <button
                        onClick={() => {
                            resetForm();
                            setShowModal(true);
                        }}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        <span className="hidden sm:inline">Nuevo Estudiante</span>
                    </button>
                </div>
            </div>

            {error && <Alert type="error" message={error} onClose={() => setError('')} />}
            {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

            {/* Barra de Filtros */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, apellido o email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-field pl-10"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                        <select
                            value={filterUniversidad}
                            onChange={(e) => setFilterUniversidad(e.target.value)}
                            className="input-field min-w-[150px]"
                        >
                            <option value="">Todas las Universidades</option>
                            {universidades.map(uni => (
                                <option key={uni.id} value={uni.id}>{uni.nombre}</option>
                            ))}
                        </select>
                        <select
                            value={filterPeriodo}
                            onChange={(e) => setFilterPeriodo(e.target.value)}
                            className="input-field min-w-[150px]"
                        >
                            <option value="">Todos los Periodos</option>
                            {periodos.map(per => (
                                <option key={per.id} value={per.id}>{per.nombre}</option>
                            ))}
                        </select>
                        <select
                            value={filterEstado}
                            onChange={(e) => setFilterEstado(e.target.value)}
                            className="input-field min-w-[120px]"
                        >
                            <option value="all">Todos los Estados</option>
                            <option value="active">Activos</option>
                            <option value="inactive">Inactivos</option>
                        </select>
                    </div>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>Mostrando {estudiantesFiltrados.length} estudiantes</span>
                    {(searchTerm || filterUniversidad || filterPeriodo || filterEstado !== 'all') && (
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setFilterUniversidad('');
                                setFilterPeriodo('');
                                setFilterEstado('all');
                            }}
                            className="text-red-600 hover:text-red-800 underline flex items-center gap-1"
                        >
                            <X className="w-3 h-3" /> Limpiar filtros
                        </button>
                    )}
                </div>
            </div>

            {/* Tabla de Estudiantes (Reemplaza Card grid para mejor densidad) */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estudiante</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Universidad / Periodo</th>

                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {estudiantesFiltrados.length === 0 ? (
                                <tr>
                                    <td colspan="5" className="px-6 py-10 text-center text-gray-500">
                                        No se encontraron estudiantes con los filtros actuales.
                                    </td>
                                </tr>
                            ) : (
                                estudiantesFiltrados.map((est) => (
                                    <tr key={est.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                                                    {est.nombres.charAt(0)}{est.apellidos.charAt(0)}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{est.nombres} {est.apellidos}</div>
                                                    <div className="text-sm text-gray-500">{est.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {universidades.find(u => u.id === est.universidad_id)?.nombre || 'Sin Universidad'}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {periodos.find(p => p.id === est.periodo_id)?.nombre || 'Sin Periodo'}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => handleToggleStatus(est)}
                                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer transition-colors ${est.activo ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                    }`}
                                                title="Clic para cambiar estado"
                                            >
                                                {est.activo ? 'Activo' : 'Inactivo'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleViewDetails(est)}
                                                    className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                                                    title="Ver Detalles"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(est)}
                                                    className="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-50 rounded"
                                                    title="Editar"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleGeneratePassword(est)}
                                                    className="text-amber-600 hover:text-amber-900 p-1 hover:bg-amber-50 rounded"
                                                    title="Reestablecer Contraseña"
                                                >
                                                    <Key className="w-4 h-4" />
                                                </button>
                                                {/* Más botones se implementarán en breve */}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Paginación simple (opcional para v2) */}
            </div>

            {/* Modal crear/editar estudiante */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={isEditing ? "Editar Estudiante" : "Nuevo Estudiante"}
                size="md"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            {isEditing ? 'Nueva Contraseña (Opcional)' : 'Contraseña'}
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="input-field pl-10"
                                minLength="6"
                                required={!isEditing}
                                placeholder={isEditing ? "Dejar en blanco para mantener actual" : ""}
                            />
                        </div>
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

                    {isEditing && (
                        <div className="flex items-center gap-2 mt-2">
                            <input
                                type="checkbox"
                                name="activo"
                                id="activo"
                                checked={formData.activo}
                                onChange={handleChange}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label htmlFor="activo" className="ml-2 block text-sm text-gray-900">
                                Estudiante Activo
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

                        {!isEditing && (
                            <button
                                type="button"
                                onClick={() => saveStudent(false)}
                                className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors font-medium text-sm"
                            >
                                Guardar y crear otro
                            </button>
                        )}

                        <button type="submit" className="btn-primary">
                            {isEditing ? 'Actualizar' : 'Crear Estudiante'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal Detalle Estudiante */}
            <Modal
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                title="Detalle del Estudiante"
                size="lg"
            >
                {selectedStudent && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl font-bold text-blue-700">
                                {selectedStudent.nombres.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{selectedStudent.nombres} {selectedStudent.apellidos}</h3>
                                <p className="text-gray-600">{selectedStudent.email}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 border rounded-lg">
                                <p className="text-sm text-gray-500 mb-1">Universidad</p>
                                <p className="font-medium">
                                    {universidades.find(u => u.id === selectedStudent.universidad_id)?.nombre || 'No asignada'}
                                </p>
                            </div>
                            <div className="p-4 border rounded-lg">
                                <p className="text-sm text-gray-500 mb-1">Periodo Actual</p>
                                <p className="font-medium">
                                    {periodos.find(p => p.id === selectedStudent.periodo_id)?.nombre || 'No asignado'}
                                </p>
                            </div>
                            <div className="p-4 border rounded-lg">
                                <p className="text-sm text-gray-500 mb-1">Estado</p>
                                <span className={`px-2 py-1 text-xs rounded-full font-semibold ${selectedStudent.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {selectedStudent.activo ? 'Activo' : 'Inactivo'}
                                </span>
                            </div>
                            <div className="p-4 border rounded-lg">
                                <p className="text-sm text-gray-500 mb-1">Total Horas</p>
                                <p className="font-medium text-lg text-blue-600 font-bold">
                                    {selectedStudent.totalHoras || 0} h
                                </p>
                            </div>
                        </div>

                        {/* TABS DE PERIODOS */}
                        <div>
                            <div className="border-b border-gray-200 mb-4">
                                <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Tabs">
                                    {studentPeriodData.length > 0 ? (
                                        studentPeriodData.map((group, index) => (
                                            <button
                                                key={group.id}
                                                onClick={() => setActiveTab(index)}
                                                className={`
                                                    whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors
                                                    ${activeTab === index
                                                        ? 'border-blue-500 text-blue-600'
                                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                    }
                                                `}
                                            >
                                                {group.name}
                                                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${activeTab === index ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {group.horasAprobadas}h Aprob.
                                                </span>
                                            </button>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500 py-2">Sin registros de actividad</p>
                                    )}
                                </nav>
                            </div>

                            {/* CONTENIDO DEL TAB ACTIVO */}
                            {studentPeriodData.length > 0 && studentPeriodData[activeTab] && (
                                <div className="bg-white border rounded-lg overflow-hidden animate-fadeIn">
                                    <div className="p-3 bg-gray-50 border-b flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-700">Resumen del Periodo</span>
                                        <div className="text-sm text-gray-600">
                                            Total Registrado: <b>{studentPeriodData[activeTab].totalHoras}h</b>
                                        </div>
                                    </div>
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Horas</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Aprobador</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {studentPeriodData[activeTab].registros.map((reg, index) => (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    <td className="px-4 py-2 text-sm text-gray-900">
                                                        {new Date(reg.fecha).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-4 py-2 text-sm text-gray-900 font-medium">
                                                        {reg.horas} h
                                                    </td>
                                                    <td className="px-4 py-2 text-sm text-gray-500 truncate max-w-[200px]" title={reg.descripcion}>
                                                        {reg.descripcion}
                                                    </td>
                                                    <td className="px-4 py-2 text-sm">
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${reg.estado?.nombre === 'Aprobado' ? 'bg-green-100 text-green-800' :
                                                            reg.estado?.nombre === 'Rechazado' ? 'bg-red-100 text-red-800' :
                                                                'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                            {reg.estado?.nombre || 'Pendiente'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2 text-sm text-gray-500">
                                                        {reg.aprobadoPor?.nombres || '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="btn-secondary"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Modal de Contraseña Temporal */}
            <Modal
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                title="Contraseña Temporal Generada"
                size="sm"
            >
                <div className="space-y-4 text-center py-4">
                    <p className="text-gray-600 text-sm">
                        Se ha generado la siguiente contraseña temporal. <br />
                        Compártela con el estudiante para que pueda acceder (luego podrá cambiarla).
                    </p>

                    <div className="flex items-center justify-center gap-2 bg-gray-100 p-4 rounded-lg border border-gray-200">
                        <span className="text-xl font-mono font-bold text-gray-800 tracking-wider select-all">
                            {tempPassword}
                        </span>
                        <button
                            onClick={copyToClipboard}
                            className="p-1.5 hover:bg-gray-200 rounded-md transition-colors text-gray-500 hover:text-gray-700"
                            title="Copiar al portapapeles"
                        >
                            {passwordCopied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>

                    <div className="pt-2">
                        <button
                            onClick={() => setShowPasswordModal(false)}
                            className="btn-primary w-full justify-center"
                        >
                            Entendido
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}