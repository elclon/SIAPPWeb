<template>
  <div class="space-y-6">
    <!-- TARJETAS RESUMEN EN TIEMPO REAL -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      <!-- Total Conectados -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 m-0 uppercase tracking-wider">
              En Línea Ahora
            </p>
            <h3 class="text-2xl font-black text-slate-900 dark:text-white mt-1 mb-0 flex items-center gap-2">
              {{ resumen.totalUsuariosConectados || 0 }}
              <span class="flex h-3 w-3 relative">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </h3>
          </div>
          <div class="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-xl">
            <i class="fa-light fa-users-viewfinder"></i>
          </div>
        </div>
        <p class="text-[11px] text-slate-400 mt-2 mb-0">
          Sesiones activas WebSocket / SignalR
        </p>
      </div>

      <!-- Instituciones Activas -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 m-0 uppercase tracking-wider">
              Instituciones
            </p>
            <h3 class="text-2xl font-black text-slate-900 dark:text-white mt-1 mb-0">
              {{ resumen.totalInstitucionesActivas || 0 }}
            </h3>
          </div>
          <div class="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950/50 flex items-center justify-center text-sky-600 dark:text-sky-400 text-xl">
            <i class="fa-light fa-buildings"></i>
          </div>
        </div>
        <p class="text-[11px] text-slate-400 mt-2 mb-0">
          Instituciones con tráfico activo
        </p>
      </div>

      <!-- Alumnos en Línea -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 m-0 uppercase tracking-wider">
              Alumnos
            </p>
            <h3 class="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1 mb-0">
              {{ resumen.totalAlumnos || 0 }}
            </h3>
          </div>
          <div class="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xl">
            <i class="fa-light fa-graduation-cap"></i>
          </div>
        </div>
        <p class="text-[11px] text-slate-400 mt-2 mb-0">
          Estudiantes en aula y portal
        </p>
      </div>

      <!-- Docentes & Administrativos -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 m-0 uppercase tracking-wider">
              Docentes / Admin
            </p>
            <h3 class="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 mb-0">
              {{ (resumen.totalDocentes || 0) + (resumen.totalAdministrativos || 0) }}
            </h3>
          </div>
          <div class="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400 text-xl">
            <i class="fa-light fa-chalkboard-user"></i>
          </div>
        </div>
        <p class="text-[11px] text-slate-400 mt-2 mb-0">
          {{ resumen.totalDocentes || 0 }} docentes | {{ resumen.totalAdministrativos || 0 }} admin
        </p>
      </div>

    </div>

    <!-- PANEL PRINCIPAL DE TABLA -->
    <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      
      <!-- ENCABEZADO Y CONTROLES DE FILTRADO -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div class="flex items-center gap-2">
            <h2 class="text-lg font-bold text-slate-900 dark:text-white m-0">
              Usuarios Conectados en Tiempo Real
            </h2>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              {{ resumen.usuarios?.length || 0 }} Activos
            </span>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-0">
            Monitoreo en vivo de los usuarios conectados por institución educativa, rol y sesión en tiempo real.
          </p>
        </div>

        <div class="flex items-center gap-3 flex-wrap">
          <!-- Filtro Institución -->
          <div class="w-56">
            <DxSelectBox
              :items="comboInstituciones"
              display-expr="text"
              value-expr="id"
              :value="filtroInstitucion"
              placeholder="Filtrar por Institución"
              :drop-down-options="{ container: 'body' }"
              @value-changed="(e) => { filtroInstitucion = e.value; cargarConectados(); }"
            />
          </div>

          <!-- Filtro Rol -->
          <div class="w-44">
            <DxSelectBox
              :items="comboRoles"
              display-expr="text"
              value-expr="id"
              :value="filtroRol"
              placeholder="Filtrar por Rol"
              :drop-down-options="{ container: 'body' }"
              @value-changed="(e) => { filtroRol = e.value; cargarConectados(); }"
            />
          </div>

          <!-- Switch Auto-Refresco -->
          <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
            <span class="text-slate-600 dark:text-slate-300 font-medium">Auto (15s):</span>
            <DxSwitch
              :value="autoRefresh"
              :switched-on-text="''"
              :switched-off-text="''"
              @value-changed="onAutoRefreshChanged"
            />
          </div>

          <!-- Botón Refrescar -->
          <DxButton
            text="Actualizar"
            :icon="isCargando ? 'fa-light fa-spinner fa-spin' : 'refresh'"
            type="normal"
            styling-mode="outlined"
            :disabled="isCargando"
            @click="cargarConectados"
          />
        </div>
      </div>

      <!-- RESUMEN EN MINIATURA POR INSTITUCIÓN (PILLS) -->
      <div v-if="resumen.porInstitucion && resumen.porInstitucion.length > 0" class="flex items-center gap-2 flex-wrap py-1">
        <span class="text-xs font-semibold text-slate-400 mr-1">Tráfico por Sede:</span>
        <button
          v-for="inst in resumen.porInstitucion"
          :key="inst.codigoConexion"
          type="button"
          @click="filtrarPorSede(inst.codigoConexion)"
          :class="filtroInstitucion === inst.codigoConexion ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'"
          class="px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer border-0"
        >
          <span>{{ inst.institucionNombre }}</span>
          <span class="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-white/20 text-current">
            {{ inst.totalConectados }}
          </span>
        </button>
      </div>

      <!-- DATA GRID DEVEXTREME DE USUARIOS CONECTADOS -->
      <DxDataGrid
        :data-source="resumen.usuarios || []"
        :show-borders="true"
        :hover-state-enabled="true"
        :row-alternation-enabled="false"
        key-expr="connectionId"
        class="overflow-hidden"
      >
        <DxSearchPanel :visible="true" placeholder="Buscar por nombre, DNI, institución o IP..." :width="280" />
        <DxPaging :page-size="15" />
        <DxPager :show-page-size-selector="true" :allowed-page-sizes="[10, 15, 30, 50]" :show-info="true" />

        <!-- Columnas en una sola línea estricta (Regla 2.12 @AGENT) -->
        <DxColumn data-field="institucionNombre" caption="Institución Educativa" cell-template="institucionTemplate" />
        <DxColumn data-field="nombreCompleto" caption="Usuario / Documento" cell-template="usuarioTemplate" />
        <DxColumn data-field="rol" caption="Rol / Plataforma" :width="160" alignment="center" cell-template="rolTemplate" />
        <DxColumn data-field="navegador" caption="Dispositivo / IP" :width="220" cell-template="dispositivoTemplate" />
        <DxColumn data-field="fechaConexion" caption="Conexión" :width="130" alignment="center" cell-template="tiempoTemplate" />
        <DxColumn data-field="connectionId" caption="Estado" :width="100" alignment="center" cell-template="estadoTemplate" />

        <!-- TEMPLATE: INSTITUCIÓN -->
        <template #institucionTemplate="{ data }">
          <div class="py-1">
            <strong class="text-slate-900 dark:text-white block text-xs">
              {{ data.data.institucionNombre || 'SIAPP Cloud' }}
            </strong>
            <span v-if="data.data.subdominio" class="text-[11px] text-sky-600 dark:text-sky-400 font-mono block">
              {{ data.data.subdominio }}
            </span>
          </div>
        </template>

        <!-- TEMPLATE: USUARIO -->
        <template #usuarioTemplate="{ data }">
          <div class="py-1 flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-200 uppercase flex-shrink-0">
              {{ (data.data.nombreCompleto || 'U')[0] }}
            </div>
            <div>
              <p class="font-bold text-xs text-slate-800 dark:text-slate-100 m-0">
                {{ data.data.nombreCompleto }}
              </p>
              <p class="text-[11px] text-slate-400 font-mono m-0">
                Doc: {{ data.data.nroDocumento || 'S/D' }}
              </p>
            </div>
          </div>
        </template>

        <!-- TEMPLATE: ROL -->
        <template #rolTemplate="{ data }">
          <span
            v-if="data.value === 'ALUMNO'"
            class="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800 inline-flex items-center gap-1.5"
          >
            <i class="fa-light fa-graduation-cap text-indigo-500"></i> Alumno
          </span>
          <span
            v-else-if="data.value === 'DOCENTE'"
            class="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800 inline-flex items-center gap-1.5"
          >
            <i class="fa-light fa-chalkboard-user text-emerald-500"></i> Docente
          </span>
          <span
            v-else-if="data.value === 'ADMINISTRATIVO'"
            class="px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800 inline-flex items-center gap-1.5"
          >
            <i class="fa-light fa-briefcase text-sky-500"></i> Admin
          </span>
          <span
            v-else-if="data.value === 'SUPERADMIN'"
            class="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800 inline-flex items-center gap-1.5"
          >
            <i class="fa-light fa-shield-check text-purple-500"></i> SuperAdmin
          </span>
          <span
            v-else
            class="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800 inline-flex items-center gap-1.5"
          >
            {{ data.value }}
          </span>
        </template>

        <!-- TEMPLATE: DISPOSITIVO E IP -->
        <template #dispositivoTemplate="{ data }">
          <div class="py-1">
            <span class="text-xs font-medium text-slate-700 dark:text-slate-200 flex items-center gap-1">
              <i class="fa-light fa-desktop text-slate-400"></i>
              {{ data.data.navegador || data.data.plataforma || 'Web' }}
            </span>
            <span class="text-[10px] text-slate-400 font-mono block">
              IP: {{ data.data.ipAddress || '127.0.0.1' }} ({{ data.data.plataforma || 'Web' }})
            </span>
          </div>
        </template>

        <!-- TEMPLATE: TIEMPO CONECTADO -->
        <template #tiempoTemplate="{ data }">
          <div class="py-1 text-center">
            <span class="text-xs font-bold font-mono text-slate-800 dark:text-slate-200 block">
              {{ formatHora(data.data.fechaConexion) }}
            </span>
            <span class="text-[10px] text-slate-400 font-mono block">
              Hace {{ data.data.minutosConectado }} min
            </span>
          </div>
        </template>

        <!-- TEMPLATE: ESTADO EN LÍNEA -->
        <template #estadoTemplate>
          <div class="flex items-center justify-center gap-1.5">
            <span class="flex h-2.5 w-2.5 relative">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400">En línea</span>
          </div>
        </template>

      </DxDataGrid>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { DxDataGrid, DxColumn, DxSearchPanel, DxPaging, DxPager } from 'devextreme-vue/data-grid';
