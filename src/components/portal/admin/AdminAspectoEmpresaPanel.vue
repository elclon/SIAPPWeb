<template>
  <div class="space-y-6 animate-in fade-in duration-200">
    <!-- BARRA SUPERIOR PRINCIPAL DEL PANEL: IDENTIFICACIÓN Y REGRESO -->
    <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <DxButton
          icon="back"
          type="normal"
          styling-mode="outlined"
          hint="Volver al Directorio de Empresas"
          @click="$emit('volver')"
        />

        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-heading">
              Aspecto y Logotipos: {{ empresa?.nombreComercial || 'Institución Educativa' }}
            </h2>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              RUC: {{ empresa?.ruc || '-' }}
            </span>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              ID Empresa: {{ idEmpresaNumerico }}
            </span>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              Enlace: {{ empresa?.codigoConexion || 'default' }}
            </span>
          </div>

          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Gestiona la paleta de colores de la barra superior y carga los logotipos oficiales de alta resolución para <strong>{{ empresa?.nombreComercial }}</strong>.
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2 self-end md:self-auto">
        <DxButton
          text="Recargar Datos"
          icon="refresh"
          type="normal"
          styling-mode="outlined"
          :disabled="isLoading || isSavingColores"
          @click="cargarDatosAspecto"
        />
        <DxButton
          text="Volver al Directorio"
          icon="arrowleft"
          type="default"
          styling-mode="outlined"
          @click="$emit('volver')"
        />
      </div>
    </div>

    <!-- SECCIÓN 1: COLORES DE LA BARRA SUPERIOR (TOPBAR) Y SIMULADOR -->
    <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6">
      <div class="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div class="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-lg">
          <i class="fa-light fa-swatchbook"></i>
        </div>
        <div>
          <h3 class="text-base font-bold text-slate-800 dark:text-slate-100">Colores de la Barra Superior (TopBar)</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">Personaliza la tonalidad de fondo y el color de texto e iconos para esta institución educativa</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <!-- Formulario de Selección de Colores -->
        <div class="lg:col-span-5 bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80">
          <form @submit.prevent="guardarColores" class="space-y-4">
            <DxForm
              ref="dxFormColoresRef"
              :form-data="coloresModel"
              label-location="top"
              validation-group="aspectoColoresValidationGroup"
            >
              <DxGroupItem :col-count="2">
                <DxSimpleItem
                  data-field="backgroundColorTopBar"
                  editor-type="dxColorBox"
                  :editor-options="colorFondoOptions"
                >
                  <DxRequiredRule message="El color de fondo es requerido" />
                </DxSimpleItem>

                <DxSimpleItem
                  data-field="textoColorTopBar"
                  editor-type="dxColorBox"
                  :editor-options="colorTextoOptions"
                >
                  <DxRequiredRule message="El color del texto es requerido" />
                </DxSimpleItem>
              </DxGroupItem>
            </DxForm>

            <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
              <DxButton
                text="Restablecer Colores"
                icon="undo"
                type="normal"
                styling-mode="outlined"
                :disabled="isSavingColores"
                @click="onRestablecerColores"
              />
              <DxButton
                :text="isSavingColores ? 'Guardando...' : 'Guardar Colores'"
                :icon="isSavingColores ? 'fa-light fa-spinner fa-spin' : 'save'"
                type="default"
                styling-mode="contained"
                :disabled="isSavingColores"
                use-submit-behavior="true"
              />
            </div>
          </form>
        </div>

        <!-- Previsualización en Vivo de la TopBar -->
        <div class="lg:col-span-7 flex flex-col gap-3">
          <div class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <i class="fa-light fa-eye text-blue-500"></i>
            Previsualización en tiempo real de la cabecera
          </div>

          <div class="rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700 shadow-sm bg-slate-100 dark:bg-slate-950 p-2">
            <!-- Barra Superior Principal Simulada -->
            <div
              class="relative w-full h-12 flex items-center justify-between px-4 rounded-xl transition-colors duration-200 shadow-inner"
              :style="simuladorTopBarStyle"
            >
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full bg-white/95 p-1 shadow flex items-center justify-center overflow-hidden">
                  <img
                    :src="urlPreviewLogoAdmin"
                    alt="Logo Institución"
                    class="w-full h-full object-contain"
                    @error="onPreviewLogoError"
                  />
                </div>
                <span
                  class="font-extrabold text-sm tracking-wider uppercase truncate transition-colors duration-200"
                  :style="simuladorTextoStyle"
                >
                  {{ empresa?.nombreComercial || 'SIAPP' }}
                </span>
              </div>

              <div class="flex items-center gap-3">
                <div class="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-black/10 backdrop-blur-sm" :style="simuladorTextoStyle">
                  <i class="fa-light fa-user text-xs"></i>
                  <span class="text-xs font-medium">Administrador</span>
                </div>
                <i class="fa-light fa-circle-question text-base cursor-pointer hover:opacity-80 transition-opacity" :style="simuladorTextoStyle"></i>
                <i class="fa-light fa-right-from-bracket text-base cursor-pointer hover:opacity-80 transition-opacity" :style="simuladorTextoStyle"></i>
              </div>
            </div>

            <!-- Sub-barra simulada con Ribbon Tabs -->
            <div class="h-9 bg-slate-200/90 dark:bg-slate-800/90 rounded-b-xl flex items-center px-4 gap-4 text-xs text-slate-600 dark:text-slate-300 mt-1 border-t border-black/5">
              <span class="font-bold text-slate-900 dark:text-white px-2 py-1 rounded bg-white/60 dark:bg-slate-700/60 shadow-xs">Académico</span>
              <span class="hover:text-slate-900 dark:hover:text-white cursor-pointer">Docentes</span>
              <span class="hover:text-slate-900 dark:hover:text-white cursor-pointer">Caja & Cobranzas</span>
              <span class="hover:text-slate-900 dark:hover:text-white cursor-pointer">Seguridad</span>
            </div>
          </div>

          <p class="text-xs text-slate-400 dark:text-slate-500 italic">
            Esta combinación de colores se aplicará automáticamente en todos los módulos y pantallas del portal para la institución.
          </p>
        </div>
      </div>
    </div>

    <!-- SECCIÓN 2: GALERÍA DE LOGOTIPOS E IMÁGENES INSTITUCIONALES -->
    <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6">
      <div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 flex-wrap gap-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg">
            <i class="fa-light fa-images"></i>
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-800 dark:text-slate-100">Logotipos e Imágenes Institucionales</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">Configura los gráficos oficiales para cada pantalla, portal web y documentos oficiales en PDF</p>
          </div>
        </div>

        <span class="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full font-medium">
          Formatos admitidos: PNG, JPG, SVG, WebP (Máx. 10MB)
        </span>
      </div>

      <!-- Cuadrícula Responsiva Amplia de 3 Columnas (6 Tipos: B, L, T, P, D, R) -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="item in listaImagenes"
          :key="item.tipoImagenID"
          class="bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-md"
        >
          <div>
            <!-- Encabezado de la Tarjeta -->
            <div class="flex items-start justify-between gap-2 mb-3">
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                  Tipo {{ item.tipoImagenID }}
                </span>
                <h4 class="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {{ item.nombreTipo }}
                </h4>
              </div>

              <span
                class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                :class="item.tieneImagen ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'"
              >
                {{ item.tieneImagen ? 'Personalizado' : 'Predeterminado' }}
              </span>
            </div>

            <p class="text-xs text-slate-500 dark:text-slate-400 mb-4 min-h-[36px] line-clamp-2">
              {{ item.descripcion }}
            </p>

            <!-- Área de Vista Previa con Fondo Damero y Efecto Zoom -->
            <div class="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 h-40 flex items-center justify-center p-4 mb-4 bg-white dark:bg-slate-900 shadow-inner group">
              <div class="absolute inset-0 opacity-40 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:12px_12px] dark:bg-[radial-gradient(#334155_1px,transparent_1px)]"></div>

              <img
                :src="obtenerUrlVisualizacion(item)"
                :alt="item.nombreTipo"
                class="relative z-10 max-h-full max-w-full object-contain transition-transform duration-200 group-hover:scale-105"
                @error="onImgError($event, item.tipoImagenID)"
              />
            </div>

            <!-- Selector de Archivo DevExtreme -->
            <div class="mb-4">
              <DxFileUploader
                :ref="el => setFileUploaderRef(item.tipoImagenID, el)"
                select-button-text="Examinar..."
                label-text="o arrastre la imagen aquí"
                accept="image/png, image/jpeg, image/webp, image/svg+xml"
                upload-mode="useForm"
                :max-file-size="10485760"
                invalid-max-file-size-message="La imagen no debe superar los 10MB"
                @value-changed="e => onFileChanged(item.tipoImagenID, e)"
              />
            </div>
          </div>

          <!-- Botones de Acción de la Tarjeta -->
          <div class="pt-4 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-2">
            <div>
              <DxButton
                v-if="item.tieneImagen"
                text="Restablecer"
                icon="trash"
                type="danger"
                styling-mode="outlined"
                :disabled="isUploading[item.tipoImagenID] || isDeleting[item.tipoImagenID]"
                @click="onRestablecerImagen(item)"
              />
            </div>

            <div>
              <DxButton
                :text="isUploading[item.tipoImagenID] ? 'Subiendo...' : 'Guardar Imagen'"
                :icon="isUploading[item.tipoImagenID] ? 'fa-light fa-spinner fa-spin' : 'upload'"
                type="default"
                styling-mode="contained"
                :disabled="!archivosSeleccionados[item.tipoImagenID] || isUploading[item.tipoImagenID] || isDeleting[item.tipoImagenID]"
                @click="onSubirImagen(item.tipoImagenID)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import DxForm, { DxGroupItem, DxSimpleItem, DxRequiredRule } from 'devextreme-vue/form';
