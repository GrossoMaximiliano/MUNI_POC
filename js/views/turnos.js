window.Views = window.Views || {};

Views.turnos = (function () {
  var w = null;

  function fechasDisponibles() {
    var out = [];
    var d = new Date();
    while (out.length < 10) {
      d.setDate(d.getDate() + 1);
      var dia = d.getDay();
      if (dia === 0 || dia === 6) continue;
      out.push(new Date(d.getTime()));
    }
    return out;
  }

  function horariosOcupados(fechaISO) {
    var seed = 0;
    for (var i = 0; i < fechaISO.length; i++) seed = (seed + fechaISO.charCodeAt(i) * (i + 7)) % 997;
    var horarios = DEMO.catalogos.turnosHorarios;
    var ocupados = [];
    horarios.forEach(function (h, i) {
      if ((seed + i * 13) % 7 === 0) ocupados.push(h);
    });
    return ocupados;
  }

  function extrasFor(tipo) { return DEMO.catalogos.turnoExtras[tipo] || []; }

  function extrasHtml(tipo) {
    var campos = extrasFor(tipo);
    if (!campos.length) return '';
    return `<div class='mt-8'>${campos.map(function (c) {
      var valor = w.extras[c.key] || '';
      if (c.opciones) {
        return `<div class='campo'>
          <label for='ex-${c.key}'>${U.escape(c.label)}</label>
          <select id='ex-${c.key}' class='control' data-extra='${c.key}'>
            ${c.opciones.map(function (o) { return `<option ${valor === o ? 'selected' : ''}>${U.escape(o)}</option>`; }).join('')}
          </select>
        </div>`;
      }
      return `<div class='campo'>
        <label for='ex-${c.key}'>${U.escape(c.label)}</label>
        <input id='ex-${c.key}' class='control' type='text' maxlength='60' data-extra='${c.key}' value='${U.escape(valor)}' placeholder='${U.escape(c.placeholder || '')}'>
      </div>`;
    }).join('')}</div>`;
  }

  function depsPara(tipo) {
    var todas = DEMO.catalogos.dependencias;
    var ids = DEMO.catalogos.turnoDependencias[tipo];
    if (!ids) return todas;
    return todas.filter(function (d) { return ids.indexOf(d.id) >= 0; });
  }

  function nuevo() {
    if (!w) w = { paso: 1, tipo: null, dep: null, fecha: null, hora: null, extras: {}, creado: null };
    var html = '';
    if (w.paso === 1) {
      html = `
        <a class='enlace' href='#/turnos'>${Icons.r('arrow-left', 'i-16')} Cancelar</a>
        <div class='pasos' aria-hidden='true'><span class='completo'></span><span></span><span></span></div>
        <p class='paso-texto'>Paso 1 de 3 · Tipo de trámite</p>
        <div class='card'>
          <div class='opciones' role='radiogroup' aria-label='Tipo de trámite'>
            ${DEMO.catalogos.turnoTipos.map(function (t) {
              return `<label class='opcion'><input type='radio' name='tipo' value='${U.escape(t)}' ${w.tipo === t ? 'checked' : ''}><span class='tinte t-gris'>${Icons.r(t.indexOf('Castración') === 0 ? 'shield-check' : (t.indexOf('Licencia') === 0 || t.indexOf('Consulta psicológica') === 0 ? 'card' : 'clipboard'), 'i-22')}</span><span style='flex:1'><span class='opcion-titulo' style='display:block'>${U.escape(t)}</span></span><span class='marca'>${Icons.r('check')}</span></label>`;
            }).join('')}
          </div>
          <div id='tu-extras'>
            ${w.tipo ? extrasHtml(w.tipo) : `<p class='sub mt-8'>Elegí una opción para continuar. Los tipos marcados (demo) son flujos de ejemplo.</p>`}
          </div>
          <div class='fila-acciones'>
            <button type='button' class='btn btn-primario btn-bloque' id='tu-sig' ${w.tipo ? '' : 'disabled'}>${Icons.r('chevron-right', 'i-18')} Continuar</button>
          </div>
        </div>`;
    }
    if (w.paso === 2) {
      var ocupados = w.fecha ? horariosOcupados(w.fecha) : [];
      var dias = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
      var meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
      html = `
        <a class='enlace' href='#/turnos'>${Icons.r('arrow-left', 'i-16')} Cancelar</a>
        <div class='pasos' aria-hidden='true'><span class='completo'></span><span class='completo'></span><span></span></div>
        <p class='paso-texto'>Paso 2 de 3 · Dependencia, día y horario</p>
        <div class='card'>
          <div class='campo'>
            <label for='tu-dep'>Dependencia (datos de demostración)</label>
            <select id='tu-dep' class='control'>
              ${depsPara(w.tipo).map(function (d) {
                return `<option value='${d.id}' ${w.dep === d.id ? 'selected' : ''}>${U.escape(d.nombre)}</option>`;
              }).join('')}
            </select>
            ${depsPara(w.tipo).length === 1 ? `<span class='ayuda'>Este trámite se atiende sólo en esta dependencia (demo).</span>` : ''}
          </div>
          <div class='campo'>
            <label>Elegí un día</label>
            <div class='fechas'>
              ${fechasDisponibles().map(function (f) {
                var iso = f.getFullYear() + '-' + String(f.getMonth() + 1).padStart(2, '0') + '-' + String(f.getDate()).padStart(2, '0');
                return `<button type='button' class='fecha-chip ${w.fecha === iso ? 'activa' : ''}' data-fecha='${iso}'>
                  <span class='dia-semana'>${dias[f.getDay()]}</span>
                  <span class='dia-num'>${f.getDate()}</span>
                  <span class='dia-mes'>${meses[f.getMonth()]}</span>
                </button>`;
              }).join('')}
            </div>
          </div>
          <div id='tu-horarios-zona'>
            ${w.fecha ? `<div class='campo'>
              <label>Elegí un horario (disponibilidad simulada)</label>
              <div class='horarios'>
                ${DEMO.catalogos.turnosHorarios.map(function (h) {
                  var ocup = ocupados.indexOf(h) >= 0;
                  return `<button type='button' class='horario ${w.hora === h ? 'activa' : ''}' data-hora='${h}' ${ocup ? 'disabled' : ''}>${h}</button>`;
                }).join('')}
              </div>
              <span class='ayuda'>Los horarios tachados no están disponibles (simulación determinista por fecha).</span>
            </div>` : UI.esqueletoTarjetas(2)}
          </div>
          <div class='alerta a-info'>${Icons.r('info')}<span>La disponibilidad es simulada y no representa la agenda real de las oficinas.</span></div>
          <div class='fila-acciones'>
            <button type='button' class='btn btn-primario btn-bloque' id='tu-sig' ${w.fecha && w.hora ? '' : 'disabled'}>${Icons.r('chevron-right', 'i-18')} Revisar</button>
          </div>
        </div>`;
    }
    if (w.paso === 3) { html = revision(); }
    if (w.paso === 4) {
      html = `<div class='centrado-pane'><span class='spinner' style='width:44px;height:44px'></span><h2>Reservando turno (demo)…</h2></div>`;
    }
    if (w.paso === 5 && w.creado) {
      html = `
        <div class='centrado-pane'>
          <span class='circulo-ico t-verde pop'>${Icons.r('calendar-check', 'i-44')}</span>
          <h1>¡Turno reservado!</h1>
          <p class='sub centrado'>Número: <strong>${w.creado.numero}</strong> · Reserva simulada, sin validez.</p>
        </div>
        <div class='card'>
          <div class='filas'>
            <div class='fila-datos'><span class='clave'>Trámite</span><span class='valor'>${U.escape(w.creado.tipo)}</span></div>
            <div class='fila-datos'><span class='clave'>Dependencia</span><span class='valor'>${U.escape(w.creado.dependencia)}</span></div>
            <div class='fila-datos'><span class='clave'>Fecha y hora</span><span class='valor'>${U.fecha(w.creado.fecha)} · ${U.fechaHora(w.creado.fecha).slice(11)}</span></div>
          </div>
          <div class='fila-acciones'>
            <a class='btn btn-primario btn-bloque' href='#/turnos'>${Icons.r('calendar', 'i-18')} Ver mis turnos</a>
            <a class='btn btn-secundario btn-bloque' href='#/inicio'>${Icons.r('home', 'i-18')} Volver al inicio</a>
          </div>
        </div>`;
    }
    return { titulo: 'Nuevo turno', html: html, after: function (raiz) { enlazar(raiz); } };
  }

  function revision() {
    var dep = DEMO.catalogos.dependencias.filter(function (d) { return d.id === w.dep; })[0];
    return `
      <a class='enlace' href='#/turnos'>${Icons.r('arrow-left', 'i-16')} Cancelar</a>
      <div class='pasos' aria-hidden='true'><span class='completo'></span><span class='completo'></span><span class='completo'></span></div>
      <p class='paso-texto'>Paso 3 de 3 · Revisá tu turno</p>
      <div class='card'>
        <div class='filas'>
          <div class='fila-datos'><span class='clave'>Trámite <button type='button' class='enlace' data-editar='1'>editar</button></span><span class='valor'>${U.escape(w.tipo)}</span></div>
          ${extrasFor(w.tipo).map(function (c) {
            return `<div class='fila-datos'><span class='clave'>${U.escape(c.label)}</span><span class='valor'>${U.escape(w.extras[c.key] || '-')}</span></div>`;
          }).join('')}
          <div class='fila-datos'><span class='clave'>Dependencia</span><span class='valor'>${U.escape(dep.nombre)}</span></div>
          <div class='fila-datos'><span class='clave'>Dirección</span><span class='valor'>${U.escape(dep.direccion)}</span></div>
          <div class='fila-datos'><span class='clave'>Fecha y hora <button type='button' class='enlace' data-editar='2'>editar</button></span><span class='valor'>${U.fecha(w.fecha)} · ${w.hora} h</span></div>
        </div>
        <div class='alerta a-aviso'>${Icons.r('alert-triangle')}<span>Turno simulado: no representa disponibilidad real de la Municipalidad.</span></div>
        <div class='fila-acciones'>
          <button type='button' class='btn btn-primario btn-bloque' id='tu-confirmar'>${Icons.r('calendar-check', 'i-18')} Confirmar turno (demo)</button>
        </div>
      </div>`;
  }

  function enlazar(raiz) {
    raiz.querySelectorAll('input[name=tipo]').forEach(function (r) {
      r.addEventListener('change', function () {
        w.tipo = r.value;
        w.extras = {};
        w.dep = null;
        w.fecha = null;
        w.hora = null;
        Router.refrescar();
      });
    });
    var sig = raiz.querySelector('#tu-sig');
    if (sig && w.paso === 1) sig.addEventListener('click', function () {
      var sel = raiz.querySelector('input[name=tipo]:checked');
      if (!sel) { UI.toast('Elegí el tipo de trámite.', 'error'); return; }
      w.tipo = sel.value;
      w.extras = {};
      raiz.querySelectorAll('[data-extra]').forEach(function (i) {
        w.extras[i.getAttribute('data-extra')] = (i.value || '').trim();
      });
      var validas = depsPara(w.tipo);
      if (!validas.some(function (d) { return d.id === w.dep; })) w.dep = validas[0].id;
      w.paso = 2;
      Router.refrescar();
    });
    if (sig && w.paso === 2) sig.addEventListener('click', function () {
      var dep = raiz.querySelector('#tu-dep');
      w.dep = dep ? dep.value : w.dep;
      if (!w.fecha || !w.hora) { UI.toast('Elegí día y horario.', 'error'); return; }
      w.paso = 3;
      Router.refrescar();
    });
    raiz.querySelectorAll('[data-fecha]').forEach(function (b) {
      b.addEventListener('click', function () {
        var zona = raiz.querySelector('#tu-horarios-zona');
        if (zona) zona.innerHTML = UI.esqueletoTarjetas(2);
        var f = b.getAttribute('data-fecha');
        setTimeout(function () { w.fecha = f; w.hora = null; Router.refrescar(); }, 650);
      });
    });
    raiz.querySelectorAll('.horario:not(:disabled)').forEach(function (b) {
      b.addEventListener('click', function () {
        w.hora = b.getAttribute('data-hora');
        Router.refrescar();
      });
    });
    raiz.querySelectorAll('[data-editar]').forEach(function (b) {
      b.addEventListener('click', function () { w.paso = Number(b.getAttribute('data-editar')); Router.refrescar(); });
    });
    var confirmar = raiz.querySelector('#tu-confirmar');
    if (confirmar) confirmar.addEventListener('click', function () {
      var dep = DEMO.catalogos.dependencias.filter(function (d) { return d.id === w.dep; })[0] || depsPara(w.tipo)[0] || DEMO.catalogos.dependencias[0];
      var notas = extrasFor(w.tipo).map(function (c) { return w.extras[c.key]; }).filter(Boolean).join(' · ');
      w.paso = 4;
      Router.refrescar();
      setTimeout(function () {
        w.creado = Servicios.reservarTurno({ tipo: w.tipo, dependencia: dep.nombre, direccion: dep.direccion, fecha: w.fecha + 'T' + w.hora, notas: notas });
        w.paso = 5;
        Router.refrescar();
        UI.toast('Turno reservado en la demo.', 'exito');
      }, 900);
    });
  }

  function misTurnos() {
    var lista = Store.state.turnos;
    var hoy = U.hoyISO().slice(0, 10);
    var html = `
      <h1>Mis turnos</h1>
      <p class='sub'>Turnos de demostración. La disponibilidad real depende de la oficina municipal.</p>
      <div class='fila-acciones horizontal' style='margin-top:8px'>
        <a class='btn btn-primario' href='#/turnos/nuevo'>${Icons.r('plus', 'i-18')} Pedir un turno</a>
      </div>
      <section class='seccion'>
        ${lista.length ? `<div class='lista'>${lista.map(function (t) {
          var confirmado = t.estado === 'Confirmado';
          var pasado = t.fecha.slice(0, 10) < hoy;
          return `
          <div class='item'>
            <span class='tinte ${confirmado && !pasado ? 't-verde' : 't-gris'} item-ico'>${Icons.r('calendar-check')}</span>
            <span class='item-cuerpo'>
              <span class='item-titulo'>${U.escape(t.tipo)}</span>
              <span class='item-sub'><span>${t.numero}</span><span>${U.fechaLarga(t.fecha)}</span><span>${U.fechaHora(t.fecha).slice(11)}</span><span>${U.escape(t.dependencia)}</span>${t.notas ? `<span>${U.escape(t.notas)}</span>` : ''}</span>
            </span>
            <span class='item-derecha'>
              <span class='badge ${t.estado === 'Cancelado' ? 'b-neutra' : (pasado ? 'b-neutra' : 'b-exito')}'>${Icons.r(t.estado === 'Cancelado' ? 'x-circle' : (pasado ? 'clock' : 'check-circle'))}${t.estado === 'Cancelado' ? 'Cancelado' : (pasado ? 'Realizado' : 'Confirmado')}</span>
              ${confirmado && !pasado ? `<button type='button' class='btn btn-fantasma btn-sm' data-cancelar='${t.id}'>${Icons.r('trash', 'i-14')} Cancelar</button>` : ''}
            </span>
          </div>`;
        }).join('')}</div>` : UI.vacio({ icono: 'calendar', titulo: 'No tenés turnos', texto: 'Reservá un turno de demostración para ver cómo funcionaría.', accion: `<a class='btn btn-suave' href='#/turnos/nuevo'>${Icons.r('plus', 'i-16')} Pedir un turno</a>` })}
      </section>`;
    return {
      titulo: 'Mis turnos',
      html: html,
      after: function (raiz) {
        raiz.querySelectorAll('[data-cancelar]').forEach(function (b) {
          b.addEventListener('click', function () {
            UI.confirmar({
              titulo: 'Cancelar turno',
              mensaje: '¿Seguro que querés cancelar este turno de demostración?',
              textoConfirmar: 'Sí, cancelar',
              peligro: true
            }).then(function (ok) {
              if (!ok) return;
              Servicios.cancelarTurno(b.getAttribute('data-cancelar'));
              UI.toast('Turno cancelado (demo).', 'info');
              Router.refrescar();
            });
          });
        });
      }
    };
  }

  return { nuevo: nuevo, misTurnos: misTurnos };
})();