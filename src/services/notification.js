import notify from 'devextreme/cjs/ui/notify.js';

/**
 * Configuración global para el stack de notificaciones DevExtreme
 */
const globalStackConfig = {
  position: { 
    my: 'top center', 
    at: 'top center',
    offset: '0 20' 
  },
  direction: 'down-push',
  stack: {
    key: 'globalNotifications',
    spacing: 10
  },
  width: 'auto',
  maxWidth: 450,
  minWidth: 300
};

/**
 * Muestra una notificación de éxito
 * @param {string} message - Mensaje a mostrar
 * @param {number} duration - Duración en ms (por defecto 3000)
 */
export function showSuccess(message, duration = 3000) {
  notify({
    ...globalStackConfig,
    message
  }, 'success', duration);
}

/**
 * Muestra una notificación de error
 * @param {string} message - Mensaje a mostrar
 * @param {number} duration - Duración en ms (por defecto 3000)
 */
export function showError(message, duration = 3000) {
  notify({
    ...globalStackConfig,
    message
  }, 'error', duration);
}

/**
 * Muestra una notificación de advertencia
 * @param {string} message - Mensaje a mostrar
 * @param {number} duration - Duración en ms (por defecto 3000)
 */
export function showWarning(message, duration = 3000) {
  notify({
    ...globalStackConfig,
    message
  }, 'warning', duration);
}

/**
 * Muestra una notificación de información
 * @param {string} message - Mensaje a mostrar
 * @param {number} duration - Duración en ms (por defecto 3000)
 */
export function showInfo(message, duration = 3000) {
  notify({
    ...globalStackConfig,
    message
  }, 'info', duration);
}

export default {
  showSuccess,
  showError,
  showWarning,
  showInfo
};
