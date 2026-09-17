<script setup>
defineProps({
  isCalculando: {
    type: Boolean,
    default: false
  }
});

defineEmits(['nueva-empresa', 'sincronizar']);
</script>

<template>
  <div class="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
    <div class="space-y-2">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold">
        <i class="fa-light fa-crown text-amber-400"></i>
        <span>Panel de Administración &bull; SIAPP SaaS</span>
      </div>
      <h1 class="text-2xl sm:text-3xl font-black font-heading tracking-tight">
        Gestión de Empresas, Facturación & Manuales MINEDU
      </h1>
      <p class="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
        Alta y administración de instituciones educativas, cálculo automatizado de matrículas para facturación mensual y asignación de manuales oficiales personalizados por institución.
      </p>
    </div>

    <!-- Botones Principales de Acción -->
    <div class="flex items-center gap-3 flex-wrap">
      <button
        type="button"
        @click="$emit('nueva-empresa')"
        class="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all"
      >
        <i class="fa-light fa-plus"></i>
        <span>Registrar Nueva Empresa</span>
      </button>

      <button
        type="button"
        @click="$emit('sincronizar')"
        :disabled="isCalculando"
        class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all disabled:opacity-60"
      >
        <i :class="isCalculando ? 'fa-solid fa-spinner fa-spin' : 'fa-light fa-arrows-rotate'"></i>
        <span>{{ isCalculando ? 'Sincronizando...' : 'Sincronizar Alumnos Matriculados' }}</span>
      </button>
    </div>
  </div>
</template>
