// ==================== src/services/api.js ====================
import axios from 'axios';

const API_URL = 'https://controlp-backend.vercel.app/api/v1';

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

    // Periodos
    getPeriodos: async () => {
        const { data } = await api.get('/admin/periodos');
        return data;
    },

    crearPeriodo: async (periodo) => {
        const { data } = await api.post('/admin/periodos', periodo);
        return data;
    },

    // Estudiantes
    getEstudiantes: async () => {
        const { data } = await api.get('/admin/estudiantes');
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

    getRegistros: async () => {
        const { data } = await api.get('/estudiante/registros');
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