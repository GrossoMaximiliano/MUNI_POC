window.Views = window.Views || {};

Views.servicios = (function () {
  var estados = {
    Pendiente: { clase: 'b-aviso', icono: 'clock' },
    Programada: { clase: 'b-info', icono: 'calendar-check' },
    Realizada: { clase: 'b-exito', icono: 'check-circle' },
    Rechazada: { clase: 'b-peligro', icono: 'x-circle' }
  };

  function misSolicitudes() {
    var cuentaId = Store.state.sesion.cuentaId;
    return (Store.state.solicitudesServicios || []).filter(function (s) {
      return s.ciudadanoId === cuentaId;
    }).sort(function (a, b) {
      return new Date(b.fechaSolicitud) - new Date(a.fechaSolicitud);
    });
  }

  function badgeEstado(estado) {
    var d = estados[estado] || { clase: 'b-neutra', icono: 'info' };
    return `<span class='badge ${d.clase}'>${Icons.r(d.icono)}${U.escape(estado)}</span>`;
  }

  function fechaTexto(iso) {
    var partes = String(iso || '').split('-');
    return partes.length === 3 ? partes[2] + '/' + partes[1] + '/' + partes[0] : '-';
  }

  function main() {
    var lista = misSolicitudes();
    var html = `
      <div class='saludo'>
        <div>
          <h1>Solicitar servicios</h1>
          <p class='sub'>Pedí un servicio municipal y consultá el estado de tus solicitudes.</p>
        </div>
      </div>
      <div class='fila-acciones horizontal' style='margin-top:0'>
        <a class='btn btn-primario' href='#/servicios/nuevo'>${Icons.r('plus', 'i-18')} Nueva solicitud</a>
      </div>
      <section class='seccion'>
        <div class='seccion-cabeza'><h2>Mis solicitudes</h2>${UI.etiquetaDemo()}</div>
        ${lista.length ? `<div class='lista'>${lista.map(function (s) {
          return `
          <div class='item'>
            <span class='tinte t-azul item-ico'>${Icons.r('wrench')}</span>
            <span class='item-cuerpo'>
              <span class='item-titulo'>${U.escape(s.tipo)}</span>
              <span class='item-sub'><span>${U.escape(s.numero)}</span><span>${U.escape(s.direccion)}</span><span>Preferencia: ${fechaTexto(s.fechaPreferida)}</span></span>
            </span>
            <span class='item-derecha'>${badgeEstado(s.estado)}</span>
          </div>`;
        }).join('')}</div>` : UI.vacio({
          icono: 'wrench',
          titulo: 'Todavía no tenés solicitudes',
          texto: 'Cuando solicites un servicio, vas a poder consultar acá su estado.',
          accion: `<a class='btn btn-suave' href='#/servicios/nuevo'>${Icons.r('plus', 'i-16')} Solicitar un servicio</a>`
        })}
      </section>`;
    return { titulo: 'Solicitar servicios', html: html };
  }

  function hoyISO() { return U.hoyISO().slice(0, 10); }

  function nuevo() {
    var u = Store.state.usuario;
    var html = `
      <a class='enlace' href='#/servicios'>${Icons.r('arrow-left', 'i-16')} Volver a mis solicitudes</a>
      <h1 class='mt-8'>Nueva solicitud de servicio</h1>
      <p class='sub'>Completá los datos del servicio que necesitás. La solicitud se guarda en esta demo.</p>
      <div class='card mt-16'>
        <div class='campo'>
          <label for='sv-tipo'>Tipo de servicio</label>
          <select id='sv-tipo' class='control' required>
            <option value=''>Elegí un servicio</option>
            ${DEMO.catalogos.serviciosMunicipales.map(function (s) {
              return `<option value='${s.id}'>${U.escape(s.nombre)}</option>`;
            }).join('')}
          </select>
        </div>
        <div class='campo' id='sv-otro-wrap' hidden>
          <label for='sv-otro'>¿Qué otro servicio necesitás?</label>
          <input id='sv-otro' class='control' type='text' maxlength='100' placeholder='Describí brevemente el servicio'>
        </div>
        <div class='campo'>
          <label for='sv-direccion'>Dirección del servicio</label>
          <input id='sv-direccion' class='control' type='text' maxlength='120' autocomplete='street-address' value='${U.escape(u.domicilio)}' placeholder='Calle y altura o referencia'>
        </div>
        <div class='grupo-campos'>
          <div class='campo'>
            <label for='sv-fecha'>Fecha preferida</label>
            <input id='sv-fecha' class='control' type='date' min='${hoyISO()}'>
          </div>
          <div class='campo'>
            <label for='sv-telefono'>Teléfono de contacto</label>
            <input id='sv-telefono' class='control' type='tel' maxlength='25' autocomplete='tel' value='${U.escape(u.telefono)}'>
          </div>
        </div>
        <div class='campo'>
          <label for='sv-observaciones'>Observaciones (opcional)</label>
          <textarea id='sv-observaciones' class='control' maxlength='500' placeholder='Agregá detalles que ayuden a coordinar el servicio'></textarea>
        </div>
        <div class='alerta a-info'>${Icons.r('info')}<span>Solicitud de demostración: queda asociada a tu cuenta en este navegador; no se envía a la Municipalidad.</span></div>
        <div class='fila-acciones'>
          <button type='button' class='btn btn-primario btn-bloque' id='sv-enviar'>${Icons.r('send', 'i-18')} Enviar solicitud</button>
        </div>
      </div>`;
    return {
      titulo: 'Nueva solicitud de servicio',
      html: html,
      after: function (raiz) {
        enlazar(raiz);
      }
    };
  }

  function enlazar(raiz) {
    var tipo = raiz.querySelector('#sv-tipo');
    var otroWrap = raiz.querySelector('#sv-otro-wrap');
    if (tipo && otroWrap) tipo.addEventListener('change', function () { otroWrap.hidden = tipo.value !== 'otros'; });

    var enviar = raiz.querySelector('#sv-enviar');
    if (!enviar) return;
    enviar.addEventListener('click', function () {
      UI.limpiarErrores(raiz);
      var otro = raiz.querySelector('#sv-otro');
      var direccion = raiz.querySelector('#sv-direccion');
      var fecha = raiz.querySelector('#sv-fecha');
      var telefono = raiz.querySelector('#sv-telefono');
      var observaciones = raiz.querySelector('#sv-observaciones');
      var ok = true;
      if (!tipo.value) { UI.ponerError(tipo, 'Elegí el servicio que necesitás.'); ok = false; }
      if (tipo.value === 'otros' && otro.value.trim().length < 3) { UI.ponerError(otro, 'Describí el servicio (mínimo 3 caracteres).'); ok = false; }
      if (!direccion.value.trim()) { UI.ponerError(direccion, 'Indicá la dirección donde se necesita el servicio.'); ok = false; }
      if (!fecha.value) { UI.ponerError(fecha, 'Elegí una fecha preferida.'); ok = false; }
      else if (fecha.value < hoyISO()) { UI.ponerError(fecha, 'La fecha preferida no puede ser anterior a hoy.'); ok = false; }
      if (!U.esTelefono(telefono.value)) { UI.ponerError(telefono, 'El teléfono necesita al menos 8 números.'); ok = false; }
      if (!ok) return;

      var solicitud = Servicios.crearSolicitudServicio({
        tipoId: tipo.value,
        detalleOtro: otro ? otro.value.trim() : '',
        direccion: direccion.value.trim(),
        fechaPreferida: fecha.value,
        telefono: telefono.value.trim(),
        observaciones: observaciones.value.trim()
      });
      if (!solicitud) { UI.toast('No se pudo guardar la solicitud en esta sesión.', 'error'); return; }
      UI.toast('Solicitud ' + solicitud.numero + ' creada con estado Pendiente.', 'exito');
      Router.go('servicios');
    });
  }

  return { main: main, nuevo: nuevo };
})();
