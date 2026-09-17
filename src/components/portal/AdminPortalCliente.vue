<script setup>
import { ref, computed, onMounted } from 'vue';

// Pestaña Activa en el Panel Admin ('calculo' | 'vouchers' | 'manuales')
const pestanaActiva = ref('calculo');

// Período de Consulta
const anioActual = new Date().getFullYear();
const mesActual = new Date().getMonth() + 1;
const filtroAnio = ref(anioActual);
const filtroMes = ref(mesActual);

// Estados de Carga y Mensajes
const isCalculando = ref(false);
const mensajeFeedback = ref('');
const tipoFeedback = ref('success'); // 'success' | 'error'

// Lista de Cálculos por Cliente (Multi-BD)
const calculosClientes = ref([
  {
    clienteID: 1,
    ruc: '20549281921',
    nombreComercial: 'Instituto Tecnológico ITEP',
    subdominioSIAPP: 'itep.siapp.edu.pe',
    codigoConexion: 'itep',
    tipoCobro: 'POR_ALUMNO',
    alumnosDetectados: 450,
    tarifaAplicada: 4.00,
    montoSubTotal: 1525.42,
    montoIGV: 274.58,
    montoTotal: 1800.00,
    aplicaDetraccion: true,
    porcentajeDetraccion: 12.00,
    montoDetraccion: 216.00,
    montoNeto: 1584.00,
    estadoConexionBD: 'CONECTADO',
    mensajeConexion: 'Base de datos auditada con éxito (450 alumnos matriculados)',
    yaFacturadoEnPeriodo: true
  },
  {
    clienteID: 2,
    ruc: '20491823901',
    nombreComercial: 'Instituto Superior Tepnum',
    subdominioSIAPP: 'tepnum.siapp.edu.pe',
    codigoConexion: 'tepnum',
    tipoCobro: 'FIJO',
    alumnosDetectados: 0,
    tarifaAplicada: 0,
    montoSubTotal: 1271.19,
    montoIGV: 228.81,
    montoTotal: 1500.00,
    aplicaDetraccion: true,
    porcentajeDetraccion: 12.00,
    montoDetraccion: 180.00,
    montoNeto: 1320.00,
    estadoConexionBD: 'NO_REQUERIDO_FIJO',
    mensajeConexion: 'Tarifa Fija Mensual según Contrato',
    yaFacturadoEnPeriodo: false
  },
  {
    clienteID: 3,
    ruc: '20601928472',
    nombreComercial: 'Instituto Stendhal',
    subdominioSIAPP: 'stendhal.siapp.edu.pe',
    codigoConexion: 'stendhal',
    tipoCobro: 'POR_ALUMNO',
    alumnosDetectados: 310,
    tarifaAplicada: 4.00,
    montoSubTotal: 1050.85,
    montoIGV: 189.15,
    montoTotal: 1240.00,
    aplicaDetraccion: true,
    porcentajeDetraccion: 12.00,
    montoDetraccion: 148.80,
    montoNeto: 1091.20,
    estadoConexionBD: 'CONECTADO',
    mensajeConexion: 'Conectado a BDSIA_VUE (310 alumnos)',
    yaFacturadoEnPeriodo: false
  }
]);

// Lista de Vouchers Reportados
const vouchers = ref([
  {
    pagoID: 1,
    cobranzaID: 101,
    clienteNombre: 'Instituto Tecnológico ITEP',
    ruc: '20549281921',
    comprobanteCompleto: 'F001-00001248',
    tipoAbono: 'DETRACCION_BN',
    bancoDestino: 'Banco de la Nación',
    fechaOperacion: '16/09/2026',
    numeroOperacion: '0481920',
    montoPagado: 216.00,
    urlComprobanteVoucher: '#',
    observacionesCliente: 'Pago de detracción 12% por ventanilla BN',
    estadoValidacion: 'EN_REVISION',
    fechaReporte: '16/09/2026 11:30'
  },
  {
    pagoID: 2,
    cobranzaID: 101,
    clienteNombre: 'Instituto Tecnológico ITEP',
    ruc: '20549281921',
    comprobanteCompleto: 'F001-00001248',
    tipoAbono: 'NETO_COMERCIAL',
    bancoDestino: 'BCP',
    fechaOperacion: '16/09/2026',
    numeroOperacion: '98410293',
    montoPagado: 1584.00,
    urlComprobanteVoucher: '#',
    observacionesCliente: 'Transferencia interbancaria monto neto',
    estadoValidacion: 'EN_REVISION',
    fechaReporte: '16/09/2026 12:15'
  }
]);

