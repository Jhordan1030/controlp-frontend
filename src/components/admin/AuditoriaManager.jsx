import React, { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, FileText, User, Shield, AlertTriangle, Download } from 'lucide-react';
import Card from '../common/Card';
import LoadingSpinner from '../common/LoadingSpinner';
import { TableSkeleton } from '../common/Skeleton';
import { adminAPI, authAPI } from '../../services/api'; // Import authAPI
import { formatDateShort, handleApiError } from '../../utils/helpers';
import { downloadCSV, downloadPDF } from '../../utils/exportHelpers';
import { useToast } from '../../context/ToastContext';

export default function AuditoriaManager() {
    const [auditoria, setAuditoria] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    // Paginación
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 20;

    // Filtros
    const [filterTipoUsuario, setFilterTipoUsuario] = useState('');
    const [filterAccion, setFilterAccion] = useState('');

    const [userMap, setUserMap] = useState({});

    // Cargar datos cuando cambian los filtros o la página
    useEffect(() => {
        loadData();
    }, [page, filterTipoUsuario, filterAccion]);

    // Resetear página cuando cambian los filtros
    useEffect(() => {
        setPage(1);
    }, [filterTipoUsuario, filterAccion]);

    // Cargar mapa de usuarios al inicio
    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const map = {};

            // 1. Cargar perfil del admin actual para mapearse a sí mismo
            try {
                const perfilData = await authAPI.getPerfil();
                if (perfilData.success) {
                    const usr = perfilData.usuario || perfilData.admin; // Adjust based on response structure
                    if (usr && usr.id) {
                        const nombre = usr.nombres || usr.nombre || 'Administrador';
                        const apellido = usr.apellidos || '';
                        map[usr.id] = (nombre + ' ' + apellido).trim();
                    }
                }
            } catch (e) {
                console.warn('No se pudo cargar perfil para auditoria', e);
            }

            // 2. Cargar masiva de estudiantes (limit alto hack para diccionario)
            // Idealmente esto debería ser un endpoint de búsqueda por IDs o select
            const estData = await adminAPI.getEstudiantes({ limit: 1000 });
            if (estData.success) {
                if (Array.isArray(estData.estudiantes)) {
                    estData.estudiantes.forEach((est) => {
                        const nombre = est.nombres || '';
                        const apellido = est.apellidos || '';
                        map[est.id] = (nombre + ' ' + apellido).trim();
                    });
                }
            }
            setUserMap(map);

        } catch (err) {
            console.error('Error cargando usuarios para auditoría:', err);
        }
    };

    const loadData = async () => {
        try {
            setLoading(true);
            const params = {
                page,
                limit,
                usuario_tipo: filterTipoUsuario || undefined,
                accion: filterAccion || undefined,
                search: filterAccion || undefined
            };

            const data = await adminAPI.getAuditoria(params);

            if (data.success) {
                setAuditoria(data.data);
                if (data.pagination) {
                    setTotalPages(data.pagination.pages);
                }
            } else {
                showToast(data.error || 'Error al cargar auditoría', 'error');
            }
        } catch (err) {
            showToast(handleApiError(err), 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        if (!auditoria.length) return;
        const dataToExport = auditoria.map(log => ({
            Fecha: formatDateShort(log.created_at),
            Hora: new Date(log.created_at).toLocaleTimeString(),
            IP: log.ip_address,
            Usuario: log.usuario_tipo === 'estudiante' && userMap[log.usuario_id]
                ? userMap[log.usuario_id]
                : (log.usuario_id || 'Sistema'),
            Tipo: log.usuario_tipo || 'Sistema',
            Accion: log.accion,
            Tabla: log.tabla_afectada,
            Recurso: log.registro_id,
            Detalles: JSON.stringify(log.detalles || {})
        }));
        downloadCSV(dataToExport, 'auditoria_logs.csv');
    };

    const handleExportPDF = () => {
        if (!auditoria.length) return;
        const dataToExport = auditoria.map(log => ({
            Fecha: formatDateShort(log.created_at),
            Hora: new Date(log.created_at).toLocaleTimeString(),
            IP: log.ip_address,
            Usuario: log.usuario_tipo === 'estudiante' && userMap[log.usuario_id]
                ? userMap[log.usuario_id]
                : (log.usuario_id || 'Sistema'),
            Accion: log.accion,
            Tabla: log.tabla_afectada,
            Recurso: log.registro_id
        }));
        downloadPDF(dataToExport, 'auditoria_logs.pdf', 'Reporte de Auditoría');
    };

    const getActionIcon = (accion) => {
        if (accion.includes('CREATE')) return <span className="text-green-600 font-bold">+</span>;
        if (accion.includes('UPDATE')) return <span className="text-blue-600 font-bold">✎</span>;
        if (accion.includes('DELETE')) return <span className="text-red-600 font-bold">✕</span>;
        if (accion.includes('LOGIN')) return <span className="text-indigo-600">➔</span>;
        return <span className="text-gray-500">•</span>;
    };

    const getActionColor = (accion) => {
        if (accion.includes('CREATE')) return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
        if (accion.includes('UPDATE')) return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
        if (accion.includes('DELETE')) return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
        if (accion.includes('LOGIN')) return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800';
        return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Auditoría del Sistema</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Registro de actividades y cambios</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleExport}
                        className="btn-secondary flex items-center gap-2 text-sm"
                        title="Exportar página actual a CSV"
                    >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">CSV</span>
                    </button>
                    <button
                        onClick={handleExportPDF}
                        className="btn-secondary flex items-center gap-2 text-sm"
                        title="Exportar página actual a PDF"
                    >
                        <FileText className="w-4 h-4" />
                        <span className="hidden sm:inline">PDF</span>
                    </button>
                    <button
                        onClick={() => { setPage(1); loadData(); }}
                        className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 dark:text-gray-400 dark:hover:text-indigo-400 dark:hover:bg-indigo-900/30 rounded-full transition"
                        title="Recargar"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Filtros */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-wrap gap-4 items-end transition-colors duration-200">
                <div className="w-full md:w-auto">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo de Usuario</label>
                    <select
                        value={filterTipoUsuario}
                        onChange={(e) => { setFilterTipoUsuario(e.target.value); setPage(1); }}
                        className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                        <option value="">Todos</option>
                        <option value="admin">Administrador</option>
                        <option value="estudiante">Estudiante</option>
                        <option value="sistema">Sistema</option>
                    </select>
                </div>
                <div className="w-full md:w-auto">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Acción</label>
                    <select
                        value={filterAccion}
                        onChange={(e) => { setFilterAccion(e.target.value); setPage(1); }}
                        className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                        <option value="">Todas</option>
                        <option value="LOGIN_SUCCESS">Inicio de Sesión</option>
                        <option value="CREATE">Creación</option>
                        <option value="UPDATE">Actualización</option>
                        <option value="DELETE">Eliminación</option>
                    </select>
                </div>
                <div className="pb-1 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Filter className="w-4 h-4" />
                    Filtros activos
                </div>
            </div>

            {/* Tabla */}
            {loading && auditoria.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 transition-colors duration-200">
                    <TableSkeleton rows={10} />
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-200">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fecha / IP</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Usuario</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acción</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tabla / Recurso</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Detalles</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {auditoria.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                                            No hay registros de auditoría.
                                        </td>
                                    </tr>
                                ) : (
                                    auditoria.map((log) => (
                                        <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 font-mono text-sm transition-colors duration-150">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-gray-900 dark:text-white font-medium">{formatDateShort(log.created_at)}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">{new Date(log.created_at).toLocaleTimeString()}</div>
                                                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{log.ip_address}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <User className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {userMap[log.usuario_id]
                                                                ? userMap[log.usuario_id]
                                                                : log.usuario_tipo === 'administrador'
                                                                    ? ('Admin (' + log.usuario_id.substring(0, 8) + '...)')
                                                                    : (log.usuario_id || 'Sistema')}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                                                            {log.usuario_tipo || 'Sistema'}
                                                            {log.usuario_id && !userMap[log.usuario_id] && log.usuario_tipo !== 'administrador' && (
                                                                <span className="block text-[10px] text-gray-400 dark:text-gray-500 overflow-hidden text-ellipsis w-[100px]">
                                                                    {log.usuario_id}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ' + getActionColor(log.accion)}>
                                                    {log.accion}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                                                {log.tabla_afectada}
                                                <span className="text-gray-400 dark:text-gray-500 text-xs ml-1">#{log.registro_id}</span>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400 max-w-xs break-all">
                                                {log.detalles ? JSON.stringify(log.detalles).substring(0, 100) + (JSON.stringify(log.detalles).length > 100 ? '...' : '') : '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginación */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    Página <span className="font-medium">{page}</span> de <span className="font-medium">{totalPages}</span>
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button
                                        onClick={() => setPage(Math.max(1, page - 1))}
                                        disabled={page === 1}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:cursor-not-allowed"
                                    >
                                        Anterior
                                    </button>
                                    <button
                                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                                        disabled={page === totalPages}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:cursor-not-allowed"
                                    >
                                        Siguiente
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
