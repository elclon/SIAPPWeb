<script setup>
import { ref, onMounted } from 'vue';
import config from 'devextreme/core/config';
import { locale, loadMessages } from 'devextreme/localization';
import esMessages from 'devextreme/localization/messages/es.json';
import { licenseKey } from './admin/devextreme-license';
import { MANUALES_FIJOS_MINEDU } from './admin/manualesMineduConstants';
import apiClient from '@/api/axiosConfig';
import { showSuccess, showError } from '@/services/notification';
import { getErrorMessage } from '@/services/errorHandler';
import AdminPortalHeader from './admin/AdminPortalHeader.vue';
import AdminEmpresasTab from './admin/AdminEmpresasTab.vue';
import AdminManualesEmpresaPanel from './admin/AdminManualesEmpresaPanel.vue';
import AdminCalculoFacturacionTab from './admin/AdminCalculoFacturacionTab.vue';
import AdminVouchersTab from './admin/AdminVouchersTab.vue';
import AdminEmpresaModal from './admin/AdminEmpresaModal.vue';
import AdminEmitirCobranzaModal from './admin/AdminEmitirCobranzaModal.vue';
import AdminSubirManualModal from './admin/AdminSubirManualModal.vue';
import AdminLogin from './admin/AdminLogin.vue';

// Registrar licencia de DevExtreme y configurar idioma español como en SIAPPClient
config({ licenseKey });
loadMessages(esMessages);
locale('es');

// Estado de Autenticación de SuperAdmin
const sesionAdmin = ref(null);

// Pestañas Activas en el Panel Admin: 'empresas' | 'vouchers'
const pestanaActiva = ref('empresas');

// Vista de detalle contextual para una empresa seleccionada (null = ver lista de empresas)
const empresaSeleccionadaManuales = ref(null);
const empresaSeleccionadaFacturacion = ref(null);
const empresaSeleccionadaEditar = ref(null);

// Período de Consulta para Conteo y Facturación
const anioActual = new Date().getFullYear();
const mesActual = new Date().getMonth() + 1;
const filtroAnio = ref(anioActual);
const filtroMes = ref(mesActual);

// Estados de Carga y Feedback
const isCalculando = ref(false);
const isGuardandoEmpresa = ref(false);
const isGuardandoManual = ref(false);
const isGuardandoFactura = ref(false);
const mensajeFeedback = ref('');
const tipoFeedback = ref('success');

// Datos del Sistema (cargados dinámicamente desde el backend)
const empresas = ref([]);
const calculosClientes = ref([]);
const vouchers = ref([]);
const facturas = ref([]);
const manualesSubidos = ref([]);

// Modales
const mostrarModalEmpresa = ref(false);
const mostrarModalEmitir = ref(false);
const clienteSeleccionadoParaEmitir = ref(null);
const mostrarModalSubirManualFijo = ref(false);
const manualFijoSeleccionado = ref(null);

// Manejo de Sesión de SuperAdmin
const onLoginExitoso = (sesion) => {
  sesionAdmin.value = sesion;
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('siapp_admin_sesion', JSON.stringify(sesion));
    if (sesion.token) {
      sessionStorage.setItem('token', sesion.token);
    }
  }
  cargarEmpresas();
  cargarManuales();
  cargarVouchers();
  cargarFacturas();
  sincronizarAlumnos();
};

const onCerrarSesion = () => {
  sesionAdmin.value = null;
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('siapp_admin_sesion');
    sessionStorage.removeItem('token');
  }
  empresas.value = [];
  calculosClientes.value = [];
  vouchers.value = [];
  facturas.value = [];
  manualesSubidos.value = [];
  showSuccess('Sesión administrativa cerrada.');
};

// Acciones de Navegación y Apertura de Modales
const abrirModalNuevaEmpresa = () => {
  empresaSeleccionadaEditar.value = null;
  mostrarModalEmpresa.value = true;
};

const abrirModalEditarEmpresa = (empresa) => {
  empresaSeleccionadaEditar.value = empresa;
  mostrarModalEmpresa.value = true;
};