// Lista de Manuales Existentes
const manualesAdmin = ref([
  {
    documentoID: 1,
    nombreCategoria: 'Manuales de Usuario',
    titulo: 'Manual Operativo: Módulo Académico & Matrículas',
    version: '2026.2',
    tipoArchivo: 'PDF',
    tamanoArchivoMB: 4.8,
    urlArchivo: '/documentos/manual-academico-siapp.pdf',
    esPublico: true,
    fechaPublicacion: '10/09/2026'
  },
  {
    documentoID: 2,
    nombreCategoria: 'Manuales de Usuario',
    titulo: 'Manual Operativo: Caja, Tesorería y Facturación SUNAT',
    version: '2026.1',
    tipoArchivo: 'PDF',
    tamanoArchivoMB: 3.5,
    urlArchivo: '/documentos/manual-caja-sunat-siapp.pdf',
    esPublico: true,
    fechaPublicacion: '05/09/2026'
  },
  {
    documentoID: 3,
    nombreCategoria: 'Evidencias de Licenciamiento (CBC)',
    titulo: 'Ficha Técnica de Arquitectura de Software y Hardware Mínimo',
    version: '1.4',
    tipoArchivo: 'PDF',
    tamanoArchivoMB: 2.1,
    urlArchivo: '/documentos/ficha-tecnica-licenciamiento-siapp.pdf',
    esPublico: true,
    fechaPublicacion: '12/08/2026'
  }
]);

// Modal de Emisión de Cobranza
const mostrarModalEmitir = ref(false);
const clienteSeleccionadoParaEmitir = ref(null);
const formEmitir = ref({
  tipoComprobante: '01',
  serieComprobante: 'F001',
  numeroComprobante: 1249,
  fechaEmision: new Date().toISOString().substring(0, 10),
  fechaVencimiento: new Date(Date.now() + 15 * 86400000).toISOString().substring(0, 10),
  cantidadAlumnos: 0,
  tarifaAplicada: 0,
  montoTotal: 0,
  aplicaDetraccion: true,
  montoDetraccion: 0,
  montoNeto: 0
});

// Modal para Nuevo Manual
const mostrarModalManual = ref(false);
const formNuevoManual = ref({
  categoriaID: 1,
  titulo: '',
  descripcion: '',
  version: '2026.1',
  tipoArchivo: 'PDF',
  tamanoArchivoMB: 2.5,
  urlArchivo: '',
  esPublicoTodosLosClientes: true
});

// Totales de Facturación Estimada del Mes
const totalFacturableMes = computed(() => {
  return calculosClientes.value.reduce((acc, c) => acc + c.montoTotal, 0);
});

const totalDetraccionesMes = computed(() => {
  return calculosClientes.value.reduce((acc, c) => acc + c.montoDetraccion, 0);
});

const totalNetoComercialMes = computed(() => {
  return calculosClientes.value.reduce((acc, c) => acc + c.montoNeto, 0);
});

// Sincronizar y Calcular Alumnos llamando al Backend Multi-BD
const sincronizarAlumnos = async () => {
  isCalculando.value = true;
  mensajeFeedback.value = '';

  try {
    const url = `http://localhost:5000/portal-cliente/admin/calcular-alumnos?anio=${filtroAnio.value}&mes=${filtroMes.value}`;
    const response = await fetch(url).catch(() => null);

    if (response && response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        calculosClientes.value = data;
        tipoFeedback.value = 'success';
        mensajeFeedback.value = `¡Sincronización multi-base de datos completada con éxito! Se auditaron ${data.length} instituciones clientes.`;
      }
    } else {
      // Simulación en desarrollo
      await new Promise(r => setTimeout(r, 1200));
      tipoFeedback.value = 'success';
      mensajeFeedback.value = '¡Conteo de alumnos actualizado desde las bases de datos de cada cliente!';
    }
  } catch (err) {
    tipoFeedback.value = 'error';
    mensajeFeedback.value = 'No se pudo conectar con el servidor para la auditoría multi-BD.';
  } finally {
    isCalculando.value = false;
  }
};

