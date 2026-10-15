window.Views = window.Views || {};

Views.perfil = (function () {
  function filaDato(clave, valor) {
    return `<div class='fila-datos'><span class='clave'>${U.escape(clave)}</span><span class='valor'>${U.escape(valor || '-')}</span></div>`;
  }

  function main() {
    var st = Store.state;
    if (st.sesion && st.sesion.rol === 'admin') return adminMain();
    var u = st.usuario;
    var s = st.sesion;
    var pagos = st.pagos.slice(0, 3);
    var reclamos = st.reclamos.slice(0, 3);
    var tramites = st.tramites.slice(0, 3);
    var prefs = u.notificaciones;
    var html = `
      <div class='card' style='display:flex;align-items:center;gap:14px'>
        <span class='avatar avatar-lg'>${U.escape(U.iniciales(u.nombre, u.apellido))}</span>
        <div style='flex:1'>
          <h2 style='margin:0'>${U.escape(u.nombre + ' ' + u.apellido)}</h2>
          <p class='sub' style='margin:2px 0 0'>Vecino de demostración · ${U.escape(u.barrio)}</p>
        </div>
        <a class='btn btn-secundario btn-sm' href='#/perfil/editar'>${Icons.r('pencil', 'i-14')} Editar</a>
      </div>

      <section class='seccion'>
        <div class='seccion-cabeza'><h2>Mis datos</h2></div>
        <div class='card'>
          ${filaDato('Cuenta de acceso (demo)', s.email)}
          ${filaDato('Correo electrónico (ejemplo)', u.email)}
          ${filaDato('Teléfono (ejemplo)', u.telefono)}
          ${filaDato('Domicilio declarado (ejemplo)', u.domicilio)}
          ${filaDato('Barrio', u.barrio)}
        </div>
      </section>

      <section class='seccion'>
        <div class='seccion-cabeza'><h2>Preferencias de notificaciones</h2></div>
        <div class='card'>
          ${[['vencimientos', 'Vencimientos y deudas', 'Avisos sobre obligaciones pendientes'], ['reclamos', 'Reclamos', 'Cambios de estado de tus reclamos'], ['tramites', 'Trámites', 'Actualizaciones de tus solicitudes'], ['turnos', 'Turnos', 'Recordatorios de turnos reservados'], ['comunicados', 'Comunicados (demo)', 'Novedades municipales de ejemplo']].map(function (p) {
            return `<div class='fila-switch'>
              <span class='texto'><strong>${p[1]}</strong><span>${p[2]}</span></span>
              <label class='switch'><input type='checkbox' data-pref='${p[0]}' ${prefs[p[0]] ? 'checked' : ''}><span class='pista'></span><span class='bolita'></span></label>
            </div>`;
          }).join('')}
        </div>
      </section>

      <section class='seccion'>
        <div class='seccion-cabeza'><h2>Mis vehículos (demo)</h2><button type='button' class='btn btn-suave btn-sm' id='pf-vehiculo'>${Icons.r('plus', 'i-14')} Agregar</button></div>
        <div class='card'>
          ${st.vehiculos.length ? st.vehiculos.map(function (v) {
            return `<div class='fila-switch'>
              <span class='texto'><strong><span class='patente'>${U.escape(v.dominio)}</span></strong><span>${U.escape(v.tipo)} · ${U.escape(v.marca + ' ' + v.modelo + ' · ' + v.anio)}</span></span>
              <button type='button' class='btn btn-fantasma btn-sm' data-quitar-vehiculo='${v.id}'>${Icons.r('trash', 'i-14')} Quitar</button>
            </div>`;
          }).join('') : '<p class="sub">No hay vehículos cargados.</p>'}
        </div>
      </section>

      <section class='seccion'>
        <div class='seccion-cabeza'><h2>Inmuebles y cuentas (demo)</h2></div>
        <div class='card'>
          ${st.inmuebles.map(function (i) {
            return `<div class='fila-switch'>
              <span class='texto'><strong>Partida ${U.escape(i.partida)}</strong><span>${U.escape(i.tipo)} · ${U.escape(i.direccion)} · ${U.escape(i.barrio)}</span></span>
            </div>`;
          }).join('')}
        </div>
      </section>

      <section class='seccion'>
        <div class='seccion-cabeza'><h2>Actividad</h2></div>
        <div class='card'>
          <h3>Pagos recientes</h3>
          ${pagos.length ? pagos.map(function (p) { return `<div class='fila-datos'><span class='clave'>${p.comprobante} · ${U.fecha(p.fecha)}</span><span class='valor'>${U.money(p.importe)}</span></div>`; }).join('') : '<p class="sub">Sin pagos simulados.</p>'}
          <hr class='sep-suave'>
          <h3>Reclamos recientes</h3>
          ${reclamos.length ? reclamos.map(function (r) { return `<div class='fila-datos'><span class='clave'><a href='#/reclamos/detalle/${r.id}'>${r.numero}</a></span><span class='valor'>${U.escape(r.estado)}</span></div>`; }).join('') : '<p class="sub">Sin reclamos.</p>'}
          <hr class='sep-suave'>
          <h3>Trámites recientes</h3>
          ${tramites.length ? tramites.map(function (t) { return `<div class='fila-datos'><span class='clave'><a href='#/mis-tramites/${t.id}'>${t.numero}</a></span><span class='valor'>${U.escape(t.estado)}</span></div>`; }).join('') : '<p class="sub">Sin solicitudes.</p>'}
        </div>
      </section>

      <section class='seccion'>
        <div class='seccion-cabeza'><h2>Sesión (demo)</h2><span class='badge b-info'>${Icons.r('user')}Ciudadano</span></div>
        <div class='card'>
          <p class='sub'>La autenticación es simulada: las claves se guardan sin cifrar en este navegador. No uses claves reales.</p>
          <div class='fila-acciones'>
            <button type='button' class='btn btn-secundario btn-bloque' id='pf-salir'>${Icons.r('log-out', 'i-18')} Cerrar sesión</button>
          </div>
        </div>
      </section>

      <section class='seccion'>
        <div class='card' style='border-style:dashed'>
          <h3>Zona de demostración</h3>
          <p class='sub'>Reiniciá los datos ficticios para volver a probar todos los flujos desde cero. Se borran tus cambios locales (pagos, reclamos, trámites y turnos creados).</p>
          <button type='button' class='btn btn-peligro btn-bloque' id='pf-reset'>${Icons.r('refresh', 'i-18')} Reiniciar datos de demostración</button>
        </div>
      </section>`;
    return { titulo: 'Mi perfil', html: html, after: function (raiz) { enlazar(raiz); } };
  }

  function enlazar(raiz) {
    var salir = raiz.querySelector('#pf-salir');
    if (salir) salir.addEventListener('click', function () {
      Servicios.cerrarSesion();
      App.refrescarSesion();
      UI.toast('Sesión cerrada (demo).', 'info');
      Router.go('login');
    });
    raiz.querySelectorAll('[data-pref]').forEach(function (sw) {
      sw.addEventListener('change', function () {
        Servicios.actualizarPreferencia(sw.getAttribute('data-pref'), sw.checked);
        UI.toast('Preferencia guardada (demo).', 'exito', 1800);
      });
    });
    var btnVeh = raiz.querySelector('#pf-vehiculo');
    if (btnVeh) btnVeh.addEventListener('click', function () { modalVehiculo(); });
    raiz.querySelectorAll('[data-quitar-vehiculo]').forEach(function (b) {
      b.addEventListener('click', function () {
        UI.confirmar({ titulo: 'Quitar vehículo', mensaje: 'Se quitará el vehículo de esta demostración. ¿Continuar?', textoConfirmar: 'Quitar', peligro: true }).then(function (ok) {
          if (!ok) return;
          Servicios.quitarVehiculo(b.getAttribute('data-quitar-vehiculo'));
          UI.toast('Vehículo quitado (demo).', 'info');
          Router.refrescar();
        });
      });
    });
    var reset = raiz.querySelector('#pf-reset');
    if (reset) reset.addEventListener('click', function () {
      UI.confirmar({
        titulo: 'Reiniciar datos de demostración',
        mensaje: 'Se borrarán todos los cambios locales (pagos simulados, reclamos, trámites, turnos y datos editados) y volverán los datos ficticios iniciales.',
        textoConfirmar: 'Reiniciar demo',
        peligro: true
      }).then(function (ok) {
        if (!ok) return;
        Store.reset();
        App.refrescarSesion();
        UI.toast('Datos de demostración reiniciados.', 'exito');
        Router.go('inicio');
      });
    });
  }

  function modalVehiculo() {
    UI.modal({
      titulo: 'Agregar vehículo (demo)',
      html: `
        <div class='campo'>
          <label for='veh-dominio'>Dominio</label>
          <input id='veh-dominio' class='control' type='text' maxlength='10' placeholder='Ej: AB 123 CD' style='text-transform:uppercase'>
          <span class='ayuda'>Formatos válidos: AAA123 o AA123BB (dato ficticio).</span>
        </div>
        <div class='campo'>
          <label for='veh-marca'>Marca</label>
          <input id='veh-marca' class='control' type='text' maxlength='30' placeholder='Ej: Fiat'>
        </div>
        <div class='grupo-campos'>
          <div class='campo'>
            <label for='veh-modelo'>Modelo</label>
            <input id='veh-modelo' class='control' type='text' maxlength='30' placeholder='Ej: Cronos'>
          </div>
          <div class='campo'>
            <label for='veh-anio'>Año</label>
            <input id='veh-anio' class='control' type='text' inputmode='numeric' maxlength='4' placeholder='Ej: 2020'>
          </div>
        </div>`,
      acciones: [
        { texto: 'Cancelar', clase: 'btn-secundario' },
        {
          texto: 'Agregar', clase: 'btn-primario', mantener: true,
          onClick: function (cerrar) {
            var dom = document.getElementById('veh-dominio');
            var marca = document.getElementById('veh-marca');
            var modelo = document.getElementById('veh-modelo');
            var anio = document.getElementById('veh-anio');
            UI.limpiarErrores(document.getElementById('modal-raiz'));
            var ok = true;
            var dominio = (dom.value || '').toUpperCase().trim();
            if (!/^[A-Z]{3}\d{3}$|^[A-Z]{2}\d{3}[A-Z]{2}$/.test(dominio.replace(/\s/g, ''))) { UI.ponerError(dom, 'Dominio inválido. Usá formato AAA123 o AA123BB.'); ok = false; }
            if (!marca.value.trim()) { UI.ponerError(marca, 'Indicá la marca.'); ok = false; }
            if (!modelo.value.trim()) { UI.ponerError(modelo, 'Indicá el modelo.'); ok = false; }
            if (anio.value && !/^\d{4}$/.test(anio.value.trim())) { UI.ponerError(anio, 'Año inválido.'); ok = false; }
            if (!ok) return;
            var existe = Store.state.vehiculos.some(function (v) { return v.dominio.replace(/\s/g, '') === dominio.replace(/\s/g, ''); });
            if (existe) { UI.ponerError(dom, 'Ese dominio ya está cargado en la demo.'); return; }
            Servicios.agregarVehiculo({ dominio: dominio, tipo: 'Automóvil', marca: marca.value.trim(), modelo: modelo.value.trim(), anio: anio.value.trim() });
            cerrar();
            UI.toast('Vehículo agregado (demo).', 'exito');
            Router.refrescar();
          }
        }
      ]
    });
  }

  function editar() {
    var u = Store.state.usuario;
    var html = `
      <a class='enlace' href='#/perfil'>${Icons.r('arrow-left', 'i-16')} Volver a mi perfil</a>
      <div class='card mt-8'>
        <h2>Editar mis datos (demo)</h2>
        <div class='grupo-campos'>
          <div class='campo'>
            <label for='ed-nombre'>Nombre</label>
            <input id='ed-nombre' class='control' type='text' maxlength='40' value='${U.escape(u.nombre)}'>
          </div>
          <div class='campo'>
            <label for='ed-apellido'>Apellido</label>
            <input id='ed-apellido' class='control' type='text' maxlength='40' value='${U.escape(u.apellido)}'>
          </div>
        </div>
        <div class='campo'>
          <label for='ed-alias'>Cómo querés que te llamemos</label>
          <input id='ed-alias' class='control' type='text' maxlength='20' value='${U.escape(u.alias)}'>
          <span class='ayuda'>Aparece en el saludo del inicio.</span>
        </div>
        <div class='campo'>
          <label for='ed-email'>Correo electrónico (ejemplo)</label>
          <input id='ed-email' class='control' type='email' maxlength='80' value='${U.escape(u.email)}'>
        </div>
        <div class='campo'>
          <label for='ed-telefono'>Teléfono (ejemplo)</label>
          <input id='ed-telefono' class='control' type='tel' maxlength='25' value='${U.escape(u.telefono)}'>
        </div>
        <div class='campo'>
          <label for='ed-domicilio'>Domicilio declarado (ejemplo)</label>
          <input id='ed-domicilio' class='control' type='text' maxlength='80' value='${U.escape(u.domicilio)}'>
        </div>
        <div class='campo'>
          <label for='ed-barrio'>Barrio</label>
          <select id='ed-barrio' class='control'>${DEMO.catalogos.barrios.map(function (b) { return `<option ${u.barrio === b ? 'selected' : ''}>${U.escape(b)}</option>`; }).join('')}</select>
        </div>
        <div class='alerta a-info'>${Icons.r('info')}<span>Los cambios se guardan sólo en este navegador y son datos ficticios.</span></div>
        <div class='fila-acciones'>
          <button type='button' class='btn btn-primario btn-bloque' id='ed-guardar'>${Icons.r('check', 'i-18')} Guardar cambios</button>
          <a class='btn btn-fantasma btn-bloque' href='#/perfil'>Cancelar</a>
        </div>
      </div>`;
    return {
      titulo: 'Editar datos',
      html: html,
      after: function (raiz) {
        var btn = raiz.querySelector('#ed-guardar');
        if (!btn) return;
        btn.addEventListener('click', function () {
          UI.limpiarErrores(raiz);
          var nombre = raiz.querySelector('#ed-nombre');
          var email = raiz.querySelector('#ed-email');
          var tel = raiz.querySelector('#ed-telefono');
          var ok = true;
          if (!nombre.value.trim()) { UI.ponerError(nombre, 'Ingresá tu nombre.'); ok = false; }
          if (!U.esEmail(email.value)) { UI.ponerError(email, 'El correo no parece válido.'); ok = false; }
          if (!U.esTelefono(tel.value)) { UI.ponerError(tel, 'El teléfono necesita al menos 8 números.'); ok = false; }
          if (!ok) return;
          Servicios.actualizarUsuario({
            nombre: nombre.value.trim(),
            apellido: raiz.querySelector('#ed-apellido').value.trim(),
            alias: raiz.querySelector('#ed-alias').value.trim() || nombre.value.trim(),
            email: email.value.trim(),
            telefono: tel.value.trim(),
            domicilio: raiz.querySelector('#ed-domicilio').value.trim(),
            barrio: raiz.querySelector('#ed-barrio').value
          });
          UI.toast('Datos actualizados (demo).', 'exito');
          App.pintarAvatar();
          Router.go('perfil');
        });
      }
    };
  }

  function adminMain() {
    var st = Store.state;
    var s = st.sesion;
    var cta = st.cuentas.filter(function (c) { return c.id === s.cuentaId; })[0] || { perfil: {} };
    var html = `
      <div class='card' style='display:flex;align-items:center;gap:14px'>
        <span class='avatar avatar-lg'>${U.escape(U.iniciales(s.nombre, s.apellido))}</span>
        <div style='flex:1'>
          <h2 style='margin:0'>${U.escape(s.nombre + ' ' + s.apellido)}</h2>
          <p class='sub' style='margin:2px 0 0'>Personal municipal de demostración</p>
        </div>
        <span class='badge b-neutra'>${Icons.r('shield-check')}Personal municipal</span>
      </div>

      <section class='seccion'>
        <div class='seccion-cabeza'><h2>Datos de la cuenta (demo)</h2></div>
        <div class='card'>
          ${filaDato('Correo de acceso', s.email)}
          ${filaDato('Área (demo)', cta.perfil.area || '-')}
          ${filaDato('Rol', 'Personal municipal (demo)')}
        </div>
      </section>

      <section class='seccion'>
        <div class='seccion-cabeza'><h2>Sesión (demo)</h2></div>
        <div class='card'>
          <p class='sub'>La autenticación es simulada: las claves se guardan sin cifrar en este navegador. No uses claves reales.</p>
          <div class='fila-acciones'>
            <button type='button' class='btn btn-secundario btn-bloque' id='pf-salir'>${Icons.r('log-out', 'i-18')} Cerrar sesión</button>
          </div>
        </div>
      </section>

      <section class='seccion'>
        <div class='card' style='border-style:dashed'>
          <h3>Zona de demostración</h3>
          <p class='sub'>Reiniciá los datos ficticios para volver a probar todos los flujos desde cero. Se borran los cambios locales (pagos, reclamos, trámites y turnos creados) y las cuentas registradas en este navegador.</p>
          <button type='button' class='btn btn-peligro btn-bloque' id='pf-reset'>${Icons.r('refresh', 'i-18')} Reiniciar datos de demostración</button>
        </div>
      </section>`;
    return { titulo: 'Mi perfil', html: html, after: function (raiz) { enlazar(raiz); } };
  }

  return { main: main, editar: editar, adminMain: adminMain };
})();