const abrirPanelManualesEmpresa = (empresa) => {
  empresaSeleccionadaManuales.value = empresa;
  empresaSeleccionadaFacturacion.value = null;
};

const abrirPanelFacturacionEmpresa = (empresa) => {
  empresaSeleccionadaFacturacion.value = empresa;
  empresaSeleccionadaManuales.value = null;
};

const volverAListaEmpresas = () => {
  empresaSeleccionadaManuales.value = null;
  empresaSeleccionadaFacturacion.value = null;
};

const abrirModalSubirManual = (manualFijo) => {
  manualFijoSeleccionado.value = manualFijo;
  mostrarModalSubirManualFijo.value = true;
};

const abrirModalEmitir = (item) => {
  clienteSeleccionadoParaEmitir.value = item;
  mostrarModalEmitir.value = true;
};

// Cargar Datos Dinámicos desde el Backend utilizando apiClient
const cargarEmpresas = async () => {
  try {
    const response = await apiClient.get('/portal-cliente/admin/clientes');
    empresas.value = Array.isArray(response.data) ? response.data : [];
  } catch (e) {
    console.error('Error al cargar clientes administrativos:', e);
    showError(getErrorMessage(e, 'Error al obtener la lista de clientes'));
    empresas.value = [];
  }
};

const cargarManuales = async () => {
  try {
    const response = await apiClient.get('/portal-cliente/admin/documentos');
    manualesSubidos.value = Array.isArray(response.data) ? response.data : [];
  } catch (e) {
    console.error('Error al cargar documentos:', e);
    manualesSubidos.value = [];
  }
};

const cargarVouchers = async () => {
  try {
    const response = await apiClient.get('/portal-cliente/admin/vouchers-pendientes');
    vouchers.value = Array.isArray(response.data) ? response.data : [];
  } catch (e) {
    console.error('Error al cargar comprobantes/vouchers:', e);
    vouchers.value = [];
  }
};

const cargarFacturas = async () => {
  try {
    const response = await apiClient.get('/portal-cliente/admin/facturas');
    facturas.value = Array.isArray(response.data) ? response.data : [];
  } catch (e) {
    console.error('Error al cargar facturas emitidas:', e);
    facturas.value = [];
  }
};

const sincronizarAlumnos = async () => {
  isCalculando.value = true;
  try {
    const response = await apiClient.get('/portal-cliente/admin/calcular-alumnos', {
      params: {
        anio: filtroAnio.value,
        mes: filtroMes.value
      }
    });
    calculosClientes.value = Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    calculosClientes.value = [];
    showError(getErrorMessage(error, 'Error al calcular alumnos'));
  } finally {
    isCalculando.value = false;
  }
};

// Handlers de Guardado
const onGuardarEmpresa = async (nuevaEmpresa) => {
  isGuardandoEmpresa.value = true;
  try {
    await apiClient.post('/portal-cliente/admin/clientes/guardar', nuevaEmpresa);
    mostrarModalEmpresa.value = false;
    const mensaje = nuevaEmpresa.clienteID > 0
      ? `¡Institución "${nuevaEmpresa.nombreComercial}" actualizada con éxito!`
      : `¡Institución "${nuevaEmpresa.nombreComercial}" registrada con éxito!`;
    showSuccess(mensaje);
    await cargarEmpresas();
    await sincronizarAlumnos();
  } catch (error) {
    showError(getErrorMessage(error, 'Error al guardar la institución'));
  } finally {
    isGuardandoEmpresa.value = false;
  }
};

const onConfirmarEmisionCobranza = async ({ payload, cliente }) => {
  try {
    await apiClient.post('/portal-cliente/admin/emitir-cobranza', payload);
    cliente.yaFacturadoEnPeriodo = true;
    mostrarModalEmitir.value = false;
    showSuccess(`Cobranza ${payload.serieComprobante}-${payload.numeroComprobante} emitida exitosamente.`);
    await sincronizarAlumnos();
    await cargarFacturas();
  } catch (error) {
    showError(getErrorMessage(error, 'Error al registrar la cobranza'));
  }
};

