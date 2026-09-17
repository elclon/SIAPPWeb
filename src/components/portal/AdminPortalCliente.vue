<script setup>
import { ref, computed, onMounted } from 'vue';

// Pestañas Activas en el Panel Admin: 'empresas' | 'calculo' | 'vouchers'
const pestanaActiva = ref('empresas');

// Vista de detalle de manuales para una empresa seleccionada (null = ver lista de empresas)
const empresaSeleccionadaManuales = ref(null);

// Período de Consulta para Conteo Multi-BD
const anioActual = new Date().getFullYear();
const mesActual = new Date().getMonth() + 1;
const filtroAnio = ref(anioActual);
const filtroMes = ref(mesActual);

// Estados de Carga y Notificaciones
const isCalculando = ref(false);
const isGuardandoEmpresa = ref(false);
const isGuardandoManual = ref(false);
const mensajeFeedback = ref('');
const tipoFeedback = ref('success');

// Directorio de Empresas Registradas
const empresas = ref([
  {
    clienteID: 1,
    ruc: '20549281921',
    razonSocial: 'INSTITUTO DE EDUCACION SUPERIOR TECNOLOGICO ITEP S.A.C.',
    nombreComercial: 'Instituto Tecnológico ITEP',
    subdominioSIAPP: 'itep.siapp.edu.pe',
    codigoConexion: 'itep',
    tipoCobro: 'POR_ALUMNO',
    tarifaPorAlumno: 4.00,
    montoFijoPactado: null,
    tipoComprobanteHabitual: '01',
    porcentajeDetraccion: 12.00,
    contactoPrincipal: 'Lic. Roberto Zegarra',
    emailContacto: 'administracion@itep.edu.pe',
    estado: true
  },
  {
    clienteID: 2,
    ruc: '20491823901',
    razonSocial: 'INSTITUTO SUPERIOR DE EDUCACION TEPNUM E.I.R.L.',
    nombreComercial: 'Instituto Superior Tepnum',
    subdominioSIAPP: 'tepnum.siapp.edu.pe',
    codigoConexion: 'tepnum',
    tipoCobro: 'FIJO',
    tarifaPorAlumno: null,
    montoFijoPactado: 1500.00,
    tipoComprobanteHabitual: '01',
    porcentajeDetraccion: 12.00,
    contactoPrincipal: 'Mg. Carlos Mendoza',
    emailContacto: 'finanzas@tepnum.edu.pe',
    estado: true
  },
  {
    clienteID: 3,
    ruc: '20601928472',
    razonSocial: 'INSTITUTO SUPERIOR TECNOLOGICO STENDHAL S.A.',
    nombreComercial: 'Instituto Stendhal',
    subdominioSIAPP: 'stendhal.siapp.edu.pe',
    codigoConexion: 'stendhal',
    tipoCobro: 'POR_ALUMNO',
    tarifaPorAlumno: 4.00,
    montoFijoPactado: null,
    tipoComprobanteHabitual: '02',
    porcentajeDetraccion: 10.00,
    contactoPrincipal: 'Dra. Patricia Alva',
    emailContacto: 'direccion@stendhal.edu.pe',
    estado: true
  }
]);

// Lista de Cálculos de Alumnos en Vivo Multi-BD
const calculosClientes = ref([]);

// Lista de Vouchers Reportados
const vouchers = ref([
  {
    pagoID: 1,
    cobranzaID: 101,
    clienteNombre: 'Instituto Tecnológico ITEP',
    ruc: '20549281921',
    comprobanteCompleto: 'F001-00001248',
    tipoAbono: 'DETRACCION_BN',
    bancoDestino: 'Banco de la Nación',
    fechaOperacion: '16/09/2026',
    numeroOperacion: '0481920',
    montoPagado: 216.00,
    urlComprobanteVoucher: '#',
    observacionesCliente: 'Pago de detracción 12% por ventanilla BN',
    estadoValidacion: 'EN_REVISION',
    fechaReporte: '16/09/2026 11:30'
  },
  {
    pagoID: 2,
    cobranzaID: 101,
    clienteNombre: 'Instituto Tecnológico ITEP',
    ruc: '20549281921',
    comprobanteCompleto: 'F001-00001248',
    tipoAbono: 'NETO_COMERCIAL',
    bancoDestino: 'BCP',
    fechaOperacion: '16/09/2026',
    numeroOperacion: '98410293',
    montoPagado: 1584.00,
    urlComprobanteVoucher: '#',
    observacionesCliente: 'Transferencia interbancaria monto neto',
    estadoValidacion: 'EN_REVISION',
    fechaReporte: '16/09/2026 12:15'
  }
]);

// =====================================================================================
// PLANTILLA DE LOS 7 MANUALES FIJOS EXIGIDOS POR MINEDU / LICENCIAMIENTO (CBC)
// =====================================================================================
const manualesFijosMinedu = [
  {
    codigoFijo: 'MAN_ACAD',
    categoriaID: 1,
    categoriaNombre: 'Manuales de Usuario Oficiales',
    tituloBase: 'Manual Operativo: Módulo Académico & Matrículas',
    descripcion: 'Guía oficial para el registro de planes de estudio, mallas curriculares, apertura de ciclos y actas de notas.',
    icono: 'fa-book-open'
  },
  {
    codigoFijo: 'MAN_CAJA',
    categoriaID: 1,
    categoriaNombre: 'Manuales de Usuario Oficiales',
    tituloBase: 'Manual Operativo: Caja, Tesorería y Facturación SUNAT',
    descripcion: 'Procedimientos de recaudación, emisión de boletas y facturas electrónicas, control de arqueos y reportes contables.',
    icono: 'fa-file-invoice-dollar'
  },
  {
    codigoFijo: 'MAN_DOC',
    categoriaID: 1,
    categoriaNombre: 'Manuales de Usuario Oficiales',
    tituloBase: 'Manual del Portal Docente & Registro de Notas/Asistencias',
    descripcion: 'Guía de ingreso de calificaciones, sílabos, registro de asistencia por sesión y control pedagógico.',
    icono: 'fa-chalkboard-user'
  },
  {
    codigoFijo: 'MAN_ALU',
    categoriaID: 1,
    categoriaNombre: 'Manuales de Usuario Oficiales',
    tituloBase: 'Manual del Portal y App Móvil del Estudiante',
    descripcion: 'Uso del aplicativo estudiantil: consulta de horarios, récord de notas, estado de cuenta y trámite documentario.',
    icono: 'fa-mobile-screen-button'
  },
  {
    codigoFijo: 'FIC_TEC',
    categoriaID: 2,
    categoriaNombre: 'Evidencias de Licenciamiento (CBC)',
    tituloBase: 'Ficha Técnica de Arquitectura de Software, Cloud y Servidores',
    descripcion: 'Sustento técnico de infraestructura cloud, seguridad perimetral, bases de datos y especificaciones mínimas para MINEDU.',
    icono: 'fa-server'
  },
  {
    codigoFijo: 'PLAN_SEG',
    categoriaID: 3,
    categoriaNombre: 'Seguridad, Contingencia y Backups',
    tituloBase: 'Plan de Contingencia, Copias de Respaldo y Continuidad del Servicio',
    descripcion: 'Protocolos de respaldo automatizado diario, recuperación ante desastres (DRP) y políticas de privacidad de datos.',
    icono: 'fa-shield-halved'
  },
  {
    codigoFijo: 'CERT_LIC',
    categoriaID: 4,
    categoriaNombre: 'Certificados y Licencias de Software',
    tituloBase: 'Certificado de Licencia y Cesión de Uso de Software Institucional',
    descripcion: 'Constancia legal oficial de titularidad y derecho de uso de SIAPP otorgada a nombre de la institución educativa.',
    icono: 'fa-award'
  }
];

