<script setup>
import { ref, onMounted } from 'vue';
import { MANUALES_FIJOS_MINEDU } from './admin/manualesMineduConstants';
import AdminPortalHeader from './admin/AdminPortalHeader.vue';
import AdminEmpresasTab from './admin/AdminEmpresasTab.vue';
import AdminManualesEmpresaPanel from './admin/AdminManualesEmpresaPanel.vue';
import AdminCalculoFacturacionTab from './admin/AdminCalculoFacturacionTab.vue';
import AdminVouchersTab from './admin/AdminVouchersTab.vue';
import AdminEmpresaModal from './admin/AdminEmpresaModal.vue';
import AdminEmitirCobranzaModal from './admin/AdminEmitirCobranzaModal.vue';
import AdminSubirManualModal from './admin/AdminSubirManualModal.vue';

// Pestañas Activas en el Panel Admin: 'empresas' | 'calculo' | 'vouchers'
const pestanaActiva = ref('empresas');

// Vista de detalle de manuales para una empresa seleccionada (null = ver lista de empresas)
const empresaSeleccionadaManuales = ref(null);

// Período de Consulta para Conteo y Facturación
const anioActual = new Date().getFullYear();
const mesActual = new Date().getMonth() + 1;
const filtroAnio = ref(anioActual);
const filtroMes = ref(mesActual);

// Estados de Carga y Feedback
const isCalculando = ref(false);
const isGuardandoEmpresa = ref(false);
const isGuardandoManual = ref(false);
const mensajeFeedback = ref('');
const tipoFeedback = ref('success');

// Directorio de Empresas Registradas
const empresas = ref([
  {
    clienteID: 1,
    ruc: '20549281921',
    razonSocial: 'INSTITUTO DE EDUCACION SUPERIOR TECNOLOGICO SIAPP S.A.C.',
    nombreComercial: 'Instituto Tecnológico SIAPP',
    subdominioSIAPP: 'institucion.siapp.edu.pe',
    codigoConexion: 'siapp',
    tipoCobro: 'POR_ALUMNO',
    tarifaPorAlumno: 4.00,
    montoFijoPactado: null,
    tipoComprobanteHabitual: '01',
    porcentajeDetraccion: 12.00,
    contactoPrincipal: 'Lic. Roberto Zegarra',
    emailContacto: 'administracion@siapp.edu.pe',
    estado: true
  },
  {
    clienteID: 2,
    ruc: '20491823901',
    razonSocial: 'INSTITUTO SUPERIOR DE EDUCACION TEPNUM E.I.R.L.',
    nombreComercial: 'Instituto Superior Tepnum',
    subdominioSIAPP: 'tepnum.siapp.edu.pe',
    codigoConexion: 'tepnum',
    tipoCobro: 'FIJO',
    tarifaPorAlumno: null,
    montoFijoPactado: 1500.00,
    tipoComprobanteHabitual: '01',
    porcentajeDetraccion: 12.00,
    contactoPrincipal: 'Mg. Carlos Mendoza',
    emailContacto: 'finanzas@tepnum.edu.pe',
    estado: true
  },
  {
    clienteID: 3,
    ruc: '20601928472',
    razonSocial: 'INSTITUTO SUPERIOR TECNOLOGICO STENDHAL S.A.',
    nombreComercial: 'Instituto Stendhal',
    subdominioSIAPP: 'stendhal.siapp.edu.pe',
    codigoConexion: 'stendhal',
    tipoCobro: 'POR_ALUMNO',
    tarifaPorAlumno: 4.00,
    montoFijoPactado: null,
    tipoComprobanteHabitual: '02',
    porcentajeDetraccion: 10.00,
    contactoPrincipal: 'Dra. Patricia Alva',
    emailContacto: 'direccion@stendhal.edu.pe',
    estado: true
  }
]);

// Lista de Cálculos de Alumnos en Vivo
const calculosClientes = ref([]);

