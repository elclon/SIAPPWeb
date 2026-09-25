<script setup>
import './admin/devextreme-init';
import { ref, computed, onMounted } from 'vue';
import apiClient from '@/api/axiosConfig';
import { getErrorMessage } from '@/services/errorHandler';
import { showSuccess, showError } from '@/services/notification';

// Estado de Autenticación
const sesionCliente = ref(null);
const isLoading = ref(false);
const errorMensaje = ref('');

// Formulario de Login
const formLogin = ref({
  usuarioOCorreo: '',
  password: ''
});

// Flujo de Recuperación y Reseteo de Contraseña
const mostrarModalRecuperar = ref(false);
const isEnviandoRecuperacion = ref(false);
const mensajeRecuperarExito = ref('');
const errorRecuperar = ref('');
const formRecuperar = ref({
  usuarioOCorreo: ''
});

// Modal para Crear Nueva Contraseña Segura (con Token)
const mostrarModalNuevaPassword = ref(false);
const tokenRecuperacion = ref('');
const datosToken = ref({
  nombreCompleto: '',
  correoLogin: '',
  institucion: ''
});
const formNuevaPassword = ref({
  password: '',
  confirmPassword: ''
});
const mostrarPassword = ref(false);
const isGuardandoPassword = ref(false);
const errorNuevaPassword = ref('');
const mensajeNuevaPasswordExito = ref('');

// Reglas y Checklist de Contraseña Segura
const tieneMinimo8 = computed(() => formNuevaPassword.value.password.length >= 8);
const tieneMayuscula = computed(() => /[A-Z]/.test(formNuevaPassword.value.password));
const tieneNumero = computed(() => /[0-9]/.test(formNuevaPassword.value.password));
const coincidenPasswords = computed(() => 
  formNuevaPassword.value.password.length > 0 && 
  formNuevaPassword.value.password === formNuevaPassword.value.confirmPassword
);
const esPasswordValida = computed(() => 
  tieneMinimo8.value && tieneMayuscula.value && tieneNumero.value && coincidenPasswords.value
);

const abrirModalRecuperar = () => {
  formRecuperar.value.usuarioOCorreo = formLogin.value.usuarioOCorreo || '';
  mensajeRecuperarExito.value = '';
  errorRecuperar.value = '';
  mostrarModalRecuperar.value = true;
};

const enviarSolicitudRecuperacion = async () => {
  errorRecuperar.value = '';
  mensajeRecuperarExito.value = '';

  if (!formRecuperar.value.usuarioOCorreo.trim()) {
    errorRecuperar.value = 'Por favor ingrese el RUC o correo de su institución.';
    return;
  }

  isEnviandoRecuperacion.value = true;
  try {
    await apiClient.post('/portal-cliente/auth/solicitar-recuperacion', {
      usuarioOCorreo: formRecuperar.value.usuarioOCorreo.trim()
    });

    mensajeRecuperarExito.value = 'Hemos enviado un enlace seguro a su correo institucional registrado. Por favor revise su bandeja de entrada (y la carpeta de spam o correo no deseado).';
  } catch (err) {
    errorRecuperar.value = getErrorMessage(err, 'No se pudo procesar la solicitud de recuperación.');
  } finally {
    isEnviandoRecuperacion.value = false;
  }
};

const validarTokenUrl = async (token) => {
  try {
    const res = await apiClient.get('/portal-cliente/auth/validar-token', { params: { token } });
    if (res.data && res.data.esValido) {
      datosToken.value = res.data;
      tokenRecuperacion.value = token;
      formNuevaPassword.value.password = '';
      formNuevaPassword.value.confirmPassword = '';
      errorNuevaPassword.value = '';
      mensajeNuevaPasswordExito.value = '';
      mostrarModalNuevaPassword.value = true;
    } else {
      errorMensaje.value = 'El enlace de recuperación ha expirado o no es válido. Por favor, solicita uno nuevo.';
      limpiarTokenUrl();
    }
  } catch (err) {
    errorMensaje.value = getErrorMessage(err, 'Enlace de recuperación inválido.');
    limpiarTokenUrl();
  }
};

const guardarNuevaPassword = async () => {
  errorNuevaPassword.value = '';
  mensajeNuevaPasswordExito.value = '';

  if (!esPasswordValida.value) {
    errorNuevaPassword.value = 'La contraseña no cumple con todos los requisitos de seguridad o las contraseñas no coinciden.';
    return;
  }

  isGuardandoPassword.value = true;
  try {
    await apiClient.post('/portal-cliente/auth/establecer-password', {
      token: tokenRecuperacion.value,
      nuevaPassword: formNuevaPassword.value.password,
      confirmarPassword: formNuevaPassword.value.confirmPassword
    });

    mensajeNuevaPasswordExito.value = '¡Contraseña actualizada exitosamente! Ahora puede iniciar sesión con su nueva clave.';
    formLogin.value.usuarioOCorreo = datosToken.value.correoLogin || '';
    formLogin.value.password = '';
    
    limpiarTokenUrl();
    showSuccess('Contraseña actualizada con éxito');
  } catch (err) {
    errorNuevaPassword.value = getErrorMessage(err, 'No se pudo actualizar la contraseña.');
  } finally {
    isGuardandoPassword.value = false;
  }
};

