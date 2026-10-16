window.Views = window.Views || {};

Views.login = (function () {
  function cabeceraPantalla(sub) {
    return `
      <div class='centrado-pane' style='padding-top:30px'>
        <img src='assets/logo-municipalidad.png' alt='Escudo de la Municipalidad de Las Toscas' style='width:72px;height:72px'>
        <h1 style='margin-top:10px'>Las Toscas</h1>
        <p class='sub centrado'>${U.escape(sub)}</p>
      </div>`;
  }

  function campoClave(id, etiqueta, autocomplete) {
    return `
      <div class='campo'>
        <label for='${id}'>${etiqueta}</label>
        <div style='position:relative'>
          <input id='${id}' class='control' type='password' autocomplete='${autocomplete}' style='padding-right:46px'>
          <button type='button' class='btn-icono toggle-clave' data-clave='${id}' aria-label='Mostrar u ocultar la clave' style='position:absolute;right:2px;top:50%;transform:translateY(-50%);width:38px;height:38px'>${Icons.r('eye')}</button>
        </div>
      </div>`;
  }

  function enlazarToggle(raiz) {
    raiz.querySelectorAll('.toggle-clave').forEach(function (b) {
      b.addEventListener('click', function () {
        var input = document.getElementById(b.getAttribute('data-clave'));
        if (!input) return;
        var visible = input.type === 'text';
        input.type = visible ? 'password' : 'text';
        b.innerHTML = Icons.r(visible ? 'eye' : 'eye-off');
        input.focus();
      });
    });
  }

  function entrar(res) {
    App.refrescarSesion();
    UI.toast('¡Hola, ' + Store.state.sesion.alias + '! Sesión demo iniciada.', 'exito');
    Router.go(res.rol === 'admin' ? 'admin' : 'inicio');
  }

  function main() {
    var html = `
      ${cabeceraPantalla('Portal ciudadano · prototipo de demostración')}
      <div class='card'>
        <h2>Ingresar</h2>
        <p class='sub'>Autenticación simulada: no ingreses claves reales ni datos sensibles.</p>
        <div class='campo'>
          <label for='lg-email'>Correo electrónico</label>
          <input id='lg-email' class='control' type='email' maxlength='80' autocomplete='email' placeholder='tucorreo@ejemplo.com'>
        </div>
        ${campoClave('lg-clave', 'Clave (demo)', 'current-password')}
        <div class='fila-acciones'>
          <button type='button' class='btn btn-primario btn-bloque' id='lg-entrar'>${Icons.r('log-in', 'i-18')} Ingresar</button>
        </div>
        <p class='sub mt-16 centrado'>¿No tenés cuenta? <a class='enlace' href='#/registro'>Crear cuenta (demo)</a></p>
        <div class='alerta a-info mt-8'>${Icons.r('info')}<span>Cuentas de prueba (demo): vecino <strong>maxi.vecino@ejemplo.com</strong> · personal municipal <strong>gestion@lascoscas.gob.ar</strong> · clave <strong>demo1234</strong>.</span></div>
      </div>
      <div class='card mt-8' style='border-style:dashed'>
        <h3>Accesos rápidos de demostración</h3>
        <p class='sub'>Entrar directamente con una de las cuentas ficticias para probar cada rol.</p>
        <div class='fila-acciones'>
          <button type='button' class='btn btn-secundario btn-bloque' id='lg-demo-vecino'>${Icons.r('user', 'i-18')} Entrar como vecino</button>
          <button type='button' class='btn btn-secundario btn-bloque' id='lg-demo-admin'>${Icons.r('shield-check', 'i-18')} Entrar como personal municipal</button>
        </div>
      </div>
      <div class='alerta a-aviso mt-8'>${Icons.r('alert-triangle')}<span>${U.escape(DEMO.catalogos.emergenciaNota)}</span></div>`;
    return {
      titulo: 'Ingresar',
      html: html,
      after: function (raiz) { enlazar(raiz); }
    };
  }

  function enlazar(raiz) {
    enlazarToggle(raiz);
    var btn = raiz.querySelector('#lg-entrar');
    if (btn) btn.addEventListener('click', function () {
      UI.limpiarErrores(raiz);
      var email = raiz.querySelector('#lg-email');
      var clave = raiz.querySelector('#lg-clave');
      var ok = true;
      if (!email.value.trim()) { UI.ponerError(email, 'Ingresá tu correo.'); ok = false; }
      else if (!U.esEmail(email.value)) { UI.ponerError(email, 'El correo no parece válido.'); ok = false; }
      if (!clave.value) { UI.ponerError(clave, 'Ingresá tu clave (demo).'); ok = false; }
      if (!ok) return;
      var res = Servicios.login(email.value.trim(), clave.value);
      if (!res.ok) {
        UI.ponerError(raiz.querySelector('#lg-' + res.campo), res.mensaje);
        UI.toast(res.mensaje, 'error', 4200);
        return;
      }
      entrar(res);
    });
    var intro = function (id, email) {
      var b = raiz.querySelector(id);
      if (b) b.addEventListener('click', function () { entrar(Servicios.login(email, 'demo1234')); });
    };
    intro('#lg-demo-vecino', 'maxi.vecino@ejemplo.com');
    intro('#lg-demo-admin', 'gestion@lascoscas.gob.ar');
    raiz.querySelectorAll('#lg-email, #lg-clave').forEach(function (i) {
      i.addEventListener('keydown', function (e) { if (e.key === 'Enter') btn.click(); });
    });
  }

  function registro() {
    var html = `
      <a class='enlace' href='#/login'>${Icons.r('arrow-left', 'i-16')} Volver a ingresar</a>
      ${cabeceraPantalla('Creá tu cuenta ciudadana (demo)')}
      <div class='card mt-8'>
        <h2>Crear cuenta (demo)</h2>
        <p class='sub'>Los datos se guardan sólo en este navegador. Cuenta ficticia, sin registro en ningún servidor.</p>
        <div class='grupo-campos'>
          <div class='campo'>
            <label for='rg-nombre'>Nombre</label>
            <input id='rg-nombre' class='control' type='text' maxlength='40' autocomplete='given-name' placeholder='Tu nombre'>
          </div>
          <div class='campo'>
            <label for='rg-apellido'>Apellido</label>
            <input id='rg-apellido' class='control' type='text' maxlength='40' autocomplete='family-name' placeholder='Tu apellido'>
          </div>
        </div>
        <div class='grupo-campos'>
          <div class='campo'>
            <label for='rg-dni'>DNI</label>
            <input id='rg-dni' class='control' type='text' inputmode='numeric' maxlength='10' autocomplete='off' placeholder='Ej: 30123456'>
            <span class='ayuda'>7 u 8 números, sin puntos.</span>
          </div>
          <div class='campo'>
            <label for='rg-telefono'>Teléfono</label>
            <input id='rg-telefono' class='control' type='tel' maxlength='25' autocomplete='tel' placeholder='Ej: 3482 555-1234'>
          </div>
        </div>
        <div class='campo'>
          <label for='rg-email'>Correo electrónico</label>
          <input id='rg-email' class='control' type='email' maxlength='80' autocomplete='email' placeholder='tucorreo@ejemplo.com'>
        </div>
        <div class='grupo-campos'>
          ${campoClave('rg-clave', 'Clave', 'new-password')}
          ${campoClave('rg-clave2', 'Repetí la clave', 'new-password')}
        </div>
        <div class='alerta a-info'>${Icons.r('info')}<span>La clave se guarda sin cifrar en este navegador (demo). <strong>No uses una clave real.</strong></span></div>
        <div class='fila-acciones'>
          <button type='button' class='btn btn-primario btn-bloque' id='rg-crear'>${Icons.r('log-in', 'i-18')} Crear cuenta e ingresar</button>
        </div>
      </div>`;
    return {
      titulo: 'Crear cuenta',
      html: html,
      after: function (raiz) { enlazarRegistro(raiz); }
    };
  }

  function enlazarRegistro(raiz) {
    enlazarToggle(raiz);
    var btn = raiz.querySelector('#rg-crear');
    if (!btn) return;
    btn.addEventListener('click', function () {
      UI.limpiarErrores(raiz);
      var nombre = raiz.querySelector('#rg-nombre');
      var apellido = raiz.querySelector('#rg-apellido');
      var dni = raiz.querySelector('#rg-dni');
      var email = raiz.querySelector('#rg-email');
      var telefono = raiz.querySelector('#rg-telefono');
      var clave = raiz.querySelector('#rg-clave');
      var clave2 = raiz.querySelector('#rg-clave2');
      var ok = true;
      if (!nombre.value.trim()) { UI.ponerError(nombre, 'Ingresá tu nombre.'); ok = false; }
      if (!apellido.value.trim()) { UI.ponerError(apellido, 'Ingresá tu apellido.'); ok = false; }
      if (!/^\d{7,8}$/.test(dni.value.replace(/[\.\s]/g, ''))) { UI.ponerError(dni, 'El DNI debe tener 7 u 8 números.'); ok = false; }
      if (!email.value.trim()) { UI.ponerError(email, 'Ingresá tu correo.'); ok = false; }
      else if (!U.esEmail(email.value)) { UI.ponerError(email, 'El correo no parece válido.'); ok = false; }
      if (!U.esTelefono(telefono.value)) { UI.ponerError(telefono, 'El teléfono necesita al menos 8 números.'); ok = false; }
      if ((clave.value || '').length < 6) { UI.ponerError(clave, 'La clave necesita al menos 6 caracteres.'); ok = false; }
      if (clave.value !== clave2.value) { UI.ponerError(clave2, 'Las claves no coinciden.'); ok = false; }
      if (!ok) return;
      var res = Servicios.registrarCuenta({
        nombre: nombre.value.trim(),
        apellido: apellido.value.trim(),
        dni: dni.value.replace(/[\.\s]/g, ''),
        email: email.value.trim(),
        telefono: telefono.value.trim(),
        clave: clave.value
      });
      if (!res.ok) {
        UI.ponerError(email, res.mensaje);
        UI.toast(res.mensaje, 'error', 4200);
        return;
      }
      App.refrescarSesion();
      UI.toast('Cuenta demo creada. ¡Bienvenido/a, ' + Store.state.sesion.alias + '!', 'exito');
      Router.go('inicio');
    });
  }

  return { main: main, registro: registro };
})();
