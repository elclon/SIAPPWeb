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
import dialogService from '@/services/dialogService';

// Estado de Autenticación de SuperAdmin
const sesionAdmin = ref(null);

// Pestaña Principal Activa ('empresas' | 'notificaciones')
const tabPrincipal = ref('empresas');

// Vista de detalle contextual para una empresa seleccionada (null = ver lista de empresas)
const empresaSeleccionadaManuales = ref(null);
const empresaSeleccionadaFacturacion = ref(null);

// Período de Consulta para Conteo y Facturación
const anioActual = new Date().getFullYear();
const mesActual = new Date().getMonth() + 1;
const filtroAnio = ref(anioActual);
const filtroMes = ref(mesActual);

// Estados de Carga
const isCalculando = ref(false);
const isCargandoNotificaciones = ref(false);

// Datos del Sistema
const empresas = ref([]);
const calculosClientes = ref([]);
const facturas = ref([]);
const manualesSubidos = ref([]);
const notificaciones = ref([]);

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
  notificaciones.value = [];
  showSuccess('Sesión administrativa cerrada.');
};

// Acciones de Navegación y Apertura de Modales con dialogService
const abrirModalNuevaEmpresa = () => {
  dialogService.open(AdminEmpresaModal, {
    empresaAEditar: null
  }, {
    title: 'Agregar Nueva Institución Educativa',
    width: '780px',
    height: 'auto',
    maxHeight: '90vh',
    onClose: (dialogResult) => {
      if (dialogResult && !dialogResult.canceled) {
        cargarEmpresas();
        sincronizarAlumnos();
      }
    }
  });
};

const abrirModalEditarEmpresa = (empresa) => {
  dialogService.open(AdminEmpresaModal, {
    empresaAEditar: empresa
  }, {
    title: `Editar Institución: ${empresa.nombreComercial}`,
    width: '780px',
    height: 'auto',
    maxHeight: '90vh',
    onClose: (dialogResult) => {
      if (dialogResult && !dialogResult.canceled) {
        cargarEmpresas();
        sincronizarAlumnos();
      }
    }
  });
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
  const yaSubido = manualesSubidos.value.find(
    m => m.clienteIDExclusivo === empresaSeleccionadaManuales.value?.clienteID &&
    (m.codigoFijo === manualFijo?.codigoFijo || m.titulo.toLowerCase().includes(manualFijo?.codigoFijo?.toLowerCase() || ''))
  );

  dialogService.open(AdminSubirManualModal, {
    empresa: empresaSeleccionadaManuales.value,
    manualFijo: manualFijo,
    manualSubido: yaSubido
  }, {
    title: `Subir Manual MINEDU - ${manualFijo?.tituloBase || ''}`,
    width: '700px',
    height: 'auto',
    maxHeight: '85vh',
    onClose: (dialogResult) => {
      if (dialogResult && !dialogResult.canceled) {
        cargarManuales();
      }
    }
  });
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

// Handlers de Notificaciones y ChangeLogs con dialogService (dialogResult)
const abrirModalNuevaNotificacion = () => {
  dialogService.open(AdminNotificacionModal, {
    notificacionAEditar: null
  }, {
    title: 'Agregar Nueva Notificación / ChangeLog',
    width: '900px',
    height: 'auto',
    maxHeight: '92vh',
    onClose: (dialogResult) => {
      if (dialogResult && !dialogResult.canceled) {
        cargarNotificaciones();
      }
    }
  });
};

const abrirModalEditarNotificacion = (notif) => {
  dialogService.open(AdminNotificacionModal, {
    notificacionAEditar: notif
  }, {
    title: 'Editar Notificación / ChangeLog',
    width: '900px',
    height: 'auto',
    maxHeight: '92vh',
    onClose: (dialogResult) => {
      if (dialogResult && !dialogResult.canceled) {
        cargarNotificaciones();
      }
    }
  });
};

const abrirModalAplicarNotificacion = (notif) => {
  dialogService.open(AdminAplicarNotificacionModal, {
    notificacion: notif
  }, {
    title: `Aplicar Notificación: ${notif.titulo}`,
    width: '850px',
    height: 'auto',
    maxHeight: '85vh',
    onClose: (dialogResult) => {
      if (dialogResult && !dialogResult.canceled) {
        cargarNotificaciones();
      }
    }
  });
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

const onEliminarNotificacion = async (notificacionID) => {
  try {
    await apiClient.delete(`/portal-cliente/admin/notificaciones/${notificacionID}`);
    showSuccess('Notificación eliminada correctamente.');
    await cargarNotificaciones();
  } catch (error) {
    showError(getErrorMessage(error, 'Error al eliminar la notificación'));
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
        v-model:filtro-mes="filtroMes"
        v-model:filtro-anio="filtroAnio"
        @cambiar-periodo="sincronizarAlumnos"
        @factura-subida="cargarFacturas"
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

  </div>
</template>
