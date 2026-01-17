// ==================== src/services/api.js ====================
import axios from 'axios';

const API_URL = import.meta.env.DEV ? '/api/v1' : (import.meta.env.VITE_API_URL || 'https://controlp-backend.vercel.app/api/v1');

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor para agregar token automáticamente
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor para manejar errores
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
        }
        // Debug: Log server errors
        if (error.response?.status >= 500) {
            console.error('Server Error (500+):', error.response.data);
        }
        return Promise.reject(error);
    }
);

// ========== CACHE SYSTEM ==========
const cache = new Map();
const CACHE_TTL = 30000; // 30 segundos de cache por defecto

const getCacheKey = (url, config) => {
    const token = localStorage.getItem('token') || '';
    return `${token}||${url}?${JSON.stringify(config?.params || {})}`;
};

// Decorador para api.get con caching
const originalGet = api.get;
api.get = async (url, config = {}) => {
    const key = getCacheKey(url, config);
    const now = Date.now();

    // Si existe en cache y no ha expirado
    if (cache.has(key)) {
        const { timestamp, data } = cache.get(key);
        if (now - timestamp < CACHE_TTL) {
            // Retornamos una promesa resuelta con la estructura de axios
            console.log(`[CACHE] Hit: ${url}`);
            return Promise.resolve({ data, status: 200, statusText: 'OK', headers: {}, config, request: {} });
        }
    }

    // Si no, hacemos la petición real
    try {
        const response = await originalGet(url, config);
        // Guardamos solo la data para ahorrar memoria
        cache.set(key, { timestamp: now, data: response.data });
        return response;
    } catch (error) {
        throw error;
    }
};

// Invalidar cache en mutaciones (POST, PUT, DELETE)
export const clearCache = () => {
    if (cache.size > 0) {
        console.log('[CACHE] Cleared manually');
        cache.clear();
    }
};

const invalidateCache = () => {
    if (cache.size > 0) {
        console.log('[CACHE] Invalidated');
        cache.clear();
    }
};

const originalPost = api.post;
api.post = async (url, data, config) => { invalidateCache(); return originalPost(url, data, config); };

const originalPut = api.put;
api.put = async (url, data, config) => { invalidateCache(); return originalPut(url, data, config); };

const originalDelete = api.delete;
api.delete = async (url, config) => { invalidateCache(); return originalDelete(url, config); };


// ========== AUTH ==========
export const authAPI = {
    login: async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        return data;
    },

    registrarEstudiante: async (datos) => {
        const { data } = await api.post('/auth/registro', datos);
        return data;
    },

    getPerfil: async () => {
        const { data } = await api.get('/auth/perfil');
        return data;
    },

    actualizarPerfil: async (datos) => {
        const { data } = await api.put('/auth/perfil', datos);
        return data;
    },

    cambiarPassword: async (password_actual, nueva_password) => {
        const { data } = await api.put('/auth/cambiar-password', { password_actual, nueva_password });
        return data;
    }
};

