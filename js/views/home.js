window.Views = window.Views || {};

Views.home = (function () {
  function resumen() {
    var st = Store.state;
    var impagas = st.obligaciones.filter(function (o) { return o.estado === 'pendiente' || o.estado === 'vencida'; });
    var total = impagas.reduce(function (a, o) { return a + Servicios.totalObligacion(o); }, 0);
    var proxima = null;
    impagas.forEach(function (o) {
      if (!proxima || U.diasHasta(o.vencimiento) < U.diasHasta(proxima.vencimiento)) proxima = o;
    });
    return { impagas: impagas, total: total, proxima: proxima };
  }

  function tarjetaCuenta() {
    var r = resumen();
    var pend = r.impagas.length;
    var estado = pend === 0
      ? `<span class='badge b-exito'>${Icons.r('check-circle')}Al día (demo)</span>`
      : `<span class='badge b-aviso'>${Icons.r('clock')}${pend} ${pend === 1 ? 'obligación pendiente' : 'obligaciones pendientes'}</span>`;
    var vencimiento = r.proxima
      ? `<div class='pc-vencimiento'>${Icons.r('calendar', 'i-16')}<span><strong>${U.escape(r.proxima.concepto)}</strong> · ${U.escape(r.proxima.periodo)}<br>${U.fecha(r.proxima.vencimiento)} · ${U.venceTexto(r.proxima.vencimiento)}</span></div>`
      : `<div class='pc-vencimiento'>${Icons.r('check-circle', 'i-16')}<span>No hay vencimientos próximos en la demo.</span></div>`;
    var opciones = [
      { href: '#/pagos', icono: 'receipt', texto: 'Ver mi deuda' },
      pend ? { href: '#/pagos/pagar/' + r.impagas[0].id, icono: 'card', texto: 'Pagar una obligación' } : { href: '#/vehiculos', icono: 'car', texto: 'Consultar patentes' },
      { href: '#/pagos/historial', icono: 'history', texto: 'Mis comprobantes' },
      { href: '#/turnos/nuevo', icono: 'calendar-check', texto: 'Pedir un turno' }
    ];
    return `
      <div class='card tarjeta-cuenta'>
        <div class='pc-cabeza'>
          <span class='pc-icono'>${Icons.r('wallet', 'i-22')}</span>
          <div><strong>Mi cuenta municipal</strong><span>Resumen de demostración</span></div>
          ${estado}
        </div>
        ${vencimiento}
        <div class='pc-opciones'>
          ${opciones.map(function (o) {
            return `<a class='pc-op' href='${o.href}'>${Icons.r(o.icono)}<span>${o.texto}</span></a>`;
          }).join('')}
        </div>
      </div>`;
  }

  var accesos = [
    { href: '#/pagos', icono: 'receipt', texto: 'Pagar impuestos' },
    { href: '#/vehiculos', icono: 'car', texto: 'Consultar patentes' },
    { href: '#/vehiculos/multas', icono: 'alert-triangle', texto: 'Ver multas' },
    { href: '#/reclamos/nuevo', icono: 'megaphone', texto: 'Hacer un reclamo' },
    { href: '#/turnos/nuevo', icono: 'calendar-check', texto: 'Pedir un turno' },
    { href: '#/mis-tramites', icono: 'clipboard', texto: 'Mis trámites' }
  ];

  var iconosActividad = { pago: 'dollar', reclamo: 'megaphone', tramite: 'clipboard', multa: 'alert-triangle', turno: 'calendar-check', consulta: 'eye', agua: 'droplets' };

  function accesoAgua() {
    var activos = Store.state.reportesAgua.filter(function (r) { return r.estado !== 'Cerrado'; }).length;
    return `
      <a class='acceso acceso-emergencia' href='#/agua/nuevo'>
        <span class='tinte t-rojo item-ico'>${Icons.r('droplets', 'i-26')}</span>
        <span style='flex:1;min-width:0'>
          <span class='item-titulo' style='display:block'>¿Estás siendo afectado por las lluvias?</span>
          <span class='item-sub' style='margin-top:2px'><span>Reportá tu situación · Alerta El Niño (demo)</span></span>
        </span>
        ${activos ? `<span class='badge b-peligro'>${activos} activo${activos === 1 ? '' : 's'}</span>` : ''}
        <span class='flecha'>${Icons.r('chevron-right')}</span>
      </a>`;
  }

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

  function itemAviso(v) {
    return `
      <article class='aviso'>
        <span class='etiqueta-demo'>${U.escape(v.categoria)} · demo</span>
        <h3>${U.escape(v.titulo)}</h3>
        <p>${U.escape(v.texto)}</p>
        <p class='mini texto-2 mt-8'>${U.fecha(v.fecha)}</p>
      </article>`;
  }

  function main() {
    var st = Store.state;
    var u = st.usuario;
    var actividad = st.actividad.slice(0, 4);
    var avisos = DEMO.catalogos.avisos;
    var html = `
      <div class='saludo'>
        <div>
          <span class='fecha'>${U.fechaLarga(U.hoyISO())}</span>
          <h1>¡Hola, ${U.escape(u.alias || u.nombre)}!</h1>
          <p class='sub'>¿Qué necesitás resolver hoy?</p>
        </div>
      </div>
      ${tarjetaCuenta()}
      <section class='seccion'>
        <div class='seccion-cabeza'><h2>Accesos rápidos</h2></div>
        <div class='accesos'>
          ${accesos.map(function (a) {
            return `<a class='acceso' href='${a.href}'><span class='tinte t-azul'>${Icons.r(a.icono, 'i-22')}</span>${a.texto}</a>`;
          }).join('')}
          ${accesoAgua()}
        </div>
      </section>
      <section class='seccion'>
        <div class='seccion-cabeza'><h2>Actividad reciente</h2><a class='enlace' href='#/notificaciones'>Notificaciones</a></div>
        <div class='lista'>
          ${actividad.length ? actividad.map(itemActividad).join('') : `<div class='card'>${UI.vacio({ icono: 'history', titulo: 'Sin actividad todavía', texto: 'Tus operaciones de demostración aparecerán acá.' })}</div>`}
        </div>
      </section>
      <section class='seccion'>
        <div class='seccion-cabeza'><h2>Avisos municipales</h2>${UI.etiquetaDemo()}</div>
        <div class='avisos-fila'>${avisos.map(itemAviso).join('')}</div>
      </section>`;
    return { titulo: 'Inicio', html: html };
  }

  return { main: main };
})();