import { DxSelectBox } from 'devextreme-vue/select-box';
import { DxSwitch } from 'devextreme-vue/switch';
import { DxButton } from 'devextreme-vue/button';
import apiClient from '@/api/axiosConfig';
import { showError } from '@/services/notification';
import { getErrorMessage } from '@/services/errorHandler';

const props = defineProps({
  empresas: {
    type: Array,
    default: () => []
  }
});

const isCargando = ref(false);
const autoRefresh = ref(true);
let timerInterval = null;

const filtroInstitucion = ref('TODAS');
const filtroRol = ref('TODOS');

const resumen = ref({
  totalUsuariosConectados: 0,
  totalInstitucionesActivas: 0,
  totalAlumnos: 0,
  totalDocentes: 0,
  totalAdministrativos: 0,
  porInstitucion: [],
  usuarios: []
});

const comboRoles = [
  { id: 'TODOS', text: '👥 Todos los Roles' },
  { id: 'ALUMNO', text: '🎓 Alumnos' },
  { id: 'DOCENTE', text: '👨‍🏫 Docentes' },
  { id: 'ADMINISTRATIVO', text: '🏢 Administrativos' },
  { id: 'SUPERADMIN', text: '🛡️ SuperAdmin' }
];

const comboInstituciones = computed(() => {
  const items = [{ id: 'TODAS', text: '🏫 Todas las Instituciones' }];

  if (props.empresas && props.empresas.length > 0) {
    props.empresas.forEach(emp => {
      const cod = (emp.codigoConexion || emp.subdominioSIAPP || '').trim();
      const idVal = cod || emp.nombreComercial;
      if (idVal && !items.some(i => i.id.toLowerCase() === idVal.toLowerCase())) {
        items.push({
          id: idVal,
          text: emp.nombreComercial || idVal
        });
      }
    });
  }

  // Agregar las detectadas del resumen si no están
  if (resumen.value.porInstitucion) {
    resumen.value.porInstitucion.forEach(inst => {
      const cod = (inst.codigoConexion || '').trim();
      if (cod && !items.some(i => i.id.toLowerCase() === cod.toLowerCase())) {
        items.push({
          id: cod,
          text: inst.institucionNombre || cod
        });
      }
    });
  }

  return items;
});

