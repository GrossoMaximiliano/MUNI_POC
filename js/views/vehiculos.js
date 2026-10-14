window.Views = window.Views || {};

Views.vehiculos = (function () {
  function multasDeVehiculo(vehiculoId) {
    return Store.state.multas.filter(function (m) { return m.vehiculoId === vehiculoId && m.estado !== 'pagada'; }).length;
  }

  function estadoVehiculo(vehiculoId) {
    var pend = Store.state.obligaciones.filter(function (o) { return o.ref === vehiculoId && o.estado !== 'pagada'; }).length;
    return pend ? { texto: pend + ' obligación(es) pendiente(s)', clase: 'b-aviso' } : { texto: 'Al día (demo)', clase: 'b-exito' };
  }

  function main() {
    var st = Store.state;
    var html = `
      <h1>Vehículos y multas</h1>
      <p class='sub'>Vehículos de demostración asociados a tu cuenta y sus infracciones ficticias.</p>
      <section class='seccion'>
        <div class='seccion-cabeza'><h2>Mis vehículos (demo)</h2><a class='enlace' href='#/perfil'>Administrar</a></div>
        <div class='lista'>
          ${st.vehiculos.map(function (v) {
            var mul = multasDeVehiculo(v.id);
            var est = estadoVehiculo(v.id);
            return `
            <a class='item' href='#/vehiculos/multas'>
              <span class='tinte t-azul item-ico'>${Icons.r(v.tipo === 'Motocicleta' ? 'moto' : 'car', 'i-22')}</span>
              <span class='item-cuerpo'>
                <span class='item-titulo'><span class='patente'>${U.escape(v.dominio)}</span></span>
                <span class='item-sub'><span>${U.escape(v.marca + ' ' + v.modelo + ' · ' + v.anio)}</span><span>${mul ? mul + ' infracción(es) pendiente(s)' : 'Sin infracciones pendientes'}</span></span>
              </span>
              <span class='item-derecha'>
                <span class='badge ${est.clase}'>${Icons.r(est.clase === 'b-exito' ? 'check-circle' : 'clock')}${est.texto}</span>
              </span>
              <span class='flecha'>${Icons.r('chevron-right')}</span>
            </a>`;
          }).join('')}
        </div>
      </section>
      <section class='seccion'>
        <div class='seccion-cabeza'><h2>Consultar por dominio</h2>${UI.etiquetaDemo()}</div>
        <div class='card'>
          <div class='buscador'>
            ${Icons.r('search')}
            <input id='buscar-dominio' class='control' type='text' inputmode='text' autocomplete='off' placeholder='Ej: AB 529 JR' aria-label='Dominio del vehículo'>
          </div>
          <button type='button' class='btn btn-primario btn-bloque' id='btn-buscar-dominio'>${Icons.r('search', 'i-18')} Consultar infracciones (simulado)</button>
          <div id='resultado-dominio' class='mt-16' aria-live='polite'></div>
        </div>
      </section>
      <section class='seccion'>
        <div class='seccion-cabeza'><h2>Todas las infracciones</h2></div>
        <a class='btn btn-secundario btn-bloque' href='#/vehiculos/multas'>${Icons.r('alert-triangle', 'i-18')} Ver listado de multas</a>
      </section>`;
    return {
      titulo: 'Vehículos y multas',
      html: html,
      after: function (raiz) {
        var btn = raiz.querySelector('#btn-buscar-dominio');
        var input = raiz.querySelector('#buscar-dominio');
        function consultar() {
          var dom = (input.value || '').trim().toUpperCase();
          var zona = raiz.querySelector('#resultado-dominio');
          if (!dom) { UI.toast('Escribí un dominio para consultar.', 'error'); input.focus(); return; }
          zona.innerHTML = UI.esqueletoLineas(3);
          setTimeout(function () {
            var v = Store.state.vehiculos.filter(function (x) { return x.dominio.replace(/\s/g, '') === dom.replace(/\s/g, ''); })[0];
            if (!v) {
              zona.innerHTML = `<div class='alerta a-info'>${Icons.r('info')}<span>No encontramos infracciones para el dominio <strong>${U.escape(dom)}</strong>. (Consulta simulada: sólo reconoce los dominios de la demo.)</span></div>`;
            } else {
              var mul = Store.state.multas.filter(function (m) { return m.vehiculoId === v.id && m.estado !== 'pagada'; });
              zona.innerHTML = mul.length
                ? `<div class='alerta a-aviso'>${Icons.r('alert-triangle')}<span>El dominio <strong>${U.escape(v.dominio)}</strong> registra ${mul.length} infracción(es) pendiente(s) en la demo.</span></div><a class='btn btn-primario btn-bloque' href='#/vehiculos/multas'>Ver infracciones</a>`
                : `<div class='alerta a-exito'>${Icons.r('check-circle')}<span>El dominio <strong>${U.escape(v.dominio)}</strong> no registra infracciones pendientes (demo).</span></div>`;
            }
          }, 700);
        }
        if (btn) btn.addEventListener('click', consultar);
        if (input) input.addEventListener('keydown', function (e) { if (e.key === 'Enter') consultar(); });
      }
    };
  }

  function badgeMulta(estado) {
    var mapa = {
      pendiente: { t: 'Pendiente', c: 'b-aviso', i: 'clock' },
      pagada: { t: 'Pagada', c: 'b-exito', i: 'check-circle' },
      en_descargo: { t: 'Con descargo en curso', c: 'b-info', i: 'shield-check' }
    };
    var d = mapa[estado] || { t: estado, c: 'b-neutra', i: 'info' };
    return `<span class='badge ${d.c}'>${Icons.r(d.i)}${d.t}</span>`;
  }

  function multas() {
    var st = Store.state;
    if (!st.multas.length) {
      return { titulo: 'Infracciones', html: UI.vacio({ icono: 'check-circle', titulo: 'Sin infracciones', texto: 'No hay multas de demostración registradas.', accion: `<a class='btn btn-suave' href='#/vehiculos'>${Icons.r('arrow-left', 'i-16')} Volver</a>` }) };
    }
    var html = `
      <a class='enlace' href='#/vehiculos'>${Icons.r('arrow-left', 'i-16')} Volver a vehículos</a>
      <h1 class='mt-8'>Infracciones (demo)</h1>
      <div class='alerta a-info'>${Icons.r('info')}<span>Las infracciones son ficticias y no constituyen sanciones reales. No implican descuentos ni plazos verificados.</span></div>
      <div class='lista mt-16'>
        ${st.multas.map(function (m) {
          var v = st.vehiculos.filter(function (x) { return x.id === m.vehiculoId; })[0];
          return `
          <a class='item' href='#/vehiculos/multa/${m.id}'>
            <span class='tinte t-ambar item-ico'>${Icons.r('alert-triangle')}</span>
            <span class='item-cuerpo'>
              <span class='item-titulo'>Acta ${U.escape(m.acta)}</span>
              <span class='item-sub'><span>${U.fecha(m.fecha)}</span><span>${U.escape(m.motivo)}</span><span>${v ? U.escape(v.dominio) : ''}</span></span>
            </span>
            <span class='item-derecha'>
              <span class='importe'>${U.money(m.importe)}</span>
              ${badgeMulta(m.estado)}
            </span>
            <span class='flecha'>${Icons.r('chevron-right')}</span>
          </a>`;
        }).join('')}
      </div>`;
    return { titulo: 'Infracciones', html: html };
  }

  function multa(id) {
    var st = Store.state;
    var m = st.multas.filter(function (x) { return x.id === id; })[0];
    if (!m) return Views.noEncontrado();
    var v = st.vehiculos.filter(function (x) { return x.id === m.vehiculoId; })[0];
    var ob = m.obligacionId ? st.obligaciones.filter(function (o) { return o.id === m.obligacionId; })[0] : null;
    var desc = m.descargos[0];
    var html = `
      <a class='enlace' href='#/vehiculos/multas'>${Icons.r('arrow-left', 'i-16')} Volver a infracciones</a>
      <div class='card mt-8'>
        <div style='display:flex;align-items:center;gap:12px'>
          <span class='tinte t-ambar'>${Icons.r('alert-triangle', 'i-22')}</span>
          <div style='flex:1'>
            <h2 style='margin:0'>Acta ${U.escape(m.acta)}</h2>
            <p class='sub' style='margin:2px 0 0'>Infracción de demostración</p>
          </div>
          ${badgeMulta(m.estado)}
        </div>
        <div class='filas mt-16'>
          <div class='fila-datos'><span class='clave'>Fecha</span><span class='valor'>${U.fecha(m.fecha)}</span></div>
          <div class='fila-datos'><span class='clave'>Motivo</span><span class='valor'>${U.escape(m.motivo)}</span></div>
          <div class='fila-datos'><span class='clave'>Ubicación</span><span class='valor'>${U.escape(m.ubicacion)}</span></div>
          <div class='fila-datos'><span class='clave'>Vehículo</span><span class='valor'>${v ? U.escape(v.dominio + ' · ' + v.marca + ' ' + v.modelo) : '-'}</span></div>
          <div class='fila-total'><span>Importe</span><span class='valor'>${U.money(m.importe)}</span></div>
        </div>
        ${desc ? `<div class='mt-16'><h3>Descargo presentado</h3>
          <div class='fila-datos'><span class='clave'>Número</span><span class='valor'>${U.escape(desc.numero)}</span></div>
          <div class='fila-datos'><span class='clave'>Estado</span><span class='valor'>${U.escape(desc.estado)}</span></div>
          <div class='fila-datos'><span class='clave'>Presentado</span><span class='valor'>${U.fecha(desc.fecha)}</span></div>
          <blockquote class='tl-comentario'>${U.escape(desc.texto)}</blockquote>
          ${desc.estado !== 'Resuelto' ? `<button type='button' class='btn btn-suave btn-sm' id='mul-avanzar-descargo'>${Icons.r('refresh', 'i-14')} Simular avance del descargo</button>` : ''}
        </div>` : ''}
        <div class='alerta a-aviso mt-16'>${Icons.r('alert-triangle')}<span>Los datos del acta, importes y plazos son de demostración. Esta pantalla no constituye una notificación de sanción real.</span></div>
        <div class='fila-acciones'>
          ${ob && ob.estado !== 'pagada' ? `<a class='btn btn-primario btn-bloque' href='#/pagos/pagar/${ob.id}'>${Icons.r('card', 'i-18')} Simular el pago</a>` : ''}
          ${ob && ob.estado === 'pagada' ? `<span class='badge b-exito'>${Icons.r('check-circle')} Infracción pagada (demo)</span>` : ''}
          ${!ob ? `<span class='sub'>El pago de esta infracción no está disponible en la demo.</span>` : ''}
          ${!desc ? `<button type='button' class='btn btn-secundario btn-bloque' id='mul-descargo'>${Icons.r('shield-check', 'i-18')} Iniciar descargo (demo)</button>` : ''}
          <button type='button' class='btn btn-fantasma btn-bloque' id='mul-requisitos'>${Icons.r('file-text', 'i-18')} Requisitos del descargo</button>
          <a class='btn btn-fantasma btn-bloque' href='#/vehiculos'>${Icons.r('arrow-left', 'i-18')} Volver</a>
        </div>
      </div>`;
    return {
      titulo: 'Detalle de infracción',
      html: html,
      after: function (raiz) { enlazar(raiz, m, desc); }
    };
  }

  function enlazar(raiz, m, desc) {
    var bDesc = raiz.querySelector('#mul-descargo');
    if (bDesc) bDesc.addEventListener('click', function () { abrirDescargo(m.id); });
    var bReq = raiz.querySelector('#mul-requisitos');
    if (bReq) bReq.addEventListener('click', function () {
      UI.modal({
        titulo: 'Requisitos del descargo (demo)',
        html: `<ul><li>Número de acta de infracción.</li><li>Expresión escrita del descargo (mínimo 20 caracteres).</li><li>Datos de contacto actualizados en tu perfil.</li></ul><div class='alerta a-aviso'>${Icons.r('alert-triangle')}<span>Requisitos ilustrativos de demostración. No reemplazan la normativa real de tránsito.</span></div>`,
        acciones: [{ texto: 'Entendido', clase: 'btn-primario' }]
      });
    });
    var bAv = raiz.querySelector('#mul-avanzar-descargo');
    if (bAv && desc) bAv.addEventListener('click', function () {
      Servicios.avanzarDescargo(m.id, desc.id);
      UI.toast('Estado del descargo actualizado (demo).', 'exito');
      Router.refrescar();
    });
  }

  function abrirDescargo(multaId) {
    UI.modal({
      titulo: 'Iniciar descargo (demo)',
      html: `
        <div class='campo'>
          <label for='desc-texto'>Expresión del descargo</label>
          <textarea id='desc-texto' class='control' placeholder='Contá por qué considerás que el acta debería revisarse…'></textarea>
          <span class='ayuda'>Mínimo 20 caracteres. Texto de demostración, no se envía a ningún organismo.</span>
        </div>
        <div class='alerta a-info'>${Icons.r('info')}<span>Al confirmar se genera un número de descargo ficticio y la infracción pasa a Con descargo en curso.</span></div>`,
      acciones: [
        { texto: 'Cancelar', clase: 'btn-secundario' },
        {
          texto: 'Presentar descargo', clase: 'btn-primario', mantener: true,
          onClick: function (cerrarModal) {
            var ta = document.getElementById('desc-texto');
            var texto = (ta.value || '').trim();
            if (texto.length < 20) { UI.ponerError(ta, 'Escribí al menos 20 caracteres.'); return; }
            Servicios.iniciarDescargo(multaId, texto);
            cerrarModal();
            UI.toast('Descargo presentado (demo).', 'exito');
            Router.refrescar();
          }
        }
      ]
    });
  }

  return { main: main, multas: multas, multa: multa };
})();