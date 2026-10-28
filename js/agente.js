/* agente.js — Conecta el chat con el modelo de IA a través del proxy (CONFIG.apiBase + /ia/chat),
   que guarda la clave de OpenRouter y fija el modelo. Arma el prompt de sistema con
   docs/prompt-sistema-asistente.md, la base de conocimiento (docs/base-conocimiento-asistente.md)
   y el estado actual de la cuenta. El hilo vive solo en memoria (Chat lo descarta al cambiar de cuenta o recargar). */
(function () {
  var cfg = window.CONFIG || {};
  if (!cfg.apiBase || !window.Chat) return;

  var MAX_MENSAJES = 20; // últimos mensajes del hilo que se envían al modelo
  var TIMEOUT_MS = 60000;
  var docs = null;

  // Carga (una vez) el prompt y la base de conocimiento. Si falla (ej. abierto con file://) usa un prompt mínimo.
  function cargarDocs() {
    if (docs) return docs;
    function texto(url) { return fetch(url).then(function (r) { if (!r.ok) throw new Error(url); return r.text(); }); }
    docs = Promise.all([texto('docs/prompt-sistema-asistente.md'), texto('docs/base-conocimiento-asistente.md')]).then(function (r) {
      var prompt = (r[0].match(/```\n([\s\S]*?)\n```/) || [])[1];
      if (!prompt) throw new Error('prompt');
      // Fragmentos separados por '---': se omite la guía de uso y el estado inicial de la cuenta demo
      // (la cuenta se manda en vivo en DATOS DE LA CUENTA).
      var fragmentos = r[1].split(/\n---\n/).slice(1).filter(function (f) { return f.indexOf('| datos-usuario |') < 0; });
      return { prompt: prompt, conocimiento: fragmentos.map(function (f) { return f.trim(); }).join('\n\n') };
    }).catch(function () {
      docs = null; // reintentar en el próximo mensaje
      return {
        prompt: 'Sos el asistente virtual de la Municipalidad de Las Toscas (Santa Fe). Respondé en español rioplatense, breve y en texto plano. El portal es una demostración: pagos, reclamos y turnos son simulados. Hoy es {{fecha_hoy}}. Rol: {{rol}}.\n\nCONOCIMIENTO:\n{{contexto}}\n\nDATOS DE LA CUENTA:\n{{datos_usuario}}\n\nSi no tenés un dato, decilo y derivá a la Municipalidad: Calle 12 número 901, teléfono 03482 492000. Ante emergencias, primero 911.',
        conocimiento: '(No disponible)'
      };
    });
    return docs;
  }

  function pesos(n) { return (n || 0).toLocaleString('es-AR', { maximumFractionDigits: 2 }) + ' pesos'; }
  function lista(titulo, arr, fn) { return titulo + ':\n' + (arr.length ? arr.map(function (x) { return '- ' + fn(x); }).join('\n') : '- Ninguno'); }

  function datosCiudadano(st) {
    var s = st.sesion, u = st.usuario;
    var impagas = st.obligaciones.filter(function (o) { return o.estado !== 'pagada'; });
    var deuda = impagas.reduce(function (a, o) { return a + Servicios.totalObligacion(o); }, 0);
    var vehiculo = function (id) { var v = st.vehiculos.filter(function (x) { return x.id === id; })[0]; return v ? v.marca + ' ' + v.modelo + ' (' + v.dominio + ')' : ''; };
    return [
      'Vecino: ' + u.nombre + ' ' + u.apellido + ' (le gusta que le digan ' + (u.alias || u.nombre) + '). Correo: ' + (s.email || u.email) + '. Teléfono: ' + u.telefono + '. Domicilio: ' + u.domicilio + ', barrio ' + u.barrio + '.',
      lista('Inmuebles', st.inmuebles, function (i) { return i.tipo + ' en ' + i.direccion + ', partida ' + i.partida; }),
      lista('Vehículos', st.vehiculos, function (v) { return v.tipo + ' ' + v.marca + ' ' + v.modelo + ' ' + v.anio + ', dominio ' + v.dominio; }),
      'Deuda total sin pagar: ' + pesos(deuda) + ' en ' + impagas.length + ' obligaciones.',
      lista('Obligaciones sin pagar', impagas, function (o) {
        return o.concepto + ' (' + o.identificador + ', ' + o.periodo + '): ' + pesos(Servicios.totalObligacion(o)) + (o.intereses ? ' con ' + pesos(o.intereses) + ' de intereses' : '') + '. Estado: ' + o.estado + '. ' + U.venceTexto(o.vencimiento) + ' (' + U.fecha(o.vencimiento) + ').';
      }),
      lista('Últimos pagos', st.pagos.slice(0, 3), function (p) { return p.concepto + ': ' + pesos(p.importe) + ', ' + U.fecha(p.fecha) + ', comprobante ' + p.comprobante; }),
      lista('Multas de tránsito', st.multas, function (m) {
        var der = m.descargos && m.descargos.length ? ' Descargo ' + m.descargos[m.descargos.length - 1].numero + ': ' + m.descargos[m.descargos.length - 1].estado + '.' : '';
        return 'Acta ' + m.acta + ', ' + m.motivo + ', ' + vehiculo(m.vehiculoId) + ', ' + pesos(m.importe) + '. Estado: ' + m.estado.replace('_', ' ') + '.' + der;
      }),
      lista('Reclamos', st.reclamos, function (r) { return r.numero + ' "' + r.titulo + '" en ' + r.direccion + '. Estado: ' + r.estado + '.'; }),
      lista('Trámites', st.tramites, function (t) { return t.numero + ' ' + t.nombre + '. Estado: ' + t.estado + '.'; }),
      lista('Turnos', st.turnos, function (t) { return t.numero + ' ' + t.tipo + ' en ' + t.dependencia + ', ' + U.fechaHora(t.fecha) + '. Estado: ' + t.estado + '.'; }),
      lista('Solicitudes de servicios', (st.solicitudesServicios || []).filter(function (x) { return x.ciudadanoId === s.cuentaId; }), function (x) { return x.numero + ' ' + x.tipo + ' en ' + x.direccion + '. Estado: ' + x.estado + '.'; }),
      lista('Reportes de ingreso de agua', st.reportesAgua || [], function (a) { return a.numero + ' nivel ' + a.nivel + ' en ' + a.direccion + '. Estado: ' + a.estado + '.'; }),
      'Notificaciones sin leer: ' + Servicios.sinLeer() + '.'
    ].join('\n\n');
  }

  function datosAdmin(st) {
    var r = Servicios.resumenMunicipal();
    return [
      'Personal municipal: ' + st.sesion.nombre + ' ' + st.sesion.apellido + ' (' + st.sesion.email + ').',
      'Multas: ' + r.multas.total + ' en total; ' + r.multas.pendientes + ' pendientes, ' + r.multas.vencidas + ' vencidas, ' + r.multas.pagadas + ' pagadas, ' + r.multas.descargos + ' en descargo.',
      'Impuestos: ' + r.impuestos.pendientes + ' pendientes, ' + r.impuestos.vencidas + ' vencidos, ' + r.impuestos.pagadas + ' pagados. Deuda a cobrar: ' + pesos(r.impuestos.deuda) + '. Recaudado: ' + pesos(r.recaudado) + '.',
      'Reclamos abiertos: ' + r.reclamos.abiertos + ' de ' + r.reclamos.total + '. Trámites en curso: ' + r.tramites.enCurso + ' de ' + r.tramites.total + '.',
      'Ciudadanos: ' + r.ciudadanos.activos + ' activos y ' + r.ciudadanos.bloqueados + ' bloqueados.'
    ].join('\n');
  }

  function sistema(d) {
    var st = Store.state;
    var rol = st.sesion.rol === 'admin' ? 'admin' : 'ciudadano';
    var hoy = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    var reemplazos = {
      fecha_hoy: hoy,
      rol: rol,
      contexto: d.conocimiento,
      datos_usuario: rol === 'admin' ? datosAdmin(st) : datosCiudadano(st)
    };
    return d.prompt.replace(/\{\{(\w+)\}\}/g, function (m, k) { return k in reemplazos ? reemplazos[k] : m; });
  }

  // El prompt pide texto plano (también se lee en voz alta): por si el modelo igual usa markdown.
  function limpiar(t) {
    return String(t || '').replace(/\*\*(.+?)\*\*/g, '$1').replace(/^#{1,6}\s+/gm, '').replace(/`/g, '').trim();
  }

  Chat.responder = function (texto, historial) {
    return cargarDocs().then(function (d) {
      var mensajes = [{ role: 'system', content: sistema(d) }].concat(historial.slice(-MAX_MENSAJES).map(function (m) {
        return { role: m.rol === 'usuario' ? 'user' : 'assistant', content: m.texto };
      }));
      var ctrl = new AbortController();
      var corte = setTimeout(function () { ctrl.abort(); }, TIMEOUT_MS);
      return fetch(cfg.apiBase + '/ia/chat', {
        method: 'POST',
        signal: ctrl.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: mensajes })
      }).then(function (r) {
        clearTimeout(corte);
        if (!r.ok) throw new Error('chat ' + r.status);
        return r.json();
      }).then(function (j) {
        var resp = limpiar(j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content);
        if (!resp) throw new Error('respuesta vacía');
        return resp;
      });
    });
  };
})();
