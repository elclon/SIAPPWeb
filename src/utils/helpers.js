/**
 * =============================================================================
 * FUNCIONES UTILITARIAS Y DE FORMATEO DE FECHAS (SIAPP)
 * =============================================================================
 */

/**
 * Formatea una fecha en formato corto estándar peruano (DD/MM/YYYY)
 * @param {Date|string} fecha 
 * @returns {string} Fecha en formato DD/MM/YYYY
 */
export const formatFechaCorta = (fecha) => {
    if (!fecha) return '';
    const d = fecha instanceof Date ? fecha : new Date(fecha);
    if (isNaN(d.getTime())) return '';
    
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    
    return `${day}/${month}/${year}`;
};

/**
 * Formatea una fecha de manera inteligente y legible (ej: "Hoy 14:30", "Hace 2 días", "21/09/2026")
 * @param {Date|string} fecha
 * @returns {string}
 */
export const formatFecha = (fecha) => {
    if (!fecha) return 'Sin información';
    const d = fecha instanceof Date ? fecha : new Date(fecha);
    if (isNaN(d.getTime())) return 'Sin información';
    
    const now = new Date();
    
    // Mismo día
    if (d.toDateString() === now.toDateString()) {
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `Hoy ${hours}:${minutes}`;
    }
    
    // Ayer
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) {
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `Ayer ${hours}:${minutes}`;
    }
    
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    
    return `${day}/${month}/${year}`;
};

/**
 * Normaliza una fecha a formato ISO (YYYY-MM-DD)
 * @param {Date|string} fecha 
 * @returns {string}
 */
export const formatFechaISO = (fecha) => {
    if (!fecha) return '';
    const d = fecha instanceof Date ? fecha : new Date(fecha);
    if (isNaN(d.getTime())) return '';
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
};

/**
 * Normaliza una fecha y hora a formato ISO (YYYY-MM-DDTHH:mm:ss)
 * @param {Date|string} fecha 
 * @returns {string}
 */
export const formatFechaHoraISO = (fecha) => {
    if (!fecha) return '';
    const d = fecha instanceof Date ? fecha : new Date(fecha);
    if (isNaN(d.getTime())) return '';
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

/**
 * Parsea una cadena o timestamp a objeto Date local
 * @param {string|Date} fechaStr 
 * @returns {Date|null}
 */
export const parseFechaLocal = (fechaStr) => {
    if (!fechaStr) return null;
    if (fechaStr instanceof Date) return fechaStr;
    const d = new Date(fechaStr);
    return isNaN(d.getTime()) ? null : d;
};
