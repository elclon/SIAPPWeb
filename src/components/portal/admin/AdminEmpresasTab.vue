<script setup>
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

const contarManualesEmpresa = (clienteId, manualesSubidos) => {
  return manualesSubidos.filter(m => m.clienteIDExclusivo === clienteId).length;
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

      <button
        type="button"
        @click="$emit('nueva-empresa')"
        class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center gap-1.5 self-start sm:self-auto"
      >
        <i class="fa-light fa-plus"></i>
        <span>Agregar Nueva Empresa</span>
      </button>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs">
        <thead class="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
          <tr>
            <th class="p-3">Institución</th>
            <th class="p-3">RUC</th>
            <th class="p-3">Subdominio SIAPP</th>
            <th class="p-3">Código de Enlace</th>
            <th class="p-3">Modalidad Cobro</th>
            <th class="p-3">Tarifa / Monto</th>
            <th class="p-3">Contacto</th>
            <th class="p-3 text-center">Manuales MINEDU</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
          <tr v-for="emp in empresas" :key="emp.clienteID" class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
            <td class="p-3">
              <strong class="text-slate-900 dark:text-white block text-sm">{{ emp.nombreComercial }}</strong>
              <span class="text-[10px] text-slate-400 block truncate max-w-[200px]">{{ emp.razonSocial }}</span>
            </td>
            <td class="p-3 font-mono font-bold">{{ emp.ruc }}</td>
            <td class="p-3">
              <a :href="'https://' + emp.subdominioSIAPP" target="_blank" class="text-blue-600 hover:underline font-mono">
                {{ emp.subdominioSIAPP }}
              </a>
            </td>
            <td class="p-3">
              <span class="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono font-bold text-[11px] text-indigo-600 dark:text-indigo-400">
                {{ emp.codigoConexion || 'default' }}
              </span>
            </td>
            <td class="p-3">
              <span :class="emp.tipoCobro === 'POR_ALUMNO' ? 'text-indigo-600 font-semibold' : 'text-slate-600 font-semibold'">
                {{ emp.tipoCobro === 'POR_ALUMNO' ? 'Por Alumno' : 'Monto Fijo' }}
              </span>
            </td>
            <td class="p-3 font-mono font-bold">
              {{ emp.tipoCobro === 'POR_ALUMNO' ? 'S/ ' + (emp.tarifaPorAlumno ? emp.tarifaPorAlumno.toFixed(2) : '4.00') : 'S/ ' + (emp.montoFijoPactado ? emp.montoFijoPactado.toFixed(2) : '1,500.00') }}
            </td>
            <td class="p-3">
              <span class="block font-semibold">{{ emp.contactoPrincipal }}</span>
              <span class="text-[10px] text-slate-400">{{ emp.emailContacto }}</span>
            </td>
            <td class="p-3 text-center">
              <button
                type="button"
                @click="$emit('ver-manuales', emp)"
                class="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-600 hover:text-white border border-blue-200 dark:border-blue-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5 mx-auto shadow-xs"
              >
                <i class="fa-light fa-folder-arrow-up"></i>
                <span>Manuales MINEDU ({{ contarManualesEmpresa(emp.clienteID, manualesSubidos) }}/{{ totalManualesFijos }})</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
