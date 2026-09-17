<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  isGuardando: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:visible', 'guardar']);

const formEmpresa = ref({
  clienteID: 0,
  ruc: '',
  razonSocial: '',
  nombreComercial: '',
  subdominioSIAPP: '',
  codigoConexion: '',
  cadenaConexion: '',
  tipoCobro: 'POR_ALUMNO',
  tarifaPorAlumno: 4.00,
  montoFijoPactado: 1500.00,
  tipoComprobanteHabitual: '01',
  porcentajeDetraccion: 12.00,
  contactoPrincipal: '',
  telefonoContacto: '',
  emailContacto: '',
  passwordInicial: 'Password2026!'
});

watch(() => props.visible, (newVal) => {
  if (newVal) {
    formEmpresa.value = {
      clienteID: 0,
      ruc: '',
      razonSocial: '',
      nombreComercial: '',
      subdominioSIAPP: '',
      codigoConexion: '',
      cadenaConexion: '',
      tipoCobro: 'POR_ALUMNO',
      tarifaPorAlumno: 4.00,
      montoFijoPactado: 1500.00,
      tipoComprobanteHabitual: '01',
      porcentajeDetraccion: 12.00,
      contactoPrincipal: '',
      telefonoContacto: '',
      emailContacto: '',
      passwordInicial: 'Password2026!'
    };
  }
});

const cerrarModal = () => {
  emit('update:visible', false);
};

const onSubmit = () => {
  if (!formEmpresa.value.ruc || !formEmpresa.value.nombreComercial || !formEmpresa.value.emailContacto) {
    alert('Por favor complete los campos obligatorios (RUC, Nombre Comercial y Correo de Contacto).');
    return;
  }
  emit('guardar', { ...formEmpresa.value });
};
</script>

<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in"
  >
    <div class="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">
            Registrar Nueva Empresa Educativa
          </h3>
          <p class="text-xs text-slate-500">
            Ingresa los datos generales de la institución y sus condiciones contractuales.
          </p>
        </div>
        <button type="button" @click="cerrarModal" class="text-slate-400 hover:text-slate-600">
          <i class="fa-light fa-xmark text-lg"></i>
        </button>
      </div>

      <form @submit.prevent="onSubmit" class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">RUC:</label>
            <input
              v-model="formEmpresa.ruc"
              type="text"
              maxlength="11"
              required
              placeholder="20549281921"
              class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-white"
            />
          </div>
          <div class="sm:col-span-2">
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nombre Comercial:</label>
            <input
              v-model="formEmpresa.nombreComercial"
              type="text"
              required
              placeholder="Ej: Instituto Tecnológico SIAPP"
              class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Razón Social Completa:</label>
          <input
            v-model="formEmpresa.razonSocial"
            type="text"
            placeholder="Ej: INSTITUTO DE EDUCACION SUPERIOR TECNOLOGICO SIAPP"
            class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Subdominio SIAPP:</label>
            <input
              v-model="formEmpresa.subdominioSIAPP"
              type="text"
              placeholder="institucion.siapp.edu.pe"
              class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Código de Enlace Institucional:</label>
            <input
              v-model="formEmpresa.codigoConexion"
              type="text"
              placeholder="Ej: siapp"
              class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400"
            />
          </div>
        </div>

        <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
          <span class="text-xs font-bold text-blue-600 block uppercase tracking-wider">
            Condiciones del Contrato & Cobranza
          </span>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tipo de Cobro:</label>
              <select
                v-model="formEmpresa.tipoCobro"
                class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              >
                <option value="POR_ALUMNO">Por Alumno Matriculado</option>
                <option value="FIJO">Monto Fijo Mensual</option>
              </select>
            </div>

            <div v-if="formEmpresa.tipoCobro === 'POR_ALUMNO'">
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tarifa por Alumno (S/):</label>
              <input
                v-model="formEmpresa.tarifaPorAlumno"
                type="number"
                step="0.1"
                class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
              />
            </div>

            <div v-else>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Monto Fijo Mensual (S/):</label>
              <input
                v-model="formEmpresa.montoFijoPactado"
                type="number"
                step="10"
                class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Detracción SPOT (%):</label>
              <input
                v-model="formEmpresa.porcentajeDetraccion"
                type="number"
                step="0.5"
                class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-amber-600"
              />
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nombre del Contacto:</label>
            <input
              v-model="formEmpresa.contactoPrincipal"
              type="text"
              placeholder="Ej: Lic. Roberto Zegarra"
              class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Correo de Facturación / Login:</label>
            <input
              v-model="formEmpresa.emailContacto"
              type="email"
              required
              placeholder="administracion@siapp.edu.pe"
              class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
            />
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            @click="cerrarModal"
            class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="isGuardando"
            class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
          >
            <i v-if="isGuardando" class="fa-solid fa-spinner fa-spin"></i>
            <span>{{ isGuardando ? 'Guardando...' : 'Guardar Institución' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