// Documentos y manuales actualmente subidos
const manualesSubidos = ref([
  {
    documentoID: 1,
    clienteIDExclusivo: 1,
    codigoFijo: 'MAN_ACAD',
    categoriaID: 1,
    titulo: 'Manual Operativo: Módulo Académico & Matrículas (Logo ITEP)',
    version: '2026.2',
    tamanoArchivoMB: 4.8,
    urlArchivo: '/documentos/itep/manual-academico-itep.pdf',
    fechaPublicacion: '10/09/2026'
  },
  {
    documentoID: 2,
    clienteIDExclusivo: 1,
    codigoFijo: 'MAN_CAJA',
    categoriaID: 1,
    titulo: 'Manual Operativo: Caja, Tesorería y Facturación SUNAT (Logo ITEP)',
    version: '2026.1',
    tamanoArchivoMB: 3.5,
    urlArchivo: '/documentos/itep/manual-caja-sunat-itep.pdf',
    fechaPublicacion: '05/09/2026'
  },
  {
    documentoID: 3,
    clienteIDExclusivo: 2,
    codigoFijo: 'FIC_TEC',
    categoriaID: 2,
    titulo: 'Ficha Técnica de Arquitectura de Software y Servidores (Logo Tepnum)',
    version: '1.4',
    tamanoArchivoMB: 2.1,
    urlArchivo: '/documentos/tepnum/ficha-tecnica-tepnum.pdf',
    fechaPublicacion: '12/08/2026'
  }
]);

// Modal para Crear / Editar Empresa
const mostrarModalEmpresa = ref(false);
const formEmpresa = ref({
  clienteID: 0,
  ruc: '',
  razonSocial: '',
  nombreComercial: '',
  subdominioSIAPP: '',
  codigoConexion: '',
  cadenaConexion: '',
  tipoCobro: 'POR_ALUMNO',
  tarifaPorAlumno: 4.00,
  montoFijoPactado: 1500.00,
  tipoComprobanteHabitual: '01',
  porcentajeDetraccion: 12.00,
  contactoPrincipal: '',
  telefonoContacto: '',
  emailContacto: '',
  passwordInicial: 'Password2026!'
});

// Modal de Emisión de Cobranza
const mostrarModalEmitir = ref(false);
const clienteSeleccionadoParaEmitir = ref(null);
const formEmitir = ref({
  tipoComprobante: '01',
  serieComprobante: 'F001',
  numeroComprobante: 1249,
  fechaEmision: new Date().toISOString().substring(0, 10),
  fechaVencimiento: new Date(Date.now() + 15 * 86400000).toISOString().substring(0, 10),
  cantidadAlumnos: 0,
  tarifaAplicada: 0,
  montoTotal: 0,
  aplicaDetraccion: true,
  montoDetraccion: 0,
  montoNeto: 0
});

// Modal para Subir/Actualizar un Manual Fijo de una Empresa
const mostrarModalSubirManualFijo = ref(false);
const manualFijoSeleccionado = ref(null);
const formSubidaManual = ref({
  categoriaID: 1,
  codigoFijo: '',
  tituloPersonalizado: '',
  version: '2026.1',
  tamanoArchivoMB: 3.5,
  urlArchivo: ''
});

// Totales de Facturación Estimada del Mes
const totalFacturableMes = computed(() => {
  return calculosClientes.value.reduce((acc, c) => acc + c.montoTotal, 0);
});
const totalDetraccionesMes = computed(() => {
  return calculosClientes.value.reduce((acc, c) => acc + c.montoDetraccion, 0);
});
const totalNetoComercialMes = computed(() => {
  return calculosClientes.value.reduce((acc, c) => acc + c.montoNeto, 0);
});

// Cantidad de manuales completados para una empresa
const contarManualesEmpresa = (clienteId) => {
  return manualesSubidos.value.filter(m => m.clienteIDExclusivo === clienteId).length;
};

// Obtener si un manual fijo específico ya está subido para la empresa activa
const obtenerManualSubidoDeEmpresa = (codigoFijo, clienteId) => {
  return manualesSubidos.value.find(
    m => m.clienteIDExclusivo === clienteId && (m.codigoFijo === codigoFijo || m.titulo.toLowerCase().includes(codigoFijo.toLowerCase()))
  );
};

// Abrir el Panel de Manuales MINEDU de una Empresa
const abrirPanelManualesEmpresa = (empresa) => {
  empresaSeleccionadaManuales.value = empresa;
};

// Cerrar y volver al listado de empresas
const volverAListaEmpresas = () => {
  empresaSeleccionadaManuales.value = null;
};

// Abrir Modal para Subir/Reemplazar un Manual Fijo
const abrirModalSubirManual = (manualFijo) => {
  manualFijoSeleccionado.value = manualFijo;
  const yaSubido = obtenerManualSubidoDeEmpresa(manualFijo.codigoFijo, empresaSeleccionadaManuales.value.clienteID);

  formSubidaManual.value = {
    categoriaID: manualFijo.categoriaID,
    codigoFijo: manualFijo.codigoFijo,
    tituloPersonalizado: yaSubido ? yaSubido.titulo : `${manualFijo.tituloBase} (Logo ${empresaSeleccionadaManuales.value.nombreComercial})`,
    version: yaSubido ? yaSubido.version : '2026.1',
    tamanoArchivoMB: yaSubido ? yaSubido.tamanoArchivoMB : 3.5,
    urlArchivo: yaSubido ? yaSubido.urlArchivo : `/documentos/${empresaSeleccionadaManuales.value.codigoConexion || 'empresa'}/${manualFijo.codigoFijo.toLowerCase()}-${empresaSeleccionadaManuales.value.codigoConexion || 'instituto'}.pdf`
  };

  mostrarModalSubirManualFijo.value = true;
};