const limpiarTokenUrl = () => {
  if (typeof window !== 'undefined' && window.history) {
    window.history.replaceState({}, document.title, window.location.pathname);
  }
};

onMounted(() => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      validarTokenUrl(token);
    } else {
      const sesionGuardada = sessionStorage.getItem('siapp_cliente_sesion') || localStorage.getItem('siapp_cliente_sesion');
      if (sesionGuardada) {
        try {
          sesionCliente.value = JSON.parse(sesionGuardada);
          if (sesionCliente.value?.clienteID) {
            cargarDatosPortal(sesionCliente.value.clienteID);
          }
        } catch (e) {
          sesionCliente.value = null;
        }
      }
    }
  }
});

// Pestaña Activa ('facturacion' | 'licenciamiento')
const pestanaActiva = ref('facturacion');

// Filtro de categoría en Licenciamiento
const categoriaFiltro = ref('TODOS');
const busquedaManuales = ref('');

// Modal de Registro de Pago / Voucher
const mostrarModalPago = ref(false);
const cobranzaSeleccionada = ref(null);
const isEnviandoPago = ref(false);
const mensajePagoExito = ref('');
const formReportePago = ref({
  tipoAbono: 'NETO_COMERCIAL', // 'NETO_COMERCIAL' | 'DETRACCION_BN'
  cuentaBancariaDestinoID: null,
  fechaOperacion: new Date().toISOString().substring(0, 10),
  numeroOperacion: '',
  montoPagado: 0,
  observaciones: ''
});

// Datos del Estado de Cuenta (Historial de Comprobantes reales)
const comprobantes = ref([]);

// Cuentas Bancarias del Proveedor (Oficiales para abonos)
const cuentasBancarias = ref([]);

// Documentos Privados de Licenciamiento MINEDU y Manuales
const documentosLicenciamiento = ref([]);

// Comprobante activo para visualización detallada (el más reciente por defecto)
const comprobanteActivo = computed(() => {
  return comprobantes.value.length > 0 ? comprobantes.value[0] : null;
});

// Filtrado de documentos de licenciamiento
const documentosFiltrados = computed(() => {
  let docs = documentosLicenciamiento.value;

  if (categoriaFiltro.value !== 'TODOS') {
    docs = docs.filter(d => d.nombreCategoria === categoriaFiltro.value);
  }

  if (busquedaManuales.value.trim()) {
    const q = busquedaManuales.value.toLowerCase().trim();
    docs = docs.filter(d => 
      d.titulo.toLowerCase().includes(q) || 
      (d.descripcion && d.descripcion.toLowerCase().includes(q))
    );
  }

  return docs;
});

// Iniciar Sesión en el Portal utilizando apiClient
const iniciarSesion = async () => {
  errorMensaje.value = '';
  if (!formLogin.value.usuarioOCorreo || !formLogin.value.password) {
    errorMensaje.value = 'Por favor ingrese su usuario/RUC y contraseña.';
    return;
  }

  isLoading.value = true;
  try {
    const response = await apiClient.post('/portal-cliente/auth/login', {
      usuarioOCorreo: formLogin.value.usuarioOCorreo.trim(),
      password: formLogin.value.password.trim()
    });

    if (response.data) {
      sesionCliente.value = response.data;
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('siapp_cliente_sesion', JSON.stringify(response.data));
        if (response.data.token) {
          sessionStorage.setItem('token', response.data.token);
        }
      }
      await cargarDatosPortal(response.data.clienteID);
    }
  } catch (err) {
    errorMensaje.value = getErrorMessage(err, 'Usuario o contraseña incorrectos, o la cuenta se encuentra inactiva.');
  } finally {
    isLoading.value = false;
  }
};

// Cargar datos del estado de cuenta y documentos desde backend con apiClient
const cargarDatosPortal = async (clienteId) => {
  try {
    const [resCuentas, resEstado, resDocs] = await Promise.allSettled([
      apiClient.get('/portal-cliente/cuentas-bancarias'),
      apiClient.get(`/portal-cliente/estado-cuenta/${clienteId}`),
      apiClient.get(`/portal-cliente/licenciamiento/${clienteId}`)
    ]);

    if (resCuentas.status === 'fulfilled') {
      cuentasBancarias.value = Array.isArray(resCuentas.value.data) ? resCuentas.value.data : [];
    }
    if (resEstado.status === 'fulfilled') {
      comprobantes.value = Array.isArray(resEstado.value.data) ? resEstado.value.data : [];
    }
    if (resDocs.status === 'fulfilled') {
      documentosLicenciamiento.value = Array.isArray(resDocs.value.data) ? resDocs.value.data : [];
    }
  } catch (e) {
    comprobantes.value = [];
    documentosLicenciamiento.value = [];
  }
};

// Cerrar Sesión
const cerrarSesion = () => {
  sesionCliente.value = null;
  formLogin.value.password = '';
  mensajePagoExito.value = '';
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('siapp_cliente_sesion');
    sessionStorage.removeItem('token');
    localStorage.removeItem('siapp_cliente_sesion');
    localStorage.removeItem('token');
  }
};

