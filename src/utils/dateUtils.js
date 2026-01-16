/**
 * Utilidades para manejo de fechas en Zona Horaria de Ecuador (UTC-5)
 * Se asegura que las fechas se visualicen y envíen consistentemente.
 */

// Obtiene la fecha actual en formato YYYY-MM-DD ajustada a Ecuador
export const getEcuadorDateISO = () => {
    // Ecuador es UTC-5
    const now = new Date();
    // Ajustamos manualmente si es necesario, pero para inputs type="date"
    // lo más seguro es trabajar con la zona horaria locale
    const options = { timeZone: 'America/Guayaquil', year: 'numeric', month: '2-digit', day: '2-digit' };
    const formatter = new Intl.DateTimeFormat('en-CA', options); // en-CA da formato YYYY-MM-DD
    return formatter.format(now);
};

// Formatea una fecha (string o Date) para visualización (DD/MM/YYYY)
// Asume que la fecha '2023-10-27' que viene del backend es CORRECTA y no debe sufrir timezone shifts
export const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';

    // Si viene como "2023-10-27T00:00:00.000Z", cortamos la parte de tiempo para evitar conversión
    // Si viene como "2023-10-27", lo usamos directo.
    const cleanDate = dateString.toString().split('T')[0];
    const [year, month, day] = cleanDate.split('-');

    // Retornamos formato local latino
    return `${day}/${month}/${year}`;
};

// Convierte una fecha a string largo para visualización, ej: "Viernes, 27 de octubre de 2023"
export const formatDateLong = (dateString) => {
    if (!dateString) return '';
    const cleanDate = dateString.toString().split('T')[0];
    const [year, month, day] = cleanDate.split('-').map(Number);

    // Creamos la fecha tratando los componentes como locales (fijos)
    const date = new Date(year, month - 1, day);

    return date.toLocaleDateString('es-EC', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};