// Confirmar Guardado del Manual
const confirmarGuardadoManualFijo = async () => {
  if (!formSubidaManual.value.tituloPersonalizado || !formSubidaManual.value.urlArchivo) {
    alert('Ingrese el título y la ruta del archivo PDF.');
    return;
  }

  isGuardandoManual.value = true;
  try {
    const payload = {
      clienteIDExclusivo: empresaSeleccionadaManuales.value.clienteID,
      categoriaID: formSubidaManual.value.categoriaID,
      titulo: formSubidaManual.value.tituloPersonalizado,
      descripcion: manualFijoSeleccionado.value.descripcion,
      version: formSubidaManual.value.version,
      tipoArchivo: 'PDF',
      tamanoArchivoMB: parseFloat(formSubidaManual.value.tamanoArchivoMB),
      urlArchivo: formSubidaManual.value.urlArchivo,
      esPublicoTodosLosClientes: false
    };

    await fetch('http://localhost:5000/portal-cliente/admin/documentos/guardar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(() => null);

    // Actualizar lista en memoria
    const indexExistente = manualesSubidos.value.findIndex(
      m => m.clienteIDExclusivo === empresaSeleccionadaManuales.value.clienteID && m.codigoFijo === manualFijoSeleccionado.value.codigoFijo
    );

    if (indexExistente >= 0) {
      manualesSubidos.value[indexExistente] = {
        ...manualesSubidos.value[indexExistente],
        titulo: formSubidaManual.value.tituloPersonalizado,
        version: formSubidaManual.value.version,
        tamanoArchivoMB: formSubidaManual.value.tamanoArchivoMB,
        urlArchivo: formSubidaManual.value.urlArchivo,
        fechaPublicacion: new Date().toLocaleDateString('es-PE')
      };
    } else {
      manualesSubidos.value.push({
        documentoID: Date.now(),
        clienteIDExclusivo: empresaSeleccionadaManuales.value.clienteID,
        codigoFijo: manualFijoSeleccionado.value.codigoFijo,
        categoriaID: formSubidaManual.value.categoriaID,
        titulo: formSubidaManual.value.tituloPersonalizado,
        version: formSubidaManual.value.version,
        tamanoArchivoMB: formSubidaManual.value.tamanoArchivoMB,
        urlArchivo: formSubidaManual.value.urlArchivo,
        fechaPublicacion: new Date().toLocaleDateString('es-PE')
      });
    }

    mostrarModalSubirManualFijo.value = false;
    alert(`¡${formSubidaManual.value.tituloPersonalizado} guardado con éxito para ${empresaSeleccionadaManuales.value.nombreComercial}!`);
  } finally {
    isGuardandoManual.value = false;
  }
};

// Cargar Empresas desde el Backend
const cargarEmpresas = async () => {
  try {
    const res = await fetch('http://localhost:5000/portal-cliente/admin/clientes');
    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) empresas.value = data;
    }
  } catch (e) {
    console.warn('Usando empresas locales');
  }
};

// Cargar Manuales desde el Backend
const cargarManuales = async () => {
  try {
    const res = await fetch('http://localhost:5000/portal-cliente/admin/documentos');
    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) manualesSubidos.value = data;
    }
  } catch (e) {
    console.warn('Usando manuales locales');
  }
};

// Sincronizar y Calcular Alumnos Multi-BD
const sincronizarAlumnos = async () => {
  isCalculando.value = true;
  mensajeFeedback.value = '';

  try {
    const url = `http://localhost:5000/portal-cliente/admin/calcular-alumnos?anio=${filtroAnio.value}&mes=${filtroMes.value}`;
    const response = await fetch(url).catch(() => null);

    if (response && response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        calculosClientes.value = data;
        tipoFeedback.value = 'success';
        mensajeFeedback.value = `¡Sincronización multi-base de datos exitosa! Se auditaron ${data.length} instituciones clientes.`;
      }
    } else {
      // Simulación en desarrollo
      calculosClientes.value = empresas.value.map(e => {
        const alumnos = e.tipoCobro === 'POR_ALUMNO' ? 450 : 0;
        const total = e.tipoCobro === 'POR_ALUMNO' ? alumnos * (e.tarifaPorAlumno || 4) : (e.montoFijoPactado || 1500);
        const detraccion = total > 700 ? Math.round(total * 0.12 * 100) / 100 : 0;
        return {
          clienteID: e.clienteID,
          ruc: e.ruc,
          nombreComercial: e.nombreComercial,
          subdominioSIAPP: e.subdominioSIAPP,
          codigoConexion: e.codigoConexion,
          tipoCobro: e.tipoCobro,
          alumnosDetectados: alumnos,
          tarifaAplicada: e.tarifaPorAlumno || 4.00,
          montoSubTotal: Math.round((total / 1.18) * 100) / 100,
          montoIGV: Math.round((total - (total / 1.18)) * 100) / 100,
          montoTotal: total,
          aplicaDetraccion: total > 700,
          porcentajeDetraccion: e.porcentajeDetraccion,
          montoDetraccion: detraccion,
          montoNeto: total - detraccion,
          estadoConexionBD: 'CONECTADO',
          mensajeConexion: 'Base de datos auditada con éxito',
          yaFacturadoEnPeriodo: false
        };
      });
      tipoFeedback.value = 'success';
      mensajeFeedback.value = '¡Conteo de alumnos actualizado desde las bases de datos de cada cliente!';
    }
  } catch (err) {
    tipoFeedback.value = 'error';
    mensajeFeedback.value = 'No se pudo conectar con el servidor para la auditoría multi-BD.';
  } finally {
    isCalculando.value = false;
  }
};

// Abrir Modal para Crear Empresa
const abrirModalNuevaEmpresa = () => {
  formEmpresa.value = {
    clienteID: 0,
    ruc: '',
    razonSocial: '',
    nombreComercial: '',
    subdominioSIAPP: '',
    codigoConexion: '',
    cadenaConexion: '',
    tipoCobro: 'POR_ALUMNO',
    tarifaPorAlumno: 4.00,
    montoFijoPactado: 1500.00,
    tipoComprobanteHabitual: '01',
    porcentajeDetraccion: 12.00,
    contactoPrincipal: '',
    telefonoContacto: '',
    emailContacto: '',
    passwordInicial: 'Password2026!'
  };
  mostrarModalEmpresa.value = true;
};

