window.Views = window.Views || {};

Views.agua = (function () {
  var w = null;

  function buscar(id) {
    return Store.state.reportesAgua.filter(function (r) { return r.id === id; })[0] || null;
  }

  function nivelDef(nivel) {
    return DEMO.catalogos.nivelesAgua.filter(function (n) { return n.id === nivel; })[0] || DEMO.catalogos.nivelesAgua[0];
  }

  function badgeNivel(nivel) {
    var d = nivelDef(nivel);
    return `<span class='badge ${d.clase}'>${Icons.r(d.icono)}${d.nombre}</span>`;
  }

  function badgeEstado(estado) {
    var mapa = {
      'Recibido': { c: 'b-info', i: 'inbox' },
      'Verificado': { c: 'b-info', i: 'eye' },
      'En asistencia': { c: 'b-aviso', i: 'wrench' },
      'Cerrado': { c: 'b-exito', i: 'check-circle' }
    };
    var d = mapa[estado] || { c: 'b-neutra', i: 'info' };
    return `<span class='badge ${d.c}'>${Icons.r(d.i)}${U.escape(estado)}</span>`;
  }

  function main() {
    var lista = Store.state.reportesAgua;
    var activos = lista.filter(function (r) { return r.estado !== 'Cerrado'; }).length;
    var html = `
      <a class='enlace' href='#/inicio'>${Icons.r('arrow-left', 'i-16')} Volver al inicio</a>
      <div class='saludo mt-8'>
        <div>
          <h1>Alerta por lluvias</h1>
          <p class='sub'>Reportá si las lluvias están afectando tu vivienda (condición El Niño · demostración).</p>
        </div>
      </div>
      <div class='alerta a-aviso'>${Icons.r('alert-triangle')}<span>Herramienta de demostración: <strong>ninguna área municipal recibe estos reportes</strong>. Ante peligro inminente, comunicate con los canales de emergencia (911, Defensa Civil).</span></div>
      <div class='fila-acciones horizontal' style='margin-top:12px'>
        <a class='btn btn-primario' href='#/agua/nuevo'>${Icons.r('droplets', 'i-18')} Reportar mi situación</a>
      </div>
      <section class='seccion'>
        <div class='seccion-cabeza'><h2>Mis reportes ${activos ? `<span class='badge b-aviso'>${activos} activo${activos === 1 ? '' : 's'}</span>` : ''}</h2>${UI.etiquetaDemo()}</div>
        ${lista.length ? `<div class='lista'>${lista.map(function (r) {
          return `
          <a class='item' href='#/agua/detalle/${r.id}'>
            <span class='tinte ${r.nivel === 'critico' ? 't-rojo' : 't-ambar'} item-ico'>${Icons.r(nivelDef(r.nivel).icono, 'i-22')}</span>
            <span class='item-cuerpo'>
              <span class='item-titulo'>${nivelDef(r.nivel).nombre} de agua</span>
              <span class='item-sub'><span>${r.numero}</span><span>${U.escape(r.direccion)}</span><span>${U.fecha(r.fecha)}</span></span>
            </span>
            <span class='item-derecha'>${badgeEstado(r.estado)}</span>
            <span class='flecha'>${Icons.r('chevron-right')}</span>
          </a>`;
        }).join('')}</div>` : UI.vacio({ icono: 'droplets', titulo: 'No enviaste reportes', texto: 'Si las lluvias están afectando tu vivienda, reportalo desde acá en menos de un minuto.', accion: `<a class='btn btn-suave' href='#/agua/nuevo'>${Icons.r('droplets', 'i-16')} Hacer un reporte</a>` })}
      </section>`;
    return { titulo: 'Alerta por lluvias', html: html };
  }

  function nuevo() {
    if (!w) w = { paso: 1, nivel: null, foto: null, creado: null };
    var u = Store.state.usuario;
    var html = '';
    if (w.paso === 1) {
      html = `
        <a class='enlace' href='#/agua'>${Icons.r('arrow-left', 'i-16')} Cancelar</a>
        <h1 class='mt-8'>¿Estás siendo afectado por las lluvias?</h1>
        <p class='sub'>Elegí la situación que mejor describa lo que ocurre en tu vivienda. Toma menos de un minuto.</p>
        <div class='opciones mt-16' role='radiogroup' aria-label='Nivel de ingreso de agua'>
          ${DEMO.catalogos.nivelesAgua.map(function (n) {
            return `<label class='opcion opcion-nivel ${n.id === 'leve' ? 'esta-leve' : 'esta-critico'}'>
              <input type='radio' name='nivel' value='${n.id}' ${w.nivel === n.id ? 'checked' : ''}>
              <span class='tinte ${n.id === 'leve' ? 't-ambar' : 't-rojo'} item-ico'>${Icons.r(n.icono, 'i-26')}</span>
              <span style='flex:1'>
                <span class='opcion-titulo' style='display:block'>${n.nombre}</span>
                <span class='opcion-sub'>${n.texto}</span>
              </span>
              <span class='marca'>${Icons.r('check')}</span>
            </label>`;
          }).join('')}
        </div>
        <div class='card mt-16'>
          <div class='grupo-campos'>
            <div class='campo'>
              <label for='ag-dir'>Dirección del domicilio afectado</label>
              <input id='ag-dir' class='control' type='text' maxlength='120' placeholder='Ej: Calle 6 N°340'>
            </div>
            <div class='campo'>
              <label for='ag-barrio'>Barrio o zona</label>
              <select id='ag-barrio' class='control'>${DEMO.catalogos.barrios.map(function (b) { return `<option ${u.barrio === b ? 'selected' : ''}>${U.escape(b)}</option>`; }).join('')}</select>
            </div>
          </div>
          <div class='campo'>
            <label>Ubicación en el mapa</label>
            <div class='mapa-sim' id='ag-mapa' aria-label='Mapa para marcar la ubicación de la vivienda'></div>
            <span class='ayuda' id='ag-mapa-ayuda'>${w.mapa ? 'Ubicación marcada: ' + w.mapa.texto : 'Opcional: tocá el mapa para marcar el punto.'}</span>
          </div>
          <div class='grupo-campos'>
            <div class='campo'>
              <label for='ag-personas'>¿Cuántas personas hay en la vivienda?</label>
              <input id='ag-personas' class='control' type='number' min='1' max='30' value='1' inputmode='numeric'>
            </div>
            <div class='campo'>
              <label for='ag-tel'>Teléfono para contactarte</label>
              <input id='ag-tel' class='control' type='tel' maxlength='25' value='${U.escape(u.telefono)}'>
            </div>
          </div>
          <div class='fila-switch'>
            <span class='texto'><strong>Alguien necesita asistencia especial</strong><span>Adultos mayores, embarazadas, enfermedades o discapacidad.</span></span>
            <label class='switch'><input type='checkbox' id='ag-asistencia'><span class='pista'></span><span class='bolita'></span></label>
          </div>
          <div class='campo'>
            <label for='ag-notas'>Contanos más (opcional)</label>
            <textarea id='ag-notas' class='control' maxlength='400' placeholder='Ej: hay unos 20 cm de agua en el patio desde anoche y sigue subiendo…'></textarea>
          </div>
          <div class='campo'>
            <label>Foto de la situación (opcional)</label>
            <input type='file' id='ag-foto' accept='image/*' class='oculto'>
            <div class='acciones-foto'>
              <button type='button' class='btn btn-secundario btn-sm' id='ag-foto-btn'>${Icons.r('camera', 'i-16')} ${w.foto ? 'Cambiar foto' : 'Adjuntar foto'}</button>
              ${w.foto ? `<button type='button' class='btn btn-fantasma btn-sm' id='ag-foto-quitar'>${Icons.r('trash', 'i-16')} Quitar</button>` : ''}
            </div>
            ${w.foto ? `<img src='${w.foto}' alt='Vista previa de la foto del reporte (demo)' class='foto-previa'>` : ''}
            <span class='ayuda'>Imagen de hasta 3 MB. Se reduce automáticamente.</span>
          </div>
          <div class='alerta a-aviso'>${Icons.r('alert-triangle')}<span>Reporte de demostración: no llega a ninguna dependencia real. Ante urgencias, llamá a los canales de emergencia.</span></div>
          <div class='fila-acciones'>
            <button type='button' class='btn btn-primario btn-bloque' id='ag-enviar'>${Icons.r('send', 'i-18')} Enviar reporte</button>
          </div>
        </div>`;
    }
    if (w.paso === 2) {
      html = `<div class='centrado-pane'><span class='spinner' style='width:44px;height:44px'></span><h2>Enviando reporte (demo)…</h2></div>`;
    }
    if (w.paso === 3 && w.creado) {
      var critico = w.creado.nivel === 'critico';
      var d = nivelDef(w.creado.nivel);
      html = `
        <div class='centrado-pane'>
          <span class='circulo-ico ${critico ? 't-rojo' : 't-ambar'} pop'>${Icons.r(d.icono, 'i-44')}</span>
          <h1>Reporte enviado</h1>
          <p class='sub centrado'>Número: <strong>${w.creado.numero}</strong> · ${d.nombre}</p>
        </div>
        <div class='card'>
          <div class='filas'>
            <div class='fila-datos'><span class='clave'>Domicilio</span><span class='valor'>${U.escape(w.creado.direccion)} · ${U.escape(w.creado.barrio)}</span></div>
            <div class='fila-datos'><span class='clave'>Personas en la vivienda</span><span class='valor'>${w.creado.personas}</span></div>
            <div class='fila-datos'><span class='clave'>Asistencia especial</span><span class='valor'>${w.creado.asistencia ? 'Sí, se informó' : 'No'}</span></div>
            <div class='fila-datos'><span class='clave'>Contacto</span><span class='valor'>${U.escape(w.creado.telefono)}</span></div>
          </div>
          <div class='alerta ${critico ? 'a-peligro' : 'a-info'}'>${Icons.r(critico ? 'alert-triangle' : 'info')}<span>${critico ? 'Prioridad alta: en una implementación real, Defensa Civil te contactaría al teléfono indicado de inmediato.' : 'Tu reporte quedó registrado para seguimiento del área de Emergencias Hídricas (demo).'}</span></div>
          <div class='fila-acciones'>
            <a class='btn btn-primario btn-bloque' href='#/agua/detalle/${w.creado.id}'>${Icons.r('history', 'i-18')} Ver seguimiento</a>
            <a class='btn btn-secundario btn-bloque' href='#/agua'>${Icons.r('droplets', 'i-18')} Mis reportes</a>
            <a class='btn btn-fantasma btn-bloque' href='#/inicio'>${Icons.r('home', 'i-18')} Volver al inicio</a>
          </div>
        </div>`;
    }
    return { titulo: 'Reporte por lluvias', html: html, after: function (raiz) { enlazar(raiz); } };
  }

  function detalle(id) {
    var rep = buscar(id);
    if (!rep) return Views.noEncontrado();
    var d = nivelDef(rep.nivel);
    var puedeAvanzar = DEMO.catalogos.estadosAgua.indexOf(rep.estado) < DEMO.catalogos.estadosAgua.length - 1;
    var html = `
      <a class='enlace' href='#/agua'>${Icons.r('arrow-left', 'i-16')} Volver a mis reportes</a>
      <div class='card mt-8'>
        <div style='display:flex;align-items:center;gap:12px'>
          <span class='tinte ${rep.nivel === 'critico' ? 't-rojo' : 't-ambar'}'>${Icons.r(d.icono, 'i-22')}</span>
          <div style='flex:1'>
            <h2 style='margin:0'>${d.nombre} de agua</h2>
            <p class='sub' style='margin:2px 0 0'>${rep.numero} · ${U.fechaHora(rep.fecha)}</p>
          </div>
          ${badgeEstado(rep.estado)}
        </div>
        <div class='filas mt-16'>
          <div class='fila-datos'><span class='clave'>Domicilio</span><span class='valor'>${U.escape(rep.direccion)}</span></div>
          <div class='fila-datos'><span class='clave'>Barrio</span><span class='valor'>${U.escape(rep.barrio)}</span></div>
          ${rep.ubicacionMapa ? `<div class='fila-datos'><span class='clave'>Punto en mapa</span><span class='valor'>${U.escape(rep.ubicacionMapa.texto)}</span></div>` : ''}
          <div class='fila-datos'><span class='clave'>Personas en la vivienda</span><span class='valor'>${rep.personas}</span></div>
          <div class='fila-datos'><span class='clave'>Asistencia especial</span><span class='valor'>${rep.asistencia ? 'Sí, se informó' : 'No'}</span></div>
          <div class='fila-datos'><span class='clave'>Contacto</span><span class='valor'>${U.escape(rep.telefono)}</span></div>
          ${rep.notas ? `<div class='fila-datos'><span class='clave'>Detalle</span><span class='valor'>${U.escape(rep.notas)}</span></div>` : ''}
        </div>
        ${rep.foto ? `<img src='${rep.foto}' alt='Foto del reporte (demo)' class='foto-previa'>` : ''}
        ${rep.nivel === 'critico' ? `<div class='alerta a-peligro'>${Icons.r('alert-triangle')}<span>Reporte de nivel crítico: prioridad alta en la simulación.</span></div>` : ''}
        <div class='alerta a-aviso'>${Icons.r('alert-triangle')}<span>Estados simulados en tu dispositivo. Ninguna dependencia municipal recibió este reporte.</span></div>
      </div>
      <section class='seccion'>
        <div class='seccion-cabeza'><h2>Seguimiento</h2>${puedeAvanzar ? `<button type='button' class='btn btn-suave btn-sm' id='ag-avanzar'>${Icons.r('refresh', 'i-14')} Simular avance</button>` : ''}</div>
        <div class='card'>
          <ol class='timeline'>
            ${rep.timeline.map(function (h, i) {
              var ultimo = i === rep.timeline.length - 1;
              return `
              <li class='tl-item ${ultimo ? 'actual' : 'hecho'}'>
                <span class='tl-punto'>${Icons.r('check', 'i-16')}</span>
                <div class='tl-estado'>${U.escape(h.estado)}</div>
                <div class='tl-fecha'>${U.fechaHora(h.fecha)}</div>
                <div class='tl-comentario'>${U.escape(h.comentario)}</div>
              </li>`;
            }).join('')}
          </ol>
        </div>
      </section>`;
    return {
      titulo: 'Seguimiento de reporte',
      html: html,
      after: function (raiz) {
        var btn = raiz.querySelector('#ag-avanzar');
        if (btn) btn.addEventListener('click', function () {
          var nuevo = Servicios.avanzarReporteAgua(rep.id);
          if (nuevo) { UI.toast('El reporte pasó a: ' + nuevo + ' (demo).', 'exito'); Router.refrescar(); }
        });
      }
    };
  }

  function enlazar(raiz) {
    raiz.querySelectorAll('input[name=nivel]').forEach(function (r) {
      r.addEventListener('change', function () { w.nivel = r.value; });
    });
    var contMapa = raiz.querySelector('#ag-mapa');
    if (contMapa) {
      Mapa.crear(contMapa, {
        valor: w.mapa,
        onChange: function (lat, lng) {
          w.mapa = { lat: lat, lng: lng, texto: 'Lat ' + lat.toFixed(5) + ', Lng ' + lng.toFixed(5) };
          var ayuda = raiz.querySelector('#ag-mapa-ayuda');
          if (ayuda) ayuda.textContent = 'Ubicación marcada: ' + w.mapa.texto;
        }
      });
    }
    var btnFoto = raiz.querySelector('#ag-foto-btn');
    var inputFoto = raiz.querySelector('#ag-foto');
    if (btnFoto && inputFoto) {
      btnFoto.addEventListener('click', function () { inputFoto.click(); });
      inputFoto.addEventListener('change', function () {
        UI.procesarImagen(inputFoto.files && inputFoto.files[0], 900, function (err, dataUrl) {
          if (err) { UI.toast(err, 'error'); return; }
          w.foto = dataUrl;
          Router.refrescar();
        });
      });
    }
    var btnQuitar = raiz.querySelector('#ag-foto-quitar');
    if (btnQuitar) btnQuitar.addEventListener('click', function () { w.foto = null; Router.refrescar(); });
    var enviar = raiz.querySelector('#ag-enviar');
    if (enviar) enviar.addEventListener('click', function () {
      UI.limpiarErrores(raiz);
      var dir = raiz.querySelector('#ag-dir');
      var personas = raiz.querySelector('#ag-personas');
      var tel = raiz.querySelector('#ag-tel');
      var ok = true;
      if (!w.nivel) { UI.toast('Elegí primero si el ingreso es leve o crítico.', 'error'); window.scrollTo(0, 0); return; }
      if (!dir.value.trim()) { UI.ponerError(dir, 'Indicá la dirección.'); ok = false; }
      if (!personas.value || Number(personas.value) < 1) { UI.ponerError(personas, 'Indicá al menos 1 persona.'); ok = false; }
      if (!U.esTelefono(tel.value)) { UI.ponerError(tel, 'El teléfono necesita al menos 8 números.'); ok = false; }
      if (!ok) return;
      var datos = {
        nivel: w.nivel,
        direccion: dir.value.trim(),
        barrio: raiz.querySelector('#ag-barrio').value,
        personas: Math.max(1, Number(personas.value) || 1),
        asistencia: !!(raiz.querySelector('#ag-asistencia') || {}).checked,
        telefono: tel.value.trim(),
        notas: raiz.querySelector('#ag-notas').value.trim(),
        foto: w.foto,
        ubicacionMapa: w.mapa || null
      };
      w.paso = 2;
      Router.refrescar();
      var completar = function () {
        if (w.paso !== 2) return;
        try {
          w.creado = Servicios.crearReporteAgua(datos);
          w.paso = 3;
        } catch (e) {
          w.paso = 1;
          UI.toast('No se pudo registrar el reporte: ' + (e && e.message ? e.message : 'error inesperado') + '.', 'error', 5200);
        }
        Router.refrescar();
        if (w.paso === 3) UI.toast('Reporte registrado en la demo.', 'exito');
      };
      var vigilante = function () {
        if (w.paso !== 2) return;
        w.paso = 1;
        Router.refrescar();
        UI.toast('La simulación no respondió. Reintentá el envío.', 'error', 5200);
      };
      setTimeout(completar, 900);
      setTimeout(vigilante, 2600);
    });
  }

  return { main: main, nuevo: nuevo, detalle: detalle };
})();