import DxFileUploader from 'devextreme-vue/file-uploader';
import { DxButton } from 'devextreme-vue/button';
import { confirm } from 'devextreme/ui/dialog';
import apiClient from '@/api/axiosConfig';
import { showSuccess, showError } from '@/services/notification';
import { getErrorMessage } from '@/services/errorHandler';

const props = defineProps({
  empresa: {
    type: Object,
    required: true
  }
});

defineEmits(['volver']);

// Mapeo conocido de alias de conexión a EmpresaID numérico estricto
// Identificador de la empresa: dinámico sin tablas fijas ni hardcodeo
const empresaIdDetectado = ref('');

const idEmpresaNumerico = computed(() => {
  if (empresaIdDetectado.value) {
    return empresaIdDetectado.value;
  }
  if (!props.empresa) return '01';

  // 1. Si la empresa ya viene con su empresaID registrado en CLI.Cliente (ej: "02", "08")
  if (props.empresa.empresaID && /^\d+$/.test(props.empresa.empresaID.toString().trim())) {
    return props.empresa.empresaID.toString().trim().padStart(2, '0');
  }

  // 2. Si codigoConexion es numérico
  const codigo = (props.empresa.codigoConexion || '').trim();
  if (codigo && /^\d+$/.test(codigo)) {
    return codigo.padStart(2, '0');
  }

  // 3. Si viene un código textual (ej: "demo", "itep"), enviarlo como identificador de consulta
  if (codigo) {
    return codigo;
  }

  // 4. Si clienteID existe
  if (props.empresa.clienteID && /^\d+$/.test(props.empresa.clienteID.toString())) {
    return props.empresa.clienteID.toString().padStart(2, '0');
  }

  return '01';
});