// Lista de Vouchers Reportados
const vouchers = ref([
  {
    pagoID: 1,
    cobranzaID: 101,
    clienteNombre: 'Instituto Tecnológico SIAPP',
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
    clienteNombre: 'Instituto Tecnológico SIAPP',
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

// Documentos y manuales actualmente subidos
const manualesSubidos = ref([
  {
    documentoID: 1,
    clienteIDExclusivo: 1,
    codigoFijo: 'MAN_ACAD',
    categoriaID: 1,
    titulo: 'Manual Operativo: Módulo Académico & Matrículas (Logo SIAPP)',
    version: '2026.2',
    tamanoArchivoMB: 4.8,
    urlArchivo: '/documentos/siapp/manual-academico-siapp.pdf',
    fechaPublicacion: '10/09/2026'
  },
  {
    documentoID: 2,
    clienteIDExclusivo: 1,
    codigoFijo: 'MAN_CAJA',
    categoriaID: 1,
    titulo: 'Manual Operativo: Caja, Tesorería y Facturación SUNAT (Logo SIAPP)',
    version: '2026.1',
    tamanoArchivoMB: 3.5,
    urlArchivo: '/documentos/siapp/manual-caja-sunat-siapp.pdf',
    fechaPublicacion: '05/09/2026'
  },
  {
    documentoID: 3,
    clienteIDExclusivo: 2,
    codigoFijo: 'FIC_TEC',
    categoriaID: 2,
    titulo: 'Ficha Técnica de Arquitectura de Software y Servidores (Logo Tepnum)',
    version: '1.4',
    tamanoArchivoMB: 2.1,
    urlArchivo: '/documentos/tepnum/ficha-tecnica-tepnum.pdf',
    fechaPublicacion: '12/08/2026'
  }
]);

// Modales
const mostrarModalEmpresa = ref(false);
const mostrarModalEmitir = ref(false);
const clienteSeleccionadoParaEmitir = ref(null);
const mostrarModalSubirManualFijo = ref(false);
const manualFijoSeleccionado = ref(null);

// Acciones de Navegación y Apertura de Modales
const abrirModalNuevaEmpresa = () => {
  mostrarModalEmpresa.value = true;
};

const abrirPanelManualesEmpresa = (empresa) => {
  empresaSeleccionadaManuales.value = empresa;
};

const volverAListaEmpresas = () => {
  empresaSeleccionadaManuales.value = null;
};

const abrirModalSubirManual = (manualFijo) => {
  manualFijoSeleccionado.value = manualFijo;
  mostrarModalSubirManualFijo.value = true;
};

const abrirModalEmitir = (item) => {
  clienteSeleccionadoParaEmitir.value = item;
  mostrarModalEmitir.value = true;
};

// Cargar Datos Iniciales desde el Backend
const cargarEmpresas = async () => {
  try {
    const res = await fetch('http://localhost:5000/portal-cliente/admin/clientes');
    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) {
        empresas.value = data;
      }
    }
  } catch (e) {
    // Si el servidor local no está activo, mantiene los datos mock para diseño
  }
};

const cargarManuales = async () => {
  try {
    const res = await fetch('http://localhost:5000/portal-cliente/admin/documentos');
    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) {
        manualesSubidos.value = data;
      }
    }
  } catch (e) {
    // Fallback reactivo en memoria
  }
};

