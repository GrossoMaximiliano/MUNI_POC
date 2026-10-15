window.Views = window.Views || {};

Views.adminCiudadanos = (function () {
  var q = '';
  var estado = 'todos';

  function M() { return Store.state.municipal; }

  function badgeEstado(e) {
    var d = DEMO.catalogos.estadosCiudadano[e] || { texto: e, clase: 'b-neutra', icono: 'user' };
    return `<span class='badge ${d.clase}'>${Icons.r(d.icono)}${d.texto}</span>`;
  }

  function deudaCiudadano(id) {
    var obs = M().obligaciones.filter(function (o) { return o.ciudadanoId === id && o.estado !== 'pagada'; });
    return obs.reduce(function (a, o) { return a + (o.importe || 0) + (o.intereses || 0); }, 0);
  }

  function listaFiltrada() {
    var texto = q.trim().toLowerCase();
    return M().ciudadanos.filter(function (c) {
      var okEstado = estado === 'todos' || c.estado === estado;
      var haystack = (c.nombre + ' ' + c.apellido + ' ' + c.dni + ' ' + c.email + ' ' + c.barrio).toLowerCase();
      return okEstado && (!texto || haystack.indexOf(texto) >= 0);
    }).sort(function (a, b) { return a.apellido.localeCompare(b.apellido, 'es'); });
  }

  function itemCiudadano(c) {
    return `
      <a class='item' href='#/admin/ciudadano/${c.id}'>
        <span class='avatar item-ico'>${U.escape(U.iniciales(c.nombre, c.apellido))}</span>
        <span class='item-cuerpo'>
          <span class='item-titulo'>${U.escape(c.nombre + ' ' + c.apellido)}</span>
          <span class='item-sub'><span>DNI ${U.escape(c.dni)}</span><span>${U.escape(c.email)}</span><span>${U.escape(c.barrio)}</span></span>
        </span>
        <span class='item-derecha'>
          ${deudaCiudadano(c.id) ? `<span class='badge b-aviso'>${Icons.r('dollar')}Deuda ${U.money(deudaCiudadano(c.id))}</span>` : `<span class='badge b-exito'>${Icons.r('check-circle')}Sin deuda</span>`}
          ${badgeEstado(c.estado)}
        </span>
        <span class='flecha'>${Icons.r('chevron-right')}</span>
      </a>`;
  }

  function listaHtml() {
    var lista = listaFiltrada();
    if (!lista.length) return UI.vacio({ icono: 'search', titulo: 'Sin ciudadanos con estos filtros', texto: 'Probá cambiar el estado o el texto de búsqueda.' });
    return `<div class='lista'>${lista.map(itemCiudadano).join('')}</div>`;
  }

  function chipsEstados() {
    var estados = [['todos', 'Todos'], ['activo', 'Activos'], ['bloqueado', 'Bloqueados']];
    return `<div class='chips' role='group' aria-label='Filtrar por estado'>${estados.map(function (e) {
      return `<button type='button' class='chip ${estado === e[0] ? 'activa' : ''}' data-estado='${e[0]}'>${e[1]}</button>`;
    }).join('')}</div>`;
  }

  function main() {
    var total = M().ciudadanos.length;
    var html = `
      <h1>Ciudadanos</h1>
      <p class='sub'>Padrón de ciudadanos registrados en la demo. ${total} cuentas ficticias.</p>
      <div class='buscador mt-16'>
        ${Icons.r('search')}
        <input id='ac-buscar' class='control' type='search' value='${U.escape(q)}' placeholder='Buscar por nombre, DNI, correo o barrio…' aria-label='Buscar ciudadano'>
      </div>
      ${chipsEstados()}
      <div id='ac-lista'>${listaHtml()}</div>`;
    return {
      titulo: 'Ciudadanos',
      html: html,
      after: function (raiz) {
        var input = raiz.querySelector('#ac-buscar');
        if (input) input.addEventListener('input', function () {
          q = input.value;
          var zona = raiz.querySelector('#ac-lista');
          if (zona) zona.innerHTML = listaHtml();
        });
        raiz.querySelectorAll('[data-estado]').forEach(function (b) {
          b.addEventListener('click', function () { estado = b.getAttribute('data-estado'); Router.refrescar(); });
        });
      }
    };
  }

  function detalle(id) {
    var c = M().ciudadanos.filter(function (x) { return x.id === id; })[0];
    if (!c) return Views.noEncontrado();
    var obs = M().obligaciones.filter(function (o) { return o.ciudadanoId === c.id; });
    var multas = M().multas.filter(function (m) { return m.ciudadanoId === c.id; });
    var reclamos = M().reclamos.filter(function (r) { return r.ciudadanoId === c.id; });
    var deuda = obs.filter(function (o) { return o.estado !== 'pagada'; }).reduce(function (a, o) { return a + (o.importe || 0) + (o.intereses || 0); }, 0);
    var vencidas = obs.filter(function (o) { return o.estado === 'vencida'; }).length;
    var bloqueado = c.estado === 'bloqueado';
    var html = `
      <a class='enlace' href='#/admin/ciudadanos'>${Icons.r('arrow-left', 'i-16')} Volver a ciudadanos</a>
      <div class='card mt-8'>
        <div style='display:flex;align-items:center;gap:14px'>
          <span class='avatar avatar-lg'>${U.escape(U.iniciales(c.nombre, c.apellido))}</span>
          <div style='flex:1'>
            <h2 style='margin:0'>${U.escape(c.nombre + ' ' + c.apellido)}</h2>
            <p class='sub' style='margin:2px 0 0'>Ciudadano de demostración · ${U.escape(c.barrio)}</p>
          </div>
          ${badgeEstado(c.estado)}
        </div>
        <div class='filas mt-16'>
          <div class='fila-datos'><span class='clave'>DNI (demo)</span><span class='valor'>${U.escape(c.dni)}</span></div>
          <div class='fila-datos'><span class='clave'>Correo</span><span class='valor'>${U.escape(c.email)}</span></div>
          <div class='fila-datos'><span class='clave'>Teléfono</span><span class='valor'>${U.escape(c.telefono)}</span></div>
          <div class='fila-datos'><span class='clave'>Domicilio</span><span class='valor'>${U.escape(c.domicilio)}</span></div>
          <div class='fila-datos'><span class='clave'>Alta en el padrón</span><span class='valor'>${U.fecha(c.fechaAlta)}</span></div>
        </div>
        <div class='alerta a-info mt-8'>${Icons.r('id-card')}<span>El bloqueo es simulado: se guarda sólo en este navegador (demo). En la integración real sería PATCH /admin/ciudadanos/:id.</span></div>
        <div class='fila-acciones'>
          <button type='button' class='btn ${bloqueado ? 'btn-primario' : 'btn-peligro'} btn-bloque' id='ac-cambiar'>${bloqueado ? Icons.r('user-check', 'i-18') + ' Reactivar ciudadano' : Icons.r('user-x', 'i-18') + ' Bloquear ciudadano'}</button>
        </div>
      </div>

      <section class='seccion'>
        <div class='seccion-cabeza'><h2>Impuestos y deuda (demo)</h2>${UI.etiquetaDemo()}</div>
        <div class='card'>
          <div class='fila-datos'><span class='clave'>Obligaciones registradas</span><span class='valor'>${obs.length}</span></div>
          <div class='fila-datos'><span class='clave'>Vencidas</span><span class='valor'>${vencidas}</span></div>
          <div class='fila-total'><span>Deuda pendiente</span><span class='valor'>${U.money(deuda)}</span></div>
          ${obs.length ? `<hr class='sep-suave'>${obs.map(function (o) {
            return `<div class='fila-datos'><span class='clave'>${U.escape(o.concepto)} · ${U.escape(o.periodo)}</span><span class='valor'>${UI.badgeEstadoObligacion(o.estado)}</span></div>`;
          }).join('')}` : '<p class="sub">Sin obligaciones registradas.</p>'}
        </div>
      </section>

      <section class='seccion'>
        <div class='seccion-cabeza'><h2>Multas (demo)</h2></div>
        <div class='card'>
          ${multas.length ? multas.map(function (m) {
            return `<div class='fila-datos'><span class='clave'><a href='#/admin/multa/${m.id}'>Acta ${U.escape(m.acta)}</a> · ${U.escape(m.motivo)}</span><span class='valor'>${U.money(m.importe)}</span></div>`;
          }).join('') : '<p class="sub">Sin multas registradas.</p>'}
        </div>
      </section>

      <section class='seccion'>
        <div class='seccion-cabeza'><h2>Reclamos (demo)</h2></div>
        <div class='card'>
          ${reclamos.length ? reclamos.map(function (r) {
            return `<div class='fila-datos'><span class='clave'><a href='#/admin/reclamo/${r.id}'>${r.numero}</a> · ${U.escape(r.titulo)}</span><span class='valor'>${U.escape(r.estado)}</span></div>`;
          }).join('') : '<p class="sub">Sin reclamos registrados.</p>'}
        </div>
      </section>`;
    return {
      titulo: 'Ciudadano',
      html: html,
      after: function (raiz) {
        var btn = raiz.querySelector('#ac-cambiar');
        if (btn) btn.addEventListener('click', function () {
          var bloquear = c.estado === 'activo';
          UI.confirmar({
            titulo: bloquear ? 'Bloquear ciudadano' : 'Reactivar ciudadano',
            mensaje: bloquear ? 'Se bloqueará el acceso de ' + c.nombre + ' ' + c.apellido + ' dentro de la demo. ¿Continuar?' : 'Se reactivará el acceso de ' + c.nombre + ' ' + c.apellido + ' dentro de la demo. ¿Continuar?',
            textoConfirmar: bloquear ? 'Bloquear' : 'Reactivar',
            peligro: bloquear
          }).then(function (ok) {
            if (!ok) return;
            var nuevo = Servicios.cambiarEstadoCiudadano(c.id);
            UI.toast('Ciudadano ' + (nuevo === 'bloqueado' ? 'bloqueado' : 'reactivado') + ' (demo).', 'exito');
            Router.refrescar();
          });
        });
      }
    };
  }

  return { main: main, detalle: detalle };
})();
