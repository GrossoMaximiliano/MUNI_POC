window.Views = window.Views || {};

Views.adminMultas = (function () {
  var q = '';
  var estado = 'todas';

  function M() { return Store.state.municipal; }

  function badgeMulta(e) {
    var d = DEMO.catalogos.estadosMultaAdmin[e] || { texto: e, clase: 'b-neutra', icono: 'info' };
    return `<span class='badge ${d.clase}'>${Icons.r(d.icono)}${d.texto}</span>`;
  }

  var tintes = { pendiente: 't-ambar', vencida: 't-rojo', pagada: 't-verde', en_descargo: 't-azul' };

  function listaFiltrada() {
    var texto = q.trim().toLowerCase();
    return M().multas.filter(function (m) {
      var okEstado = estado === 'todas' || m.estado === estado;
      var ciudadano = Servicios.nombreCiudadano(m.ciudadanoId);
      var haystack = (m.acta + ' ' + m.motivo + ' ' + m.ubicacion + ' ' + (m.dominio || '') + ' ' + ciudadano).toLowerCase();
      return okEstado && (!texto || haystack.indexOf(texto) >= 0);
    }).sort(function (a, b) {
      var orden = { vencida: 0, pendiente: 1, en_descargo: 2, pagada: 3 };
      return (orden[a.estado] - orden[b.estado]) || (new Date(b.fecha) - new Date(a.fecha));
    });
  }

  function itemMulta(m) {
    return `
      <a class='item' href='#/admin/multa/${m.id}'>
        <span class='tinte ${tintes[m.estado] || 't-gris'} item-ico'>${Icons.r('alert-triangle')}</span>
        <span class='item-cuerpo'>
          <span class='item-titulo'>Acta ${U.escape(m.acta)} · ${U.escape(m.motivo)}</span>
          <span class='item-sub'><span>${U.fecha(m.fecha)}</span><span>${U.escape(Servicios.nombreCiudadano(m.ciudadanoId))}</span><span>${U.escape(m.dominio || '')}</span></span>
        </span>
        <span class='item-derecha'>
          <span class='importe'>${U.money(m.importe)}</span>
          ${badgeMulta(m.estado)}
        </span>
        <span class='flecha'>${Icons.r('chevron-right')}</span>
      </a>`;
  }

  function listaHtml() {
    var lista = listaFiltrada();
    if (!lista.length) return UI.vacio({ icono: 'search', titulo: 'Sin multas con estos filtros', texto: 'Probá cambiar el estado o el texto de búsqueda.' });
    return `<div class='lista'>${lista.map(itemMulta).join('')}</div>`;
  }

  function chipsEstados() {
    var estados = [['todas', 'Todas'], ['pendiente', 'Pendientes'], ['vencida', 'Vencidas'], ['pagada', 'Pagadas'], ['en_descargo', 'En descargo']];
    return `<div class='chips' role='group' aria-label='Filtrar por estado'>${estados.map(function (e) {
      return `<button type='button' class='chip ${estado === e[0] ? 'activa' : ''}' data-estado='${e[0]}'>${e[1]}</button>`;
    }).join('')}</div>`;
  }

  function main() {
    var total = M().multas.length;
    var html = `
      <h1>Multas e infracciones</h1>
      <p class='sub'>Actas del municipio con búsqueda y filtros. ${total} multas de demostración.</p>
      <div class='buscador mt-16'>
        ${Icons.r('search')}
        <input id='am-buscar' class='control' type='search' value='${U.escape(q)}' placeholder='Buscar por acta, motivo, dominio o ciudadano…' aria-label='Buscar multa'>
      </div>
      ${chipsEstados()}
      <div id='am-lista'>${listaHtml()}</div>`;
    return {
      titulo: 'Multas',
      html: html,
      after: function (raiz) {
        var input = raiz.querySelector('#am-buscar');
        if (input) input.addEventListener('input', function () {
          q = input.value;
          var zona = raiz.querySelector('#am-lista');
          if (zona) zona.innerHTML = listaHtml();
        });
        raiz.querySelectorAll('[data-estado]').forEach(function (b) {
          b.addEventListener('click', function () { estado = b.getAttribute('data-estado'); Router.refrescar(); });
        });
      }
    };
  }

  function detalle(id) {
    var m = M().multas.filter(function (x) { return x.id === id; })[0];
    if (!m) return Views.noEncontrado();
    var ciu = M().ciudadanos.filter(function (c) { return c.id === m.ciudadanoId; })[0];
    var desc = m.descargos && m.descargos.length ? m.descargos[m.descargos.length - 1] : null;
    var html = `
      <a class='enlace' href='#/admin/multas'>${Icons.r('arrow-left', 'i-16')} Volver a multas</a>
      <div class='card mt-8'>
        <div style='display:flex;align-items:center;gap:12px'>
          <span class='tinte ${tintes[m.estado] || 't-gris'}'>${Icons.r('alert-triangle', 'i-22')}</span>
          <div style='flex:1'>
            <h2 style='margin:0'>Acta ${U.escape(m.acta)}</h2>
            <p class='sub' style='margin:2px 0 0'>Infracción de demostración</p>
          </div>
          ${badgeMulta(m.estado)}
        </div>
        <div class='filas mt-16'>
          <div class='fila-datos'><span class='clave'>Fecha</span><span class='valor'>${U.fechaHora(m.fecha)}</span></div>
          <div class='fila-datos'><span class='clave'>Motivo</span><span class='valor'>${U.escape(m.motivo)}</span></div>
          <div class='fila-datos'><span class='clave'>Ubicación</span><span class='valor'>${U.escape(m.ubicacion)}</span></div>
          <div class='fila-datos'><span class='clave'>Dominio</span><span class='valor'><span class='patente'>${U.escape(m.dominio || '-')}</span></span></div>
          <div class='fila-datos'><span class='clave'>Ciudadano (demo)</span><span class='valor'><a href='#/admin/ciudadano/${m.ciudadanoId}'>${U.escape(Servicios.nombreCiudadano(m.ciudadanoId))}</a>${ciu ? ' · DNI ' + U.escape(ciu.dni) : ''}</span></div>
          <div class='fila-total'><span>Importe</span><span class='valor'>${U.money(m.importe)}</span></div>
        </div>
        ${desc ? `<div class='mt-16'><h3>Descargo presentado</h3>
          <div class='fila-datos'><span class='clave'>Número</span><span class='valor'>${U.escape(desc.numero)}</span></div>
          <div class='fila-datos'><span class='clave'>Estado</span><span class='valor'>${U.escape(desc.estado)}</span></div>
          <div class='fila-datos'><span class='clave'>Presentado</span><span class='valor'>${U.fecha(desc.fecha)}</span></div>
          <blockquote class='tl-comentario'>${U.escape(desc.texto)}</blockquote>
          ${desc.historial && desc.historial.length ? `<ol class='timeline mt-8'>${desc.historial.map(function (h, i) {
            var ultimo = i === desc.historial.length - 1;
            return `<li class='tl-item ${ultimo ? 'actual' : 'hecho'}'><span class='tl-punto'>${Icons.r('check', 'i-16')}</span><div class='tl-estado'>${U.escape(h.estado)}</div><div class='tl-fecha'>${U.fechaHora(h.fecha)}</div><div class='tl-comentario'>${U.escape(h.comentario)}</div></li>`;
          }).join('')}</ol>` : ''}
        </div>` : ''}
        <div class='alerta a-aviso mt-16'>${Icons.r('alert-triangle')}<span>Vista de consulta del personal municipal (demo). Los datos del acta son ficticios y no constituyen una sanción real.</span></div>
        <div class='fila-acciones'>
          <a class='btn btn-fantasma btn-bloque' href='#/admin/multas'>${Icons.r('arrow-left', 'i-18')} Volver al listado</a>
        </div>
      </div>`;
    return { titulo: 'Detalle de multa', html: html };
  }

  return { main: main, detalle: detalle };
})();
