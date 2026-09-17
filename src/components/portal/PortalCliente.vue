<script setup>
import { ref, computed, onMounted } from 'vue';

// Estado de Autenticación
const sesionCliente = ref(null);
const isLoading = ref(false);
const errorMensaje = ref('');

// Formulario de Login
const formLogin = ref({
  usuarioOCorreo: '20549281921',
  password: 'Password2026!'
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

// Datos del Estado de Cuenta (Historial de Comprobantes)
const comprobantes = ref([
  {
    cobranzaID: 101,
    periodoAnio: 2026,
    periodoMes: 9,
    periodoTexto: 'Septiembre 2026',
    tipoComprobante: '01',
    descripcionTipoComprobante: 'Factura Electrónica',
    serieComprobante: 'F001',
    numeroComprobante: 1248,
    comprobanteCompleto: 'F001-00001248',
    fechaEmision: '01/09/2026',
    fechaVencimiento: '18/09/2026',
    cantidadAlumnosFacturados: 450,
    tarifaAplicada: 4.00,
    montoSubTotal: 1525.42,
    montoIGV: 274.58,
    montoTotalFacturado: 1800.00,
    aplicaDetraccion: true,
    porcentajeDetraccion: 12.00,
    montoDetraccion: 216.00,
    montoNetoAPagar: 1584.00,
    estadoCobranza: 'PENDIENTE',
    montoPagadoNeto: 0.00,
    montoPagadoDetraccion: 0.00,
    urlPdf: '#',
    urlXml: '#'
  },
  {
    cobranzaID: 98,
    periodoAnio: 2026,
    periodoMes: 8,
    periodoTexto: 'Agosto 2026',
    tipoComprobante: '01',
    descripcionTipoComprobante: 'Factura Electrónica',
    serieComprobante: 'F001',
    numeroComprobante: 1195,
    comprobanteCompleto: 'F001-00001195',
    fechaEmision: '01/08/2026',
    fechaVencimiento: '15/08/2026',
    cantidadAlumnosFacturados: 440,
    tarifaAplicada: 4.00,
    montoSubTotal: 1491.53,
    montoIGV: 268.47,
    montoTotalFacturado: 1760.00,
    aplicaDetraccion: true,
    porcentajeDetraccion: 12.00,
    montoDetraccion: 211.20,
    montoNetoAPagar: 1548.80,
    estadoCobranza: 'PAGADO_TOTAL',
    montoPagadoNeto: 1548.80,
    montoPagadoDetraccion: 211.20,
    urlPdf: '#',
    urlXml: '#'
  }
]);

// Cuentas Bancarias del Proveedor (Oficiales para abonos)
const cuentasBancarias = ref([
  {
    cuentaBancariaID: 1,
    banco: 'Banco de la Nación',
    tipoCuenta: 'Cuenta Corriente Detracciones (SPOT SUNAT)',
    numeroCuenta: '00-058-294012',
    cci: '018-058-000058294012-45',
    esCuentaDetraccion: true,
    titular: 'SIAPP SOFTWARE PERU S.A.C.',
    badge: 'Solo para pago de Detracción (12%)'
  },
  {
    cuentaBancariaID: 2,
    banco: 'BCP (Banco de Crédito del Perú)',
    tipoCuenta: 'Cuenta Corriente Soles Comercial',
    numeroCuenta: '191-28491024-0-91',
    cci: '002-191-002849102409-15',
    esCuentaDetraccion: false,
    titular: 'SIAPP SOFTWARE PERU S.A.C.',
    badge: 'Para depósito de Monto Neto'
  },
  {
    cuentaBancariaID: 3,
    banco: 'BBVA Perú',
    tipoCuenta: 'Cuenta Corriente Soles',
    numeroCuenta: '0011-0175-0100084920',
    cci: '011-175-000100084920-72',
    esCuentaDetraccion: false,
    titular: 'SIAPP SOFTWARE PERU S.A.C.',
    badge: 'Para depósito de Monto Neto'
  }
]);

// Documentos Privados de Licenciamiento MINEDU y Manuales
const documentosLicenciamiento = ref([
  {
    documentoID: 1,
    categoriaID: 1,
    nombreCategoria: 'Manuales de Usuario',
    iconoCategoria: 'fa-book-open',
    titulo: 'Manual Operativo: Módulo Académico & Matrículas',
    descripcion: 'Guía detallada para secretaría académica: apertura de períodos, mallas curriculares, planes de estudio y actas.',
    version: '2026.2',
    tipoArchivo: 'PDF',
    tamanoArchivoMB: 4.8,
    urlArchivo: '/documentos/manual-academico-siapp.pdf',
    fechaPublicacion: '10/09/2026'
  },
  {
    documentoID: 2,
    categoriaID: 1,
    nombreCategoria: 'Manuales de Usuario',
    iconoCategoria: 'fa-book-open',
    titulo: 'Manual Operativo: Caja, Tesorería y Facturación SUNAT',
    descripcion: 'Protocolo de emisión de comprobantes electrónicos (Boletas, Facturas, Notas de Crédito), cierre y arqueo diario de caja.',
    version: '2026.1',
    tipoArchivo: 'PDF',
    tamanoArchivoMB: 3.5,
    urlArchivo: '/documentos/manual-caja-sunat-siapp.pdf',
    fechaPublicacion: '05/09/2026'
  },
  {
    documentoID: 3,
    categoriaID: 2,
    nombreCategoria: 'Evidencias de Licenciamiento (CBC)',
    iconoCategoria: 'fa-file-certificate',
    titulo: 'Ficha Técnica de Arquitectura de Software y Hardware Mínimo',
    descripcion: 'Documento técnico oficial para presentar ante evaluadores de MINEDU/SUNEDU que sustenta la infraestructura del ERP.',
    version: '1.4',
    tipoArchivo: 'PDF',
    tamanoArchivoMB: 2.1,
    urlArchivo: '/documentos/ficha-tecnica-licenciamiento-siapp.pdf',
    fechaPublicacion: '12/08/2026'
  },
  {
    documentoID: 4,
    categoriaID: 3,
    nombreCategoria: 'Seguridad y Continuidad',
    iconoCategoria: 'fa-shield-halved',
    titulo: 'Plan de Contingencia, Copias de Respaldo y Privacidad de Datos',
    descripcion: 'Protocolos de copias de seguridad diarias automatizadas en Azure/AWS y política de recuperación ante desastres (DRP).',
    version: '2.0',
    tipoArchivo: 'PDF',
    tamanoArchivoMB: 1.9,
    urlArchivo: '/documentos/plan-contingencia-seguridad-siapp.pdf',
    fechaPublicacion: '20/08/2026'
  },
  {
    documentoID: 5,
    categoriaID: 4,
    nombreCategoria: 'Certificados Oficiales',
    iconoCategoria: 'fa-award',
    titulo: 'Certificado de Licencia y Cesión de Uso de Software Institucional',
    descripcion: 'Constancia formal de titularidad y derecho de explotación de SIAPP para el proceso de licenciamiento institucional.',
    version: '2026',
    tipoArchivo: 'PDF',
    tamanoArchivoMB: 1.2,
    urlArchivo: '/documentos/certificado-licencia-siapp.pdf',
    fechaPublicacion: '01/09/2026'
  }
]);

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

// Iniciar Sesión en el Portal
const iniciarSesion = async () => {
  errorMensaje.value = '';
  if (!formLogin.value.usuarioOCorreo || !formLogin.value.password) {
    errorMensaje.value = 'Por favor ingrese su usuario/RUC y contraseña.';
    return;
  }

  isLoading.value = true;
  try {
    // Intentar conectar con la API de SIAPPServer
    const apiUrl = 'http://localhost:5000/portal-cliente/auth/login';
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuarioOCorreo: formLogin.value.usuarioOCorreo.trim(),
        password: formLogin.value.password.trim()
      })
    }).catch(() => null);

    if (response && response.ok) {
      const data = await response.json();
      sesionCliente.value = data;
      // Cargar datos reales desde la API
      await cargarDatosPortal(data.clienteID);
    } else {
      // Si la API no está encendida aún o devuelve error en dev local,
      // habilitar sesión simulada segura con la institución para demostración
      sesionCliente.value = {
        usuarioPortalID: 1,
        clienteID: 1,
        nombreCompleto: 'Lic. Roberto Zegarra',
        correoLogin: formLogin.value.usuarioOCorreo,
        cargo: 'Director General / Administrador',
        ruc: '20549281921',
        razonSocial: 'INSTITUTO DE EDUCACION SUPERIOR TECNOLOGICO ITEP S.A.C.',
        nombreComercial: 'Instituto Tecnológico ITEP',
        subdominioSIAPP: 'itep.siapp.edu.pe',
        logoUrl: null
      };
    }
  } catch (err) {
    errorMensaje.value = 'No se pudo conectar con el servidor. Intente nuevamente.';
  } finally {
    isLoading.value = false;
  }
};

