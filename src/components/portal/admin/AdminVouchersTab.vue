<template>
  <div class="space-y-6">
    <!-- CABECERA DE LA BANDEJA CON BOTÓN PRINCIPAL -->
    <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <i class="fa-light fa-file-invoice-dollar text-blue-600"></i>
            <span>Facturación, Notificaciones y Conciliación</span>
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Sube y notifica las facturas de servicios a tus clientes, y concilia los pagos y constancias de detracción reportados.
          </p>
        </div>

        <!-- Botón Subir Factura requerido por el usuario -->
        <div class="flex items-center gap-2 shrink-0">
          <DxButton
            text="Subir Factura"
            icon="upload"
            type="default"
            styling-mode="contained"
            class="shadow-sm font-semibold"
            @click="mostrarModalSubirFactura = true"
          />
        </div>
      </div>

      <!-- SELECTOR DE SUB-PESTAÑAS -->
      <div class="flex border-b border-slate-100 dark:border-slate-800 gap-4 text-xs font-bold pt-2">
        <button
          type="button"
          @click="subPestanaActiva = 'facturas'"
          :class="subPestanaActiva === 'facturas' ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 pb-2' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 pb-2'"
          class="flex items-center gap-2 transition-colors"
        >
          <i class="fa-light fa-file-invoice"></i>
          <span>1. Facturas Emitidas a Clientes ({{ facturas.length }})</span>
        </button>

        <button
          type="button"
          @click="subPestanaActiva = 'vouchers'"
          :class="subPestanaActiva === 'vouchers' ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 pb-2' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 pb-2'"
          class="flex items-center gap-2 transition-colors"
        >
          <i class="fa-light fa-receipt"></i>
          <span>2. Vouchers y Constancias de Detracción ({{ vouchers.length }})</span>
        </button>
      </div>

      <!-- SECCIÓN 1: FACTURAS EMITIDAS A CLIENTES -->
      <div v-if="subPestanaActiva === 'facturas'" class="space-y-3">
        <!-- DxDataGrid de DevExtreme con columnas en una sola línea (Regla 2.12) -->
        <DxDataGrid
          :data-source="facturas"
          :show-borders="true"
          :row-alternation-enabled="true"
          :hover-state-enabled="true"
          key-expr="cobranzaID"
          class="overflow-hidden"
        >
          <DxSearchPanel :visible="true" placeholder="Buscar por cliente, RUC, factura..." :width="280" />
          <DxPaging :page-size="10" />
          <DxPager :show-page-size-selector="true" :allowed-page-sizes="[5, 10, 20]" :show-info="true" />

          <!-- Regla 2.12: Cada DxColumn completa en una sola línea horizontal -->
          <DxColumn data-field="clienteNombre" caption="Institución Cliente" cell-template="clienteFacturaTemplate" />
          <DxColumn data-field="comprobanteCompleto" caption="Factura Ref." :width="130" alignment="center" cell-template="comprobanteFacturaTemplate" />
          <DxColumn caption="Período" :width="120" alignment="center" cell-template="periodoFacturaTemplate" />
          <DxColumn data-field="montoTotalFacturado" caption="Total Factura" :width="120" alignment="right" cell-template="totalFacturaTemplate" />
          <DxColumn data-field="montoDetraccion" caption="Detracción (12%)" :width="120" alignment="right" cell-template="detraccionFacturaTemplate" />
          <DxColumn data-field="montoNetoAPagar" caption="Neto a Cobrar" :width="120" alignment="right" cell-template="netoFacturaTemplate" />
          <DxColumn caption="Archivo" :width="100" alignment="center" cell-template="archivoFacturaTemplate" />
          <DxColumn data-field="estadoCobranza" caption="Estado" :width="120" alignment="center" cell-template="estadoFacturaTemplate" />
          <DxColumn caption="Notificación" :width="140" alignment="center" cell-template="accionesFacturaTemplate" />

          <!-- Template: Cliente -->
          <template #clienteFacturaTemplate="{ data }">
            <div>
              <strong class="text-slate-900 dark:text-white block text-xs">{{ data.data.clienteNombre }}</strong>
              <div class="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                <span>RUC: {{ data.data.ruc }}</span>
                <span v-if="data.data.emailContacto" class="text-slate-500 font-sans truncate max-w-[150px]" :title="data.data.emailContacto">
                  • {{ data.data.emailContacto }}
                </span>
              </div>
            </div>
          </template>

          <!-- Template: Comprobante -->
          <template #comprobanteFacturaTemplate="{ data }">
            <span class="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs">
              {{ data.data.comprobanteCompleto || `${data.data.serieComprobante}-${String(data.data.numeroComprobante).padStart(8, '0')}` }}
            </span>
          </template>

          <!-- Template: Período -->
          <template #periodoFacturaTemplate="{ data }">
            <span class="font-semibold text-slate-700 dark:text-slate-300 text-xs">
              {{ obtenerNombreMes(data.data.periodoMes) }} {{ data.data.periodoAnio }}
            </span>
          </template>

          <!-- Template: Total -->
          <template #totalFacturaTemplate="{ data }">
            <span class="font-mono font-bold text-slate-900 dark:text-white text-xs">
              S/ {{ Number(data.data.montoTotalFacturado || 0).toFixed(2) }}
            </span>
          </template>

          <!-- Template: Detracción -->
          <template #detraccionFacturaTemplate="{ data }">
            <span class="font-mono font-semibold text-amber-600 dark:text-amber-400 text-xs">
              S/ {{ Number(data.data.montoDetraccion || 0).toFixed(2) }}
            </span>
          </template>

          <!-- Template: Neto -->
          <template #netoFacturaTemplate="{ data }">
            <span class="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
              S/ {{ Number(data.data.montoNetoAPagar || 0).toFixed(2) }}
            </span>
          </template>

          <!-- Template: Archivo de la Factura (PDF / Word) -->
          <template #archivoFacturaTemplate="{ data }">
            <a
              v-if="data.data.urlPdfComprobante"
              :href="data.data.urlPdfComprobante"
              target="_blank"
              class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-colors"
              title="Descargar o ver archivo de factura"
            >
              <i :class="data.data.urlPdfComprobante.endsWith('.doc') || data.data.urlPdfComprobante.endsWith('.docx') ? 'fa-light fa-file-word text-blue-500' : 'fa-light fa-file-pdf text-red-500'"></i>
              <span>Ver</span>
            </a>
            <span v-else class="text-[11px] text-slate-400 italic">Sin archivo</span>
          </template>

          <!-- Template: Estado de Cobranza -->
          <template #estadoFacturaTemplate="{ data }">
            <span
              v-if="data.data.estadoCobranza === 'P' || data.data.estadoCobranza === 'PENDIENTE SIN NOTIFICAR' || data.data.estadoCobranza === 'EMITIDO'"
              class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
            >
              Pendiente sin notificar
            </span>
            <span
              v-else-if="data.data.estadoCobranza === 'N' || data.data.estadoCobranza === 'NOTIFICADO'"
              class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
            >
              Notificado
            </span>
            <span
              v-else-if="data.data.estadoCobranza === 'C' || data.data.estadoCobranza === 'PAGADO'"
              class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
            >
              Pagado
            </span>
            <span v-else class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
              {{ data.data.estadoCobranza }}
            </span>
          </template>

          <!-- Template: Acciones con Botón Notificar requerido por el usuario -->
          <template #accionesFacturaTemplate="{ data }">
            <DxButton
              v-if="data.data.estadoCobranza === 'N' || data.data.estadoCobranza === 'NOTIFICADO'"
              text="Re-notificar"
              icon="email"
              type="normal"
              styling-mode="outlined"
              @click="onConfirmarNotificar(data.data)"
            />
            <DxButton
              v-else-if="data.data.estadoCobranza === 'C' || data.data.estadoCobranza === 'PAGADO'"
              text="Pagado"
              icon="check"
              type="success"
              styling-mode="text"
              :disabled="true"
            />
            <DxButton
              v-else
              text="Notificar"
              icon="email"
              type="default"
              styling-mode="contained"
              @click="onConfirmarNotificar(data.data)"
            />
          </template>
        </DxDataGrid>
      </div>

      <!-- SECCIÓN 2: BANDEJA DE VOUCHERS Y CONSTANCIAS DE PAGO -->
      <div v-else-if="subPestanaActiva === 'vouchers'" class="space-y-3">
        <!-- DxDataGrid de DevExtreme con columnas en una sola línea (Regla 2.12) -->
        <DxDataGrid
          :data-source="vouchers"
          :show-borders="true"
          :row-alternation-enabled="true"
          :hover-state-enabled="true"
          key-expr="pagoID"
          class="overflow-hidden"
        >
          <DxSearchPanel :visible="true" placeholder="Buscar pagos, bancos, facturas..." :width="280" />
          <DxPaging :page-size="10" />
          <DxPager :show-page-size-selector="true" :allowed-page-sizes="[5, 10, 20]" :show-info="true" />

          <!-- Regla 2.12: Cada DxColumn completa en una sola línea horizontal -->
          <DxColumn data-field="clienteNombre" caption="Cliente" cell-template="clienteVoucherTemplate" />
          <DxColumn data-field="comprobanteCompleto" caption="Factura Ref." :width="140" alignment="center" cell-template="comprobanteVoucherTemplate" />
          <DxColumn data-field="tipoAbono" caption="Tipo de Abono" :width="140" cell-template="tipoAbonoTemplate" />
          <DxColumn data-field="bancoDestino" caption="Banco & Operación" :width="200" cell-template="bancoTemplate" />
          <DxColumn data-field="montoPagado" caption="Monto" :width="120" alignment="right" cell-template="montoTemplate" />
          <DxColumn data-field="observacionesCliente" caption="Observaciones" cell-template="observacionesTemplate" />
          <DxColumn data-field="estadoValidacion" caption="Estado" :width="130" alignment="center" cell-template="estadoTemplate" />
          <DxColumn caption="Validación" :width="190" alignment="center" cell-template="accionesVoucherTemplate" />

          <template #clienteVoucherTemplate="{ data }">
            <div>
              <strong class="text-slate-900 dark:text-white block text-xs">{{ data.data.clienteNombre }}</strong>
              <span class="text-[10px] text-slate-400 font-mono">RUC: {{ data.data.ruc }}</span>
            </div>
          </template>

          <template #comprobanteVoucherTemplate="{ data }">
            <span class="font-mono font-bold text-blue-600 text-xs">{{ data.data.comprobanteCompleto }}</span>
          </template>

          <template #tipoAbonoTemplate="{ data }">
            <span
              :class="data.data.tipoAbono === 'DETRACCION_BN' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'"
              class="px-2 py-0.5 rounded text-[10px] font-bold"
            >
              {{ data.data.tipoAbono === 'DETRACCION_BN' ? 'Detracción BN' : 'Neto Comercial' }}
            </span>
          </template>

          <template #bancoTemplate="{ data }">
            <div>
              <span class="font-semibold block text-xs text-slate-800 dark:text-slate-200">{{ data.data.bancoDestino }}</span>
              <span class="font-mono text-[10px] text-slate-500">Op: {{ data.data.numeroOperacion }} ({{ data.data.fechaOperacion }})</span>
            </div>
          </template>

          <template #montoTemplate="{ data }">
            <span class="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
              S/ {{ data.data.montoPagado ? data.data.montoPagado.toFixed(2) : '0.00' }}
            </span>
          </template>

          <template #observacionesTemplate="{ data }">
            <span class="text-slate-600 dark:text-slate-400 text-xs truncate block max-w-[200px]">
              {{ data.data.observacionesCliente || 'Sin observaciones' }}
            </span>
          </template>

          <template #estadoTemplate="{ data }">
            <span
              :class="data.data.estadoValidacion === 'APROBADO' ? 'bg-emerald-100 text-emerald-800' : data.data.estadoValidacion === 'RECHAZADO' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'"
              class="px-2 py-0.5 rounded text-[10px] font-bold"
            >
              {{ data.data.estadoValidacion }}
            </span>
          </template>

          <template #accionesVoucherTemplate="{ data }">
            <div v-if="data.data.estadoValidacion === 'EN_REVISION'" class="flex items-center justify-center gap-1.5">
              <DxButton
                text="Aprobar"
                icon="check"
                type="success"
                styling-mode="contained"
                @click="$emit('responder-voucher', { pago: data.data, estado: 'APROBADO' })"
              />
              <DxButton
                text="Rechazar"
                icon="close"
                type="danger"
                styling-mode="outlined"
                @click="$emit('responder-voucher', { pago: data.data, estado: 'RECHAZADO' })"
              />
            </div>
            <span v-else class="text-slate-400 text-[11px] italic">
              Procesado
            </span>
          </template>
        </DxDataGrid>
      </div>

    </div>

    <!-- MODAL DE SUBIR FACTURA DE SERVICIO -->
    <AdminSubirFacturaModal
      v-model:visible="mostrarModalSubirFactura"
      :empresas="empresas"
      :is-guardando="isGuardandoFactura"
      @guardar="onGuardarFacturaModal"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { DxDataGrid, DxColumn, DxSearchPanel, DxPaging, DxPager } from 'devextreme-vue/data-grid';
import { DxButton } from 'devextreme-vue/button';
import { confirm } from 'devextreme/ui/dialog';
import AdminSubirFacturaModal from './AdminSubirFacturaModal.vue';

const props = defineProps({
  vouchers: {
    type: Array,
    default: () => []
  },
  facturas: {
    type: Array,
    default: () => []
  },
  empresas: {
    type: Array,
    default: () => []
  },
  isGuardandoFactura: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['responder-voucher', 'subir-factura', 'notificar-factura']);

// Sub-pestaña activa: 'facturas' | 'vouchers'
const subPestanaActiva = ref('facturas');
const mostrarModalSubirFactura = ref(false);

const mesesNombres = [
  '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const obtenerNombreMes = (numMes) => {
  return mesesNombres[numMes] || `Mes ${numMes}`;
};

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
    ? `al correo ${factura.emailContacto}`
    : 'al correo de contacto registrado';

  const confirmacion = await confirm(
    `¿Desea notificar la factura ${factura.comprobanteCompleto || 'electrónica'} ${emailMsg} con el comprobante adjunto?`,
    'Confirmar Notificación por Correo'
  );

  if (confirmacion) {
    emit('notificar-factura', factura);
  }
};
</script>



