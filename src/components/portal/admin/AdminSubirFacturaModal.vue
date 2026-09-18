<script setup>
import { ref, computed, watch } from 'vue';
import { DxForm, DxGroupItem, DxSimpleItem, DxRequiredRule } from 'devextreme-vue/form';
import { DxButton } from 'devextreme-vue/button';
import { showWarning } from '@/services/notification';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  empresas: {
    type: Array,
    required: true
  },
  isGuardando: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:visible', 'guardar']);

const dxFormRef = ref(null);
const archivoSeleccionado = ref(null);
const inputArchivoRef = ref(null);

const anioActual = new Date().getFullYear();
const mesActual = new Date().getMonth() + 1;

const formFactura = ref({
  clienteID: null,
  periodoMes: mesActual,
  periodoAnio: anioActual,
  monto: 1500.00,
  serieComprobante: 'F001',
  numeroComprobante: null,
  tipoComprobante: '01'
});

watch(() => props.visible, (val) => {
  if (val) {
    archivoSeleccionado.value = null;
    formFactura.value = {
      clienteID: props.empresas.length > 0 ? props.empresas[0].clienteID : null,
      periodoMes: mesActual,
      periodoAnio: anioActual,
      monto: 1500.00,
      serieComprobante: 'F001',
      numeroComprobante: null,
      tipoComprobante: '01'
    };
  }
});

// Empresa seleccionada actualmente
const empresaActiva = computed(() => {
  return props.empresas.find(e => e.clienteID === formFactura.value.clienteID) || null;
});

// Cálculo transparente de detracción y neto en tiempo real
const detracciónCalculada = computed(() => {
  const pct = empresaActiva.value?.porcentajeDetraccion ?? 12.00;
  const monto = Number(formFactura.value.monto) || 0;
  return Number((monto * (pct / 100)).toFixed(2));
});

const netoCalculado = computed(() => {
  const monto = Number(formFactura.value.monto) || 0;
  return Number((monto - detracciónCalculada.value).toFixed(2));
});

// Regla 2.4: Editor Options declarados con computed(...)
const clienteOptions = computed(() => ({
  dataSource: props.empresas,
  displayExpr: 'nombreComercial',
  valueExpr: 'clienteID',
  placeholder: 'Seleccione una institución cliente...',
  searchEnabled: true,
  onValueChanged: (e) => {
    formFactura.value.clienteID = e.value;
    const emp = props.empresas.find(x => x.clienteID === e.value);
    if (emp) {
      if (emp.tipoCobro === 'FIJO' && emp.montoFijoPactado) {
        formFactura.value.monto = emp.montoFijoPactado;
      }
    }
  }
}));

const mesesDataSource = [
  { id: 1, nombre: 'Enero' },
  { id: 2, nombre: 'Febrero' },
  { id: 3, nombre: 'Marzo' },
  { id: 4, nombre: 'Abril' },
  { id: 5, nombre: 'Mayo' },
  { id: 6, nombre: 'Junio' },
  { id: 7, nombre: 'Julio' },
  { id: 8, nombre: 'Agosto' },
  { id: 9, nombre: 'Septiembre' },
  { id: 10, nombre: 'Octubre' },
  { id: 11, nombre: 'Noviembre' },
  { id: 12, nombre: 'Diciembre' }
];

const mesOptions = computed(() => ({
  dataSource: mesesDataSource,
  displayExpr: 'nombre',
  valueExpr: 'id',
  placeholder: 'Mes'
}));

const anioOptions = computed(() => ({
  dataSource: [2025, 2026, 2027],
  placeholder: 'Año'
}));

const serieOptions = computed(() => ({
  placeholder: 'F001',
  maxLength: 4
}));

const numeroOptions = computed(() => ({
  placeholder: 'Ej: 145 (dejar vacío para correlativo automático)',
  min: 1
}));

const montoOptions = computed(() => ({
  format: 'S/ #,##0.00',
  min: 0.1,
  step: 10
}));