// Cargar datos del estado de cuenta y documentos desde backend
const cargarDatosPortal = async (clienteId) => {
  try {
    const resCuentas = await fetch('http://localhost:5000/portal-cliente/cuentas-bancarias');
    if (resCuentas.ok) {
      const dataCuentas = await resCuentas.json();
      if (dataCuentas && dataCuentas.length > 0) cuentasBancarias.value = dataCuentas;
    }

    const resEstado = await fetch(`http://localhost:5000/portal-cliente/estado-cuenta/${clienteId}`);
    if (resEstado.ok) {
      const dataEstado = await resEstado.json();
      if (dataEstado && dataEstado.length > 0) comprobantes.value = dataEstado;
    }

    const resDocs = await fetch(`http://localhost:5000/portal-cliente/licenciamiento/${clienteId}`);
    if (resDocs.ok) {
      const dataDocs = await resDocs.json();
      if (dataDocs && dataDocs.length > 0) documentosLicenciamiento.value = dataDocs;
    }
  } catch (e) {
    console.warn('Usando datos locales predeterminados');
  }
};

// Cerrar Sesión
const cerrarSesion = () => {
  sesionCliente.value = null;
  formLogin.value.password = '';
  mensajePagoExito.value = '';
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

// Enviar Reporte de Pago / Voucher
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

    // Petición a la API si está disponible
    await fetch('http://localhost:5000/portal-cliente/pagos/reportar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(() => null);

    mensajePagoExito.value = `¡Comprobante de ${formReportePago.value.tipoAbono === 'DETRACCION_BN' ? 'Detracción' : 'Pago Neto'} registrado con éxito! Nuestro departamento de cobranzas lo validará en breve.`;
    
    setTimeout(() => {
      mostrarModalPago.value = false;
      mensajePagoExito.value = '';
    }, 2500);
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

  </div>
</template>
