<script setup>
import { computed } from 'vue';

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

    <!-- TABLA DE AUDITORÍA Y FACTURACIÓN -->
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

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th class="p-3">Institución Cliente</th>
              <th class="p-3">Estado de Enlace</th>
              <th class="p-3">Modalidad</th>
              <th class="p-3 text-center">Alumnos Activos</th>
              <th class="p-3">Tarifa</th>
              <th class="p-3 font-mono">Total Facturable</th>
              <th class="p-3 font-mono text-amber-600">Detracción (12%)</th>
              <th class="p-3 font-mono text-blue-600">Neto Comercial</th>
              <th class="p-3 text-center">Estado Emisión</th>
              <th class="p-3 text-right">Acción</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            <tr v-for="item in calculosClientes" :key="item.clienteID" class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
              <td class="p-3">
                <span class="font-bold text-slate-900 dark:text-white block">{{ item.nombreComercial }}</span>
                <span class="text-[10px] text-slate-400 font-mono">RUC: {{ item.ruc }} &bull; {{ item.subdominioSIAPP }}</span>
              </td>
              <td class="p-3">
                <span
                  :class="item.estadoConexionBD === 'CONECTADO' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300' : item.estadoConexionBD === 'NO_REQUERIDO_FIJO' ? 'bg-slate-100 text-slate-700 border-slate-300' : 'bg-red-100 text-red-800 border-red-300'"
                  class="px-2 py-0.5 rounded text-[10px] font-bold border"
                >
                  {{ item.estadoConexionBD === 'CONECTADO' ? 'Sincronizado' : item.estadoConexionBD === 'NO_REQUERIDO_FIJO' ? 'Tarifa Fija' : 'Pendiente' }}
                </span>
                <span class="text-[10px] text-slate-400 block truncate max-w-[150px]">{{ item.mensajeConexion }}</span>
              </td>
              <td class="p-3 font-semibold">
                {{ item.tipoCobro === 'POR_ALUMNO' ? 'Por Alumno' : 'Tarifa Fija' }}
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
              <td class="p-3 font-mono font-semibold text-amber-600">
                S/ {{ item.montoDetraccion.toFixed(2) }}
              </td>
              <td class="p-3 font-mono font-bold text-blue-600">
                S/ {{ item.montoNeto.toFixed(2) }}
              </td>
              <td class="p-3 text-center">
                <span
                  v-if="item.yaFacturadoEnPeriodo"
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
              </td>
              <td class="p-3 text-right">
                <button
                  v-if="!item.yaFacturadoEnPeriodo"
                  type="button"
                  @click="$emit('emitir-cobranza', item)"
                  class="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] shadow-xs"
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
</template>