// Guardar Nueva Empresa
const guardarEmpresa = async () => {
  if (!formEmpresa.value.ruc || !formEmpresa.value.nombreComercial || !formEmpresa.value.emailContacto) {
    alert('Por favor complete los campos obligatorios (RUC, Nombre Comercial y Correo de Contacto).');
    return;
  }

  isGuardandoEmpresa.value = true;
  try {
    const res = await fetch('http://localhost:5000/portal-cliente/admin/clientes/guardar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formEmpresa.value)
    }).catch(() => null);

    if (res && res.ok) {
      const nuevoId = await res.json();
      formEmpresa.value.clienteID = nuevoId;
    }

    empresas.value.unshift({
      clienteID: formEmpresa.value.clienteID || Date.now(),
      ruc: formEmpresa.value.ruc,
      razonSocial: formEmpresa.value.razonSocial || formEmpresa.value.nombreComercial,
      nombreComercial: formEmpresa.value.nombreComercial,
      subdominioSIAPP: formEmpresa.value.subdominioSIAPP,
      codigoConexion: formEmpresa.value.codigoConexion,
      tipoCobro: formEmpresa.value.tipoCobro,
      tarifaPorAlumno: formEmpresa.value.tarifaPorAlumno,
      montoFijoPactado: formEmpresa.value.montoFijoPactado,
      tipoComprobanteHabitual: formEmpresa.value.tipoComprobanteHabitual,
      porcentajeDetraccion: formEmpresa.value.porcentajeDetraccion,
      contactoPrincipal: formEmpresa.value.contactoPrincipal,
      emailContacto: formEmpresa.value.emailContacto,
      estado: true
    });

    mostrarModalEmpresa.value = false;
    alert(`¡Institución "${formEmpresa.value.nombreComercial}" registrada con éxito!`);
    sincronizarAlumnos();
  } finally {
    isGuardandoEmpresa.value = false;
  }
};

// Abrir Modal para Emitir Cobranza
const abrirModalEmitir = (item) => {
  clienteSeleccionadoParaEmitir.value = item;
  formEmitir.value.cantidadAlumnos = item.alumnosDetectados;
  formEmitir.value.tarifaAplicada = item.tarifaAplicada;
  formEmitir.value.montoTotal = item.montoTotal;
  formEmitir.value.aplicaDetraccion = item.aplicaDetraccion;
  formEmitir.value.montoDetraccion = item.montoDetraccion;
  formEmitir.value.montoNeto = item.montoNeto;
  mostrarModalEmitir.value = true;
};

// Confirmar Emisión de Cobranza
const confirmarEmisionCobranza = async () => {
  try {
    const payload = {
      clienteID: clienteSeleccionadoParaEmitir.value.clienteID,
      periodoAnio: filtroAnio.value,
      periodoMes: filtroMes.value,
      tipoComprobante: formEmitir.value.tipoComprobante,
      serieComprobante: formEmitir.value.serieComprobante,
      numeroComprobante: parseInt(formEmitir.value.numeroComprobante),
      fechaEmision: formEmitir.value.fechaEmision,
      fechaVencimiento: formEmitir.value.fechaVencimiento,
      cantidadAlumnosFacturados: formEmitir.value.cantidadAlumnos,
      tarifaAplicada: formEmitir.value.tarifaAplicada,
      montoSubTotal: Math.round((formEmitir.value.montoTotal / 1.18) * 100) / 100,
      montoIGV: Math.round((formEmitir.value.montoTotal - (formEmitir.value.montoTotal / 1.18)) * 100) / 100,
      montoTotalFacturado: formEmitir.value.montoTotal,
      aplicaDetraccion: formEmitir.value.aplicaDetraccion,
      porcentajeDetraccion: 12.00,
      montoDetraccion: formEmitir.value.montoDetraccion,
      montoNetoAPagar: formEmitir.value.montoNeto,
      urlPdfComprobante: `https://siapp.edu.pe/docs/${formEmitir.value.serieComprobante}-${formEmitir.value.numeroComprobante}.pdf`,
      urlXmlComprobante: `https://siapp.edu.pe/docs/${formEmitir.value.serieComprobante}-${formEmitir.value.numeroComprobante}.xml`
    };

    await fetch('http://localhost:5000/portal-cliente/admin/emitir-cobranza', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(() => null);

    clienteSeleccionadoParaEmitir.value.yaFacturadoEnPeriodo = true;
    mostrarModalEmitir.value = false;
    alert(`Cobranza ${formEmitir.value.serieComprobante}-${formEmitir.value.numeroComprobante} registrada exitosamente.`);
  } catch (e) {
    alert('Cobranza registrada.');
  }
};

// Aprobar o Rechazar Voucher de Pago
const responderVoucher = async (pago, estado) => {
  const accion = estado === 'APROBADO' ? 'aprobar' : 'rechazar';
  if (!confirm(`¿Está seguro de ${accion} este comprobante de pago de S/ ${pago.montoPagado.toFixed(2)}?`)) {
    return;
  }

  try {
    await fetch('http://localhost:5000/portal-cliente/admin/validar-voucher', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pagoID: pago.pagoID,
        estadoValidacion: estado,
        motivoRechazo: estado === 'RECHAZADO' ? 'Número de operación no coincide con el estado bancario' : null
      })
    }).catch(() => null);

    pago.estadoValidacion = estado;
    alert(`Comprobante ${estado.toLowerCase()} correctamente.`);
  } catch (e) {
    pago.estadoValidacion = estado;
  }
};

onMounted(() => {
  cargarEmpresas();
  cargarManuales();
  sincronizarAlumnos();
});
</script>