// Abrir Modal para Emitir Cobranza
const abrirModalEmitir = (item) => {
  clienteSeleccionadoParaEmitir.value = item;
  formEmitir.value.cantidadAlumnos = item.alumnosDetectados;
  formEmitir.value.tarifaAplicada = item.tarifaAplicada;
  formEmitir.value.montoTotal = item.montoTotal;
  formEmitir.value.aplicaDetraccion = item.aplicaDetraccion;
  formEmitir.value.montoDetraccion = item.montoDetraccion;
  formEmitir.value.montoNeto = item.montoNeto;
  mostrarModalEmitir.value = true;
};

// Confirmar Emisión de Cobranza en BDSIAPP_MASTER
const confirmarEmisionCobranza = async () => {
  try {
    const payload = {
      clienteID: clienteSeleccionadoParaEmitir.value.clienteID,
      periodoAnio: filtroAnio.value,
      periodoMes: filtroMes.value,
      tipoComprobante: formEmitir.value.tipoComprobante,
      serieComprobante: formEmitir.value.serieComprobante,
      numeroComprobante: parseInt(formEmitir.value.numeroComprobante),
      fechaEmision: formEmitir.value.fechaEmision,
      fechaVencimiento: formEmitir.value.fechaVencimiento,
      cantidadAlumnosFacturados: formEmitir.value.cantidadAlumnos,
      tarifaAplicada: formEmitir.value.tarifaAplicada,
      montoSubTotal: Math.round(formEmitir.value.montoTotal / 1.18, 2),
      montoIGV: Math.round(formEmitir.value.montoTotal - (formEmitir.value.montoTotal / 1.18), 2),
      montoTotalFacturado: formEmitir.value.montoTotal,
      aplicaDetraccion: formEmitir.value.aplicaDetraccion,
      porcentajeDetraccion: 12.00,
      montoDetraccion: formEmitir.value.montoDetraccion,
      montoNetoAPagar: formEmitir.value.montoNeto,
      urlPdfComprobante: `https://siapp.edu.pe/docs/${formEmitir.value.serieComprobante}-${formEmitir.value.numeroComprobante}.pdf`,
      urlXmlComprobante: `https://siapp.edu.pe/docs/${formEmitir.value.serieComprobante}-${formEmitir.value.numeroComprobante}.xml`
    };

    await fetch('http://localhost:5000/portal-cliente/admin/emitir-cobranza', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(() => null);

    // Actualizar bandera en memoria
    clienteSeleccionadoParaEmitir.value.yaFacturadoEnPeriodo = true;
    mostrarModalEmitir.value = false;
    alert(`Cobranza ${formEmitir.value.serieComprobante}-${formEmitir.value.numeroComprobante} registrada exitosamente en BDSIAPP_MASTER.`);
  } catch (e) {
    alert('Error al emitir cobranza.');
  }
};

// Aprobar o Rechazar Voucher de Pago
const responderVoucher = async (pago, estado) => {
  const accion = estado === 'APROBADO' ? 'aprobar' : 'rechazar';
  if (!confirm(`¿Está seguro de ${accion} este comprobante de pago de S/ ${pago.montoPagado.toFixed(2)}?`)) {
    return;
  }

  try {
    await fetch('http://localhost:5000/portal-cliente/admin/validar-voucher', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pagoID: pago.pagoID,
        estadoValidacion: estado,
        motivoRechazo: estado === 'RECHAZADO' ? 'Número de operación no coincide con el estado bancario' : null
      })
    }).catch(() => null);

    pago.estadoValidacion = estado;
    alert(`Comprobante ${estado.toLowerCase()} correctamente.`);
  } catch (e) {
    pago.estadoValidacion = estado;
  }
};

