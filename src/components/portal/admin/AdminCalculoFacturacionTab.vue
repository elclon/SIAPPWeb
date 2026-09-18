
<template>
  <div class="space-y-6 animate-in fade-in">

    <!-- CABECERA SUPERIOR CON BOTÓN CREAR PAGO Y VOLVER -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div class="flex items-center gap-4">
        <DxButton
          v-if="empresaSeleccionada"
          text="Volver al Directorio"
          icon="arrowleft"
          type="normal"
          styling-mode="outlined"
          class="rounded-xl font-semibold"
          @click="$emit('volver')"
        />
        <div>
          <h2 class="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <i class="fa-light fa-receipt text-blue-600"></i>
            <span>{{ empresaSeleccionada ? 'Historial de Pagos: ' + empresaSeleccionada.nombreComercial : 'Historial de Pagos y Facturación' }}</span>
          </h2>
          <div class="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            <span v-if="empresaSeleccionada" class="font-mono font-bold text-slate-700 dark:text-slate-300">RUC: {{ empresaSeleccionada.ruc }}</span>
            <span v-if="empresaSeleccionada">• Modalidad: {{ empresaSeleccionada.tipoCobro === 'POR_ALUMNO' ? 'Por Alumno Matriculado' : 'Tarifa Fija' }}</span>
            <span v-if="calculoEmpresa && empresaSeleccionada?.tipoCobro === 'POR_ALUMNO'">• Alumnos activos auditados: <strong>{{ calculoEmpresa.alumnosDetectados }}</strong></span>
          </div>
        </div>
      </div>

      <!-- BOTÓN PRINCIPAL REQUERIDO: "Crear pago" -->
      <div class="flex items-center gap-3 shrink-0">
        <DxButton
          text="Crear pago"
          icon="plus"
          type="default"
          styling-mode="contained"
          class="font-bold shadow-md text-sm px-4 py-2"
          @click="mostrarModalSubirFactura = true"
        />
      </div>
    </div>

    <!-- TARJETAS DE ESTADO FINANCIERO DE LA EMPRESA -->
    <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
      <div class="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
        <span class="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Total Facturado Histórico:</span>
        <span class="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1 block">
          S/ {{ totalFacturadoEmpresa.toFixed(2) }}
        </span>
        <span class="text-[11px] text-slate-400 mt-1 block">{{ historialPagosEmpresa.length }} comprobantes emitidos</span>
      </div>

      <div class="bg-amber-50/70 dark:bg-amber-950/30 rounded-2xl p-5 border border-amber-200 dark:border-amber-800/60">
        <span class="text-xs text-amber-900 dark:text-amber-300 font-bold block">Detracciones SPOT (12% BN):</span>
        <span class="text-2xl font-black text-amber-900 dark:text-amber-300 font-mono mt-1 block">
          S/ {{ totalDetraccionesEmpresa.toFixed(2) }}
        </span>
        <span class="text-[11px] text-amber-800/80 dark:text-amber-400/80 mt-1 block">Depósitos en Banco de la Nación</span>
      </div>

      <div class="bg-emerald-50/70 dark:bg-emerald-950/30 rounded-2xl p-5 border border-emerald-200 dark:border-emerald-800/60">
        <span class="text-xs text-emerald-900 dark:text-emerald-300 font-bold block">Total Neto Cobrado:</span>
        <span class="text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono mt-1 block">
          S/ {{ totalNetoCobradoEmpresa.toFixed(2) }}
        </span>
        <span class="text-[11px] text-emerald-800/80 dark:text-emerald-400/80 mt-1 block">Fondos confirmados en cuenta</span>
      </div>

      <div class="bg-blue-50/70 dark:bg-blue-950/30 rounded-2xl p-5 border border-blue-200 dark:border-blue-800/60">
        <span class="text-xs text-blue-900 dark:text-blue-300 font-bold block">Neto Pendiente de Cobro:</span>
        <span class="text-2xl font-black text-blue-700 dark:text-blue-400 font-mono mt-1 block">
          S/ {{ totalNetoPendienteEmpresa.toFixed(2) }}
        </span>
        <span class="text-[11px] text-blue-800/80 dark:text-blue-400/80 mt-1 block">Facturas emitidas por cobrar</span>
      </div>
    </div>

    <!-- DATA GRID PRINCIPAL REQUERIDO: HISTORIAL DE PAGOS / FACTURACIÓN -->
    <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <i class="fa-light fa-table-list text-blue-600"></i>
            <span>Historial de Pagos y Comprobantes Emitidos</span>
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Gestiona el ciclo de cobro: genera el pago con tu factura, notifica por correo electrónico al cliente y marca como pagado una vez verificado el abono.
          </p>
        </div>
      </div>

      <!-- DxDataGrid de DevExtreme que ocupa el 100% del ancho disponible -->
      <DxDataGrid
        :data-source="historialPagosEmpresa"
        :show-borders="true"
        :row-alternation-enabled="true"
        :hover-state-enabled="true"
        :column-auto-width="true"
        width="100%"
        key-expr="cobranzaID"
        class="overflow-hidden w-full"
      >
        <DxSearchPanel :visible="true" placeholder="Buscar por factura, mes, año..." :width="280" />
        <DxPaging :page-size="10" />
        <DxPager :show-page-size-selector="true" :allowed-page-sizes="[5, 10, 20]" :show-info="true" />

        <!-- Regla 2.12: Cada DxColumn completa en una sola línea horizontal -->
        <DxColumn data-field="comprobanteCompleto" caption="Período / Factura"  alignment="left" cell-template="comprobanteTemplate" />
        <DxColumn data-field="montoTotalFacturado" caption="Total Factura"  alignment="right" cell-template="totalTemplate" />
        <DxColumn data-field="montoDetraccion" caption="Detracción (12%)" alignment="right" cell-template="detraccionTemplate" />
        <DxColumn data-field="montoNetoAPagar" caption="Neto Comercial"  alignment="right" cell-template="netoTemplate" />
        <DxColumn caption="Archivo" alignment="center" cell-template="archivoTemplate" />
        <DxColumn data-field="estadoCobranza" caption="Estado"  alignment="center" cell-template="estadoTemplate" />
        <DxColumn caption="Acciones" alignment="center" cell-template="accionesTemplate" />

        <!-- Template: Factura con Período arriba -->
        <template #comprobanteTemplate="{ data }">
          <div class="flex flex-col">
            <span class="text-xs font-semibold text-slate-700 dark:text-slate-200 leading-tight">
              {{ obtenerNombreMes(data.data.periodoMes) }} {{ data.data.periodoAnio }}
            </span>
            <span class="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs leading-tight mt-0.5">
              {{ data.data.comprobanteCompleto || `${data.data.serieComprobante}-${String(data.data.numeroComprobante).padStart(8, '0')}` }}
            </span>
          </div>
        </template>

        <!-- Template: Monto Total Factura -->
        <template #totalTemplate="{ data }">
          <span class="font-mono font-bold text-slate-900 dark:text-white text-xs">
            S/ {{ Number(data.data.montoTotalFacturado || 0).toFixed(2) }}
          </span>
        </template>

        <!-- Template: Detracción (12%) -->
        <template #detraccionTemplate="{ data }">
          <span v-if="Number(data.data.montoDetraccion || 0) > 0" class="font-mono font-semibold text-amber-600 dark:text-amber-400 text-xs">
            S/ {{ Number(data.data.montoDetraccion || 0).toFixed(2) }}
          </span>
          <span v-else class="text-xs text-slate-400 dark:text-slate-500 font-mono font-normal">
            -
          </span>
        </template>

        <!-- Template: Neto a Cobrar -->
        <template #netoTemplate="{ data }">
          <span class="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
            S/ {{ Number(data.data.montoNetoAPagar || 0).toFixed(2) }}
          </span>
        </template>

        <!-- Template: Archivo Factura (PDF / Word) -->
        <template #archivoTemplate="{ data }">
          <a
            v-if="data.data.urlPdfComprobante"
            :href="data.data.urlPdfComprobante"
            target="_blank"
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-colors"
            title="Ver comprobante de factura"
          >
            <i :class="data.data.urlPdfComprobante.endsWith('.doc') || data.data.urlPdfComprobante.endsWith('.docx') ? 'fa-light fa-file-word text-blue-500' : 'fa-light fa-file-pdf text-red-500'"></i>
            <span>Ver</span>
          </a>
          <span v-else class="text-[11px] text-slate-400 italic">Sin archivo</span>
        </template>

        <!-- Template: Estado del Registro con los códigos de 1 letra -->
        <template #estadoTemplate="{ data }">
          <!-- 'P': PENDIENTE SIN NOTIFICAR -->
          <span
            v-if="data.data.estadoCobranza === 'P' || data.data.estadoCobranza === 'PENDIENTE SIN NOTIFICAR' || data.data.estadoCobranza === 'EMITIDO'"
            class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
          >
            <i class="fa-light fa-clock text-xs"></i>
            <span>Pendiente sin notificar</span>
          </span>

          <!-- 'N': NOTIFICADO -->
          <span
            v-else-if="data.data.estadoCobranza === 'N' || data.data.estadoCobranza === 'NOTIFICADO'"
            class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300 dark:border-blue-800"
          >
            <i class="fa-light fa-paper-plane text-xs"></i>
            <span>Notificado</span>
          </span>

          <!-- 'C': PAGADO / CANCELADO -->
          <span
            v-else-if="data.data.estadoCobranza === 'C' || data.data.estadoCobranza === 'PAGADO'"
            class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
          >
            <i class="fa-light fa-circle-check text-xs"></i>
            <span>Pendiente de Pago</span>
          </span>

          <!-- Otros estados -->
          <span
            v-else
            class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <span>{{ data.data.estadoCobranza }}</span>
          </span>
        </template>

        <!-- Template: Acciones con botones Notificar y Pagado -->
        <template #accionesTemplate="{ data }">
          <div class="flex items-center justify-center gap-2">
            
            <!-- CASO 1: Si está PENDIENTE SIN NOTIFICAR ('P') -> Botón "Notificar" -->
            <template v-if="data.data.estadoCobranza === 'P' || data.data.estadoCobranza === 'PENDIENTE SIN NOTIFICAR' || data.data.estadoCobranza === 'EMITIDO'">
              <DxButton
                text="Notificar"
                icon="email"
                type="default"
                styling-mode="contained"
                class="font-semibold text-xs shadow-xs"
                @click="onConfirmarNotificar(data.data)"
              />
            </template>

            <!-- CASO 2: Si ya está NOTIFICADO ('N') -> Botón "Pagado" y Re-notificar -->
            <template v-else-if="data.data.estadoCobranza === 'N' || data.data.estadoCobranza === 'NOTIFICADO'">
              <DxButton
                text="Pagar"
                icon="check"
                type="success"
                styling-mode="contained"
                class="font-bold text-xs shadow-xs"
                @click="onConfirmarPagado(data.data)"
              />
              <DxButton
                icon="email"
                type="normal"
                styling-mode="outlined"
                hint="Re-enviar notificación por correo"
                @click="onConfirmarNotificar(data.data)"
              />
            </template>

            <!-- CASO 3: Si ya está PAGADO ('C') -> Indicador final -->
            <template v-else-if="data.data.estadoCobranza === 'C' || data.data.estadoCobranza === 'PAGADO'">
              <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                <i class="fa-light fa-circle-check text-sm"></i>
                <span>Completado</span>
              </span>
            </template>

            <!-- Caso por defecto -->
            <template v-else>
              <DxButton
                text="Pagado"
                icon="check"
                type="success"
                styling-mode="outlined"
                class="font-semibold text-xs"
                @click="onConfirmarPagado(data.data)"
              />
            </template>

          </div>
        </template>
      </DxDataGrid>
    </div>

    <!-- POPUP REUTILIZADO: AdminSubirFacturaModal -->
    <AdminSubirFacturaModal
      v-model:visible="mostrarModalSubirFactura"
      :empresas="listaEmpresasModal"
      :is-guardando="isGuardandoFactura"
      @guardar="onGuardarFacturaModal"
    />

  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { DxDataGrid, DxColumn, DxSearchPanel, DxPaging, DxPager } from 'devextreme-vue/data-grid';
