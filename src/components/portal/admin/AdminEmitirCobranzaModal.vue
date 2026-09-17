<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  cliente: {
    type: Object,
    default: null
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

const emit = defineEmits(['update:visible', 'confirmar']);

const formEmitir = ref({
  tipoComprobante: '01',
  serieComprobante: 'F001',
  numeroComprobante: 1249,
  fechaEmision: new Date().toISOString().substring(0, 10),
  fechaVencimiento: new Date(Date.now() + 15 * 86400000).toISOString().substring(0, 10),
  cantidadAlumnos: 0,
  tarifaAplicada: 0,
  montoTotal: 0,
  aplicaDetraccion: true,
  montoDetraccion: 0,
  montoNeto: 0
});

watch(() => props.cliente, (item) => {
  if (item) {
    formEmitir.value.cantidadAlumnos = item.alumnosDetectados;
    formEmitir.value.tarifaAplicada = item.tarifaAplicada;
    formEmitir.value.montoTotal = item.montoTotal;
    formEmitir.value.aplicaDetraccion = item.aplicaDetraccion;
    formEmitir.value.montoDetraccion = item.montoDetraccion;
    formEmitir.value.montoNeto = item.montoNeto;
  }
}, { immediate: true });

const cerrarModal = () => {
  emit('update:visible', false);
};

const onSubmit = () => {
  const payload = {
    clienteID: props.cliente.clienteID,
    periodoAnio: props.filtroAnio,
    periodoMes: props.filtroMes,
    tipoComprobante: formEmitir.value.tipoComprobante,
    serieComprobante: formEmitir.value.serieComprobante,
    numeroComprobante: parseInt(formEmitir.value.numeroComprobante),
    fechaEmision: formEmitir.value.fechaEmision,
    fechaVencimiento: formEmitir.value.fechaVencimiento,
    cantidadAlumnosFacturados: formEmitir.value.cantidadAlumnos,
    tarifaAplicada: formEmitir.value.tarifaAplicada,
    montoSubTotal: Math.round((formEmitir.value.montoTotal / 1.18) * 100) / 100,
    montoIGV: Math.round((formEmitir.value.montoTotal - (formEmitir.value.montoTotal / 1.18)) * 100) / 100,
    montoTotalFacturado: formEmitir.value.montoTotal,
    aplicaDetraccion: formEmitir.value.aplicaDetraccion,
    porcentajeDetraccion: 12.00,
    montoDetraccion: formEmitir.value.montoDetraccion,
    montoNetoAPagar: formEmitir.value.montoNeto,
    urlPdfComprobante: `https://siapp.edu.pe/docs/${formEmitir.value.serieComprobante}-${formEmitir.value.numeroComprobante}.pdf`,
    urlXmlComprobante: `https://siapp.edu.pe/docs/${formEmitir.value.serieComprobante}-${formEmitir.value.numeroComprobante}.xml`
  };

  emit('confirmar', { payload, cliente: props.cliente });
};
</script>

<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in"
  >
    <div class="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">
            Confirmar Emisión de Cobranza
          </h3>
          <span class="text-xs text-slate-500 font-mono">
            Cliente: {{ cliente?.nombreComercial }}
          </span>
        </div>
        <button type="button" @click="cerrarModal" class="text-slate-400 hover:text-slate-600">
          <i class="fa-light fa-xmark text-lg"></i>
        </button>
      </div>

      <form @submit.prevent="onSubmit" class="space-y-4">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Tipo Comprobante:
            </label>
            <select
              v-model="formEmitir.tipoComprobante"
              class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
            >
              <option value="01">Factura Electrónica ('01')</option>
              <option value="02">Recibo por Honorarios ('02')</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Serie y Número:
            </label>
            <div class="flex gap-1.5">
              <input
                v-model="formEmitir.serieComprobante"
                type="text"
                required
                class="w-20 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold"
              />
              <input
                v-model="formEmitir.numeroComprobante"
                type="number"
                required
                class="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold"
              />
            </div>
          </div>
        </div>

        <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
          <div class="flex justify-between">
            <span class="text-slate-500">Alumnos auditados en período:</span>
            <strong class="font-mono">{{ formEmitir.cantidadAlumnos }} alumnos</strong>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Total Facturado (con IGV):</span>
            <strong class="font-mono text-slate-900 dark:text-white font-bold">S/ {{ formEmitir.montoTotal.toFixed(2) }}</strong>
          </div>
          <div class="flex justify-between text-amber-700 dark:text-amber-400">
            <span>Detracción Banco de la Nación (12%):</span>
            <strong class="font-mono font-bold">S/ {{ formEmitir.montoDetraccion.toFixed(2) }}</strong>
          </div>
          <div class="flex justify-between text-blue-700 dark:text-blue-400 border-t border-slate-200 pt-1.5">
            <span>Neto a transferir a cuenta comercial:</span>
            <strong class="font-mono font-bold text-sm">S/ {{ formEmitir.montoNeto.toFixed(2) }}</strong>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            @click="cerrarModal"
            class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 text-xs font-semibold"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20"
          >
            Confirmar y Registrar
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
