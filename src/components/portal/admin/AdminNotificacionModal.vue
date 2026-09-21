<template>
  <div class="p-2 space-y-4 max-h-[85vh] overflow-y-auto">
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <DxForm
        ref="dxFormRef"
        :form-data="formNotificacion"
        label-location="top"
        validation-group="notificacionValidationGroup"
      >
        <!-- DATOS PRINCIPALES DE LA NOTIFICACIÓN -->
        <DxGroupItem :col-count="2">
          <DxSimpleItem data-field="titulo" :col-span="2" :editor-options="tituloOptions">
            <DxRequiredRule message="El título de la notificación es obligatorio" />
          </DxSimpleItem>

          <DxSimpleItem
            data-field="tipoNotificacion"
            editor-type="dxSelectBox"
            :editor-options="tipoOptions"
          >
            <DxRequiredRule message="Seleccione el tipo de notificación" />
          </DxSimpleItem>

          <DxSimpleItem data-field="version" :editor-options="versionOptions" />

          <DxSimpleItem
            data-field="fechaPublicacion"
            editor-type="dxDateBox"
            :editor-options="fechaPublicacionOptions"
          >
            <DxRequiredRule message="La fecha de publicación es obligatoria" />
          </DxSimpleItem>

          <DxSimpleItem
            data-field="fechaExpiracion"
            editor-type="dxDateBox"
            :editor-options="fechaExpiracionOptions"
          />
        </DxGroupItem>
      </DxForm>

      <!-- PLATAFORMAS DESTINATARIAS -->
      <div class="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/60">
        <p class="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2.5 flex items-center gap-1.5">
          <i class="fa-light fa-users-viewfinder text-sky-500"></i> Seleccione qué usuarios verán esta notificación:
        </p>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <DxCheckBox
            v-model:value="formNotificacion.aplicaAlumnos"
            text="🎓 Alumnos"
          />
          <DxCheckBox
            v-model:value="formNotificacion.aplicaDocentes"
            text="👨‍🏫 Docentes"
          />
          <DxCheckBox
            v-model:value="formNotificacion.aplicaAdministrativos"
            text="🏢 Administrativos"
          />
          <DxCheckBox
            v-model:value="formNotificacion.aplicaPadres"
            text="👨‍👩‍👧 Padres de Familia"
          />
        </div>
      </div>

      <!-- OPCIONES DE COMPORTAMIENTO -->
      <div class="flex flex-col sm:flex-row gap-6 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700/60">
        <DxCheckBox
          v-model:value="formNotificacion.mostrarPopupInicio"
          text="Mostrar como Popup emergente al iniciar sesión"
        />
        <DxCheckBox
          v-model:value="formNotificacion.activo"
          text="Notificación Activa / Visible"
        />
      </div>

      <!-- EDITOR ENRIQUECIDO DXHTMLEDITOR (Completamente independiente) -->
      <div class="space-y-1.5">
        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Contenido Detallado de la Notificación / ChangeLog:
        </label>
        <div class="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-slate-900">
          <DxHtmlEditor
            v-model:value="formNotificacion.contenidoHtml"
            :height="260"
            placeholder="Redacte las novedades, detalles, capturas o instrucciones aquí..."
          >
            <DxToolbar>
              <DxItem name="undo" />
              <DxItem name="redo" />
              <DxItem name="separator" />
              <DxItem name="header" :accepted-values="[false, 1, 2, 3, 4]" />
              <DxItem name="separator" />
              <DxItem name="bold" />
              <DxItem name="italic" />
              <DxItem name="strike" />
              <DxItem name="underline" />
              <DxItem name="separator" />
              <DxItem name="alignLeft" />
              <DxItem name="alignCenter" />
              <DxItem name="alignRight" />
              <DxItem name="separator" />
              <DxItem name="orderedList" />
              <DxItem name="bulletList" />
              <DxItem name="separator" />
              <DxItem name="color" />
              <DxItem name="background" />
              <DxItem name="separator" />
              <DxItem name="link" />
              <DxItem name="insertTable" />
              <DxItem name="deleteTable" />
              <DxItem name="clear" />
            </DxToolbar>
          </DxHtmlEditor>
        </div>
      </div>

      <!-- BOTONES DE ACCIÓN (Regla 6.3: Alineados a la derecha, Cancelar izquierda, Guardar derecha) -->
      <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <DxButton
          text="Cancelar"
          icon="close"
          type="normal"
          styling-mode="outlined"
          :disabled="isGuardando"
          @click="onCancelar"
        />
        <DxButton
          :text="isGuardando ? 'Guardando Notificación...' : (notificacionAEditar ? 'Actualizar Notificación' : 'Guardar Notificación')"
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
import { DxForm, DxGroupItem, DxSimpleItem, DxRequiredRule } from 'devextreme-vue/form';
import { DxHtmlEditor, DxToolbar, DxItem } from 'devextreme-vue/html-editor';
import { DxButton } from 'devextreme-vue/button';
import { DxCheckBox } from 'devextreme-vue/check-box';
import apiClient from '@/api/axiosConfig';
import { showSuccess, showError } from '@/services/notification';
import { getErrorMessage } from '@/services/errorHandler';