// Fallback de imagen SVG limpio
const logoFallbackPlaceholder = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>';

// Estados reactivos
const dxFormColoresRef = ref(null);
const isLoading = ref(false);
const isSavingColores = ref(false);

const coloresModel = reactive({
  backgroundColorTopBar: '#9b0202',
  textoColorTopBar: '#ffffff'
});

const listaImagenes = ref([]);
const archivosSeleccionados = reactive({});
const isUploading = reactive({});
const isDeleting = reactive({});
const fileUploaderRefs = reactive({});

const setFileUploaderRef = (tipo, el) => {
  if (el) {
    fileUploaderRefs[tipo] = el;
  }
};

// Opciones de Editores DevExtreme
const colorFondoOptions = computed(() => ({
  applyButtonText: 'Aplicar',
  cancelButtonText: 'Cancelar',
  stylingMode: 'outlined',
  label: 'Color de Fondo TopBar',
  labelMode: 'floating'
}));

const colorTextoOptions = computed(() => ({
  applyButtonText: 'Aplicar',
  cancelButtonText: 'Cancelar',
  stylingMode: 'outlined',
  label: 'Color de Texto e Iconos',
  labelMode: 'floating'
}));

// Estilos del Simulador en Vivo
const simuladorTopBarStyle = computed(() => ({
  backgroundColor: coloresModel.backgroundColorTopBar || '#9b0202'
}));

const simuladorTextoStyle = computed(() => ({
  color: coloresModel.textoColorTopBar || '#ffffff'
}));

// URL para el logo del simulador (Tipo B)
const urlPreviewLogoAdmin = computed(() => {
  const itemB = listaImagenes.value.find(img => img.tipoImagenID === 'B');
  if (itemB && itemB.tieneImagen && itemB.url) {
    return obtenerUrlVisualizacion(itemB);
  }
  return logoFallbackPlaceholder;
});

const onPreviewLogoError = (e) => {
  e.target.src = logoFallbackPlaceholder;
};

// Construcción de la URL de visualización absoluta
const obtenerUrlVisualizacion = (item) => {
  if (!item.tieneImagen || !item.url) {
    return logoFallbackPlaceholder;
  }

  if (item.url.startsWith('http://') || item.url.startsWith('https://')) {
    return item.url;
  }

  const rawBaseUrl = import.meta.env.PUBLIC_API_BASE_URL || import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? 'https://api.siapp.edu.pe' : 'https://localhost:7087');
  const baseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;
  const cleanPath = item.url.startsWith('/') ? item.url : `/${item.url}`;
  return `${baseUrl}${cleanPath}`;
};

