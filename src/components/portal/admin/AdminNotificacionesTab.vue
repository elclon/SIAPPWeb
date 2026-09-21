<script setup>
import { DxDataGrid, DxColumn, DxSearchPanel, DxPaging, DxPager } from 'devextreme-vue/data-grid';
import { DxButton } from 'devextreme-vue/button';
import { DxDropDownButton } from 'devextreme-vue/drop-down-button';
import { confirm } from 'devextreme/ui/dialog';

defineProps({
  notificaciones: {
    type: Array,
    required: true
  },
  isCargando: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['nueva-notificacion', 'editar-notificacion', 'eliminar-notificacion', 'aplicar-notificacion']);

const getActions = (notificacion) => {
  return [
    { id: 'aplicar', text: 'Aplicar a Empresas', icon: 'check' },
    { id: 'editar', text: 'Editar Notificación', icon: 'edit' },
    { id: 'eliminar', text: 'Eliminar', icon: 'trash' }
  ];
};

const onActionItemClick = async (e, notificacion) => {
  switch (e.itemData.id) {
    case 'aplicar':
      emit('aplicar-notificacion', notificacion);
      break;
    case 'editar':
      emit('editar-notificacion', notificacion);
      break;
    case 'eliminar': {
      const confirmado = await confirm(
        `¿Está seguro de eliminar permanentemente la notificación "${notificacion.titulo}"?`,
        'Confirmar Eliminación'
      );
      if (confirmado) {
        emit('eliminar-notificacion', notificacion.notificacionID);
      }
      break;
    }
  }
};

const formatearFecha = (fecha) => {
  if (!fecha) return '-';
  try {
    const d = new Date(fecha);
    return d.toLocaleDateString('es-PE', { year: 'numeric', month: 'short', day: '2-digit' });
  } catch (e) {
    return fecha;
  }
};
</script>

<template>
  <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
    
    <!-- ENCABEZADO DEL TAB DE NOTIFICACIONES -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
      <div>
        <div class="flex items-center gap-2">
          <h2 class="text-lg font-bold text-slate-900 dark:text-white">
            Notificaciones del Sistema & ChangeLogs
          </h2>
          <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
            {{ notificaciones.length }} Registros
          </span>
        </div>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Publica mejoras, correcciones y comunicados con formato enriquecido y distribúyelos a las instituciones educativas de alumnos, docentes, administrativos o padres de familia.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <DxButton
          text="Agregar Notificación"
          icon="plus"
          type="default"
          styling-mode="contained"
          @click="$emit('nueva-notificacion')"
        />
      </div>
    </div>

    <!-- DATA GRID DEVEXTREME DE NOTIFICACIONES -->
    <div class="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
      <DxDataGrid
        :data-source="notificaciones"
        :show-borders="false"
        :hover-state-enabled="true"
        :row-alternation-enabled="true"
        key-expr="notificacionID"
      >
        <DxSearchPanel :visible="true" placeholder="Buscar por título, versión o tipo..." />
        <DxPaging :page-size="10" />
        <DxPager :show-page-size-selector="true" :allowed-page-sizes="[10, 20, 50]" :show-info="true" />

        <!-- Columnas en una sola línea estricta (Regla 2.12 @AGENT) -->
        <DxColumn data-field="notificacionID" caption="#" :width="60" alignment="center" />
        <DxColumn data-field="tipoNotificacion" caption="Tipo" :width="160" cell-template="tipoTemplate" />
        <DxColumn data-field="titulo" caption="Título de la Notificación / ChangeLog" cell-template="tituloTemplate" />
        <DxColumn data-field="version" caption="Versión" :width="110" alignment="center" cell-template="versionTemplate" />
        <DxColumn caption="Plataformas" :width="230" cell-template="plataformasTemplate" />
        <DxColumn data-field="totalEmpresasAplicadas" caption="Empresas" :width="120" alignment="center" cell-template="empresasTemplate" />
        <DxColumn data-field="fechaPublicacion" caption="Publicación" :width="110" alignment="center" cell-template="fechaTemplate" />
        <DxColumn data-field="activo" caption="Estado" :width="90" alignment="center" cell-template="estadoTemplate" />
        <DxColumn caption="Acciones" :width="160" alignment="center" cell-template="accionesTemplate" />

        <!-- TEMPLATE: TIPO DE NOTIFICACIÓN -->
        <template #tipoTemplate="{ data }">
          <span
            v-if="data.value === 'MEJORA'"
            class="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800 inline-flex items-center gap-1.5"
          >
            <i class="fa-light fa-sparkles text-emerald-500"></i> Mejora
          </span>
          <span
            v-else-if="data.value === 'CORRECCION'"
            class="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800 inline-flex items-center gap-1.5"
          >
            <i class="fa-light fa-bug-slash text-blue-500"></i> Corrección
          </span>
          <span
            v-else-if="data.value === 'COMUNICADO'"
            class="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800 inline-flex items-center gap-1.5"
          >
            <i class="fa-light fa-bullhorn text-purple-500"></i> Comunicado
          </span>
          <span
            v-else
            class="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800 inline-flex items-center gap-1.5"
          >
            <i class="fa-light fa-screwdriver-wrench text-amber-500"></i> Mantenimiento
          </span>
        </template>

        <!-- TEMPLATE: TÍTULO -->
        <template #tituloTemplate="{ data }">
          <div class="py-1">
            <p class="font-bold text-xs text-slate-800 dark:text-slate-100 line-clamp-1 m-0">
              {{ data.data.titulo }}
            </p>
            <p v-if="data.data.mostrarPopupInicio" class="text-[10px] text-sky-600 dark:text-sky-400 mt-0.5 m-0 flex items-center gap-1 font-medium">
              <i class="fa-light fa-window-restore"></i> Popup al iniciar sesión
            </p>
          </div>
        </template>

        <!-- TEMPLATE: VERSIÓN -->
        <template #versionTemplate="{ data }">
          <span class="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-bold">
            {{ data.value || 'v1.0' }}
          </span>
        </template>

        <!-- TEMPLATE: PLATAFORMAS -->
        <template #plataformasTemplate="{ data }">
          <div class="flex items-center gap-1 flex-wrap">
            <span v-if="data.data.aplicaAlumnos" class="px-1.5 py-0.5 text-[10px] font-semibold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 rounded">
              Alumnos
            </span>
            <span v-if="data.data.aplicaDocentes" class="px-1.5 py-0.5 text-[10px] font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 rounded">
              Docentes
            </span>
            <span v-if="data.data.aplicaAdministrativos" class="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded">
              Admin
            </span>
            <span v-if="data.data.aplicaPadres" class="px-1.5 py-0.5 text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 rounded">
              Padres
            </span>
          </div>
        </template>

        <!-- TEMPLATE: EMPRESAS APLICADAS -->
        <template #empresasTemplate="{ data }">
          <span
            :class="data.value > 0 ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800' : 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-700'"
            class="px-2.5 py-0.5 rounded-full text-xs font-bold border inline-flex items-center gap-1 cursor-pointer hover:bg-indigo-100"
            @click="$emit('aplicar-notificacion', data.data)"
            title="Haga clic para gestionar empresas asignadas"
          >
            <i class="fa-light fa-building-circle-check"></i>
            {{ data.value }} emp.
          </span>
        </template>

        <!-- TEMPLATE: FECHA -->
        <template #fechaTemplate="{ data }">
          <span class="text-xs text-slate-600 dark:text-slate-400">
            {{ formatearFecha(data.value) }}
          </span>
        </template>

        <!-- TEMPLATE: ESTADO -->
        <template #estadoTemplate="{ data }">
          <span
            :class="data.value ? 'bg-emerald-500' : 'bg-slate-300'"
            class="inline-block w-2.5 h-2.5 rounded-full"
            :title="data.value ? 'Activo' : 'Inactivo'"
          ></span>
        </template>

        <!-- TEMPLATE: ACCIONES -->
        <template #accionesTemplate="{ data }">
          <div class="flex items-center justify-center gap-1.5">
            <DxButton
              icon="check"
              hint="Aplicar a Empresas"
              type="default"
              styling-mode="outlined"
              @click="$emit('aplicar-notificacion', data.data)"
            />
            <DxDropDownButton
              text="Opciones"
              icon="more"
              styling-mode="outlined"
              :items="getActions(data.data)"
              :drop-down-options="{ width: 180 }"
              @item-click="(e) => onActionItemClick(e, data.data)"
            />
          </div>
        </template>

      </DxDataGrid>
    </div>

  </div>
</template>