const props = defineProps({
  notificacionAEditar: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close']);

const dxFormRef = ref(null);
const isGuardando = ref(false);

const formNotificacion = ref({
  notificacionID: 0,
  titulo: '',
  version: '2026.09.1',
  tipoNotificacion: 'MEJORA',
  contenidoHtml: '',
  aplicaAlumnos: true,
  aplicaDocentes: true,
  aplicaAdministrativos: true,
  aplicaPadres: false,
  mostrarPopupInicio: true,
  fechaPublicacion: new Date(),
  fechaExpiracion: null,
  activo: true
});

onMounted(() => {
  if (props.notificacionAEditar) {
    formNotificacion.value = {
      notificacionID: props.notificacionAEditar.notificacionID || 0,
      titulo: props.notificacionAEditar.titulo || '',
      version: props.notificacionAEditar.version || '2026.09.1',
      tipoNotificacion: props.notificacionAEditar.tipoNotificacion || 'MEJORA',
      contenidoHtml: props.notificacionAEditar.contenidoHtml || '',
      aplicaAlumnos: props.notificacionAEditar.aplicaAlumnos ?? true,
      aplicaDocentes: props.notificacionAEditar.aplicaDocentes ?? true,
      aplicaAdministrativos: props.notificacionAEditar.aplicaAdministrativos ?? true,
      aplicaPadres: props.notificacionAEditar.aplicaPadres ?? false,
      mostrarPopupInicio: props.notificacionAEditar.mostrarPopupInicio ?? true,
      fechaPublicacion: props.notificacionAEditar.fechaPublicacion ? new Date(props.notificacionAEditar.fechaPublicacion) : new Date(),
      fechaExpiracion: props.notificacionAEditar.fechaExpiracion ? new Date(props.notificacionAEditar.fechaExpiracion) : null,
      activo: props.notificacionAEditar.activo ?? true
    };
  } else {
    formNotificacion.value = {
      notificacionID: 0,
      titulo: '',
      version: `2026.${new Date().getMonth() + 1}.${new Date().getDate()}`,
      tipoNotificacion: 'MEJORA',
      contenidoHtml: '<h3>✨ Novedades y Actualizaciones</h3><p>Te presentamos las mejoras incorporadas en esta versión:</p><ul><li><strong>Nueva funcionalidad:</strong> Descripción detallada de la mejora.</li><li><strong>Optimización:</strong> Mayor velocidad y rendimiento en los módulos.</li></ul>',
      aplicaAlumnos: true,
      aplicaDocentes: true,
      aplicaAdministrativos: true,
      aplicaPadres: false,
      mostrarPopupInicio: true,
      fechaPublicacion: new Date(),
      fechaExpiracion: null,
      activo: true
    };
  }
});

// Opciones reactivas computed para DxForm (Regla 2.4 @AGENT)
const tiposNotificacion = [
  { id: 'MEJORA', nombre: '✨ Nueva Mejora / Feature' },
  { id: 'CORRECCION', nombre: '🛠️ Corrección de Errores (Fix)' },
  { id: 'COMUNICADO', nombre: '📢 Comunicado General' },
  { id: 'MANTENIMIENTO', nombre: '⚠️ Mantenimiento Programado' }
];

const tipoOptions = computed(() => ({
  dataSource: tiposNotificacion,
  displayExpr: 'nombre',
  valueExpr: 'id',
  placeholder: 'Seleccione el tipo'
}));

const tituloOptions = computed(() => ({
  placeholder: 'Ej: Versión 2026.09 - Nueva Aula Virtual y Mejoras de Asistencia'
}));

const versionOptions = computed(() => ({
  placeholder: 'Ej: v2.5.0 o 2026.09.21'
}));

const fechaPublicacionOptions = computed(() => ({
  displayFormat: 'yyyy-MM-dd',
  type: 'date'
}));

const fechaExpiracionOptions = computed(() => ({
  displayFormat: 'yyyy-MM-dd',
  type: 'date',
  placeholder: 'Opcional (sin límite si está vacío)'
}));

const handleSubmit = async () => {
  if (!dxFormRef.value) return;
  const validationResult = dxFormRef.value.instance.validate();
  if (!validationResult.isValid) return;

  isGuardando.value = true;
  try {
    const payload = { ...formNotificacion.value };
    const response = await apiClient.post('/portal-cliente/admin/notificaciones/guardar', payload);
    const mensaje = payload.notificacionID > 0
      ? `¡Notificación "${payload.titulo}" actualizada exitosamente!`
      : `¡Notificación "${payload.titulo}" creada exitosamente!`;
    showSuccess(mensaje);
    emit('close', { canceled: false, data: response.data });
  } catch (error) {
    showError(getErrorMessage(error, 'Error al guardar la notificación'));
  } finally {
    isGuardando.value = false;
  }
};

const onCancelar = () => {
  emit('close', { canceled: true });
};
</script>
