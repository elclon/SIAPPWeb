<script setup>
import { ref, computed, onMounted } from 'vue';

// Clientes semilla de ejemplo para búsqueda y demostración interactiva
const clientesDB = {
  '9999': {
    cuentaID: '9999',
    institucion: 'Instituto Superior Tecnológico ITEP',
    ruc: '20549281921',
    direccion: 'Av. Arequipa 2450, Lince, Lima',
    responsable: 'Lic. Roberto Zegarra',
    emailContacto: 'administracion@itep.edu.pe',
    subdominio: 'itep.siapp.edu.pe',
    urlSistema: 'https://itep.siapp.edu.pe',
    planNombre: 'Instituto Pro',
    planBadgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    estadoServicio: 'Pendiente de Pago',
    estadoBadgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    diasRestantes: 2,
    fechaVencimiento: '16/09/2026',
    reciboNumero: 'REC-2026-09999',
    periodo: 'Septiembre 2026',
    subtotal: 406.78,
    igv: 73.22,
    total: 480.00,
    moneda: 'S/',
    items: [
      { descripcion: 'Suscripción Mensual SIAPP ERP (Plan Instituto Pro)', monto: 380.00 },
      { descripcion: 'Módulo Facturación Electrónica SUNAT Ilimitada (OSE/PSE)', monto: 50.00 },
      { descripcion: 'Infraestructura Cloud, Respaldos Automatizados y Soporte 24/7', monto: 50.00 }
    ]
  },
  '8850': {
    cuentaID: '8850',
    institucion: 'Instituto San Marcos Tech & Business',
    ruc: '20491823901',
    direccion: 'Av. Nicolás de Piérola 1280, Cercado de Lima',
    responsable: 'Mg. Carlos Mendoza',
    emailContacto: 'finanzas@sanmarcostech.edu.pe',
    subdominio: 'sanmarcos.siapp.edu.pe',
    urlSistema: 'https://sanmarcos.siapp.edu.pe',
    planNombre: 'Académico Avanzado',
    planBadgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    estadoServicio: 'Pendiente de Pago',
    estadoBadgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    diasRestantes: 1,
    fechaVencimiento: '15/09/2026',
    reciboNumero: 'REC-2026-08850',
    periodo: 'Septiembre 2026',
    subtotal: 296.61,
    igv: 53.39,
    total: 350.00,
    moneda: 'S/',
    items: [
      { descripcion: 'Suscripción Mensual SIAPP ERP (Plan Académico)', monto: 270.00 },
      { descripcion: 'Módulo Facturación Electrónica SUNAT (Hasta 2,000 docs)', monto: 40.00 },
      { descripcion: 'Infraestructura Cloud y Respaldos Automatizados', monto: 40.00 }
    ]
  },
  '1200': {
    cuentaID: '1200',
    institucion: 'Cambridge Business & Technology College',
    ruc: '20601928472',
    direccion: 'Calle Los Negocios 340, Surquillo, Lima',
    responsable: 'Dra. Patricia Alva',
    emailContacto: 'direccion@cambridge.edu.pe',
    subdominio: 'cambridge.siapp.edu.pe',
    urlSistema: 'https://cambridge.siapp.edu.pe',
    planNombre: 'Enterprise Multi-Sede',
    planBadgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    estadoServicio: 'Habilitado / Al Día',
    estadoBadgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    diasRestantes: 28,
    fechaVencimiento: '12/10/2026',
    reciboNumero: 'REC-2026-01200',
    periodo: 'Septiembre 2026',
    subtotal: 720.34,
    igv: 129.66,
    total: 850.00,
    moneda: 'S/',
    items: [
      { descripcion: 'Suscripción Mensual SIAPP Enterprise (Multi-Sede)', monto: 700.00 },
      { descripcion: 'Integración API Portal Bancario & Pasarelas de Pago', monto: 80.00 },
      { descripcion: 'Servidor Dedicado en Nube y Soporte Premium 24/7', monto: 70.00 }
    ]
  }
};

// Estado Reactivo
const codigoInput = ref('');
const errorBusqueda = ref('');
const clienteActual = ref(null);
const metodoPago = ref('tarjeta'); // 'tarjeta' | 'yape' | 'transferencia'

