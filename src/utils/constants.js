// ==================== src/utils/constants.js ====================
export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    ADMIN: '/admin',
    ADMIN_DASHBOARD: '/admin/dashboard',
    ADMIN_UNIVERSIDADES: '/admin/universidades',
    ADMIN_PERIODOS: '/admin/periodos',
    ADMIN_ESTUDIANTES: '/admin/estudiantes',
    ESTUDIANTE: '/estudiante',
    ESTUDIANTE_DASHBOARD: '/estudiante/dashboard',
    ESTUDIANTE_REGISTROS: '/estudiante/registros'
};

export const ROLES = {
    ADMIN: 'administrador',
    ESTUDIANTE: 'estudiante'
};

export const MESSAGES = {
    LOGIN_SUCCESS: 'Inicio de sesión exitoso',
    LOGIN_ERROR: 'Error al iniciar sesión',
    LOGOUT_SUCCESS: 'Sesión cerrada exitosamente',
    CREATE_SUCCESS: 'Creado exitosamente',
    UPDATE_SUCCESS: 'Actualizado exitosamente',
    DELETE_SUCCESS: 'Eliminado exitosamente',
    ERROR: 'Ocurrió un error',
    LOADING: 'Cargando...'
};