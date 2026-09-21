<template>
  <div class="p-2 space-y-4 max-h-[85vh] overflow-y-auto overflow-x-hidden">
    <!-- Regla 2.1: Envoltura de Formulario Obligatoria -->
    <form @submit.prevent="handleSubmit" class="space-y-4">
      
      <!-- Regla 2.2 y 2.3: Único DxForm con DxGroupItem y DxSimpleItem -->
      <DxForm
        ref="dxFormRef"
        :form-data="formNotificacion"
        label-location="top"
        validation-group="notificacionValidationGroup"
        :col-count="1"
      >
        <!-- DATOS PRINCIPALES DE LA NOTIFICACIÓN -->
        <DxGroupItem :col-count="3">
          <DxSimpleItem data-field="titulo" :col-span="3" :editor-options="tituloOptions">
            <DxLabel text="Título de la Notificación / Novedad" />
            <DxRequiredRule message="El título de la notificación es obligatorio" />
          </DxSimpleItem>
    </DxGroupItem>

      <DxGroupItem :col-count="2">
          <DxSimpleItem
            data-field="tipoNotificacion"
            editor-type="dxSelectBox"
            :editor-options="tipoOptions"
          >
            <DxLabel text="Tipo de Notificación" />
            <DxRequiredRule message="Seleccione el tipo de notificación" />
          </DxSimpleItem>

          <DxSimpleItem data-field="version" :editor-options="versionOptions">
            <DxLabel text="Versión / Código" />
          </DxSimpleItem>

          <DxSimpleItem
            data-field="fechaPublicacion"
            editor-type="dxDateBox"
            :editor-options="fechaPublicacionOptions"
          >
            <DxLabel text="Fecha de Publicación" />
            <DxRequiredRule message="La fecha de publicación es obligatoria" />
          </DxSimpleItem>

          <DxSimpleItem
            data-field="fechaExpiracion"
            editor-type="dxDateBox"
            :editor-options="fechaExpiracionOptions"
          >
            <DxLabel text="Fecha de Expiración (Opcional)" />
          </DxSimpleItem>
        </DxGroupItem>

        <!-- AUDIENCIA / PLATAFORMAS DESTINATARIAS -->
        <DxGroupItem :col-count="4">
          <DxSimpleItem
            data-field="aplicaAlumnos"
            editor-type="dxCheckBox"
            :editor-options="checkAlumnosOptions"
          >
            <DxLabel :visible="false" />
          </DxSimpleItem>

          <DxSimpleItem
            data-field="aplicaDocentes"
            editor-type="dxCheckBox"
            :editor-options="checkDocentesOptions"
          >
            <DxLabel :visible="false" />
          </DxSimpleItem>

          <DxSimpleItem
            data-field="aplicaAdministrativos"
            editor-type="dxCheckBox"
            :editor-options="checkAdminOptions"
          >
            <DxLabel :visible="false" />
          </DxSimpleItem>

          <DxSimpleItem
            data-field="aplicaPadres"
            editor-type="dxCheckBox"
            :editor-options="checkPadresOptions"
          >
            <DxLabel :visible="false" />
          </DxSimpleItem>
        </DxGroupItem>

        <!-- COMPORTAMIENTO Y VISIBILIDAD -->
        <DxGroupItem :col-count="2">
          <DxSimpleItem
            data-field="mostrarPopupInicio"
            editor-type="dxCheckBox"
            :editor-options="checkPopupOptions"
          >
            <DxLabel :visible="false" />
          </DxSimpleItem>

          <DxSimpleItem
            data-field="activo"
            editor-type="dxCheckBox"
            :editor-options="checkActivoOptions"
          >
            <DxLabel :visible="false" />
          </DxSimpleItem>
        </DxGroupItem>

        <!-- CONTENIDO DETALLADO CON DXHTMLEDITOR (Estándar oficial SIAPPClient) -->
        <DxGroupItem>
          <DxSimpleItem
            data-field="contenidoHtml"
            editor-type="dxHtmlEditor"
            :editor-options="htmlEditorOptions"
          >
            <DxLabel :visible="false" />
            <DxRequiredRule message="El contenido de la notificación es obligatorio" />
          </DxSimpleItem>
        </DxGroupItem>
      </DxForm>

      <!-- BOTONES DE ACCIÓN (Regla 6.3: Alineados a la derecha, Cancelar izquierda, Guardar derecha) -->
      <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <DxButton
          text="Cancelar"
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
import { ref, reactive, onMounted } from 'vue';
import { DxForm, DxGroupItem, DxSimpleItem, DxLabel, DxRequiredRule } from 'devextreme-vue/form';
import { DxButton } from 'devextreme-vue/button';
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

const formNotificacion = reactive({
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
    Object.assign(formNotificacion, {
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
    });
  } else {
    Object.assign(formNotificacion, {
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
    });
  }
});

// Opciones estáticas con items directos para dxSelectBox
const tiposNotificacion = [
  { id: 'MEJORA', text: '✨ Nueva Mejora / Feature' },
  { id: 'CORRECCION', text: '🛠️ Corrección de Errores (Fix)' },
  { id: 'COMUNICADO', text: '📢 Comunicado General' },
  { id: 'MANTENIMIENTO', text: '⚠️ Mantenimiento Programado' }
];

const tipoOptions = {
  items: tiposNotificacion,
  displayExpr: 'text',
  valueExpr: 'id',
  placeholder: 'Seleccione el tipo de notificación',
  dropDownOptions: {
    container: 'body'
  }
};

const tituloOptions = {
  placeholder: 'Ej: Versión 2026.09 - Nueva Aula Virtual y Mejoras de Asistencia'
};

const versionOptions = {
  placeholder: 'Ej: v2.5.0 o 2026.09.21'
};

const fechaPublicacionOptions = {
  displayFormat: 'yyyy-MM-dd',
  type: 'date'
};

const fechaExpiracionOptions = {
  displayFormat: 'yyyy-MM-dd',
  type: 'date',
  placeholder: 'Opcional (sin límite si está vacío)'
};

const checkAlumnosOptions = { text: '🎓 Portal Alumnos' };
const checkDocentesOptions = { text: '👨‍🏫 Portal Docentes' };
const checkAdminOptions = { text: '🏢 Administrativos' };
const checkPadresOptions = { text: '👨‍👩‍👧 Padres de Familia' };
const checkPopupOptions = { text: 'Mostrar popup modal de bienvenida al iniciar sesión' };
const checkActivoOptions = { text: 'Notificación activa y visible' };

// Configuración estática de DxHtmlEditor (Idéntica a SIAPPClient)
const htmlEditorOptions = {
  placeholder: 'Redacte las novedades, detalles, capturas o instrucciones aquí...',
  height: 280,
  toolbar: {
    multiline: false,
    items: [
      'undo', 'redo', 'separator',
      {
        name: 'header',
        acceptedValues: [false, 1, 2, 3, 4]
      },
      'separator',
      'bold', 'italic', 'underline', 'strike', 'separator',
      'alignLeft', 'alignCenter', 'alignRight', 'alignJustify', 'separator',
      'orderedList', 'bulletList', 'separator',
      'color', 'background', 'separator',
      'link', 'image', 'separator',
      'insertTable', 'deleteTable', 'separator',
      'clear'
    ]
  },
  mediaResizing: {
    enabled: true
  }
};

const handleSubmit = async () => {
  if (!dxFormRef.value) return;
  const validationResult = dxFormRef.value.instance.validate();
  if (!validationResult.isValid) return;

  isGuardando.value = true;
  try {
    const payload = { ...formNotificacion };
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