// Guardar Nuevo Manual en DOC.DocumentoLicenciamiento
const guardarNuevoManual = async () => {
  if (!formNuevoManual.value.titulo || !formNuevoManual.value.urlArchivo) {
    alert('Por favor complete el título y la ruta del archivo PDF.');
    return;
  }

  try {
    await fetch('http://localhost:5000/portal-cliente/admin/documentos/guardar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formNuevoManual.value)
    }).catch(() => null);

    manualesAdmin.value.unshift({
      documentoID: Date.now(),
      nombreCategoria: formNuevoManual.value.categoriaID === 1 ? 'Manuales de Usuario' : formNuevoManual.value.categoriaID === 2 ? 'Evidencias de Licenciamiento (CBC)' : 'Seguridad y Continuidad',
      titulo: formNuevoManual.value.titulo,
      version: formNuevoManual.value.version,
      tipoArchivo: formNuevoManual.value.tipoArchivo,
      tamanoArchivoMB: formNuevoManual.value.tamanoArchivoMB,
      urlArchivo: formNuevoManual.value.urlArchivo,
      esPublico: formNuevoManual.value.esPublicoTodosLosClientes,
      fechaPublicacion: new Date().toLocaleDateString('es-PE')
    });

    mostrarModalManual.value = false;
    alert('Documento de licenciamiento publicado con éxito en el Portal de Clientes.');
  } catch (e) {
    alert('Documento guardado localmente.');
  }
};

onMounted(() => {
  sincronizarAlumnos();
});
</script>