const onImgError = (event) => {
  event.target.src = logoFallbackPlaceholder;
};

// Carga de configuración de aspecto de la empresa (con empresaId numérico estricto)
const cargarDatosAspecto = async () => {
  const idEmp = idEmpresaNumerico.value;
  if (!idEmp) return;

  isLoading.value = true;
  try {
    const response = await apiClient.get('/empresas/aspecto', {
      params: { empresaId: idEmp },
      headers: { 'X-Empresa-ID': idEmp }
    });
    const data = response.data || {};

    if (data.empresaID) {
      empresaIdDetectado.value = data.empresaID;
    }

    coloresModel.backgroundColorTopBar = data.backgroundColorTopBar || '#9b0202';
    coloresModel.textoColorTopBar = data.textoColorTopBar || '#ffffff';
    listaImagenes.value = data.imagenes || [];

    Object.keys(archivosSeleccionados).forEach(k => delete archivosSeleccionados[k]);
  } catch (error) {
    showError(getErrorMessage(error, 'Error al cargar la configuración de aspecto de la institución.'));
  } finally {
    isLoading.value = false;
  }
};

// Guardar Colores de la barra superior
const guardarColores = async () => {
  if (!dxFormColoresRef.value) return;

  const validationResult = dxFormColoresRef.value.instance.validate();
  if (!validationResult.isValid) {
    return;
  }

  const idEmp = idEmpresaNumerico.value;
  isSavingColores.value = true;
  try {
    await apiClient.post('/empresas/guardar-colores', {
      empresaID: idEmp,
      backgroundColorTopBar: coloresModel.backgroundColorTopBar,
      textoColorTopBar: coloresModel.textoColorTopBar
    }, {
      params: { empresaId: idEmp },
      headers: { 'X-Empresa-ID': idEmp }
    });

    showSuccess('Colores institucionales guardados correctamente.');
  } catch (error) {
    showError(getErrorMessage(error, 'Error al guardar los colores de la institución.'));
  } finally {
    isSavingColores.value = false;
  }
};

const onRestablecerColores = () => {
  coloresModel.backgroundColorTopBar = '#9b0202';
  coloresModel.textoColorTopBar = '#ffffff';
};

const onFileChanged = (tipo, e) => {
  if (e.value && e.value.length > 0) {
    archivosSeleccionados[tipo] = e.value[0];
  } else {
    delete archivosSeleccionados[tipo];
  }
};

// Subir Imagen de Logotipo
const onSubirImagen = async (tipo) => {
  const archivo = archivosSeleccionados[tipo];
  if (!archivo) return;

  const idEmp = idEmpresaNumerico.value;
  isUploading[tipo] = true;
  try {
    const formData = new FormData();
    formData.append('EmpresaID', idEmp);
    formData.append('TipoImagenID', tipo);
    formData.append('Imagen', archivo);

    await apiClient.post('/empresas/guardar-imagen', formData, {
      params: { empresaId: idEmp },
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-Empresa-ID': idEmp
      }
    });

    showSuccess('Logotipo actualizado correctamente.');

    if (fileUploaderRefs[tipo] && fileUploaderRefs[tipo].instance) {
      fileUploaderRefs[tipo].instance.reset();
    }
    delete archivosSeleccionados[tipo];

    await cargarDatosAspecto();
  } catch (error) {
    showError(getErrorMessage(error, 'Error al subir la imagen.'));
  } finally {
    isUploading[tipo] = false;
  }
};

// Restablecer imagen al predeterminado
const onRestablecerImagen = async (item) => {
  const confirmado = await confirm(
    `¿Desea restablecer el logotipo de "${item.nombreTipo}" a la imagen predeterminada del sistema?`,
    'Confirmar Restablecimiento'
  );

  if (!confirmado) return;

  const idEmp = idEmpresaNumerico.value;
  const tipo = item.tipoImagenID;
  isDeleting[tipo] = true;

  try {
    await apiClient.delete(`/empresas/imagen/${tipo}`, {
      params: { empresaId: idEmp },
      headers: { 'X-Empresa-ID': idEmp }
    });

    showSuccess('Logotipo restablecido al predeterminado.');
    await cargarDatosAspecto();
  } catch (error) {
    showError(getErrorMessage(error, 'Error al restablecer el logotipo.'));
  } finally {
    isDeleting[tipo] = false;
  }
};

onMounted(() => {
  cargarDatosAspecto();
});
</script>
