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

  function avanzarReclamoEstados(rec) {
    var estados = C().reclamoEstados;
    var idx = estados.indexOf(rec.estado);
    if (idx < 0 || idx >= estados.length - 1) return null;
    var nuevo = estados[idx + 1];
    rec.estado = nuevo;
    rec.timeline.push({ estado: nuevo, fecha: U.hoyISO(), comentario: C().comentariosReclamo[nuevo] || 'Actualización de estado (demo).' });
    return nuevo;
  }

  function avanzarReclamo(id) {
    var st = S();
    var rec = st.reclamos.filter(function (r) { return r.id === id; })[0];
    if (!rec) return null;
    var nuevo = avanzarReclamoEstados(rec);
    if (!nuevo) return null;
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

  function crearReporteAgua(datos) {
    var st = S();
    var critico = datos.nivel === 'critico';
    var rep = {
      id: U.uid('agu'),
      numero: 'AGU-2026-' + pad(18 + st.reportesAgua.length),
      nivel: datos.nivel,
      direccion: datos.direccion,
      barrio: datos.barrio,
      ubicacionMapa: datos.ubicacionMapa || null,
      personas: datos.personas || 1,
      asistencia: !!datos.asistencia,
      telefono: datos.telefono,
      notas: datos.notas || '',
      fecha: U.hoyISO(),
      estado: 'Recibido',
      timeline: [ { estado: 'Recibido', fecha: U.hoyISO(), comentario: critico ? 'Reporte crítico recibido. Prioridad alta: se contactará al teléfono indicado (demo).' : 'Reporte recibido. Quedó registrado para seguimiento (demo).' } ]
    };
    st.reportesAgua.unshift(rep);
    notificar('agua', 'Reporte por lluvias recibido (demo)', rep.numero + ' · ' + (critico ? 'Ingreso crítico' : 'Ingreso leve') + ' · ' + rep.direccion + ', ' + rep.barrio + '.', 'agua/detalle/' + rep.id);
    logActividad('agua', 'Reporte por lluvias ' + rep.numero, critico ? 'Ingreso crítico' : 'Ingreso leve', 'agua/detalle/' + rep.id);
    Store.save();
    return rep;
  }

  function avanzarReporteAgua(id) {
    var st = S();
    var rep = st.reportesAgua.filter(function (r) { return r.id === id; })[0];
    if (!rep) return null;
    var estados = C().estadosAgua;
    var idx = estados.indexOf(rep.estado);
    if (idx < 0 || idx >= estados.length - 1) return null;
    var nuevo = estados[idx + 1];
    rep.estado = nuevo;
    rep.timeline.push({ estado: nuevo, fecha: U.hoyISO(), comentario: C().comentariosAgua[nuevo] });
    notificar('agua', 'Tu reporte por lluvias avanzó (demo)', rep.numero + ' pasó a: ' + nuevo + '.', 'agua/detalle/' + rep.id);
    logActividad('agua', 'Reporte por lluvias ' + rep.numero, nuevo, 'agua/detalle/' + rep.id);
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

  var TRAMITE_ESTADOS = ['Recibido', 'En revisión', 'En emisión', 'Listo para retirar', 'Finalizado'];
  var TRAMITE_COMENTARIOS = {
    'En revisión': 'El área responsable está evaluando la documentación (demo).',
    'En emisión': 'Se está generando el documento solicitado (demo).',
    'Listo para retirar': 'El documento está listo para retirar en la dependencia indicada (demo).',
    'Finalizado': 'El trámite finalizó (demo).'
  };

  function avanzarTramiteEstados(tra) {
    var idx = TRAMITE_ESTADOS.indexOf(tra.estado);
    if (idx < 0 || idx >= TRAMITE_ESTADOS.length - 1) return null;
    var nuevo = TRAMITE_ESTADOS[idx + 1];
    tra.estado = nuevo;
    tra.historial.push({ estado: nuevo, fecha: U.hoyISO(), comentario: TRAMITE_COMENTARIOS[nuevo] });
    return nuevo;
  }

  function avanzarTramite(id) {
    var st = S();
    var tra = st.tramites.filter(function (t) { return t.id === id; })[0];
    if (!tra) return null;
    var nuevo = avanzarTramiteEstados(tra);
    if (!nuevo) return null;
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

  /* —— Autenticación (mock). Integración REST futura:
     POST /auth/login → { token, rol, usuario } · POST /auth/registro · POST /auth/logout */
  function sesionVacia() {
    return { iniciada: false, rol: null, cuentaId: null, nombre: '', apellido: '', alias: '', email: '' };
  }

  function buscarCuenta(email) {
    var limpio = String(email || '').trim().toLowerCase();
    return S().cuentas.filter(function (c) { return c.email.toLowerCase() === limpio; })[0] || null;
  }

  function aplicarSesion(cta) {
    var st = S();
    st.sesion = { iniciada: true, rol: cta.rol, cuentaId: cta.id, nombre: cta.perfil.nombre, apellido: cta.perfil.apellido, alias: cta.perfil.alias || cta.perfil.nombre, email: cta.email };
    if (cta.rol === 'ciudadano') {
      ['nombre', 'apellido', 'alias', 'email', 'telefono', 'domicilio', 'barrio'].forEach(function (k) {
        if (cta.perfil[k]) st.usuario[k] = cta.perfil[k];
      });
    }
    Store.save();
  }

  function login(email, clave) {
    var cta = buscarCuenta(email);
    if (!cta) return { ok: false, campo: 'email', mensaje: 'No encontramos una cuenta con ese correo (demo).' };
    if (cta.clave !== String(clave || '')) return { ok: false, campo: 'clave', mensaje: 'La clave no coincide con la cuenta (demo).' };
    aplicarSesion(cta);
    return { ok: true, rol: cta.rol, cuenta: cta };
  }

  function registrarCuenta(datos) {
    var st = S();
    if (buscarCuenta(datos.email)) return { ok: false, campo: 'email', mensaje: 'Ya existe una cuenta con ese correo en la demo.' };
    var cuenta = {
      id: U.uid('cta'),
      email: datos.email,
      clave: datos.clave,
      rol: 'ciudadano',
      perfil: {
        nombre: datos.nombre,
        apellido: datos.apellido,
        alias: datos.nombre.split(' ')[0],
        email: datos.email,
        telefono: datos.telefono,
        dni: datos.dni,
        domicilio: '',
        barrio: DEMO.catalogos.barrios[0]
      }
    };
    st.cuentas.push(cuenta);
    aplicarSesion(cuenta);
    return { ok: true, cuenta: cuenta };
  }

  function cerrarSesion() { S().sesion = sesionVacia(); Store.save(); }
  function rolActual() { var s = S().sesion; return s && s.iniciada ? s.rol : null; }

  /* —— Panel de administración (mock). Integración REST futura:
     GET /admin/resumen · GET /admin/multas · GET /admin/reclamos ·
     GET /admin/tramites · GET /admin/ciudadanos · PATCH /admin/reclamos/:id ·
     PATCH /admin/tramites/:id · PATCH /admin/ciudadanos/:id */
  function M() { return S().municipal; }

  function nombreCiudadano(id) {
    var c = M().ciudadanos.filter(function (x) { return x.id === id; })[0];
    return c ? c.nombre + ' ' + c.apellido : 'Ciudadano (demo)';
  }

  function resumenMunicipal() {
    var m = M();
    function contar(arr, estado) { return arr.filter(function (x) { return x.estado === estado; }).length; }
    function sumar(arr) { return arr.reduce(function (a, x) { return a + (x.importe || 0) + (x.intereses || 0); }, 0); }
    var pendientes = m.obligaciones.filter(function (o) { return o.estado === 'pendiente' || o.estado === 'vencida'; });
    return {
      multas: { pendientes: contar(m.multas, 'pendiente'), vencidas: contar(m.multas, 'vencida'), pagadas: contar(m.multas, 'pagada'), descargos: contar(m.multas, 'en_descargo'), total: m.multas.length },
      impuestos: { pendientes: contar(m.obligaciones, 'pendiente'), vencidas: contar(m.obligaciones, 'vencida'), pagadas: contar(m.obligaciones, 'pagada'), proceso: contar(m.obligaciones, 'proceso'), total: m.obligaciones.length, deuda: sumar(pendientes) },
      recaudado: sumar(m.obligaciones.filter(function (o) { return o.estado === 'pagada'; })) + sumar(m.multas.filter(function (x) { return x.estado === 'pagada'; })),
      reclamos: { abiertos: m.reclamos.filter(function (r) { return r.estado !== 'Resuelto' && r.estado !== 'No corresponde'; }).length, total: m.reclamos.length },
      tramites: { enCurso: m.tramites.filter(function (t) { return t.estado !== 'Finalizado'; }).length, total: m.tramites.length },
      ciudadanos: { activos: contar(m.ciudadanos, 'activo'), bloqueados: contar(m.ciudadanos, 'bloqueado'), total: m.ciudadanos.length }
    };
  }

  function avanzarReclamoMunicipal(id) {
    var rec = M().reclamos.filter(function (r) { return r.id === id; })[0];
    if (!rec) return null;
    var nuevo = avanzarReclamoEstados(rec);
    if (!nuevo) return null;
    Store.save();
    return nuevo;
  }

  function avanzarTramiteMunicipal(id) {
    var tra = M().tramites.filter(function (t) { return t.id === id; })[0];
    if (!tra) return null;
    var nuevo = avanzarTramiteEstados(tra);
    if (!nuevo) return null;
    Store.save();
    return nuevo;
  }

  function cambiarEstadoCiudadano(id) {
    var c = M().ciudadanos.filter(function (x) { return x.id === id; })[0];
    if (!c) return null;
    c.estado = c.estado === 'activo' ? 'bloqueado' : 'activo';
    Store.save();
    return c.estado;
  }

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
    crearReporteAgua: crearReporteAgua,
    avanzarReporteAgua: avanzarReporteAgua,
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
    login: login,
    registrarCuenta: registrarCuenta,
    cerrarSesion: cerrarSesion,
    rolActual: rolActual,
    nombreCiudadano: nombreCiudadano,
    resumenMunicipal: resumenMunicipal,
    avanzarReclamoMunicipal: avanzarReclamoMunicipal,
    avanzarTramiteMunicipal: avanzarTramiteMunicipal,
    cambiarEstadoCiudadano: cambiarEstadoCiudadano,
    marcarLeida: marcarLeida,
    marcarTodasLeidas: marcarTodasLeidas,
    sinLeer: sinLeer
  };
})();