window.Views = window.Views || {};

Views.notificaciones = (function () {
  var filtro = 'todas';

  var grupos = {
    todas: 'Todas',
    vencimiento: 'Vencimientos',
    pago: 'Pagos',
    reclamo: 'Reclamos',
    agua: 'Alertas por lluvias',
    tramite: 'Trámites',
    turno: 'Turnos',
    comunicado: 'Comunicados'
  };

  function iconoTipo(tipo) {
    var mapa = { vencimiento: 'clock', pago: 'dollar', reclamo: 'megaphone', tramite: 'clipboard', turno: 'calendar-check', comunicado: 'megaphone', multa: 'alert-triangle', agua: 'droplets' };
    return mapa[tipo] || 'bell';
  }

  function main() {
    var lista = Store.state.notificaciones.filter(function (n) { return filtro === 'todas' || n.tipo === filtro; });
    var sinLeer = Servicios.sinLeer();
    var chips = Object.keys(grupos).map(function (k) {
      return `<button type='button' class='chip ${filtro === k ? 'activa' : ''}' data-filtro='${k}'>${grupos[k]}</button>`;
    }).join('');
    var html = `
      <div class='saludo'>
        <div>
          <h1>Notificaciones</h1>
          <p class='sub'>${sinLeer ? sinLeer + ' sin leer' : 'Estás al día'} · datos de demostración</p>
        </div>
        ${sinLeer ? `<button type='button' class='btn btn-suave btn-sm' id='nt-todas'>${Icons.r('check', 'i-14')} Marcar leídas</button>` : ''}
      </div>
      <div class='chips' role='group' aria-label='Filtrar notificaciones'>${chips}</div>
      ${lista.length ? `<div class='lista mt-16'>${lista.map(function (n) {
        return `
        <button type='button' class='item' data-notif='${n.id}' data-ref='${n.ref || ''}' style='text-align:left;width:100%'>
          <span class='tinte ${n.leida ? 't-gris' : 't-azul'} item-ico'>${Icons.r(iconoTipo(n.tipo))}</span>
          <span class='item-cuerpo'>
            <span class='item-titulo'>${U.escape(n.titulo)}</span>
            <span class='item-sub' style='display:block'><span style='display:block'>${U.escape(n.mensaje)}</span></span>
            <span class='item-sub'><span>${U.hace(n.fecha)}</span>${n.leida ? '' : '<span class="negrita" style="color:var(--c-primario)">Nueva</span>'}</span>
          </span>
          ${n.leida ? '' : `<span class='badge b-info'>No leída</span>`}
        </button>`;
      }).join('')}</div>` : UI.vacio({ icono: 'bell', titulo: 'No hay notificaciones', texto: filtro === 'todas' ? 'Cuando ocurra algo en la demo, te avisamos acá.' : 'No hay novedades de esta categoría.' })}`;
    return {
      titulo: 'Notificaciones',
      html: html,
      after: function (raiz) {
        raiz.querySelectorAll('[data-filtro]').forEach(function (b) {
          b.addEventListener('click', function () { filtro = b.getAttribute('data-filtro'); Router.refrescar(); });
        });
        var todas = raiz.querySelector('#nt-todas');
        if (todas) todas.addEventListener('click', function () {
          Servicios.marcarTodasLeidas();
          UI.toast('Notificaciones marcadas como leídas.', 'exito');
          Router.refrescar();
        });
        raiz.querySelectorAll('[data-notif]').forEach(function (b) {
          b.addEventListener('click', function () {
            Servicios.marcarLeida(b.getAttribute('data-notif'));
            var ref = b.getAttribute('data-ref');
            if (ref) Router.go(ref); else Router.refrescar();
          });
        });
      }
    };
  }

  return { main: main };
})();