import { DxButton } from 'devextreme-vue/button';
import { confirm } from 'devextreme/ui/dialog';
import AdminSubirFacturaModal from './AdminSubirFacturaModal.vue';

const props = defineProps({
  calculosClientes: {
    type: Array,
    default: () => []
  },
  empresaSeleccionada: {
    type: Object,
    default: null
  },
  empresas: {
    type: Array,
    default: () => []
  },
  facturas: {
    type: Array,
    default: () => []
  },
  isGuardandoFactura: {
    type: Boolean,
    default: false
  },
  filtroMes: {
    type: Number,
    required: true
  },
  filtroAnio: {
    type: Number,
    required: true
  }
});

const emit = defineEmits([
  'update:filtroMes',
  'update:filtroAnio',
  'cambiar-periodo',
  'emitir-cobranza',
  'subir-factura',
  'notificar-factura',
  'marcar-pagado',
  'volver'
]);

const mostrarModalSubirFactura = ref(false);

const mesesNombres = [
  '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const obtenerNombreMes = (numMes) => {
  return mesesNombres[numMes] || `Mes ${numMes}`;
};

// Historial de facturas/pagos filtrado para la empresa seleccionada (o todas si no hay filtro)
const historialPagosEmpresa = computed(() => {
  if (props.empresaSeleccionada && props.empresaSeleccionada.clienteID) {
    return props.facturas.filter(f => f.clienteID === props.empresaSeleccionada.clienteID);
  }
  return props.facturas;
});

