window.Views = window.Views || {};

Views.adminReclamos = (function () {
  var q = '';
  var estado = 'todos';

  function M() { return Store.state.municipal; }

  function badge(e) { return Views.reclamos.badgeReclamo(e); }

  function listaFiltrada() {
    var texto = q.trim().toLowerCase();
    return M().reclamos.filter(function (r) {
      var okEstado = estado === 'todos' || r.estado === estado;
      var cat = DEMO.catalogos.reclamoCategorias.filter(function (c) { return c.id === r.categoria; })[0] || { nombre: r.categoria };
      var haystack = (r.numero + ' ' + r.titulo + ' ' + r.direccion + ' ' + r.barrio + ' ' + cat.nombre + ' ' + Servicios.nombreCiudadano(r.ciudadanoId)).toLowerCase();
      return okEstado && (!texto || haystack.indexOf(texto) >= 0);
    }).sort(function (a, b) { return new Date(b.fecha) - new Date(a.fecha); });
  }

  function itemReclamo(r) {
    var cat = DEMO.catalogos.reclamoCategorias.filter(function (c) { return c.id === r.categoria; })[0] || { nombre: r.categoria, icono: 'help-circle' };
    return `
      <a class='item' href='#/admin/reclamo/${r.id}'>
        <span class='tinte t-azul item-ico'>${Icons.r(cat.icono)}</span>
        <span class='item-cuerpo'>
          <span class='item-titulo'>${U.escape(r.titulo)}</span>
          <span class='item-sub'><span>${r.numero}</span><span>${U.escape(r.barrio)}</span><span>${U.escape(Servicios.nombreCiudadano(r.ciudadanoId))}</span></span>
          <span class='item-sub' style='margin-top:6px'>${badge(r.estado)}</span>
        </span>
        <span class='flecha'>${Icons.r('chevron-right')}</span>
      </a>`;
  }

  function listaHtml() {
    var lista = listaFiltrada();
    if (!lista.length) return UI.vacio({ icono: 'search', titulo: 'Sin reclamos con estos filtros', texto: 'Probá cambiar el estado o el texto de búsqueda.' });
    return `<div class='lista'>${lista.map(itemReclamo).join('')}</div>`;
  }

  function chipsEstados() {
    var estados = [['todos', 'Todos']].concat(DEMO.catalogos.reclamoEstados.map(function (e) { return [e, e]; }))
      .concat([['Requiere información', 'Requiere información'], ['No corresponde', 'No corresponde']]);
    return `<div class='chips' role='group' aria-label='Filtrar por estado'>${estados.map(function (e) {
      return `<button type='button' class='chip ${estado === e[0] ? 'activa' : ''}' data-estado='${U.escape(e[0])}'>${U.escape(e[1])}</button>`;
    }).join('')}</div>`;
  }

  function main() {
    var total = M().reclamos.length;
    var html = `
      <h1>Gestión de reclamos</h1>
      <p class='sub'>Reclamos ciudadanos del municipio. ${total} reclamos de demostración.</p>
      <div class='buscador mt-16'>
        ${Icons.r('search')}
        <input id='ar-buscar' class='control' type='search' value='${U.escape(q)}' placeholder='Buscar por número, título, barrio o ciudadano…' aria-label='Buscar reclamo'>
      </div>
      ${chipsEstados()}
      <div id='ar-lista'>${listaHtml()}</div>`;
    return {
      titulo: 'Reclamos',
      html: html,
      after: function (raiz) {
        var input = raiz.querySelector('#ar-buscar');
        if (input) input.addEventListener('input', function () {
          q = input.value;
          var zona = raiz.querySelector('#ar-lista');
          if (zona) zona.innerHTML = listaHtml();
        });
        raiz.querySelectorAll('[data-estado]').forEach(function (b) {
          b.addEventListener('click', function () { estado = b.getAttribute('data-estado'); Router.refrescar(); });
        });
      }
    };
  }

  function detalle(id) {
    var r = M().reclamos.filter(function (x) { return x.id === id; })[0];
    if (!r) return Views.noEncontrado();
    var cat = DEMO.catalogos.reclamoCategorias.filter(function (c) { return c.id === r.categoria; })[0] || { nombre: r.categoria, icono: 'help-circle' };
    var esBase = DEMO.catalogos.reclamoEstados.indexOf(r.estado) >= 0;
    var puedeAvanzar = esBase && r.estado !== 'Resuelto';
    var html = `
      <a class='enlace' href='#/admin/reclamos'>${Icons.r('arrow-left', 'i-16')} Volver a reclamos</a>
      <div class='card mt-8'>
        <div style='display:flex;align-items:center;gap:12px'>
          <span class='tinte t-azul'>${Icons.r(cat.icono, 'i-22')}</span>
          <div style='flex:1'>
            <h2 style='margin:0'>${U.escape(r.titulo)}</h2>
            <p class='sub' style='margin:2px 0 0'>${r.numero} · ${cat.nombre}</p>
          </div>
          ${badge(r.estado)}
        </div>
        <div class='filas mt-16'>
          <div class='fila-datos'><span class='clave'>Ingresado</span><span class='valor'>${U.fechaHora(r.fecha)}</span></div>
          <div class='fila-datos'><span class='clave'>Ciudadano (demo)</span><span class='valor'><a href='#/admin/ciudadano/${r.ciudadanoId}'>${U.escape(Servicios.nombreCiudadano(r.ciudadanoId))}</a></span></div>
          <div class='fila-datos'><span class='clave'>Barrio</span><span class='valor'>${U.escape(r.barrio)}</span></div>
          <div class='fila-datos'><span class='clave'>Dirección</span><span class='valor'>${U.escape(r.direccion)}</span></div>
        </div>
        <p class='mt-8'>${U.escape(r.descripcion)}</p>
        ${r.estado === 'Requiere información' ? `<div class='alerta a-aviso'>${Icons.r('help-circle')}<span>El área necesita datos adicionales del vecino (demo). Al avanzar el estado, el reclamo continúa su curso.</span></div>` : ''}
        <div class='alerta a-info mt-8'>${Icons.r('info')}<span>El avance de estado se guarda sólo en este navegador (demo). En la integración real sería PATCH /admin/reclamos/:id.</span></div>
      </div>
      <section class='seccion'>
        <div class='seccion-cabeza'><h2>Seguimiento</h2>${puedeAvanzar ? `<button type='button' class='btn btn-primario btn-sm' id='ar-avanzar'>${Icons.r('chevron-right', 'i-14')} Avanzar estado</button>` : ''}</div>
        <div class='card'>${Views.reclamos.timelineHtml(r)}</div>
      </section>`;
    return {
      titulo: 'Reclamo ' + r.numero,
      html: html,
      after: function (raiz) {
        var btn = raiz.querySelector('#ar-avanzar');
        if (btn) btn.addEventListener('click', function () {
          UI.confirmar({
            titulo: 'Avanzar estado del reclamo',
            mensaje: 'El reclamo ' + r.numero + ' pasará al siguiente estado dentro de la demo. ¿Continuar?',
            textoConfirmar: 'Avanzar'
          }).then(function (ok) {
            if (!ok) return;
            var nuevo = Servicios.avanzarReclamoMunicipal(r.id);
            if (nuevo) { UI.toast('El reclamo pasó a: ' + nuevo + ' (demo).', 'exito'); Router.refrescar(); }
          });
        });
      }
    };
  }

  return { main: main, detalle: detalle };
})();
