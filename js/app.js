(function () {
  var rutas = [];

  function add(patron, fn) {
    rutas.push({ segs: patron.split('/'), fn: fn });
  }

  function encaja(ruta, segs) {
    if (ruta.length !== segs.length) return null;
    var params = {};
    for (var i = 0; i < ruta.length; i++) {
      if (ruta[i].charAt(0) === ':') params[ruta[i].slice(1)] = decodeURIComponent(segs[i]);
      else if (ruta[i] !== segs[i]) return null;
    }
    return params;
  }

  function noEncontrado() {
    return { titulo: 'No encontrada', html: UI.vacio({ icono: 'search', titulo: 'Página no encontrada', texto: 'La dirección que buscaste no existe en la demo.', accion: `<a class='btn btn-suave' href='#/inicio'>${Icons.r('home', 'i-16')} Ir al inicio</a>` }) };
  }
  Views.noEncontrado = noEncontrado;

  function marcarNav(seccion) {
    var mapa = { inicio: 'inicio', pagos: 'pagos', vehiculos: 'pagos', reclamos: 'reclamos', tramites: 'tramites', 'mis-tramites': 'tramites', turnos: 'tramites', perfil: 'perfil' };
    var clave = mapa[seccion] || '';
    document.querySelectorAll('[data-seccion]').forEach(function (a) {
      var activa = a.getAttribute('data-seccion') === clave;
      a.classList.toggle('activa', activa);
      if (activa) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  function actualizarCampana() {
    var n = Servicios.sinLeer();
    var campana = document.getElementById('campana');
    var contador = document.getElementById('contador-notif');
    if (!campana || !contador) return;
    if (!campana.innerHTML) campana.innerHTML = Icons.r('bell');
    var btnAyuda = document.getElementById('btn-ayuda');
    if (btnAyuda && !btnAyuda.innerHTML) btnAyuda.innerHTML = Icons.r('help-circle');
    if (n > 0) {
      contador.hidden = false;
      contador.textContent = n > 9 ? '9+' : String(n);
      campana.setAttribute('aria-label', 'Notificaciones: ' + n + ' sin leer');
    } else {
      contador.hidden = true;
      campana.setAttribute('aria-label', 'Notificaciones');
    }
  }

  function pintarAvatar() {
    var u = Store.state.usuario;
    var av = document.getElementById('avatar');
    if (av) {
      av.textContent = U.iniciales(u.nombre, u.apellido);
      av.setAttribute('aria-label', 'Mi perfil: ' + u.nombre + ' ' + u.apellido);
    }
  }

  function resolver() {
    var crudo = (location.hash || '').replace(/^#\/?/, '');
    var segs = crudo.split('/').filter(Boolean);
    if (!segs.length) segs = ['inicio'];

    if (!Store.state.sesion.iniciada && segs[0] !== 'login') {
      location.replace('#/login');
      return;
    }

    var hallada = null, params = null;
    rutas.forEach(function (r) {
      var p = encaja(r.segs, segs);
      if (p && !hallada) { hallada = r; params = p; }
    });

    var vista = hallada ? hallada.fn(params) : noEncontrado();
    var mainEl = document.getElementById('vista');
    mainEl.innerHTML = vista.html || '';
    document.title = (vista.titulo ? vista.titulo + ' · ' : '') + 'Las Toscas · Portal ciudadano (demo)';
    window.scrollTo(0, 0);
    mainEl.classList.remove('animar-vista');
    void mainEl.offsetWidth;
    mainEl.classList.add('animar-vista');
    mainEl.focus({ preventScroll: true });
    if (vista.after) vista.after(mainEl);
    marcarNav(segs[0]);
    actualizarCampana();
  }

  function go(ruta) {
    var destino = '#/' + ruta;
    if (location.hash === destino) resolver();
    else location.hash = destino;
  }

  function refrescar() { resolver(); }

  function construirNavegacion() {
    var items = [
      { clave: 'inicio', href: '#/inicio', icono: 'home', texto: 'Inicio' },
      { clave: 'pagos', href: '#/pagos', icono: 'wallet', texto: 'Pagos' },
      { clave: 'reclamos', href: '#/reclamos', icono: 'megaphone', texto: 'Reclamos' },
      { clave: 'tramites', href: '#/tramites', icono: 'clipboard', texto: 'Trámites' },
      { clave: 'perfil', href: '#/perfil', icono: 'user', texto: 'Perfil' }
    ];
    document.getElementById('nav-inferior').innerHTML = items.map(function (i) {
      return `<a href='${i.href}' data-seccion='${i.clave}' aria-current='${i.clave === 'inicio' ? 'page' : 'false'}'>${Icons.r(i.icono)}<span>${i.texto}</span></a>`;
    }).join('');

    var laterales = [
      { clave: 'inicio', href: '#/inicio', icono: 'home', texto: 'Inicio' },
      { clave: 'pagos', href: '#/pagos', icono: 'wallet', texto: 'Pagos e impuestos' },
      { clave: '', href: '#/vehiculos', icono: 'car', texto: 'Vehículos y multas' },
      { clave: 'reclamos', href: '#/reclamos', icono: 'megaphone', texto: 'Reclamos' },
      { clave: 'tramites', href: '#/tramites', icono: 'clipboard', texto: 'Trámites y turnos' },
      { clave: 'perfil', href: '#/perfil', icono: 'user', texto: 'Mi perfil' },
      { sep: true },
      { clave: '', href: '#/notificaciones', icono: 'bell', texto: 'Notificaciones' },
      { clave: '', href: '#/ayuda', icono: 'help-circle', texto: 'Ayuda y contacto' }
    ];
    document.getElementById('nav-lateral').innerHTML = laterales.map(function (i) {
      if (i.sep) return '<div class=\'sep\' role=\'separator\'></div>';
      return `<a href='${i.href}' data-seccion='${i.clave}'>${Icons.r(i.icono)}<span>${i.texto}</span></a>`;
    }).join('');
  }

  function registrarRutas() {
    add('inicio', function () { return Views.home.main(); });
    add('pagos', function () { return Views.pagos.main(); });
    add('pagos/historial', function () { Views.pagos.irAHistorial(); return Views.pagos.main(); });
    add('pagos/detalle/:id', function (p) { return Views.pagos.detalle(p.id); });
    add('pagos/pagar/:id', function (p) { return Views.pagos.pagar(p.id); });
    add('pagos/comprobante/:id', function (p) { return Views.pagos.comprobante(p.id); });
    add('vehiculos', function () { return Views.vehiculos.main(); });
    add('vehiculos/multas', function () { return Views.vehiculos.multas(); });
    add('vehiculos/multa/:id', function (p) { return Views.vehiculos.multa(p.id); });
    add('reclamos', function () { return Views.reclamos.main(); });
    add('reclamos/nuevo', function () { return Views.reclamos.nuevo(); });
    add('reclamos/detalle/:id', function (p) { return Views.reclamos.detalle(p.id); });
    add('tramites', function () { return Views.tramites.main(); });
    add('tramites/detalle/:id', function (p) { return Views.tramites.detalle(p.id); });
    add('tramites/solicitar/:id', function (p) { return Views.tramites.solicitar(p.id); });
    add('mis-tramites', function () { return Views.tramites.misTramites(); });
    add('mis-tramites/:id', function (p) { return Views.tramites.misTramiteDetalle(p.id); });
    add('turnos', function () { return Views.turnos.misTurnos(); });
    add('turnos/nuevo', function () { return Views.turnos.nuevo(); });
    add('perfil', function () { return Views.perfil.main(); });
    add('perfil/editar', function () { return Views.perfil.editar(); });
    add('notificaciones', function () { return Views.notificaciones.main(); });
    add('ayuda', function () { return Views.ayuda.main(); });
    add('login', function () { return Views.perfil.login(); });
  }

  function boot() {
    Store.init();
    construirNavegacion();
    registrarRutas();
    pintarAvatar();
    window.addEventListener('hashchange', resolver);
    if (!location.hash) location.replace('#/inicio');
    resolver();
  }

  window.Router = { add: add, go: go, refrescar: refrescar, resolver: resolver, boot: boot };
  window.App = { actualizarCampana: actualizarCampana, pintarAvatar: pintarAvatar };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();