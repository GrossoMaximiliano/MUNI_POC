window.Views = window.Views || {};

Views.adminTramites = (function () {
  var q = '';
  var estado = 'todos';

  function M() { return Store.state.municipal; }

  function badge(e) { return Views.tramites.badgeTramite(e); }

  function listaFiltrada() {
    var texto = q.trim().toLowerCase();
    return M().tramites.filter(function (t) {
      var okEstado = estado === 'todos' || t.estado === estado;
      var haystack = (t.numero + ' ' + t.nombre + ' ' + Servicios.nombreCiudadano(t.ciudadanoId)).toLowerCase();
      return okEstado && (!texto || haystack.indexOf(texto) >= 0);
    }).sort(function (a, b) { return new Date(b.fecha) - new Date(a.fecha); });
  }

  function itemTramite(t) {
    return `
      <a class='item' href='#/admin/tramite/${t.id}'>
        <span class='tinte t-azul item-ico'>${Icons.r('clipboard-check')}</span>
        <span class='item-cuerpo'>
          <span class='item-titulo'>${U.escape(t.nombre)}</span>
          <span class='item-sub'><span>${t.numero}</span><span>${U.fecha(t.fecha)}</span><span>${U.escape(Servicios.nombreCiudadano(t.ciudadanoId))}</span></span>
        </span>
        <span class='item-derecha'>${badge(t.estado)}</span>
        <span class='flecha'>${Icons.r('chevron-right')}</span>
      </a>`;
  }

  function listaHtml() {
    var lista = listaFiltrada();
    if (!lista.length) return UI.vacio({ icono: 'search', titulo: 'Sin trámites con estos filtros', texto: 'Probá cambiar el estado o el texto de búsqueda.' });
    return `<div class='lista'>${lista.map(itemTramite).join('')}</div>`;
  }

  function chipsEstados() {
    var estados = [['todos', 'Todos'], ['Recibido', 'Recibidos'], ['En revisión', 'En revisión'], ['En emisión', 'En emisión'], ['Listo para retirar', 'Listo para retirar'], ['Finalizado', 'Finalizados']];
    return `<div class='chips' role='group' aria-label='Filtrar por estado'>${estados.map(function (e) {
      return `<button type='button' class='chip ${estado === e[0] ? 'activa' : ''}' data-estado='${e[0]}'>${e[1]}</button>`;
    }).join('')}</div>`;
  }

  function main() {
    var total = M().tramites.length;
    var html = `
      <h1>Gestión de trámites</h1>
      <p class='sub'>Solicitudes de los ciudadanos. ${total} trámites de demostración.</p>
      <div class='buscador mt-16'>
        ${Icons.r('search')}
        <input id='at-buscar' class='control' type='search' value='${U.escape(q)}' placeholder='Buscar por número, trámite o ciudadano…' aria-label='Buscar trámite'>
      </div>
      ${chipsEstados()}
      <div id='at-lista'>${listaHtml()}</div>`;
    return {
      titulo: 'Trámites',
      html: html,
      after: function (raiz) {
        var input = raiz.querySelector('#at-buscar');
        if (input) input.addEventListener('input', function () {
          q = input.value;
          var zona = raiz.querySelector('#at-lista');
          if (zona) zona.innerHTML = listaHtml();
        });
        raiz.querySelectorAll('[data-estado]').forEach(function (b) {
          b.addEventListener('click', function () { estado = b.getAttribute('data-estado'); Router.refrescar(); });
        });
      }
    };
  }

  function detalle(id) {
    var t = M().tramites.filter(function (x) { return x.id === id; })[0];
    if (!t) return Views.noEncontrado();
    var def = DEMO.catalogos.tramiteDefs.filter(function (d) { return d.id === t.defId; })[0] || { campos: [] };
    var puede = t.estado !== 'Listo para retirar' && t.estado !== 'Finalizado';
    var html = `
      <a class='enlace' href='#/admin/tramites'>${Icons.r('arrow-left', 'i-16')} Volver a trámites</a>
      <div class='card mt-8'>
        <div style='display:flex;align-items:center;gap:12px'>
          <span class='tinte t-azul'>${Icons.r('clipboard-check', 'i-22')}</span>
          <div style='flex:1'>
            <h2 style='margin:0'>${U.escape(t.nombre)}</h2>
            <p class='sub' style='margin:2px 0 0'>${t.numero}</p>
          </div>
          ${badge(t.estado)}
        </div>
        <div class='filas mt-16'>
          <div class='fila-datos'><span class='clave'>Solicitado</span><span class='valor'>${U.fechaHora(t.fecha)}</span></div>
          <div class='fila-datos'><span class='clave'>Ciudadano (demo)</span><span class='valor'><a href='#/admin/ciudadano/${t.ciudadanoId}'>${U.escape(Servicios.nombreCiudadano(t.ciudadanoId))}</a></span></div>
          ${Object.keys(t.datos || {}).map(function (k) {
            var c = def.campos.filter(function (x) { return x.key === k; })[0];
            return `<div class='fila-datos'><span class='clave'>${U.escape(c ? c.label : k)}</span><span class='valor'>${U.escape(t.datos[k])}</span></div>`;
          }).join('')}
        </div>
        <div class='alerta a-info mt-8'>${Icons.r('info')}<span>El avance de estado se guarda sólo en este navegador (demo). En la integración real sería PATCH /admin/tramites/:id.</span></div>
        ${puede ? `<div class='fila-acciones'><button type='button' class='btn btn-primario btn-bloque' id='at-avanzar'>${Icons.r('chevron-right', 'i-18')} Avanzar estado</button></div>` : ''}
      </div>
      <section class='seccion'>
        <div class='seccion-cabeza'><h2>Historial</h2></div>
        <div class='card'>
          <ol class='timeline'>
            ${t.historial.map(function (h, i) {
              var ultimo = i === t.historial.length - 1;
              return `<li class='tl-item ${ultimo ? 'actual' : 'hecho'}'><span class='tl-punto'>${Icons.r('check', 'i-16')}</span><div class='tl-estado'>${U.escape(h.estado)}</div><div class='tl-fecha'>${U.fechaHora(h.fecha)}</div><div class='tl-comentario'>${U.escape(h.comentario)}</div></li>`;
            }).join('')}
          </ol>
        </div>
      </section>`;
    return {
      titulo: 'Trámite ' + t.numero,
      html: html,
      after: function (raiz) {
        var btn = raiz.querySelector('#at-avanzar');
        if (btn) btn.addEventListener('click', function () {
          UI.confirmar({
            titulo: 'Avanzar estado del trámite',
            mensaje: 'El trámite ' + t.numero + ' pasará al siguiente estado dentro de la demo. ¿Continuar?',
            textoConfirmar: 'Avanzar'
          }).then(function (ok) {
            if (!ok) return;
            var nuevo = Servicios.avanzarTramiteMunicipal(t.id);
            if (nuevo) { UI.toast('El trámite pasó a: ' + nuevo + ' (demo).', 'exito'); Router.refrescar(); }
          });
        });
      }
    };
  }

  return { main: main, detalle: detalle };
})();
