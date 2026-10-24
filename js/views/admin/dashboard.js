window.Views = window.Views || {};

Views.adminDashboard = (function () {
  function kpi(tinte, icono, num, eti) {
    return `
      <div class='kpi'>
        <span class='tinte ${tinte}'>${Icons.r(icono, 'i-22')}</span>
        <span class='kpi-num'>${num}</span>
        <span class='kpi-eti'>${eti}</span>
      </div>`;
  }

  function actividad() {
    var m = Store.state.municipal;
    var items = [];
    m.reclamos.forEach(function (r) { items.push({ tipo: 'reclamo', titulo: r.numero + ' · ' + r.titulo, estado: r.estado, ref: 'admin/reclamo/' + r.id, fecha: r.fecha }); });
    m.tramites.forEach(function (t) { items.push({ tipo: 'tramite', titulo: t.numero + ' · ' + t.nombre, estado: t.estado, ref: 'admin/tramite/' + t.id, fecha: t.fecha }); });
    m.multas.forEach(function (x) { items.push({ tipo: 'multa', titulo: 'Acta ' + x.acta + ' · ' + Servicios.nombreCiudadano(x.ciudadanoId), estado: x.estado === 'pagada' ? 'Pagada' : (x.estado === 'vencida' ? 'Vencida' : (x.estado === 'en_descargo' ? 'En descargo' : 'Pendiente')), ref: 'admin/multa/' + x.id, fecha: x.fecha }); });
    items.sort(function (a, b) { return new Date(b.fecha) - new Date(a.fecha); });
    return items.slice(0, 4);
  }

  var iconosActividad = { reclamo: 'megaphone', tramite: 'clipboard', multa: 'alert-triangle' };

  function itemActividad(a) {
    return `
      <a class='item' href='#/${a.ref}'>
        <span class='tinte t-gris item-ico'>${Icons.r(iconosActividad[a.tipo] || 'history')}</span>
        <span class='item-cuerpo'>
          <span class='item-titulo'>${U.escape(a.titulo)}</span>
          <span class='item-sub'><span>${U.hace(a.fecha)}</span><span>${U.escape(a.estado)}</span></span>
        </span>
        <span class='flecha'>${Icons.r('chevron-right')}</span>
      </a>`;
  }

  function main() {
    var r = Servicios.resumenMunicipal();
    var s = Store.state.sesion;
    var html = `
      <div class='saludo'>
        <div>
          <span class='fecha'>${U.fechaLarga(U.hoyISO())}</span>
          <h1>Panel municipal</h1>
          <p class='sub'>Gestión de demostración · hola, ${U.escape(s.alias || s.nombre)} · datos ficticios.</p>
        </div>
        <span class='badge b-neutra'>${Icons.r('shield-check')}Personal municipal</span>
      </div>

      <div class='card tarjeta-cuenta'>
        <div class='pc-cabeza'>
          <span class='pc-icono'>${Icons.r('bar-chart', 'i-22')}</span>
          <div><strong>Resumen municipal</strong><span>Multas e impuestos de demostración</span></div>
          <span class='badge b-aviso'>${Icons.r('alert-triangle')}${r.impuestos.vencidas + r.multas.vencidas} vencidas</span>
        </div>
        <div class='pc-vencimiento'>${Icons.r('dollar', 'i-16')}<span><strong>Recaudación simulada: ${U.money(r.recaudado)}</strong><br>${r.impuestos.pagadas + r.multas.pagadas} operaciones pagadas dentro de la demo (multas + impuestos).</span></div>
        <div class='pc-opciones'>
          <a class='pc-op' href='#/admin/multas'>${Icons.r('alert-triangle')}<span>Multas</span></a>
          <a class='pc-op' href='#/admin/reclamos'>${Icons.r('megaphone')}<span>Reclamos</span></a>
          <a class='pc-op' href='#/admin/tramites'>${Icons.r('clipboard')}<span>Trámites</span></a>
          <a class='pc-op' href='#/admin/ciudadanos'>${Icons.r('users')}<span>Ciudadanos</span></a>
        </div>
      </div>

      <section class='seccion'>
        <div class='seccion-cabeza'><h2>Multas (demo)</h2><a class='enlace' href='#/admin/multas'>Ver todas</a></div>
        <div class='kpi-grid'>
          ${kpi('t-ambar', 'clock', r.multas.pendientes, 'Pendientes')}
          ${kpi('t-rojo', 'alert-triangle', r.multas.vencidas, 'Vencidas')}
          ${kpi('t-verde', 'check-circle', r.multas.pagadas, 'Pagadas')}
          ${kpi('t-azul', 'shield-check', r.multas.descargos, 'En descargo')}
        </div>
      </section>

      <section class='seccion'>
        <div class='seccion-cabeza'><h2>Impuestos y tasas (demo)</h2><a class='enlace' href='#/admin/ciudadanos'>Ver ciudadanos</a></div>
        <div class='kpi-grid'>
          ${kpi('t-ambar', 'clock', r.impuestos.pendientes, 'Pendientes')}
          ${kpi('t-rojo', 'alert-triangle', r.impuestos.vencidas, 'Vencidas')}
          ${kpi('t-verde', 'check-circle', r.impuestos.pagadas, 'Pagadas')}
          ${kpi('t-azul', 'refresh', r.impuestos.proceso, 'En proceso')}
        </div>
        <div class='card mt-8'>
          <div class='fila-datos'><span class='clave'>Deuda pendiente de cobro (multas + impuestos, demo)</span><span class='valor'>${U.money(r.impuestos.deuda)}</span></div>
          <div class='fila-datos'><span class='clave'>Obligaciones registradas</span><span class='valor'>${r.impuestos.total} · ${r.multas.total} multas</span></div>
        </div>
      </section>

      <section class='seccion'>
        <div class='seccion-cabeza'><h2>Atención ciudadana</h2>${UI.etiquetaDemo()}</div>
        <div class='kpi-grid'>
          ${kpi('t-ambar', 'megaphone', r.reclamos.abiertos, 'Reclamos abiertos')}
          ${kpi('t-azul', 'clipboard', r.tramites.enCurso, 'Trámites en curso')}
          ${kpi('t-verde', 'user-check', r.ciudadanos.activos, 'Ciudadanos activos')}
          ${kpi('t-rojo', 'user-x', r.ciudadanos.bloqueados, 'Bloqueados')}
        </div>
      </section>

      <section class='seccion'>
        <div class='seccion-cabeza'><h2>Actividad municipal reciente</h2></div>
        <div class='lista'>
          ${actividad().map(itemActividad).join('')}
        </div>
      </section>`;
    return { titulo: 'Panel municipal', html: html };
  }

  return { main: main };
})();
