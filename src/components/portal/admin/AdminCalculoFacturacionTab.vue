<script setup>
import { computed } from 'vue';
import { DxDataGrid, DxColumn, DxSearchPanel, DxPaging, DxPager } from 'devextreme-vue/data-grid';
import { DxButton } from 'devextreme-vue/button';

const props = defineProps({
  calculosClientes: {
    type: Array,
    required: true
  },
  filtroMes: {
    type: Number,
    required: true
  },
  filtroAnio: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['update:filtroMes', 'update:filtroAnio', 'cambiar-periodo', 'emitir-cobranza']);

const mesLocal = computed({
  get: () => props.filtroMes,
  set: (val) => {
    emit('update:filtroMes', val);
    emit('cambiar-periodo');
  }
});

const anioLocal = computed({
  get: () => props.filtroAnio,
  set: (val) => {
    emit('update:filtroAnio', val);
    emit('cambiar-periodo');
  }
});

const totalFacturableMes = computed(() => {
  return props.calculosClientes.reduce((acc, c) => acc + c.montoTotal, 0);
});

const totalDetraccionesMes = computed(() => {
  return props.calculosClientes.reduce((acc, c) => acc + c.montoDetraccion, 0);
});

const totalNetoComercialMes = computed(() => {
  return props.calculosClientes.reduce((acc, c) => acc + c.montoNeto, 0);
});
</script>

<template>
  <div class="space-y-6">

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

    <!-- DATA GRID DE DEVEXTREME: AUDITORÍA Y FACTURACIÓN -->
    <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 class="text-lg font-bold text-slate-900 dark:text-white">
            Auditoría de Matrículas en Tiempo Real
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Consulta automatizada de alumnos matriculados por institución para el cálculo y liquidación del período.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <select
            v-model="mesLocal"
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
            v-model="anioLocal"
            class="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
          >
            <option :value="2025">2025</option>
            <option :value="2026">2026</option>
            <option :value="2027">2027</option>
          </select>
        </div>
      </div>

      <!-- DxDataGrid con columnas en una sola línea (Regla 2.12) -->
      <DxDataGrid
        :data-source="calculosClientes"
        :show-borders="true"
        :row-alternation-enabled="true"
        :hover-state-enabled="true"
        key-expr="clienteID"
        class="rounded-xl overflow-hidden"
      >
        <DxSearchPanel :visible="true" placeholder="Filtrar clientes..." :width="250" />
        <DxPaging :page-size="10" />
        <DxPager :show-page-size-selector="true" :allowed-page-sizes="[5, 10, 20]" :show-info="true" />

        <!-- Regla 2.12: Cada DxColumn completa en una sola línea horizontal -->
        <DxColumn data-field="nombreComercial" caption="Institución Cliente" cell-template="institucionTemplate" />
        <DxColumn data-field="estadoConexionBD" caption="Estado de Enlace" :width="160" cell-template="estadoTemplate" />
        <DxColumn data-field="tipoCobro" caption="Modalidad" :width="120" cell-template="modalidadTemplate" />
        <DxColumn data-field="alumnosDetectados" caption="Alumnos Activos" :width="130" alignment="center" cell-template="alumnosTemplate" />
        <DxColumn caption="Tarifa" :width="110" alignment="right" cell-template="tarifaTemplate" />
        <DxColumn data-field="montoTotal" caption="Total Facturable" :width="130" alignment="right" cell-template="totalTemplate" />
        <DxColumn data-field="montoDetraccion" caption="Detracción (12%)" :width="130" alignment="right" cell-template="detraccionTemplate" />
        <DxColumn data-field="montoNeto" caption="Neto Comercial" :width="130" alignment="right" cell-template="netoTemplate" />
        <DxColumn caption="Estado Emisión" :width="130" alignment="center" cell-template="emisionTemplate" />
        <DxColumn caption="Acción" :width="140" alignment="center" cell-template="accionTemplate" />

        <template #institucionTemplate="{ data }">
          <div>
            <span class="font-bold text-slate-900 dark:text-white block text-xs">{{ data.nombreComercial }}</span>
            <span class="text-[10px] text-slate-400 font-mono">RUC: {{ data.ruc }}</span>
          </div>
        </template>

        <template #estadoTemplate="{ data }">
          <span
            :class="data.estadoConexionBD === 'CONECTADO' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300' : data.estadoConexionBD === 'NO_REQUERIDO_FIJO' ? 'bg-slate-100 text-slate-700 border-slate-300' : 'bg-red-100 text-red-800 border-red-300'"
            class="px-2 py-0.5 rounded text-[10px] font-bold border"
          >
            {{ data.estadoConexionBD === 'CONECTADO' ? 'Sincronizado' : data.estadoConexionBD === 'NO_REQUERIDO_FIJO' ? 'Tarifa Fija' : 'Pendiente' }}
          </span>
        </template>

        <template #modalidadTemplate="{ data }">
          <span class="text-xs font-semibold">
            {{ data.tipoCobro === 'POR_ALUMNO' ? 'Por Alumno' : 'Tarifa Fija' }}
          </span>
        </template>

        <template #alumnosTemplate="{ data }">
          <span class="font-bold font-mono text-xs">
            {{ data.tipoCobro === 'POR_ALUMNO' ? data.alumnosDetectados : '—' }}
          </span>
        </template>

        <template #tarifaTemplate="{ data }">
          <span class="font-mono text-xs">
            {{ data.tipoCobro === 'POR_ALUMNO' ? 'S/ ' + data.tarifaAplicada.toFixed(2) : 'Fijo' }}
          </span>
        </template>

        <template #totalTemplate="{ data }">
          <span class="font-mono font-bold text-xs text-slate-900 dark:text-white">
            S/ {{ data.montoTotal.toFixed(2) }}
          </span>
        </template>

        <template #detraccionTemplate="{ data }">
          <span class="font-mono font-semibold text-xs text-amber-600">
            S/ {{ data.montoDetraccion.toFixed(2) }}
          </span>
        </template>

        <template #netoTemplate="{ data }">
          <span class="font-mono font-bold text-xs text-blue-600">
            S/ {{ data.montoNeto.toFixed(2) }}
          </span>
        </template>

        <template #emisionTemplate="{ data }">
          <span
            v-if="data.yaFacturadoEnPeriodo"
            class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold"
          >
            Emitido
          </span>
          <span
            v-else
            class="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-semibold"
          >
            Por Emitir
          </span>
        </template>

        <template #accionTemplate="{ data }">
          <DxButton
            v-if="!data.yaFacturadoEnPeriodo"
            text="Emitir Cobranza"
            type="default"
            styling-mode="contained"
            @click="$emit('emitir-cobranza', data)"
          />
          <span v-else class="text-xs text-slate-400 italic font-semibold">
            Registrado
          </span>
        </template>
      </DxDataGrid>
    </div>

  </div>
</template>