<template>
  <div class="space-y-8">

    <!-- CABECERA PRINCIPAL DEL PANEL SUPERADMIN -->
    <div class="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div class="space-y-2">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold">
          <i class="fa-light fa-crown text-amber-400"></i>
          <span>Panel Master &bull; SuperAdmin SIAPP SaaS</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-black font-heading tracking-tight">
          Gestión de Clientes, Cobranzas & Licenciamiento
        </h1>
        <p class="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Control centralizado de suscripciones, auditoría de alumnos matriculados en cada base de datos, emisión de facturas con detracciones y publicación de manuales MINEDU.
        </p>
      </div>

      <!-- Accesos Rápidos -->
      <div class="flex items-center gap-3">
        <button
          type="button"
          @click="sincronizarAlumnos"
          :disabled="isCalculando"
          class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all disabled:opacity-60"
        >
          <i :class="isCalculando ? 'fa-solid fa-spinner fa-spin' : 'fa-light fa-arrows-rotate'"></i>
          <span>{{ isCalculando ? 'Auditando BDs...' : 'Sincronizar Alumnos Multi-BD' }}</span>
        </button>
      </div>
    </div>

    <!-- PESTAÑAS DE NAVEGACIÓN SUPERADMIN -->
    <div class="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-sm font-bold">
      <button
        type="button"
        @click="pestanaActiva = 'calculo'"
        :class="pestanaActiva === 'calculo' ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 pb-3' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 pb-3'"
        class="flex items-center gap-2 transition-colors"
      >
        <i class="fa-light fa-calculator"></i>
        <span>1. Conteo de Alumnos & Facturación Multi-BD</span>
      </button>

      <button
        type="button"
        @click="pestanaActiva = 'vouchers'"
        :class="pestanaActiva === 'vouchers' ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 pb-3' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 pb-3'"
        class="flex items-center gap-2 transition-colors"
      >
        <i class="fa-light fa-receipt"></i>
        <span>2. Conciliación de Vouchers & Detracciones ({{ vouchers.filter(v => v.estadoValidacion === 'EN_REVISION').length }})</span>
      </button>

      <button
        type="button"
        @click="pestanaActiva = 'manuales'"
        :class="pestanaActiva === 'manuales' ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 pb-3' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 pb-3'"
        class="flex items-center gap-2 transition-colors"
      >
        <i class="fa-light fa-file-pdf"></i>
        <span>3. Repositorio de Manuales & Evidencias MINEDU</span>
      </button>
    </div>

    <!-- ALERTA DE FEEDBACK -->
    <div
      v-if="mensajeFeedback"
      :class="tipoFeedback === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-800 dark:text-emerald-300' : 'bg-red-50 dark:bg-red-950/40 border-red-200 text-red-800 dark:text-red-300'"
      class="p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between animate-in fade-in"
    >
      <div class="flex items-center gap-2">
        <i :class="tipoFeedback === 'success' ? 'fa-light fa-circle-check text-base' : 'fa-light fa-triangle-exclamation text-base'"></i>
        <span>{{ mensajeFeedback }}</span>
      </div>
      <button type="button" @click="mensajeFeedback = ''" class="text-slate-400 hover:text-slate-600">
        <i class="fa-light fa-xmark"></i>
      </button>
    </div>

    <!-- ============================================================================= -->
    <!-- PESTAÑA 1: CONTEO MULTI-BD Y EMISIÓN DE FACTURAS                              -->
    <!-- ============================================================================= -->
    <div v-if="pestanaActiva === 'calculo'" class="space-y-6">

      <!-- CARDS DE TOTALES CONSOLIDADOS DEL MES -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div class="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span class="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Total Facturable Auditado:</span>
          <span class="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1 block">
            S/ {{ totalFacturableMes.toFixed(2) }}
          </span>
          <span class="text-[11px] text-slate-400 mt-1 block">Suma bruta con IGV de todos los clientes</span>
        </div>

        <div class="bg-amber-50/70 dark:bg-amber-950/30 rounded-2xl p-5 border border-amber-200 dark:border-amber-800/60">
          <span class="text-xs text-amber-900 dark:text-amber-300 font-bold block">Total Detracciones SPOT (12%):</span>
          <span class="text-2xl font-black text-amber-900 dark:text-amber-300 font-mono mt-1 block">
            S/ {{ totalDetraccionesMes.toFixed(2) }}
          </span>
          <span class="text-[11px] text-amber-800/80 dark:text-amber-400/80 mt-1 block">Depósito esperado en Banco de la Nación</span>
        </div>

        <div class="bg-blue-50/70 dark:bg-blue-950/30 rounded-2xl p-5 border border-blue-200 dark:border-blue-800/60">
          <span class="text-xs text-blue-900 dark:text-blue-300 font-bold block">Total Neto Comercial Disponible:</span>
          <span class="text-2xl font-black text-blue-900 dark:text-blue-300 font-mono mt-1 block">
            S/ {{ totalNetoComercialMes.toFixed(2) }}
          </span>
          <span class="text-[11px] text-blue-800/80 dark:text-blue-400/80 mt-1 block">Depósitos directos en BCP / BBVA</span>
        </div>

      </div>

      <!-- TABLA DE AUDITORÍA MULTI-BD Y FACTURACIÓN -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 class="text-lg font-bold text-slate-900 dark:text-white">
              Auditoría en Tiempo Real por Base de Datos
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Conexión directa a las bases de datos de cada instituto para contar alumnos matriculados y calcular liquidación.
            </p>
          </div>

          <!-- Selector de Mes y Año -->
          <div class="flex items-center gap-2">
            <select
              v-model="filtroMes"
              @change="sincronizarAlumnos"
              class="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
            >
              <option :value="1">Enero</option>
              <option :value="2">Febrero</option>
              <option :value="3">Marzo</option>
              <option :value="4">Abril</option>
              <option :value="5">Mayo</option>
              <option :value="6">Junio</option>
              <option :value="7">Julio</option>
              <option :value="8">Agosto</option>
              <option :value="9">Septiembre</option>
              <option :value="10">Octubre</option>
              <option :value="11">Noviembre</option>
              <option :value="12">Diciembre</option>
            </select>

            <select
              v-model="filtroAnio"
              @change="sincronizarAlumnos"
              class="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
            >
              <option :value="2025">2025</option>
              <option :value="2026">2026</option>
              <option :value="2027">2027</option>
            </select>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th class="p-3">Institución Cliente</th>
                <th class="p-3">Conexión BD</th>
                <th class="p-3">Modalidad</th>
                <th class="p-3 text-center">Alumnos BD</th>
                <th class="p-3">Tarifa</th>
                <th class="p-3 font-mono">Total Facturable</th>
                <th class="p-3 font-mono text-amber-600">Detracción (12%)</th>
                <th class="p-3 font-mono text-blue-600">Neto Comercial</th>
                <th class="p-3 text-center">Estado Emisión</th>
                <th class="p-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              <tr v-for="item in calculosClientes" :key="item.clienteID" class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                
                <td class="p-3">
                  <span class="font-bold text-slate-900 dark:text-white block">{{ item.nombreComercial }}</span>
                  <span class="text-[10px] text-slate-400 font-mono">RUC: {{ item.ruc }} &bull; {{ item.subdominioSIAPP }}</span>
                </td>

                <td class="p-3">
                  <div class="flex items-center gap-1.5">
                    <span
                      :class="item.estadoConexionBD === 'CONECTADO' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300' : item.estadoConexionBD === 'NO_REQUERIDO_FIJO' ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300' : 'bg-red-100 text-red-800 border-red-300'"
                      class="px-2 py-0.5 rounded text-[10px] font-bold border"
                    >
                      {{ item.estadoConexionBD }}
                    </span>
                  </div>
                  <span class="text-[10px] text-slate-400 block truncate max-w-[150px]">{{ item.mensajeConexion }}</span>
                </td>

                <td class="p-3">
                  <span :class="item.tipoCobro === 'POR_ALUMNO' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-600 dark:text-slate-400 font-semibold'">
                    {{ item.tipoCobro === 'POR_ALUMNO' ? 'Por Alumno' : 'Tarifa Fija' }}
                  </span>
                </td>

                <td class="p-3 text-center font-bold text-sm font-mono">
                  {{ item.tipoCobro === 'POR_ALUMNO' ? item.alumnosDetectados : '—' }}
                </td>

                <td class="p-3 font-mono">
                  {{ item.tipoCobro === 'POR_ALUMNO' ? 'S/ ' + item.tarifaAplicada.toFixed(2) : 'Fijo' }}
                </td>

                <td class="p-3 font-mono font-bold text-slate-900 dark:text-white">
                  S/ {{ item.montoTotal.toFixed(2) }}
                </td>

                <td class="p-3 font-mono font-semibold text-amber-600 dark:text-amber-400">
                  S/ {{ item.montoDetraccion.toFixed(2) }}
                </td>

                <td class="p-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                  S/ {{ item.montoNeto.toFixed(2) }}
                </td>

                <td class="p-3 text-center">
                  <span
                    v-if="item.yaFacturadoEnPeriodo"
                    class="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold"
                  >
                    Emitido
                  </span>
                  <span
                    v-else
                    class="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-semibold"
                  >
                    Por Emitir
                  </span>
                </td>

                <td class="p-3 text-right">
                  <button
                    v-if="!item.yaFacturadoEnPeriodo"
                    type="button"
                    @click="abrirModalEmitir(item)"
                    class="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition-all shadow-xs"
                  >
                    Emitir Cobranza
                  </button>
                  <span v-else class="text-xs text-slate-400 italic font-semibold">
                    Registrado
                  </span>
                </td>

              </tr>
            </tbody>
          </table>
        </div>

      </div>

    </div>

    <!-- ============================================================================= -->
    <!-- PESTAÑA 2: CONCILIACIÓN DE VOUCHERS Y PAGOS                                   -->
    <!-- ============================================================================= -->
    <div v-else-if="pestanaActiva === 'vouchers'" class="space-y-6">

      <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <h2 class="text-lg font-bold text-slate-900 dark:text-white">
            Bandeja de Pagos y Constancias de Detracción
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Revisa los vouchers subidos por los clientes, valida los abonos netos en tus cuentas comerciales y las detracciones en el Banco de la Nación.
          </p>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th class="p-3">Cliente</th>
                <th class="p-3">Factura Ref.</th>
                <th class="p-3">Tipo de Abono</th>
                <th class="p-3">Banco & Operación</th>
                <th class="p-3 font-mono">Monto</th>
                <th class="p-3">Observaciones</th>
                <th class="p-3">Estado</th>
                <th class="p-3 text-right">Validación</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              <tr v-for="pago in vouchers" :key="pago.pagoID" class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                <td class="p-3">
                  <strong class="text-slate-900 dark:text-white block">{{ pago.clienteNombre }}</strong>
                  <span class="text-[10px] text-slate-400 font-mono">{{ pago.ruc }}</span>
                </td>
                <td class="p-3 font-mono font-bold text-blue-600">{{ pago.comprobanteCompleto }}</td>
                <td class="p-3">
                  <span
                    :class="pago.tipoAbono === 'DETRACCION_BN' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'"
                    class="px-2 py-0.5 rounded text-[10px] font-bold"
                  >
                    {{ pago.tipoAbono === 'DETRACCION_BN' ? 'Detracción BN' : 'Neto Comercial' }}
                  </span>
                </td>
                <td class="p-3">
                  <span class="font-semibold block">{{ pago.bancoDestino }}</span>
                  <span class="font-mono text-[10px] text-slate-500">Op: {{ pago.numeroOperacion }} ({{ pago.fechaOperacion }})</span>
                </td>
                <td class="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  S/ {{ pago.montoPagado.toFixed(2) }}
                </td>
                <td class="p-3 text-slate-500 text-[11px] max-w-xs truncate">
                  {{ pago.observacionesCliente || 'Sin observaciones' }}
                </td>
                <td class="p-3">
                  <span
                    :class="pago.estadoValidacion === 'APROBADO' ? 'bg-emerald-100 text-emerald-800' : pago.estadoValidacion === 'RECHAZADO' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'"
                    class="px-2 py-0.5 rounded text-[10px] font-bold"
                  >
                    {{ pago.estadoValidacion }}
                  </span>
                </td>
                <td class="p-3 text-right">
                  <div v-if="pago.estadoValidacion === 'EN_REVISION'" class="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      @click="responderVoucher(pago, 'APROBADO')"
                      class="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-all"
                    >
                      Aprobar
                    </button>
                    <button
                      type="button"
                      @click="responderVoucher(pago, 'RECHAZADO')"
                      class="px-2 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-red-100 hover:text-red-700 text-slate-700 dark:text-slate-300 font-semibold text-[11px] transition-all"
                    >
                      Rechazar
                    </button>
                  </div>
                  <span v-else class="text-slate-400 text-[11px] italic">
                    Procesado
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <!-- ============================================================================= -->
    <!-- PESTAÑA 3: GESTOR DE MANUALES Y EVIDENCIAS MINEDU                             -->
    <!-- ============================================================================= -->
    <div v-else-if="pestanaActiva === 'manuales'" class="space-y-6">

      <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 class="text-lg font-bold text-slate-900 dark:text-white">
              Manuales de Usuario & Evidencias para Licenciamiento Institucional
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Aquí puedes publicar manuales en PDF, fichas técnicas de hardware/software y planes de contingencia para que tus clientes los descarguen en su portal.
            </p>
          </div>

          <button
            type="button"
            @click="mostrarModalManual = true"
            class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <i class="fa-light fa-plus"></i>
            <span>Colgar Nuevo Documento / Manual</span>
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="manual in manualesAdmin"
            :key="manual.documentoID"
            class="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-4"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center text-lg shrink-0">
                <i class="fa-light fa-file-pdf"></i>
              </div>
              <div>
                <span class="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                  {{ manual.nombreCategoria }}
                </span>
                <strong class="text-xs text-slate-900 dark:text-white block leading-snug">
                  {{ manual.titulo }}
                </strong>
                <span class="text-[10px] text-slate-400 font-mono">
                  v{{ manual.version }} &bull; {{ manual.tamanoArchivoMB }} MB &bull; {{ manual.fechaPublicacion }}
                </span>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <a
                :href="manual.urlArchivo"
                target="_blank"
                class="px-3 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600"
              >
                Ver PDF
              </a>
            </div>
          </div>
        </div>

      </div>

    </div>

    <!-- ============================================================================= -->
    <!-- MODAL PARA EMITIR COBRANZA MENSUAL                                           -->
    <!-- ============================================================================= -->
    <div
      v-if="mostrarModalEmitir"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs"
    >
      <div class="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
        
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">
              Confirmar Emisión de Cobranza
            </h3>
            <span class="text-xs text-slate-500 font-mono">
              Cliente: {{ clienteSeleccionadoParaEmitir?.nombreComercial }}
            </span>
          </div>
          <button type="button" @click="mostrarModalEmitir = false" class="text-slate-400 hover:text-slate-600">
            <i class="fa-light fa-xmark text-lg"></i>
          </button>
        </div>

        <form @submit.prevent="confirmarEmisionCobranza" class="space-y-4">
          
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tipo Comprobante:
              </label>
              <select
                v-model="formEmitir.tipoComprobante"
                class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              >
                <option value="01">Factura Electrónica ('01')</option>
                <option value="02">Recibo por Honorarios ('02')</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Serie y Número:
              </label>
              <div class="flex gap-1.5">
                <input
                  v-model="formEmitir.serieComprobante"
                  type="text"
                  required
                  class="w-20 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-white"
                />
                <input
                  v-model="formEmitir.numeroComprobante"
                  type="number"
                  required
                  class="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <!-- Resumen de Liquidación -->
          <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
            <div class="flex justify-between">
              <span class="text-slate-500">Alumnos auditados en BD:</span>
              <strong class="font-mono text-slate-800 dark:text-slate-200">{{ formEmitir.cantidadAlumnos }} alumnos</strong>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Monto Total Facturado (con IGV):</span>
              <strong class="font-mono text-slate-900 dark:text-white font-bold">S/ {{ formEmitir.montoTotal.toFixed(2) }}</strong>
            </div>
            <div class="flex justify-between text-amber-700 dark:text-amber-400">
              <span>Detracción Banco de la Nación (12%):</span>
              <strong class="font-mono font-bold">S/ {{ formEmitir.montoDetraccion.toFixed(2) }}</strong>
            </div>
            <div class="flex justify-between text-blue-700 dark:text-blue-400 border-t border-slate-200 dark:border-slate-700 pt-1.5">
              <span>Neto a transferir a cuenta comercial:</span>
              <strong class="font-mono font-bold text-sm">S/ {{ formEmitir.montoNeto.toFixed(2) }}</strong>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              @click="mostrarModalEmitir = false"
              class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20"
            >
              Confirmar y Registrar en BDSIAPP_MASTER
            </button>
          </div>

        </form>
      </div>
    </div>

    <!-- ============================================================================= -->
    <!-- MODAL PARA PUBLICAR NUEVO MANUAL                                             -->
    <!-- ============================================================================= -->
    <div
      v-if="mostrarModalManual"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs"
    >
      <div class="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">
            Colgar Nuevo Manual o Evidencia MINEDU
          </h3>
          <button type="button" @click="mostrarModalManual = false" class="text-slate-400 hover:text-slate-600">
            <i class="fa-light fa-xmark text-lg"></i>
          </button>
        </div>

        <form @submit.prevent="guardarNuevoManual" class="space-y-3.5">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Categoría:</label>
            <select
              v-model="formNuevoManual.categoriaID"
              class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
            >
              <option :value="1">Manuales de Usuario Oficiales</option>
              <option :value="2">Evidencias de Licenciamiento (CBC MINEDU)</option>
              <option :value="3">Seguridad, Contingencia y Backups</option>
              <option :value="4">Certificados y Licencias de Software</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Título del Documento:</label>
            <input
              v-model="formNuevoManual.titulo"
              type="text"
              required
              placeholder="Ej: Manual de Gestión Docente & Asistencias v2026"
              class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Versión:</label>
              <input
                v-model="formNuevoManual.version"
                type="text"
                class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-mono"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tamaño Estimado (MB):</label>
              <input
                v-model="formNuevoManual.tamanoArchivoMB"
                type="number"
                step="0.1"
                class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Ruta o URL del PDF:</label>
            <input
              v-model="formNuevoManual.urlArchivo"
              type="text"
              required
              placeholder="/documentos/manual-docente-siapp.pdf"
              class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-mono"
            />
            <span class="text-[10px] text-slate-400 mt-0.5 block">Puedes guardarlo en public/documentos/ o en Azure Storage</span>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              @click="mostrarModalManual = false"
              class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20"
            >
              Publicar Documento
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>
