window.Store = (function () {
  var CLAVE = 'lt-muni-demo-v1';
  var state = null;
  var avisoMostrado = false;

  function disponible() {
    try {
      var k = '__lt_test__';
      window.localStorage.setItem(k, '1');
      window.localStorage.removeItem(k);
      return true;
    } catch (e) { return false; }
  }

  function seed() {
    state = DEMO.estadoInicial();
  }

  function init() {
    var ok = disponible();
    if (ok) {
      try {
        var crudo = window.localStorage.getItem(CLAVE);
        if (crudo) {
          var datos = JSON.parse(crudo);
          if (datos && datos.version === 1) state = datos;
        }
      } catch (e) { state = null; }
    }
    if (!state) seed();
    if (!state.sesion) state.sesion = { iniciada: false };
    save();
    return state;
  }

  function save() {
    if (!disponible()) {
      if (!avisoMostrado && window.UI && UI.toast) {
        avisoMostrado = true;
        UI.toast('Tu navegador no permite guardar datos: la demo funcionará sin persistencia.', 'info', 5200);
      }
      return;
    }
    try {
      window.localStorage.setItem(CLAVE, JSON.stringify(state));
    } catch (e) {
      if (!avisoMostrado && window.UI && UI.toast) {
        avisoMostrado = true;
        UI.toast('No se pudieron guardar los cambios localmente (espacio lleno).', 'error', 5200);
      }
    }
    if (window.App && App.actualizarCampana) App.actualizarCampana();
  }

  function reset() {
    try { window.localStorage.removeItem(CLAVE); } catch (e) {}
    seed();
    save();
  }

  return {
    init: init,
    save: save,
    reset: reset,
    disponible: disponible,
    CLAVE: CLAVE,
    get state() { return state; }
  };
})();