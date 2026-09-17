<script setup>
import { ref, computed, watch } from 'vue';
import { DxForm, DxGroupItem, DxSimpleItem, DxRequiredRule } from 'devextreme-vue/form';
import { DxButton } from 'devextreme-vue/button';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
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
  },
  isGuardando: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:visible', 'guardar']);

const dxFormRef = ref(null);

const formSubidaManual = ref({
  categoriaID: 1,
  codigoFijo: '',
  tituloPersonalizado: '',
  version: '2026.1',
  tamanoArchivoMB: 3.5,
  urlArchivo: ''
});

watch(() => [props.visible, props.manualFijo, props.empresa], () => {
  if (props.visible && props.manualFijo && props.empresa) {
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
}, { immediate: true });

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

  emit('guardar', {
    payload,
    manualFijo: props.manualFijo,
    empresa: props.empresa,
    formValues: { ...formSubidaManual.value }
  });
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
            Cargar Manual con Logo Institucional
          </h3>
          <span class="text-xs text-slate-500 font-semibold">
            Institución: {{ empresa?.nombreComercial }}
          </span>
        </div>
        <button type="button" @click="cerrarModal" class="text-slate-400 hover:text-slate-600">
          <i class="fa-light fa-xmark text-lg"></i>
        </button>
      </div>

      <!-- Regla 2.1: Envoltura de Formulario Obligatoria -->
      <form @submit.prevent="handleSubmit" class="space-y-3.5">
        
        <div class="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-300">
          <strong>Manual Requerido MINEDU:</strong> {{ manualFijo?.tituloBase }}
        </div>

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
        <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <DxButton
            text="Cancelar"
            type="normal"
            styling-mode="outlined"
            :disabled="isGuardando"
            @click="cerrarModal"
          />
          <DxButton
            :text="isGuardando ? 'Guardando...' : 'Confirmar y Publicar Manual'"
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
