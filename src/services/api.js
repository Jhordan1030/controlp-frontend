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
    }
};

// ========== ESTUDIANTE ==========
export const estudianteAPI = {
    getDashboard: async () => {
        const { data } = await api.get('/estudiante/dashboard');
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

    cambiarPassword: async (passwordActual, passwordNuevo) => {
        const { data } = await api.put('/estudiante/cambiar-password', {
            passwordActual,
            passwordNuevo
        });
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

    getRegistrosPeriodo: async (periodoId) => {
        const { data } = await api.get(`/estudiante/periodos/${periodoId}/registros`);
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
    }
};

export default api;