window.Views = window.Views || {};

Views.reclamos = (function () {
  var FOTO_DEMO = 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'><rect width='400' height='300' fill='#CFE0EE'/><rect y='210' width='400' height='90' fill='#9DB8CC'/><circle cx='330' cy='56' r='26' fill='#F2E9C9'/><rect x='60' y='120' width='120' height='90' fill='#768FA5'/><polygon points='60,120 120,70 180,120' fill='#5E7589'/><rect x='250' y='150' width='70' height='60' fill='#768FA5'/></svg>`);
  var w = null;

  function badgeReclamo(estado) {
    var mapa = {
      'Recibido': 'b-info', 'En revisión': 'b-aviso', 'Derivado al área correspondiente': 'b-info',
      'En resolución': 'b-aviso', 'Resuelto': 'b-exito', 'Requiere información': 'b-aviso', 'No corresponde': 'b-neutra'
    };
    var iconos = { 'Recibido': 'inbox', 'En revisión': 'search', 'Derivado al área correspondiente': 'send', 'En resolución': 'wrench', 'Resuelto': 'check-circle', 'Requiere información': 'help-circle', 'No corresponde': 'x-circle' };
    return `<span class='badge ${mapa[estado] || 'b-neutra'}'>${Icons.r(iconos[estado] || 'info')}${U.escape(estado)}</span>`;
  }

  function main() {
    var st = Store.state;
    var html = `
      <div class='saludo'>
        <div>
          <h1>Reclamos ciudadanos</h1>
          <p class='sub'>Contanos un problema de tu barrio y seguí su resolución.</p>
        </div>
      </div>
      <div class='fila-acciones horizontal' style='margin-top:0'>
        <a class='btn btn-primario' href='#/reclamos/nuevo'>${Icons.r('plus', 'i-18')} Nuevo reclamo</a>
      </div>
      <section class='seccion'>
        <div class='seccion-cabeza'><h2>Mis reclamos (demo)</h2>${UI.etiquetaDemo()}</div>
        ${st.reclamos.length ? `<div class='lista'>${st.reclamos.map(function (r) {
          var cat = DEMO.catalogos.reclamoCategorias.filter(function (c) { return c.id === r.categoria; })[0] || { nombre: r.categoria, icono: 'help-circle' };
          return `
          <a class='item' href='#/reclamos/detalle/${r.id}'>
            <span class='tinte t-azul item-ico'>${Icons.r(cat.icono)}</span>
            <span class='item-cuerpo'>
              <span class='item-titulo'>${U.escape(r.titulo)}</span>
              <span class='item-sub'><span>${r.numero}</span><span>${U.fecha(r.fecha)}</span><span>${cat.nombre}</span></span>
              <span class='item-sub' style='margin-top:6px'>${badgeReclamo(r.estado)}</span>
            </span>
            <span class='flecha'>${Icons.r('chevron-right')}</span>
          </a>`;
        }).join('')}</div>` : UI.vacio({ icono: 'megaphone', titulo: 'No enviaste reclamos todavía', texto: 'Cuando lo hagas, van a aparecer acá con su seguimiento.', accion: `<a class='btn btn-suave' href='#/reclamos/nuevo'>${Icons.r('plus', 'i-16')} Crear mi primer reclamo</a>` })}
      </section>`;
    return { titulo: 'Reclamos', html: html };
  }

  function nuevo() {
    if (!w) w = { paso: 1, cat: null, titulo: '', descripcion: '', barrio: DEMO.catalogos.barrios[0], direccion: '', contactar: false, foto: null, mapa: null, creado: null };
    var html = '';
    if (w.paso === 1) {
      html = `
        <a class='enlace' href='#/reclamos'>${Icons.r('arrow-left', 'i-16')} Cancelar</a>
        <div class='pasos' aria-hidden='true'><span class='completo'></span><span></span><span></span></div>
        <p class='paso-texto'>Paso 1 de 3 · ¿Qué está pasando?</p>
        <h2 class='mt-8'>Elegí la categoría del reclamo</h2>
        <div class='accesos'>
          ${DEMO.catalogos.reclamoCategorias.map(function (c) {
            return `<button type='button' class='acceso' data-categoria='${c.id}'>
              <span class='tinte ${w.cat === c.id ? 't-verde' : 't-azul'}'>${Icons.r(c.icono, 'i-22')}</span>${c.nombre}
            </button>`;
          }).join('')}
        </div>
        <div class='fila-acciones'>
          <button type='button' class='btn btn-primario btn-bloque' id='rec-sig' ${w.cat ? '' : 'disabled'}>${Icons.r('chevron-right', 'i-18')} Continuar</button>
        </div>`;
    }
    if (w.paso === 2) {
      var cat = DEMO.catalogos.reclamoCategorias.filter(function (c) { return c.id === w.cat; })[0];
      html = `
        <a class='enlace' href='#/reclamos'>${Icons.r('arrow-left', 'i-16')} Cancelar</a>
        <div class='pasos' aria-hidden='true'><span class='completo'></span><span class='completo'></span><span></span></div>
        <p class='paso-texto'>Paso 2 de 3 · Contanos el problema (${cat.nombre})</p>
        <div class='card'>
          <div class='campo'>
            <label for='rec-titulo'>Título breve</label>
            <input id='rec-titulo' class='control' type='text' maxlength='80' value='${U.escape(w.titulo)}' placeholder='Ej: Luminaria apagada frente al 340'>
            <span class='ayuda'>Máximo 80 caracteres.</span>
          </div>
          <div class='campo'>
            <label for='rec-desc'>Descripción</label>
            <textarea id='rec-desc' class='control' maxlength='600' placeholder='Contá qué pasa, desde cuándo y cómo afecta…'>${U.escape(w.descripcion)}</textarea>
            <span class='ayuda'>Mínimo 20 caracteres.</span>
          </div>
          <div class='grupo-campos'>
            <div class='campo'>
              <label for='rec-barrio'>Barrio o zona</label>
              <select id='rec-barrio' class='control'>${DEMO.catalogos.barrios.map(function (b) { return `<option ${w.barrio === b ? 'selected' : ''}>${U.escape(b)}</option>`; }).join('')}</select>
            </div>
            <div class='campo'>
              <label for='rec-dir'>Dirección o referencia</label>
              <input id='rec-dir' class='control' type='text' maxlength='120' value='${U.escape(w.direccion)}' placeholder='Calle y altura, o esquina'>
            </div>
          </div>
          <div class='campo'>
            <label>Ubicación en el mapa (simulado)</label>
            <div class='mapa-sim' id='rec-mapa' role='button' tabindex='0' aria-label='Tocá el mapa para marcar la ubicación aproximada'>
              ${w.mapa ? `<span class='mapa-pin' style='left:${w.mapa.x}%;top:${w.mapa.y}%'>${Icons.r('map-pin')}</span>` : ''}
              <span class='mapa-rotulo'>Mapa simulado — en la app final sería interactivo</span>
            </div>
            ${w.mapa ? `<span class='ayuda'>Marcaste una posición aproximada: ${w.mapa.texto}</span>` : '<span class="ayuda">Opcional: tocá el mapa para marcar el punto.</span>'}
          </div>
          <div class='campo'>
            <label>Fotografía (opcional)</label>
            <input type='file' id='rec-foto' accept='image/*' class='oculto'>
            <div class='acciones-foto'>
              <button type='button' class='btn btn-secundario btn-sm' id='rec-foto-btn'>${Icons.r('camera', 'i-16')} ${w.foto ? 'Cambiar foto' : 'Adjuntar foto'}</button>
              <button type='button' class='btn btn-fantasma btn-sm' id='rec-foto-demo'>${Icons.r('image', 'i-16')} Usar foto de ejemplo</button>
              ${w.foto ? `<button type='button' class='btn btn-fantasma btn-sm' id='rec-foto-quitar'>${Icons.r('trash', 'i-16')} Quitar</button>` : ''}
            </div>
            ${w.foto ? `<img src='${w.foto}' alt='Vista previa de la foto adjunta (demo)' class='foto-previa'>` : ''}
            <span class='ayuda'>Imagen de hasta 3 MB. Se reduce automáticamente para guardarla en la demo.</span>
          </div>
          <div class='fila-switch'>
            <span class='texto'><strong>Quiero que me contacten</strong><span>Sólo si necesitan más datos (demo, no se envía nada).</span></span>
            <label class='switch'><input type='checkbox' id='rec-contactar' ${w.contactar ? 'checked' : ''}><span class='pista'></span><span class='bolita'></span></label>
          </div>
          <div class='fila-acciones'>
            <button type='button' class='btn btn-primario btn-bloque' id='rec-sig'>${Icons.r('chevron-right', 'i-18')} Revisar datos</button>
          </div>
        </div>`;
    }
    if (w.paso === 3) { html = revision(); }
    if (w.paso === 4) {
      html = `<div class='centrado-pane'><span class='spinner' style='width:44px;height:44px'></span><h2>Enviando reclamo de demostración…</h2></div>`;
    }
    if (w.paso === 5 && w.creado) {
      html = `
        <div class='centrado-pane'>
          <span class='circulo-ico t-verde pop'>${Icons.r('check-circle', 'i-44')}</span>
          <h1>¡Reclamo enviado!</h1>
          <p class='sub centrado'>Guardamos tu reclamo con el número <strong>${w.creado.numero}</strong>. Es una simulación: ningún área municipal recibió este aviso.</p>
        </div>
        <div class='card'>
          <div class='filas'>
            <div class='fila-datos'><span class='clave'>Categoría</span><span class='valor'>${(DEMO.catalogos.reclamoCategorias.filter(function (c) { return c.id === w.creado.categoria; })[0] || {}).nombre || '-'}</span></div>
            <div class='fila-datos'><span class='clave'>Título</span><span class='valor'>${U.escape(w.creado.titulo)}</span></div>
            <div class='fila-datos'><span class='clave'>Ubicación</span><span class='valor'>${U.escape(w.creado.barrio)} · ${U.escape(w.creado.direccion)}</span></div>
            <div class='fila-datos'><span class='clave'>Fecha</span><span class='valor'>${U.fecha(w.creado.fecha)}</span></div>
            <div class='fila-datos'><span class='clave'>Estado</span><span class='valor'>Recibido</span></div>
          </div>
          <div class='fila-acciones'>
            <a class='btn btn-primario btn-bloque' href='#/reclamos/detalle/${w.creado.id}'>${Icons.r('history', 'i-18')} Ver seguimiento</a>
            <a class='btn btn-secundario btn-bloque' href='#/inicio'>${Icons.r('home', 'i-18')} Volver al inicio</a>
          </div>
        </div>`;
    }
    return { titulo: 'Nuevo reclamo', html: html, after: function (raiz) { enlazarNuevo(raiz); } };
  }

  function revision() {
    var cat = DEMO.catalogos.reclamoCategorias.filter(function (c) { return c.id === w.cat; })[0];
    return `
      <a class='enlace' href='#/reclamos'>${Icons.r('arrow-left', 'i-16')} Cancelar</a>
      <div class='pasos' aria-hidden='true'><span class='completo'></span><span class='completo'></span><span class='completo'></span></div>
      <p class='paso-texto'>Paso 3 de 3 · Revisá antes de enviar</p>
      <div class='card'>
        <div class='filas'>
          <div class='fila-datos'><span class='clave'>Categoría <button type='button' class='enlace' data-editar='1'>editar</button></span><span class='valor'>${cat.nombre}</span></div>
          <div class='fila-datos'><span class='clave'>Título <button type='button' class='enlace' data-editar='2'>editar</button></span><span class='valor'>${U.escape(w.titulo)}</span></div>
          <div class='fila-datos'><span class='clave'>Descripción <button type='button' class='enlace' data-editar='2'>editar</button></span><span class='valor'>${U.escape(w.descripcion)}</span></div>
          <div class='fila-datos'><span class='clave'>Barrio <button type='button' class='enlace' data-editar='2'>editar</button></span><span class='valor'>${U.escape(w.barrio)}</span></div>
          <div class='fila-datos'><span class='clave'>Dirección <button type='button' class='enlace' data-editar='2'>editar</button></span><span class='valor'>${U.escape(w.direccion || 'No indicada')}</span></div>
          <div class='fila-datos'><span class='clave'>Mapa</span><span class='valor'>${w.mapa ? 'Punto marcado (simulado)' : 'Sin punto'}</span></div>
          <div class='fila-datos'><span class='clave'>Foto</span><span class='valor'>${w.foto ? 'Adjuntada' : 'Sin foto'}</span></div>
          <div class='fila-datos'><span class='clave'>Contacto</span><span class='valor'>${w.contactar ? 'Solicita contacto' : 'No requiere'}</span></div>
        </div>
        <div class='alerta a-aviso'>${Icons.r('alert-triangle')}<span>Este reclamo es parte de la demostración: no se envía a ninguna dependencia municipal real.</span></div>
        <div class='fila-acciones'>
          <button type='button' class='btn btn-primario btn-bloque' id='rec-enviar'>${Icons.r('send', 'i-18')} Enviar reclamo (demo)</button>
        </div>
      </div>`;
  }

  function enlazarNuevo(raiz) {
    raiz.querySelectorAll('[data-categoria]').forEach(function (b) {
      b.addEventListener('click', function () {
        w.cat = b.getAttribute('data-categoria');
        Router.refrescar();
      });
    });
    var sig = raiz.querySelector('#rec-sig');
    if (sig && w.paso === 1) sig.addEventListener('click', function () { w.paso = 2; Router.refrescar(); });
    if (sig && w.paso === 2) {
      sig.addEventListener('click', function () {
        UI.limpiarErrores(raiz);
        var titulo = raiz.querySelector('#rec-titulo');
        var desc = raiz.querySelector('#rec-desc');
        var dir = raiz.querySelector('#rec-dir');
        var barrio = raiz.querySelector('#rec-barrio');
        var ok = true;
        if (!titulo.value.trim()) { UI.ponerError(titulo, 'Escribí un título breve.'); ok = false; }
        if (desc.value.trim().length < 20) { UI.ponerError(desc, 'La descripción necesita al menos 20 caracteres.'); ok = false; }
        if (!dir.value.trim()) { UI.ponerError(dir, 'Indicá una dirección o referencia.'); ok = false; }
        if (!ok) return;
        w.titulo = titulo.value.trim();
        w.descripcion = desc.value.trim();
        w.direccion = dir.value.trim();
        w.barrio = barrio.value;
        w.contactar = !!(raiz.querySelector('#rec-contactar') || {}).checked;
        w.paso = 3;
        Router.refrescar();
      });
    }
    var mapa = raiz.querySelector('#rec-mapa');
    if (mapa) {
      var marcar = function (e) {
        var rect = mapa.getBoundingClientRect();
        var x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
        var y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
        x = Math.max(4, Math.min(96, x)); y = Math.max(8, Math.min(94, y));
        w.mapa = { x: x, y: y, texto: 'aprox. ' + (29 + y / 100).toFixed(3) + ' S, ' + (59.7 + x / 100).toFixed(3) + ' O (simulado)' };
        Router.refrescar();
      };
      mapa.addEventListener('click', marcar);
      mapa.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          var r2 = mapa.getBoundingClientRect();
          marcar({ clientX: r2.left + r2.width / 2, clientY: r2.top + r2.height / 2 });
        }
      });
    }
    var btnFoto = raiz.querySelector('#rec-foto-btn');
    var inputFoto = raiz.querySelector('#rec-foto');
    if (btnFoto && inputFoto) {
      btnFoto.addEventListener('click', function () { inputFoto.click(); });
      inputFoto.addEventListener('change', function () {
        var f = inputFoto.files && inputFoto.files[0];
        if (!f) return;
        if (!/^image\//.test(f.type)) { UI.toast('El archivo debe ser una imagen.', 'error'); return; }
        if (f.size > 3 * 1024 * 1024) { UI.toast('La imagen supera los 3 MB permitidos.', 'error'); return; }
        var lector = new FileReader();
        lector.onload = function () {
          var img = new Image();
          img.onload = function () {
            var max = 900;
            var escala = Math.min(1, max / Math.max(img.width, img.height));
            var lienzo = document.createElement('canvas');
            lienzo.width = Math.round(img.width * escala);
            lienzo.height = Math.round(img.height * escala);
            lienzo.getContext('2d').drawImage(img, 0, 0, lienzo.width, lienzo.height);
            try { w.foto = lienzo.toDataURL('image/jpeg', 0.72); } catch (e) { UI.toast('No se pudo procesar la imagen.', 'error'); return; }
            Router.refrescar();
          };
          img.onerror = function () { UI.toast('La imagen no se pudo leer.', 'error'); };
          img.src = lector.result;
        };
        lector.onerror = function () { UI.toast('No se pudo leer el archivo.', 'error'); };
        lector.readAsDataURL(f);
      });
    }
    var btnDemo = raiz.querySelector('#rec-foto-demo');
    if (btnDemo) btnDemo.addEventListener('click', function () { w.foto = FOTO_DEMO; Router.refrescar(); });
    var btnQuitar = raiz.querySelector('#rec-foto-quitar');
    if (btnQuitar) btnQuitar.addEventListener('click', function () { w.foto = null; Router.refrescar(); });
    raiz.querySelectorAll('[data-editar]').forEach(function (b) {
      b.addEventListener('click', function () { w.paso = Number(b.getAttribute('data-editar')); Router.refrescar(); });
    });
    var enviar = raiz.querySelector('#rec-enviar');
    if (enviar) enviar.addEventListener('click', function () {
      w.paso = 4;
      Router.refrescar();
      setTimeout(function () {
        w.creado = Servicios.crearReclamo({ categoria: w.cat, titulo: w.titulo, descripcion: w.descripcion, barrio: w.barrio, direccion: w.direccion, ubicacionMapa: w.mapa, foto: w.foto, contacto: w.contactar ? { email: Store.state.usuario.email, telefono: Store.state.usuario.telefono } : null });
        w.paso = 5;
        Router.refrescar();
        UI.toast('Reclamo registrado en la demo.', 'exito');
      }, 900);
    });
  }

  var iconosEstado = { 'Recibido': 'inbox', 'En revisión': 'search', 'Derivado al área correspondiente': 'send', 'En resolución': 'wrench', 'Resuelto': 'check-circle', 'Requiere información': 'help-circle', 'No corresponde': 'x-circle' };

  function timelineHtml(rec) {
    var estados = DEMO.catalogos.reclamoEstados;
    var idxActual = -1;
    rec.timeline.forEach(function (t) {
      var i = estados.indexOf(t.estado);
      if (i > idxActual) idxActual = i;
    });
    var porEstado = {};
    rec.timeline.forEach(function (t) { porEstado[t.estado] = t; });
    var out = '';
    estados.forEach(function (estado, i) {
      var hecho = i <= idxActual && porEstado[estado];
      var actual = hecho && i === idxActual;
      out += `
        <li class='tl-item ${hecho ? (actual ? 'actual' : 'hecho') : 'futuro'}'>
          <span class='tl-punto'>${Icons.r(hecho ? (iconosEstado[estado] || 'check') : 'clock', 'i-16')}</span>
          <div class='tl-estado'>${U.escape(estado)}</div>
          ${hecho && porEstado[estado] ? `<div class='tl-fecha'>${U.fechaHora(porEstado[estado].fecha)}</div>` : ''}
          ${hecho && porEstado[estado].comentario ? `<div class='tl-comentario'>${U.escape(porEstado[estado].comentario)}</div>` : ''}
        </li>`;
    });
    rec.timeline.forEach(function (t) {
      if (estados.indexOf(t.estado) >= 0) return;
      out += `
        <li class='tl-item hecho'>
          <span class='tl-punto'>${Icons.r(iconosEstado[t.estado] || 'info', 'i-16')}</span>
          <div class='tl-estado'>${U.escape(t.estado)}</div>
          <div class='tl-fecha'>${U.fechaHora(t.fecha)}</div>
          <div class='tl-comentario'>${U.escape(t.comentario || DEMO.catalogos.reclamoEstadosInfo[t.estado] || '')}</div>
        </li>`;
    });
    return `<ol class='timeline'>${out}</ol>`;
  }

  function detalle(id) {
    var rec = Store.state.reclamos.filter(function (r) { return r.id === id; })[0];
    if (!rec) return Views.noEncontrado();
    var cat = DEMO.catalogos.reclamoCategorias.filter(function (c) { return c.id === rec.categoria; })[0] || { nombre: rec.categoria, icono: 'help-circle' };
    var esBase = DEMO.catalogos.reclamoEstados.indexOf(rec.estado) >= 0;
    var puedeAvanzar = esBase && rec.estado !== 'Resuelto';
    var html = `
      <a class='enlace' href='#/reclamos'>${Icons.r('arrow-left', 'i-16')} Volver a reclamos</a>
      <div class='card mt-8'>
        <div style='display:flex;align-items:center;gap:12px'>
          <span class='tinte t-azul'>${Icons.r(cat.icono, 'i-22')}</span>
          <div style='flex:1'>
            <h2 style='margin:0'>${U.escape(rec.titulo)}</h2>
            <p class='sub' style='margin:2px 0 0'>${rec.numero} · ${cat.nombre}</p>
          </div>
          ${badgeReclamo(rec.estado)}
        </div>
        <div class='filas mt-16'>
          <div class='fila-datos'><span class='clave'>Ingresado</span><span class='valor'>${U.fechaHora(rec.fecha)}</span></div>
          <div class='fila-datos'><span class='clave'>Barrio</span><span class='valor'>${U.escape(rec.barrio)}</span></div>
          <div class='fila-datos'><span class='clave'>Dirección</span><span class='valor'>${U.escape(rec.direccion)}</span></div>
          ${rec.ubicacionMapa ? `<div class='fila-datos'><span class='clave'>Punto en mapa</span><span class='valor'>${U.escape(rec.ubicacionMapa.texto)}</span></div>` : ''}
        </div>
        <p class='mt-8'>${U.escape(rec.descripcion)}</p>
        ${rec.foto ? `<img src='${rec.foto}' alt='Foto adjuntada en el reclamo (demo)' class='foto-previa'>` : ''}
        ${rec.estado === 'Requiere información' ? `<div class='alerta a-aviso'>${Icons.r('help-circle')}<span>El área necesita datos adicionales. Podés responder desde acá (simulado).</span></div>
        <div class='campo'><label for='rec-respuesta'>Tu respuesta</label><textarea id='rec-respuesta' class='control' placeholder='Escribí la información adicional…'></textarea></div>
        <button type='button' class='btn btn-secundario btn-bloque' id='rec-responder'>${Icons.r('send', 'i-16')} Enviar información (demo)</button>` : ''}
        ${rec.estado === 'No corresponde' ? `<div class='alerta a-info'>${Icons.r('x-circle')}<span>${U.escape(DEMO.catalogos.reclamoEstadosInfo['No corresponde'])}</span></div>` : ''}
        <div class='alerta a-aviso mt-8'>${Icons.r('alert-triangle')}<span>Los cambios de estado son simulados en tu dispositivo. Ningún funcionario recibió ni actualizó este reclamo.</span></div>
      </div>
      <section class='seccion'>
        <div class='seccion-cabeza'><h2>Seguimiento</h2>${puedeAvanzar ? `<button type='button' class='btn btn-suave btn-sm' id='rec-avanzar'>${Icons.r('refresh', 'i-14')} Simular avance</button>` : ''}</div>
        <div class='card'>${timelineHtml(rec)}</div>
      </section>`;
    return {
      titulo: 'Seguimiento de reclamo',
      html: html,
      after: function (raiz) {
        var avanzar = raiz.querySelector('#rec-avanzar');
        if (avanzar) avanzar.addEventListener('click', function () {
          var nuevo = Servicios.avanzarReclamo(rec.id);
          if (nuevo) { UI.toast('El reclamo pasó a: ' + nuevo + ' (demo).', 'exito'); Router.refrescar(); }
        });
        var responder = raiz.querySelector('#rec-responder');
        if (responder) responder.addEventListener('click', function () {
          var ta = raiz.querySelector('#rec-respuesta');
          var texto = (ta.value || '').trim();
          if (texto.length < 5) { UI.ponerError(ta, 'Escribí tu respuesta (mínimo 5 caracteres).'); return; }
          rec.estado = 'En revisión';
          rec.timeline.push({ estado: 'En revisión', fecha: U.hoyISO(), comentario: 'El vecino envió información adicional (demo).' });
          Store.save();
          UI.toast('Respuesta enviada. El reclamo volvió a En revisión (demo).', 'exito');
          Router.refrescar();
        });
      }
    };
  }

  return { main: main, nuevo: nuevo, detalle: detalle, badgeReclamo: badgeReclamo, timelineHtml: timelineHtml };
})();