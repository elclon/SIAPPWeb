<script setup>
import { ref } from 'vue';

const moduloActivo = ref('academico');

const modulos = [
  {
    id: 'academico',
    titulo: 'Gestión Académica',
    subtitulo: 'Malla Curricular, Matrículas y Actas de Notas',
    icono: 'fa-light fa-graduation-cap',
    color: 'blue',
    archivoImagen: '/images/sistema/captura-academico.png',
    descripcion: 'Control integral de la vida académica del estudiante: desde la inscripción inicial y asignación de grupos/secciones, hasta el cálculo ponderado y emisión de certificados oficiales.',
    caracteristicas: [
      'Matrícula individual y masiva con validación automática de prerrequisitos',
      'Configuración de planes de estudio, semestres, turnos y horarios',
      'Carga de notas por docentes con rangos y fórmulas personalizadas',
      'Historial académico completo y seguimiento de egresados'
    ]
  },
  {
    id: 'caja',
    titulo: 'Caja y Tesorería',
    subtitulo: 'Planes de Pago, Recaudación y Cierre de Caja',
    icono: 'fa-light fa-cash-register',
    color: 'emerald',
    archivoImagen: '/images/sistema/captura-caja.png',
    descripcion: 'Automatización completa del flujo financiero institucional. Controla cuentas por cobrar, estados de cuenta por alumno y apertura/cierre de cajas por sucursal en tiempo real.',
    caracteristicas: [
      'Cronogramas y planes de pago flexibles por ciclo o mensualidad',
      'Cobranza rápida con soporte para efectivo, tarjetas y pasarelas digitales',
      'Bloqueo preventivo de trámites por deuda configurable',
      'Reportes de recaudación diaria, arqueos y conciliación bancaria'
    ]
  },
  {
    id: 'sunat',
    titulo: 'Facturación SUNAT',
    subtitulo: 'Boletas, Facturas y Notas de Crédito Electrónicas',
    icono: 'fa-light fa-file-invoice-dollar',
    color: 'indigo',
    archivoImagen: '/images/sistema/captura-sunat.png',
    descripcion: 'Emisión electrónica directa y certificada ante SUNAT. Generación instantánea de XML, CDR y representación impresa en formato Ticket o A4 con código QR y firma digital.',
    caracteristicas: [
      'Emisión 100% nativa de Boletas y Facturas electrónicas en menos de 2 segundos',
      'Integración automática con OSE y PSE autorizados',
      'Retransmisión y regularización automática en caso de contingencias',
      'Envío inmediato del comprobante por correo al apoderado o alumno'
    ]
  },
  {
    id: 'asistencia',
    titulo: 'Control de Asistencias',
    subtitulo: 'Marcación Biométrica y Asistencia por Aula',
    icono: 'fa-light fa-fingerprint',
    color: 'purple',
    archivoImagen: '/images/sistema/captura-biometrico.png',
    descripcion: 'Monitoreo en vivo de la asistencia de alumnos y docentes mediante lectores biométricos (huella/facial) o registro directo por clase desde la aplicación docente.',
    caracteristicas: [
      'Sincronización con relojes biométricos ZKTeco y dispositivos IP',
      'Cálculo automático de inasistencias acumuladas y límites por retiro',
      'Alerta temprana a tutores y directores por faltas reiteradas',
      'Reporte consolidado para cumplimiento de horas lectivas MINEDU'
    ]
  },
  {
    id: 'portal',
    titulo: 'Portal del Alumno',
    subtitulo: 'Acceso Web y Móvil 24/7 para Estudiantes',
    icono: 'fa-light fa-mobile-screen-button',
    color: 'amber',
    archivoImagen: '/images/sistema/captura-portal.png',
    descripcion: 'Entorno virtual intuitivo y responsivo para que los estudiantes consulten sus calificaciones, horarios, estado de cuenta y realicen pagos en línea de forma autónoma.',
    caracteristicas: [
      'Consulta en tiempo real de notas parciales, finales y promedios',
      'Descarga de constancias, mallas curriculares y sílabos digitales',
      'Pasarela de pagos integrada para abono de cuotas con Yape/tarjeta',
      'Notificaciones académicas instantáneas y avisos de secretaría'
    ]
  }
];

const moduloSeleccionado = ref(modulos[0]);
const imagenCargada = ref(true);

const seleccionarModulo = (m) => {
  moduloActivo.value = m.id;
  moduloSeleccionado.value = m;
  imagenCargada.value = true;
};

