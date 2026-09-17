<script setup>
import { ref, watch } from 'vue';

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

const cerrarModal = () => {
  emit('update:visible', false);
};

const onSubmit = () => {
  if (!formSubidaManual.value.tituloPersonalizado || !formSubidaManual.value.urlArchivo) {
    alert('Ingrese el título y la ruta del archivo PDF.');
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

      <form @submit.prevent="onSubmit" class="space-y-3.5">
        
        <div class="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-300">
          <strong>Manual Requerido MINEDU:</strong> {{ manualFijo?.tituloBase }}
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Título Oficial del Documento:</label>
          <input
            v-model="formSubidaManual.tituloPersonalizado"
            type="text"
            required
            class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-semibold"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Versión del Manual:</label>
            <input
              v-model="formSubidaManual.version"
              type="text"
              class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tamaño Estimado (MB):</label>
            <input
              v-model="formSubidaManual.tamanoArchivoMB"
              type="number"
              step="0.1"
              class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Ruta o URL del PDF (con logo del instituto):</label>
          <input
            v-model="formSubidaManual.urlArchivo"
            type="text"
            required
            placeholder="/documentos/siapp/manual-academico-siapp.pdf"
            class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white"
          />
          <span class="text-[10px] text-slate-400 mt-0.5 block">Puedes guardarlo en public/documentos/[instituto]/ o en almacenamiento cloud</span>
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
            class="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5"
          >
            <i v-if="isGuardando" class="fa-solid fa-spinner fa-spin"></i>
            <span>{{ isGuardando ? 'Guardando...' : 'Confirmar y Publicar Manual' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
