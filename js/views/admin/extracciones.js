window.Views = window.Views || {};

Views.adminExtracciones = (function () {
  var q = '';
  var estado = 'todas';

  function M() { return Store.state.municipal; }

  function lista() { return M().extracciones || []; }

  function multaDe(id) {
    return (M().multas || []).filter(function (m) { return m.id === id; })[0];
  }

  function badgeEstado(e) {
    var d = e === 'Entregado' ? { clase: 'b-exito', icono: 'check-circle' } : { clase: 'b-aviso', icono: 'clock' };
    return `<span class='badge ${d.clase}'>${Icons.r(d.icono)}${U.escape(e)}</span>`;
  }

  function listaFiltrada() {
    var texto = q.trim().toLowerCase();
    return lista().filter(function (x) {
      var okEstado = estado === 'todas' || x.estado === estado;
      var multa = multaDe(x.multaId);
      var haystack = (x.numero + ' ' + x.dominio + ' ' + x.motivo + ' ' + x.ubicacion + ' ' + (x.inspector || '') + ' ' + (multa ? multa.acta : '')).toLowerCase();
      return okEstado && (!texto || haystack.indexOf(texto) >= 0);
    }).sort(function (a, b) { return new Date(b.fecha) - new Date(a.fecha); });
  }

  function itemExtraccion(x) {
    var multa = multaDe(x.multaId);
    var actaHtml = multa ? `Acta <a class='enlace' href='#/admin/multa/${multa.id}'>${U.escape(multa.acta)}</a> · ${U.money(multa.importe)}` : 'Sin acta asociada (demo)';
    return `
      <a class='item' href='#/admin/extraccion/${x.id}'>
        <span class='tinte ${x.estado === 'Entregado' ? 't-verde' : 't-ambar'} item-ico'>${Icons.r('truck')}</span>
        <span class='item-cuerpo'>
          <span class='item-titulo'><span class='patente'>${U.escape(x.dominio)}</span> · ${U.escape(x.motivo)}</span>
          <span class='item-sub'><span>${U.escape(x.numero)}</span><span>${U.fechaHora(x.fecha)}</span><span>${U.escape(x.ubicacion)}</span></span>
          <span class='item-sub' style='margin-top:6px'>${actaHtml}</span>
        </span>
        <span class='item-derecha'>${badgeEstado(x.estado)}</span>
        <span class='flecha'>${Icons.r('chevron-right')}</span>
      </a>`;
  }

  function listaHtml() {
    var l = listaFiltrada();
    if (!l.length) return UI.vacio({ icono: 'search', titulo: 'Sin extracciones con estos filtros', texto: 'Probá cambiar el estado o el texto de búsqueda.' });
    return `<div class='lista'>${l.map(itemExtraccion).join('')}</div>`;
  }

  function chipsEstados() {
    var estados = [['todas', 'Todas'], ['En depósito', 'En depósito'], ['Entregado', 'Entregadas']];
    return `<div class='chips' role='group' aria-label='Filtrar por estado'>${estados.map(function (e) {
      return `<button type='button' class='chip ${estado === e[0] ? 'activa' : ''}' data-estado='${U.escape(e[0])}'>${U.escape(e[1])}</button>`;
    }).join('')}</div>`;
  }

  function main() {
    var total = lista().length;
    var enDeposito = lista().filter(function (x) { return x.estado === 'En depósito'; }).length;
    var html = `
      <h1>Extracciones de vehículos</h1>
      <p class='sub'>Vehículos retirados con grúa al depósito municipal. ${total} registros de demostración · ${enDeposito} en depósito.</p>
      <div class='fila-acciones'>
        <a class='btn btn-primario btn-bloque' href='#/admin/extracciones/nueva'>${Icons.r('plus', 'i-18')} Registrar extracción</a>
      </div>
      <div class='buscador mt-8'>
        ${Icons.r('search')}
        <input id='ax-buscar' class='control' type='search' value='${U.escape(q)}' placeholder='Buscar por dominio, número, motivo, acta o ubicación…' aria-label='Buscar extracción'>
      </div>
      ${chipsEstados()}
      <div id='ax-lista'>${listaHtml()}</div>`;
    return {
      titulo: 'Extracciones',
      html: html,
      after: function (raiz) {
        var input = raiz.querySelector('#ax-buscar');
        if (input) input.addEventListener('input', function () {
          q = input.value;
          var zona = raiz.querySelector('#ax-lista');
          if (zona) zona.innerHTML = listaHtml();
        });
        raiz.querySelectorAll('[data-estado]').forEach(function (b) {
          b.addEventListener('click', function () { estado = b.getAttribute('data-estado'); Router.refrescar(); });
        });
      }
    };
  }