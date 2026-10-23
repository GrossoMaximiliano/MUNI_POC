window.DEMO = (function () {
  var D = U.isoOffset;
  function estadoInicial() {
    return {
      version: 3,
      sesion: { iniciada: false, rol: null, cuentaId: null, nombre: '', apellido: '', alias: '', email: '' },
      usuario: { nombre: 'Maximiliano', apellido: 'Rodríguez', alias: 'Maxi', email: 'maxi.vecino@ejemplo.com', telefono: '3482 555-1234', domicilio: 'Calle 12 N°245', barrio: 'Centro', notificaciones: { vencimientos: true, reclamos: true, tramites: true, turnos: true, comunicados: true } },
      cuentas: [
        { id: 'cta-vecino', email: 'maxi.vecino@ejemplo.com', clave: 'demo1234', rol: 'ciudadano', perfil: { nombre: 'Maximiliano', apellido: 'Rodríguez', alias: 'Maxi', email: 'maxi.vecino@ejemplo.com', telefono: '3482 555-1234', domicilio: 'Calle 12 N°245', barrio: 'Centro' } },
        { id: 'cta-admin', email: 'gestion@lascoscas.gob.ar', clave: 'demo1234', rol: 'admin', perfil: { nombre: 'Elena', apellido: 'Giménez', alias: 'Elena', email: 'gestion@lascoscas.gob.ar', area: 'Atención Ciudadana (demo)' } }
      ],
      vehiculos: [
        { id: 'veh-1', dominio: 'AB 529 JR', tipo: 'Automóvil', marca: 'Toyota', modelo: 'Corolla', anio: 2016 },
        { id: 'veh-2', dominio: 'CQ 887 KS', tipo: 'Motocicleta', marca: 'Honda', modelo: 'Wave 110', anio: 2019 }
      ],
      inmuebles: [
        { id: 'inm-1', partida: '123-45.890', tipo: 'Casa', direccion: 'Calle 12 N°245', barrio: 'Centro' },
        { id: 'inm-2', partida: '123-52.104', tipo: 'Terreno', direccion: 'Calle 15 N°78', barrio: 'Itatí' }
      ],
      obligaciones: [
        { id: 'ob-1', categoria: 'tgi', concepto: 'Tasa General de Inmuebles', ref: 'inm-1', identificador: 'Partida 123-45.890', periodo: '2026 · 2ª cuota', vencimiento: D(5, 23, 59), importe: 24500, intereses: 0, estado: 'pendiente', boleta: 'BT-2026-084512' },
        { id: 'ob-2', categoria: 'tgi', concepto: 'Tasa General de Inmuebles', ref: 'inm-2', identificador: 'Partida 123-52.104', periodo: '2026 · 1ª cuota', vencimiento: D(-28, 23, 59), importe: 23800, intereses: 1047, estado: 'vencida', boleta: 'BT-2026-081033' },
        { id: 'ob-3', categoria: 'patente', concepto: 'Patente municipal', ref: 'veh-1', identificador: 'Dominio AB 529 JR', periodo: '2026 · Anual', vencimiento: D(18, 23, 59), importe: 9350, intereses: 0, estado: 'pendiente', boleta: 'BT-2026-090417' },
        { id: 'ob-4', categoria: 'comercial', concepto: 'Tasa de inspección sanitaria', ref: null, identificador: 'Cuenta comercial 5521 · Kiosco Calle 12', periodo: '2026 · 3er trimestre', vencimiento: D(12, 23, 59), importe: 8200, intereses: 0, estado: 'pendiente', boleta: 'BT-2026-077261' },
        { id: 'ob-5', categoria: 'multa', concepto: 'Infracción de tránsito · Acta 2026-00187', ref: 'veh-1', identificador: 'Dominio AB 529 JR', periodo: 'Acta 2026-00187', vencimiento: D(20, 23, 59), importe: 18500, intereses: 0, estado: 'pendiente', boleta: 'BT-2026-091204', multaId: 'mul-1' },
        { id: 'ob-6', categoria: 'plan', concepto: 'Plan de regularización de deuda', ref: 'inm-1', identificador: 'Plan PLAN-2025-000918', periodo: 'Cuota 4 de 12', vencimiento: D(8, 23, 59), importe: 6125, intereses: 0, estado: 'pendiente', boleta: 'BT-2026-069855' },
        { id: 'ob-7', categoria: 'otras', concepto: 'Derecho de publicidad y propaganda', ref: null, identificador: 'Cartel · Calle 12 N°1120', periodo: '2026 · Anual', vencimiento: D(25, 23, 59), importe: 12400, intereses: 0, estado: 'proceso', boleta: 'BT-2026-088330' },
        { id: 'ob-8', categoria: 'tgi', concepto: 'Tasa General de Inmuebles', ref: 'inm-1', identificador: 'Partida 123-45.890', periodo: '2025 · 4ª cuota', vencimiento: D(-120, 23, 59), importe: 21300, intereses: 0, estado: 'pagada', boleta: 'BT-2025-091220' }
      ],
      multas: [
        { id: 'mul-1', acta: '2026-00187', fecha: D(-9, 11, 20), motivo: 'Exceso de velocidad en zona escolar', ubicacion: 'Calle 12 N°1120', importe: 18500, estado: 'pendiente', vehiculoId: 'veh-1', obligacionId: 'ob-5', descargos: [] },
        { id: 'mul-2', acta: '2026-00221', fecha: D(-4, 16, 45), motivo: 'Estacionamiento en lugar prohibido', ubicacion: 'Calle 2 y Calle 13', importe: 6900, estado: 'pendiente', vehiculoId: 'veh-2', obligacionId: null, descargos: [] },
        { id: 'mul-3', acta: '2026-00152', fecha: D(-21, 9, 10), motivo: 'Circulación de motocicleta sin casco', ubicacion: 'Ruta Nacional 11 y Calle 15', importe: 12300, estado: 'en_descargo', vehiculoId: 'veh-2', obligacionId: null, descargos: [ { id: 'der-1', numero: 'DER-2026-00018', fecha: D(-14, 10, 30), texto: 'El casco se encontraba dentro del baúl de la moto al momento del control (demo).', estado: 'En revisión', historial: [ { estado: 'Presentado', fecha: D(-14, 10, 30), comentario: 'Descargo recibido por Mesa de Entradas (demo).' }, { estado: 'En revisión', fecha: D(-10, 9, 5), comentario: 'El área de Tránsito está evaluando la presentación (demo).' } ] } ] }
      ],
      reclamos: [
        { id: 'rec-1', numero: 'REC-2026-000214', categoria: 'alumbrado', titulo: 'Luminaria apagada en esquina', descripcion: 'La luminaria de la esquina lleva más de una semana sin funcionar. La cuadra queda completamente a oscuras de noche.', barrio: 'Fátima', direccion: 'Calle 6 N°340', ubicacionMapa: null, foto: null, fecha: D(-6, 19, 40), estado: 'Derivado al área correspondiente', timeline: [ { estado: 'Recibido', fecha: D(-6, 19, 41), comentario: 'Reclamo ingresado al sistema de atención ciudadana (demo).' }, { estado: 'En revisión', fecha: D(-5, 9, 15), comentario: 'Se verificó la información y se asignó un inspector (demo).' }, { estado: 'Derivado al área correspondiente', fecha: D(-3, 11, 2), comentario: 'El área de Alumbrado Público programó la inspección técnica (demo).' } ] },
        { id: 'rec-2', numero: 'REC-2026-000198', categoria: 'baches', titulo: 'Bache profundo en calle', descripcion: 'Bache de aproximadamente un metro frente al número 500, ya causó daños a dos vehículos.', barrio: 'Centro', direccion: 'Calle 12 N°500', ubicacionMapa: null, foto: null, fecha: D(-12, 8, 25), estado: 'En resolución', timeline: [ { estado: 'Recibido', fecha: D(-12, 8, 26), comentario: 'Reclamo ingresado (demo).' }, { estado: 'En revisión', fecha: D(-11, 10, 10), comentario: 'Inspector confirmó el bache en el lugar (demo).' }, { estado: 'Derivado al área correspondiente', fecha: D(-9, 14, 45), comentario: 'Derivado a Vialidad Urbana (demo).' }, { estado: 'En resolución', fecha: D(-6, 9, 0), comentario: 'Tarea programada dentro del plan de bacheo semanal (demo).' } ] },
        { id: 'rec-3', numero: 'REC-2026-000173', categoria: 'residuos', titulo: 'Contenedores desbordados', descripcion: 'Los contenedores de la plaza llevan días sin vaciarse y se acumulan bolsas alrededor.', barrio: 'Itatí', direccion: 'Calle 13 N°125', ubicacionMapa: null, foto: null, fecha: D(-20, 7, 50), estado: 'Resuelto', timeline: [ { estado: 'Recibido', fecha: D(-20, 7, 51), comentario: 'Reclamo ingresado (demo).' }, { estado: 'En revisión', fecha: D(-19, 9, 30), comentario: 'Se coordinó una inspección (demo).' }, { estado: 'Derivado al área correspondiente', fecha: D(-18, 11, 15), comentario: 'Derivado a Higiene Urbana (demo).' }, { estado: 'En resolución', fecha: D(-16, 8, 20), comentario: 'Recolección extraordinaria programada (demo).' }, { estado: 'Resuelto', fecha: D(-15, 16, 40), comentario: 'Se realizó la recolección y limpieza. Gracias por avisar (demo).' } ] },
        { id: 'rec-4', numero: 'REC-2026-000236', categoria: 'desagues', titulo: 'Desagüe tapado con agua estancada', descripcion: 'El desagüe de la esquina está tapado y se junta agua, con riesgo de mosquitos.', barrio: 'Virgen Niña', direccion: 'Calle 14 N°45', ubicacionMapa: null, foto: null, fecha: D(-2, 18, 10), estado: 'Requiere información', timeline: [ { estado: 'Recibido', fecha: D(-2, 18, 11), comentario: 'Reclamo ingresado (demo).' }, { estado: 'En revisión', fecha: D(-2, 19, 5), comentario: 'Reclamo en evaluación inicial (demo).' }, { estado: 'Requiere información', fecha: D(-1, 10, 5), comentario: 'Necesitamos una referencia más precisa del desagüe (una foto o punto cercano) para agilizar la inspección (demo).' } ] },
        { id: 'rec-5', numero: 'REC-2026-000155', categoria: 'senalizacion', titulo: 'Señal PARE caída', descripcion: 'La señal de PARE de la esquina está caída desde la tormenta del fin de semana.', barrio: 'Itatí', direccion: 'Calle 15 y Calle 14', ubicacionMapa: null, foto: null, fecha: D(-25, 17, 30), estado: 'No corresponde', timeline: [ { estado: 'Recibido', fecha: D(-25, 17, 31), comentario: 'Reclamo ingresado (demo).' }, { estado: 'En revisión', fecha: D(-24, 9, 0), comentario: 'Evaluación inicial del caso (demo).' }, { estado: 'No corresponde', fecha: D(-22, 9, 40), comentario: 'La señal pertenece a jurisdicción provincial. Se sugiere contactar a Vialidad Provincial (dato de demostración).' } ] }
      ],
      tramites: [
        { id: 'tra-1', numero: 'TRA-2026-000102', defId: 'libre-deuda', nombre: 'Certificado de libre deuda de tasas', fecha: D(-4, 10, 20), estado: 'En revisión', datos: { partida: '123-45.890', destino: 'Presentar en banco (demo)' }, historial: [ { estado: 'Recibido', fecha: D(-4, 10, 21), comentario: 'Solicitud ingresada. Expediente interno de demostración EXP-2026-004512.' }, { estado: 'En revisión', fecha: D(-2, 9, 30), comentario: 'La Oficina de Rentas está verificando la cuenta (demo).' } ] }
      ],
      turnos: [
        { id: 'tur-1', numero: 'TUR-2026-000031', tipo: 'Consultas de tasas y pagos', dependencia: 'Oficina de Rentas (demo)', direccion: 'Calle 12 N°901 (demo)', fecha: D(3, 9, 30), estado: 'Confirmado' }
      ],
      reportesAgua: [
        { id: 'agu-1', numero: 'AGU-2026-000017', nivel: 'critico', direccion: 'Calle 14 N°45', barrio: 'Virgen Niña', personas: 4, asistencia: true, telefono: '3482 555-1234', notas: 'El agua entra por la calle y ya cubre 20 cm dentro de la casa.', fecha: D(-1, 22, 30), estado: 'En asistencia', timeline: [ { estado: 'Recibido', fecha: D(-1, 22, 31), comentario: 'Reporte crítico recibido. Prioridad alta (demo).' }, { estado: 'Verificado', fecha: D(-1, 23, 10), comentario: 'Defensa Civil verificó la situación en el domicilio (demo).' }, { estado: 'En asistencia', fecha: D(0, 0, 45), comentario: 'Brigada asignada con bomba de achique. Asistencia en camino (demo).' } ] }
      ],
      pagos: [
        { id: 'pag-1', comprobante: 'PAGO-2026-001132', fecha: D(-12, 14, 22), obligacionId: 'ob-8', concepto: 'Tasa General de Inmuebles · 2025 · 4ª cuota', identificador: 'Partida 123-45.890', importe: 21300, medio: 'Tarjeta de crédito o débito', estado: 'aprobado' },
        { id: 'pag-2', comprobante: 'PAGO-2026-001098', fecha: D(-45, 11, 5), obligacionId: null, concepto: 'Tasa de inspección sanitaria · 2026 · 2º trimestre', identificador: 'Cuenta comercial 5521 · Kiosco Calle 12', importe: 7900, medio: 'Transferencia', estado: 'aprobado' }
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
      ],
      solicitudesServicios: [
        { id: 'ser-1', numero: 'SER-2026-000017', ciudadanoId: 'cta-vecino', ciudadanoNombre: 'Maximiliano Rodríguez', ciudadanoEmail: 'maxi.vecino@ejemplo.com', tipoId: 'atmosferico', tipo: 'Camión atmosférico (desagote de pozos negros)', direccion: 'Calle 12 N°245', fechaPreferida: D(3, 9, 0).slice(0, 10), telefono: '3482 555-1234', observaciones: 'Coordinar por la mañana (demo).', fechaSolicitud: D(-1, 10, 15), estado: 'Pendiente' },
        { id: 'ser-2', numero: 'SER-2026-000018', ciudadanoId: 'cta-vecino', ciudadanoNombre: 'Maximiliano Rodríguez', ciudadanoEmail: 'maxi.vecino@ejemplo.com', tipoId: 'ramas', tipo: 'Junte de ramas / poda', direccion: 'Calle 6 N°340', fechaPreferida: D(6, 9, 0).slice(0, 10), telefono: '3482 555-1234', observaciones: 'Ramas apiladas sobre la vereda (demo).', fechaSolicitud: D(-2, 11, 0), estado: 'Programada' }
      ],
      municipal: {
        ciudadanos: [
          { id: 'ciu-1', nombre: 'Maximiliano', apellido: 'Rodríguez', dni: '31.482.907', email: 'maxi.vecino@ejemplo.com', telefono: '3482 555-1234', domicilio: 'Calle 12 N°245', barrio: 'Centro', fechaAlta: D(-540, 9, 0), estado: 'activo' },
          { id: 'ciu-2', nombre: 'Claudia', apellido: 'Sosa', dni: '24.905.331', email: 'claudia.sosa@ejemplo.com', telefono: '3482 555-2244', domicilio: 'Calle 13 N°1250', barrio: 'Itatí', fechaAlta: D(-420, 10, 30), estado: 'activo' },
          { id: 'ciu-3', nombre: 'Rubén', apellido: 'Ferreira', dni: '20.176.554', email: 'ruben.ferreira@ejemplo.com', telefono: '3482 555-3312', domicilio: 'Calle 2 N°78', barrio: 'Fátima', fechaAlta: D(-380, 11, 15), estado: 'activo' },
          { id: 'ciu-4', nombre: 'Lucía', apellido: 'Benítez', dni: '35.220.187', email: 'lucia.benitez@ejemplo.com', telefono: '3482 555-4455', domicilio: 'Calle 14 N°45', barrio: 'Virgen Niña', fechaAlta: D(-210, 8, 45), estado: 'activo' },
          { id: 'ciu-5', nombre: 'Hugo', apellido: 'Cáceres', dni: '27.640.219', email: 'hugo.caceres@ejemplo.com', telefono: '3482 555-5566', domicilio: 'Calle 12 N°1120', barrio: 'Centro', fechaAlta: D(-160, 9, 20), estado: 'activo' },
          { id: 'ciu-6', nombre: 'Marta', apellido: 'Quiroga', dni: '18.993.746', email: 'marta.quiroga@ejemplo.com', telefono: '3482 555-6677', domicilio: 'Calle 15 N°78', barrio: 'Itatí', fechaAlta: D(-95, 10, 5), estado: 'activo' },
          { id: 'ciu-7', nombre: 'Sergio', apellido: 'Ledesma', dni: '32.114.880', email: 'sergio.ledesma@ejemplo.com', telefono: '3482 555-7788', domicilio: 'Calle 6 N°340', barrio: 'Fátima', fechaAlta: D(-45, 9, 40), estado: 'bloqueado' },
          { id: 'ciu-8', nombre: 'Valeria', apellido: 'Núñez', dni: '36.740.512', email: 'valeria.nunez@ejemplo.com', telefono: '3482 555-8899', domicilio: 'Calle 7 N°510', barrio: 'Centro', fechaAlta: D(-12, 11, 25), estado: 'activo' }
        ],
        multas: [
          { id: 'mm-1', acta: '2026-00241', fecha: D(-2, 15, 40), motivo: 'Exceso de velocidad en avenida', ubicacion: 'Calle 12 y Calle 2', importe: 22400, estado: 'pendiente', ciudadanoId: 'ciu-2', dominio: 'AF 214 PK', descargos: [] },
          { id: 'mm-2', acta: '2026-00238', fecha: D(-3, 9, 55), motivo: 'Estacionamiento en lugar prohibido', ubicacion: 'Calle 12 N°300', importe: 6900, estado: 'pendiente', ciudadanoId: 'ciu-4', dominio: 'AB 903 TR', descargos: [] },
          { id: 'mm-3', acta: '2026-00230', fecha: D(-6, 17, 10), motivo: 'Falta de casco (motocicleta)', ubicacion: 'Ruta Nacional 11 km 4', importe: 12300, estado: 'vencida', ciudadanoId: 'ciu-5', dominio: 'CQ 455 LM', descargos: [] },
          { id: 'mm-4', acta: '2026-00226', fecha: D(-8, 11, 30), motivo: 'Cruce de semáforo en rojo', ubicacion: 'Calle 12 y Calle 6', importe: 27800, estado: 'vencida', ciudadanoId: 'ciu-7', dominio: 'AD 772 GK', descargos: [] },
          { id: 'mm-5', acta: '2026-00219', fecha: D(-10, 14, 5), motivo: 'Estacionamiento sobre vereda', ubicacion: 'Calle 7 N°510', importe: 9800, estado: 'pendiente', ciudadanoId: 'ciu-8', dominio: 'AA 118 QW', descargos: [] },
          { id: 'mm-6', acta: '2026-00210', fecha: D(-13, 10, 15), motivo: 'Circular sin luces reglamentarias', ubicacion: 'Calle 15 y Calle 14', importe: 7600, estado: 'pagada', ciudadanoId: 'ciu-3', dominio: 'AC 512 NB', descargos: [] },
          { id: 'mm-7', acta: '2026-00198', fecha: D(-18, 16, 45), motivo: 'Exceso de velocidad en zona escolar', ubicacion: 'Calle 2 N°900', importe: 18500, estado: 'vencida', ciudadanoId: 'ciu-6', dominio: 'AB 240 RC', descargos: [] },
          { id: 'mm-8', acta: '2026-00190', fecha: D(-22, 8, 20), motivo: 'Estacionamiento en lugar prohibido', ubicacion: 'Calle 6 N°340', importe: 6900, estado: 'pagada', ciudadanoId: 'ciu-1', dominio: 'AB 529 JR', descargos: [] },
          { id: 'mm-9', acta: '2026-00184', fecha: D(-25, 13, 5), motivo: 'Falta de documentación del vehículo', ubicacion: 'Calle 12 N°1120', importe: 5400, estado: 'pagada', ciudadanoId: 'ciu-4', dominio: 'AB 903 TR', descargos: [] },
          { id: 'mm-10', acta: '2026-00176', fecha: D(-29, 10, 50), motivo: 'Circulación de motocicleta sin casco', ubicacion: 'Calle 2 y Calle 13', importe: 12300, estado: 'en_descargo', ciudadanoId: 'ciu-2', dominio: 'CQ 455 LM', descargos: [ { id: 'mmd-1', numero: 'DER-2026-00021', fecha: D(-21, 9, 30), texto: 'El casco se encontraba dentro de la caja de la moto al momento del control (demo).', estado: 'En revisión', historial: [ { estado: 'Presentado', fecha: D(-21, 9, 30), comentario: 'Descargo recibido por Mesa de Entradas (demo).' }, { estado: 'En revisión', fecha: D(-17, 8, 10), comentario: 'El área de Tránsito está evaluando la presentación (demo).' } ] } ] },
          { id: 'mm-11', acta: '2026-00168', fecha: D(-33, 12, 25), motivo: 'Exceso de velocidad', ubicacion: 'Ruta Nacional 11 km 2', importe: 19800, estado: 'pagada', ciudadanoId: 'ciu-8', dominio: 'AA 118 QW', descargos: [] },
          { id: 'mm-12', acta: '2026-00161', fecha: D(-38, 17, 35), motivo: 'Estacionamiento en lugar prohibido', ubicacion: 'Calle 13 N°1250', importe: 6900, estado: 'en_descargo', ciudadanoId: 'ciu-5', dominio: 'AF 214 PK', descargos: [ { id: 'mmd-2', numero: 'DER-2026-00019', fecha: D(-30, 15, 20), texto: 'El vehículo estaba en el lugar por una avería repentina y colocó balizas (demo).', estado: 'Presentado', historial: [ { estado: 'Presentado', fecha: D(-30, 15, 20), comentario: 'Descargo recibido por Mesa de Entradas (demo).' } ] } ] }
        ],
        obligaciones: [
          { id: 'mo-1', categoria: 'tgi', concepto: 'Tasa General de Inmuebles', identificador: 'Partida 123-45.890', periodo: '2026 · 2ª cuota', vencimiento: D(5, 23, 59), importe: 24500, intereses: 0, estado: 'pendiente', ciudadanoId: 'ciu-1' },
          { id: 'mo-2', categoria: 'tgi', concepto: 'Tasa General de Inmuebles', identificador: 'Partida 123-60.204', periodo: '2026 · 2ª cuota', vencimiento: D(3, 23, 59), importe: 21200, intereses: 0, estado: 'pendiente', ciudadanoId: 'ciu-2' },
          { id: 'mo-3', categoria: 'patente', concepto: 'Patente municipal', identificador: 'Dominio AF 214 PK', periodo: '2026 · Anual', vencimiento: D(18, 23, 59), importe: 9350, intereses: 0, estado: 'pendiente', ciudadanoId: 'ciu-2' },
          { id: 'mo-4', categoria: 'comercial', concepto: 'Tasa de inspección sanitaria', identificador: 'Cuenta comercial 7712 · Almacén Doña Clau', periodo: '2026 · 3er trimestre', vencimiento: D(12, 23, 59), importe: 8200, intereses: 0, estado: 'pendiente', ciudadanoId: 'ciu-3' },
          { id: 'mo-5', categoria: 'tgi', concepto: 'Tasa General de Inmuebles', identificador: 'Partida 123-71.045', periodo: '2026 · 1ª cuota', vencimiento: D(-14, 23, 59), importe: 19800, intereses: 830, estado: 'vencida', ciudadanoId: 'ciu-4' },
          { id: 'mo-6', categoria: 'plan', concepto: 'Plan de regularización de deuda', identificador: 'Plan PLAN-2026-001012', periodo: 'Cuota 2 de 6', vencimiento: D(8, 23, 59), importe: 5400, intereses: 0, estado: 'pendiente', ciudadanoId: 'ciu-5' },
          { id: 'mo-7', categoria: 'tgi', concepto: 'Tasa General de Inmuebles', identificador: 'Partida 123-33.918', periodo: '2026 · 1ª cuota', vencimiento: D(-30, 23, 59), importe: 22400, intereses: 990, estado: 'vencida', ciudadanoId: 'ciu-6' },
          { id: 'mo-8', categoria: 'otras', concepto: 'Derecho de publicidad y propaganda', identificador: 'Cartel · Calle 12 N°1120', periodo: '2026 · Anual', vencimiento: D(25, 23, 59), importe: 12400, intereses: 0, estado: 'proceso', ciudadanoId: 'ciu-7' },
          { id: 'mo-9', categoria: 'tgi', concepto: 'Tasa General de Inmuebles', identificador: 'Partida 123-45.890', periodo: '2025 · 4ª cuota', vencimiento: D(-120, 23, 59), importe: 21300, intereses: 0, estado: 'pagada', ciudadanoId: 'ciu-1' },
          { id: 'mo-10', categoria: 'comercial', concepto: 'Tasa de inspección sanitaria', identificador: 'Cuenta comercial 7712 · Almacén Doña Clau', periodo: '2026 · 2º trimestre', vencimiento: D(-75, 23, 59), importe: 7900, intereses: 0, estado: 'pagada', ciudadanoId: 'ciu-3' },
          { id: 'mo-11', categoria: 'patente', concepto: 'Patente municipal', identificador: 'Dominio AC 512 NB', periodo: '2026 · Anual', vencimiento: D(-40, 23, 59), importe: 9350, intereses: 310, estado: 'vencida', ciudadanoId: 'ciu-3' },
          { id: 'mo-12', categoria: 'tgi', concepto: 'Tasa General de Inmuebles', identificador: 'Partida 123-52.774', periodo: '2025 · 3ª cuota', vencimiento: D(-200, 23, 59), importe: 20600, intereses: 0, estado: 'pagada', ciudadanoId: 'ciu-4' },
          { id: 'mo-13', categoria: 'otras', concepto: 'Tasa por servicios de cementerio', identificador: 'Nicho 214 · Sector B', periodo: '2026 · Anual', vencimiento: D(-95, 23, 59), importe: 4600, intereses: 180, estado: 'vencida', ciudadanoId: 'ciu-8' },
          { id: 'mo-14', categoria: 'tgi', concepto: 'Tasa General de Inmuebles', identificador: 'Partida 123-44.110', periodo: '2026 · 2ª cuota', vencimiento: D(20, 23, 59), importe: 23100, intereses: 0, estado: 'pendiente', ciudadanoId: 'ciu-8' }
        ],
        reclamos: [
          { id: 'mr-1', numero: 'REC-2026-000241', categoria: 'alumbrado', titulo: 'Tres luminarias sin funcionar', descripcion: 'Tres luminarias de la cuadra no encienden desde la semana pasada; la vereda queda totalmente a oscuras.', barrio: 'Centro', direccion: 'Calle 12 N°800', fecha: D(-1, 20, 15), estado: 'Recibido', timeline: [ { estado: 'Recibido', fecha: D(-1, 20, 16), comentario: 'Reclamo ingresado al sistema de atención ciudadana (demo).' } ], ciudadanoId: 'ciu-8' },
          { id: 'mr-2', numero: 'REC-2026-000239', categoria: 'baches', titulo: 'Bache en la bajada de la ruta', descripcion: 'Bache que creció con las lluvias; los autos lo esquivan hacia la vereda.', barrio: 'Itatí', direccion: 'Acceso Ruta Nacional 11', fecha: D(-2, 8, 40), estado: 'Recibido', timeline: [ { estado: 'Recibido', fecha: D(-2, 8, 41), comentario: 'Reclamo ingresado al sistema de atención ciudadana (demo).' } ], ciudadanoId: 'ciu-6' },
          { id: 'mr-3', numero: 'REC-2026-000233', categoria: 'residuos', titulo: 'Contenedor volcado y bolsas dispersas', descripcion: 'El contenedor quedó volcado y hay bolsas esparridas por toda la esquina.', barrio: 'Itatí', direccion: 'Calle 13 N°990', fecha: D(-4, 19, 25), estado: 'En revisión', timeline: [ { estado: 'Recibido', fecha: D(-4, 19, 26), comentario: 'Reclamo ingresado al sistema de atención ciudadana (demo).' }, { estado: 'En revisión', fecha: D(-3, 9, 10), comentario: 'El reclamo fue ingresado y está siendo evaluado por Atención Ciudadana (demo).' } ], ciudadanoId: 'ciu-2' },
          { id: 'mr-4', numero: 'REC-2026-000229', categoria: 'desagues', titulo: 'Cordón cuneta obstruido', descripcion: 'El desagüe de la esquina está obstruido y el agua no escurre en días de lluvia.', barrio: 'Fátima', direccion: 'Calle 2 y Calle 9', fecha: D(-6, 10, 5), estado: 'Derivado al área correspondiente', timeline: [ { estado: 'Recibido', fecha: D(-6, 10, 6), comentario: 'Reclamo ingresado al sistema de atención ciudadana (demo).' }, { estado: 'En revisión', fecha: D(-5, 9, 15), comentario: 'El reclamo fue ingresado y está siendo evaluado por Atención Ciudadana (demo).' }, { estado: 'Derivado al área correspondiente', fecha: D(-4, 11, 0), comentario: 'El reclamo fue derivado al área técnica responsable para su tratamiento (demo).' } ], ciudadanoId: 'ciu-3' },
          { id: 'mr-5', numero: 'REC-2026-000222', categoria: 'senalizacion', titulo: 'Falta señalización frente a la escuela', descripcion: 'No hay cartel de senda peatonal ni reductor frente al ingreso escolar.', barrio: 'Centro', direccion: 'Calle 12 N°900', fecha: D(-9, 7, 55), estado: 'En resolución', timeline: [ { estado: 'Recibido', fecha: D(-9, 7, 56), comentario: 'Reclamo ingresado al sistema de atención ciudadana (demo).' }, { estado: 'En revisión', fecha: D(-8, 9, 30), comentario: 'El reclamo fue ingresado y está siendo evaluado por Atención Ciudadana (demo).' }, { estado: 'Derivado al área correspondiente', fecha: D(-7, 10, 40), comentario: 'El reclamo fue derivado al área técnica responsable para su tratamiento (demo).' }, { estado: 'En resolución', fecha: D(-5, 8, 20), comentario: 'Se registraron tareas en curso para resolver el problema informado (demo).' } ], ciudadanoId: 'ciu-5' },
          { id: 'mr-6', numero: 'REC-2026-000215', categoria: 'arbolado', titulo: 'Ramas sobre el cableado eléctrico', descripcion: 'Las ramas del arce de la vereda tocan los cables y chirrían con el viento.', barrio: 'Virgen Niña', direccion: 'Calle 14 N°120', fecha: D(-11, 18, 30), estado: 'En resolución', timeline: [ { estado: 'Recibido', fecha: D(-11, 18, 31), comentario: 'Reclamo ingresado al sistema de atención ciudadana (demo).' }, { estado: 'En revisión', fecha: D(-10, 9, 5), comentario: 'El reclamo fue ingresado y está siendo evaluado por Atención Ciudadana (demo).' }, { estado: 'Derivado al área correspondiente', fecha: D(-9, 14, 15), comentario: 'El reclamo fue derivado al área técnica responsable para su tratamiento (demo).' }, { estado: 'En resolución', fecha: D(-7, 9, 45), comentario: 'Se registraron tareas en curso para resolver el problema informado (demo).' } ], ciudadanoId: 'ciu-4' },
          { id: 'mr-7', numero: 'REC-2026-000209', categoria: 'plazas', titulo: 'Juegos dañados en la plaza', descripcion: 'Dos hamacas del sector infantil están rotas y con bordes filosos.', barrio: 'Fátima', direccion: 'Plaza 23 de Agosto', fecha: D(-15, 16, 10), estado: 'Resuelto', timeline: [ { estado: 'Recibido', fecha: D(-15, 16, 11), comentario: 'Reclamo ingresado al sistema de atención ciudadana (demo).' }, { estado: 'En revisión', fecha: D(-14, 9, 0), comentario: 'El reclamo fue ingresado y está siendo evaluado por Atención Ciudadana (demo).' }, { estado: 'Derivado al área correspondiente', fecha: D(-13, 11, 20), comentario: 'El reclamo fue derivado al área técnica responsable para su tratamiento (demo).' }, { estado: 'En resolución', fecha: D(-11, 10, 5), comentario: 'Se registraron tareas en curso para resolver el problema informado (demo).' }, { estado: 'Resuelto', fecha: D(-9, 15, 30), comentario: 'Se informó la intervención realizada. Gracias por su colaboración (demo).' } ], ciudadanoId: 'ciu-1' },
          { id: 'mr-8', numero: 'REC-2026-000204', categoria: 'alumbrado', titulo: 'Luminaria del acceso al club', descripcion: 'La luminaria del acceso al club no funciona y el ingreso queda oscuro.', barrio: 'Centro', direccion: 'Acceso al Club — Ruta Nacional 11', fecha: D(-18, 21, 0), estado: 'Requiere información', timeline: [ { estado: 'Recibido', fecha: D(-18, 21, 1), comentario: 'Reclamo ingresado al sistema de atención ciudadana (demo).' }, { estado: 'En revisión', fecha: D(-17, 8, 45), comentario: 'El reclamo fue ingresado y está siendo evaluado por Atención Ciudadana (demo).' }, { estado: 'Requiere información', fecha: D(-16, 10, 10), comentario: 'Necesitamos una referencia más precisa (número de columna o foto) para agilizar la inspección (demo).' } ], ciudadanoId: 'ciu-7' }
        ],
        tramites: [
          { id: 'mt-1', numero: 'TRA-2026-000111', defId: 'libre-deuda', nombre: 'Certificado de libre deuda de tasas', fecha: D(-1, 9, 10), estado: 'Recibido', datos: { partida: '123-60.204', destino: 'Presentar en banco (demo)' }, historial: [ { estado: 'Recibido', fecha: D(-1, 9, 11), comentario: 'Solicitud ingresada. Expediente interno de demostración.' } ], ciudadanoId: 'ciu-2' },
          { id: 'mt-2', numero: 'TRA-2026-000108', defId: 'certificado-residencia', nombre: 'Certificado de residencia (demo)', fecha: D(-3, 10, 30), estado: 'En revisión', datos: { domicilio: 'Calle 15 N°78', motivo: 'Inscripción escolar (demo)' }, historial: [ { estado: 'Recibido', fecha: D(-3, 10, 31), comentario: 'Solicitud ingresada. Expediente interno de demostración.' }, { estado: 'En revisión', fecha: D(-2, 9, 40), comentario: 'El área responsable está evaluando la documentación (demo).' } ], ciudadanoId: 'ciu-6' },
          { id: 'mt-3', numero: 'TRA-2026-000105', defId: 'habilitacion-comercial', nombre: 'Habilitación comercial (demo)', fecha: D(-6, 11, 5), estado: 'En revisión', datos: { comercio: 'Panadería Central (demo)', rubro: 'Elaboración de alimentos', direccion: 'Calle 2 N°78', superficie: '86 m2' }, historial: [ { estado: 'Recibido', fecha: D(-6, 11, 6), comentario: 'Solicitud ingresada. Expediente interno de demostración.' }, { estado: 'En revisión', fecha: D(-4, 10, 20), comentario: 'El área responsable está evaluando la documentación (demo).' } ], ciudadanoId: 'ciu-3' },
          { id: 'mt-4', numero: 'TRA-2026-000101', defId: 'constancia-tgi', nombre: 'Constancia de valuación fiscal (demo)', fecha: D(-9, 8, 45), estado: 'En emisión', datos: { partida: '123-71.045' }, historial: [ { estado: 'Recibido', fecha: D(-9, 8, 46), comentario: 'Solicitud ingresada. Expediente interno de demostración.' }, { estado: 'En revisión', fecha: D(-8, 9, 15), comentario: 'El área responsable está evaluando la documentación (demo).' }, { estado: 'En emisión', fecha: D(-6, 11, 0), comentario: 'Se está generando el documento solicitado (demo).' } ], ciudadanoId: 'ciu-4' },
          { id: 'mt-5', numero: 'TRA-2026-000098', defId: 'uso-suelo', nombre: 'Factibilidad de uso de suelo (demo)', fecha: D(-12, 14, 20), estado: 'Listo para retirar', datos: { direccion: 'Calle 7 N°510', actividad: 'Taller mecánico (demo)' }, historial: [ { estado: 'Recibido', fecha: D(-12, 14, 21), comentario: 'Solicitud ingresada. Expediente interno de demostración.' }, { estado: 'En revisión', fecha: D(-10, 9, 30), comentario: 'El área responsable está evaluando la documentación (demo).' }, { estado: 'En emisión', fecha: D(-8, 10, 10), comentario: 'Se está generando el documento solicitado (demo).' }, { estado: 'Listo para retirar', fecha: D(-6, 15, 5), comentario: 'El documento está listo para retirar en la dependencia indicada (demo).' } ], ciudadanoId: 'ciu-5' },
          { id: 'mt-6', numero: 'TRA-2026-000094', defId: 'certificado-residencia', nombre: 'Certificado de residencia (demo)', fecha: D(-16, 9, 55), estado: 'Finalizado', datos: { domicilio: 'Calle 7 N°510', motivo: 'Trámite de beca (demo)' }, historial: [ { estado: 'Recibido', fecha: D(-16, 9, 56), comentario: 'Solicitud ingresada. Expediente interno de demostración.' }, { estado: 'En revisión', fecha: D(-14, 10, 40), comentario: 'El área responsable está evaluando la documentación (demo).' }, { estado: 'En emisión', fecha: D(-12, 9, 20), comentario: 'Se está generando el documento solicitado (demo).' }, { estado: 'Listo para retirar', fecha: D(-10, 11, 15), comentario: 'El documento está listo para retirar en la dependencia indicada (demo).' }, { estado: 'Finalizado', fecha: D(-9, 8, 30), comentario: 'El trámite finalizó (demo).' } ], ciudadanoId: 'ciu-8' },
          { id: 'mt-7', numero: 'TRA-2026-000090', defId: 'plan-pagos', nombre: 'Solicitud de plan de pagos (demo)', fecha: D(-19, 16, 10), estado: 'Finalizado', datos: { cuenta: 'Partida 123-45.890', cuotas: '6' }, historial: [ { estado: 'Recibido', fecha: D(-19, 16, 11), comentario: 'Solicitud ingresada. Expediente interno de demostración.' }, { estado: 'En revisión', fecha: D(-17, 10, 5), comentario: 'El área responsable está evaluando la documentación (demo).' }, { estado: 'En emisión', fecha: D(-15, 9, 50), comentario: 'Se está generando el documento solicitado (demo).' }, { estado: 'Listo para retirar', fecha: D(-13, 14, 0), comentario: 'El documento está listo para retirar en la dependencia indicada (demo).' }, { estado: 'Finalizado', fecha: D(-12, 10, 25), comentario: 'El trámite finalizó (demo).' } ], ciudadanoId: 'ciu-1' }
        ]
      }
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
    estadosMultaAdmin: {
      pendiente: { texto: 'Pendiente', clase: 'b-aviso', icono: 'clock' },
      vencida: { texto: 'Vencida', clase: 'b-peligro', icono: 'alert-triangle' },
      pagada: { texto: 'Pagada', clase: 'b-exito', icono: 'check-circle' },
      en_descargo: { texto: 'En descargo', clase: 'b-info', icono: 'shield-check' }
    },
    estadosCiudadano: {
      activo: { texto: 'Activo', clase: 'b-exito', icono: 'user-check' },
      bloqueado: { texto: 'Bloqueado', clase: 'b-peligro', icono: 'user-x' }
    },
    rolesMunicipio: {
      ciudadano: { texto: 'Ciudadano', clase: 'b-info', icono: 'user' },
      admin: { texto: 'Personal municipal', clase: 'b-neutra', icono: 'shield-check' }
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
    barrios: ['Centro', 'Fátima', 'Virgen Niña', 'Itatí', 'Zona rural'],
    serviciosMunicipales: [
      { id: 'atmosferico', nombre: 'Camión atmosférico (desagote de pozos negros)' },
      { id: 'ramas', nombre: 'Junte de ramas / poda' },
      { id: 'voluminosos', nombre: 'Recolección de residuos voluminosos (muebles, electrodomésticos)' },
      { id: 'desmalezado', nombre: 'Desmalezado / limpieza de terreno baldío' },
      { id: 'riego', nombre: 'Riego de calles' },
      { id: 'cunetas', nombre: 'Zanjeo / limpieza de cunetas' },
      { id: 'arbol-riesgo', nombre: 'Corte o retiro de árbol (riesgo)' },
      { id: 'otros', nombre: 'Otros' }
    ],
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
      { id: 'mesa', nombre: 'Mesa de Entradas — Palacio Municipal (demo)', direccion: 'Calle 12 N°901 — Palacio Municipal' },
      { id: 'rentas', nombre: 'Oficina de Rentas (demo)', direccion: 'Calle 12 N°901 — Palacio Municipal' },
      { id: 'obras', nombre: 'Dirección de Obras Particulares (demo)', direccion: 'Calle 12 N°901 — Palacio Municipal' },
      { id: 'transito', nombre: 'Dirección de Tránsito (demo)', direccion: 'Calle 12 N°901 — Palacio Municipal' },
      { id: 'zoonosis', nombre: 'Centro de Zoonosis y Bienestar Animal (demo)', direccion: 'Calle 12 N°901 — Palacio Municipal' },
      { id: 'licencias', nombre: 'Centro de Emisión de Licencias de Conducir (demo)', direccion: 'Calle 12 N°901 — Palacio Municipal' }
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
    nivelesAgua: [
      { id: 'leve', nombre: 'Ingreso leve', texto: 'Entra un poco de agua: humedad, charcos o escurrimiento que puedo controlar.', icono: 'droplets', clase: 'b-aviso' },
      { id: 'critico', nombre: 'Ingreso crítico', texto: 'Entra mucha agua o sube rápido. Hay riesgo para personas o bienes.', icono: 'alert-triangle', clase: 'b-peligro' }
    ],
    estadosAgua: ['Recibido', 'Verificado', 'En asistencia', 'Cerrado'],
    comentariosAgua: {
      'Verificado': 'Personal de Defensa Civil verificó la situación en el domicilio (demo).',
      'En asistencia': 'Brigada asignada con bomba de achique. Asistencia en camino (demo).',
      'Cerrado': 'La situación fue atendida y el reporte se cerró (demo).'
    },
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
      domicilio: 'Calle 12 N°901 — Palacio Municipal (dato de referencia)',
      horario: 'Lunes a viernes de 7:00 a 13:00 — horario de demostración',
      telefono: '(000) 000-0000 — pendiente de confirmación institucional',
      email: 'Sin correo oficial confirmado — dato de demostración'
    },
    emergenciaNota: 'Esta aplicación es un prototipo y NO reemplaza los canales de emergencia. Ante urgencias reales, comunicate con 911, bomberos o defensa civil.'
  };
  return { estadoInicial: estadoInicial, catalogos: catalogos };
})();
