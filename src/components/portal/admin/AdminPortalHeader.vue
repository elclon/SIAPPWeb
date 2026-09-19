<template>
  <div class="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
    <div class="space-y-2">
      <div class="flex items-center gap-2 flex-wrap">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold">
          <i class="fa-light fa-crown text-amber-400"></i>
          <span>Panel de Administración &bull; SIAPP SaaS</span>
        </div>
        <span v-if="sesionAdmin" class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          <i class="fa-solid fa-circle-user mr-1"></i> {{ sesionAdmin.nombreCompleto }}
        </span>
      </div>
      <h1 class="text-2xl sm:text-3xl font-black font-heading tracking-tight">
        Gestión de Empresas, Facturación & Manuales MINEDU
      </h1>
      <p class="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
        Alta y administración de instituciones educativas, cálculo automatizado de matrículas para facturación mensual y asignación de manuales oficiales personalizados por institución.
      </p>
    </div>

    <!-- Botones Principales de Acción con DevExtreme -->
    <div class="flex items-center gap-3 flex-wrap">
      <DxButton
        v-if="sesionAdmin"
        text="Cerrar Sesión"
        icon="export"
        type="danger"
        styling-mode="contained"
        hint="Cerrar Sesión de Administrador"
        @click="$emit('cerrar-sesion')"
      />
    </div>
  </div>
</template>

<script setup>
import { DxButton } from 'devextreme-vue/button';

defineProps({
  isCalculando: {
    type: Boolean,
    default: false
  },
  sesionAdmin: {
    type: Object,
    default: null
  }
});

defineEmits(['nueva-empresa', 'sincronizar', 'cerrar-sesion']);
</script>


