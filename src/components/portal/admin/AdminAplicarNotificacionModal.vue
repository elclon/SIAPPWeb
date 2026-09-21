<template>
  <div class="h-full flex flex-col justify-between overflow-hidden p-2 space-y-4">
    <!-- DESCRIPCIÓN Y RESUMEN -->
    <div class="bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 p-4 rounded-2xl flex items-center justify-between gap-4">
      <div>
        <p class="text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
          <i class="fa-light fa-buildings text-blue-600 dark:text-blue-400"></i>
          Seleccione las Instituciones Educativas a las que se mostrará este ChangeLog / Aviso
        </p>
        <p class="text-[11px] text-blue-700 dark:text-blue-300/80 mt-0.5">
          Al aplicar, la notificación se registrará y replicará automáticamente en la base de datos de cada institución seleccionada.
        </p>
      </div>
      <div class="shrink-0 text-right">
        <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-600 text-white shadow-sm">
          {{ selectedRowKeys.length }} de {{ empresas.length }} seleccionadas
        </span>
      </div>
    </div>

    <!-- DATA GRID DE EMPRESAS CON MULTISELECCIÓN -->
    <div class="flex-1 min-h-[300px] max-h-[50vh] overflow-hidden border border-slate-200 dark:border-slate-800 rounded-2xl">
      <DxDataGrid
        ref="dataGridRef"
        :data-source="empresas"
        :show-borders="false"
        :hover-state-enabled="true"
        :row-alternation-enabled="true"
        v-model:selected-row-keys="selectedRowKeys"
        key-expr="clienteID"
        class="h-full"
      >
        <DxSelection mode="multiple" show-check-boxes-mode="always" />
        <DxSearchPanel :visible="true" placeholder="Buscar institución..." />
        <DxPaging :page-size="10" />
        <DxPager :show-page-size-selector="true" :allowed-page-sizes="[10, 20, 50]" :show-info="true" />

        <!-- Columnas en una sola línea estricta (Regla 2.12 @AGENT) -->
        <DxColumn data-field="ruc" caption="RUC" :width="120" alignment="center" />
        <DxColumn data-field="nombreComercial" caption="Nombre Comercial / Institución" />
        <DxColumn data-field="subdominioSIAPP" caption="Subdominio / Enlace" :width="180" />
        <DxColumn data-field="codigoConexion" caption="Base de Datos" :width="140" alignment="center" />
        <DxColumn data-field="estaAplicada" caption="Estado Actual" :width="130" alignment="center" cell-template="estadoTemplate" />

        <template #estadoTemplate="{ data }">
          <span
            :class="data.value ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-300'"
            class="px-2 py-0.5 rounded-full text-[10px] font-semibold border inline-flex items-center gap-1"
          >
            <i :class="data.value ? 'fa-solid fa-check text-emerald-600' : 'fa-solid fa-minus text-slate-400'"></i>
            {{ data.value ? 'Aplicada' : 'No aplicada' }}
          </span>
        </template>
      </DxDataGrid>
    </div>

    <!-- BOTONES DE ACCIÓN (Regla 6.3: Alineados a la derecha, Cancelar izquierda, Guardar derecha) -->
    <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
      <DxButton
        text="Cancelar"
        icon="close"
        type="normal"
        styling-mode="outlined"
        :disabled="isAplicando"
        @click="onCancelar"
      />
      <DxButton
        :text="isAplicando ? 'Aplicando a Empresas...' : 'Confirmar y Aplicar a Empresas'"
        :icon="isAplicando ? 'fa-light fa-spinner fa-spin' : 'check'"
        type="default"
        styling-mode="contained"
        :disabled="isAplicando"
        @click="handleAplicar"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { DxDataGrid, DxColumn, DxSelection, DxSearchPanel, DxPaging, DxPager } from 'devextreme-vue/data-grid';
import { DxButton } from 'devextreme-vue/button';
import apiClient from '@/api/axiosConfig';
import { showSuccess, showError } from '@/services/notification';
import { getErrorMessage } from '@/services/errorHandler';

const props = defineProps({
  notificacion: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close']);

const empresas = ref([]);
const selectedRowKeys = ref([]);
const isAplicando = ref(false);
const isLoadingEmpresas = ref(false);
const dataGridRef = ref(null);

onMounted(async () => {
  if (props.notificacion && props.notificacion.notificacionID > 0) {
    await cargarEmpresasNotificacion(props.notificacion.notificacionID);
  }
});

const cargarEmpresasNotificacion = async (notificacionID) => {
  isLoadingEmpresas.value = true;
  try {
    const response = await apiClient.get(`/portal-cliente/admin/notificaciones/${notificacionID}/empresas`);
    empresas.value = Array.isArray(response.data) ? response.data : [];
    selectedRowKeys.value = empresas.value
      .filter(e => e.estaAplicada)
      .map(e => e.clienteID);
  } catch (error) {
    showError(getErrorMessage(error, 'Error al cargar las instituciones para aplicar la notificación'));
    empresas.value = [];
    selectedRowKeys.value = [];
  } finally {
    isLoadingEmpresas.value = false;
  }
};

const handleAplicar = async () => {
  if (!props.notificacion) return;
  isAplicando.value = true;
  try {
    await apiClient.post('/portal-cliente/admin/notificaciones/aplicar-empresas', {
      notificacionID: props.notificacion.notificacionID,
      clienteIDs: [...selectedRowKeys.value]
    });
    showSuccess('¡Notificación aplicada y sincronizada en las empresas seleccionadas con éxito!');
    emit('close', { canceled: false, clienteIDs: selectedRowKeys.value });
  } catch (error) {
    showError(getErrorMessage(error, 'Error al aplicar notificación a las empresas'));
  } finally {
    isAplicando.value = false;
  }
};

const onCancelar = () => {
  emit('close', { canceled: true });
};
</script>
