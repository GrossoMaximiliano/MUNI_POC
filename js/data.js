window.DEMO = (function () {
  var D = U.isoOffset;
  function estadoInicial() {
    return {
      version: 1,
      sesion: { iniciada: false },
      usuario: { nombre: 'Maximiliano', apellido: 'Rodríguez', alias: 'Maxi', email: 'maxi.vecino@ejemplo.com', telefono: '3482 555-1234', domicilio: 'Bartolomé Mitre 245', barrio: 'Centro', notificaciones: { vencimientos: true, reclamos: true, tramites: true, turnos: true, comunicados: true } },
      vehiculos: [
        { id: 'veh-1', dominio: 'AB 529 JR', tipo: 'Automóvil', marca: 'Toyota', modelo: 'Corolla', anio: 2016 },
        { id: 'veh-2', dominio: 'CQ 887 KS', tipo: 'Motocicleta', marca: 'Honda', modelo: 'Wave 110', anio: 2019 }
      ],
      inmuebles: [
        { id: 'inm-1', partida: '123-45.890', tipo: 'Casa', direccion: 'Bartolomé Mitre 245', barrio: 'Centro' },
        { id: 'inm-2', partida: '123-52.104', tipo: 'Terreno', direccion: 'Los Aromos 78', barrio: 'Los Aromos' }
      ],
      obligaciones: [
        { id: 'ob-1', categoria: 'tgi', concepto: 'Tasa General de Inmuebles', ref: 'inm-1', identificador: 'Partida 123-45.890', periodo: '2026 · 2ª cuota', vencimiento: D(5, 23, 59), importe: 24500, intereses: 0, estado: 'pendiente', boleta: 'BT-2026-084512' },
        { id: 'ob-2', categoria: 'tgi', concepto: 'Tasa General de Inmuebles', ref: 'inm-2', identificador: 'Partida 123-52.104', periodo: '2026 · 1ª cuota', vencimiento: D(-28, 23, 59), importe: 23800, intereses: 1047, estado: 'vencida', boleta: 'BT-2026-081033' },
        { id: 'ob-3', categoria: 'patente', concepto: 'Patente municipal', ref: 'veh-1', identificador: 'Dominio AB 529 JR', periodo: '2026 · Anual', vencimiento: D(18, 23, 59), importe: 9350, intereses: 0, estado: 'pendiente', boleta: 'BT-2026-090417' },
        { id: 'ob-4', categoria: 'comercial', concepto: 'Tasa de inspección sanitaria', ref: null, identificador: 'Cuenta comercial 5521 · Kiosco Mitre', periodo: '2026 · 3er trimestre', vencimiento: D(12, 23, 59), importe: 8200, intereses: 0, estado: 'pendiente', boleta: 'BT-2026-077261' },
        { id: 'ob-5', categoria: 'multa', concepto: 'Infracción de tránsito · Acta 2026-00187', ref: 'veh-1', identificador: 'Dominio AB 529 JR', periodo: 'Acta 2026-00187', vencimiento: D(20, 23, 59), importe: 18500, intereses: 0, estado: 'pendiente', boleta: 'BT-2026-091204', multaId: 'mul-1' },
        { id: 'ob-6', categoria: 'plan', concepto: 'Plan de regularización de deuda', ref: 'inm-1', identificador: 'Plan PLAN-2025-000918', periodo: 'Cuota 4 de 12', vencimiento: D(8, 23, 59), importe: 6125, intereses: 0, estado: 'pendiente', boleta: 'BT-2026-069855' },
        { id: 'ob-7', categoria: 'otras', concepto: 'Derecho de publicidad y propaganda', ref: null, identificador: 'Cartel · calle San Martín 1120', periodo: '2026 · Anual', vencimiento: D(25, 23, 59), importe: 12400, intereses: 0, estado: 'proceso', boleta: 'BT-2026-088330' },
        { id: 'ob-8', categoria: 'tgi', concepto: 'Tasa General de Inmuebles', ref: 'inm-1', identificador: 'Partida 123-45.890', periodo: '2025 · 4ª cuota', vencimiento: D(-120, 23, 59), importe: 21300, intereses: 0, estado: 'pagada', boleta: 'BT-2025-091220' }
      ],
      multas: [
        { id: 'mul-1', acta: '2026-00187', fecha: D(-9, 11, 20), motivo: 'Exceso de velocidad en zona escolar', ubicacion: 'Av. San Martín 1120', importe: 18500, estado: 'pendiente', vehiculoId: 'veh-1', obligacionId: 'ob-5', descargos: [] },
        { id: 'mul-2', acta: '2026-00221', fecha: D(-4, 16, 45), motivo: 'Estacionamiento en lugar prohibido', ubicacion: 'Belgrano y 9 de Julio', importe: 6900, estado: 'pendiente', vehiculoId: 'veh-2', obligacionId: null, descargos: [] },
        { id: 'mul-3', acta: '2026-00152', fecha: D(-21, 9, 10), motivo: 'Circulación de motocicleta sin casco', ubicacion: 'Ruta Prov. 1 y Los Aromos', importe: 12300, estado: 'en_descargo', vehiculoId: 'veh-2', obligacionId: null, descargos: [ { id: 'der-1', numero: 'DER-2026-00018', fecha: D(-14, 10, 30), texto: 'El casco se encontraba dentro del baúl de la moto al momento del control (demo).', estado: 'En revisión', historial: [ { estado: 'Presentado', fecha: D(-14, 10, 30), comentario: 'Descargo recibido por Mesa de Entradas (demo).' }, { estado: 'En revisión', fecha: D(-10, 9, 5), comentario: 'El área de Tránsito está evaluando la presentación (demo).' } ] } ] }
      ],
      reclamos: [
        { id: 'rec-1', numero: 'REC-2026-000214', categoria: 'alumbrado', titulo: 'Luminaria apagada en esquina', descripcion: 'La luminaria de la esquina lleva más de una semana sin funcionar. La cuadra queda completamente a oscuras de noche.', barrio: 'Barrio Norte', direccion: 'Sarmiento 340', ubicacionMapa: null, foto: null, fecha: D(-6, 19, 40), estado: 'Derivado al área correspondiente', timeline: [ { estado: 'Recibido', fecha: D(-6, 19, 41), comentario: 'Reclamo ingresado al sistema de atención ciudadana (demo).' }, { estado: 'En revisión', fecha: D(-5, 9, 15), comentario: 'Se verificó la información y se asignó un inspector (demo).' }, { estado: 'Derivado al área correspondiente', fecha: D(-3, 11, 2), comentario: 'El área de Alumbrado Público programó la inspección técnica (demo).' } ] },
        { id: 'rec-2', numero: 'REC-2026-000198', categoria: 'baches', titulo: 'Bache profundo en calle', descripcion: 'Bache de aproximadamente un metro frente al número 500, ya causó daños a dos vehículos.', barrio: 'Centro', direccion: 'Bartolomé Mitre 500', ubicacionMapa: null, foto: null, fecha: D(-12, 8, 25), estado: 'En resolución', timeline: [ { estado: 'Recibido', fecha: D(-12, 8, 26), comentario: 'Reclamo ingresado (demo).' }, { estado: 'En revisión', fecha: D(-11, 10, 10), comentario: 'Inspector confirmó el bache en el lugar (demo).' }, { estado: 'Derivado al área correspondiente', fecha: D(-9, 14, 45), comentario: 'Derivado a Vialidad Urbana (demo).' }, { estado: 'En resolución', fecha: D(-6, 9, 0), comentario: 'Tarea programada dentro del plan de bacheo semanal (demo).' } ] },
        { id: 'rec-3', numero: 'REC-2026-000173', categoria: 'residuos', titulo: 'Contenedores desbordados', descripcion: 'Los contenedores de la plaza llevan días sin vaciarse y se acumulan bolsas alrededor.', barrio: 'Barrio Belgrano', direccion: 'Urquiza 125', ubicacionMapa: null, foto: null, fecha: D(-20, 7, 50), estado: 'Resuelto', timeline: [ { estado: 'Recibido', fecha: D(-20, 7, 51), comentario: 'Reclamo ingresado (demo).' }, { estado: 'En revisión', fecha: D(-19, 9, 30), comentario: 'Se coordinó una inspección (demo).' }, { estado: 'Derivado al área correspondiente', fecha: D(-18, 11, 15), comentario: 'Derivado a Higiene Urbana (demo).' }, { estado: 'En resolución', fecha: D(-16, 8, 20), comentario: 'Recolección extraordinaria programada (demo).' }, { estado: 'Resuelto', fecha: D(-15, 16, 40), comentario: 'Se realizó la recolección y limpieza. Gracias por avisar (demo).' } ] },
        { id: 'rec-4', numero: 'REC-2026-000236', categoria: 'desagues', titulo: 'Desagüe tapado con agua estancada', descripcion: 'El desagüe de la esquina está tapado y se junta agua, con riesgo de mosquitos.', barrio: 'Barrio San Martín', direccion: 'Los Cedros 45', ubicacionMapa: null, foto: null, fecha: D(-2, 18, 10), estado: 'Requiere información', timeline: [ { estado: 'Recibido', fecha: D(-2, 18, 11), comentario: 'Reclamo ingresado (demo).' }, { estado: 'En revisión', fecha: D(-2, 19, 5), comentario: 'Reclamo en evaluación inicial (demo).' }, { estado: 'Requiere información', fecha: D(-1, 10, 5), comentario: 'Necesitamos una referencia más precisa del desagüe (una foto o punto cercano) para agilizar la inspección (demo).' } ] },
        { id: 'rec-5', numero: 'REC-2026-000155', categoria: 'senalizacion', titulo: 'Señal PARE caída', descripcion: 'La señal de PARE de la esquina está caída desde la tormenta del fin de semana.', barrio: 'Los Aromos', direccion: 'Los Aromos y Los Cedros', ubicacionMapa: null, foto: null, fecha: D(-25, 17, 30), estado: 'No corresponde', timeline: [ { estado: 'Recibido', fecha: D(-25, 17, 31), comentario: 'Reclamo ingresado (demo).' }, { estado: 'En revisión', fecha: D(-24, 9, 0), comentario: 'Evaluación inicial del caso (demo).' }, { estado: 'No corresponde', fecha: D(-22, 9, 40), comentario: 'La señal pertenece a jurisdicción provincial. Se sugiere contactar a Vialidad Provincial (dato de demostración).' } ] }
      ],
      tramites: [
        { id: 'tra-1', numero: 'TRA-2026-000102', defId: 'libre-deuda', nombre: 'Certificado de libre deuda de tasas', fecha: D(-4, 10, 20), estado: 'En revisión', datos: { partida: '123-45.890', destino: 'Presentar en banco (demo)' }, historial: [ { estado: 'Recibido', fecha: D(-4, 10, 21), comentario: 'Solicitud ingresada. Expediente interno de demostración EXP-2026-004512.' }, { estado: 'En revisión', fecha: D(-2, 9, 30), comentario: 'La Oficina de Rentas está verificando la cuenta (demo).' } ] }
      ],
      turnos: [
        { id: 'tur-1', numero: 'TUR-2026-000031', tipo: 'Consultas de tasas y pagos', dependencia: 'Oficina de Rentas (demo)', direccion: 'Av. San Martín 000 (demo)', fecha: D(3, 9, 30), estado: 'Confirmado' }
      ],
      pagos: [
        { id: 'pag-1', comprobante: 'PAGO-2026-001132', fecha: D(-12, 14, 22), obligacionId: 'ob-8', concepto: 'Tasa General de Inmuebles · 2025 · 4ª cuota', identificador: 'Partida 123-45.890', importe: 21300, medio: 'Tarjeta de crédito o débito', estado: 'aprobado' },
        { id: 'pag-2', comprobante: 'PAGO-2026-001098', fecha: D(-45, 11, 5), obligacionId: null, concepto: 'Tasa de inspección sanitaria · 2026 · 2º trimestre', identificador: 'Cuenta comercial 5521 · Kiosco Mitre', importe: 7900, medio: 'Transferencia', estado: 'aprobado' }
      ],
      actividad: [
        { id: 'act-1', fecha: D(-6, 19, 41), tipo: 'reclamo', titulo: 'Reclamo REC-2026-000214 · Luminaria apagada', estado: 'Derivado al área correspondiente', ref: 'reclamos/detalle/rec-1' },
        { id: 'act-2', fecha: D(-4, 10, 20), tipo: 'tramite', titulo: 'Solicitud TRA-2026-000102 · Certificado de libre deuda', estado: 'En revisión', ref: 'mis-tramites/tra-1' },
        { id: 'act-3', fecha: D(-9, 11, 20), tipo: 'multa', titulo: 'Infracción · Acta 2026-00187', estado: 'Pendiente de pago', ref: 'vehiculos/multa/mul-1' },
        { id: 'act-4', fecha: D(-12, 14, 22), tipo: 'pago', titulo: 'Pago PAGO-2026-001132', estado: 'Aprobado (demo)', ref: 'pagos/comprobante/pag-1' }
      ],
      notificaciones: [
        { id: 'not-1', tipo: 'vencimiento', titulo: 'Vencimiento próximo', mensaje: 'Tasa General de Inmuebles (2026 · 2ª cuota) vence en 5 días. Importe $ 24.500,00.', fecha: D(-1, 9, 0), leida: false, ref: 'pagos/detalle/ob-1' },
        { id: 'not-2', tipo: 'vencimiento', titulo: 'Obligación vencida', mensaje: 'TGI 2026 · 1ª cuota (Partida 123-52.104) registra deuda vencida con intereses de ejemplo.', fecha: D(-3, 8, 30), leida: false, ref: 'pagos/detalle/ob-2' },
        { id: 'not-3', tipo: 'reclamo', titulo: 'Tu reclamo avanzó', mensaje: 'REC-2026-000214 (Luminaria apagada) fue derivado al área de Alumbrado Público (demo).', fecha: D(-3, 11, 5), leida: true, ref: 'reclamos/detalle/rec-1' },
        { id: 'not-4', tipo: 'tramite', titulo: 'Actualización de trámite', mensaje: 'TRA-2026-000102 (Certificado de libre deuda) pasó a estado En revisión (demo).', fecha: D(-2, 9, 35), leida: false, ref: 'mis-tramites/tra-1' },
        { id: 'not-5', tipo: 'turno', titulo: 'Recordatorio de turno', mensaje: 'Tenés un turno en Oficina de Rentas (demo) el ' + U.fecha(D(3)) + ' a las 09:30 h.', fecha: D(-1, 12, 0), leida: false, ref: 'turnos' },
        { id: 'not-6', tipo: 'comunicado', titulo: 'Comunicado municipal (demo)', mensaje: 'Campaña de vacunación antirrábica — contenido de demostración, no es un comunicado real.', fecha: D(-8, 12, 0), leida: true, ref: 'ayuda' }
      ]
    };
  }
  var catalogos = {
    categoriasObligacion: {
      tgi: { nombre: 'Tasa General de Inmuebles', icono: 'building' },
      patente: { nombre: 'Patente municipal', icono: 'car' },
      comercial: { nombre: 'Derechos y tasas comerciales', icono: 'store' },
      otras: { nombre: 'Otras tasas municipales', icono: 'landmark' },
      multa: { nombre: 'Multas e infracciones', icono: 'alert-triangle' },
      plan: { nombre: 'Planes de pago y cuotas', icono: 'calendar-check' }
    },
    estadosObligacion: {
      pendiente: { texto: 'Pendiente', clase: 'b-aviso', icono: 'clock' },
      vencida: { texto: 'Vencida', clase: 'b-peligro', icono: 'alert-triangle' },
      pagada: { texto: 'Pagada', clase: 'b-exito', icono: 'check-circle' },
      proceso: { texto: 'En proceso', clase: 'b-info', icono: 'refresh' }
    },
    mediosPago: [
      { id: 'tarjeta', nombre: 'Tarjeta de crédito o débito', detalle: 'Opción visual ilustrativa. No se solicitan datos de tarjeta ni claves.', icono: 'card' },
      { id: 'transferencia', nombre: 'Transferencia o débito automático', detalle: 'Opción visual ilustrativa, sin movimiento real de dinero.', icono: 'banknote' },
      { id: 'efectivo', nombre: 'Efectivo en oficina o red de pagos', detalle: 'Generaría una boleta para pagar presencialmente (demo).', icono: 'store' }
    ],
    reclamoCategorias: [
      { id: 'alumbrado', nombre: 'Alumbrado público', icono: 'lightbulb' },
      { id: 'baches', nombre: 'Baches y calles', icono: 'cone' },
      { id: 'residuos', nombre: 'Recolección de residuos', icono: 'trash' },
      { id: 'microbasurales', nombre: 'Microbasurales', icono: 'package' },
      { id: 'arbolado', nombre: 'Poda y arbolado', icono: 'pine' },
      { id: 'plazas', nombre: 'Plazas y espacios verdes', icono: 'leaf' },
      { id: 'desagues', nombre: 'Desagües e infraestructura', icono: 'droplets' },
      { id: 'senalizacion', nombre: 'Señalización vial', icono: 'signpost' },
      { id: 'otros', nombre: 'Otros problemas municipales', icono: 'help-circle' }
    ],
    barrios: ['Centro', 'Barrio Norte', 'Barrio Belgrano', 'Barrio San Martín', 'Los Aromos', 'Zona rural'],
    reclamoEstados: ['Recibido', 'En revisión', 'Derivado al área correspondiente', 'En resolución', 'Resuelto'],
    reclamoEstadosInfo: { 'Requiere información': 'El área necesita datos adicionales del vecino (demo).' , 'No corresponde': 'El tema tratado no es competencia municipal (demo).' },
    comentariosReclamo: {
      'En revisión': 'El reclamo fue ingresado y está siendo evaluado por Atención Ciudadana (demo).',
      'Derivado al área correspondiente': 'El reclamo fue derivado al área técnica responsable para su tratamiento (demo).',
      'En resolución': 'Se registraron tareas en curso para resolver el problema informado (demo).',
      'Resuelto': 'Se informó la intervención realizada. Gracias por tu colaboración (demo).'
    },
    tramiteCategorias: { certificados: 'Documentación y certificados', inmuebles: 'Inmuebles y tasas', vehiculos: 'Vehículos e infracciones', comercio: 'Comercio y habilitaciones', turnosCat: 'Turnos y atención ciudadana', generales: 'Solicitudes generales' },
    tramiteDefs: [
      { id: 'libre-deuda', cat: 'certificados', nombre: 'Certificado de libre deuda de tasas', descripcion: 'Certifica que una partida o cuenta no registra deuda municipal al día de la consulta (demo).', modalidad: 'presencial', tiempo: '3 a 5 días hábiles (estimación de demostración)', requisitos: ['Ser titular o apoderado de la cuenta (demo)', 'No registrar deuda vencida (demo)'], docs: ['DNI (demostración, no se solicita documento real)', 'Última boleta disponible (demo)'], campos: [ { key: 'partida', label: 'Partida o número de cuenta', requerido: true }, { key: 'destino', label: 'Destino del certificado', requerido: false } ] },
      { id: 'constancia-tgi', cat: 'certificados', nombre: 'Constancia de valuación fiscal (demo)', descripcion: 'Constancia orientativa de valuación y superficie declarada de un inmueble (demo).', modalidad: 'online', tiempo: 'Inmediata (demostración)', requisitos: ['Conocer la partida inmobiliaria (demo)'], docs: ['No requiere documentación adjunta (demo)'], campos: [ { key: 'partida', label: 'Partida inmobiliaria', requerido: true } ] },
      { id: 'certificado-residencia', cat: 'certificados', nombre: 'Certificado de residencia (demo)', descripcion: 'Certificación de domicilio dentro del ejido municipal (demo).', modalidad: 'presencial', tiempo: '2 a 3 días hábiles (estimación de demostración)', requisitos: ['Domicilio real dentro del municipio (demo)'], docs: ['DNI (demostración)', 'Factura de servicio (demo)'], campos: [ { key: 'domicilio', label: 'Domicilio a certificar', requerido: true }, { key: 'motivo', label: 'Motivo del certificado', requerido: false } ] },
      { id: 'habilitacion-comercial', cat: 'comercio', nombre: 'Habilitación comercial (demo)', descripcion: 'Trámite para habilitar un local o actividad comercial (demo).', modalidad: 'mixta', tiempo: '20 a 30 días hábiles (estimación de demostración)', requisitos: ['Título de propiedad o contrato de locación (demo)', 'Croquis del local (demo)'], docs: ['DNI (demostración)', 'Comprobante de CUIT o monotributo (demo)'], campos: [ { key: 'comercio', label: 'Nombre del comercio', requerido: true }, { key: 'rubro', label: 'Rubro principal', requerido: true }, { key: 'direccion', label: 'Domicilio del local', requerido: true }, { key: 'superficie', label: 'Superficie aproximada en m2', requerido: false } ] },
      { id: 'uso-suelo', cat: 'comercio', nombre: 'Factibilidad de uso de suelo (demo)', descripcion: 'Informe orientativo sobre el uso de suelo permitido para una dirección (demo).', modalidad: 'presencial', tiempo: '10 a 15 días hábiles (estimación de demostración)', requisitos: ['Dirección dentro del ejido urbano (demo)'], docs: ['Croquis de ubicación (demo)'], campos: [ { key: 'direccion', label: 'Dirección a evaluar', requerido: true }, { key: 'actividad', label: 'Actividad prevista', requerido: true } ] },
      { id: 'consulta-expediente', cat: 'generales', nombre: 'Consulta de expediente (demo)', descripcion: 'Consultá el estado de un expediente municipal con su número (demo).', modalidad: 'online', tiempo: 'Inmediata (demostración)', requisitos: ['Número de expediente o de solicitud (demo)'], docs: ['No requiere documentación adjunta (demo)'], campos: [ { key: 'expediente', label: 'Número de expediente o solicitud', requerido: true } ] },
      { id: 'poda-arbolado', cat: 'generales', nombre: 'Solicitud de poda de arbolado (demo)', descripcion: 'Pedí la poda o el relevamiento de un árbol en vereda o espacio verde (demo).', modalidad: 'online', tiempo: '5 a 10 días hábiles para inspección (estimación de demostración)', requisitos: ['Indicar ubicación exacta del árbol (demo)'], docs: ['Foto del árbol (opcional, demo)'], campos: [ { key: 'ubicacion', label: 'Ubicación del árbol (calle y altura)', requerido: true }, { key: 'motivo', label: 'Motivo de la poda', requerido: false } ] },
      { id: 'limpieza-terreno', cat: 'generales', nombre: 'Limpieza de terreno y microbasural (demo)', descripcion: 'Solicitá el relevamiento de un terreno con residuos o maleza alta (demo).', modalidad: 'online', tiempo: '7 días hábiles (estimación de demostración)', requisitos: ['Ubicación del terreno (demo)'], docs: ['Foto del terreno (opcional, demo)'], campos: [ { key: 'ubicacion', label: 'Ubicación del terreno', requerido: true }, { key: 'detalle', label: 'Detalle de la situación', requerido: false } ] },
      { id: 'publicidad', cat: 'comercio', nombre: 'Permiso de publicidad y propaganda (demo)', descripcion: 'Autorización para instalar carteles publicitarios en la vía pública (demo).', modalidad: 'mixta', tiempo: '10 días hábiles (estimación de demostración)', requisitos: ['Croquis o foto de la ubicación del cartel (demo)', 'Frente de inspección habilitado (demo)'], docs: ['Croquis del cartel con medidas (demo)'], campos: [ { key: 'ubicacion', label: 'Ubicación del cartel', requerido: true }, { key: 'medidas', label: 'Medidas del cartel (alto x ancho)', requerido: false } ] },
      { id: 'descargo-transito', cat: 'vehiculos', nombre: 'Presentación de descargos de tránsito (demo)', descripcion: 'Descargo voluntario ante una infracción de tránsito (demo).', modalidad: 'presencial', tiempo: '30 días corridos desde el acta (plazo de demostración, no verificado)', requisitos: ['Número de acta de infracción (demo)', 'Expresión escrita del descargo (demo)'], docs: ['DNI (demostración)', 'Documentación del vehículo (demo)'], campos: [ { key: 'acta', label: 'Número de acta', requerido: true }, { key: 'texto', label: 'Expresión del descargo', requerido: true } ] },
      { id: 'plan-pagos', cat: 'inmuebles', nombre: 'Solicitud de plan de pagos (demo)', descripcion: 'Solicitá un plan de regularización de deuda municipal (demo).', modalidad: 'online', tiempo: 'Respuesta en 5 días hábiles (estimación de demostración)', requisitos: ['Cuentas con deuda (demo)'], docs: ['Última boleta (demo)'], campos: [ { key: 'cuenta', label: 'Partida o cuenta con deuda', requerido: true }, { key: 'cuotas', label: 'Cantidad de cuotas deseada', requerido: false } ] }
    ],
    dependencias: [
      { id: 'mesa', nombre: 'Mesa de Entradas — Palacio Municipal (demo)', direccion: 'Av. San Martín 000 (dato de demostración)' },
      { id: 'rentas', nombre: 'Oficina de Rentas (demo)', direccion: 'Av. San Martín 000 (dato de demostración)' },
      { id: 'obras', nombre: 'Dirección de Obras Particulares (demo)', direccion: 'Calle Ejemplo 000 (dato de demostración)' },
      { id: 'transito', nombre: 'Dirección de Tránsito (demo)', direccion: 'Calle Ejemplo 000 (dato de demostración)' },
      { id: 'zoonosis', nombre: 'Centro de Zoonosis y Bienestar Animal (demo)', direccion: 'Calle Ejemplo 000 (dato de demostración)' },
      { id: 'licencias', nombre: 'Centro de Emisión de Licencias de Conducir (demo)', direccion: 'Calle Ejemplo 000 (dato de demostración)' }
    ],
    turnoTipos: ['Atención general', 'Consultas de tasas y pagos', 'Habilitación comercial', 'Obras particulares', 'Tránsito e infracciones', 'Castración de mascotas (demo)', 'Licencia de conducir (demo)', 'Consulta psicológica para licencia (demo)'],
    turnoDependencias: {
      'Castración de mascotas (demo)': ['zoonosis'],
      'Licencia de conducir (demo)': ['licencias'],
      'Consulta psicológica para licencia (demo)': ['licencias']
    },
    turnoExtras: {
      'Castración de mascotas (demo)': [
        { key: 'mascota', label: 'Nombre de la mascota', placeholder: 'Ej: Rocky' },
        { key: 'especie', label: 'Especie', opciones: ['Perro / perra', 'Gato / gata'] }
      ],
      'Licencia de conducir (demo)': [
        { key: 'gestion', label: 'Gestión', opciones: ['Emisión inicial (demo)', 'Renovación (demo)', 'Cambio de clase (demo)'] }
      ],
      'Consulta psicológica para licencia (demo)': [
        { key: 'referencia', label: 'Nº de trámite de licencia (si lo tenés)', placeholder: 'Opcional (demo)' }
      ]
    },
    turnosHorarios: ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30'],
    avisos: [
      { id: 'avi-1', categoria: 'Servicios', titulo: 'Cambio temporal en horarios de recolección (demo)', texto: 'Contenido de demostración: la recolección de residuos podría realizarse con horarios modificados durante la semana.', fecha: D(-2, 9, 0) },
      { id: 'avi-2', categoria: 'Salud', titulo: 'Campaña de vacunación antirrábica (demo)', texto: 'Contenido de demostración: jornada de vacunación gratuita para mascotas en la plaza central.', fecha: D(-5, 10, 0) },
      { id: 'avi-3', categoria: 'Obras', titulo: 'Programa de bacheo urbano (demo)', texto: 'Contenido de demostración: se informan tareas de bacheo por sectores durante el mes.', fecha: D(-9, 11, 0) }
    ],
    faq: [
      { p: '¿Esta aplicación es oficial?', r: 'No. Es un prototipo de demostración para presentar cómo podría funcionar un futuro portal de autogestión de la Municipalidad de Las Toscas. No está conectado a sistemas reales.' },
      { p: '¿Los pagos que hago aquí son reales?', r: 'No. Todos los pagos son simulados, sin movimiento de dinero. Los comprobantes son ficticios y no tienen validez.' },
      { p: '¿Cómo pago una obligación?', r: 'Andá a Pagos, elegí la obligación, tocá Continuar al pago y seguí los pasos. Al final verás un comprobante de demostración que podés imprimir.' },
      { p: '¿Cómo hago un reclamo por un problema del barrio?', r: 'Entrá a Reclamos, tocá Nuevo reclamo, elegí la categoría, describí el problema, podés adjuntar una foto y enviar. Después podés seguir el estado desde la línea de tiempo.' },
      { p: '¿Cómo consulto una multa?', r: 'Desde Inicio, tocá Ver multas o entrá a Vehículos y multas. Cada infracción muestra su acta, motivo, importe y las opciones disponibles (pago simulado o descargo de demostración).' },
      { p: '¿Cómo pido un turno?', r: 'Usá la sección Trámites y turnos. Elegí el tipo, la dependencia, un día y horario de los disponibles y confirmá. La disponibilidad es simulada.' },
      { p: '¿Por qué desaparecen mis cambios?', r: 'Los datos se guardan en tu navegador (localStorage). Si borrás los datos del navegador o reiniciás la demo desde Perfil, todo vuelve al estado inicial.' },
      { p: '¿Qué hago ante una emergencia?', r: 'Esta aplicación no reemplaza los canales de emergencia. Ante urgencias, comunicate con los canales correspondientes (por ejemplo 911, bomberos o defensa civil).' }
    ],
    contacto: {
      domicilio: 'Av. San Martín 000 — dato de demostración, pendiente de confirmación institucional',
      horario: 'Lunes a viernes de 7:00 a 13:00 — horario de demostración',
      telefono: '(000) 000-0000 — pendiente de confirmación institucional',
      email: 'Sin correo oficial confirmado — dato de demostración'
    },
    emergenciaNota: 'Esta aplicación es un prototipo y NO reemplaza los canales de emergencia. Ante urgencias reales, comunicate con 911, bomberos o defensa civil.'
  };
  return { estadoInicial: estadoInicial, catalogos: catalogos };
})();
