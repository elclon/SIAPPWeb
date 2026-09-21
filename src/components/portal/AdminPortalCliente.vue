<script setup>
import './admin/devextreme-init';
import { ref, onMounted } from 'vue';
import { MANUALES_FIJOS_MINEDU } from './admin/manualesMineduConstants';
import apiClient from '@/api/axiosConfig';
import { showSuccess, showError } from '@/services/notification';
import { getErrorMessage } from '@/services/errorHandler';
import AdminPortalHeader from './admin/AdminPortalHeader.vue';
import AdminEmpresasTab from './admin/AdminEmpresasTab.vue';
import AdminManualesEmpresaPanel from './admin/AdminManualesEmpresaPanel.vue';
import AdminCalculoFacturacionTab from './admin/AdminCalculoFacturacionTab.vue';
import AdminEmpresaModal from './admin/AdminEmpresaModal.vue';
import AdminSubirManualModal from './admin/AdminSubirManualModal.vue';
import AdminNotificacionesTab from './admin/AdminNotificacionesTab.vue';
import AdminNotificacionModal from './admin/AdminNotificacionModal.vue';
import AdminAplicarNotificacionModal from './admin/AdminAplicarNotificacionModal.vue';
import AdminLogin from './admin/AdminLogin.vue';

// Estado de Autenticación de SuperAdmin
const sesionAdmin = ref(null);

// Pestaña Principal Activa ('empresas' | 'notificaciones')
const tabPrincipal = ref('empresas');

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
const isCargandoNotificaciones = ref(false);
const isGuardandoNotificacion = ref(false);
const isAplicandoNotificacion = ref(false);
const mensajeFeedback = ref('');
const tipoFeedback = ref('success');

// Datos del Sistema (cargados dinámicamente desde el backend)
const empresas = ref([]);
const calculosClientes = ref([]);
const facturas = ref([]);
const manualesSubidos = ref([]);
const notificaciones = ref([]);

// Modales
const mostrarModalEmpresa = ref(false);
const mostrarModalSubirManualFijo = ref(false);
const manualFijoSeleccionado = ref(null);
const mostrarModalNotificacion = ref(false);
const notificacionSeleccionadaEditar = ref(null);
const mostrarModalAplicarNotificacion = ref(false);
const notificacionParaAplicar = ref(null);

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
  cargarFacturas();
  cargarNotificaciones();
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

// Handlers de Notificaciones y ChangeLogs
const abrirModalNuevaNotificacion = () => {
  notificacionSeleccionadaEditar.value = null;
  mostrarModalNotificacion.value = true;
};

const abrirModalEditarNotificacion = (notif) => {
  notificacionSeleccionadaEditar.value = notif;
  mostrarModalNotificacion.value = true;
};

const abrirModalAplicarNotificacion = (notif) => {
  notificacionParaAplicar.value = notif;
  mostrarModalAplicarNotificacion.value = true;
};

const cargarNotificaciones = async () => {
  isCargandoNotificaciones.value = true;
  try {
    const response = await apiClient.get('/portal-cliente/admin/notificaciones');
    notificaciones.value = Array.isArray(response.data) ? response.data : [];
  } catch (e) {
    console.error('Error al cargar notificaciones:', e);
    showError(getErrorMessage(e, 'Error al obtener lista de notificaciones'));
    notificaciones.value = [];
  } finally {
    isCargandoNotificaciones.value = false;
  }
};

const onGuardarNotificacion = async (payload) => {
  isGuardandoNotificacion.value = true;
  try {
    await apiClient.post('/portal-cliente/admin/notificaciones/guardar', payload);
    mostrarModalNotificacion.value = false;
    const mensaje = payload.notificacionID > 0
      ? `¡Notificación "${payload.titulo}" actualizada exitosamente!`
      : `¡Notificación "${payload.titulo}" creada exitosamente!`;
    showSuccess(mensaje);
    await cargarNotificaciones();
  } catch (error) {
    showError(getErrorMessage(error, 'Error al guardar la notificación'));
  } finally {
    isGuardandoNotificacion.value = false;
  }
};

const onEliminarNotificacion = async (notificacionID) => {
  try {
    await apiClient.delete(`/portal-cliente/admin/notificaciones/${notificacionID}`);
    showSuccess('Notificación eliminada correctamente.');
    await cargarNotificaciones();
  } catch (error) {
    showError(getErrorMessage(error, 'Error al eliminar la notificación'));
  }
};

