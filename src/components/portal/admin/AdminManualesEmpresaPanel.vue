<script setup>
defineProps({
  empresa: {
    type: Object,
    required: true
  },
  manualesFijos: {
    type: Array,
    required: true
  },
  manualesSubidos: {
    type: Array,
    required: true
  }
});

defineEmits(['volver', 'subir-manual']);

const obtenerManualSubido = (codigoFijo, clienteId, subidos) => {
  return subidos.find(
    m => m.clienteIDExclusivo === clienteId && (m.codigoFijo === codigoFijo || m.titulo.toLowerCase().includes(codigoFijo.toLowerCase()))
  );
};
</script>

<template>
  <div class="space-y-6 animate-in fade-in duration-200">
    
    <!-- BARRA SUPERIOR DEL PANEL DE MANUALES DE LA EMPRESA -->
    <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <button
          type="button"
          @click="$emit('volver')"
          class="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-all shrink-0"
          title="Volver al Directorio de Empresas"
        >
          <i class="fa-light fa-arrow-left text-base"></i>
        </button>
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-heading">
              Carpeta de Manuales MINEDU: {{ empresa.nombreComercial }}
            </h2>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200">
              RUC: {{ empresa.ruc }}
            </span>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Sube los manuales oficiales de cada módulo con la carátula y logo exclusivo de <strong>{{ empresa.nombreComercial }}</strong> para su expediente de licenciamiento.
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="$emit('volver')"
          class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all flex items-center gap-1.5"
        >
          <i class="fa-light fa-building-columns"></i>
          <span>Ver Otras Empresas</span>
        </button>
      </div>
    </div>

    <!-- LISTA DE LOS MANUALES FIJOS EXIGIDOS POR MINEDU -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="manualFijo in manualesFijos"
        :key="manualFijo.codigoFijo"
        class="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between gap-4"
      >
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
              <i :class="['fa-light', manualFijo.icono]"></i>
              <span>{{ manualFijo.categoriaNombre }}</span>
            </span>

            <!-- Badge de Estado (Subido vs Pendiente) -->
            <span
              v-if="obtenerManualSubido(manualFijo.codigoFijo, empresa.clienteID, manualesSubidos)"
              class="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold flex items-center gap-1"
            >
              <i class="fa-light fa-circle-check"></i>
              <span>Subido con Logo</span>
            </span>
            <span
              v-else
              class="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold flex items-center gap-1"
            >
              <i class="fa-light fa-clock"></i>
              <span>Pendiente de Subir</span>
            </span>
          </div>

          <!-- Título del Manual con el Nombre de la Empresa -->
          <h3 class="text-sm font-bold text-slate-900 dark:text-white leading-snug">
            {{ manualFijo.tituloBase }} (Logo {{ empresa.nombreComercial }})
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {{ manualFijo.descripcion }}
          </p>

          <!-- Si ya está subido, mostrar metadatos -->
          <div
            v-if="obtenerManualSubido(manualFijo.codigoFijo, empresa.clienteID, manualesSubidos)"
            class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] font-mono text-slate-600 dark:text-slate-300 flex items-center justify-between"
          >
            <span>v{{ obtenerManualSubido(manualFijo.codigoFijo, empresa.clienteID, manualesSubidos).version }} &bull; {{ obtenerManualSubido(manualFijo.codigoFijo, empresa.clienteID, manualesSubidos).tamanoArchivoMB }} MB</span>
            <span>Publicado: {{ obtenerManualSubido(manualFijo.codigoFijo, empresa.clienteID, manualesSubidos).fechaPublicacion }}</span>
          </div>
        </div>

        <!-- Botones de Acción para este Manual Fijo -->
        <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <a
            v-if="obtenerManualSubido(manualFijo.codigoFijo, empresa.clienteID, manualesSubidos)"
            :href="obtenerManualSubido(manualFijo.codigoFijo, empresa.clienteID, manualesSubidos).urlArchivo"
            target="_blank"
            class="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5"
          >
            <i class="fa-light fa-file-pdf text-red-500"></i>
            <span>Ver PDF Actual</span>
          </a>
          <span v-else class="text-[11px] text-slate-400 italic">
            Aún no disponible en el portal del cliente
          </span>

          <button
            type="button"
            @click="$emit('subir-manual', manualFijo)"
            :class="obtenerManualSubido(manualFijo.codigoFijo, empresa.clienteID, manualesSubidos) ? 'bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'"
            class="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <i :class="obtenerManualSubido(manualFijo.codigoFijo, empresa.clienteID, manualesSubidos) ? 'fa-light fa-arrow-rotate-right' : 'fa-light fa-arrow-up-from-bracket'"></i>
            <span>{{ obtenerManualSubido(manualFijo.codigoFijo, empresa.clienteID, manualesSubidos) ? 'Reemplazar PDF' : 'Subir PDF con Logo' }}</span>
          </button>
        </div>
      </div>
    </div>

  </div>
</template>