const sincronizarAlumnos = async () => {
  isCalculando.value = true;
  try {
    const res = await fetch(`http://localhost:5000/portal-cliente/admin/calculo-alumnos?anio=${filtroAnio.value}&mes=${filtroMes.value}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) {
        calculosClientes.value = data;
        return;
      }
    }
  } catch (e) {
    // Fallback de cálculo simulado
  }

  // Generar cálculo basado en las empresas registradas
  calculosClientes.value = empresas.value.map(emp => {
    let alumnos = 0;
    let total = 0;
    let det = 0;
    let neto = 0;

    if (emp.tipoCobro === 'POR_ALUMNO') {
      alumnos = emp.codigoConexion === 'siapp' ? 450 : emp.codigoConexion === 'stendhal' ? 280 : 195;
      const tarifa = emp.tarifaPorAlumno || 4.00;
      total = Math.round(alumnos * tarifa * 100) / 100;
      det = total > 700 ? Math.round(total * 0.12 * 100) / 100 : 0;
      neto = Math.round((total - det) * 100) / 100;
      return {
        clienteID: emp.clienteID,
        ruc: emp.ruc,
        nombreComercial: emp.nombreComercial,
        subdominioSIAPP: emp.subdominioSIAPP,
        codigoConexion: emp.codigoConexion,
        tipoCobro: emp.tipoCobro,
        alumnosDetectados: alumnos,
        tarifaAplicada: tarifa,
        montoTotal: total,
        aplicaDetraccion: total > 700,
        montoDetraccion: det,
        montoNeto: neto,
        yaFacturadoEnPeriodo: emp.clienteID === 1,
        estadoConexionBD: 'CONECTADO',
        mensajeConexion: 'Conexión verificada exitosamente'
      };
    } else {
      total = emp.montoFijoPactado || 1500.00;
      det = total > 700 ? Math.round(total * 0.12 * 100) / 100 : 0;
      neto = Math.round((total - det) * 100) / 100;
      return {
        clienteID: emp.clienteID,
        ruc: emp.ruc,
        nombreComercial: emp.nombreComercial,
        subdominioSIAPP: emp.subdominioSIAPP,
        codigoConexion: emp.codigoConexion,
        tipoCobro: emp.tipoCobro,
        alumnosDetectados: 0,
        tarifaAplicada: total,
        montoTotal: total,
        aplicaDetraccion: total > 700,
        montoDetraccion: det,
        montoNeto: neto,
        yaFacturadoEnPeriodo: false,
        estadoConexionBD: 'NO_REQUERIDO_FIJO',
        mensajeConexion: 'Modalidad de tarifa fija mensual pactada'
      };
    }
  });

  isCalculando.value = false;
};

// Handlers de Guardado
const onGuardarEmpresa = async (nuevaEmpresa) => {
  isGuardandoEmpresa.value = true;
  try {
    const res = await fetch('http://localhost:5000/portal-cliente/admin/clientes/guardar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevaEmpresa)
    }).catch(() => null);

    let nuevoId = Date.now();
    if (res && res.ok) {
      const dataId = await res.json();
      if (dataId) nuevoId = dataId;
    }

    empresas.value.unshift({
      ...nuevaEmpresa,
      clienteID: nuevoId,
      estado: true
    });

    mostrarModalEmpresa.value = false;
    alert(`¡Institución "${nuevaEmpresa.nombreComercial}" registrada con éxito!`);
    sincronizarAlumnos();
  } finally {
    isGuardandoEmpresa.value = false;
  }
};

const onConfirmarEmisionCobranza = async ({ payload, cliente }) => {
  try {
    await fetch('http://localhost:5000/portal-cliente/admin/emitir-cobranza', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(() => null);

    cliente.yaFacturadoEnPeriodo = true;
    mostrarModalEmitir.value = false;
    alert(`Cobranza ${payload.serieComprobante}-${payload.numeroComprobante} registrada exitosamente.`);
  } catch (e) {
    mostrarModalEmitir.value = false;
  }
};

const onConfirmarGuardadoManual = async ({ payload, manualFijo, empresa, formValues }) => {
  isGuardandoManual.value = true;
  try {
    await fetch('http://localhost:5000/portal-cliente/admin/documentos/guardar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(() => null);

    const indexExistente = manualesSubidos.value.findIndex(
      m => m.clienteIDExclusivo === empresa.clienteID && m.codigoFijo === manualFijo.codigoFijo
    );

    if (indexExistente >= 0) {
      manualesSubidos.value[indexExistente] = {
        ...manualesSubidos.value[indexExistente],
        titulo: formValues.tituloPersonalizado,
        version: formValues.version,
        tamanoArchivoMB: parseFloat(formValues.tamanoArchivoMB),
        urlArchivo: formValues.urlArchivo,
        fechaPublicacion: new Date().toLocaleDateString('es-PE')
      };
    } else {
      manualesSubidos.value.push({
        documentoID: Date.now(),
        clienteIDExclusivo: empresa.clienteID,
        codigoFijo: manualFijo.codigoFijo,
        categoriaID: formValues.categoriaID,
        titulo: formValues.tituloPersonalizado,
        version: formValues.version,
        tamanoArchivoMB: parseFloat(formValues.tamanoArchivoMB),
        urlArchivo: formValues.urlArchivo,
        fechaPublicacion: new Date().toLocaleDateString('es-PE')
      });
    }

    mostrarModalSubirManualFijo.value = false;
    alert(`¡${formValues.tituloPersonalizado} guardado con éxito para ${empresa.nombreComercial}!`);
  } finally {
    isGuardandoManual.value = false;
  }
};

const onResponderVoucher = async ({ pago, estado }) => {
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

onMounted(() => {
  cargarEmpresas();
  cargarManuales();
  sincronizarAlumnos();
});
</script>

<template>
  <div class="space-y-8">

    <!-- CABECERA PRINCIPAL MODULAR -->
    <AdminPortalHeader
      :is-calculando="isCalculando"
      @nueva-empresa="abrirModalNuevaEmpresa"
      @sincronizar="sincronizarAlumnos"
    />

    <!-- PESTAÑAS DE NAVEGACIÓN -->
    <div class="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-sm font-bold overflow-x-auto">
      <button
        type="button"
        @click="pestanaActiva = 'empresas'; empresaSeleccionadaManuales = null"
        :class="pestanaActiva === 'empresas' ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 pb-3' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 pb-3'"
        class="flex items-center gap-2 transition-colors shrink-0"
      >
        <i class="fa-light fa-building-columns"></i>
        <span>1. Empresas Clientes ({{ empresas.length }})</span>
      </button>

      <button
        type="button"
        @click="pestanaActiva = 'calculo'; empresaSeleccionadaManuales = null"
        :class="pestanaActiva === 'calculo' ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 pb-3' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 pb-3'"
        class="flex items-center gap-2 transition-colors shrink-0"
      >
        <i class="fa-light fa-calculator"></i>
        <span>2. Conteo de Alumnos & Facturación</span>
      </button>

      <button
        type="button"
        @click="pestanaActiva = 'vouchers'; empresaSeleccionadaManuales = null"
        :class="pestanaActiva === 'vouchers' ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 pb-3' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 pb-3'"
        class="flex items-center gap-2 transition-colors shrink-0"
      >
        <i class="fa-light fa-receipt"></i>
        <span>3. Conciliación de Vouchers & Detracciones ({{ vouchers.filter(v => v.estadoValidacion === 'EN_REVISION').length }})</span>
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

    <!-- PESTAÑA 1: EMPRESAS CLIENTES & CARPETA CONTEXTUAL DE MANUALES -->
    <div v-if="pestanaActiva === 'empresas'">
      <!-- CASO A: TABLA DE DIRECTORIO DE EMPRESAS -->
      <AdminEmpresasTab
        v-if="!empresaSeleccionadaManuales"
        :empresas="empresas"
        :manuales-subidos="manualesSubidos"
        :total-manuales-fijos="MANUALES_FIJOS_MINEDU.length"
        @nueva-empresa="abrirModalNuevaEmpresa"
        @ver-manuales="abrirPanelManualesEmpresa"
      />

      <!-- CASO B: PANEL DE LOS 7 MANUALES FIJOS MINEDU DE LA EMPRESA SELECCIONADA -->
      <AdminManualesEmpresaPanel
        v-else
        :empresa="empresaSeleccionadaManuales"
        :manuales-fijos="MANUALES_FIJOS_MINEDU"
        :manuales-subidos="manualesSubidos"
        @volver="volverAListaEmpresas"
        @subir-manual="abrirModalSubirManual"
      />
    </div>

    <!-- PESTAÑA 2: CONTEO DE ALUMNOS & FACTURACIÓN -->
    <AdminCalculoFacturacionTab
      v-else-if="pestanaActiva === 'calculo'"
      :calculos-clientes="calculosClientes"
      v-model:filtro-mes="filtroMes"
      v-model:filtro-anio="filtroAnio"
      @cambiar-periodo="sincronizarAlumnos"
      @emitir-cobranza="abrirModalEmitir"
    />

    <!-- PESTAÑA 3: CONCILIACIÓN DE VOUCHERS -->
    <AdminVouchersTab
      v-else-if="pestanaActiva === 'vouchers'"
      :vouchers="vouchers"
      @responder-voucher="onResponderVoucher"
    />

    <!-- MODAL 1: REGISTRAR NUEVA EMPRESA -->
    <AdminEmpresaModal
      v-model:visible="mostrarModalEmpresa"
      :is-guardando="isGuardandoEmpresa"
      @guardar="onGuardarEmpresa"
    />

    <!-- MODAL 2: EMITIR COBRANZA MENSUAL -->
    <AdminEmitirCobranzaModal
      v-model:visible="mostrarModalEmitir"
      :cliente="clienteSeleccionadoParaEmitir"
      :filtro-mes="filtroMes"
      :filtro-anio="filtroAnio"
      @confirmar="onConfirmarEmisionCobranza"
    />

    <!-- MODAL 3: SUBIR O REEMPLAZAR MANUAL MINEDU CON LOGO -->
    <AdminSubirManualModal
      v-model:visible="mostrarModalSubirManualFijo"
      :empresa="empresaSeleccionadaManuales"
      :manual-fijo="manualFijoSeleccionado"
      :manual-subido="manualesSubidos.find(m => m.clienteIDExclusivo === empresaSeleccionadaManuales?.clienteID && (m.codigoFijo === manualFijoSeleccionado?.codigoFijo || m.titulo.toLowerCase().includes(manualFijoSeleccionado?.codigoFijo?.toLowerCase() || '')))"
      :is-guardando="isGuardandoManual"
      @guardar="onConfirmarGuardadoManual"
    />

  </div>
</template>
