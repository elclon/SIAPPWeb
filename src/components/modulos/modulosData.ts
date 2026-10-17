export interface ModuloInfo {
  id: string;
  tag: string;
  title: string;
  icon: string;
  color: string;
  bgLight: string;
  textColor: string;
  description: string;
  features: string[];
}

export const modulos: ModuloInfo[] = [
  {
    id: 'academico',
    tag: 'Gestión Curricular',
    title: 'Módulo Académico Integral',
    icon: 'fa-light fa-graduation-cap',
    color: 'from-blue-600 to-indigo-600',
    bgLight: 'bg-blue-50',
    textColor: 'text-blue-600',
    description: 'Administra toda la estructura pedagógica de tu institución con flexibilidad en el sistema de evaluación y cumplimiento estricto de las normativas vigentes.',
    features: [
      'Configuración de Programas de Estudio, Carreras y Cursos de Extensión.',
      'Configuración de notas por pesos ponderados o de forma equitativa, diferenciada por programa.',
      'Planes Curriculares por créditos y horas pedagógicas.',
      'Control de prerrequisitos académicos automáticos en matrícula.',
      'Creación de grupos, semestres, turnos (Mañana, Tarde, Noche) y secciones.',
      'Asignación de carga lectiva a docentes con validación de cruces y emisión de actas oficiales.'
    ]
  },
  {
    id: 'aula-virtual',
    tag: 'Aprendizaje Digital',
    title: 'Aula Virtual Propia y Exámenes en Línea',
    icon: 'fa-light fa-chalkboard-user',
    color: 'from-cyan-600 to-blue-600',
    bgLight: 'bg-cyan-50',
    textColor: 'text-cyan-600',
    description: 'Plataforma de aprendizaje 100% propia e integrada en SIAPP, sin depender de sistemas externos, diseñada para gestionar clases, recursos y evaluaciones interactivas.',
    features: [
      'Publicación organizada de lecciones, materiales multimedia y recursos de clase.',
      'Asignación y entrega de tareas en línea con control de plazos y revisión docente.',
      'Exámenes en línea configurables con calificación automática al instante.',
      'Integración directa con el registro de notas (por pesos o equitativo según el programa).',
      'Retroalimentación inmediata al estudiante tras finalizar sus evaluaciones.',
      'Acceso fluido desde computadoras, tablets y celulares sin instalar aplicaciones adicionales.'
    ]
  },
  {
    id: 'tesoreria',
    tag: 'Finanzas y Caja',
    title: 'Tesorería, Pasarela de Pagos y Cobranzas',
    icon: 'fa-light fa-cash-register',
    color: 'from-indigo-600 to-violet-600',
    bgLight: 'bg-indigo-50',
    textColor: 'text-indigo-600',
    description: 'Control financiero riguroso que optimiza la recaudación con pagos en línea, validación de comprobantes, recordatorios por correo y cuadre de cajas en tiempo real.',
    features: [
      'Cobranzas en línea con tarjeta o Yape a través de pasarela de pago integrada.',
      'Subida de comprobantes de pago (vouchers) por parte de los alumnos para validación.',
      'Envío de recordatorios de pago a alumnos a través de correos electrónicos.',
      'Generación automática de cuotas mensuales, matrículas, moras y descuentos.',
      'Apertura, movimiento y arqueo de cajas diarias por usuario y sucursal.',
      'Recaudación bancaria y estado de cuenta al instante para padres y alumnos.'
    ]
  },
  {
    id: 'sunat',
    tag: 'Tributario',
    title: 'Facturación Electrónica SUNAT',
    icon: 'fa-light fa-file-invoice-dollar',
    color: 'from-emerald-600 to-teal-600',
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    description: 'Emite comprobantes de pago autorizados por SUNAT de manera inmediata desde el mismo módulo de cobranzas.',
    features: [
      'Emisión de Boletas, Facturas, Notas de Crédito y Débito.',
      'Integración directa con los Web Services de SUNAT u OSE.',
      'Generación automática de XML firmado, CDR y PDF con código QR.',
      'Retransmisión automática en caso de contingencia o intermitencia de red.',
      'Reportes tributarios de ventas mensuales para el área contable.',
      'Envío automático del comprobante al correo del estudiante.'
    ]
  },
  {
    id: 'carnetizacion',
    tag: 'Identificación Institucional',
    title: 'Carnetización y Control de Acceso',
    icon: 'fa-light fa-id-card',
    color: 'from-purple-600 to-indigo-600',
    bgLight: 'bg-purple-50',
    textColor: 'text-purple-600',
    description: 'Generación e impresión de carnets estudiantiles y docentes personalizados con el logo institucional, fotografía y código de barras para lectores ópticos.',
    features: [
      'Diseño e impresión masiva de carnets con el logo y colores de la institución.',
      'Generación automática de códigos de barras (Code 128 / Code 39) y QR únicos por alumno.',
      'Compatibilidad con lectores ópticos de código de barras para control rápido en puerta.',
      'Captura e integración directa de fotografía del estudiante en su ficha.',
      'Validación de vigencia de matrícula y estado de pago al momento de la lectura.',
      'Reimpresión ágil por duplicado con registro de historial de emisiones.'
    ]
  },
  {
    id: 'portales',
    tag: 'Comunidad Educativa',
    title: 'Portales de Alumnos y Docentes',
    icon: 'fa-light fa-users-class',
    color: 'from-violet-600 to-purple-600',
    bgLight: 'bg-violet-50',
    textColor: 'text-violet-600',
    description: 'Experiencia 100% digital y moderna accesible desde computadoras o celulares para profesores y alumnos.',
    features: [
      'Docentes: Gestión de aula virtual (lecciones, tareas y exámenes en línea), asistencia y sílabos.',
      'Docentes: Registro de notas adaptado por pesos o de forma equitativa según cada programa.',
      'Alumnos: Desarrollo de lecciones, envío de tareas y exámenes en línea con calificación al instante.',
      'Alumnos: Pago de pensiones en línea con tarjeta o Yape y subida de comprobantes de pago.',
      'Alumnos: Consulta de horarios, notas en tiempo real, récord académico y estado de cuenta.'
    ]
  },
  {
    id: 'reportes',
    tag: 'Inteligencia de Negocios',
    title: 'Reportes Gerenciales y Estadísticas',
    icon: 'fa-light fa-chart-pie-simple',
    color: 'from-amber-600 to-orange-600',
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-600',
    description: 'Decisiones basadas en datos precisos con herramientas de visualización y exportación en alta calidad.',
    features: [
      'Reporte de análisis de matriculados con filtros por carrera, turno y sede.',
      'Reportes de proyección de ingresos vs recaudado real.',
      'Récord académico, rankings de notas y cuadros de mérito.',
      'Certificados de estudios y constancias oficiales prediseñadas.',
      'Exportación nativa a formatos PDF, Excel y formatos de reporte ministerial.'
    ]
  }
];