const onAplicarNotificacionAEmpresas = async ({ notificacionID, clienteIDs }) => {
  isAplicandoNotificacion.value = true;
  try {
    await apiClient.post('/portal-cliente/admin/notificaciones/aplicar-empresas', {
      notificacionID,
      clienteIDs
    });
    mostrarModalAplicarNotificacion.value = false;
    showSuccess('¡Notificación aplicada y sincronizada en las empresas seleccionadas con éxito!');
    await cargarNotificaciones();
  } catch (error) {
    showError(getErrorMessage(error, 'Error al aplicar notificación a las empresas'));
  } finally {
    isAplicandoNotificacion.value = false;
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
        cargarFacturas();
        cargarNotificaciones();
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
  <div v-else class="space-y-6">

    <!-- CABECERA PRINCIPAL MODULAR CON SESIÓN Y LOGOUT -->
    <AdminPortalHeader
      :is-calculando="isCalculando"
      :sesion-admin="sesionAdmin"
      @nueva-empresa="abrirModalNuevaEmpresa"
      @sincronizar="sincronizarAlumnos"
      @cerrar-sesion="onCerrarSesion"
    />

    <!-- BARRA DE PESTAÑAS PRINCIPALES DEL PORTAL ADMINISTRATIVO -->
    <div class="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 w-fit">
      <button
        type="button"
        @click="tabPrincipal = 'empresas'"
        :class="tabPrincipal === 'empresas' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'"
        class="px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer"
      >
        <i class="fa-light fa-buildings text-sm text-sky-500"></i>
        <span>Instituciones & Facturación</span>
      </button>

      <button
        type="button"
        @click="tabPrincipal = 'notificaciones'"
        :class="tabPrincipal === 'notificaciones' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'"
        class="px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer"
      >
        <i class="fa-light fa-bullhorn text-sm text-indigo-500"></i>
        <span>Notificaciones & ChangeLogs</span>
        <span
          v-if="notificaciones.length > 0"
          class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300"
        >
          {{ notificaciones.length }}
        </span>
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

    <!-- VISTA TAB 1: EMPRESAS, MANUALES Y FACTURACIÓN -->
    <div v-if="tabPrincipal === 'empresas'">
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
        :manual-fijos="MANUALES_FIJOS_MINEDU"
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
        @subir-factura="onSubirFactura"
        @notificar-factura="onNotificarFactura"
        @marcar-pagado="onMarcarPagadoFactura"
        @volver="volverAListaEmpresas"
      />
    </div>

    <!-- VISTA TAB 2: NOTIFICACIONES & CHANGELOGS DEL SISTEMA -->
    <div v-else-if="tabPrincipal === 'notificaciones'">
      <AdminNotificacionesTab
        :notificaciones="notificaciones"
        :is-cargando="isCargandoNotificaciones"
        @nueva-notificacion="abrirModalNuevaNotificacion"
        @editar-notificacion="abrirModalEditarNotificacion"
        @eliminar-notificacion="onEliminarNotificacion"
        @aplicar-notificacion="abrirModalAplicarNotificacion"
      />
    </div>

    <!-- MODAL 1: REGISTRAR / EDITAR EMPRESA -->
    <AdminEmpresaModal
      v-model:visible="mostrarModalEmpresa"
      :empresa-a-editar="empresaSeleccionadaEditar"
      :is-guardando="isGuardandoEmpresa"
      @guardar="onGuardarEmpresa"
    />

    <!-- MODAL 2: SUBIR O REEMPLAZAR MANUAL MINEDU CON LOGO -->
    <AdminSubirManualModal
      v-model:visible="mostrarModalSubirManualFijo"
      :empresa="empresaSeleccionadaManuales"
      :manual-fijo="manualFijoSeleccionado"
      :manual-subido="manualesSubidos.find(m => m.clienteIDExclusivo === empresaSeleccionadaManuales?.clienteID && (m.codigoFijo === manualFijoSeleccionado?.codigoFijo || m.titulo.toLowerCase().includes(manualFijoSeleccionado?.codigoFijo?.toLowerCase() || '')))"
      :is-guardando="isGuardandoManual"
      @guardar="onConfirmarGuardadoManual"
    />

    <!-- MODAL 3: AGREGAR / EDITAR NOTIFICACIÓN CON DXHTMLEDITOR -->
    <AdminNotificacionModal
      v-model:visible="mostrarModalNotificacion"
      :notificacion-a-editar="notificacionSeleccionadaEditar"
      :is-guardando="isGuardandoNotificacion"
      @guardar="onGuardarNotificacion"
    />

    <!-- MODAL 4: APLICAR NOTIFICACIÓN A EMPRESAS (DXDATAGRID MULTISELECCIÓN) -->
    <AdminAplicarNotificacionModal
      v-model:visible="mostrarModalAplicarNotificacion"
      :notificacion="notificacionParaAplicar"
      :is-aplicando="isAplicandoNotificacion"
      @aplicar="onAplicarNotificacionAEmpresas"
    />

  </div>
</template>