// Manejo de archivo adjunto (PDF / Word)
const onArchivoChange = (event) => {
  const files = event.target.files;
  if (files && files.length > 0) {
    const file = files[0];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (ext !== '.pdf' && ext !== '.docx' && ext !== '.doc') {
      showWarning('Por favor seleccione un archivo PDF (.pdf) o Word (.doc, .docx).');
      archivoSeleccionado.value = null;
      if (inputArchivoRef.value) inputArchivoRef.value.value = '';
      return;
    }
    archivoSeleccionado.value = file;
  }
};

const removerArchivo = () => {
  archivoSeleccionado.value = null;
  if (inputArchivoRef.value) inputArchivoRef.value.value = '';
};

const cerrarModal = () => {
  emit('update:visible', false);
};

// Regla 6.1: Validación de dxForm antes de emitir
const handleSubmit = () => {
  const validationResult = dxFormRef.value?.instance?.validate();
  if (!validationResult || !validationResult.isValid) {
    return;
  }

  if (!archivoSeleccionado.value) {
    showWarning('Debe adjuntar el archivo de la factura (PDF o Word).');
    return;
  }

  // Empaquetar FormData
  const formData = new FormData();
  formData.append('clienteID', formFactura.value.clienteID);
  formData.append('periodoMes', formFactura.value.periodoMes);
  formData.append('periodoAnio', formFactura.value.periodoAnio);
  formData.append('monto', formFactura.value.monto);
  formData.append('serieComprobante', formFactura.value.serieComprobante || 'F001');
  if (formFactura.value.numeroComprobante) {
    formData.append('numeroComprobante', formFactura.value.numeroComprobante);
  }
  formData.append('tipoComprobante', formFactura.value.tipoComprobante || '01');
  formData.append('archivo', archivoSeleccionado.value);

  emit('guardar', { formData, formFactura: { ...formFactura.value }, empresa: empresaActiva.value });
};
</script>

