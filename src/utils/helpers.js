// ==================== src/utils/helpers.js ====================
export const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateFormat('es-EC', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
};

export const formatDateShort = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateFormat('es-EC', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(date);
};

export const formatTime = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateFormat('es-EC', {
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
};

export const calculateProgress = (current, total) => {
    if (!total || total === 0) return 0;
    return Math.min((current / total) * 100, 100);
};

export const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'text-green-600 bg-green-100';
    if (percentage >= 75) return 'text-blue-600 bg-blue-100';
    if (percentage >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
};

export const getProgressBarColor = (percentage) => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
};

export const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

export const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

export const validatePassword = (password) => {
    return password.length >= 6;
};

export const handleApiError = (error) => {
    if (error.response) {
        return error.response.data.error || error.response.data.message || 'Error en el servidor';
    } else if (error.request) {
        return 'No se pudo conectar con el servidor';
    } else {
        return error.message || 'Error desconocido';
    }
};