const onImageError = () => {
  imagenCargada.value = false;
};

const onImageLoad = () => {
  imagenCargada.value = true;
};
</script>

<template>
  <div class="space-y-8">
    
    <!-- PESTAÑAS SELECTORAS DE MÓDULOS -->
    <div class="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-slate-100/80 backdrop-blur-md rounded-2xl border border-slate-200/80 max-w-4xl mx-auto shadow-xs">
      <button
        v-for="m in modulos"
        :key="m.id"
        type="button"
        @click="seleccionarModulo(m)"
        :class="[
          'px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2',
          moduloActivo === m.id
            ? 'bg-white text-slate-900 shadow-md shadow-slate-200/80 border border-slate-200/60 scale-[1.02]'
            : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
        ]"
      >
        <i :class="[m.icono, moduloActivo === m.id ? 'text-blue-600' : 'text-slate-400']"></i>
        <span>{{ m.titulo }}</span>
      </button>
    </div>

    <!-- VENTANA DEL SISTEMA (WINDOW MOCKUP) -->
    <div class="bg-white rounded-3xl shadow-2xl shadow-slate-300/60 border border-slate-200/90 overflow-hidden max-w-6xl mx-auto transition-all duration-300">
      
      <!-- BARRA SUPERIOR DE LA VENTANA (ESTILO APLICACIÓN MODERNA) -->
      <div class="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
        <!-- Botones Mac/Windows -->
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-red-500/90 inline-block"></span>
          <span class="w-3 h-3 rounded-full bg-amber-500/90 inline-block"></span>
          <span class="w-3 h-3 rounded-full bg-emerald-500/90 inline-block"></span>
          <span class="ml-3 text-xs font-mono text-slate-400 hidden sm:inline-block">
            SIAPP v10.0 &mdash; {{ moduloSeleccionado.titulo }}
          </span>
        </div>

        <!-- Indicador de Conexión en Vivo -->
        <div class="flex items-center gap-2 text-xs">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span class="text-slate-300 font-medium text-[11px]">Servidor Nube Activo</span>
        </div>
      </div>

      <!-- CONTENIDO DE LA PANTALLA -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch bg-slate-950">
        
        <!-- VISOR DE LA IMAGEN O INTERFAZ DEL SISTEMA (8 Columnas) -->
        <div class="lg:col-span-8 p-4 sm:p-6 flex flex-col justify-center items-center bg-slate-900/60 relative overflow-hidden group">
          
          <!-- Mockup Interactivo / Imagen del Sistema -->
          <div class="w-full rounded-xl overflow-hidden border border-slate-800 shadow-xl relative bg-slate-900 aspect-video flex items-center justify-center">
            
            <!-- Imagen física del usuario si existe en public/images/sistema/ -->
            <img
              :key="moduloSeleccionado.archivoImagen"
              :src="moduloSeleccionado.archivoImagen"
              :alt="moduloSeleccionado.titulo"
              v-show="imagenCargada"
              class="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.01] relative z-10"
              @load="onImageLoad"
              @error="onImageError"
            />

            <!-- Fallback Gráfico de Alta Fidelidad en caso aún no hayan pegado el archivo PNG -->
            <div
              v-if="!imagenCargada"
              class="absolute inset-0 p-5 flex flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white select-none pointer-events-none z-0"
            >
              
              <!-- Ribbon Menu Superior Simulado -->
              <div class="space-y-3">
                <div class="flex items-center justify-between pb-3 border-b border-slate-700/80 text-xs">
                  <div class="flex items-center gap-4">
                    <span class="font-bold text-blue-400 flex items-center gap-1.5">
                      <i class="fa-solid fa-graduation-cap"></i> SIAPP ERP
                    </span>
                    <span class="text-slate-400 font-medium">Inicio</span>
                    <span class="text-white font-bold bg-blue-600/30 px-2.5 py-1 rounded text-blue-300 border border-blue-500/30">
                      {{ moduloSeleccionado.titulo }}
                    </span>
                    <span class="text-slate-400 font-medium hidden sm:inline">Reportes</span>
                    <span class="text-slate-400 font-medium hidden sm:inline">Configuración</span>
                  </div>
                  <span class="text-[10px] font-mono text-slate-400">Sucursal Central &bull; 2026-II</span>
                </div>

                <!-- Barra de Herramientas del Ribbon -->
                <div class="flex flex-wrap items-center gap-2 pt-1">
                  <div class="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs flex items-center gap-2 text-slate-200">
                    <i class="fa-light fa-magnifying-glass text-blue-400"></i>
                    <span>Buscar registro...</span>
                  </div>
                  <div class="px-3 py-1.5 rounded-lg bg-blue-600 text-xs font-bold text-white flex items-center gap-1.5 shadow-sm">
                    <i class="fa-light fa-plus"></i>
                    <span>Nuevo Registro</span>
                  </div>
                  <div class="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300 flex items-center gap-1.5">
                    <i class="fa-light fa-file-excel text-emerald-400"></i>
                    <span>Exportar</span>
                  </div>
                </div>
              </div>

              <!-- Grilla de Datos Simulada -->
              <div class="my-auto space-y-2 py-3">
                <div class="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-xs space-y-2">
                  <div class="flex justify-between items-center text-slate-300 font-semibold border-b border-slate-700 pb-2">
                    <span># Documento</span>
                    <span>Estudiante / Concepto</span>
                    <span>Especialidad</span>
                    <span>Estado</span>
                  </div>
                  <div class="flex justify-between items-center text-slate-400 text-[11px] py-1">
                    <span class="font-mono text-slate-200">72849102</span>
                    <span class="text-slate-200 font-medium">Zegarra Mendoza, Carlos</span>
                    <span>Desarrollo de Sistemas</span>
                    <span class="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 text-[10px] font-bold">Activo</span>
                  </div>
                  <div class="flex justify-between items-center text-slate-400 text-[11px] py-1 border-t border-slate-700/50">
                    <span class="font-mono text-slate-200">74920183</span>
                    <span class="text-slate-200 font-medium">Alva Quispe, Andrea</span>
                    <span>Administración de Empresas</span>
                    <span class="px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-700 text-[10px] font-bold">Matriculado</span>
                  </div>
                </div>
              </div>

              <!-- Barra de Estado Inferior -->
              <div class="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t border-slate-800">
                <span>Registros cargados: 1,480 alumnos activos</span>
                <span class="text-blue-400 font-semibold flex items-center gap-1">
                  <i class="fa-solid fa-cloud-check"></i> Sincronizado en tiempo real
                </span>
              </div>

            </div>

            <!-- Marca de agua sutil de SIAPP -->
            <div class="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
              <i class="fa-sharp fa-solid fa-graduation-cap text-[140px] text-white"></i>
            </div>
          </div>

          <!-- Nota informativa para el usuario -->
          <div class="w-full mt-3 flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span class="flex items-center gap-1.5">
              <i class="fa-light fa-image text-blue-400"></i>
              <span>Coloca tu captura en: <code class="text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded font-mono">{{ moduloSeleccionado.archivoImagen }}</code></span>
            </span>
            <span class="text-emerald-400 font-medium flex items-center gap-1">
              <i class="fa-light fa-check-circle"></i> Visualización de Alta Resolución
            </span>
          </div>

        </div>

        <!-- PANEL DE DETALLES Y BENEFICIOS DEL MÓDULO (4 Columnas) -->
        <div class="lg:col-span-4 p-6 sm:p-8 bg-white flex flex-col justify-between space-y-6">
          
          <div class="space-y-4">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
              <i :class="moduloSeleccionado.icono"></i>
              <span>Módulo {{ moduloSeleccionado.titulo }}</span>
            </div>

            <div>
              <h3 class="text-xl sm:text-2xl font-bold text-slate-900 font-heading leading-tight">
                {{ moduloSeleccionado.subtitulo }}
              </h3>
              <p class="text-xs sm:text-sm text-slate-600 leading-relaxed mt-3">
                {{ moduloSeleccionado.descripcion }}
              </p>
            </div>

            <!-- Lista de Características -->
            <div class="space-y-2.5 pt-2">
              <div
                v-for="(caract, idx) in moduloSeleccionado.caracteristicas"
                :key="idx"
                class="flex items-start gap-2.5 text-xs text-slate-700"
              >
                <div class="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] mt-0.5 shrink-0">
                  <i class="fa-solid fa-check"></i>
                </div>
                <span class="leading-tight">{{ caract }}</span>
              </div>
            </div>
          </div>

          <!-- Botón de Acción a la Demostración -->
          <div class="pt-4 border-t border-slate-100">
            <a
              href="/contacto"
              class="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Solicitar Demo de este Módulo</span>
              <i class="fa-light fa-arrow-right"></i>
            </a>
          </div>

        </div>

      </div>

    </div>

  </div>
</template>
