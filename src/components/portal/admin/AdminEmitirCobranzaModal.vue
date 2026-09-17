<script setup>
import { ref, computed, watch } from 'vue';
import { DxForm, DxGroupItem, DxSimpleItem, DxRequiredRule } from 'devextreme-vue/form';
import { DxButton } from 'devextreme-vue/button';

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

const dxFormRef = ref(null);

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

// Regla 2.4: Editor Options declarados en computed(...)
const tipoComprobanteOptions = computed(() => ({
  items: [
    { id: '01', text: "Factura Electrónica ('01')" },
    { id: '02', text: "Recibo por Honorarios ('02')" }
  ],
  displayExpr: 'text',
  valueExpr: 'id',
  onValueChanged: (e) => {
    formEmitir.value.tipoComprobante = e.value;
    formEmitir.value.serieComprobante = e.value === '01' ? 'F001' : 'E001';
  }
}));

const serieOptions = computed(() => ({
  placeholder: 'F001',
  maxLength: 4
}));

const numeroOptions = computed(() => ({
  min: 1,
  format: '#'
}));

const cerrarModal = () => {
  emit('update:visible', false);
};

// Regla 6.1: Validación con DxForm antes de emitir
const handleSubmit = () => {
  const validationResult = dxFormRef.value?.instance?.validate();
  if (!validationResult || !validationResult.isValid) {
    return;
  }

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

      <!-- Regla 2.1: Envoltura de Formulario Obligatoria -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Regla 2.2: Único DxForm -->
        <DxForm
          ref="dxFormRef"
          :form-data="formEmitir"
          validation-group="cobranzaValidationGroup"
          :col-count="2"
          label-location="top"
        >
          <DxGroupItem :col-span="2" :col-count="3" caption="Datos del Comprobante">
            <DxSimpleItem
              data-field="tipoComprobante"
              editor-type="dxSelectBox"
              :editor-options="tipoComprobanteOptions"
            />
            <DxSimpleItem data-field="serieComprobante" :editor-options="serieOptions">
              <DxRequiredRule message="Requerido" />
            </DxSimpleItem>
            <DxSimpleItem data-field="numeroComprobante" editor-type="dxNumberBox" :editor-options="numeroOptions">
              <DxRequiredRule message="Requerido" />
            </DxSimpleItem>
          </DxGroupItem>
        </DxForm>

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

        <!-- Regla 6.3: Orden estricto [ Cancelar ] a la izquierda y [ Confirmar ] a la derecha (justify-end) -->
        <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <DxButton
            text="Cancelar"
            type="normal"
            styling-mode="outlined"
            @click="cerrarModal"
          />
          <DxButton
            text="Confirmar y Registrar"
            icon="check"
            type="default"
            styling-mode="contained"
            use-submit-behavior="true"
          />
        </div>
      </form>
    </div>
  </div>
</template>
