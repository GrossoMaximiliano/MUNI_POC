window.Views = window.Views || {};

Views.pagos = (function () {
  var filtroCat = 'todas';
  var filtroEstado = 'todos';
  var tab = 'deuda';
  var wiz = null;

  function buscar(id) {
    return Store.state.obligaciones.filter(function (o) { return o.id === id; })[0] || null;
  }

  function itemObligacion(o) {
    var cat = DEMO.catalogos.categoriasObligacion[o.categoria] || { nombre: o.categoria, icono: 'landmark' };
    var vence = o.estado === 'pagada' ? 'Pagada' : U.venceTexto(o.vencimiento);
    return `
      <a class='item' href='#/pagos/detalle/${o.id}'>
        <span class='tinte t-azul item-ico'>${Icons.r(cat.icono)}</span>
        <span class='item-cuerpo'>
          <span class='item-titulo'>${U.escape(o.concepto)}</span>
          <span class='item-sub'><span>${U.escape(o.identificador)}</span><span>${U.escape(o.periodo)}</span><span>${vence}</span></span>
        </span>
        <span class='item-derecha'>
          <span class='importe'>${U.money(Servicios.totalObligacion(o))}</span>
          ${UI.badgeEstadoObligacion(o.estado)}
        </span>
        <span class='flecha'>${Icons.r('chevron-right')}</span>
      </a>`;
  }

  function chipsCategorias() {
    var cats = DEMO.catalogos.categoriasObligacion;
    var out = [`<button type='button' class='chip ${filtroCat === 'todas' ? 'activa' : ''}' data-cat='todas'>Todas</button>`];
    Object.keys(cats).forEach(function (k) {
      out.push(`<button type='button' class='chip ${filtroCat === k ? 'activa' : ''}' data-cat='${k}'>${Icons.r(cats[k].icono, 'i-14')}${cats[k].nombre}</button>`);
    });
    return `<div class='chips' role='group' aria-label='Filtrar por categoría'>${out.join('')}</div>`;
  }

  function panelDeuda() {
    var lista = Store.state.obligaciones.slice();
    if (filtroCat !== 'todas') lista = lista.filter(function (o) { return o.categoria === filtroCat; });
    if (filtroEstado !== 'todos') lista = lista.filter(function (o) { return o.estado === filtroEstado; });
    lista.sort(function (a, b) {
      return (a.estado === 'pagada' ? 1 : 0) - (b.estado === 'pagada' ? 1 : 0) || U.diasHasta(a.vencimiento) - U.diasHasta(b.vencimiento);
    });
    var cuerpo;
    if (!lista.length) {
      cuerpo = UI.vacio({ icono: 'search', titulo: 'No hay obligaciones con estos filtros', texto: 'Probá cambiar la categoría o el estado.', accion: `<a class='btn btn-suave' href='#/pagos'>${Icons.r('refresh', 'i-16')} Limpiar filtros</a>` });
    } else {
      cuerpo = `<div class='lista'>${lista.map(itemObligacion).join('')}</div>`;
    }
    var sinPagar = Store.state.obligaciones.filter(function (o) { return o.estado !== 'pagada'; }).length;
    return `
      <p class='sub'>${sinPagar} ${sinPagar === 1 ? 'obligación sin pagar' : 'obligaciones sin pagar'} · datos de demostración</p>
      ${chipsCategorias()}
      <div class='campo'>
        <label for='filtro-estado'>Estado</label>
        <select id='filtro-estado' class='control'>
          <option value='todos' ${filtroEstado === 'todos' ? 'selected' : ''}>Todos los estados</option>
          <option value='pendiente' ${filtroEstado === 'pendiente' ? 'selected' : ''}>Pendiente</option>
          <option value='vencida' ${filtroEstado === 'vencida' ? 'selected' : ''}>Vencida</option>
          <option value='proceso' ${filtroEstado === 'proceso' ? 'selected' : ''}>En proceso</option>
          <option value='pagada' ${filtroEstado === 'pagada' ? 'selected' : ''}>Pagada</option>
        </select>
      </div>
      ${cuerpo}`;
  }

  function panelHistorial() {
    var pagos = Store.state.pagos;
    if (!pagos.length) {
      return UI.vacio({ icono: 'receipt', titulo: 'Todavía no hay pagos', texto: 'Cuando simules un pago, el comprobante aparecerá acá.' });
    }
    return `<div class='lista'>${pagos.map(function (p) {
      return `
      <a class='item' href='#/pagos/comprobante/${p.id}'>
        <span class='tinte ${p.estado === 'aprobado' ? 't-verde' : 't-rojo'} item-ico'>${Icons.r(p.estado === 'aprobado' ? 'check-circle' : 'x-circle')}</span>
        <span class='item-cuerpo'>
          <span class='item-titulo'>${U.escape(p.concepto)}</span>
          <span class='item-sub'><span>${p.comprobante}</span><span>${U.fecha(p.fecha)}</span><span>${U.escape(p.medio)}</span></span>
        </span>
        <span class='item-derecha'>
          <span class='importe'>${U.money(p.importe)}</span>
          <span class='badge ${p.estado === 'aprobado' ? 'b-exito' : 'b-peligro'}'>${Icons.r(p.estado === 'aprobado' ? 'check-circle' : 'x-circle')}${p.estado === 'aprobado' ? 'Aprobado' : 'Rechazado'}</span>
        </span>
        <span class='flecha'>${Icons.r('chevron-right')}</span>
      </a>`;
    }).join('')}</div>`;
  }

  function main() {
    var html = `
      <h1>Pagos e impuestos</h1>
      <p class='sub'>Consultá tus obligaciones municipales y simulá su pago. Datos de demostración.</p>
      <div class='segmentos mt-16' role='tablist' aria-label='Sección de pagos'>
        <button type='button' role='tab' aria-selected='${tab === 'deuda'}' data-tab='deuda' class='${tab === 'deuda' ? 'activa' : ''}'>Deuda y obligaciones</button>
        <button type='button' role='tab' aria-selected='${tab === 'historial'}' data-tab='historial' class='${tab === 'historial' ? 'activa' : ''}'>Historial de pagos</button>
      </div>
      <div id='panel-pagos'>${tab === 'deuda' ? panelDeuda() : panelHistorial()}</div>`;
    return {
      titulo: 'Pagos e impuestos',
      html: html,
      after: function (raiz) {
        raiz.querySelectorAll('[data-tab]').forEach(function (b) {
          b.addEventListener('click', function () { tab = b.getAttribute('data-tab'); Router.refrescar(); });
        });
        raiz.querySelectorAll('[data-cat]').forEach(function (b) {
          b.addEventListener('click', function () { filtroCat = b.getAttribute('data-cat'); Router.refrescar(); });
        });
        var sel = raiz.querySelector('#filtro-estado');
        if (sel) sel.addEventListener('change', function () { filtroEstado = sel.value; Router.refrescar(); });
      }
    };
  }

  function detalle(id) {
    var o = buscar(id);
    if (!o) return Views.noEncontrado();
    var cat = DEMO.catalogos.categoriasObligacion[o.categoria] || { nombre: o.categoria, icono: 'landmark' };
    var total = Servicios.totalObligacion(o);
    var pagable = o.estado !== 'pagada';
    var html = `
      <a class='enlace' href='#/pagos'>${Icons.r('arrow-left', 'i-16')} Volver a pagos</a>
      <div class='card mt-8'>
        <div style='display:flex;align-items:center;gap:12px'>
          <span class='tinte t-azul'>${Icons.r(cat.icono, 'i-22')}</span>
          <div style='flex:1'>
            <h2 style='margin:0'>${U.escape(o.concepto)}</h2>
            <p class='sub' style='margin:2px 0 0'>${cat.nombre} · ${U.escape(o.periodo)}</p>
          </div>
          ${UI.badgeEstadoObligacion(o.estado)}
        </div>
        <div class='filas mt-16'>
          <div class='fila-datos'><span class='clave'>Identificador</span><span class='valor'>${U.escape(o.identificador)}</span></div>
          <div class='fila-datos'><span class='clave'>Período fiscal</span><span class='valor'>${U.escape(o.periodo)}</span></div>
          <div class='fila-datos'><span class='clave'>Importe original</span><span class='valor'>${U.money(o.importe)}</span></div>
          <div class='fila-datos'><span class='clave'>Intereses / recargos (ejemplo)</span><span class='valor'>${U.money(o.intereses)}</span></div>
          <div class='fila-datos'><span class='clave'>Vencimiento</span><span class='valor'>${U.fecha(o.vencimiento)} · ${U.venceTexto(o.vencimiento)}</span></div>
          <div class='fila-datos'><span class='clave'>Número de boleta (ficticio)</span><span class='valor'>${U.escape(o.boleta)}</span></div>
          <div class='fila-total'><span>Total a pagar</span><span class='valor'>${U.money(total)}</span></div>
        </div>
        ${o.estado === 'vencida' ? `<div class='alerta a-aviso'>${Icons.r('alert-triangle')}<span>La obligación está vencida. Los intereses mostrados son un ejemplo ilustrativo de demostración.</span></div>` : ''}
        ${o.estado === 'proceso' ? `<div class='alerta a-info'>${Icons.r('info')}<span>Hay un pago iniciado pendiente de acreditación (simulación). Podés volver a intentarlo.</span></div>` : ''}
        <div class='alerta a-info'>${Icons.r('info')}<span>Pago de demostración — sin movimiento de dinero real.</span></div>
        <div class='fila-acciones'>
          ${pagable ? `<a class='btn btn-primario btn-bloque' href='#/pagos/pagar/${o.id}'>${Icons.r('card', 'i-18')} Continuar al pago</a>` : ''}
          ${o.multaId ? `<a class='btn btn-secundario btn-bloque' href='#/vehiculos/multa/${o.multaId}'>${Icons.r('alert-triangle', 'i-18')} Ver la infracción asociada</a>` : ''}
          <a class='btn btn-fantasma btn-bloque' href='#/pagos'>${Icons.r('arrow-left', 'i-18')} Volver al listado</a>
        </div>
      </div>`;
    return { titulo: 'Detalle de obligación', html: html };
  }

  function comprobante(id) {
    var p = Store.state.pagos.filter(function (x) { return x.id === id; })[0];
    if (!p) return Views.noEncontrado();
    var u = Store.state.usuario;
    var html = `
      <a class='enlace no-imprimir' href='#/pagos'>${Icons.r('arrow-left', 'i-16')} Volver</a>
      <div class='comprobante mt-8'>
        <div class='marca-agua'>DEMOSTRACIÓN</div>
        <div class='comp-cabeza'>
          <strong>Municipalidad de Las Toscas — Santa Fe</strong>
          <span>Comprobante de pago · PROTOTIPO SIN VALIDEZ</span>
        </div>
        <div class='filas'>
          <div class='fila-datos'><span class='clave'>Comprobante Nº</span><span class='valor'>${p.comprobante}</span></div>
          <div class='fila-datos'><span class='clave'>Fecha y hora</span><span class='valor'>${U.fechaHora(p.fecha)}</span></div>
          <div class='fila-datos'><span class='clave'>Contribuyente (demo)</span><span class='valor'>${U.escape(u.nombre + ' ' + u.apellido)}</span></div>
          <div class='fila-datos'><span class='clave'>Concepto</span><span class='valor'>${U.escape(p.concepto)}</span></div>
          <div class='fila-datos'><span class='clave'>Identificador</span><span class='valor'>${U.escape(p.identificador)}</span></div>
          <div class='fila-datos'><span class='clave'>Medio de pago</span><span class='valor'>${U.escape(p.medio)}</span></div>
          <div class='fila-datos'><span class='clave'>Estado</span><span class='valor'>${p.estado === 'aprobado' ? 'Aprobado (simulado)' : 'Rechazado (simulado)'}</span></div>
          <div class='fila-total'><span>Importe</span><span class='valor'>${U.money(p.importe)}</span></div>
        </div>
        <p class='comp-pie'>Documento generado por un prototipo de demostración. No acredita pagos reales ni tiene validez fiscal o legal.</p>
      </div>
      <div class='fila-acciones horizontal no-imprimir'>
        <button type='button' class='btn btn-primario' id='btn-imprimir'>${Icons.r('printer', 'i-18')} Imprimir comprobante</button>
        <a class='btn btn-secundario' href='#/pagos'>${Icons.r('receipt', 'i-18')} Ir a mis pagos</a>
        <a class='btn btn-fantasma' href='#/inicio'>${Icons.r('home', 'i-18')} Volver al inicio</a>
      </div>`;
    return {
      titulo: 'Comprobante',
      html: html,
      after: function (raiz) {
        var b = raiz.querySelector('#btn-imprimir');
        if (b) b.addEventListener('click', function () { window.print(); });
      }
    };
  }

  function pagar(id) {
    var o = buscar(id);
    if (!o) return Views.noEncontrado();
    if (o.estado === 'pagada') {
      return { titulo: 'Pago', html: UI.vacio({ icono: 'check-circle', titulo: 'Esta obligación ya está pagada', texto: 'Podés ver su comprobante desde el historial de pagos.', accion: `<a class='btn btn-suave' href='#/pagos'>${Icons.r('receipt', 'i-16')} Ir al historial</a>` }) };
    }
    if (!wiz || wiz.obId !== id) wiz = { obId: id, paso: 1, medio: null, resultado: null };
    var total = Servicios.totalObligacion(o);
    var medios = DEMO.catalogos.mediosPago;
    var html = '';

    if (wiz.paso === 1) {
      html = `
        <a class='enlace' href='#/pagos/detalle/${o.id}'>${Icons.r('arrow-left', 'i-16')} Volver al detalle</a>
        <div class='pasos' aria-hidden='true'><span class='completo'></span><span></span><span></span></div>
        <p class='paso-texto'>Paso 1 de 3 · Revisá la obligación</p>
        <div class='card'>
          <h2>${U.escape(o.concepto)}</h2>
          <div class='filas mt-8'>
            <div class='fila-datos'><span class='clave'>Período</span><span class='valor'>${U.escape(o.periodo)}</span></div>
            <div class='fila-datos'><span class='clave'>Identificador</span><span class='valor'>${U.escape(o.identificador)}</span></div>
            <div class='fila-datos'><span class='clave'>Vencimiento</span><span class='valor'>${U.fecha(o.vencimiento)}</span></div>
            <div class='fila-total'><span>Total</span><span class='valor'>${U.money(total)}</span></div>
          </div>
          <div class='alerta a-aviso'>${Icons.r('alert-triangle')}<span><strong>Pago de demostración</strong> — sin movimiento de dinero real. No se solicitan datos de tarjeta ni claves.</span></div>
          <div class='fila-acciones'>
            <button type='button' class='btn btn-primario btn-bloque' id='wz-sig'>${Icons.r('chevron-right', 'i-18')} Elegir medio de pago</button>
          </div>
        </div>`;
    }

    if (wiz.paso === 2) {
      html = `
        <a class='enlace' href='#/pagos/detalle/${o.id}'>${Icons.r('arrow-left', 'i-16')} Cancelar</a>
        <div class='pasos' aria-hidden='true'><span class='completo'></span><span class='completo'></span><span></span></div>
        <p class='paso-texto'>Paso 2 de 3 · Medio de pago ilustrativo</p>
        <div class='card'>
          <div class='opciones' role='radiogroup' aria-label='Medio de pago'>
            ${medios.map(function (m) {
              return `
              <label class='opcion'>
                <input type='radio' name='medio' value='${m.id}' ${wiz.medio === m.id ? 'checked' : ''}>
                <span class='tinte t-gris'>${Icons.r(m.icono, 'i-22')}</span>
                <span style='flex:1'>
                  <span class='opcion-titulo' style='display:block'>${m.nombre}</span>
                  <span class='opcion-sub'>${m.detalle}</span>
                </span>
                <span class='marca'>${Icons.r('check')}</span>
              </label>`;
            }).join('')}
          </div>
          <div class='alerta a-info'>${Icons.r('info')}<span>Los medios de pago son opciones visuales de ejemplo para el prototipo.</span></div>
          <div class='fila-acciones'>
            <button type='button' class='btn btn-primario btn-bloque' id='wz-sig'>${Icons.r('chevron-right', 'i-18')} Revisar y confirmar</button>
          </div>
        </div>`;
    }

    if (wiz.paso === 3) {
      var medio = medios.filter(function (m) { return m.id === wiz.medio; })[0];
      html = `
        <a class='enlace' href='#/pagos/detalle/${o.id}'>${Icons.r('arrow-left', 'i-16')} Cancelar</a>
        <div class='pasos' aria-hidden='true'><span class='completo'></span><span class='completo'></span><span class='completo'></span></div>
        <p class='paso-texto'>Paso 3 de 3 · Confirmación</p>
        <div class='card'>
          <h2>Revisá los datos</h2>
          <div class='filas mt-8'>
            <div class='fila-datos'><span class='clave'>Obligación</span><span class='valor'>${U.escape(o.concepto)}</span></div>
            <div class='fila-datos'><span class='clave'>Período</span><span class='valor'>${U.escape(o.periodo)}</span></div>
            <div class='fila-datos'><span class='clave'>Medio elegido</span><span class='valor'>${medio ? medio.nombre : '-'}</span></div>
            <div class='fila-total'><span>Vas a pagar (simulado)</span><span class='valor'>${U.money(total)}</span></div>
          </div>
          <div class='alerta a-aviso'>${Icons.r('alert-triangle')}<span>Esta operación es una <strong>simulación</strong>: no se debita dinero ni se contacta a ningún banco.</span></div>
          <div class='fila-acciones'>
            <button type='button' class='btn btn-primario btn-bloque' id='wz-pagar'>${Icons.r('shield-check', 'i-18')} Confirmar pago simulado</button>
            <button type='button' class='btn btn-secundario btn-bloque' id='wz-rechazar'>Simular un pago rechazado</button>
          </div>
        </div>`;
    }

    if (wiz.paso === 4) {
      html = `
        <div class='centrado-pane'>
          <span class='spinner' style='width:44px;height:44px'></span>
          <h2>Procesando pago de demostración…</h2>
          <p class='sub centrado'>Estamos simulando la acreditación. Sólo demora unos segundos.</p>
        </div>`;
    }

    if (wiz.paso === 5 && wiz.resultado) {
      var ok = wiz.resultado.estado === 'aprobado';
      html = `
        <div class='centrado-pane'>
          <span class='circulo-ico ${ok ? 't-verde' : 't-rojo'} pop'>${Icons.r(ok ? 'check-circle' : 'x-circle', 'i-44')}</span>
          <h1>${ok ? 'Pago acreditado (demo)' : 'Pago rechazado (demo)'}</h1>
          <p class='sub centrado'>${ok ? 'La obligación fue marcada como pagada dentro de la demostración.' : 'La simulación terminó en rechazo para mostrarte cómo se informa un error. La obligación continúa pendiente.'}</p>
        </div>
        <div class='card'>
          <div class='filas'>
            <div class='fila-datos'><span class='clave'>Comprobante</span><span class='valor'>${wiz.resultado.comprobante}</span></div>
            <div class='fila-datos'><span class='clave'>Importe</span><span class='valor'>${U.money(wiz.resultado.importe)}</span></div>
            <div class='fila-datos'><span class='clave'>Medio</span><span class='valor'>${U.escape(wiz.resultado.medio)}</span></div>
            <div class='fila-datos'><span class='clave'>Fecha</span><span class='valor'>${U.fechaHora(wiz.resultado.fecha)}</span></div>
          </div>
          <div class='alerta a-info'>${Icons.r('info')}<span>Comprobante ficticio de demostración, sin validez oficial.</span></div>
          <div class='fila-acciones'>
            ${ok ? `<a class='btn btn-primario btn-bloque' href='#/pagos/comprobante/${wiz.resultado.id}'>${Icons.r('printer', 'i-18')} Ver e imprimir comprobante</a>` : `<button type='button' class='btn btn-primario btn-bloque' id='wz-reintentar'>${Icons.r('refresh', 'i-18')} Reintentar el pago</button>`}
            <a class='btn btn-secundario btn-bloque' href='#/pagos'>${Icons.r('receipt', 'i-18')} Ver mis obligaciones</a>
            <a class='btn btn-fantasma btn-bloque' href='#/inicio'>${Icons.r('home', 'i-18')} Volver al inicio</a>
          </div>
        </div>`;
    }

    return {
      titulo: 'Pago simulado',
      html: html,
      after: function (raiz) {
        var sig = raiz.querySelector('#wz-sig');
        if (sig && wiz.paso === 1) sig.addEventListener('click', function () { wiz.paso = 2; Router.refrescar(); });
        if (sig && wiz.paso === 2) {
          sig.addEventListener('click', function () {
            var sel = raiz.querySelector('input[name=medio]:checked');
            if (!sel) { UI.toast('Elegí un medio de pago para continuar.', 'error'); return; }
            wiz.medio = sel.value;
            wiz.paso = 3;
            Router.refrescar();
          });
        }
        var pagarBtn = raiz.querySelector('#wz-pagar');
        if (pagarBtn) pagarBtn.addEventListener('click', function () { procesar(true); });
        var rechBtn = raiz.querySelector('#wz-rechazar');
        if (rechBtn) rechBtn.addEventListener('click', function () { procesar(false); });
        var reint = raiz.querySelector('#wz-reintentar');
        if (reint) reint.addEventListener('click', function () { wiz.paso = 2; Router.refrescar(); });
      }
    };
  }

  function procesar(exito) {
    wiz.paso = 4;
    Router.refrescar();
    setTimeout(function () {
      wiz.resultado = Servicios.registrarPago(wiz.obId, wiz.medio, exito);
      wiz.paso = 5;
      Router.refrescar();
      if (wiz.resultado && wiz.resultado.estado === 'aprobado') {
        UI.toast('Pago simulado acreditado. La demo fue actualizada.', 'exito');
      } else {
        UI.toast('El pago simulado fue rechazado. Nada se modificó en la deuda.', 'error', 4200);
      }
    }, 1400);
  }

  function irAHistorial() { tab = 'historial'; }

  return { main: main, detalle: detalle, pagar: pagar, comprobante: comprobante, irAHistorial: irAHistorial };
})();