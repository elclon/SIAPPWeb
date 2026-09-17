<script setup>
import { ref, computed, watch } from 'vue';
import { DxForm, DxGroupItem, DxSimpleItem, DxRequiredRule, DxStringLengthRule, DxEmailRule } from 'devextreme-vue/form';
import { DxButton } from 'devextreme-vue/button';

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

const dxFormRef = ref(null);

const formEmpresa = ref({
  clienteID: 0,
  ruc: '',
  razonSocial: '',
  nombreComercial: '',
  subdominioSIAPP: '',
  codigoConexion: '',
  tipoCobro: 'POR_ALUMNO',
  tarifaPorAlumno: 4.00,
  montoFijoPactado: 1500.00,
  tipoComprobanteHabitual: '01',
  porcentajeDetraccion: 12.00,
  contactoPrincipal: '',
  emailContacto: ''
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
      tipoCobro: 'POR_ALUMNO',
      tarifaPorAlumno: 4.00,
      montoFijoPactado: 1500.00,
      tipoComprobanteHabitual: '01',
      porcentajeDetraccion: 12.00,
      contactoPrincipal: '',
      emailContacto: ''
    };
  }
});

// Regla 2.4: Editor Options declarados en computed(...)
const tipoCobroOptions = computed(() => ({
  items: [
    { id: 'POR_ALUMNO', text: 'Por Alumno Matriculado' },
    { id: 'FIJO', text: 'Monto Fijo Mensual' }
  ],
  displayExpr: 'text',
  valueExpr: 'id',
  onValueChanged: (e) => {
    formEmpresa.value.tipoCobro = e.value;
  }
}));

const rucOptions = computed(() => ({
  placeholder: '20549281921',
  maxLength: 11
}));

const nombreComercialOptions = computed(() => ({
  placeholder: 'Ej: Instituto Tecnológico SIAPP'
}));

const razonSocialOptions = computed(() => ({
  placeholder: 'Ej: INSTITUTO DE EDUCACION SUPERIOR TECNOLOGICO SIAPP'
}));

const subdominioOptions = computed(() => ({
  placeholder: 'institucion.siapp.edu.pe'
}));

const codigoConexionOptions = computed(() => ({
  placeholder: 'Ej: siapp'
}));

const tarifaPorAlumnoOptions = computed(() => ({
  min: 0.1,
  step: 0.1,
  format: '#,##0.00'
}));

const montoFijoOptions = computed(() => ({
  min: 1,
  step: 10,
  format: 'S/ #,##0.00'
}));

const porcentajeDetraccionOptions = computed(() => ({
  min: 0,
  max: 100,
  step: 0.5,
  format: '#0.00 \'%\''
}));

const emailOptions = computed(() => ({
  placeholder: 'administracion@siapp.edu.pe',
  mode: 'email'
}));

const contactoOptions = computed(() => ({
  placeholder: 'Ej: Lic. Roberto Zegarra'
}));

const cerrarModal = () => {
  emit('update:visible', false);
};

// Regla 6.1: Validación obligatoria con dxFormRef antes de emitir
const handleSubmit = () => {
  const validationResult = dxFormRef.value?.instance?.validate();
  if (!validationResult || !validationResult.isValid) {
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

      <!-- Regla 2.1: Envoltura de Formulario Obligatoria -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Regla 2.2 y 2.3: Único DxForm con DxGroupItem y DxSimpleItem -->
        <DxForm
          ref="dxFormRef"
          :form-data="formEmpresa"
          validation-group="empresaValidationGroup"
          :col-count="1"
          label-location="top"
        >
          <!-- Grupo: Identificación Institucional -->
          <DxGroupItem :col-count="3" caption="Identificación Institucional">
            <DxSimpleItem data-field="ruc" :editor-options="rucOptions">
              <DxRequiredRule message="El RUC es obligatorio" />
              <DxStringLengthRule :min="11" :max="11" message="El RUC debe tener 11 dígitos" />
            </DxSimpleItem>

            <DxSimpleItem data-field="nombreComercial" :col-span="2" :editor-options="nombreComercialOptions">
              <DxRequiredRule message="El Nombre Comercial es obligatorio" />
            </DxSimpleItem>

            <DxSimpleItem data-field="razonSocial" :col-span="3" :editor-options="razonSocialOptions" />
          </DxGroupItem>

          <!-- Grupo: Enlaces y Conectividad -->
          <DxGroupItem :col-count="2" caption="Enlaces y Acceso">
            <DxSimpleItem data-field="subdominioSIAPP" :editor-options="subdominioOptions">
              <DxRequiredRule message="El subdominio es obligatorio" />
            </DxSimpleItem>

            <DxSimpleItem data-field="codigoConexion" :editor-options="codigoConexionOptions">
              <DxRequiredRule message="El código de enlace es obligatorio" />
            </DxSimpleItem>
          </DxGroupItem>

          <!-- Grupo: Condiciones Contractuales -->
          <DxGroupItem :col-count="3" caption="Condiciones Contractuales & Facturación">
            <DxSimpleItem
              data-field="tipoCobro"
              editor-type="dxSelectBox"
              :editor-options="tipoCobroOptions"
            />

            <DxSimpleItem
              v-if="formEmpresa.tipoCobro === 'POR_ALUMNO'"
              data-field="tarifaPorAlumno"
              editor-type="dxNumberBox"
              :editor-options="tarifaPorAlumnoOptions"
            >
              <DxRequiredRule message="Ingrese la tarifa por alumno" />
            </DxSimpleItem>

            <DxSimpleItem
              v-else
              data-field="montoFijoPactado"
              editor-type="dxNumberBox"
              :editor-options="montoFijoOptions"
            >
              <DxRequiredRule message="Ingrese el monto fijo mensual" />
            </DxSimpleItem>

            <DxSimpleItem
              data-field="porcentajeDetraccion"
              editor-type="dxNumberBox"
              :editor-options="porcentajeDetraccionOptions"
            />
          </DxGroupItem>

          <!-- Grupo: Datos de Contacto -->
          <DxGroupItem :col-count="2" caption="Contacto y Notificaciones">
            <DxSimpleItem data-field="contactoPrincipal" :editor-options="contactoOptions">
              <DxRequiredRule message="El contacto es obligatorio" />
            </DxSimpleItem>

            <DxSimpleItem data-field="emailContacto" :editor-options="emailOptions">
              <DxRequiredRule message="El correo es obligatorio" />
              <DxEmailRule message="Ingrese un correo electrónico válido" />
            </DxSimpleItem>
          </DxGroupItem>
        </DxForm>

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
            :text="isGuardando ? 'Guardando...' : 'Guardar Institución'"
            :icon="isGuardando ? 'spin' : 'save'"
            type="success"
            styling-mode="contained"
            :disabled="isGuardando"
            use-submit-behavior="true"
          />
        </div>
      </form>
    </div>
  </div>
</template>
