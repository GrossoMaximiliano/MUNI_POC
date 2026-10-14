window.Views = window.Views || {};

Views.tramites = (function () {
  var q = '';
  var cat = 'todas';
  var w = null;

  function def(id) {
    return DEMO.catalogos.tramiteDefs.filter(function (t) { return t.id === id; })[0] || null;
  }

  function badgeModalidad(m) {
    var mapa = { online: { t: 'Online', c: 'b-exito', i: 'check-circle' }, presencial: { t: 'Presencial', c: 'b-neutra', i: 'building' }, mixta: { t: 'Mixta', c: 'b-info', i: 'info' } };
    var d = mapa[m] || mapa.presencial;
    return `<span class='badge ${d.c}'>${Icons.r(d.i)}${d.t}</span>`;
  }

  function listaFiltrada() {
    var defs = DEMO.catalogos.tramiteDefs;
    var texto = q.trim().toLowerCase();
    return defs.filter(function (t) {
      var okCat = cat === 'todas' || t.cat === cat;
      var okTexto = !texto || (t.nombre + ' ' + t.descripcion).toLowerCase().indexOf(texto) >= 0;
      return okCat && okTexto;
    });
  }

  function listaHtml() {
    var defs = listaFiltrada();
    if (!defs.length) return UI.vacio({ icono: 'search', titulo: 'Sin resultados', texto: 'Probá con otra palabra o cambiá la categoría.' });
    return `<div class='lista'>${defs.map(function (t) {
      return `
      <a class='item' href='#/tramites/detalle/${t.id}'>
        <span class='tinte t-azul item-ico'>${Icons.r('file-text')}</span>
        <span class='item-cuerpo'>
          <span class='item-titulo'>${U.escape(t.nombre)}</span>
          <span class='item-sub'><span>${U.escape(DEMO.catalogos.tramiteCategorias[t.cat] || '')}</span></span>
        </span>
        <span class='item-derecha'>${badgeModalidad(t.modalidad)}</span>
        <span class='flecha'>${Icons.r('chevron-right')}</span>
      </a>`;
    }).join('')}</div>`;
  }

  function main() {
    var chips = [`<button type='button' class='chip ${cat === 'todas' ? 'activa' : ''}' data-cat='todas'>Todas</button>`];
    Object.keys(DEMO.catalogos.tramiteCategorias).forEach(function (k) {
      chips.push(`<button type='button' class='chip ${cat === k ? 'activa' : ''}' data-cat='${k}'>${DEMO.catalogos.tramiteCategorias[k]}</button>`);
    });
    var html = `
      <h1>Trámites municipales</h1>
      <p class='sub'>Catálogo orientativo de demostración. La disponibilidad real dependerá de la implementación oficial.</p>
      <div class='buscador mt-16'>
        ${Icons.r('search')}
        <input id='tra-buscar' class='control' type='search' value='${U.escape(q)}' placeholder='Buscar trámite por nombre…' aria-label='Buscar trámite'>
      </div>
      <div class='chips' role='group' aria-label='Filtrar por categoría'>${chips.join('')}</div>
      <div id='tra-lista'>${listaHtml()}</div>
      <section class='seccion'>
        <a class='btn btn-secundario btn-bloque' href='#/mis-tramites'>${Icons.r('clipboard-check', 'i-18')} Ver mis solicitudes</a>
        <a class='btn btn-fantasma btn-bloque' href='#/turnos/nuevo'>${Icons.r('calendar-check', 'i-18')} Sacar un turno</a>
      </section>`;
    return {
      titulo: 'Trámites',
      html: html,
      after: function (raiz) {
        var input = raiz.querySelector('#tra-buscar');
        if (input) {
          input.addEventListener('input', function () {
            q = input.value;
            var zona = raiz.querySelector('#tra-lista');
            if (zona) zona.innerHTML = listaHtml();
          });
        }
        raiz.querySelectorAll('[data-cat]').forEach(function (b) {
          b.addEventListener('click', function () { cat = b.getAttribute('data-cat'); Router.refrescar(); });
        });
      }
    };
  }

  function detalle(id) {
    var t = def(id);
    if (!t) return Views.noEncontrado();
    var html = `
      <a class='enlace' href='#/tramites'>${Icons.r('arrow-left', 'i-16')} Volver al catálogo</a>
      <div class='card mt-8'>
        <div style='display:flex;align-items:center;gap:12px'>
          <span class='tinte t-azul'>${Icons.r('file-text', 'i-22')}</span>
          <div style='flex:1'>
            <h2 style='margin:0'>${U.escape(t.nombre)}</h2>
            <p class='sub' style='margin:2px 0 0'>${U.escape(DEMO.catalogos.tramiteCategorias[t.cat] || '')}</p>
          </div>
          ${badgeModalidad(t.modalidad)}
        </div>
        <p class='mt-16'>${U.escape(t.descripcion)}</p>
        <h3>Requisitos (ejemplo)</h3>
        <ul>${t.requisitos.map(function (r) { return `<li>${U.escape(r)}</li>`; }).join('')}</ul>
        <h3>Documentación necesaria (ejemplo)</h3>
        <ul>${t.docs.map(function (r) { return `<li>${U.escape(r)}</li>`; }).join('')}</ul>
        <div class='filas mt-8'>
          <div class='fila-datos'><span class='clave'>Modalidad</span><span class='valor'>${t.modalidad === 'online' ? 'Online' : (t.modalidad === 'mixta' ? 'Mixta (online y presencial)' : 'Presencial')}</span></div>
          <div class='fila-datos'><span class='clave'>Tiempo de resolución</span><span class='valor'>${U.escape(t.tiempo)}</span></div>
        </div>
        <div class='alerta a-aviso'>${Icons.r('alert-triangle')}<span>Información orientativa de demostración: no certifica disponibilidad real, costos ni plazos. No implica que el trámite pueda completarse digitalmente en un sistema oficial.</span></div>
        <div class='fila-acciones'>
          ${t.modalidad !== 'presencial' ? `<a class='btn btn-primario btn-bloque' href='#/tramites/solicitar/${t.id}'>${Icons.r('send', 'i-18')} Iniciar solicitud (demo)</a>` : ''}
          ${t.modalidad !== 'online' ? `<a class='btn btn-secundario btn-bloque' href='#/turnos/nuevo'>${Icons.r('calendar-check', 'i-18')} Solicitar turno presencial</a>` : ''}
        </div>
      </div>`;
    return { titulo: t.nombre, html: html };
  }

  function solicitar(id) {
    var t = def(id);
    if (!t) return Views.noEncontrado();
    if (!w || w.defId !== id) w = { paso: 1, defId: id, datos: {}, creado: null };
    var html = '';
    if (w.paso === 1) {
      html = `
        <a class='enlace' href='#/tramites/detalle/${t.id}'>${Icons.r('arrow-left', 'i-16')} Cancelar</a>
        <div class='pasos' aria-hidden='true'><span class='completo'></span><span></span></div>
        <p class='paso-texto'>Paso 1 de 2 · Completá los datos</p>
        <div class='card'>
          <h2>${U.escape(t.nombre)}</h2>
          ${t.campos.map(function (c) {
            var valor = w.datos[c.key] || '';
            var marcado = c.requerido ? ' *' : '';
            if (c.tipo === 'textarea') {
              return `<div class='campo'><label for='sp-${c.key}'>${U.escape(c.label + marcado)}</label><textarea id='sp-${c.key}' class='control' data-clave='${c.key}'>${U.escape(valor)}</textarea></div>`;
            }
            return `<div class='campo'><label for='sp-${c.key}'>${U.escape(c.label + marcado)}</label><input id='sp-${c.key}' class='control' type='text' data-clave='${c.key}' value='${U.escape(valor)}'>${c.requerido ? '' : '<span class="ayuda">Opcional</span>'}</div>`;
          }).join('')}
          <div class='alerta a-info'>${Icons.r('info')}<span>Datos de demostración: se guardan sólo en tu navegador.</span></div>
          <div class='fila-acciones'>
            <button type='button' class='btn btn-primario btn-bloque' id='sp-sig'>${Icons.r('chevron-right', 'i-18')} Revisar</button>
          </div>
        </div>`;
    }
    if (w.paso === 2) { html = revisionSolicitud(t); }
    if (w.paso === 3) {
      html = `<div class='centrado-pane'><span class='spinner' style='width:44px;height:44px'></span><h2>Registrando solicitud (demo)…</h2></div>`;
    }
    if (w.paso === 4 && w.creado) {
      html = `
        <div class='centrado-pane'>
          <span class='circulo-ico t-verde pop'>${Icons.r('check-circle', 'i-44')}</span>
          <h1>Solicitud registrada</h1>
          <p class='sub centrado'>Número de solicitud: <strong>${w.creado.numero}</strong> (ficticio, de demostración).</p>
        </div>
        <div class='card'>
          <div class='filas'>
            <div class='fila-datos'><span class='clave'>Trámite</span><span class='valor'>${U.escape(w.creado.nombre)}</span></div>
            <div class='fila-datos'><span class='clave'>Fecha</span><span class='valor'>${U.fecha(w.creado.fecha)}</span></div>
            <div class='fila-datos'><span class='clave'>Estado</span><span class='valor'>Recibido</span></div>
          </div>
          <div class='fila-acciones'>
            <a class='btn btn-primario btn-bloque' href='#/mis-tramites/${w.creado.id}'>${Icons.r('history', 'i-18')} Ver seguimiento</a>
            <a class='btn btn-secundario btn-bloque' href='#/tramites'>${Icons.r('arrow-left', 'i-18')} Volver al catálogo</a>
          </div>
        </div>`;
    }
    return { titulo: t.nombre, html: html, after: function (raiz) { enlazarSolicitud(raiz, t); } };
  }

  function revisionSolicitud(t) {
    var filas = t.campos.map(function (c) {
      return `<div class='fila-datos'><span class='clave'>${U.escape(c.label)} <button type='button' class='enlace' data-editar='1'>editar</button></span><span class='valor'>${U.escape(w.datos[c.key] || '-')}</span></div>`;
    }).join('');
    return `
      <a class='enlace' href='#/tramites/detalle/${t.id}'>${Icons.r('arrow-left', 'i-16')} Cancelar</a>
      <div class='pasos' aria-hidden='true'><span class='completo'></span><span class='completo'></span></div>
      <p class='paso-texto'>Paso 2 de 2 · Revisá y confirmá</p>
      <div class='card'>
        <div class='filas'>${filas}</div>
        <div class='alerta a-aviso'>${Icons.r('alert-triangle')}<span>Solicitud simulada: no se envía a ningún sistema municipal real.</span></div>
        <div class='fila-acciones'>
          <button type='button' class='btn btn-primario btn-bloque' id='sp-enviar'>${Icons.r('send', 'i-18')} Confirmar solicitud (demo)</button>
        </div>
      </div>`;
  }

  function enlazarSolicitud(raiz, t) {
    var sig = raiz.querySelector('#sp-sig');
    if (sig) sig.addEventListener('click', function () {
      UI.limpiarErrores(raiz);
      var ok = true;
      raiz.querySelectorAll('[data-clave]').forEach(function (input) {
        var c = t.campos.filter(function (x) { return x.key === input.getAttribute('data-clave'); })[0];
        if (!c) return;
        w.datos[c.key] = input.value.trim();
        if (c.requerido && !w.datos[c.key]) { UI.ponerError(input, 'Este campo es obligatorio.'); ok = false; }
      });
      if (!ok) return;
      w.paso = 2;
      Router.refrescar();
    });
    raiz.querySelectorAll('[data-editar]').forEach(function (b) {
      b.addEventListener('click', function () { w.paso = 1; Router.refrescar(); });
    });
    var enviar = raiz.querySelector('#sp-enviar');
    if (enviar) enviar.addEventListener('click', function () {
      w.paso = 3;
      Router.refrescar();
      setTimeout(function () {
        w.creado = Servicios.crearTramite(t, w.datos);
        w.paso = 4;
        Router.refrescar();
        UI.toast('Solicitud registrada en la demo.', 'exito');
      }, 900);
    });
  }

  function badgeTramite(estado) {
    var mapa = { 'Recibido': 'b-info', 'En revisión': 'b-aviso', 'En emisión': 'b-info', 'Listo para retirar': 'b-exito', 'Finalizado': 'b-exito' };
    var iconos = { 'Recibido': 'inbox', 'En revisión': 'search', 'En emisión': 'pencil', 'Listo para retirar': 'package', 'Finalizado': 'check-circle' };
    return `<span class='badge ${mapa[estado] || 'b-neutra'}'>${Icons.r(iconos[estado] || 'info')}${U.escape(estado)}</span>`;
  }

  function misTramites() {
    var lista = Store.state.tramites;
    var html = `
      <a class='enlace' href='#/tramites'>${Icons.r('arrow-left', 'i-16')} Volver al catálogo</a>
      <h1 class='mt-8'>Mis trámites</h1>
      <p class='sub'>Solicitudes de demostración enviadas desde este dispositivo.</p>
      ${lista.length ? `<div class='lista mt-16'>${lista.map(function (t) {
        return `
        <a class='item' href='#/mis-tramites/${t.id}'>
          <span class='tinte t-azul item-ico'>${Icons.r('clipboard-check')}</span>
          <span class='item-cuerpo'>
            <span class='item-titulo'>${U.escape(t.nombre)}</span>
            <span class='item-sub'><span>${t.numero}</span><span>${U.fecha(t.fecha)}</span></span>
          </span>
          <span class='item-derecha'>${badgeTramite(t.estado)}</span>
          <span class='flecha'>${Icons.r('chevron-right')}</span>
        </a>`;
      }).join('')}</div>` : UI.vacio({ icono: 'clipboard', titulo: 'No iniciaste trámites', texto: 'Explorá el catálogo y enviá una solicitud de demostración.', accion: `<a class='btn btn-suave' href='#/tramites'>${Icons.r('file-text', 'i-16')} Ver catálogo</a>` })}`;
    return { titulo: 'Mis trámites', html: html };
  }

  function misTramiteDetalle(id) {
    var t = Store.state.tramites.filter(function (x) { return x.id === id; })[0];
    if (!t) return Views.noEncontrado();
    var puede = t.estado !== 'Listo para retirar' && t.estado !== 'Finalizado';
    var d = def(t.defId) || { campos: [] };
    var html = `
      <a class='enlace' href='#/mis-tramites'>${Icons.r('arrow-left', 'i-16')} Volver a mis trámites</a>
      <div class='card mt-8'>
        <div style='display:flex;align-items:center;gap:12px'>
          <span class='tinte t-azul'>${Icons.r('clipboard-check', 'i-22')}</span>
          <div style='flex:1'>
            <h2 style='margin:0'>${U.escape(t.nombre)}</h2>
            <p class='sub' style='margin:2px 0 0'>${t.numero}</p>
          </div>
          ${badgeTramite(t.estado)}
        </div>
        <div class='filas mt-16'>
          <div class='fila-datos'><span class='clave'>Solicitado</span><span class='valor'>${U.fechaHora(t.fecha)}</span></div>
          ${Object.keys(t.datos || {}).map(function (k) {
            var c = d.campos.filter(function (x) { return x.key === k; })[0];
            return `<div class='fila-datos'><span class='clave'>${U.escape(c ? c.label : k)}</span><span class='valor'>${U.escape(t.datos[k])}</span></div>`;
          }).join('')}
        </div>
        <div class='alerta a-aviso mt-8'>${Icons.r('alert-triangle')}<span>Estados y plazos simulados localmente. Ninguna oficina municipal tramita esta solicitud.</span></div>
      </div>
      <section class='seccion'>
        <div class='seccion-cabeza'><h2>Historial</h2>${puede ? `<button type='button' class='btn btn-suave btn-sm' id='mt-avanzar'>${Icons.r('refresh', 'i-14')} Simular avance</button>` : ''}</div>
        <div class='card'>
          <ol class='timeline'>
            ${t.historial.map(function (h, i) {
              var ultimo = i === t.historial.length - 1;
              return `
              <li class='tl-item ${ultimo ? 'actual' : 'hecho'}'>
                <span class='tl-punto'>${Icons.r('check', 'i-16')}</span>
                <div class='tl-estado'>${U.escape(h.estado)}</div>
                <div class='tl-fecha'>${U.fechaHora(h.fecha)}</div>
                <div class='tl-comentario'>${U.escape(h.comentario)}</div>
              </li>`;
            }).join('')}
          </ol>
        </div>
      </section>`;
    return {
      titulo: 'Seguimiento de trámite',
      html: html,
      after: function (raiz) {
        var btn = raiz.querySelector('#mt-avanzar');
        if (btn) btn.addEventListener('click', function () {
          var nuevo = Servicios.avanzarTramite(t.id);
          if (nuevo) { UI.toast('El trámite pasó a: ' + nuevo + ' (demo).', 'exito'); Router.refrescar(); }
        });
      }
    };
  }

  return { main: main, detalle: detalle, solicitar: solicitar, misTramites: misTramites, misTramiteDetalle: misTramiteDetalle };
})();