// Abrir Modal para Reportar Pago
const abrirModalReportarPago = (cobranza, tipo = 'NETO_COMERCIAL') => {
  cobranzaSeleccionada.value = cobranza;
  formReportePago.value.tipoAbono = tipo;
  formReportePago.value.montoPagado = tipo === 'DETRACCION_BN' ? cobranza.montoDetraccion : cobranza.montoNetoAPagar;
  formReportePago.value.numeroOperacion = '';
  formReportePago.value.observaciones = '';
  mensajePagoExito.value = '';
  mostrarModalPago.value = true;
};

// Enviar Reporte de Pago / Voucher con apiClient
const enviarReportePago = async () => {
  if (!formReportePago.value.numeroOperacion) {
    alert('Ingrese el número de operación bancaria.');
    return;
  }

  isEnviandoPago.value = true;
  try {
    const payload = {
      cobranzaID: cobranzaSeleccionada.value.cobranzaID,
      tipoAbono: formReportePago.value.tipoAbono,
      cuentaBancariaDestinoID: formReportePago.value.cuentaBancariaDestinoID,
      fechaOperacion: formReportePago.value.fechaOperacion,
      numeroOperacion: formReportePago.value.numeroOperacion,
      montoPagado: parseFloat(formReportePago.value.montoPagado),
      urlComprobanteVoucher: 'https://siapp.edu.pe/vouchers/voucher_temp.pdf',
      observacionesCliente: formReportePago.value.observaciones
    };

    await apiClient.post('/portal-cliente/pagos/reportar', payload);

    mensajePagoExito.value = `¡Comprobante de ${formReportePago.value.tipoAbono === 'DETRACCION_BN' ? 'Detracción' : 'Pago Neto'} registrado con éxito! Nuestro departamento de cobranzas lo validará en breve.`;
    
    setTimeout(() => {
      mostrarModalPago.value = false;
      mensajePagoExito.value = '';
    }, 2500);
  } catch (err) {
    alert(getErrorMessage(err, 'Error al registrar el reporte de pago.'));
  } finally {
    isEnviandoPago.value = false;
  }
};

// Copiar al portapapeles
const copiarTexto = (texto, nombreCampo) => {
  navigator.clipboard.writeText(texto);
  alert(`Copiado al portapapeles: ${nombreCampo} (${texto})`);
};
</script>

