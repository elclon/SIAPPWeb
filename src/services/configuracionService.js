import apiClient from '@/api/axiosConfig';

export const DEFAULT_WHATSAPP_CONFIG = {
  numero: '51958344877',
  numeroFormateado: '+51 958 344 877',
  mensajeGeneral: 'Hola, quisiera recibir información sobre SIAPP.',
  mensajeSoporte: 'Hola, necesito soporte técnico de SIAPP',
  mensajeVentas: 'Hola, quisiera recibir información y asesoría sobre SIAPP.',
  urlWhatsAppGeneral: 'https://wa.me/51958344877?text=Hola,%20quisiera%20recibir%20informaci%C3%B3n%20sobre%20SIAPP.',
  urlWhatsAppSoporte: 'https://wa.me/51958344877?text=Hola,%20necesito%20soporte%20t%C3%A9cnico%20de%20SIAPP',
  urlWhatsAppVentas: 'https://wa.me/51958344877?text=Hola,%20quisiera%20recibir%20informaci%C3%B3n%20y%20asesor%C3%ADa%20sobre%20SIAPP.'
};

let cachedConfig = null;

/**
 * Obtiene la configuración de WhatsApp desde el backend (o caché / valor predeterminado)
 */
export async function obtenerConfiguracionWhatsApp() {
  if (cachedConfig) {
    return cachedConfig;
  }

  try {
    const res = await apiClient.get('/sistema/configuracion-whatsapp');
    if (res.data) {
      cachedConfig = {
        numero: res.data.numero || DEFAULT_WHATSAPP_CONFIG.numero,
        numeroFormateado: res.data.numeroFormateado || DEFAULT_WHATSAPP_CONFIG.numeroFormateado,
        mensajeGeneral: res.data.mensajeGeneral || DEFAULT_WHATSAPP_CONFIG.mensajeGeneral,
        mensajeSoporte: res.data.mensajeSoporte || DEFAULT_WHATSAPP_CONFIG.mensajeSoporte,
        mensajeVentas: res.data.mensajeVentas || DEFAULT_WHATSAPP_CONFIG.mensajeVentas,
        urlWhatsAppGeneral: res.data.urlWhatsAppGeneral || DEFAULT_WHATSAPP_CONFIG.urlWhatsAppGeneral,
        urlWhatsAppSoporte: res.data.urlWhatsAppSoporte || DEFAULT_WHATSAPP_CONFIG.urlWhatsAppSoporte,
        urlWhatsAppVentas: res.data.urlWhatsAppVentas || DEFAULT_WHATSAPP_CONFIG.urlWhatsAppVentas
      };
      return cachedConfig;
    }
  } catch (error) {
    // Si el backend aún no está iniciado o en fase de build estático, usar defaults
    console.warn('[SIAPPWeb] No se pudo conectar al endpoint de configuración de WhatsApp, usando valores por defecto.');
  }

  return DEFAULT_WHATSAPP_CONFIG;
}
