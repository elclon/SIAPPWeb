<script setup>
import { DxDataGrid, DxColumn, DxSearchPanel, DxPaging, DxPager } from 'devextreme-vue/data-grid';
import { DxButton } from 'devextreme-vue/button';

defineProps({
  empresas: {
    type: Array,
    required: true
  },
  manualesSubidos: {
    type: Array,
    required: true
  },
  totalManualesFijos: {
    type: Number,
    default: 7
  }
});

defineEmits(['nueva-empresa', 'ver-manuales']);

const contarManualesEmpresa = (clienteId, manuales) => {
  return manuales.filter(m => m.clienteIDExclusivo === clienteId).length;
};
</script>

<template>
  <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
      <div>
        <h2 class="text-lg font-bold text-slate-900 dark:text-white">
          Directorio de Instituciones Educativas Clientes
        </h2>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Cada empresa tiene su propia carpeta de manuales oficiales MINEDU, su enlace institucional para auditoría de alumnos y sus condiciones contractuales.
        </p>
      </div>

      <DxButton
        text="Agregar Nueva Empresa"
        icon="plus"
        type="default"
        styling-mode="contained"
        @click="$emit('nueva-empresa')"
      />
    </div>

    <!-- DATA GRID DE DEVEXTREME: EMPRESAS CLIENTES -->
    <DxDataGrid
      :data-source="empresas"
      :show-borders="true"
      :row-alternation-enabled="true"
      :hover-state-enabled="true"
      key-expr="clienteID"
      class="rounded-xl overflow-hidden"
    >
      <DxSearchPanel :visible="true" placeholder="Buscar por institución, RUC o enlace..." :width="280" />
      <DxPaging :page-size="10" />
      <DxPager :show-page-size-selector="true" :allowed-page-sizes="[5, 10, 20]" :show-info="true" />

      <!-- Regla 2.12: Columnas declaradas estrictamente en una sola línea -->
      <DxColumn data-field="nombreComercial" caption="Institución" cell-template="institucionTemplate" />
      <DxColumn data-field="ruc" caption="RUC" :width="130" alignment="center" cell-template="rucTemplate" />
      <DxColumn data-field="subdominioSIAPP" caption="Subdominio SIAPP" :width="200" cell-template="subdominioTemplate" />
      <DxColumn data-field="codigoConexion" caption="Código de Enlace" :width="140" alignment="center" cell-template="codigoTemplate" />
      <DxColumn data-field="tipoCobro" caption="Modalidad" :width="130" cell-template="modalidadTemplate" />
      <DxColumn caption="Tarifa / Monto" :width="140" alignment="right" cell-template="tarifaTemplate" />
      <DxColumn caption="Contacto" :width="200" cell-template="contactoTemplate" />
      <DxColumn caption="Manuales MINEDU" :width="210" alignment="center" cell-template="accionesTemplate" />

      <!-- Templates personalizados -->
      <template #institucionTemplate="{ data }">
        <div>
          <strong class="text-slate-900 dark:text-white block text-sm">{{ data.nombreComercial }}</strong>
          <span class="text-[11px] text-slate-400 block truncate max-w-[220px]">{{ data.razonSocial }}</span>
        </div>
      </template>

      <template #rucTemplate="{ data }">
        <span class="font-mono font-bold text-slate-700 dark:text-slate-200">{{ data.ruc }}</span>
      </template>

      <template #subdominioTemplate="{ data }">
        <a :href="'https://' + data.subdominioSIAPP" target="_blank" class="text-blue-600 hover:underline font-mono text-xs">
          {{ data.subdominioSIAPP }}
        </a>
      </template>

      <template #codigoTemplate="{ data }">
        <span class="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono font-bold text-[11px] text-indigo-600 dark:text-indigo-400">
          {{ data.codigoConexion || 'default' }}
        </span>
      </template>

      <template #modalidadTemplate="{ data }">
        <span :class="data.tipoCobro === 'POR_ALUMNO' ? 'text-indigo-600 font-semibold' : 'text-slate-600 font-semibold'">
          {{ data.tipoCobro === 'POR_ALUMNO' ? 'Por Alumno' : 'Monto Fijo' }}
        </span>
      </template>

      <template #tarifaTemplate="{ data }">
        <span class="font-mono font-bold">
          {{ data.tipoCobro === 'POR_ALUMNO' ? 'S/ ' + (data.tarifaPorAlumno ? data.tarifaPorAlumno.toFixed(2) : '4.00') : 'S/ ' + (data.montoFijoPactado ? data.montoFijoPactado.toFixed(2) : '1,500.00') }}
        </span>
      </template>

      <template #contactoTemplate="{ data }">
        <div>
          <span class="block font-semibold text-xs text-slate-800 dark:text-slate-200">{{ data.contactoPrincipal }}</span>
          <span class="text-[10px] text-slate-400 truncate block">{{ data.emailContacto }}</span>
        </div>
      </template>

      <template #accionesTemplate="{ data }">
        <DxButton
          :text="'Manuales (' + contarManualesEmpresa(data.clienteID, manualesSubidos) + '/' + totalManualesFijos + ')'"
          icon="folder"
          type="default"
          styling-mode="outlined"
          @click="$emit('ver-manuales', data)"
        />
      </template>
    </DxDataGrid>
  </div>
</template>