<template>
  <div class="space-y-8">

    <!-- ================================================================================= -->
    <!-- ESTADO 1: FORMULARIO DE ACCESO PRIVADO AL PORTAL (LOGIN)                         -->
    <!-- ================================================================================= -->
    <div
      v-if="!sesionCliente"
      class="max-w-md mx-auto bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-slate-200/60 dark:shadow-none border border-slate-200 dark:border-slate-800 p-6 sm:p-8 transition-all"
    >
      <div class="text-center space-y-3 mb-6">
        <div class="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
          <i class="fa-light fa-lock-keyhole text-2xl"></i>
        </div>
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white font-heading">
          Portal de Clientes
        </h2>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Acceso privado para instituciones educativas. Consulta tu facturación, reporta tus pagos y descarga manuales oficiales para licenciamiento MINEDU.
        </p>
      </div>

      <!-- Alerta de Error -->
      <div
        v-if="errorMensaje"
        class="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2"
      >
        <i class="fa-light fa-circle-exclamation text-base"></i>
        <span>{{ errorMensaje }}</span>
      </div>

      <form @submit.prevent="iniciarSesion" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            RUC de la Institución o Correo Registrado:
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <i class="fa-light fa-building-columns text-sm"></i>
            </div>
            <input
              v-model="formLogin.usuarioOCorreo"
              type="text"
              required
              placeholder="Ej: 20549281921 o admin@instituto.edu.pe"
              class="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Contraseña de Acceso:
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <i class="fa-light fa-key text-sm"></i>
            </div>
            <input
              v-model="formLogin.password"
              type="password"
              required
              placeholder="••••••••"
              class="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
            />
          </div>
        </div>

        <div class="flex items-center justify-end -mt-1">
          <button
            type="button"
            @click="abrirModalRecuperar"
            class="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors cursor-pointer"
          >
            ¿Olvidaste tu contraseña? Recuperar contraseña
          </button>
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <i v-if="isLoading" class="fa-solid fa-spinner fa-spin"></i>
          <i v-else class="fa-light fa-arrow-right-to-bracket"></i>
          <span>{{ isLoading ? 'Autenticando...' : 'Ingresar al Portal Seguro' }}</span>
        </button>

        <div class="pt-3 text-center border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
          ¿No cuentas con tus credenciales de acceso? Comunícate con soporte SIAPP al <strong>soporte@siapp.edu.pe</strong>.
        </div>
      </form>
    </div>

    <!-- ================================================================================= -->
    <!-- ESTADO 2: DASHBOARD PRIVADO DEL CLIENTE                                           -->
    <!-- ================================================================================= -->
    <div v-else class="space-y-6">

      <!-- CABECERA INSTITUCIONAL Y BIENVENIDA -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 text-2xl font-bold shrink-0">
            <i class="fa-light fa-graduation-cap"></i>
          </div>
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h1 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-heading">
                {{ sesionCliente.nombreComercial }}
              </h1>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Licencia Activa
              </span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              RUC: <strong class="font-mono text-slate-700 dark:text-slate-300">{{ sesionCliente.ruc }}</strong> &bull; Responsable: {{ sesionCliente.nombreCompleto }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 self-end md:self-center">
          <a
            :href="'https://' + (sesionCliente.subdominioSIAPP || 'siapp.edu.pe')"
            target="_blank"
            class="px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <i class="fa-light fa-arrow-up-right-from-square"></i>
            <span>Ir a mi SIAPP</span>
          </a>
          <button
            type="button"
            @click="cerrarSesion"
            class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <i class="fa-light fa-power-off text-red-500"></i>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      <!-- PESTAÑAS DE NAVEGACIÓN (TABS) -->
      <div class="flex border-b border-slate-200 dark:border-slate-800 gap-4 text-sm font-bold">
        <button
          type="button"
          @click="pestanaActiva = 'facturacion'"
          :class="pestanaActiva === 'facturacion' ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 pb-3' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 pb-3'"
          class="flex items-center gap-2 transition-colors"
        >
          <i class="fa-light fa-file-invoice-dollar"></i>
          <span>Facturación, Detracciones & Pagos</span>
        </button>
        <button
          type="button"
          @click="pestanaActiva = 'licenciamiento'"
          :class="pestanaActiva === 'licenciamiento' ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 pb-3' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 pb-3'"
          class="flex items-center gap-2 transition-colors"
        >
          <i class="fa-light fa-file-certificate"></i>
          <span>Manuales & Evidencias Licenciamiento MINEDU</span>
        </button>
      </div>

      <!-- ============================================================================= -->
      <!-- CONTENIDO PESTAÑA 1: FACTURACIÓN, DETRACCIONES Y REPORTAR PAGO               -->
      <!-- ============================================================================= -->
      <div v-if="pestanaActiva === 'facturacion'" class="space-y-6">

        <!-- TARJETA DESTACADA: COMPROBANTE VIGENTE Y DESGLOSE DETRACCIÓN -->
        <div v-if="comprobanteActivo" class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-1 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-xs font-bold uppercase tracking-wider">
                  {{ comprobanteActivo.descripcionTipoComprobante }}
                </span>
                <span class="text-sm font-mono font-bold text-slate-800 dark:text-slate-200">
                  {{ comprobanteActivo.comprobanteCompleto }}
                </span>
                <span
                  :class="comprobanteActivo.estadoCobranza === 'PAGADO_TOTAL' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'"
                  class="px-2 py-0.5 rounded text-[11px] font-bold"
                >
                  {{ comprobanteActivo.estadoCobranza === 'PAGADO_TOTAL' ? 'Pagado Total' : 'Pendiente de Pago' }}
                </span>
              </div>
              <h2 class="text-xl font-bold text-slate-900 dark:text-white mt-1">
                Servicio de Software SIAPP - Período {{ comprobanteActivo.periodoTexto }}
              </h2>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Emisión: {{ comprobanteActivo.fechaEmision }} &bull; Vencimiento: <strong class="text-red-600 dark:text-red-400">{{ comprobanteActivo.fechaVencimiento }}</strong>
                <span v-if="comprobanteActivo.cantidadAlumnosFacturados"> &bull; Base: {{ comprobanteActivo.cantidadAlumnosFacturados }} Alumnos</span>
              </p>
            </div>

            <!-- Descargas de Comprobante PDF / XML -->
            <div class="flex items-center gap-2">
              <a
                :href="comprobanteActivo.urlPdf"
                class="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <i class="fa-light fa-file-pdf text-red-500 text-sm"></i>
                <span>Descargar PDF</span>
              </a>
              <a
                :href="comprobanteActivo.urlXml"
                class="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <i class="fa-light fa-file-code text-blue-500 text-sm"></i>
                <span>Descargar XML</span>
              </a>
            </div>
          </div>

          <!-- DESGLOSE MATEMÁTICO TRANSPARENTE DE DETRACCIÓN SUNAT -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
            
            <!-- 1. MONTO TOTAL FACTURADO -->
            <div class="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60">
              <span class="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
                Total Facturado (con IGV)
              </span>
              <span class="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1 block">
                S/ {{ comprobanteActivo.montoTotalFacturado.toFixed(2) }}
              </span>
              <span class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                Monto nominal del comprobante
              </span>
            </div>

            <!-- 2. DETRACCIÓN BANCO DE LA NACIÓN -->
            <div class="bg-amber-50/70 dark:bg-amber-950/30 rounded-2xl p-4 border border-amber-200 dark:border-amber-800/60 relative">
              <span class="text-xs text-amber-900 dark:text-amber-300 font-bold flex items-center justify-between">
                <span>Detracción SPOT ({{ comprobanteActivo.porcentajeDetraccion }}%)</span>
                <span class="text-[10px] bg-amber-200 dark:bg-amber-900 px-1.5 py-0.5 rounded font-mono">Banco de la Nación</span>
              </span>
              <span class="text-2xl font-black text-amber-900 dark:text-amber-300 font-mono mt-1 block">
                S/ {{ comprobanteActivo.montoDetraccion.toFixed(2) }}
              </span>
              <div class="flex items-center justify-between mt-2 pt-2 border-t border-amber-200/60 dark:border-amber-900/60">
                <span class="text-[11px] text-amber-800 dark:text-amber-400">
                  {{ comprobanteActivo.montoPagadoDetraccion > 0 ? '✓ Detracción Abonada' : 'Pendiente en Banco de la Nación' }}
                </span>
                <button
                  type="button"
                  @click="abrirModalReportarPago(comprobanteActivo, 'DETRACCION_BN')"
                  class="text-[11px] font-bold text-amber-700 dark:text-amber-300 hover:underline"
                >
                  Subir Constancia BN
                </button>
              </div>
            </div>

            <!-- 3. MONTO NETO A CUENTA COMERCIAL -->
            <div class="bg-blue-50/70 dark:bg-blue-950/30 rounded-2xl p-4 border border-blue-200 dark:border-blue-800/60">
              <span class="text-xs text-blue-900 dark:text-blue-300 font-bold flex items-center justify-between">
                <span>Neto a Transferir (Comercial)</span>
                <span class="text-[10px] bg-blue-200 dark:bg-blue-900 px-1.5 py-0.5 rounded font-mono">BCP / BBVA</span>
              </span>
              <span class="text-2xl font-black text-blue-900 dark:text-blue-300 font-mono mt-1 block">
                S/ {{ comprobanteActivo.montoNetoAPagar.toFixed(2) }}
              </span>
              <div class="flex items-center justify-between mt-2 pt-2 border-t border-blue-200/60 dark:border-blue-900/60">
                <span class="text-[11px] text-blue-800 dark:text-blue-400">
                  {{ comprobanteActivo.montoPagadoNeto > 0 ? '✓ Monto Neto Abonado' : 'Pendiente Transferencia' }}
                </span>
                <button
                  type="button"
                  @click="abrirModalReportarPago(comprobanteActivo, 'NETO_COMERCIAL')"
                  class="text-[11px] font-bold text-blue-700 dark:text-blue-300 hover:underline"
                >
                  Subir Voucher Neto
                </button>
              </div>
            </div>

          </div>
        </div>

        <!-- CUENTAS BANCARIAS OFICIALES DEL PROVEEDOR -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <i class="fa-light fa-landmark text-blue-600"></i>
              <span>Cuentas Bancarias Oficiales para Depósito</span>
            </h3>
            <span class="text-xs text-slate-500 dark:text-slate-400">
              Titular: <strong>SIAPP SOFTWARE PERU S.A.C.</strong> &bull; RUC: <strong>20608912345</strong>
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              v-for="cuenta in cuentasBancarias"
              :key="cuenta.cuentaBancariaID"
              :class="cuenta.esCuentaDetraccion ? 'border-amber-300 dark:border-amber-800/80 bg-amber-50/40 dark:bg-amber-950/20' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'"
              class="rounded-2xl p-4 border shadow-xs space-y-3"
            >
              <div class="flex items-center justify-between">
                <span class="font-bold text-sm text-slate-900 dark:text-white">
                  {{ cuenta.banco }}
                </span>
                <span
                  :class="cuenta.esCuentaDetraccion ? 'bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200' : 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'"
                  class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                >
                  {{ cuenta.esCuentaDetraccion ? 'DETRACCIONES' : 'COMERCIAL' }}
                </span>
              </div>

              <div>
                <span class="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">N° de Cuenta:</span>
                <div class="flex items-center justify-between bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg mt-0.5">
                  <span class="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">{{ cuenta.numeroCuenta }}</span>
                  <button
                    type="button"
                    @click="copiarTexto(cuenta.numeroCuenta, 'N° de Cuenta ' + cuenta.banco)"
                    class="text-blue-600 hover:text-blue-800 text-xs font-semibold"
                  >
                    Copiar
                  </button>
                </div>
              </div>

              <div v-if="cuenta.cci">
                <span class="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Código Interbancario (CCI):</span>
                <div class="flex items-center justify-between bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg mt-0.5">
                  <span class="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">{{ cuenta.cci }}</span>
                  <button
                    type="button"
                    @click="copiarTexto(cuenta.cci, 'CCI ' + cuenta.banco)"
                    class="text-blue-600 hover:text-blue-800 text-xs font-semibold"
                  >
                    Copiar
                  </button>
                </div>
              </div>

              <p class="text-[10px] text-slate-500 dark:text-slate-400 italic">
                {{ cuenta.badge }}
              </p>
            </div>
          </div>
        </div>

        <!-- HISTORIAL DE COBRANZAS PASADAS -->
        <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <i class="fa-light fa-clock-rotate-left text-blue-600"></i>
            <span>Historial de Facturación y Comprobantes</span>
          </h3>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th class="p-3">Período</th>
                  <th class="p-3">Comprobante</th>
                  <th class="p-3">Emisión</th>
                  <th class="p-3">Total Facturado</th>
                  <th class="p-3">Detracción BN (12%)</th>
                  <th class="p-3">Neto Comercial</th>
                  <th class="p-3">Estado</th>
                  <th class="p-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                <tr v-for="item in comprobantes" :key="item.cobranzaID" class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td class="p-3 font-semibold">{{ item.periodoTexto }}</td>
                  <td class="p-3 font-mono font-bold text-blue-600 dark:text-blue-400">{{ item.comprobanteCompleto }}</td>
                  <td class="p-3">{{ item.fechaEmision }}</td>
                  <td class="p-3 font-mono font-bold">S/ {{ item.montoTotalFacturado.toFixed(2) }}</td>
                  <td class="p-3 font-mono text-amber-600 dark:text-amber-400">S/ {{ item.montoDetraccion.toFixed(2) }}</td>
                  <td class="p-3 font-mono text-emerald-600 dark:text-emerald-400 font-bold">S/ {{ item.montoNetoAPagar.toFixed(2) }}</td>
                  <td class="p-3">
                    <span
                      :class="item.estadoCobranza === 'PAGADO_TOTAL' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'"
                      class="px-2 py-0.5 rounded text-[10px] font-bold"
                    >
                      {{ item.estadoCobranza === 'PAGADO_TOTAL' ? 'Pagado Total' : 'Pendiente' }}
                    </span>
                  </td>
                  <td class="p-3 text-right">
                    <button
                      type="button"
                      @click="abrirModalReportarPago(item)"
                      class="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 hover:bg-blue-100 text-[11px] font-bold"
                    >
                      Reportar Pago
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <!-- ============================================================================= -->
      <!-- CONTENIDO PESTAÑA 2: MANUALES & EVIDENCIAS DE LICENCIAMIENTO MINEDU          -->
      <!-- ============================================================================= -->
      <div v-else-if="pestanaActiva === 'licenciamiento'" class="space-y-6">

        <!-- BANNER INFORMATIVO PARA INSTITUTOS (CBC MINEDU) -->
        <div class="bg-gradient-to-r from-blue-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div class="max-w-2xl space-y-2 relative z-10">
            <span class="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold inline-block">
              Condiciones Básicas de Calidad (CBC) - MINEDU / SUNEDU
            </span>
            <h2 class="text-2xl sm:text-3xl font-bold font-heading">
              Centro de Recursos y Evidencias para Licenciamiento
            </h2>
            <p class="text-xs sm:text-sm text-blue-100/80 leading-relaxed">
              Descarga la carpeta técnica de evidencias que sustenta el cumplimiento de gestión académica, seguridad de bases de datos, planes de contingencia y manuales de usuario de tu institución.
            </p>
          </div>
          <i class="fa-light fa-file-certificate text-9xl text-white/5 absolute -right-4 -bottom-6 pointer-events-none"></i>
        </div>

        <!-- FILTROS Y BÚSQUEDA DE MANUALES -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div class="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            <button
              type="button"
              @click="categoriaFiltro = 'TODOS'"
              :class="categoriaFiltro === 'TODOS' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'"
              class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0"
            >
              Todos ({{ documentosLicenciamiento.length }})
            </button>
            <button
              type="button"
              @click="categoriaFiltro = 'Manuales de Usuario'"
              :class="categoriaFiltro === 'Manuales de Usuario' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'"
              class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0"
            >
              Manuales de Usuario
            </button>
            <button
              type="button"
              @click="categoriaFiltro = 'Evidencias de Licenciamiento (CBC)'"
              :class="categoriaFiltro === 'Evidencias de Licenciamiento (CBC)' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'"
              class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0"
            >
              Fichas Técnicas MINEDU
            </button>
            <button
              type="button"
              @click="categoriaFiltro = 'Seguridad y Continuidad'"
              :class="categoriaFiltro === 'Seguridad y Continuidad' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'"
              class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0"
            >
              Seguridad & Backups
            </button>
          </div>

          <div class="relative w-full sm:w-64">
            <input
              v-model="busquedaManuales"
              type="text"
              placeholder="Buscar documento..."
              class="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <i class="fa-light fa-magnifying-glass text-slate-400 absolute left-2.5 top-2.5 text-xs"></i>
          </div>
        </div>

        <!-- GRID DE DOCUMENTOS PRIVADOS -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="doc in documentosFiltrados"
            :key="doc.documentoID"
            class="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all shadow-xs flex flex-col justify-between gap-4"
          >
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                  <i :class="['fa-light', doc.iconoCategoria]"></i>
                  <span>{{ doc.nombreCategoria }}</span>
                </span>
                <span class="text-[10px] font-mono text-slate-400">
                  v{{ doc.version }} &bull; {{ doc.tamanoArchivoMB }} MB
                </span>
              </div>
              <h3 class="text-sm font-bold text-slate-900 dark:text-white">
                {{ doc.titulo }}
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {{ doc.descripcion }}
              </p>
            </div>

            <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span class="text-[10px] text-slate-400">
                Actualizado: {{ doc.fechaPublicacion }}
              </span>
              <a
                :href="doc.urlArchivo"
                target="_blank"
                class="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
              >
                <i class="fa-light fa-arrow-down-to-bracket"></i>
                <span>Descargar PDF</span>
              </a>
            </div>
          </div>
        </div>

      </div>

    </div>

    <!-- ============================================================================= -->
    <!-- MODAL PARA REPORTAR PAGO / SUBIR VOUCHER                                      -->
    <!-- ============================================================================= -->
    <div
      v-if="mostrarModalPago"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in"
    >
      <div class="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">
              Reportar Pago de Facturación
            </h3>
            <span class="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Comprobante: {{ cobranzaSeleccionada?.comprobanteCompleto }}
            </span>
          </div>
          <button
            type="button"
            @click="mostrarModalPago = false"
            class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
          >
            <i class="fa-light fa-xmark"></i>
          </button>
        </div>

        <div v-if="mensajePagoExito" class="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <i class="fa-light fa-circle-check text-lg"></i>
          <span>{{ mensajePagoExito }}</span>
        </div>

        <form v-else @submit.prevent="enviarReportePago" class="space-y-4">
          
          <!-- Tipo de Abono -->
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Tipo de Pago que estás reportando:
            </label>
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                @click="formReportePago.tipoAbono = 'NETO_COMERCIAL'; formReportePago.montoPagado = cobranzaSeleccionada.montoNetoAPagar"
                :class="formReportePago.tipoAbono === 'NETO_COMERCIAL' ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'"
                class="p-2.5 rounded-xl border text-xs font-bold text-left"
              >
                <span class="block">1. Neto Comercial</span>
                <span class="text-[10px] font-mono block text-slate-500">S/ {{ cobranzaSeleccionada?.montoNetoAPagar.toFixed(2) }}</span>
              </button>

              <button
                type="button"
                @click="formReportePago.tipoAbono = 'DETRACCION_BN'; formReportePago.montoPagado = cobranzaSeleccionada.montoDetraccion"
                :class="formReportePago.tipoAbono === 'DETRACCION_BN' ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'"
                class="p-2.5 rounded-xl border text-xs font-bold text-left"
              >
                <span class="block">2. Detracción (12%)</span>
                <span class="text-[10px] font-mono block text-amber-600">S/ {{ cobranzaSeleccionada?.montoDetraccion.toFixed(2) }} (Banco de la Nación)</span>
              </button>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Fecha de Operación:
              </label>
              <input
                v-model="formReportePago.fechaOperacion"
                type="date"
                required
                class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Monto Abonado (S/):
              </label>
              <input
                v-model="formReportePago.montoPagado"
                type="number"
                step="0.01"
                required
                class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              N° de Operación / Constancia SUNAT:
            </label>
            <input
              v-model="formReportePago.numeroOperacion"
              type="text"
              required
              placeholder="Ej: 0481920 o 2026-09-00129"
              class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Adjuntar Foto del Voucher / Constancia de Detracción:
            </label>
            <input
              type="file"
              class="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Observaciones adicionales (Opcional):
            </label>
            <textarea
              v-model="formReportePago.observaciones"
              rows="2"
              placeholder="Ej: Pagado desde cuenta BCP de gerencia..."
              class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
            ></textarea>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              @click="mostrarModalPago = false"
              class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="isEnviandoPago"
              class="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5"
            >
              <i v-if="isEnviandoPago" class="fa-solid fa-spinner fa-spin"></i>
              <span>{{ isEnviandoPago ? 'Registrando...' : 'Confirmar Reporte de Pago' }}</span>
            </button>
          </div>

        </form>
      </div>
    </div>

    <!-- ================================================================================= -->
    <!-- MODAL 1: RECUPERAR CONTRASEÑA (SOLICITAR ENLACE AL CORREO)                        -->
    <!-- ================================================================================= -->
    <div
      v-if="mostrarModalRecuperar"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
    >
      <div class="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-bold">
              <i class="fa-light fa-key-skeleton"></i>
            </div>
            <div>
              <h3 class="font-bold text-slate-900 dark:text-white text-sm">Recuperar Contraseña</h3>
              <p class="text-[11px] text-slate-400">Te enviaremos un enlace a tu correo institucional</p>
            </div>
          </div>
          <button
            type="button"
            @click="mostrarModalRecuperar = false"
            class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div v-if="mensajeRecuperarExito" class="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs space-y-3">
          <div class="flex items-center gap-2 font-bold">
            <i class="fa-solid fa-circle-check text-emerald-600 dark:text-emerald-400 text-sm"></i>
            <span>¡Enlace Enviado con Éxito!</span>
          </div>
          <p class="leading-relaxed">{{ mensajeRecuperarExito }}</p>
          <div class="pt-2 text-right">
            <button
              type="button"
              @click="mostrarModalRecuperar = false"
              class="px-4 py-1.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition-all cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>

        <form v-else @submit.prevent="enviarSolicitudRecuperacion" class="space-y-4">
          <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Ingresa el <strong>RUC de tu institución</strong> o tu <strong>correo electrónico registrado</strong> en el sistema. Generaremos un enlace de recuperación seguro para tu cuenta.
          </p>

          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              RUC o Correo Registrado:
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <i class="fa-light fa-envelope text-sm"></i>
              </div>
              <input
                v-model="formRecuperar.usuarioOCorreo"
                type="text"
                required
                placeholder="Ej: 20549281921 o director@instituto.edu.pe"
                class="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div v-if="errorRecuperar" class="p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 text-xs border border-rose-200 dark:border-rose-800 flex items-center gap-2">
            <i class="fa-solid fa-triangle-exclamation"></i>
            <span>{{ errorRecuperar }}</span>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              @click="mostrarModalRecuperar = false"
              class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="isEnviandoRecuperacion"
              class="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-2 disabled:opacity-60 transition-all cursor-pointer"
            >
              <i v-if="isEnviandoRecuperacion" class="fa-solid fa-spinner fa-spin"></i>
              <i v-else class="fa-light fa-paper-plane"></i>
              <span>{{ isEnviandoRecuperacion ? 'Enviando...' : 'Enviar Enlace de Recuperación' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ================================================================================= -->
    <!-- MODAL 2: ESTABLECER NUEVA CONTRASEÑA SEGURA (ACTIVACIÓN CON TOKEN)                -->
    <!-- ================================================================================= -->
    <div
      v-if="mostrarModalNuevaPassword"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in"
    >
      <div class="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-bold">
              <i class="fa-light fa-shield-check"></i>
            </div>
            <div>
              <h3 class="font-bold text-slate-900 dark:text-white text-sm">Nueva Contraseña Segura</h3>
              <p class="text-[11px] text-slate-400 truncate max-w-[240px]">{{ datosToken.institucion || 'Institución Educativa' }}</p>
            </div>
          </div>
          <button
            v-if="!mensajeNuevaPasswordExito"
            type="button"
            @click="mostrarModalNuevaPassword = false"
            class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div v-if="mensajeNuevaPasswordExito" class="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs space-y-3 text-center">
          <div class="w-12 h-12 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-800/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl">
            <i class="fa-solid fa-check"></i>
          </div>
          <h4 class="font-bold text-sm">¡Contraseña Actualizada!</h4>
          <p class="leading-relaxed">{{ mensajeNuevaPasswordExito }}</p>
          <button
            type="button"
            @click="mostrarModalNuevaPassword = false"
            class="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            Ingresar con mi Nueva Contraseña
          </button>
        </div>

        <form v-else @submit.prevent="guardarNuevaPassword" class="space-y-4">
          <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs">
            <span class="block text-slate-500 dark:text-slate-400 text-[10px]">Restableciendo acceso para:</span>
            <span class="font-bold text-slate-800 dark:text-slate-200 text-sm block">{{ datosToken.nombreCompleto }}</span>
            <span class="text-[11px] text-indigo-600 dark:text-indigo-400 font-mono truncate block">{{ datosToken.correoLogin }}</span>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nueva Contraseña:
            </label>
            <div class="relative">
              <input
                v-model="formNuevaPassword.password"
                :type="mostrarPassword ? 'text' : 'password'"
                required
                placeholder="Ingresa tu nueva contraseña"
                class="w-full pl-3 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                type="button"
                @click="mostrarPassword = !mostrarPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <i :class="mostrarPassword ? 'fa-light fa-eye-slash' : 'fa-light fa-eye'" class="text-xs"></i>
              </button>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Confirmar Nueva Contraseña:
            </label>
            <div class="relative">
              <input
                v-model="formNuevaPassword.confirmPassword"
                :type="mostrarPassword ? 'text' : 'password'"
                required
                placeholder="Repite tu nueva contraseña"
                class="w-full pl-3 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <!-- Checklist de Requisitos de Contraseña Segura -->
          <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1.5 text-[11px]">
            <span class="block font-bold text-slate-600 dark:text-slate-400 mb-1">Requisitos de seguridad:</span>
            
            <div class="flex items-center gap-2" :class="tieneMinimo8 ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400'">
              <i :class="tieneMinimo8 ? 'fa-solid fa-circle-check text-emerald-500' : 'fa-regular fa-circle'"></i>
              <span>Mínimo 8 caracteres</span>
            </div>

            <div class="flex items-center gap-2" :class="tieneMayuscula ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400'">
              <i :class="tieneMayuscula ? 'fa-solid fa-circle-check text-emerald-500' : 'fa-regular fa-circle'"></i>
              <span>Al menos una letra mayúscula</span>
            </div>

            <div class="flex items-center gap-2" :class="tieneNumero ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400'">
              <i :class="tieneNumero ? 'fa-solid fa-circle-check text-emerald-500' : 'fa-regular fa-circle'"></i>
              <span>Al menos un número</span>
            </div>

            <div class="flex items-center gap-2" :class="coincidenPasswords ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400'">
              <i :class="coincidenPasswords ? 'fa-solid fa-circle-check text-emerald-500' : 'fa-regular fa-circle'"></i>
              <span>Las contraseñas coinciden</span>
            </div>
          </div>

          <div v-if="errorNuevaPassword" class="p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 text-xs border border-rose-200 dark:border-rose-800 flex items-center gap-2">
            <i class="fa-solid fa-triangle-exclamation"></i>
            <span>{{ errorNuevaPassword }}</span>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="submit"
              :disabled="!esPasswordValida || isGuardandoPassword"
              class="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
            >
              <i v-if="isGuardandoPassword" class="fa-solid fa-spinner fa-spin"></i>
              <i v-else class="fa-light fa-lock-check"></i>
              <span>{{ isGuardandoPassword ? 'Guardando Contraseña...' : 'Guardar y Activar Nueva Contraseña' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>