<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in"
  >
    <div class="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
      
      <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <i class="fa-light fa-file-invoice-dollar text-blue-600"></i>
            <span>Subir Factura de Servicio</span>
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Registra el comprobante electrónico para la institución cliente con su desglose tributario y archivo adjunto.
          </p>
        </div>
        <button type="button" @click="cerrarModal" class="text-slate-400 hover:text-slate-600">
          <i class="fa-light fa-xmark text-lg"></i>
        </button>
      </div>

      <!-- Regla 2.1: Envoltura de Formulario Obligatoria -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        
        <!-- Regla 2.2 y 2.3: Único DxForm con DxGroupItem y DxSimpleItem -->
        <DxForm
          ref="dxFormRef"
          :form-data="formFactura"
          validation-group="subirFacturaValidationGroup"
          :col-count="1"
          label-location="top"
        >
          <!-- Grupo 1: Institución y Período -->
          <DxGroupItem :col-count="3" caption="Destinatario y Período">
            <DxSimpleItem
              data-field="clienteID"
              :col-span="3"
              editor-type="dxSelectBox"
              :editor-options="clienteOptions"
            >
              <DxRequiredRule message="Seleccione la institución educativa cliente" />
            </DxSimpleItem>

            <DxSimpleItem
              data-field="periodoMes"
              :col-span="2"
              editor-type="dxSelectBox"
              :editor-options="mesOptions"
            >
              <DxRequiredRule message="Seleccione el mes facturado" />
            </DxSimpleItem>

            <DxSimpleItem
              data-field="periodoAnio"
              editor-type="dxSelectBox"
              :editor-options="anioOptions"
            >
              <DxRequiredRule message="Seleccione el año facturado" />
            </DxSimpleItem>
          </DxGroupItem>

          <!-- Grupo 2: Comprobante y Monto -->
          <DxGroupItem :col-count="3" caption="Datos del Comprobante">
            <DxSimpleItem
              data-field="serieComprobante"
              :editor-options="serieOptions"
            >
              <DxRequiredRule message="Ingrese la serie (ej: F001)" />
            </DxSimpleItem>

            <DxSimpleItem
              data-field="numeroComprobante"
              editor-type="dxNumberBox"
              :editor-options="numeroOptions"
            />

            <DxSimpleItem
              data-field="monto"
              editor-type="dxNumberBox"
              :editor-options="montoOptions"
            >
              <DxRequiredRule message="Ingrese el monto total de la factura" />
            </DxSimpleItem>
          </DxGroupItem>
        </DxForm>

        <!-- RESUMEN TRIBUTARIO TRANSPARENTE EN TIEMPO REAL -->
        <div class="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs">
          <div>
            <span class="text-slate-400 block text-[11px]">Total Facturado:</span>
            <span class="font-bold font-mono text-slate-800 dark:text-slate-200">S/ {{ (Number(formFactura.monto) || 0).toFixed(2) }}</span>
          </div>
          <div>
            <span class="text-amber-600 dark:text-amber-400 block text-[11px]">Detracción SPOT ({{ empresaActiva?.porcentajeDetraccion ?? 12 }}%):</span>
            <span class="font-bold font-mono text-amber-700 dark:text-amber-300">S/ {{ detracciónCalculada.toFixed(2) }}</span>
          </div>
          <div>
            <span class="text-blue-600 dark:text-blue-400 block text-[11px]">Neto a Cobrar:</span>
            <span class="font-bold font-mono text-blue-700 dark:text-blue-300">S/ {{ netoCalculado.toFixed(2) }}</span>
          </div>
        </div>

        <!-- SELECCIÓN DE ARCHIVO ADJUNTO (PDF / WORD) -->
        <div class="space-y-2 pt-1">
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-200">
            Archivo Adjunto de la Factura (PDF o Word) <span class="text-red-500">*</span>
          </label>

          <div
            v-if="!archivoSeleccionado"
            class="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/30"
            @click="inputArchivoRef?.click()"
          >
            <input
              ref="inputArchivoRef"
              type="file"
              accept=".pdf,.docx,.doc"
              class="hidden"
              @change="onArchivoChange"
            />
            <div class="flex flex-col items-center gap-2">
              <div class="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xl">
                <i class="fa-light fa-cloud-arrow-up"></i>
              </div>
              <div>
                <p class="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Haz clic para seleccionar el archivo de la factura
                </p>
                <p class="text-[11px] text-slate-400">
                  Formatos soportados: PDF (.pdf) o Microsoft Word (.docx, .doc) hasta 20 MB
                </p>
              </div>
            </div>
          </div>

          <!-- TARJETA DE ARCHIVO CARGADO -->
          <div
            v-else
            class="flex items-center justify-between p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-lg">
                <i :class="archivoSeleccionado.name.endsWith('.pdf') ? 'fa-light fa-file-pdf text-red-500' : 'fa-light fa-file-word text-blue-600'"></i>
              </div>
              <div>
                <span class="block text-xs font-bold text-slate-900 dark:text-white truncate max-w-[320px]">
                  {{ archivoSeleccionado.name }}
                </span>
                <span class="text-[10px] text-slate-500 dark:text-slate-400">
                  {{ (archivoSeleccionado.size / 1024).toFixed(1) }} KB • Listo para subir y notificar
                </span>
              </div>
            </div>

            <button
              type="button"
              @click="removerArchivo"
              class="p-2 text-slate-400 hover:text-red-500 transition-colors"
              title="Quitar archivo"
            >
              <i class="fa-light fa-trash text-sm"></i>
            </button>
          </div>
        </div>

        <!-- Regla 6.3: Orden estricto [ Cancelar ] a la izquierda y [ Guardar ] a la derecha (justify-end) -->
        <div class="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <DxButton
            text="Cancelar"
            type="normal"
            styling-mode="outlined"
            :disabled="isGuardando"
            @click="cerrarModal"
          />
          <DxButton
            :text="isGuardando ? 'Subiendo y Guardando...' : 'Subir Factura'"
            :icon="isGuardando ? 'spin' : 'upload'"
            type="default"
            styling-mode="contained"
            :disabled="isGuardando"
            use-submit-behavior="true"
          />
        </div>

      </form>

    </div>
  </div>
</template>