const formatHora = (fechaStr) => {
  if (!fechaStr) return '-';
  try {
    const d = new Date(fechaStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return fechaStr;
  }
};

const cargarConectados = async () => {
  isCargando.value = true;
  try {
    const response = await apiClient.get('/portal-cliente/admin/usuarios-conectados', {
      params: {
        codigoConexion: filtroInstitucion.value !== 'TODAS' ? filtroInstitucion.value : undefined,
        rol: filtroRol.value !== 'TODOS' ? filtroRol.value : undefined
      }
    });

    if (response.data) {
      resumen.value = response.data;
    }
  } catch (error) {
    console.error('Error al cargar usuarios conectados:', error);
    showError(getErrorMessage(error, 'Error al consultar usuarios conectados en tiempo real'));
  } finally {
    isCargando.value = false;
  }
};

const filtrarPorSede = (codigo) => {
  if (filtroInstitucion.value.toLowerCase() === (codigo || '').toLowerCase()) {
    filtroInstitucion.value = 'TODAS';
  } else {
    filtroInstitucion.value = codigo;
  }
  cargarConectados();
};

const onAutoRefreshChanged = (e) => {
  autoRefresh.value = e.value;
  configurarIntervalo();
};

const configurarIntervalo = () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  if (autoRefresh.value) {
    timerInterval = setInterval(() => {
      cargarConectados();
    }, 15000); // 15 segundos
  }
};

onMounted(() => {
  cargarConectados();
  configurarIntervalo();
});

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
});
</script>
