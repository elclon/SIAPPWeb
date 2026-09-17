<script setup>
import { DxDataGrid, DxColumn, DxSearchPanel, DxPaging, DxPager } from 'devextreme-vue/data-grid';
import { DxButton } from 'devextreme-vue/button';

defineProps({
  vouchers: {
    type: Array,
    required: true
  }
});

defineEmits(['responder-voucher']);
</script>

<template>
  <div class="space-y-6">
    <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      <div>
        <h2 class="text-lg font-bold text-slate-900 dark:text-white">
          Bandeja de Pagos y Constancias de Detracción
        </h2>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Revisa los vouchers subidos por los clientes, valida los abonos netos en tus cuentas comerciales y las detracciones en el Banco de la Nación.
        </p>
      </div>

      <!-- DxDataGrid de DevExtreme con columnas en una sola línea (Regla 2.12) -->
      <DxDataGrid
        :data-source="vouchers"
        :show-borders="true"
        :row-alternation-enabled="true"
        :hover-state-enabled="true"
        key-expr="pagoID"
        class="rounded-xl overflow-hidden"
      >
        <DxSearchPanel :visible="true" placeholder="Buscar pagos, bancos, facturas..." :width="280" />
        <DxPaging :page-size="10" />
        <DxPager :show-page-size-selector="true" :allowed-page-sizes="[5, 10, 20]" :show-info="true" />

        <!-- Regla 2.12: Cada DxColumn completa en una sola línea horizontal -->
        <DxColumn data-field="clienteNombre" caption="Cliente" cell-template="clienteTemplate" />
        <DxColumn data-field="comprobanteCompleto" caption="Factura Ref." :width="140" alignment="center" cell-template="comprobanteTemplate" />
        <DxColumn data-field="tipoAbono" caption="Tipo de Abono" :width="140" cell-template="tipoAbonoTemplate" />
        <DxColumn data-field="bancoDestino" caption="Banco & Operación" :width="200" cell-template="bancoTemplate" />
        <DxColumn data-field="montoPagado" caption="Monto" :width="120" alignment="right" cell-template="montoTemplate" />
        <DxColumn data-field="observacionesCliente" caption="Observaciones" cell-template="observacionesTemplate" />
        <DxColumn data-field="estadoValidacion" caption="Estado" :width="130" alignment="center" cell-template="estadoTemplate" />
        <DxColumn caption="Validación" :width="190" alignment="center" cell-template="accionesTemplate" />

        <template #clienteTemplate="{ data }">
          <div>
            <strong class="text-slate-900 dark:text-white block text-xs">{{ data.clienteNombre }}</strong>
            <span class="text-[10px] text-slate-400 font-mono">RUC: {{ data.ruc }}</span>
          </div>
        </template>

        <template #comprobanteTemplate="{ data }">
          <span class="font-mono font-bold text-blue-600 text-xs">{{ data.comprobanteCompleto }}</span>
        </template>

        <template #tipoAbonoTemplate="{ data }">
          <span
            :class="data.tipoAbono === 'DETRACCION_BN' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'"
            class="px-2 py-0.5 rounded text-[10px] font-bold"
          >
            {{ data.tipoAbono === 'DETRACCION_BN' ? 'Detracción BN' : 'Neto Comercial' }}
          </span>
        </template>

        <template #bancoTemplate="{ data }">
          <div>
            <span class="font-semibold block text-xs text-slate-800 dark:text-slate-200">{{ data.bancoDestino }}</span>
            <span class="font-mono text-[10px] text-slate-500">Op: {{ data.numeroOperacion }} ({{ data.fechaOperacion }})</span>
          </div>
        </template>

        <template #montoTemplate="{ data }">
          <span class="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
            S/ {{ data.montoPagado.toFixed(2) }}
          </span>
        </template>

        <template #observacionesTemplate="{ data }">
          <span class="text-slate-600 dark:text-slate-400 text-xs truncate block max-w-[200px]">
            {{ data.observacionesCliente || 'Sin observaciones' }}
          </span>
        </template>

        <template #estadoTemplate="{ data }">
          <span
            :class="data.estadoValidacion === 'APROBADO' ? 'bg-emerald-100 text-emerald-800' : data.estadoValidacion === 'RECHAZADO' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'"
            class="px-2 py-0.5 rounded text-[10px] font-bold"
          >
            {{ data.estadoValidacion }}
          </span>
        </template>

        <template #accionesTemplate="{ data }">
          <div v-if="data.estadoValidacion === 'EN_REVISION'" class="flex items-center justify-center gap-1.5">
            <DxButton
              text="Aprobar"
              icon="check"
              type="success"
              styling-mode="contained"
              @click="$emit('responder-voucher', { pago: data, estado: 'APROBADO' })"
            />
            <DxButton
              text="Rechazar"
              icon="close"
              type="danger"
              styling-mode="outlined"
              @click="$emit('responder-voucher', { pago: data, estado: 'RECHAZADO' })"
            />
          </div>
          <span v-else class="text-slate-400 text-[11px] italic">
            Procesado
          </span>
        </template>
      </DxDataGrid>
    </div>
  </div>
</template>
