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

  function nueva() {
    var html = `
      <a class='enlace' href='#/admin/extracciones'>${Icons.r('arrow-left', 'i-16')} Volver a extracciones</a>
      <div class='card mt-8'>
        <h2>Nueva extracción (demo)</h2>
        <p class='sub'>Registrá el vehículo retirado con grúa. Al confirmar se genera automáticamente el acta de infracción asociada al motivo.</p>
        <div class='grupo-campos'>
          <div class='campo'>
            <label for='ex-dominio'>Dominio (patente) *</label>
            <input id='ex-dominio' class='control' type='text' maxlength='9' autocomplete='off' placeholder='Ej.: AB 123 CD' style='text-transform:uppercase'>
            <span class='ayuda'>Formatos: AB 123 CD (nuevo) o ABC 123 (viejo).</span>
          </div>
          <div class='campo'>
            <label for='ex-tipo'>Tipo de vehículo *</label>
            <select id='ex-tipo' class='control'>
              ${DEMO.catalogos.tiposVehiculoExtraccion.map(function (t) { return `<option value='${U.escape(t)}'>${U.escape(t)}</option>`; }).join('')}
            </select>
          </div>
        </div>
        <div class='campo'>
          <label for='ex-motivo'>Motivo de la extracción *</label>
          <select id='ex-motivo' class='control'>
            ${DEMO.catalogos.extraccionMotivos.map(function (m) { return `<option value='${m.id}'>${U.escape(m.nombre)} — multa ${U.money(m.importe)}</option>`; }).join('')}
          </select>
          <span class='ayuda'>El importe del acta se define según el motivo (tarifas de demostración).</span>
        </div>
        <div class='campo'>
          <label for='ex-ubicacion'>Ubicación de la extracción *</label>
          <input id='ex-ubicacion' class='control' type='text' maxlength='80' placeholder='Ej.: Calle 12 y Calle 5'>
        </div>
        <div class='grupo-campos'>
          <div class='campo'>
            <label for='ex-inspector'>Inspector a cargo</label>
            <input id='ex-inspector' class='control' type='text' maxlength='60' placeholder='Nombre del inspector (opcional, demo)'>
          </div>
          <div class='campo'>
            <label for='ex-observaciones'>Observaciones</label>
            <input id='ex-observaciones' class='control' type='text' maxlength='140' placeholder='Opcional (demo)'>
          </div>
        </div>
        <div class='alerta a-info'>${Icons.r('info')}<span>La extracción queda con estado <strong>En depósito</strong> y se genera el acta de infracción correspondiente al motivo (demo).</span></div>
        <div class='fila-acciones'>
          <button type='button' class='btn btn-primario btn-bloque' id='ex-guardar'>${Icons.r('truck', 'i-18')} Registrar extracción y generar multa</button>
        </div>
      </div>`;
    return {
      titulo: 'Nueva extracción',
      html: html,
      after: function (raiz) { enlazarNueva(raiz); }
    };
  }

  function enlazarNueva(raiz) {
    var btn = raiz.querySelector('#ex-guardar');
    if (!btn) return;
    btn.addEventListener('click', function () {
      UI.limpiarErrores(raiz);
      var dominio = raiz.querySelector('#ex-dominio');
      var tipo = raiz.querySelector('#ex-tipo');
      var motivo = raiz.querySelector('#ex-motivo');
      var ubicacion = raiz.querySelector('#ex-ubicacion');
      var inspector = raiz.querySelector('#ex-inspector');
      var observaciones = raiz.querySelector('#ex-observaciones');
      var dominioNorm = (dominio.value || '').trim().toUpperCase().replace(/\s+/g, ' ');
      var ok = true;
      if (!dominioNorm) { UI.ponerError(dominio, 'Ingresá el dominio del vehículo.'); ok = false; }
      else if (!/^[A-Z]{2,3}\s?\d{3}(\s?[A-Z]{2})?$/.test(dominioNorm)) { UI.ponerError(dominio, 'El dominio no parece válido (ej.: AB 123 CD o ABC 123).'); ok = false; }
      if (!ubicacion.value.trim()) { UI.ponerError(ubicacion, 'Indicá la ubicación de la extracción.'); ok = false; }
      else if (ubicacion.value.trim().length < 5) { UI.ponerError(ubicacion, 'La ubicación necesita al menos 5 caracteres.'); ok = false; }
      var motivoDef = DEMO.catalogos.extraccionMotivos.filter(function (m) { return m.id === motivo.value; })[0];
      if (!ok || !motivoDef) return;
      UI.confirmar({
        titulo: 'Registrar extracción',
        mensaje: 'Se registrará la extracción del dominio ' + dominioNorm + ' y se generará automáticamente el acta de infracción por ' + U.money(motivoDef.importe) + ' (demo). ¿Continuar?',
        textoConfirmar: 'Registrar'
      }).then(function (okc) {
        if (!okc) return;
        var res = Servicios.registrarExtraccion({
          dominio: dominioNorm,
          tipoVehiculo: tipo.value,
          motivoId: motivo.value,
          ubicacion: ubicacion.value.trim(),
          inspector: inspector.value.trim(),
          observaciones: observaciones.value.trim()
        });
        if (!res) { UI.toast('No se pudo registrar la extracción (demo).', 'error', 4200); return; }
        UI.toast('Extracción ' + res.extraccion.numero + ' registrada. Se generó el acta ' + res.multa.acta + ' (demo).', 'exito', 4800);
        Router.go('admin/extraccion/' + res.extraccion.id);
      });
    });
  }

  function detalle(id) {
    var x = lista().filter(function (e) { return e.id === id; })[0];
    if (!x) return Views.noEncontrado();
    var multa = multaDe(x.multaId);
    var bm = multa ? (DEMO.catalogos.estadosMultaAdmin[multa.estado] || { texto: multa.estado, clase: 'b-neutra', icono: 'info' }) : null;
    var multaBloque = multa
      ? `<div class='card mt-16' style='border-style:dashed'>
          <h3 style='margin:0 0 10px'>${Icons.r('alert-triangle', 'i-18')} Multa generada automáticamente</h3>
          <div class='fila-datos'><span class='clave'>Acta</span><span class='valor'><a class='enlace' href='#/admin/multa/${multa.id}'>${U.escape(multa.acta)}</a></span></div>
          <div class='fila-datos'><span class='clave'>Motivo del acta</span><span class='valor'>${U.escape(multa.motivo)}</span></div>
          <div class='fila-datos'><span class='clave'>Estado del acta</span><span class='valor'><span class='badge ${bm.clase}'>${Icons.r(bm.icono)}${U.escape(bm.texto)}</span></span></div>
          <div class='fila-total'><span>Importe</span><span class='valor'>${U.money(multa.importe)}</span></div>
        </div>`
      : `<div class='alerta a-aviso mt-16'>${Icons.r('alert-triangle')}<span>Esta extracción no tiene acta asociada (demo).</span></div>`;
    var html = `
      <a class='enlace' href='#/admin/extracciones'>${Icons.r('arrow-left', 'i-16')} Volver a extracciones</a>
      <div class='card mt-8'>
        <div style='display:flex;align-items:center;gap:12px'>
          <span class='tinte ${x.estado === 'Entregado' ? 't-verde' : 't-ambar'}'>${Icons.r('truck', 'i-22')}</span>
          <div style='flex:1'>
            <h2 style='margin:0'>${U.escape(x.numero)} · <span class='patente'>${U.escape(x.dominio)}</span></h2>
            <p class='sub' style='margin:2px 0 0'>Extracción de vehículo (demo)</p>
          </div>
          ${badgeEstado(x.estado)}
        </div>
        <div class='filas mt-16'>
          <div class='fila-datos'><span class='clave'>Fecha de extracción</span><span class='valor'>${U.fechaHora(x.fecha)}</span></div>
          <div class='fila-datos'><span class='clave'>Tipo de vehículo</span><span class='valor'>${U.escape(x.tipoVehiculo)}</span></div>
          <div class='fila-datos'><span class='clave'>Motivo</span><span class='valor'>${U.escape(x.motivo)}</span></div>
          <div class='fila-datos'><span class='clave'>Ubicación</span><span class='valor'>${U.escape(x.ubicacion)}</span></div>
          <div class='fila-datos'><span class='clave'>Inspector a cargo</span><span class='valor'>${U.escape(x.inspector || 'Inspector de tránsito (demo)')}</span></div>
          ${x.observaciones ? `<div class='fila-datos'><span class='clave'>Observaciones</span><span class='valor'>${U.escape(x.observaciones)}</span></div>` : ''}
        </div>
        ${multaBloque}
        <div class='alerta a-aviso mt-16'>${Icons.r('alert-triangle')}<span>Registro de demostración: los datos del acta y del depósito son ficticios y no constituyen una sanción real.</span></div>
        <div class='fila-acciones'>
          ${x.estado === 'En depósito' ? `<button type='button' class='btn btn-primario btn-bloque' id='ax-entregar'>${Icons.r('check-circle', 'i-18')} Marcar como entregado</button>` : `<a class='btn btn-fantasma btn-bloque' href='#/admin/extracciones'>${Icons.r('arrow-left', 'i-18')} Volver al listado</a>`}
        </div>
      </div>`;
    return {
      titulo: 'Extracción ' + x.numero,
      html: html,
      after: function (raiz) {
        var btn = raiz.querySelector('#ax-entregar');
        if (btn) btn.addEventListener('click', function () {
          UI.confirmar({
            titulo: 'Marcar como entregado',
            mensaje: 'Se registrará la entrega del vehículo ' + x.dominio + ' desde el depósito municipal (demo). ¿Continuar?',
            textoConfirmar: 'Marcar entrega'
          }).then(function (ok) {
            if (!ok) return;
            var nuevo = Servicios.entregarExtraccion(x.id);
            if (nuevo) { UI.toast('Vehículo marcado como entregado (demo).', 'exito'); Router.refrescar(); }
          });
        });
      }
    };
  }

  return { main: main, nueva: nueva, detalle: detalle };
})();