// Formulario de Tarjeta
const formTarjeta = ref({
  numero: '4557 8900 1234 9999',
  nombre: 'ROBERTO ZEGARRA',
  exp: '11/28',
  cvv: '789',
  tipoDoc: 'DNI',
  numDoc: '44556677',
  email: 'administracion@itep.edu.pe'
});

// Formulario de Yape
const formYape = ref({
  codigoAprobacion: '782910'
});

// Formulario de Transferencia
const formTransferencia = ref({
  banco: 'BCP',
  nroOperacion: '98410293'
});

// Estado del proceso de pago
const isProcessing = ref(false);
const processingStep = ref('');
const pagoCompletado = ref(false);
const comprobantePago = ref(null);

// Buscar cuenta
const buscarCuenta = (codigo) => {
  errorBusqueda.value = '';
  const term = (codigo || codigoInput.value).trim();
  
  if (!term) {
    errorBusqueda.value = 'Por favor ingrese su código de cuenta o RUC.';
    clienteActual.value = null;
    return;
  }

  // Buscar por ID de cuenta o por RUC
  const match = Object.values(clientesDB).find(
    c => c.cuentaID === term || c.ruc === term
  );

  if (match) {
    clienteActual.value = JSON.parse(JSON.stringify(match));
    codigoInput.value = match.cuentaID;
    pagoCompletado.value = (match.estadoServicio === 'Habilitado / Al Día');
  } else {
    errorBusqueda.value = `No se encontró información para la cuenta o RUC "${term}". Verifique los dígitos o comuníquese con soporte.`;
    clienteActual.value = null;
  }
};

// Cargar desde URL (ej: /clientes?cuenta=9999)
onMounted(() => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const cuentaParam = params.get('cuenta') || params.get('cta');
    if (cuentaParam) {
      codigoInput.value = cuentaParam;
      buscarCuenta(cuentaParam);
    } else {
      // Por defecto precargar la cuenta 9999 de demostración
      codigoInput.value = '9999';
      buscarCuenta('9999');
    }
  }
});

// Simulación de Ejecución del Pago y Habilitación Inmediata de SIAPP
const procesarPago = async () => {
  if (!clienteActual.value) return;

  isProcessing.value = true;
  processingStep.value = 'Conectando con la pasarela bancaria segura...';

  await new Promise(r => setTimeout(r, 1000));
  processingStep.value = `Validando cobro de ${clienteActual.value.moneda} ${clienteActual.value.total.toFixed(2)}...`;

  await new Promise(r => setTimeout(r, 1200));
  processingStep.value = 'Autorización bancaria aprobada. Actualizando suscripción SAAS...';

  await new Promise(r => setTimeout(r, 1100));
  processingStep.value = `¡Habilitando acceso y servicios en ${clienteActual.value.subdominio}!`;

  await new Promise(r => setTimeout(r, 900));

  // Actualizar estado del cliente
  clienteActual.value.estadoServicio = 'Habilitado / Al Día';
  clienteActual.value.estadoBadgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
  clienteActual.value.fechaVencimiento = '16/10/2026';
  clienteActual.value.diasRestantes = 30;

  comprobantePago.value = {
    authCode: 'AUTH-' + Math.floor(100000 + Math.random() * 900000),
    fechaHora: new Date().toLocaleString('es-PE'),
    monto: clienteActual.value.total,
    moneda: clienteActual.value.moneda,
    metodo: metodoPago.value === 'tarjeta' ? 'Tarjeta Visa **** 9999' : metodoPago.value === 'yape' ? 'Yape Móvil' : 'Transferencia BCP',
    recibo: clienteActual.value.reciboNumero,
    institucion: clienteActual.value.institucion,
    subdominio: clienteActual.value.subdominio,
    urlSistema: clienteActual.value.urlSistema
  };

  isProcessing.value = false;
  pagoCompletado.value = true;
};

// Reiniciar para otra búsqueda
const nuevaConsulta = () => {
  pagoCompletado.value = false;
  comprobantePago.value = null;
  codigoInput.value = '';
  clienteActual.value = null;
};

