export interface PlanInfo {
  name: string;
  tag: string;
  price: string;
  period: string;
  featured: boolean;
  description: string;
  features: string[];
  ctaText: string;
  ctaLink: string;
}

export interface FaqInfo {
  q: string;
  a: string;
}

export const planes: PlanInfo[] = [
  {
    name: 'Plan Académico',
    tag: 'Colegios y Academias',
    price: 'S/ 350',
    period: '/ mes',
    featured: false,
    description: 'Ideal para instituciones pequeñas o en crecimiento que buscan ordenar sus matrículas, notas y aula virtual.',
    features: [
      'Hasta 500 alumnos activos',
      'Gestión de matrículas y grupos',
      'Notas por pesos o equitativas por programa',
      'Aula virtual propia: lecciones y tareas',
      'Exámenes en línea con calificación al instante',
      'Portal web para docentes y alumnos',
      'Soporte técnico y copias de seguridad'
    ],
    ctaText: 'Elegir Plan Académico',
    ctaLink: '/contacto?plan=academico'
  },
  {
    name: 'Plan Instituto Pro',
    tag: 'Institutos Superiores y CETPROs',
    price: 'S/ 650',
    period: '/ mes',
    featured: true,
    description: 'Nuestra solución más demandada. Control integral académico, aula virtual, pasarela de pagos y facturación SUNAT.',
    features: [
      'Hasta 2,500 alumnos activos',
      'Todo lo del Plan Académico + Aula Virtual completa',
      'Cobranzas en línea (Tarjeta / Yape) por pasarela de pago',
      'Subida de comprobantes de pago y recordatorios por correo',
      'Facturación Electrónica SUNAT ilimitada y arqueo de cajas',
      'Control de asistencia, carnetización y certificados',
      'Integración con recaudación bancaria',
      'Soporte prioritario por WhatsApp y llamada'
    ],
    ctaText: 'Elegir Plan Instituto Pro',
    ctaLink: '/contacto?plan=instituto-pro'
  },
  {
    name: 'Plan Enterprise',
    tag: 'Universidades y Redes',
    price: 'A medida',
    period: '',
    featured: false,
    description: 'Para organizaciones con múltiples sedes que requieren personalización, base de datos dedicada y SLA garantizado.',
    features: [
      'Alumnos ilimitados y sedes múltiples',
      'Todo lo del Plan Pro',
      'Base de datos y servidor exclusivo',
      'Aula virtual propia de alto rendimiento e integraciones API',
      'Módulo de videoconferencias para clases en vivo',
      'Personalización de marca (Whitelabel)',
      'Capacitación presencial y virtual al personal',
      'Gerente de cuenta técnico asignado 24/7'
    ],
    ctaText: 'Contactar a Ventas',
    ctaLink: '/contacto?plan=enterprise'
  }
];

export const faqs: FaqInfo[] = [
  {
    q: '¿Cómo se realiza el pago mensual de la suscripción de SIAPP?',
    a: 'El día 1 de cada mes recibirás un correo electrónico con tu código de cuenta y un enlace seguro para pagar con tarjeta de crédito/débito, Yape, Plin o transferencia bancaria en nuestro Portal de Clientes.'
  },
  {
    q: '¿El servicio se habilita de inmediato tras el pago?',
    a: 'Sí, contamos con un sistema automatizado que procesa la confirmación de la pasarela y renueva la vigencia de tu servicio al instante.'
  },
  {
    q: '¿Se requiere instalar algún servidor físico en mi institución?',
    a: 'No es necesario. SIAPP puede funcionar 100% en la nube bajo alta disponibilidad, accesible desde cualquier navegador web. También ofrecemos modalidad On-Premise si tu institución cuenta con datacenter propio.'
  },
  {
    q: '¿Ofrecen soporte y capacitación para el personal?',
    a: 'Por supuesto. Todos nuestros planes incluyen capacitación guiada para el equipo directivo, secretaría académica y docentes, además de manuales y videotutoriales.'
  }
];