// ========== ADMIN ==========
export const adminAPI = {
    getDashboard: async () => {
        const { data } = await api.get('/admin/dashboard');
        return data;
    },

    // Universidades
    getUniversidades: async () => {
        const { data } = await api.get('/admin/universidades');
        return data;
    },

    crearUniversidad: async (nombre) => {
        const { data } = await api.post('/admin/universidades', { nombre });
        return data;
    },

    actualizarUniversidad: async (id, nombre, activa, nombreOriginal) => {
        const payload = { activa };
        // Solo enviar el nombre si ha cambiado para evitar bug en backend ($ne vs Op.ne)
        if (nombre && nombre !== nombreOriginal) {
            payload.nombre = nombre;
        }
        const { data } = await api.put(`/admin/universidades/${id}`, payload);
        return data;
    },

    toggleUniversidad: async (id) => {
        const { data } = await api.put(`/admin/universidades/${id}/toggle`);
        return data;
    },

    // Periodos
    getPeriodos: async () => {
        const { data } = await api.get('/admin/periodos');
        return data;
    },

    crearPeriodo: async (periodo) => {
        const { data } = await api.post('/admin/periodos', periodo);
        return data;
    },

    actualizarPeriodo: async (id, periodo) => {
        const { data } = await api.put(`/admin/periodos/${id}`, periodo);
        return data;
    },

    togglePeriodo: async (id) => {
        const { data } = await api.put(`/admin/periodos/${id}/toggle`);
        return data;
    },

    // Estudiantes
    getEstudiantes: async (params = {}) => {
        const { data } = await api.get('/admin/estudiantes', { params });
        return data;
    },

    getEstudiante: async (id) => {
        const { data } = await api.get(`/admin/estudiantes/${id}`);
        return data;
    },

    crearEstudiante: async (estudiante) => {
        const { data } = await api.post('/admin/estudiantes', estudiante);
        return data;
    },

    actualizarEstudiante: async (id, estudiante) => {
        const { data } = await api.put(`/admin/estudiantes/${id}`, estudiante);
        return data;
    },

    matricularMasivo: async (periodoId, universidadId) => {
        const { data } = await api.post(`/admin/periodos/${periodoId}/matricula-masiva`, { universidad_id: universidadId });
        return data;
    },

    toggleEstudiante: async (id) => {
        const { data } = await api.put(`/admin/estudiantes/${id}/toggle`);
        return data;
    },

    reestablecerPassword: async (id, nueva_password) => {
        const { data } = await api.put(`/admin/estudiantes/${id}/reestablecer-password`, { nueva_password });
        return data;
    },

    // Auditoría
    getAuditoria: async (params = {}) => {
        const { data } = await api.get('/admin/auditoria', { params });
        return data;
    },

    cambiarPassword: async (password_actual, nueva_password) => {
        const { data } = await api.put('/admin/cambiar-password', {
            passwordActual: password_actual,
            passwordNuevo: nueva_password
        });
        return data;
    },

    registrarAuditoria: async (accion, detalles) => {
        try {
            await api.post('/admin/auditoria/log', { accion, detalles });
        } catch (e) {
            // No propagar error de auditoría
            console.error('Error enviando auditoría:', e);
        }
    }
};

// ========== ESTUDIANTE ==========
export const estudianteAPI = {
    getDashboard: async (params = {}) => {
        const { data } = await api.get('/estudiante/dashboard', { params });
        return data;
    },

    getPerfil: async () => {
        const { data } = await api.get('/estudiante/perfil');
        return data;
    },

    actualizarPerfil: async (datos) => {
        const { data } = await api.put('/estudiante/perfil', datos);
        return data;
    },

    cambiarPassword: async (passwordActual, passwordNuevo, config = {}) => {
        const { data } = await api.put('/estudiante/cambiar-password', {
            passwordActual,
            passwordNuevo
        }, config);
        return data;
    },

    getMisPeriodos: async () => {
        const { data } = await api.get('/estudiante/periodos');
        return data;
    },

    getRegistros: async () => {
        const { data } = await api.get('/estudiante/registros');
        return data;
    },

    getRegistrosPeriodo: async (periodoId, params = {}) => {
        const { data } = await api.get(`/estudiante/periodos/${periodoId}/registros`, { params });
        return data;
    },

    registrarHoras: async (registro) => {
        const { data } = await api.post('/estudiante/registrar-horas', registro);
        return data;
    },

    actualizarRegistro: async (id, registro) => {
        const { data } = await api.put(`/estudiante/registros/${id}`, registro);
        return data;
    },

    eliminarRegistro: async (id) => {
        const { data } = await api.delete(`/estudiante/registros/${id}`);
        return data;
    },

    registrarAuditoria: async (accion, detalles) => {
        try {
            await api.post('/estudiante/auditoria/log', { accion, detalles });
        } catch (e) {
            console.error('Error enviando auditoría:', e);
        }
    }
};

export default api;