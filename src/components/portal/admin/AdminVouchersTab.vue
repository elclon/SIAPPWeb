<script setup>
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

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th class="p-3">Cliente</th>
              <th class="p-3">Factura Ref.</th>
              <th class="p-3">Tipo de Abono</th>
              <th class="p-3">Banco & Operación</th>
              <th class="p-3 font-mono">Monto</th>
              <th class="p-3">Observaciones</th>
              <th class="p-3">Estado</th>
              <th class="p-3 text-right">Validación</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            <tr v-for="pago in vouchers" :key="pago.pagoID" class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
              <td class="p-3">
                <strong class="text-slate-900 dark:text-white block">{{ pago.clienteNombre }}</strong>
                <span class="text-[10px] text-slate-400 font-mono">{{ pago.ruc }}</span>
              </td>
              <td class="p-3 font-mono font-bold text-blue-600">{{ pago.comprobanteCompleto }}</td>
              <td class="p-3">
                <span
                  :class="pago.tipoAbono === 'DETRACCION_BN' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'"
                  class="px-2 py-0.5 rounded text-[10px] font-bold"
                >
                  {{ pago.tipoAbono === 'DETRACCION_BN' ? 'Detracción BN' : 'Neto Comercial' }}
                </span>
              </td>
              <td class="p-3">
                <span class="font-semibold block">{{ pago.bancoDestino }}</span>
                <span class="font-mono text-[10px] text-slate-500">Op: {{ pago.numeroOperacion }} ({{ pago.fechaOperacion }})</span>
              </td>
              <td class="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                S/ {{ pago.montoPagado.toFixed(2) }}
              </td>
              <td class="p-3 text-slate-500 text-[11px] max-w-xs truncate">
                {{ pago.observacionesCliente || 'Sin observaciones' }}
              </td>
              <td class="p-3">
                <span
                  :class="pago.estadoValidacion === 'APROBADO' ? 'bg-emerald-100 text-emerald-800' : pago.estadoValidacion === 'RECHAZADO' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'"
                  class="px-2 py-0.5 rounded text-[10px] font-bold"
                >
                  {{ pago.estadoValidacion }}
                </span>
              </td>
              <td class="p-3 text-right">
                <div v-if="pago.estadoValidacion === 'EN_REVISION'" class="flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    @click="$emit('responder-voucher', { pago, estado: 'APROBADO' })"
                    class="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-all"
                  >
                    Aprobar
                  </button>
                  <button
                    type="button"
                    @click="$emit('responder-voucher', { pago, estado: 'RECHAZADO' })"
                    class="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-red-100 hover:text-red-700 text-slate-700 dark:text-slate-300 font-semibold text-[11px] transition-all"
                  >
                    Rechazar
                  </button>
                </div>
                <span v-else class="text-slate-400 text-[11px] italic">
                  Procesado
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