// Copiar al portapapeles
const copiarTexto = (texto, idNotif) => {
  navigator.clipboard.writeText(texto);
  alert(`Copiado al portapapeles: ${texto}`);
};
</script>

<template>
  <div class="space-y-8">
    
    <!-- BARRA DE BÚSQUEDA DE CUENTA -->
    <div class="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/80 p-6 md:p-8">
      <div class="max-w-2xl mx-auto text-center space-y-3 mb-6">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
          <i class="fa-light fa-shield-check text-blue-600"></i>
          <span>Autoservicio Seguro de Pagos SIAPP</span>
        </div>
        <h2 class="text-2xl sm:text-3xl font-bold text-slate-900 font-heading">
          Consulta y Paga tu Suscripción
        </h2>
        <p class="text-sm sm:text-base text-slate-600">
          Ingresa el código de cuenta de tu institución (enviado a tu correo o WhatsApp) o tu número de RUC para consultar tu estado y renovar el servicio.
        </p>
      </div>

      <!-- Formulario de Consulta -->
      <form @submit.prevent="buscarCuenta(codigoInput)" class="max-w-xl mx-auto flex flex-col sm:flex-row gap-2">
        <div class="relative flex-grow">
          <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <i class="fa-light fa-building-columns text-base"></i>
          </div>
          <input
            v-model="codigoInput"
            type="text"
            placeholder="Ej: 9999 o 20549281921"
            class="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-slate-900 placeholder:text-slate-400 text-base transition-all"
          />
        </div>
        <button
          type="submit"
          class="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
        >
          <i class="fa-light fa-magnifying-glass"></i>
          <span>Consultar Cuenta</span>
        </button>
      </form>

      <!-- Chips de cuentas de demostración -->
      <div class="max-w-xl mx-auto mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
        <span class="font-medium">Cuentas de prueba rápida:</span>
        <button
          type="button"
          @click="buscarCuenta('9999')"
          class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 transition-colors font-semibold text-slate-700"
        >
          9999 (ITEP - Pendiente)
        </button>
        <button
          type="button"
          @click="buscarCuenta('8850')"
          class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 transition-colors font-semibold text-slate-700"
        >
          8850 (San Marcos Tech)
        </button>
        <button
          type="button"
          @click="buscarCuenta('1200')"
          class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 transition-colors font-semibold text-slate-700"
        >
          1200 (Cambridge - Al Día)
        </button>
      </div>

      <!-- Alerta de Error si no se encuentra -->
      <div v-if="errorBusqueda" class="max-w-xl mx-auto mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
        <i class="fa-solid fa-circle-exclamation text-base text-red-500"></i>
        <span>{{ errorBusqueda }}</span>
      </div>
    </div>

    <!-- RESULTADO: SI SE ENCONTRÓ EL CLIENTE -->
    <div v-if="clienteActual" class="space-y-6">

      <!-- CASO 1: PAGO RECIÉN COMPLETADO CON ÉXITO -->
      <div v-if="pagoCompletado && comprobantePago" class="bg-white rounded-2xl shadow-xl border border-emerald-200 p-6 sm:p-10 overflow-hidden relative">
        <div class="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-48 h-48 bg-emerald-100 rounded-full opacity-50 blur-2xl pointer-events-none"></div>
        
        <div class="text-center max-w-xl mx-auto space-y-4">
          <div class="w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30 text-3xl animate-bounce">
            <i class="fa-solid fa-check"></i>
          </div>

          <div class="space-y-1">
            <span class="text-xs uppercase font-bold tracking-wider text-emerald-600">Transacción Aprobada</span>
            <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
              ¡Pago Exitoso! Tu SIAPP está Habilitado
            </h2>
            <p class="text-sm text-slate-600">
              Se ha renovado tu suscripción automáticamente. El acceso al sistema y facturación SUNAT se encuentran 100% operativos.
            </p>
          </div>

          <!-- Cuadro de Resumen de Pago -->
          <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left text-xs sm:text-sm space-y-2">
            <div class="flex justify-between py-1 border-b border-slate-200">
              <span class="text-slate-500">Institución:</span>
              <span class="font-bold text-slate-800">{{ comprobantePago.institucion }}</span>
            </div>
            <div class="flex justify-between py-1 border-b border-slate-200">
              <span class="text-slate-500">Recibo / Liquidación:</span>
              <span class="font-mono font-bold text-slate-800">{{ comprobantePago.recibo }}</span>
            </div>
            <div class="flex justify-between py-1 border-b border-slate-200">
              <span class="text-slate-500">Código de Autorización:</span>
              <span class="font-mono font-bold text-emerald-700">{{ comprobantePago.authCode }}</span>
            </div>
            <div class="flex justify-between py-1 border-b border-slate-200">
              <span class="text-slate-500">Medio de Pago:</span>
              <span class="font-semibold text-slate-800">{{ comprobantePago.metodo }}</span>
            </div>
            <div class="flex justify-between py-1 border-b border-slate-200">
              <span class="text-slate-500">Monto Cobrado:</span>
              <span class="font-extrabold text-slate-900 text-base">{{ comprobantePago.moneda }} {{ comprobantePago.monto.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between py-1">
              <span class="text-slate-500">Nueva Fecha de Vencimiento:</span>
              <span class="font-bold text-emerald-600">16 de Octubre de 2026</span>
            </div>
          </div>

          <!-- Botones de Acción Posterior al Pago -->
          <div class="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <a
              :href="comprobantePago.urlSistema"
              target="_blank"
              class="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-sm shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2"
            >
              <span>Ingresar a tu Instancia SIAPP</span>
              <i class="fa-light fa-arrow-up-right-from-square"></i>
            </a>

            <button
              type="button"
              @click="nuevaConsulta"
              class="px-5 py-3.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-all"
            >
              Consultar Otra Cuenta
            </button>
          </div>
        </div>
      </div>

      <!-- CASO 2: CLIENTE ENCONTRADO CON PAGO PENDIENTE (FLUJO DE CHECKOUT) -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <!-- COLUMNA IZQUIERDA: DATOS DE LA INSTITUCIÓN Y RECIBO -->
        <div class="lg:col-span-7 space-y-6">
          
          <!-- Tarjeta de la Institución -->
          <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <div class="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cuenta N° {{ clienteActual.cuentaID }}</span>
                <h3 class="text-xl font-bold text-slate-900 font-heading">{{ clienteActual.institucion }}</h3>
              </div>
              <div class="flex items-center gap-2">
                <span :class="['px-3 py-1 rounded-full text-xs font-bold border', clienteActual.planBadgeColor]">
                  {{ clienteActual.planNombre }}
                </span>
                <span :class="['px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5', clienteActual.estadoBadgeColor]">
                  <span class="w-2 h-2 rounded-full bg-amber-500 animate-ping" v-if="clienteActual.estadoServicio.includes('Pendiente')"></span>
                  {{ clienteActual.estadoServicio }}
                </span>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div>
                <span class="text-slate-400 block text-xs">RUC:</span>
                <span class="font-semibold text-slate-800">{{ clienteActual.ruc }}</span>
              </div>
              <div>
                <span class="text-slate-400 block text-xs">Subdominio / ERP:</span>
                <a :href="clienteActual.urlSistema" target="_blank" class="font-semibold text-blue-600 hover:underline flex items-center gap-1">
                  <span>{{ clienteActual.subdominio }}</span>
                  <i class="fa-light fa-external-link text-xs"></i>
                </a>
              </div>
              <div>
                <span class="text-slate-400 block text-xs">Responsable:</span>
                <span class="font-semibold text-slate-800">{{ clienteActual.responsable }}</span>
              </div>
              <div>
                <span class="text-slate-400 block text-xs">Fecha Límite de Pago:</span>
                <span class="font-bold text-red-600">{{ clienteActual.fechaVencimiento }} (en {{ clienteActual.diasRestantes }} días)</span>
              </div>
            </div>
          </div>

          <!-- Desglose de Facturación / Recibo -->
          <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
              <div class="flex items-center gap-2">
                <i class="fa-light fa-file-invoice text-blue-600 text-lg"></i>
                <h4 class="font-bold text-slate-900">Liquidación Mensual: {{ clienteActual.reciboNumero }}</h4>
              </div>
              <span class="text-xs font-medium text-slate-500">Período: {{ clienteActual.periodo }}</span>
            </div>

            <!-- Tabla de Ítems -->
            <div class="space-y-3">
              <div
                v-for="(item, idx) in clienteActual.items"
                :key="idx"
                class="flex items-center justify-between py-2 border-b border-slate-50 text-xs sm:text-sm"
              >
                <div class="flex items-center gap-2 text-slate-700">
                  <i class="fa-solid fa-check text-emerald-500 text-xs"></i>
                  <span>{{ item.descripcion }}</span>
                </div>
                <div class="font-semibold text-slate-900 whitespace-nowrap">
                  {{ clienteActual.moneda }} {{ item.monto.toFixed(2) }}
                </div>
              </div>
            </div>

            <!-- Totales -->
            <div class="pt-2 space-y-1.5 text-xs sm:text-sm">
              <div class="flex justify-between text-slate-500">
                <span>Subtotal (Base Imponible):</span>
                <span>{{ clienteActual.moneda }} {{ clienteActual.subtotal.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between text-slate-500">
                <span>I.G.V. (18%):</span>
                <span>{{ clienteActual.moneda }} {{ clienteActual.igv.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between text-base sm:text-lg font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total a Pagar:</span>
                <span class="text-blue-600 font-heading">{{ clienteActual.moneda }} {{ clienteActual.total.toFixed(2) }}</span>
              </div>
            </div>

            <div class="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
              <i class="fa-light fa-info-circle text-base text-amber-600 mt-0.5"></i>
              <div>
                <strong>Activación en Tiempo Real:</strong> Al confirmar el pago a través de cualquiera de nuestros canales, la licencia de su institución se renovará automáticamente sin necesidad de enviar comprobantes manuales.
              </div>
            </div>
          </div>

        </div>

        <!-- COLUMNA DERECHA: PASARELA DE PAGO INTERACTIVA -->
        <div class="lg:col-span-5 space-y-6">
          <div class="bg-white rounded-2xl shadow-xl border border-blue-200/80 p-6 space-y-5 sticky top-28">
            
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 class="font-bold text-slate-900 text-base flex items-center gap-2">
                <i class="fa-light fa-lock-keyhole text-blue-600"></i>
                <span>Selecciona Medio de Pago</span>
              </h4>
              <span class="text-xs text-slate-400 font-semibold">SSL 256-bit Seguro</span>
            </div>

            <!-- Tabs de Métodos de Pago -->
            <div class="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                @click="metodoPago = 'tarjeta'"
                :class="['py-2 px-1 text-center rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-1', metodoPago === 'tarjeta' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900']"
              >
                <i class="fa-light fa-credit-card text-base"></i>
                <span>Tarjeta</span>
              </button>

              <button
                type="button"
                @click="metodoPago = 'yape'"
                :class="['py-2 px-1 text-center rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-1', metodoPago === 'yape' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900']"
              >
                <i class="fa-light fa-mobile-screen-button text-base"></i>
                <span>Yape / Plin</span>
              </button>

              <button
                type="button"
                @click="metodoPago = 'transferencia'"
                :class="['py-2 px-1 text-center rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-1', metodoPago === 'transferencia' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900']"
              >
                <i class="fa-light fa-building-columns text-base"></i>
                <span>Banco BCP</span>
              </button>
            </div>

            <!-- PESTAÑA 1: TARJETA DE CRÉDITO / DÉBITO -->
            <div v-if="metodoPago === 'tarjeta'" class="space-y-4">
              <!-- Mockup Visual de Tarjeta -->
              <div class="p-4 rounded-xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-blue-900 text-white shadow-md space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-[10px] uppercase tracking-widest text-slate-300 font-semibold">Tarjeta Corporativa</span>
                  <i class="fa-brands fa-cc-visa text-2xl text-white"></i>
                </div>
                <div class="font-mono text-base tracking-widest font-semibold py-1">
                  {{ formTarjeta.numero || '•••• •••• •••• ••••' }}
                </div>
                <div class="flex justify-between items-end text-[10px] text-slate-300">
                  <div>
                    <span class="block text-[8px] uppercase text-slate-400">Titular</span>
                    <span class="font-bold text-xs uppercase">{{ formTarjeta.nombre || 'NOMBRE DEL TITULAR' }}</span>
                  </div>
                  <div class="text-right">
                    <span class="block text-[8px] uppercase text-slate-400">Vence</span>
                    <span class="font-bold text-xs">{{ formTarjeta.exp || 'MM/AA' }}</span>
                  </div>
                </div>
              </div>

              <!-- Inputs de Tarjeta -->
              <div class="space-y-3 text-xs">
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Número de Tarjeta:</label>
                  <div class="relative">
                    <input
                      v-model="formTarjeta.numero"
                      type="text"
                      maxlength="19"
                      class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                    />
                    <div class="absolute inset-y-0 right-0 pr-3 flex items-center gap-1 text-slate-400">
                      <i class="fa-brands fa-cc-visa text-lg"></i>
                      <i class="fa-brands fa-cc-mastercard text-lg"></i>
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <label class="block font-semibold text-slate-700 mb-1">Expiración (MM/AA):</label>
                    <input
                      v-model="formTarjeta.exp"
                      type="text"
                      placeholder="MM/AA"
                      maxlength="5"
                      class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-center"
                    />
                  </div>
                  <div>
                    <label class="block font-semibold text-slate-700 mb-1">CVV / CVC:</label>
                    <input
                      v-model="formTarjeta.cvv"
                      type="password"
                      placeholder="•••"
                      maxlength="4"
                      class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-center"
                    />
                  </div>
                </div>

                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Nombre en la Tarjeta:</label>
                  <input
                    v-model="formTarjeta.nombre"
                    type="text"
                    class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase"
                  />
                </div>
              </div>
            </div>

            <!-- PESTAÑA 2: YAPE / PLIN -->
            <div v-else-if="metodoPago === 'yape'" class="space-y-4 text-center">
              <div class="p-4 rounded-xl bg-purple-50 border border-purple-200 space-y-3">
                <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-600 text-white font-bold text-xs">
                  <i class="fa-solid fa-qrcode"></i>
                  <span>Código QR Yape Oficial</span>
                </div>
                
                <!-- QR Visual Simulado -->
                <div class="w-40 h-40 mx-auto bg-white p-2 rounded-xl shadow-sm border border-purple-200 flex flex-col items-center justify-center relative">
                  <div class="w-full h-full bg-slate-900 rounded-lg flex items-center justify-center text-white text-center p-2">
                    <div class="space-y-1">
                      <i class="fa-solid fa-qrcode text-5xl"></i>
                      <div class="text-[9px] font-mono tracking-tighter">SIAPP SOLUCIONES SAC</div>
                    </div>
                  </div>
                </div>

                <div class="text-xs space-y-1">
                  <div class="text-slate-600">Escanea desde tu app Yape o transfiere al número:</div>
                  <div class="text-base font-extrabold text-purple-900 font-mono tracking-wider">987 654 321</div>
                  <div class="text-[11px] text-slate-500 font-medium">Titular: SIAPP SOLUCIONES EDUCATIVAS SAC</div>
                </div>
              </div>

              <div class="text-left text-xs space-y-1">
                <label class="block font-semibold text-slate-700">Código de Aprobación de Yape (6 dígitos):</label>
                <input
                  v-model="formYape.codigoAprobacion"
                  type="text"
                  placeholder="Ej: 782910"
                  maxlength="8"
                  class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:outline-none font-mono text-center text-sm font-bold tracking-widest"
                />
              </div>
            </div>

            <!-- PESTAÑA 3: TRANSFERENCIA BANCARIA BCP -->
            <div v-else class="space-y-4 text-xs">
              <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-slate-900 text-sm">Banco de Crédito del Perú (BCP)</span>
                  <span class="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">Soles (S/)</span>
                </div>

                <div class="space-y-2">
                  <div class="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-200">
                    <div>
                      <span class="block text-[10px] text-slate-400">Cuenta Corriente BCP:</span>
                      <span class="font-mono font-bold text-slate-800">191-2849102-0-45</span>
                    </div>
                    <button
                      type="button"
                      @click="copiarTexto('191-2849102-0-45', 'cta')"
                      class="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-semibold"
                    >
                      Copiar
                    </button>
                  </div>

                  <div class="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-200">
                    <div>
                      <span class="block text-[10px] text-slate-400">Código Interbancario (CCI):</span>
                      <span class="font-mono font-bold text-slate-800">002-191-002849102045-56</span>
                    </div>
                    <button
                      type="button"
                      @click="copiarTexto('002-191-002849102045-56', 'cci')"
                      class="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-semibold"
                    >
                      Copiar
                    </button>
                  </div>
                </div>

                <div class="text-[11px] text-slate-500">
                  Beneficiario: <strong>SIAPP SOFTWARE PERU S.A.C.</strong><br />
                  RUC: <strong>20608912345</strong>
                </div>
              </div>

              <div>
                <label class="block font-semibold text-slate-700 mb-1">N° de Operación de la Transferencia:</label>
                <input
                  v-model="formTransferencia.nroOperacion"
                  type="text"
                  placeholder="Ej: 98410293"
                  class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            <!-- BOTÓN PRINCIPAL DE PAGO -->
            <div class="pt-2">
              <button
                type="button"
                @click="procesarPago"
                :disabled="isProcessing"
                class="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] text-white font-bold text-base shadow-lg shadow-blue-600/30 transition-all flex flex-col items-center justify-center gap-1 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <div v-if="isProcessing" class="flex items-center gap-2">
                  <i class="fa-solid fa-spinner fa-spin text-lg"></i>
                  <span>Procesando Pago Seguro...</span>
                </div>
                <div v-else class="flex items-center gap-2">
                  <i class="fa-light fa-badge-check text-lg"></i>
                  <span>Pagar {{ clienteActual.moneda }} {{ clienteActual.total.toFixed(2) }} y Habilitar SIAPP</span>
                </div>
                <span v-if="isProcessing" class="text-[11px] font-normal text-blue-200 animate-pulse">
                  {{ processingStep }}
                </span>
                <span v-else class="text-[10px] font-normal text-blue-100">
                  Activación automática e inmediata tras confirmación
                </span>
              </button>
            </div>

            <div class="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5 pt-1">
              <i class="fa-light fa-shield-halved text-emerald-600"></i>
              <span>Garantía de disponibilidad y respaldo de datos 100% garantizado</span>
            </div>

          </div>
        </div>

      </div>

    </div>

    <!-- SECCIÓN DE PREGUNTAS FRECUENTES Y SOPORTE DE FACTURACIÓN -->
    <div class="mt-16 pt-12 border-t border-slate-200/80">
      <div class="text-center max-w-2xl mx-auto space-y-2 mb-8">
        <h3 class="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
          Preguntas Frecuentes sobre Pagos y Activación
        </h3>
        <p class="text-sm text-slate-600">
          Todo lo que necesitas saber sobre el cobro y la continuidad de tu servicio en la nube.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div class="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
            <i class="fa-light fa-bolt"></i>
          </div>
          <h4 class="font-bold text-slate-900 text-sm">¿Cuánto tarda en habilitarse el sistema?</h4>
          <p class="text-xs text-slate-600 leading-relaxed">
            La activación es instantánea. Nuestro webhook actualiza la vigencia en la base de datos central en menos de 5 segundos tras aprobarse la transacción.
          </p>
        </div>

        <div class="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div class="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg">
            <i class="fa-light fa-file-invoice-dollar"></i>
          </div>
          <h4 class="font-bold text-slate-900 text-sm">¿Emiten factura electrónica?</h4>
          <p class="text-xs text-slate-600 leading-relaxed">
            Sí. Emitimos factura electrónica a nombre de la razón social y RUC de su institución educativa, la cual llega automáticamente a su correo registrado.
          </p>
        </div>

        <div class="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div class="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
            <i class="fa-light fa-headset"></i>
          </div>
          <h4 class="font-bold text-slate-900 text-sm">¿Necesitas soporte financiero?</h4>
          <p class="text-xs text-slate-600 leading-relaxed">
            Comunícate directamente con nuestro equipo de facturación al <strong>(01) 748-2900</strong> o vía WhatsApp al <strong>+51 987 654 321</strong>.
          </p>
        </div>
      </div>
    </div>

  </div>
</template>
