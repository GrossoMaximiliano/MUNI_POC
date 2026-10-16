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

  function esAdmin() {
    var s = Store.state.sesion;
    return !!(s && s.iniciada && s.rol === 'admin');
  }

  function noEncontrado() {
    var admin = esAdmin();
    return { titulo: 'No encontrada', html: UI.vacio({ icono: 'search', titulo: 'Página no encontrada', texto: 'La dirección que buscaste no existe en la demo.', accion: `<a class='btn btn-suave' href='${admin ? '#/admin' : '#/inicio'}'>${Icons.r(admin ? 'dashboard' : 'home', 'i-16')} ${admin ? 'Ir al panel' : 'Ir al inicio'}</a>` }) };
  }
  Views.noEncontrado = noEncontrado;

  function marcarNav(segs) {
    var clave = '';
    if (esAdmin()) {
      clave = segs[0] === 'perfil' ? 'perfil' : (segs[1] || 'admin');
    } else {
      var mapa = { inicio: 'inicio', pagos: 'pagos', vehiculos: 'pagos', reclamos: 'reclamos', tramites: 'tramites', 'mis-tramites': 'tramites', turnos: 'tramites', perfil: 'perfil' };
      clave = mapa[segs[0]] || '';
    }
    document.querySelectorAll('[data-seccion]').forEach(function (a) {
      var activa = a.getAttribute('data-seccion') === clave;
      a.classList.toggle('activa', activa);
      if (activa) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  function actualizarCampana() {
    var admin = esAdmin();
    var campana = document.getElementById('campana');
    var contador = document.getElementById('contador-notif');
    var btnAyuda = document.getElementById('btn-ayuda');
    if (btnAyuda) {
      if (!btnAyuda.querySelector('svg')) btnAyuda.innerHTML = Icons.r('help-circle');
      btnAyuda.hidden = admin;
    }
    if (!campana || !contador) return;
    if (!campana.querySelector('svg')) campana.insertAdjacentHTML('afterbegin', Icons.r('bell'));
    campana.hidden = admin;
    if (admin) { contador.hidden = true; return; }
    var n = Servicios.sinLeer();
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
    var s = Store.state.sesion;
    var u = s && s.iniciada ? s : Store.state.usuario;
    var av = document.getElementById('avatar');
    if (av) {
      av.textContent = U.iniciales(u.nombre, u.apellido);
      av.setAttribute('aria-label', 'Mi perfil: ' + u.nombre + ' ' + u.apellido);
    }
  }

  function actualizarCabecera() {
    var sub = document.querySelector('.cabecera-titulo span');
    if (sub) sub.textContent = esAdmin() ? 'Panel de gestión · demo' : 'Portal ciudadano · demo';
  }

  function refrescarSesion() {
    construirNavegacion();
    actualizarCabecera();
    pintarAvatar();
    actualizarCampana();
  }

  function resolver() {
    var crudo = (location.hash || '').replace(/^#\/?/, '');
    var segs = crudo.split('/').filter(Boolean);
    if (!segs.length) segs = ['inicio'];

    var s = Store.state.sesion;
    var publica = segs[0] === 'login' || segs[0] === 'registro';

    if (!s.iniciada && !publica) {
      location.replace('#/login');
      return;
    }
    if (s.iniciada && publica) {
      location.replace(s.rol === 'admin' ? '#/admin' : '#/inicio');
      return;
    }
    if (s.iniciada && s.rol === 'admin' && segs[0] !== 'admin' && segs.join('/') !== 'perfil') {
      location.replace('#/admin');
      return;
    }
    if (s.iniciada && s.rol === 'ciudadano' && segs[0] === 'admin') {
      UI.toast('El panel de administración es sólo para el personal municipal (demo).', 'error', 4200);
      location.replace('#/inicio');
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
    marcarNav(segs);
    actualizarCampana();
  }

  function go(ruta) {
    var destino = '#/' + ruta;
    if (location.hash === destino) resolver();
    else location.hash = destino;
  }

  function refrescar() { resolver(); }

  function construirNavegacion() {
    var items, laterales;
    if (esAdmin()) {
      items = [
        { clave: 'admin', href: '#/admin', icono: 'dashboard', texto: 'Panel' },
        { clave: 'multas', href: '#/admin/multas', icono: 'alert-triangle', texto: 'Multas' },
        { clave: 'reclamos', href: '#/admin/reclamos', icono: 'megaphone', texto: 'Reclamos' },
        { clave: 'tramites', href: '#/admin/tramites', icono: 'clipboard', texto: 'Trámites' },
        { clave: 'ciudadanos', href: '#/admin/ciudadanos', icono: 'users', texto: 'Ciudadanos' }
      ];
      laterales = [
        { clave: 'admin', href: '#/admin', icono: 'dashboard', texto: 'Panel municipal' },
        { clave: 'multas', href: '#/admin/multas', icono: 'alert-triangle', texto: 'Multas e infracciones' },
        { clave: 'reclamos', href: '#/admin/reclamos', icono: 'megaphone', texto: 'Reclamos' },
        { clave: 'tramites', href: '#/admin/tramites', icono: 'clipboard', texto: 'Trámites' },
        { clave: 'ciudadanos', href: '#/admin/ciudadanos', icono: 'users', texto: 'Ciudadanos' },
        { sep: true },
        { clave: 'perfil', href: '#/perfil', icono: 'user', texto: 'Mi perfil' }
      ];
    } else {
      items = [
        { clave: 'inicio', href: '#/inicio', icono: 'home', texto: 'Inicio' },
        { clave: 'pagos', href: '#/pagos', icono: 'wallet', texto: 'Pagos' },
        { clave: 'reclamos', href: '#/reclamos', icono: 'megaphone', texto: 'Reclamos' },
        { clave: 'tramites', href: '#/tramites', icono: 'clipboard', texto: 'Trámites' },
        { clave: 'perfil', href: '#/perfil', icono: 'user', texto: 'Perfil' }
      ];
      laterales = [
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
    }
    document.getElementById('nav-inferior').innerHTML = items.map(function (i) {
      return `<a href='${i.href}' data-seccion='${i.clave}' aria-current='${i.clave === 'inicio' ? 'page' : 'false'}'>${Icons.r(i.icono)}<span>${i.texto}</span></a>`;
    }).join('');

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
    add('login', function () { return Views.login.main(); });
    add('registro', function () { return Views.login.registro(); });
    add('admin', function () { return Views.adminDashboard.main(); });
    add('admin/multas', function () { return Views.adminMultas.main(); });
    add('admin/multa/:id', function (p) { return Views.adminMultas.detalle(p.id); });
    add('admin/reclamos', function () { return Views.adminReclamos.main(); });
    add('admin/reclamo/:id', function (p) { return Views.adminReclamos.detalle(p.id); });
    add('admin/tramites', function () { return Views.adminTramites.main(); });
    add('admin/tramite/:id', function (p) { return Views.adminTramites.detalle(p.id); });
    add('admin/ciudadanos', function () { return Views.adminCiudadanos.main(); });
    add('admin/ciudadano/:id', function (p) { return Views.adminCiudadanos.detalle(p.id); });
  }

  function boot() {
    Store.init();
    registrarRutas();
    refrescarSesion();
    window.addEventListener('hashchange', resolver);
    if (!location.hash) location.replace('#/inicio');
    resolver();
  }

  window.Router = { add: add, go: go, refrescar: refrescar, resolver: resolver, boot: boot };
  window.App = { actualizarCampana: actualizarCampana, pintarAvatar: pintarAvatar, actualizarCabecera: actualizarCabecera, refrescarSesion: refrescarSesion };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();