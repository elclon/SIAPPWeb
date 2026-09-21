<template>
  <div class="p-2 space-y-4 max-h-[85vh] overflow-y-auto">
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
        <DxGroupItem :col-count="3">
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

          <!-- Ítem de plantilla contextual para Tarifa Fija / Por Alumno y Botón de Cálculo -->
          <DxSimpleItem
            v-if="empresaActiva"
            :col-span="3"
            template="tarifaTemplate"
          />
        </DxGroupItem>

        <!-- Slot de Plantilla Contextual según tipo de cobro -->
        <template #tarifaTemplate>
          <div
            class="p-3.5 rounded-2xl border transition-all my-1"
            :class="esTipoFijo ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/70' : 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/60'"
          >
            <!-- CASO 1: EMPRESA CON TARIFA FIJA -->
            <div v-if="esTipoFijo" class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 text-base shrink-0">
                  <i class="fa-light fa-tag"></i>
                </div>
                <div>
                  <span class="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Modalidad: Tarifa Fija Mensual
                  </span>
                  <span class="text-[11px] text-slate-500 dark:text-slate-400">
                    Monto pactado: <strong class="text-slate-800 dark:text-slate-200 font-mono">S/ {{ Number(empresaActiva.montoFijoPactado || 0).toFixed(2) }}</strong> (Llenado automáticamente en el monto de la factura).
                  </span>
                </div>
              </div>
            </div>

            <!-- CASO 2: EMPRESA CON CÁLCULO POR ALUMNO -->
            <div v-else class="space-y-2.5">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/80 flex items-center justify-center text-blue-600 dark:text-blue-300 text-base shrink-0">
                    <i class="fa-light fa-users"></i>
                  </div>
                  <div>
                    <span class="text-xs font-bold text-blue-900 dark:text-blue-200 block">
                      Modalidad: Cobro por Alumno Matriculado
                    </span>
                    <span class="text-[11px] text-blue-700 dark:text-blue-300">
                      Monto por alumno configurado: <strong class="font-mono font-black text-blue-900 dark:text-blue-100 text-xs">S/ {{ tarifaPorAlumnoEmpresa }}</strong> por alumno
                    </span>
                  </div>
                </div>

                <!-- BOTÓN VISIBLE: CALCULAR MONTO -->
                <DxButton
                  text="Calcular monto"
                  icon="calculator"
                  type="default"
                  styling-mode="outlined"
                  :disabled="isCalculandoMonto"
                  class="font-semibold text-xs shrink-0"
                  @click="calcularMontoAlumnos"
                />
              </div>

              <!-- Detalle del cálculo realizado -->
              <div
                v-if="detalleCalculo"
                class="p-2 rounded-xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900 text-xs flex items-center justify-between animate-in fade-in"
              >
                <div class="flex items-center gap-2">
                  <i class="fa-light fa-circle-check text-emerald-600 text-sm"></i>
                  <span class="text-slate-700 dark:text-slate-300">
                    Conteo auditado: <strong>{{ detalleCalculo.alumnos }} alumnos</strong> &times; S/ {{ Number(detalleCalculo.tarifa).toFixed(2) }}
                  </span>
                </div>
                <span class="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs">
                  Monto Calculado: S/ {{ Number(detalleCalculo.total).toFixed(2) }}
                </span>
              </div>
            </div>

          </div>
        </template>

        <!-- Grupo 2: Comprobante y Monto -->
        <DxGroupItem :col-count="3">
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
      <div
        v-if="detraccionCalculada > 0"
        class="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs"
      >
        <div>
          <span class="text-slate-400 block text-[11px]">Total Facturado:</span>
          <span class="font-bold font-mono text-slate-800 dark:text-slate-200">S/ {{ (Number(formFactura.monto) || 0).toFixed(2) }}</span>
        </div>
        <div>
          <span class="text-amber-600 dark:text-amber-400 block text-[11px]">Detracción SPOT ({{ empresaActiva?.porcentajeDetraccion ?? 12 }}%):</span>
          <span class="font-bold font-mono text-amber-700 dark:text-amber-300">S/ {{ detraccionCalculada.toFixed(2) }}</span>
        </div>
        <div>
          <span class="text-blue-600 dark:text-blue-400 block text-[11px]">Neto a Cobrar:</span>
          <span class="font-bold font-mono text-blue-700 dark:text-blue-300">S/ {{ netoCalculado.toFixed(2) }}</span>
        </div>
      </div>
      <div
        v-else-if="Number(formFactura.monto) > 0"
        class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs flex items-center justify-between"
      >
        <div>
          <span class="text-slate-400 block text-[11px]">Total Facturado:</span>
          <span class="font-bold font-mono text-slate-800 dark:text-slate-200 text-sm">S/ {{ (Number(formFactura.monto) || 0).toFixed(2) }}</span>
        </div>
        <span class="text-[11px] text-slate-500 italic">No aplica detracción (monto menor o igual a S/ 700.00 o sin porcentaje configurado).</span>
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
          @click="onCancelar"
        />
        <DxButton
          :text="isGuardando ? 'Subiendo y Guardando...' : 'Subir Factura'"
          :icon="isGuardando ? 'fa-light fa-spinner fa-spin' : 'upload'"
          type="default"
          styling-mode="contained"
          :disabled="isGuardando"
          use-submit-behavior="true"
        />
      </div>

    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { DxForm, DxGroupItem, DxSimpleItem, DxRequiredRule } from 'devextreme-vue/form';