// Lista de empresas para el modal de Crear Pago
const listaEmpresasModal = computed(() => {
  if (props.empresaSeleccionada) {
    return [props.empresaSeleccionada];
  }
  return props.empresas;
});

// Resumen de totales financieros del historial de esta empresa
const totalFacturadoEmpresa = computed(() => {
  return historialPagosEmpresa.value.reduce((acc, f) => acc + Number(f.montoTotalFacturado || 0), 0);
});

const totalDetraccionesEmpresa = computed(() => {
  return historialPagosEmpresa.value.reduce((acc, f) => acc + Number(f.montoDetraccion || 0), 0);
});

const totalNetoCobradoEmpresa = computed(() => {
  return historialPagosEmpresa.value
    .filter(f => f.estadoCobranza === 'C' || f.estadoCobranza === 'PAGADO')
    .reduce((acc, f) => acc + Number(f.montoNetoAPagar || 0), 0);
});

const totalNetoPendienteEmpresa = computed(() => {
  return historialPagosEmpresa.value
    .filter(f => f.estadoCobranza !== 'C' && f.estadoCobranza !== 'PAGADO')
    .reduce((acc, f) => acc + Number(f.montoNetoAPagar || 0), 0);
});

// Datos de cálculo de alumnos si la empresa los tiene
const calculoEmpresa = computed(() => {
  if (!props.empresaSeleccionada) return null;
  return props.calculosClientes.find(c => c.clienteID === props.empresaSeleccionada.clienteID) || null;
});

const onGuardarFacturaModal = (data) => {
  emit('subir-factura', {
    ...data,
    cerrarModal: () => {
      mostrarModalSubirFactura.value = false;
    }
  });
};

const onConfirmarNotificar = async (factura) => {
  const emailMsg = factura.emailContacto
    ? `al correo institucional ${factura.emailContacto}`
    : 'al correo de contacto de la empresa';

  const confirmacion = await confirm(
    `¿Desea enviar la notificación de cobro por correo electrónico ${emailMsg} con el archivo de la factura adjunto?`,
    'Confirmar Notificación por Correo'
  );

  if (confirmacion) {
    emit('notificar-factura', factura);
  }
};

const onConfirmarPagado = async (factura) => {
  const comprobante = factura.comprobanteCompleto || `${factura.serieComprobante}-${factura.numeroComprobante}`;
  const monto = Number(factura.montoTotalFacturado || 0).toFixed(2);

  const confirmacion = await confirm(
    `¿Está seguro de marcar la factura ${comprobante} por S/ ${monto} como PAGADA tras verificar que el dinero ya se encuentra depositado en su cuenta?`,
    'Confirmar Recepción de Pago'
  );

  if (confirmacion) {
    emit('marcar-pagado', factura);
  }
};
</script>

