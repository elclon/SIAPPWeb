<template>
  <div class="p-2 space-y-4 max-h-[85vh] overflow-y-auto">
    <div class="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-300">
      <strong>Manual Requerido MINEDU:</strong> {{ manualFijo?.tituloBase }}
      <span v-if="empresa?.nombreComercial" class="block mt-1 font-semibold">
        Institución: {{ empresa.nombreComercial }}
      </span>
    </div>

    <!-- Regla 2.1: Envoltura de Formulario Obligatoria -->
    <form @submit.prevent="handleSubmit" class="space-y-3.5">
      <!-- Regla 2.2: DxForm único -->
      <DxForm
        ref="dxFormRef"
        :form-data="formSubidaManual"
        validation-group="manualValidationGroup"
        :col-count="2"
        label-location="top"
      >
        <DxSimpleItem data-field="tituloPersonalizado" :col-span="2" caption="Título Oficial" :editor-options="tituloOptions">
          <DxRequiredRule message="El título es obligatorio" />
        </DxSimpleItem>

        <DxSimpleItem data-field="version" caption="Versión" :editor-options="versionOptions" />

        <DxSimpleItem data-field="tamanoArchivoMB" caption="Tamaño Estimado (MB)" editor-type="dxNumberBox" :editor-options="tamanoOptions">
          <DxRequiredRule message="Requerido" />
        </DxSimpleItem>

        <DxSimpleItem data-field="urlArchivo" :col-span="2" caption="Ruta o URL del PDF" :editor-options="urlArchivoOptions">
          <DxRequiredRule message="La ruta del archivo es obligatoria" />
        </DxSimpleItem>
      </DxForm>

      <!-- Regla 6.3: Orden estricto [ Cancelar ] [ Confirmar y Publicar ] -->
      <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
        <DxButton
          text="Cancelar"
          type="normal"
          styling-mode="outlined"
          :disabled="isGuardando"
          @click="onCancelar"
        />
        <DxButton
          :text="isGuardando ? 'Guardando...' : 'Confirmar y Publicar Manual'"
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
import { showSuccess, showError } from '@/services/notification';
import { getErrorMessage } from '@/services/errorHandler';

const props = defineProps({
  empresa: {
    type: Object,
    default: null
  },
  manualFijo: {
    type: Object,
    default: null
  },
  manualSubido: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close']);

const dxFormRef = ref(null);
const isGuardando = ref(false);

const formSubidaManual = ref({
  categoriaID: 1,
  codigoFijo: '',
  tituloPersonalizado: '',
  version: '2026.1',
  tamanoArchivoMB: 3.5,
  urlArchivo: ''
});

onMounted(() => {
  if (props.manualFijo && props.empresa) {
    const yaSubido = props.manualSubido;
    const codInstitucion = props.empresa.codigoConexion || 'instituto';

    formSubidaManual.value = {
      categoriaID: props.manualFijo.categoriaID,
      codigoFijo: props.manualFijo.codigoFijo,
      tituloPersonalizado: yaSubido ? yaSubido.titulo : `${props.manualFijo.tituloBase} (Logo ${props.empresa.nombreComercial})`,
      version: yaSubido ? yaSubido.version : '2026.1',
      tamanoArchivoMB: yaSubido ? yaSubido.tamanoArchivoMB : 3.5,
      urlArchivo: yaSubido ? yaSubido.urlArchivo : `/documentos/${codInstitucion}/${props.manualFijo.codigoFijo.toLowerCase()}-${codInstitucion}.pdf`
    };
  }
});

// Regla 2.4: Editor Options con computed(...)
const tituloOptions = computed(() => ({
  placeholder: 'Ej: Manual Operativo: Módulo Académico (Logo SIAPP)'
}));

const versionOptions = computed(() => ({
  placeholder: '2026.1'
}));

const tamanoOptions = computed(() => ({
  min: 0.1,
  step: 0.1,
  format: '#0.0 \'MB\''
}));

const urlArchivoOptions = computed(() => ({
  placeholder: '/documentos/siapp/manual-academico-siapp.pdf'
}));

const handleSubmit = async () => {
  const validationResult = dxFormRef.value?.instance?.validate();
  if (!validationResult || !validationResult.isValid) {
    return;
  }

  isGuardando.value = true;
  try {
    const payload = {
      clienteIDExclusivo: props.empresa.clienteID,
      categoriaID: formSubidaManual.value.categoriaID,
      titulo: formSubidaManual.value.tituloPersonalizado,
      descripcion: props.manualFijo.descripcion,
      version: formSubidaManual.value.version,
      tipoArchivo: 'PDF',
      tamanoArchivoMB: parseFloat(formSubidaManual.value.tamanoArchivoMB),
      urlArchivo: formSubidaManual.value.urlArchivo,
      esPublicoTodosLosClientes: false
    };

    await apiClient.post('/portal-cliente/admin/documentos/guardar', payload);
    showSuccess(`¡${formSubidaManual.value.tituloPersonalizado} guardado con éxito para ${props.empresa.nombreComercial}!`);
    emit('close', { canceled: false, data: payload });
  } catch (error) {
    showError(getErrorMessage(error, 'Error al registrar el documento'));
  } finally {
    isGuardando.value = false;
  }
};

const onCancelar = () => {
  emit('close', { canceled: true });
};
</script>
