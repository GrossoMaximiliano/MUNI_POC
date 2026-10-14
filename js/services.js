window.Servicios = (function () {
  function C() { return DEMO.catalogos; }
  function S() { return Store.state; }
  function pad(n, ancho) { return String(n).padStart(ancho || 6, '0'); }

  function notificar(tipo, titulo, mensaje, ref) {
    var st = S();
    st.notificaciones.unshift({ id: U.uid('not'), tipo: tipo, titulo: titulo, mensaje: mensaje, fecha: U.hoyISO(), leida: false, ref: ref });
    if (st.notificaciones.length > 24) st.notificaciones.length = 24;
  }

  function logActividad(tipo, titulo, estado, ref) {
    var st = S();
    st.actividad.unshift({ id: U.uid('act'), fecha: U.hoyISO(), tipo: tipo, titulo: titulo, estado: estado, ref: ref });
    if (st.actividad.length > 12) st.actividad.length = 12;
  }

  function totalObligacion(ob) { return (ob.importe || 0) + (ob.intereses || 0); }

  function registrarPago(obligacionId, medioId, exito) {
    var st = S();
    var ob = st.obligaciones.filter(function (o) { return o.id === obligacionId; })[0];
    if (!ob) return null;
    var medio = C().mediosPago.filter(function (m) { return m.id === medioId; })[0];
    var pago = {
      id: U.uid('pag'),
      comprobante: 'PAGO-2026-' + pad(1133 + st.pagos.length),
      fecha: U.hoyISO(),
      obligacionId: ob.id,
      concepto: ob.concepto + ' · ' + ob.periodo,
      identificador: ob.identificador,
      importe: totalObligacion(ob),
      medio: medio ? medio.nombre : 'Medio de pago (demo)',
      estado: exito ? 'aprobado' : 'rechazado'
    };
    st.pagos.unshift(pago);
    if (exito) {
      ob.estado = 'pagada';
      ob.intereses = ob.intereses || 0;
      if (ob.multaId) {
        var mul = st.multas.filter(function (m) { return m.id === ob.multaId; })[0];
        if (mul) mul.estado = 'pagada';
      }
      notificar('pago', 'Pago confirmado (demo)', ob.concepto + ' · ' + ob.periodo + '. Comprobante ' + pago.comprobante + '. Operación simulada, sin movimiento real.', 'pagos/comprobante/' + pago.id);
      logActividad('pago', 'Pago ' + pago.comprobante, 'Aprobado (demo)', 'pagos/comprobante/' + pago.id);
    } else {
      notificar('pago', 'Pago rechazado (demo)', 'La operación fue rechazada en la simulación. La obligación continúa pendiente.', 'pagos/detalle/' + ob.id);
      logActividad('pago', 'Pago rechazado (demo)', ob.concepto, 'pagos/detalle/' + ob.id);
    }
    Store.save();
    return pago;
  }

  function crearReclamo(datos) {
    var st = S();
    var reclamo = {
      id: U.uid('rec'),
      numero: 'REC-2026-' + pad(237 + st.reclamos.length),
      categoria: datos.categoria,
      titulo: datos.titulo,
      descripcion: datos.descripcion,
      barrio: datos.barrio,
      direccion: datos.direccion,
      ubicacionMapa: datos.ubicacionMapa || null,
      foto: datos.foto || null,
      contacto: datos.contacto || null,
      fecha: U.hoyISO(),
      estado: 'Recibido',
      timeline: [
        { estado: 'Recibido', fecha: U.hoyISO(), comentario: 'Reclamo ingresado al sistema de atención ciudadana (demo).' }
      ]
    };
    st.reclamos.unshift(reclamo);
    notificar('reclamo', 'Reclamo recibido (demo)', reclamo.numero + ' · ' + reclamo.titulo + '. Podés seguir su estado desde la sección Reclamos.', 'reclamos/detalle/' + reclamo.id);
    logActividad('reclamo', 'Reclamo ' + reclamo.numero + ' · ' + reclamo.titulo, 'Recibido', 'reclamos/detalle/' + reclamo.id);
    Store.save();
    return reclamo;
  }

  function avanzarReclamo(id) {
    var st = S();
    var rec = st.reclamos.filter(function (r) { return r.id === id; })[0];
    if (!rec) return null;
    var estados = C().reclamoEstados;
    var idx = estados.indexOf(rec.estado);
    if (idx < 0 || idx >= estados.length - 1) return null;
    var nuevo = estados[idx + 1];
    rec.estado = nuevo;
    rec.timeline.push({ estado: nuevo, fecha: U.hoyISO(), comentario: C().comentariosReclamo[nuevo] || 'Actualización de estado (demo).' });
    notificar('reclamo', 'Tu reclamo avanzó (demo)', rec.numero + ' · ' + rec.titulo + ' pasó a: ' + nuevo + '.', 'reclamos/detalle/' + rec.id);
    logActividad('reclamo', 'Reclamo ' + rec.numero, nuevo, 'reclamos/detalle/' + rec.id);
    Store.save();
    return nuevo;
  }

  function iniciarDescargo(multaId, texto) {
    var st = S();
    var mul = st.multas.filter(function (m) { return m.id === multaId; })[0];
    if (!mul) return null;
    var der = {
      id: U.uid('der'),
      numero: 'DER-2026-' + pad(19 + st.multas.length),
      fecha: U.hoyISO(),
      texto: texto,
      estado: 'Presentado',
      historial: [ { estado: 'Presentado', fecha: U.hoyISO(), comentario: 'Descargo recibido por Mesa de Entradas (demo).' } ]
    };
    mul.descargos.push(der);
    mul.estado = 'en_descargo';
    notificar('multa', 'Descargo presentado (demo)', 'Tu descargo ' + der.numero + ' sobre el acta ' + mul.acta + ' fue registrado (demo).', 'vehiculos/multa/' + mul.id);
    logActividad('multa', 'Descargo ' + der.numero + ' · Acta ' + mul.acta, 'Presentado', 'vehiculos/multa/' + mul.id);
    Store.save();
    return der;
  }

  function avanzarDescargo(multaId, descargoId) {
    var st = S();
    var mul = st.multas.filter(function (m) { return m.id === multaId; })[0];
    if (!mul) return null;
    var der = mul.descargos.filter(function (d) { return d.id === descargoId; })[0];
    if (!der) return null;
    var estados = ['Presentado', 'En revisión', 'Resuelto'];
    var idx = estados.indexOf(der.estado);
    if (idx < 0 || idx >= estados.length - 1) return null;
    var nuevo = estados[idx + 1];
    der.estado = nuevo;
    der.historial.push({ estado: nuevo, fecha: U.hoyISO(), comentario: nuevo === 'En revisión' ? 'El área de Tránsito está evaluando la presentación (demo).' : 'El descargo fue resuelto a favor del contribuyente (demo).' });
    notificar('multa', 'Tu descargo avanzó (demo)', der.numero + ' (acta ' + mul.acta + ') pasó a: ' + nuevo + '.', 'vehiculos/multa/' + mul.id);
    Store.save();
    return nuevo;
  }

  function crearTramite(def, datos) {
    var st = S();
    var tramite = {
      id: U.uid('tra'),
      numero: 'TRA-2026-' + pad(103 + st.tramites.length),
      defId: def.id,
      nombre: def.nombre,
      fecha: U.hoyISO(),
      estado: 'Recibido',
      datos: datos,
      historial: [ { estado: 'Recibido', fecha: U.hoyISO(), comentario: 'Solicitud ingresada. Expediente interno de demostración.' } ]
    };
    st.tramites.unshift(tramite);
    notificar('tramite', 'Solicitud recibida (demo)', tramite.numero + ' · ' + tramite.nombre + '. Podés seguir el estado en Mis trámites.', 'mis-tramites/' + tramite.id);
    logActividad('tramite', 'Solicitud ' + tramite.numero + ' · ' + tramite.nombre, 'Recibido', 'mis-tramites/' + tramite.id);
    Store.save();
    return tramite;
  }

  function avanzarTramite(id) {
    var st = S();
    var tra = st.tramites.filter(function (t) { return t.id === id; })[0];
    if (!tra) return null;
    var estados = ['Recibido', 'En revisión', 'En emisión', 'Listo para retirar', 'Finalizado'];
    var comentarios = {
      'En revisión': 'El área responsable está evaluando la documentación (demo).',
      'En emisión': 'Se está generando el documento solicitado (demo).',
      'Listo para retirar': 'El documento está listo para retirar en la dependencia indicada (demo).',
      'Finalizado': 'El trámite finalizó (demo).'
    };
    var idx = estados.indexOf(tra.estado);
    if (idx < 0 || idx >= estados.length - 1) return null;
    var nuevo = estados[idx + 1];
    tra.estado = nuevo;
    tra.historial.push({ estado: nuevo, fecha: U.hoyISO(), comentario: comentarios[nuevo] });
    notificar('tramite', 'Actualización de trámite (demo)', tra.numero + ' (' + tra.nombre + ') pasó a: ' + nuevo + '.', 'mis-tramites/' + tra.id);
    logActividad('tramite', 'Solicitud ' + tra.numero, nuevo, 'mis-tramites/' + tra.id);
    Store.save();
    return nuevo;
  }

  function reservarTurno(datos) {
    var st = S();
    var turno = {
      id: U.uid('tur'),
      numero: 'TUR-2026-' + pad(32 + st.turnos.length),
      tipo: datos.tipo,
      dependencia: datos.dependencia,
      direccion: datos.direccion,
      fecha: datos.fecha,
      notas: datos.notas || '',
      estado: 'Confirmado'
    };
    st.turnos.unshift(turno);
    notificar('turno', 'Turno reservado (demo)', turno.numero + ' · ' + turno.tipo + ' el ' + U.fecha(turno.fecha) + ' (disponibilidad simulada).', 'turnos');
    logActividad('turno', 'Turno ' + turno.numero + ' · ' + turno.tipo, 'Confirmado', 'turnos');
    Store.save();
    return turno;
  }

  function cancelarTurno(id) {
    var st = S();
    var tur = st.turnos.filter(function (t) { return t.id === id; })[0];
    if (!tur) return false;
    tur.estado = 'Cancelado';
    notificar('turno', 'Turno cancelado (demo)', 'Cancelaste el turno ' + tur.numero + ' (' + tur.tipo + ').', 'turnos');
    Store.save();
    return true;
  }

  function agregarVehiculo(datos) {
    var st = S();
    var veh = { id: U.uid('veh'), dominio: datos.dominio, tipo: datos.tipo || 'Automóvil', marca: datos.marca, modelo: datos.modelo, anio: datos.anio || '' };
    st.vehiculos.push(veh);
    Store.save();
    return veh;
  }

  function quitarVehiculo(id) {
    var st = S();
    st.vehiculos = st.vehiculos.filter(function (v) { return v.id !== id; });
    Store.save();
  }

  function actualizarUsuario(datos) {
    var st = S();
    ['nombre', 'apellido', 'alias', 'email', 'telefono', 'domicilio', 'barrio'].forEach(function (k) {
      if (typeof datos[k] === 'string' && datos[k].length) st.usuario[k] = datos[k];
    });
    Store.save();
    return st.usuario;
  }

  function actualizarPreferencia(clave, valor) {
    S().usuario.notificaciones[clave] = !!valor;
    Store.save();
  }

  function iniciarSesion() { S().sesion.iniciada = true; Store.save(); }
  function cerrarSesion() { S().sesion.iniciada = false; Store.save(); }

  function marcarLeida(id) {
    var n = S().notificaciones.filter(function (x) { return x.id === id; })[0];
    if (n && !n.leida) { n.leida = true; Store.save(); }
  }

  function marcarTodasLeidas() {
    S().notificaciones.forEach(function (n) { n.leida = true; });
    Store.save();
  }

  function sinLeer() { return S().notificaciones.filter(function (n) { return !n.leida; }).length; }

  return {
    notificar: notificar,
    logActividad: logActividad,
    totalObligacion: totalObligacion,
    registrarPago: registrarPago,
    crearReclamo: crearReclamo,
    avanzarReclamo: avanzarReclamo,
    iniciarDescargo: iniciarDescargo,
    avanzarDescargo: avanzarDescargo,
    crearTramite: crearTramite,
    avanzarTramite: avanzarTramite,
    reservarTurno: reservarTurno,
    cancelarTurno: cancelarTurno,
    agregarVehiculo: agregarVehiculo,
    quitarVehiculo: quitarVehiculo,
    actualizarUsuario: actualizarUsuario,
    actualizarPreferencia: actualizarPreferencia,
    iniciarSesion: iniciarSesion,
    cerrarSesion: cerrarSesion,
    marcarLeida: marcarLeida,
    marcarTodasLeidas: marcarTodasLeidas,
    sinLeer: sinLeer
  };
})();