const onConfirmarGuardadoManual = async ({ payload, manualFijo, empresa, formValues }) => {
  isGuardandoManual.value = true;
  try {
    await apiClient.post('/portal-cliente/admin/documentos/guardar', payload);
    mostrarModalSubirManualFijo.value = false;
    showSuccess(`¡${formValues.tituloPersonalizado} guardado con éxito para ${empresa.nombreComercial}!`);
    await cargarManuales();
  } catch (error) {
    showError(getErrorMessage(error, 'Error al registrar el documento'));
  } finally {
    isGuardandoManual.value = false;
  }
};

const onSubirFactura = async ({ formData, cerrarModal }) => {
  isGuardandoFactura.value = true;
  try {
    await apiClient.post('/portal-cliente/admin/facturas/subir', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    showSuccess('¡Factura subida y registrada exitosamente!');
    if (cerrarModal) cerrarModal();
    await cargarFacturas();
  } catch (error) {
    showError(getErrorMessage(error, 'Error al subir y registrar la factura'));
  } finally {
    isGuardandoFactura.value = false;
  }
};

const onNotificarFactura = async (factura) => {
  try {
    await apiClient.post('/portal-cliente/admin/facturas/notificar', {
      cobranzaID: factura.cobranzaID || factura.cobranzaId,
      emailDestino: factura.emailContacto
    });
    showSuccess(`¡Factura notificada con éxito a ${factura.emailContacto || 'la institución'}!`);
    await cargarFacturas();
  } catch (error) {
    showError(getErrorMessage(error, 'Error al notificar la factura por correo'));
  }
};

const onMarcarPagadoFactura = async (factura) => {
  try {
    await apiClient.post('/portal-cliente/admin/facturas/marcar-pagado', {
      cobranzaID: factura.cobranzaID || factura.cobranzaId
    });
    showSuccess(`¡Factura ${factura.comprobanteCompleto || ''} registrada como PAGADA exitosamente!`);
    await cargarFacturas();
  } catch (error) {
    showError(getErrorMessage(error, 'Error al registrar el estado pagado'));
  }
};

const onResponderVoucher = async ({ pago, estado }) => {
  const accion = estado === 'APROBADO' ? 'aprobar' : 'rechazar';
  if (!confirm(`¿Está seguro de ${accion} este comprobante de pago de S/ ${pago.montoPagado.toFixed(2)}?`)) {
    return;
  }

  try {
    await apiClient.post('/portal-cliente/admin/validar-voucher', {
      pagoID: pago.pagoID,
      estadoValidacion: estado,
      motivoRechazo: estado === 'RECHAZADO' ? 'Número de operación no coincide con el estado bancario' : null
    });

    showSuccess(`Comprobante ${estado.toLowerCase()} correctamente.`);
    await cargarVouchers();
  } catch (error) {
    showError(getErrorMessage(error, 'Error al actualizar el estado del comprobante'));
  }
};

onMounted(() => {
  if (typeof window !== 'undefined') {
    const sesionGuardada = sessionStorage.getItem('siapp_admin_sesion') || localStorage.getItem('siapp_admin_sesion');
    if (sesionGuardada) {
      try {
        sesionAdmin.value = JSON.parse(sesionGuardada);
        cargarEmpresas();
        cargarManuales();
        cargarVouchers();
        cargarFacturas();
        sincronizarAlumnos();
      } catch (e) {
        sesionAdmin.value = null;
      }
    }
  }
});
</script>

<template>
  <!-- VISTA DE LOGIN ADMINISTRATIVO SI NO HAY SESIÓN ACTIVA -->
  <AdminLogin v-if="!sesionAdmin" @login-exitoso="onLoginExitoso" />

  <!-- PANEL DE ADMINISTRACIÓN COMPLETO SI HAY SESIÓN ACTIVA -->
  <div v-else class="space-y-8">

    <!-- CABECERA PRINCIPAL MODULAR CON SESIÓN Y LOGOUT -->
    <AdminPortalHeader
      :is-calculando="isCalculando"
      :sesion-admin="sesionAdmin"
      @nueva-empresa="abrirModalNuevaEmpresa"
      @sincronizar="sincronizarAlumnos"
      @cerrar-sesion="onCerrarSesion"
    />

    <!-- PESTAÑAS DE NAVEGACIÓN -->
    <div class="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-sm font-bold overflow-x-auto">
      <button
        type="button"
        @click="pestanaActiva = 'empresas'; volverAListaEmpresas()"
        :class="pestanaActiva === 'empresas' ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 pb-3' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 pb-3'"
        class="flex items-center gap-2 transition-colors shrink-0"
      >
        <i class="fa-light fa-building-columns"></i>
        <span>1. Empresas Clientes ({{ empresas.length }})</span>
      </button>

      <button
        type="button"
        @click="pestanaActiva = 'vouchers'; volverAListaEmpresas()"
        :class="pestanaActiva === 'vouchers' ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 pb-3' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 pb-3'"
        class="flex items-center gap-2 transition-colors shrink-0"
      >
        <i class="fa-light fa-file-invoice-dollar"></i>
        <span>2. Facturas Emitidas & Conciliación de Vouchers ({{ facturas.length }})</span>
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

    <!-- PESTAÑA 1: EMPRESAS CLIENTES & VISTAS CONTEXTUALES (DIRECTORIO, MANUALES O FACTURACIÓN) -->
    <div v-if="pestanaActiva === 'empresas'">
      <!-- CASO A: TABLA DE DIRECTORIO DE EMPRESAS -->
      <AdminEmpresasTab
        v-if="!empresaSeleccionadaManuales && !empresaSeleccionadaFacturacion"
        :empresas="empresas"
        :manuales-subidos="manualesSubidos"
        :total-manuales-fijos="MANUALES_FIJOS_MINEDU.length"
        @nueva-empresa="abrirModalNuevaEmpresa"
        @ver-manuales="abrirPanelManualesEmpresa"
        @ver-facturacion="abrirPanelFacturacionEmpresa"
        @editar-empresa="abrirModalEditarEmpresa"
      />

      <!-- CASO B: PANEL DE LOS 7 MANUALES FIJOS MINEDU DE LA EMPRESA SELECCIONADA -->
      <AdminManualesEmpresaPanel
        v-else-if="empresaSeleccionadaManuales"
        :empresa="empresaSeleccionadaManuales"
        :manuales-fijos="MANUALES_FIJOS_MINEDU"
        :manuales-subidos="manualesSubidos"
        @volver="volverAListaEmpresas"
        @subir-manual="abrirModalSubirManual"
      />

      <!-- CASO C: FACTURACIÓN & CONTEO DE ALUMNOS DE LA EMPRESA SELECCIONADA -->
      <AdminCalculoFacturacionTab
        v-else-if="empresaSeleccionadaFacturacion"
        :calculos-clientes="calculosClientes"
        :empresa-seleccionada="empresaSeleccionadaFacturacion"
        :empresas="empresas"
        :facturas="facturas"
        :is-guardando-factura="isGuardandoFactura"
        v-model:filtro-mes="filtroMes"
        v-model:filtro-anio="filtroAnio"
        @cambiar-periodo="sincronizarAlumnos"
        @emitir-cobranza="abrirModalEmitir"
        @subir-factura="onSubirFactura"
        @notificar-factura="onNotificarFactura"
        @marcar-pagado="onMarcarPagadoFactura"
        @volver="volverAListaEmpresas"
      />
    </div>

    <!-- PESTAÑA 2: BANDEJA DE FACTURAS EMITIDAS Y CONCILIACIÓN DE VOUCHERS -->
    <AdminVouchersTab
      v-else-if="pestanaActiva === 'vouchers'"
      :vouchers="vouchers"
      :facturas="facturas"
      :empresas="empresas"
      :is-guardando-factura="isGuardandoFactura"
      @responder-voucher="onResponderVoucher"
      @subir-factura="onSubirFactura"
      @notificar-factura="onNotificarFactura"
      @marcar-pagado="onMarcarPagadoFactura"
    />

    <!-- MODAL 1: REGISTRAR / EDITAR EMPRESA -->
    <AdminEmpresaModal
      v-model:visible="mostrarModalEmpresa"
      :empresa-a-editar="empresaSeleccionadaEditar"
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
