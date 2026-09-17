/**
 * Extrae mensaje de error del servidor para mostrar al usuario
 * Compatible con formato ValidationProblem de ASP.NET Core y Axios
 * @param {Object} error - Error de axios
 * @param {string} defaultMessage - Mensaje por defecto si no se puede extraer uno específico
 * @returns {string} Mensaje de error para mostrar
 */
export const getErrorMessage = (error, defaultMessage = 'Error en el servidor') => {
  if (error.serverMessage) {
    return error.serverMessage;
  }
  
  if (error.response?.data) {
    const data = error.response.data;
    
    // Formato ValidationProblem de Minimal API
    if (data.errors) {
      const validationMessages = [];
      for (const [field, messages] of Object.entries(data.errors)) {
        if (Array.isArray(messages)) {
          validationMessages.push(...messages);
        }
      }
      if (validationMessages.length > 0) {
        return validationMessages.join(' | ');
      }
    }
    
    if (data.message) return data.message;
    if (data.error) return data.error;
    if (data.title) return data.title;
    if (typeof data === 'string') return data;
  }
  
  return error.message || defaultMessage;
};

export default {
  getErrorMessage
};
