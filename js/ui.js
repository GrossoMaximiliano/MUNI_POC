window.UI = (function () {
  var pilaModales = [];

  function toast(mensaje, tipo, ms) {
    var raiz = document.getElementById('toast-raiz');
    if (!raiz) return;
    var el = document.createElement('div');
    el.className = 'toast toast-' + (tipo || 'info');
    var icono = tipo === 'exito' ? 'check-circle' : (tipo === 'error' ? 'alert-circle' : 'info');
    el.innerHTML = Icons.r(icono, 'i-18') + '<span>' + mensaje + '</span>';
    raiz.appendChild(el);
    setTimeout(function () {
      el.style.transition = 'opacity .25s ease';
      el.style.opacity = '0';
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 280);
    }, ms || 3400);
  }

  function modal(opciones) {
    opciones = opciones || {};
    var raiz = document.getElementById('modal-raiz');
    if (!raiz) return function () {};
    var anteriorFoco = document.activeElement;
    var overlay = document.createElement('div');
    overlay.className = 'overlay';
    var acciones = (opciones.acciones || []).map(function (a, i) {
      return `<button type='button' class='btn ${a.clase || 'btn-secundario'}' data-acc='${i}'>${a.texto}</button>`;
    }).join('');
    overlay.innerHTML = `
      <div class='dialogo' role='dialog' aria-modal='true' aria-label='${U.escape(opciones.titulo || 'Ventana')}'>
        <div class='dialogo-cabeza'>
          <h2>${U.escape(opciones.titulo || '')}</h2>
          ${opciones.sinCerrar ? '' : `<button type='button' class='btn-icono cerrar-modal' data-cerrar='1' aria-label='Cerrar'>${Icons.r('x', 'i-18')}</button>`}
        </div>
        <div class='dialogo-cuerpo'>${opciones.html || ''}</div>
        ${acciones ? `<div class='dialogo-pie'>${acciones}</div>` : ''}
      </div>`;
    raiz.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    function cerrar() {
      var i = pilaModales.indexOf(cerrar);
      if (i >= 0) pilaModales.splice(i, 1);
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      if (!pilaModales.length) document.body.style.overflow = '';
      if (anteriorFoco && anteriorFoco.focus) anteriorFoco.focus();
      document.removeEventListener('keydown', enTecla);
    }

    function enTecla(e) {
      if (e.key === 'Escape' && !opciones.sinCerrar) { e.stopPropagation(); cerrar(); }
      if (e.key === 'Tab') {
        var focos = overlay.querySelectorAll('button, input, select, textarea, a[href]');
        if (!focos.length) return;
        var primero = focos[0];
        var ultimo = focos[focos.length - 1];
        if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo.focus(); }
        else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
      }
    }

    overlay.addEventListener('click', function (e) {
      var btnAcc = e.target.closest('[data-acc]');
      if (btnAcc) {
        var acc = (opciones.acciones || [])[Number(btnAcc.getAttribute('data-acc'))];
        if (acc && acc.onClick) acc.onClick(cerrar);
        if (!acc || !acc.mantener) cerrar();
        return;
      }
      if (e.target.closest('[data-cerrar]')) { cerrar(); return; }
      if (e.target === overlay && !opciones.estatica) cerrar();
    });

    document.addEventListener('keydown', enTecla);
    pilaModales.push(cerrar);
    var primerFoco = overlay.querySelector('input, select, textarea') || overlay.querySelector('button');
    if (primerFoco) primerFoco.focus();
    return cerrar;
  }

  function confirmar(opciones) {
    opciones = opciones || {};
    return new Promise(function (resolver) {
      var cerrado = false;
      modal({
        titulo: opciones.titulo || 'Confirmar acción',
        html: `<p>${opciones.mensaje || '¿Confirmás esta acción?'}</p>` + (opciones.detalle ? `<p class='sub'>${opciones.detalle}</p>` : ''),
        acciones: [
          { texto: opciones.textoCancelar || 'Cancelar', clase: 'btn-secundario', onClick: function (cerrar) { cerrado = true; resolver(false); } },
          { texto: opciones.textoConfirmar || 'Confirmar', clase: opciones.peligro ? 'btn-peligro' : 'btn-primario', onClick: function (cerrar) { cerrado = true; resolver(true); } }
        ]
      });
    });
  }

  function badgeEstadoObligacion(estado) {
    var def = DEMO.catalogos.estadosObligacion[estado] || { texto: estado, clase: 'b-neutra', icono: 'info' };
    return `<span class='badge ${def.clase}'>${Icons.r(def.icono)}${def.texto}</span>`;
  }

  function vacio(opciones) {
    opciones = opciones || {};
    return `
      <div class='centrado-pane'>
        <span class='circulo-ico t-azul'>${Icons.r(opciones.icono || 'inbox', 'i-32')}</span>
        <h2>${U.escape(opciones.titulo || 'Nada por acá')}</h2>
        <p class='sub'>${opciones.texto || ''}</p>
        ${opciones.accion || ''}
      </div>`;
  }

  function esqueletoTarjetas(n) {
    var out = '';
    for (var i = 0; i < (n || 3); i++) {
      out += `<div class='esqueleto esq-tarjeta'></div>`;
    }
    return out;
  }

  function esqueletoLineas(n) {
    var out = '';
    for (var i = 0; i < (n || 3); i++) {
      out += `<div class='esqueleto esq-linea' style='width:${90 - i * 12}%'></div>`;
    }
    return out;
  }

  function ponerError(control, mensaje) {
    if (!control) return;
    control.classList.add('control-error');
    control.setAttribute('aria-invalid', 'true');
    var campo = control.closest('.campo');
    if (!campo) return;
    var previo = campo.querySelector('.msg-error');
    if (previo) previo.remove();
    var msg = document.createElement('span');
    msg.className = 'msg-error';
    msg.innerHTML = Icons.r('alert-circle', 'i-14') + U.escape(mensaje);
    campo.appendChild(msg);
  }

  function limpiarErrores(raiz) {
    (raiz || document).querySelectorAll('.control-error').forEach(function (c) {
      c.classList.remove('control-error');
      c.removeAttribute('aria-invalid');
    });
    (raiz || document).querySelectorAll('.msg-error').forEach(function (m) { m.remove(); });
  }

  function cargando(boton, activo, texto) {
    if (!boton) return;
    if (activo) {
      boton.setAttribute('data-texto', boton.innerHTML);
      boton.disabled = true;
      boton.innerHTML = `<span class='spinner' style='width:18px;height:18px;margin:0;border-width:2.5px'></span>${U.escape(texto || 'Procesando…')}`;
    } else {
      boton.disabled = false;
      if (boton.getAttribute('data-texto')) boton.innerHTML = boton.getAttribute('data-texto');
    }
  }

  function etiquetaDemo() {
    return `<span class='etiqueta-demo' title='Contenido de demostración'>${Icons.r('info', 'i-14')} Demo</span>`;
  }

  function procesarImagen(archivo, maxLado, cb) {
    if (!archivo) { cb('No se seleccionó ningún archivo.'); return; }
    if (!/^image\//.test(archivo.type)) { cb('El archivo debe ser una imagen.'); return; }
    if (archivo.size > 3 * 1024 * 1024) { cb('La imagen supera los 3 MB permitidos.'); return; }
    var lector = new FileReader();
    lector.onload = function () {
      var img = new Image();
      img.onload = function () {
        var escala = Math.min(1, maxLado / Math.max(img.width, img.height));
        var lienzo = document.createElement('canvas');
        lienzo.width = Math.round(img.width * escala);
        lienzo.height = Math.round(img.height * escala);
        lienzo.getContext('2d').drawImage(img, 0, 0, lienzo.width, lienzo.height);
        try { cb(null, lienzo.toDataURL('image/jpeg', 0.72)); } catch (e) { cb('No se pudo procesar la imagen.'); }
      };
      img.onerror = function () { cb('La imagen no se pudo leer.'); };
      img.src = lector.result;
    };
    lector.onerror = function () { cb('No se pudo leer el archivo.'); };
    lector.readAsDataURL(archivo);
  }

  return {
    toast: toast,
    modal: modal,
    confirmar: confirmar,
    badgeEstadoObligacion: badgeEstadoObligacion,
    vacio: vacio,
    esqueletoTarjetas: esqueletoTarjetas,
    esqueletoLineas: esqueletoLineas,
    ponerError: ponerError,
    limpiarErrores: limpiarErrores,
    cargando: cargando,
    etiquetaDemo: etiquetaDemo,
    procesarImagen: procesarImagen
  };
})();