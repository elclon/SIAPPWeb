<template>
  <div class="p-2 space-y-4 max-h-[85vh] overflow-y-auto">
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
          @click="onCancelar"
        />
        <DxButton
          :text="isGuardando ? 'Guardando...' : (empresaAEditar ? 'Guardar Cambios' : 'Guardar Institución')"
          :icon="isGuardando ? 'fa-light fa-spinner fa-spin' : 'save'"
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
import { DxForm, DxGroupItem, DxSimpleItem, DxRequiredRule, DxStringLengthRule, DxEmailRule } from 'devextreme-vue/form';
import { DxButton } from 'devextreme-vue/button';
import apiClient from '@/api/axiosConfig';
import { showSuccess, showError, showWarning } from '@/services/notification';
import { getErrorMessage } from '@/services/errorHandler';

const props = defineProps({
  empresaAEditar: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close']);

const dxFormRef = ref(null);
const isGuardando = ref(false);
const isConsultandoRuc = ref(false);

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

onMounted(() => {
  if (props.empresaAEditar) {
    formEmpresa.value = {
      clienteID: props.empresaAEditar.clienteID || 0,
      ruc: props.empresaAEditar.ruc || '',
      razonSocial: props.empresaAEditar.razonSocial || '',
      nombreComercial: props.empresaAEditar.nombreComercial || '',
      subdominioSIAPP: props.empresaAEditar.subdominioSIAPP || '',
      codigoConexion: props.empresaAEditar.codigoConexion || '',
      tipoCobro: props.empresaAEditar.tipoCobro || 'POR_ALUMNO',
      tarifaPorAlumno: props.empresaAEditar.tarifaPorAlumno ?? 4.00,
      montoFijoPactado: props.empresaAEditar.montoFijoPactado ?? 1500.00,
      tipoComprobanteHabitual: props.empresaAEditar.tipoComprobanteHabitual || '01',
      porcentajeDetraccion: props.empresaAEditar.porcentajeDetraccion ?? 12.00,
      contactoPrincipal: props.empresaAEditar.contactoPrincipal || '',
      emailContacto: props.empresaAEditar.emailContacto || ''
    };
  }
});

const consultarRucSunat = async () => {
  const ruc = formEmpresa.value.ruc ? formEmpresa.value.ruc.trim() : '';
  if (!ruc) {
    showWarning('Por favor ingrese un número de RUC para validar.');
    return;
  }
  if (ruc.length !== 11) {
    showWarning('El número de RUC debe tener 11 dígitos numéricos.');
    return;
  }

  try {
    isConsultandoRuc.value = true;
    const response = await apiClient.get(`/portal-cliente/admin/consultar-ruc/${ruc}`);
    if (response.data && response.data.razonSocial) {
      formEmpresa.value.razonSocial = response.data.razonSocial;
      if (!formEmpresa.value.nombreComercial) {
        formEmpresa.value.nombreComercial = response.data.razonSocial;
      }

      if (!formEmpresa.value.codigoConexion) {
        const sugerencia = response.data.razonSocial
          .toLowerCase()
          .replace(/s\.a\.c\.|s\.a\.|e\.i\.r\.l\.|s\.r\.l\.|instituto|superior|tecnologico|de|la|el|los|las/g, '')
          .trim()
          .split(/\s+/)[0]
          .replace(/[^a-z0-9]/g, '');
        if (sugerencia) {
          formEmpresa.value.codigoConexion = sugerencia;
          if (!formEmpresa.value.subdominioSIAPP) {
            formEmpresa.value.subdominioSIAPP = `${sugerencia}.siapp.edu.pe`;
          }
        }
      }

      showSuccess('Datos recuperados correctamente de SUNAT');
    }
  } catch (error) {
    showError(getErrorMessage(error, 'Error al consultar RUC en SUNAT'));
  } finally {
    isConsultandoRuc.value = false;
  }
};

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
  placeholder: 'Ej: 20601234567',
  maxLength: 11,
  buttons: [{
    name: 'consultarRuc',
    location: 'after',
    options: {
      icon: isConsultandoRuc.value ? 'fa-light fa-spinner fa-spin' : 'find',
      type: 'default',
      stylingMode: 'text',
      hint: 'Consultar RUC en SUNAT',
      disabled: isConsultandoRuc.value,
      onClick: consultarRucSunat
    }
  }]
}));

const nombreComercialOptions = computed(() => ({
  placeholder: 'Ej: Instituto Superior Tecnológico Continental'
}));

const razonSocialOptions = computed(() => ({
  placeholder: 'Ej: CORPORACION EDUCATIVA CONTINENTAL S.A.C.'
}));

const subdominioOptions = computed(() => ({
  placeholder: 'Ej: continental.siapp.edu.pe'
}));

const codigoConexionOptions = computed(() => ({
  placeholder: 'Ej: continental'
}));

const tarifaPorAlumnoOptions = computed(() => ({
  min: 1.00,
  max: 50.00,
  format: 'S/ #,##0.00',
  step: 0.50
}));

const montoFijoOptions = computed(() => ({
  min: 100.00,
  max: 50000.00,
  format: 'S/ #,##0.00',
  step: 50.00
}));

const porcentajeDetraccionOptions = computed(() => ({
  min: 0,
  max: 30,
  format: '#0.00 \'%\'',
  step: 1.00
}));

const emailOptions = computed(() => ({
  placeholder: 'administracion@instituto.edu.pe',
  mode: 'email'
}));

const contactoOptions = computed(() => ({
  placeholder: 'Ej: Lic. Roberto Zegarra'
}));

const handleSubmit = async () => {
  const validationResult = dxFormRef.value?.instance?.validate();
  if (!validationResult || !validationResult.isValid) {
    return;
  }

  isGuardando.value = true;
  try {
    const payload = { ...formEmpresa.value };
    await apiClient.post('/portal-cliente/admin/clientes/guardar', payload);
    const mensaje = payload.clienteID > 0
      ? `¡Institución "${payload.nombreComercial}" actualizada con éxito!`
      : `¡Institución "${payload.nombreComercial}" registrada con éxito!`;
    showSuccess(mensaje);
    emit('close', { canceled: false, data: payload });
  } catch (error) {
    showError(getErrorMessage(error, 'Error al guardar la institución'));
  } finally {
    isGuardando.value = false;
  }
};

const onCancelar = () => {
  emit('close', { canceled: true });
};
</script>