import { DxButton } from 'devextreme-vue/button';
import apiClient from '@/api/axiosConfig';
import { showSuccess, showError, showWarning } from '@/services/notification';
import { getErrorMessage } from '@/services/errorHandler';

const props = defineProps({
  empresas: {
    type: Array,
    required: true
  },
  calculosClientes: {
    type: Array,
    default: () => []
  },
  empresaPreseleccionada: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close']);

const dxFormRef = ref(null);
const isGuardando = ref(false);
const archivoSeleccionado = ref(null);
const inputArchivoRef = ref(null);
const isCalculandoMonto = ref(false);
const detalleCalculo = ref(null);

const anioActual = new Date().getFullYear();
const mesActual = new Date().getMonth() + 1;

const formFactura = ref({
  clienteID: null,
  periodoMes: mesActual,
  periodoAnio: anioActual,
  monto: 0,
  serieComprobante: 'F001',
  numeroComprobante: null,
  tipoComprobante: '01'
});

// Empresa seleccionada actualmente
const empresaActiva = computed(() => {
  return props.empresas.find(e => e.clienteID === formFactura.value.clienteID) || null;
});

const esTipoFijo = computed(() => {
  return empresaActiva.value?.tipoCobro === 'FIJO' || empresaActiva.value?.tipoCobro === 'TARIFA_FIJA';
});

const tarifaPorAlumnoEmpresa = computed(() => {
  return Number(empresaActiva.value?.tarifaPorAlumno ?? 4.00).toFixed(2);
});

// Función para aplicar la configuración de la empresa seleccionada
const aplicarEmpresa = (empresa) => {
  if (!empresa) return;

  if (empresa.tipoCobro === 'FIJO' || empresa.tipoCobro === 'TARIFA_FIJA') {
    formFactura.value.monto = Number(empresa.montoFijoPactado) || 0;
    detalleCalculo.value = null;
  } else {
    detalleCalculo.value = null;
    formFactura.value.monto = 0;

    if (props.calculosClientes && props.calculosClientes.length > 0) {
      const cal = props.calculosClientes.find(c => c.clienteID === empresa.clienteID);
      if (cal && cal.alumnosDetectados) {
        const tarifa = Number(cal.tarifaAplicada || empresa.tarifaPorAlumno || 4.00);
        const alumnos = Number(cal.alumnosDetectados || 0);
        const total = Number(cal.montoTotal) || Number((alumnos * tarifa).toFixed(2));
        formFactura.value.monto = total;
        detalleCalculo.value = {
          alumnos,
          tarifa,
          total
        };
      }
    }
  }
};

onMounted(() => {
  const empresaInicial = props.empresaPreseleccionada || (props.empresas.length > 0 ? props.empresas[0] : null);
  if (empresaInicial) {
    formFactura.value.clienteID = empresaInicial.clienteID;
    aplicarEmpresa(empresaInicial);
  }
});

// Función para calcular monto en base a alumnos activos en la BD
const calcularMontoAlumnos = async () => {
  if (!empresaActiva.value) {
    showWarning('Seleccione primero una institución educativa cliente.');
    return;
  }

  isCalculandoMonto.value = true;
  try {
    const response = await apiClient.get('/portal-cliente/admin/calcular-alumnos', {
      params: {
        anio: formFactura.value.periodoAnio,
        mes: formFactura.value.periodoMes
      }
    });

    const lista = Array.isArray(response.data) ? response.data : [];
    const cal = lista.find(c => c.clienteID === empresaActiva.value.clienteID);

    if (cal) {
      const tarifa = Number(cal.tarifaAplicada || empresaActiva.value.tarifaPorAlumno || 4.00);
      const alumnos = Number(cal.alumnosDetectados || 0);
      const total = Number(cal.montoTotal) || Number((alumnos * tarifa).toFixed(2));

      formFactura.value.monto = total;
      detalleCalculo.value = {
        alumnos,
        tarifa,
        total,
        estadoConexion: cal.estadoConexionBD,
        mensaje: cal.mensajeConexion
      };

      showSuccess(`Monto calculado: ${alumnos} alumnos × S/ ${tarifa.toFixed(2)} = S/ ${total.toFixed(2)}`);
    } else {
      showWarning('No se encontró conteo automático en línea. Puede ingresar el monto manualmente.');
    }
  } catch (error) {
    console.error('Error al calcular monto por alumnos:', error);
    showError(getErrorMessage(error, 'Error al calcular alumnos para el período seleccionado.'));
  } finally {
    isCalculandoMonto.value = false;
  }
};

const detraccionCalculada = computed(() => {
  const pct = empresaActiva.value?.porcentajeDetraccion ?? 12.00;
  const monto = Number(formFactura.value.monto) || 0;
  if (monto <= 700 || pct <= 0) return 0;
  return Number((monto * (pct / 100)).toFixed(2));
});

const netoCalculado = computed(() => {
  const monto = Number(formFactura.value.monto) || 0;
  return Number((monto - detraccionCalculada.value).toFixed(2));
});

const clienteOptions = computed(() => ({
  dataSource: props.empresas,
  displayExpr: 'nombreComercial',
  valueExpr: 'clienteID',
  placeholder: 'Seleccione una institución cliente...',
  searchEnabled: true,
  dropDownOptions: {
    container: 'body'
  },
  onValueChanged: (e) => {
    formFactura.value.clienteID = e.value;
    const emp = props.empresas.find(x => x.clienteID === e.value);
    if (emp) {
      aplicarEmpresa(emp);
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
  placeholder: 'Mes',
  dropDownOptions: {
    container: 'body'
  }
}));

const anioOptions = computed(() => ({
  dataSource: [2025, 2026, 2027],
  placeholder: 'Año',
  dropDownOptions: {
    container: 'body'
  }
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
  min: 0,
  step: 10
}));

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

const handleSubmit = async () => {
  const validationResult = dxFormRef.value?.instance?.validate();
  if (!validationResult || !validationResult.isValid) {
    return;
  }

  if (!archivoSeleccionado.value) {
    showWarning('Debe adjuntar el archivo de la factura (PDF o Word).');
    return;
  }

  isGuardando.value = true;
  try {
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

    await apiClient.post('/portal-cliente/admin/facturas/subir', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    showSuccess('¡Factura subida y registrada exitosamente!');
    emit('close', { canceled: false, data: { ...formFactura.value } });
  } catch (error) {
    showError(getErrorMessage(error, 'Error al subir y registrar la factura'));
  } finally {
    isGuardando.value = false;
  }
};

const onCancelar = () => {
  emit('close', { canceled: true });
};
</script>
