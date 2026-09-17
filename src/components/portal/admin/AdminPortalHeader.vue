<script setup>
import { DxButton } from 'devextreme-vue/button';

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

    <!-- Botones Principales de Acción con DevExtreme -->
    <div class="flex items-center gap-3 flex-wrap">
      <DxButton
        text="Registrar Nueva Empresa"
        icon="plus"
        type="success"
        styling-mode="contained"
        @click="$emit('nueva-empresa')"
      />

      <DxButton
        :text="isCalculando ? 'Sincronizando...' : 'Sincronizar Alumnos Matriculados'"
        :icon="isCalculando ? 'spin' : 'refresh'"
        :disabled="isCalculando"
        type="default"
        styling-mode="contained"
        @click="$emit('sincronizar')"
      />
    </div>
  </div>
</template>