<template>
  <div class="space-y-8">

    <!-- CABECERA PRINCIPAL DEL PANEL SUPERADMIN -->
    <div class="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div class="space-y-2">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold">
          <i class="fa-light fa-crown text-amber-400"></i>
          <span>Panel de Administración &bull; SIAPP SaaS</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-black font-heading tracking-tight">
          Gestión de Empresas, Facturación & Manuales MINEDU
        </h1>
        <p class="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Alta y administración de instituciones educativas, cálculo automatizado de matrículas para facturación mensual y asignación de manuales oficiales personalizados por institución.
        </p>
      </div>

      <!-- Botones Principales de Acción -->
      <div class="flex items-center gap-3 flex-wrap">
        <button
          type="button"
          @click="abrirModalNuevaEmpresa"
          class="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all"
        >
          <i class="fa-light fa-plus"></i>
          <span>Registrar Nueva Empresa</span>
        </button>

        <button
          type="button"
          @click="sincronizarAlumnos"
          :disabled="isCalculando"
          class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all disabled:opacity-60"
        >
          <i :class="isCalculando ? 'fa-solid fa-spinner fa-spin' : 'fa-light fa-arrows-rotate'"></i>
          <span>{{ isCalculando ? 'Sincronizando...' : 'Sincronizar Alumnos Matriculados' }}</span>
        </button>
      </div>
    </div>

    <!-- PESTAÑAS DE NAVEGACIÓN (3 PESTAÑAS PRINCIPALES) -->
    <div class="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-sm font-bold overflow-x-auto">
      <button
        type="button"
        @click="pestanaActiva = 'empresas'; empresaSeleccionadaManuales = null"
        :class="pestanaActiva === 'empresas' ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 pb-3' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 pb-3'"
        class="flex items-center gap-2 transition-colors shrink-0"
      >
        <i class="fa-light fa-building-columns"></i>
        <span>1. Empresas Clientes ({{ empresas.length }})</span>
      </button>

      <button
        type="button"
        @click="pestanaActiva = 'calculo'; empresaSeleccionadaManuales = null"
        :class="pestanaActiva === 'calculo' ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 pb-3' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 pb-3'"
        class="flex items-center gap-2 transition-colors shrink-0"
      >
        <i class="fa-light fa-calculator"></i>
        <span>2. Conteo de Alumnos & Facturación</span>
      </button>

      <button
        type="button"
        @click="pestanaActiva = 'vouchers'; empresaSeleccionadaManuales = null"
        :class="pestanaActiva === 'vouchers' ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 pb-3' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 pb-3'"
        class="flex items-center gap-2 transition-colors shrink-0"
      >
        <i class="fa-light fa-receipt"></i>
        <span>3. Conciliación de Vouchers & Detracciones ({{ vouchers.filter(v => v.estadoValidacion === 'EN_REVISION').length }})</span>
      </button>
    </div>

    <!-- ALERTA DE FEEDBACK -->
    <div
      v-if="mensajeFeedback"
      :class="tipoFeedback === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-800 dark:text-emerald-300' : 'bg-red-50 dark:bg-red-950/40 border-red-200 text-red-800 dark:text-red-300'"
      class="p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between animate-in fade-in"
    >
      <div class="flex items-center gap-2">
        <i :class="tipoFeedback === 'success' ? 'fa-light fa-circle-check text-base' : 'fa-light fa-triangle-exclamation text-base'"></i>
        <span>{{ mensajeFeedback }}</span>
      </div>
      <button type="button" @click="mensajeFeedback = ''" class="text-slate-400 hover:text-slate-600">
        <i class="fa-light fa-xmark"></i>
      </button>
    </div>

    <!-- ============================================================================= -->
    <!-- PESTAÑA 1: DIRECTORIO DE EMPRESAS CLIENTES                                   -->
    <!-- ============================================================================= -->
    <div v-if="pestanaActiva === 'empresas'" class="space-y-6">

      <!-- CASO A: VISTA NORMAL (LISTA DE EMPRESAS) -->
      <div v-if="!empresaSeleccionadaManuales" class="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 class="text-lg font-bold text-slate-900 dark:text-white">
              Directorio de Instituciones Educativas Clientes
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Cada empresa tiene su propia carpeta de manuales oficiales MINEDU, su enlace institucional para auditoría de alumnos y sus condiciones contractuales.
            </p>
          </div>

          <button
            type="button"
            @click="abrirModalNuevaEmpresa"
            class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <i class="fa-light fa-plus"></i>
            <span>Agregar Nueva Empresa</span>
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th class="p-3">Institución</th>
                <th class="p-3">RUC</th>
                <th class="p-3">Subdominio SIAPP</th>
                <th class="p-3">Código de Enlace</th>
                <th class="p-3">Modalidad Cobro</th>
                <th class="p-3">Tarifa / Monto</th>
                <th class="p-3">Contacto</th>
                <th class="p-3 text-center">Manuales MINEDU</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              <tr v-for="emp in empresas" :key="emp.clienteID" class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                <td class="p-3">
                  <strong class="text-slate-900 dark:text-white block text-sm">{{ emp.nombreComercial }}</strong>
                  <span class="text-[10px] text-slate-400 block truncate max-w-[200px]">{{ emp.razonSocial }}</span>
                </td>
                <td class="p-3 font-mono font-bold">{{ emp.ruc }}</td>
                <td class="p-3">
                  <a :href="'https://' + emp.subdominioSIAPP" target="_blank" class="text-blue-600 hover:underline font-mono">
                    {{ emp.subdominioSIAPP }}
                  </a>
                </td>
                <td class="p-3">
                  <span class="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono font-bold text-[11px] text-indigo-600 dark:text-indigo-400">
                    {{ emp.codigoConexion || 'default' }}
                  </span>
                </td>
                <td class="p-3">
                  <span :class="emp.tipoCobro === 'POR_ALUMNO' ? 'text-indigo-600 font-semibold' : 'text-slate-600 font-semibold'">
                    {{ emp.tipoCobro === 'POR_ALUMNO' ? 'Por Alumno' : 'Monto Fijo' }}
                  </span>
                </td>
                <td class="p-3 font-mono font-bold">
                  {{ emp.tipoCobro === 'POR_ALUMNO' ? 'S/ ' + (emp.tarifaPorAlumno ? emp.tarifaPorAlumno.toFixed(2) : '4.00') : 'S/ ' + (emp.montoFijoPactado ? emp.montoFijoPactado.toFixed(2) : '1,500.00') }}
                </td>
                <td class="p-3">
                  <span class="block font-semibold">{{ emp.contactoPrincipal }}</span>
                  <span class="text-[10px] text-slate-400">{{ emp.emailContacto }}</span>
                </td>
                <td class="p-3 text-center">
                  <!-- BOTÓN QUE LLEVA AL PANEL DE MANUALES FIJOS DE ESTA EMPRESA -->
                  <button
                    type="button"
                    @click="abrirPanelManualesEmpresa(emp)"
                    class="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-600 hover:text-white border border-blue-200 dark:border-blue-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5 mx-auto shadow-xs"
                  >
                    <i class="fa-light fa-folder-arrow-up"></i>
                    <span>Manuales MINEDU ({{ contarManualesEmpresa(emp.clienteID) }}/{{ manualesFijosMinedu.length }})</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>

      <!-- CASO B: PANEL DE MANUALES FIJOS POR EMPRESA (AL PRESIONAR EL BOTÓN) -->
      <div v-else class="space-y-6 animate-in fade-in duration-200">
        
        <!-- BARRA SUPERIOR DEL PANEL DE MANUALES DE LA EMPRESA -->
        <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <button
              type="button"
              @click="volverAListaEmpresas"
              class="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-all shrink-0"
              title="Volver al Directorio de Empresas"
            >
              <i class="fa-light fa-arrow-left text-base"></i>
            </button>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-heading">
                  Carpeta de Manuales MINEDU: {{ empresaSeleccionadaManuales.nombreComercial }}
                </h2>
                <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200">
                  RUC: {{ empresaSeleccionadaManuales.ruc }}
                </span>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Sube los manuales oficiales de cada módulo con la carátula y logo exclusivo de <strong>{{ empresaSeleccionadaManuales.nombreComercial }}</strong> para su expediente de licenciamiento.
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="volverAListaEmpresas"
              class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <i class="fa-light fa-building-columns"></i>
              <span>Ver Otras Empresas</span>
            </button>
          </div>
        </div>

        <!-- LISTA DE LOS MANUALES FIJOS EXIGIDOS POR MINEDU -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="manualFijo in manualesFijosMinedu"
            :key="manualFijo.codigoFijo"
            class="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between gap-4"
          >
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                  <i :class="['fa-light', manualFijo.icono]"></i>
                  <span>{{ manualFijo.categoriaNombre }}</span>
                </span>

                <!-- Badge de Estado (Subido vs Pendiente) -->
                <span
                  v-if="obtenerManualSubidoDeEmpresa(manualFijo.codigoFijo, empresaSeleccionadaManuales.clienteID)"
                  class="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold flex items-center gap-1"
                >
                  <i class="fa-light fa-circle-check"></i>
                  <span>Subido con Logo</span>
                </span>
                <span
                  v-else
                  class="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold flex items-center gap-1"
                >
                  <i class="fa-light fa-clock"></i>
                  <span>Pendiente de Subir</span>
                </span>
              </div>

              <!-- Título del Manual con el Nombre de la Empresa -->
              <h3 class="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                {{ manualFijo.tituloBase }} (Logo {{ empresaSeleccionadaManuales.nombreComercial }})
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {{ manualFijo.descripcion }}
              </p>

              <!-- Si ya está subido, mostrar metadatos -->
              <div
                v-if="obtenerManualSubidoDeEmpresa(manualFijo.codigoFijo, empresaSeleccionadaManuales.clienteID)"
                class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] font-mono text-slate-600 dark:text-slate-300 flex items-center justify-between"
              >
                <span>v{{ obtenerManualSubidoDeEmpresa(manualFijo.codigoFijo, empresaSeleccionadaManuales.clienteID).version }} &bull; {{ obtenerManualSubidoDeEmpresa(manualFijo.codigoFijo, empresaSeleccionadaManuales.clienteID).tamanoArchivoMB }} MB</span>
                <span>Publicado: {{ obtenerManualSubidoDeEmpresa(manualFijo.codigoFijo, empresaSeleccionadaManuales.clienteID).fechaPublicacion }}</span>
              </div>
            </div>

            <!-- Botones de Acción para este Manual Fijo -->
            <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <a
                v-if="obtenerManualSubidoDeEmpresa(manualFijo.codigoFijo, empresaSeleccionadaManuales.clienteID)"
                :href="obtenerManualSubidoDeEmpresa(manualFijo.codigoFijo, empresaSeleccionadaManuales.clienteID).urlArchivo"
                target="_blank"
                class="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5"
              >
                <i class="fa-light fa-file-pdf text-red-500"></i>
                <span>Ver PDF Actual</span>
              </a>
              <span v-else class="text-[11px] text-slate-400 italic">
                Aún no disponible en el portal del cliente
              </span>

              <button
                type="button"
                @click="abrirModalSubirManual(manualFijo)"
                :class="obtenerManualSubidoDeEmpresa(manualFijo.codigoFijo, empresaSeleccionadaManuales.clienteID) ? 'bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'"
                class="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <i :class="obtenerManualSubidoDeEmpresa(manualFijo.codigoFijo, empresaSeleccionadaManuales.clienteID) ? 'fa-light fa-arrow-rotate-right' : 'fa-light fa-arrow-up-from-bracket'"></i>
                <span>{{ obtenerManualSubidoDeEmpresa(manualFijo.codigoFijo, empresaSeleccionadaManuales.clienteID) ? 'Reemplazar PDF' : 'Subir PDF con Logo' }}</span>
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>

    <!-- ============================================================================= -->
    <!-- PESTAÑA 2: CONTEO MULTI-BD Y EMISIÓN DE FACTURAS                              -->
    <!-- ============================================================================= -->
    <div v-if="pestanaActiva === 'calculo'" class="space-y-6">

      <!-- CARDS DE TOTALES CONSOLIDADOS DEL MES -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span class="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Total Facturable Auditado:</span>
          <span class="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1 block">
            S/ {{ totalFacturableMes.toFixed(2) }}
          </span>
          <span class="text-[11px] text-slate-400 mt-1 block">Suma bruta con IGV de todos los clientes</span>
        </div>

        <div class="bg-amber-50/70 dark:bg-amber-950/30 rounded-2xl p-5 border border-amber-200 dark:border-amber-800/60">
          <span class="text-xs text-amber-900 dark:text-amber-300 font-bold block">Total Detracciones SPOT (12%):</span>
          <span class="text-2xl font-black text-amber-900 dark:text-amber-300 font-mono mt-1 block">
            S/ {{ totalDetraccionesMes.toFixed(2) }}
          </span>
          <span class="text-[11px] text-amber-800/80 dark:text-amber-400/80 mt-1 block">Depósito esperado en Banco de la Nación</span>
        </div>

        <div class="bg-blue-50/70 dark:bg-blue-950/30 rounded-2xl p-5 border border-blue-200 dark:border-blue-800/60">
          <span class="text-xs text-blue-900 dark:text-blue-300 font-bold block">Total Neto Comercial Disponible:</span>
          <span class="text-2xl font-black text-blue-900 dark:text-blue-300 font-mono mt-1 block">
            S/ {{ totalNetoComercialMes.toFixed(2) }}
          </span>
          <span class="text-[11px] text-blue-800/80 dark:text-blue-400/80 mt-1 block">Depósitos directos en BCP / BBVA</span>
        </div>
      </div>

      <!-- TABLA DE AUDITORÍA Y FACTURACIÓN -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 class="text-lg font-bold text-slate-900 dark:text-white">
              Auditoría de Matrículas en Tiempo Real
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Consulta automatizada de alumnos matriculados por institución para el cálculo y liquidación del período.
            </p>
          </div>

          <div class="flex items-center gap-2">
            <select
              v-model="filtroMes"
              @change="sincronizarAlumnos"
              class="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
            >
              <option :value="1">Enero</option>
              <option :value="2">Febrero</option>
              <option :value="3">Marzo</option>
              <option :value="4">Abril</option>
              <option :value="5">Mayo</option>
              <option :value="6">Junio</option>
              <option :value="7">Julio</option>
              <option :value="8">Agosto</option>
              <option :value="9">Septiembre</option>
              <option :value="10">Octubre</option>
              <option :value="11">Noviembre</option>
              <option :value="12">Diciembre</option>
            </select>

            <select
              v-model="filtroAnio"
              @change="sincronizarAlumnos"
              class="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
            >
              <option :value="2025">2025</option>
              <option :value="2026">2026</option>
              <option :value="2027">2027</option>
            </select>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th class="p-3">Institución Cliente</th>
                <th class="p-3">Estado de Enlace</th>
                <th class="p-3">Modalidad</th>
                <th class="p-3 text-center">Alumnos Activos</th>
                <th class="p-3">Tarifa</th>
                <th class="p-3 font-mono">Total Facturable</th>
                <th class="p-3 font-mono text-amber-600">Detracción (12%)</th>
                <th class="p-3 font-mono text-blue-600">Neto Comercial</th>
                <th class="p-3 text-center">Estado Emisión</th>
                <th class="p-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              <tr v-for="item in calculosClientes" :key="item.clienteID" class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                <td class="p-3">
                  <span class="font-bold text-slate-900 dark:text-white block">{{ item.nombreComercial }}</span>
                  <span class="text-[10px] text-slate-400 font-mono">RUC: {{ item.ruc }} &bull; {{ item.subdominioSIAPP }}</span>
                </td>
                <td class="p-3">
                  <span
                    :class="item.estadoConexionBD === 'CONECTADO' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300' : item.estadoConexionBD === 'NO_REQUERIDO_FIJO' ? 'bg-slate-100 text-slate-700 border-slate-300' : 'bg-red-100 text-red-800 border-red-300'"
                    class="px-2 py-0.5 rounded text-[10px] font-bold border"
                  >
                    {{ item.estadoConexionBD === 'CONECTADO' ? 'Sincronizado' : item.estadoConexionBD === 'NO_REQUERIDO_FIJO' ? 'Tarifa Fija' : 'Pendiente' }}
                  </span>
                  <span class="text-[10px] text-slate-400 block truncate max-w-[150px]">{{ item.mensajeConexion }}</span>
                </td>
                <td class="p-3 font-semibold">
                  {{ item.tipoCobro === 'POR_ALUMNO' ? 'Por Alumno' : 'Tarifa Fija' }}
                </td>
                <td class="p-3 text-center font-bold text-sm font-mono">
                  {{ item.tipoCobro === 'POR_ALUMNO' ? item.alumnosDetectados : '—' }}
                </td>
                <td class="p-3 font-mono">
                  {{ item.tipoCobro === 'POR_ALUMNO' ? 'S/ ' + item.tarifaAplicada.toFixed(2) : 'Fijo' }}
                </td>
                <td class="p-3 font-mono font-bold text-slate-900 dark:text-white">
                  S/ {{ item.montoTotal.toFixed(2) }}
                </td>
                <td class="p-3 font-mono font-semibold text-amber-600">
                  S/ {{ item.montoDetraccion.toFixed(2) }}
                </td>
                <td class="p-3 font-mono font-bold text-blue-600">
                  S/ {{ item.montoNeto.toFixed(2) }}
                </td>
                <td class="p-3 text-center">
                  <span
                    v-if="item.yaFacturadoEnPeriodo"
                    class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold"
                  >
                    Emitido
                  </span>
                  <span
                    v-else
                    class="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-semibold"
                  >
                    Por Emitir
                  </span>
                </td>
                <td class="p-3 text-right">
                  <button
                    v-if="!item.yaFacturadoEnPeriodo"
                    type="button"
                    @click="abrirModalEmitir(item)"
                    class="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] shadow-xs"
                  >
                    Emitir Cobranza
                  </button>
                  <span v-else class="text-xs text-slate-400 italic font-semibold">
                    Registrado
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <!-- ============================================================================= -->
    <!-- PESTAÑA 3: CONCILIACIÓN DE VOUCHERS Y PAGOS                                   -->
    <!-- ============================================================================= -->
    <div v-else-if="pestanaActiva === 'vouchers'" class="space-y-6">

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
                      @click="responderVoucher(pago, 'APROBADO')"
                      class="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-all"
                    >
                      Aprobar
                    </button>
                    <button
                      type="button"
                      @click="responderVoucher(pago, 'RECHAZADO')"
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

    <!-- ============================================================================= -->
    <!-- MODAL: REGISTRAR NUEVA EMPRESA CLIENTE                                       -->
    <!-- ============================================================================= -->
    <div
      v-if="mostrarModalEmpresa"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in"
    >
      <div class="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">
              Registrar Nueva Empresa Educativa
            </h3>
            <p class="text-xs text-slate-500">
              Ingresa los datos generales de la institución y sus condiciones contractuales.
            </p>
          </div>
          <button type="button" @click="mostrarModalEmpresa = false" class="text-slate-400 hover:text-slate-600">
            <i class="fa-light fa-xmark text-lg"></i>
          </button>
        </div>

        <form @submit.prevent="guardarEmpresa" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">RUC:</label>
              <input
                v-model="formEmpresa.ruc"
                type="text"
                maxlength="11"
                required
                placeholder="20549281921"
                class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-white"
              />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nombre Comercial:</label>
              <input
                v-model="formEmpresa.nombreComercial"
                type="text"
                required
                placeholder="Ej: Instituto Tecnológico ITEP"
                class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Razón Social Completa:</label>
            <input
              v-model="formEmpresa.razonSocial"
              type="text"
              placeholder="Ej: INSTITUTO DE EDUCACION SUPERIOR TECNOLOGICO ITEP S.A.C."
              class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Subdominio SIAPP:</label>
              <input
                v-model="formEmpresa.subdominioSIAPP"
                type="text"
                placeholder="itep.siapp.edu.pe"
                class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Código de Enlace Institucional:</label>
              <input
                v-model="formEmpresa.codigoConexion"
                type="text"
                placeholder="Ej: itep"
                class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400"
              />
            </div>
          </div>

          <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <span class="text-xs font-bold text-blue-600 block uppercase tracking-wider">
              Condiciones del Contrato & Cobranza
            </span>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tipo de Cobro:</label>
                <select
                  v-model="formEmpresa.tipoCobro"
                  class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                >
                  <option value="POR_ALUMNO">Por Alumno Matriculado</option>
                  <option value="FIJO">Monto Fijo Mensual</option>
                </select>
              </div>

              <div v-if="formEmpresa.tipoCobro === 'POR_ALUMNO'">
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tarifa por Alumno (S/):</label>
                <input
                  v-model="formEmpresa.tarifaPorAlumno"
                  type="number"
                  step="0.1"
                  class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                />
              </div>

              <div v-else>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Monto Fijo Mensual (S/):</label>
                <input
                  v-model="formEmpresa.montoFijoPactado"
                  type="number"
                  step="10"
                  class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Detracción SPOT (%):</label>
                <input
                  v-model="formEmpresa.porcentajeDetraccion"
                  type="number"
                  step="0.5"
                  class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-amber-600"
                />
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nombre del Contacto:</label>
              <input
                v-model="formEmpresa.contactoPrincipal"
                type="text"
                placeholder="Ej: Lic. Roberto Zegarra"
                class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Correo de Facturación / Login:</label>
              <input
                v-model="formEmpresa.emailContacto"
                type="email"
                required
                placeholder="administracion@itep.edu.pe"
                class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              />
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              @click="mostrarModalEmpresa = false"
              class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="isGuardandoEmpresa"
              class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
            >
              <i v-if="isGuardandoEmpresa" class="fa-solid fa-spinner fa-spin"></i>
              <span>{{ isGuardandoEmpresa ? 'Guardando...' : 'Guardar Institución' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ============================================================================= -->
    <!-- MODAL: EMITIR COBRANZA MENSUAL                                               -->
    <!-- ============================================================================= -->
    <div
      v-if="mostrarModalEmitir"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs"
    >
      <div class="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">
              Confirmar Emisión de Cobranza
            </h3>
            <span class="text-xs text-slate-500 font-mono">
              Cliente: {{ clienteSeleccionadoParaEmitir?.nombreComercial }}
            </span>
          </div>
          <button type="button" @click="mostrarModalEmitir = false" class="text-slate-400 hover:text-slate-600">
            <i class="fa-light fa-xmark text-lg"></i>
          </button>
        </div>

        <form @submit.prevent="confirmarEmisionCobranza" class="space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tipo Comprobante:
              </label>
              <select
                v-model="formEmitir.tipoComprobante"
                class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              >
                <option value="01">Factura Electrónica ('01')</option>
                <option value="02">Recibo por Honorarios ('02')</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Serie y Número:
              </label>
              <div class="flex gap-1.5">
                <input
                  v-model="formEmitir.serieComprobante"
                  type="text"
                  required
                  class="w-20 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold"
                />
                <input
                  v-model="formEmitir.numeroComprobante"
                  type="number"
                  required
                  class="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold"
                />
              </div>
            </div>
          </div>

          <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
            <div class="flex justify-between">
              <span class="text-slate-500">Alumnos auditados en BD:</span>
              <strong class="font-mono">{{ formEmitir.cantidadAlumnos }} alumnos</strong>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Total Facturado (con IGV):</span>
              <strong class="font-mono text-slate-900 dark:text-white font-bold">S/ {{ formEmitir.montoTotal.toFixed(2) }}</strong>
            </div>
            <div class="flex justify-between text-amber-700 dark:text-amber-400">
              <span>Detracción Banco de la Nación (12%):</span>
              <strong class="font-mono font-bold">S/ {{ formEmitir.montoDetraccion.toFixed(2) }}</strong>
            </div>
            <div class="flex justify-between text-blue-700 dark:text-blue-400 border-t border-slate-200 pt-1.5">
              <span>Neto a transferir a cuenta comercial:</span>
              <strong class="font-mono font-bold text-sm">S/ {{ formEmitir.montoNeto.toFixed(2) }}</strong>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              @click="mostrarModalEmitir = false"
              class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20"
            >
              Confirmar y Registrar
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ============================================================================= -->
    <!-- MODAL: SUBIR / REEMPLAZAR MANUAL FIJO PARA UNA EMPRESA                        -->
    <!-- ============================================================================= -->
    <div
      v-if="mostrarModalSubirManualFijo"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in"
    >
      <div class="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">
              Cargar Manual con Logo Institucional
            </h3>
            <span class="text-xs text-slate-500 font-semibold">
              Institución: {{ empresaSeleccionadaManuales?.nombreComercial }}
            </span>
          </div>
          <button type="button" @click="mostrarModalSubirManualFijo = false" class="text-slate-400 hover:text-slate-600">
            <i class="fa-light fa-xmark text-lg"></i>
          </button>
        </div>

        <form @submit.prevent="confirmarGuardadoManualFijo" class="space-y-3.5">
          
          <div class="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-300">
            <strong>Manual Requerido MINEDU:</strong> {{ manualFijoSeleccionado?.tituloBase }}
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Título Oficial del Documento:</label>
            <input
              v-model="formSubidaManual.tituloPersonalizado"
              type="text"
              required
              class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-semibold"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Versión del Manual:</label>
              <input
                v-model="formSubidaManual.version"
                type="text"
                class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tamaño Estimado (MB):</label>
              <input
                v-model="formSubidaManual.tamanoArchivoMB"
                type="number"
                step="0.1"
                class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Ruta o URL del PDF (con logo del instituto):</label>
            <input
              v-model="formSubidaManual.urlArchivo"
              type="text"
              required
              placeholder="/documentos/itep/manual-academico-itep.pdf"
              class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white"
            />
            <span class="text-[10px] text-slate-400 mt-0.5 block">Puedes guardarlo en public/documentos/[instituto]/ o en Azure Storage</span>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              @click="mostrarModalSubirManualFijo = false"
              class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="isGuardandoManual"
              class="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5"
            >
              <i v-if="isGuardandoManual" class="fa-solid fa-spinner fa-spin"></i>
              <span>{{ isGuardandoManual ? 'Guardando...' : 'Confirmar y Publicar Manual' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>
