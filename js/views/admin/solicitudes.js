window.Views = window.Views || {};

Views.adminSolicitudes = (function () {
  var q = '';
  var estado = 'todas';

  function lista() { return Store.state.solicitudesServicios || []; }

  var badges = {
    'Pendiente': { clase: 'b-aviso', icono: 'clock' },
    'Programada': { clase: 'b-info', icono: 'calendar-check' },
    'Finalizada': { clase: 'b-exito', icono: 'check-circle' }
  };

  function badgeEstado(e) {
    var d = badges[e] || { clase: 'b-neutra', icono: 'info' };
    return `<span class='badge ${d.clase}'>${Icons.r(d.icono)}${U.escape(e)}</span>`;
  }

  function listaFiltrada() {
    var texto = q.trim().toLowerCase();
    return lista().filter(function (s) {
      var okEstado = estado === 'todas' || s.estado === estado;
      var haystack = (s.numero + ' ' + s.tipo + ' ' + s.direccion + ' ' + (s.ciudadanoNombre || '') + ' ' + (s.observaciones || '')).toLowerCase();
      return okEstado && (!texto || haystack.indexOf(texto) >= 0);
    }).sort(function (a, b) { return new Date(b.fechaSolicitud) - new Date(a.fechaSolicitud); });
  }

  function itemSolicitud(s) {
    return `
      <a class='item' href='#/admin/solicitud/${s.id}'>
        <span class='tinte t-azul item-ico'>${Icons.r('wrench')}</span>
        <span class='item-cuerpo'>
          <span class='item-titulo'>${U.escape(s.tipo)}</span>
          <span class='item-sub'><span>${U.escape(s.numero)}</span><span>${U.fecha(s.fechaSolicitud)}</span><span>${U.escape(s.direccion)}</span></span>
          <span class='item-sub'><span>${U.escape(s.ciudadanoNombre || 'Ciudadano (demo)')}</span></span>
        </span>
        <span class='item-derecha'>${badgeEstado(s.estado)}</span>
        <span class='flecha'>${Icons.r('chevron-right')}</span>
      </a>`;
  }

  function listaHtml() {
    var l = listaFiltrada();
    if (!l.length) return UI.vacio({ icono: 'search', titulo: 'Sin solicitudes con estos filtros', texto: 'Probá cambiar el estado o el texto de búsqueda.' });
    return `<div class='lista'>${l.map(itemSolicitud).join('')}</div>`;
  }

  function chipsEstados() {
    var estados = [['todas', 'Todas']].concat(DEMO.catalogos.solicitudEstados.map(function (e) { return [e, e]; }));
    return `<div class='chips' role='group' aria-label='Filtrar por estado'>${estados.map(function (e) {
      return `<button type='button' class='chip ${estado === e[0] ? 'activa' : ''}' data-estado='${U.escape(e[0])}'>${U.escape(e[1])}</button>`;
    }).join('')}</div>`;
  }

  function main() {
    var total = lista().length;
    var pendientes = lista().filter(function (s) { return s.estado === 'Pendiente'; }).length;
    var html = `
      <h1>Solicitudes de servicios</h1>
      <p class='sub'>Solicitudes de servicios municipales enviadas por los vecinos desde el portal ciudadano. ${total} solicitudes de demostración · ${pendientes} pendientes.</p>
      <div class='buscador mt-16'>
        ${Icons.r('search')}
        <input id='as-buscar' class='control' type='search' value='${U.escape(q)}' placeholder='Buscar por número, servicio, dirección o ciudadano…' aria-label='Buscar solicitud'>
      </div>
      ${chipsEstados()}
      <div id='as-lista'>${listaHtml()}</div>`;
    return {
      titulo: 'Solicitudes',
      html: html,
      after: function (raiz) {
        var input = raiz.querySelector('#as-buscar');
        if (input) input.addEventListener('input', function () {
          q = input.value;
          var zona = raiz.querySelector('#as-lista');
          if (zona) zona.innerHTML = listaHtml();
        });
        raiz.querySelectorAll('[data-estado]').forEach(function (b) {
          b.addEventListener('click', function () { estado = b.getAttribute('data-estado'); Router.refrescar(); });
        });
      }
    };
  }

  function detalle(id) {
    var s = lista().filter(function (x) { return x.id === id; })[0];
    if (!s) return Views.noEncontrado();
    var puedeAvanzar = s.estado !== 'Finalizada';
    var html = `
      <a class='enlace' href='#/admin/solicitudes'>${Icons.r('arrow-left', 'i-16')} Volver a solicitudes</a>
      <div class='card mt-8'>
        <div style='display:flex;align-items:center;gap:12px'>
          <span class='tinte t-azul'>${Icons.r('wrench', 'i-22')}</span>
          <div style='flex:1'>
            <h2 style='margin:0'>${U.escape(s.numero)}</h2>
            <p class='sub' style='margin:2px 0 0'>Solicitud de servicio municipal (demo)</p>
          </div>
          ${badgeEstado(s.estado)}
        </div>
        <div class='filas mt-16'>
          <div class='fila-datos'><span class='clave'>Servicio solicitado</span><span class='valor'>${U.escape(s.tipo)}</span></div>
          <div class='fila-datos'><span class='clave'>Ciudadano</span><span class='valor'>${U.escape(s.ciudadanoNombre || 'Ciudadano (demo)')}</span></div>
          <div class='fila-datos'><span class='clave'>Correo de contacto</span><span class='valor'>${U.escape(s.ciudadanoEmail || '-')}</span></div>
          <div class='fila-datos'><span class='clave'>Teléfono</span><span class='valor'>${U.escape(s.telefono || '-')}</span></div>
          <div class='fila-datos'><span class='clave'>Dirección</span><span class='valor'>${U.escape(s.direccion)}</span></div>
          <div class='fila-datos'><span class='clave'>Fecha preferida</span><span class='valor'>${U.fecha(s.fechaPreferida)}</span></div>
          <div class='fila-datos'><span class='clave'>Fecha de solicitud</span><span class='valor'>${U.fechaHora(s.fechaSolicitud)}</span></div>
          ${s.observaciones ? `<div class='fila-datos'><span class='clave'>Observaciones del vecino</span><span class='valor'>${U.escape(s.observaciones)}</span></div>` : ''}
        </div>
        <div class='alerta a-info mt-16'>${Icons.r('info')}<span>El avance de estado se guarda sólo en este navegador (demo). En la integración real sería PATCH /admin/solicitudes/:id.</span></div>
        <div class='fila-acciones'>
          ${puedeAvanzar ? `<button type='button' class='btn btn-primario btn-bloque' id='asl-avanzar'>${Icons.r('chevron-right', 'i-18')} Avanzar estado</button>` : `<a class='btn btn-fantasma btn-bloque' href='#/admin/solicitudes'>${Icons.r('arrow-left', 'i-18')} Volver al listado</a>`}
        </div>
      </div>`;
    return {
      titulo: 'Solicitud ' + s.numero,
      html: html,
      after: function (raiz) {
        var btn = raiz.querySelector('#asl-avanzar');
        if (btn) btn.addEventListener('click', function () {
          UI.confirmar({
            titulo: 'Avanzar estado de la solicitud',
            mensaje: 'La solicitud ' + s.numero + ' pasará al siguiente estado dentro de la demo. ¿Continuar?',
            textoConfirmar: 'Avanzar'
          }).then(function (ok) {
            if (!ok) return;
            var nuevo = Servicios.avanzarSolicitudMunicipal(s.id);
            if (nuevo) { UI.toast('La solicitud pasó a: ' + nuevo + ' (demo).', 'exito'); Router.refrescar(); }
          });
        });
      }
    };
  }

  return { main: main, detalle: detalle };
})();