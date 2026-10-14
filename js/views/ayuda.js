window.Views = window.Views || {};

Views.ayuda = (function () {
  function guias() {
    return [
      { icono: 'card', titulo: 'Cómo pagar una obligación', texto: 'Desde Pagos, elegí la obligación y seguí los pasos del pago simulado.', ref: 'pagos' },
      { icono: 'megaphone', titulo: 'Cómo hacer un reclamo', texto: 'Contanos el problema con categoría, ubicación y foto opcional.', ref: 'reclamos/nuevo' },
      { icono: 'alert-triangle', titulo: 'Cómo consultar una multa', texto: 'Mirá el acta, el motivo y el importe, y simulá su pago o un descargo.', ref: 'vehiculos/multas' },
      { icono: 'clipboard', titulo: 'Cómo iniciar un trámite', texto: 'Buscá el trámite en el catálogo y completá la solicitud de demostración.', ref: 'tramites' },
      { icono: 'calendar-check', titulo: 'Cómo pedir un turno', texto: 'Elegí tipo, dependencia, día y horario (disponibilidad simulada).', ref: 'turnos/nuevo' }
    ];
  }

  function main() {
    var c = DEMO.catalogos;
    var html = `
      <h1>Ayuda y contacto</h1>
      <p class='sub'>Guías de uso del prototipo e información orientativa de atención.</p>

      <section class='seccion'>
        <div class='seccion-cabeza'><h2>¿Cómo se hace?</h2></div>
        <div class='lista'>
          ${guias().map(function (g) {
            return `<a class='item' href='#/${g.ref}'>
              <span class='tinte t-azul item-ico'>${Icons.r(g.icono)}</span>
              <span class='item-cuerpo'>
                <span class='item-titulo'>${U.escape(g.titulo)}</span>
                <span class='item-sub'><span>${U.escape(g.texto)}</span></span>
              </span>
              <span class='flecha'>${Icons.r('chevron-right')}</span>
            </a>`;
          }).join('')}
        </div>
      </section>

      <section class='seccion'>
        <div class='seccion-cabeza'><h2>Preguntas frecuentes</h2></div>
        <div class='card'>
          ${c.faq.map(function (f) {
            return `<details style='padding:10px 0;border-bottom:1px dashed var(--c-borde)'>
              <summary style='cursor:pointer;font-weight:600'>${U.escape(f.p)}</summary>
              <p class='sub' style='margin:8px 0 0'>${U.escape(f.r)}</p>
            </details>`;
          }).join('')}
        </div>
      </section>

      <section class='seccion'>
        <div class='seccion-cabeza'><h2>Atención presencial</h2>${UI.etiquetaDemo()}</div>
        <div class='card'>
          <div class='fila-datos'><span class='clave'>Domicilio</span><span class='valor'>${U.escape(c.contacto.domicilio)}</span></div>
          <div class='fila-datos'><span class='clave'>Horario</span><span class='valor'>${U.escape(c.contacto.horario)}</span></div>
          <div class='fila-datos'><span class='clave'>Teléfono</span><span class='valor'>${U.escape(c.contacto.telefono)}</span></div>
          <div class='fila-datos'><span class='clave'>Correo</span><span class='valor'>${U.escape(c.contacto.email)}</span></div>
          <div class='alerta a-aviso'>${Icons.r('alert-triangle')}<span>No se publican teléfonos, correos ni horarios inventados como si fueran oficiales: todos los valores son de demostración hasta contar con información verificada por la Municipalidad.</span></div>
        </div>
      </section>

      <section class='seccion'>
        <div class='card' style='border:1.5px solid var(--c-peligro-borde);background:var(--c-peligro-suave)'>
          <div style='display:flex;gap:10px;align-items:flex-start'>
            <span style='color:var(--c-peligro)'>${Icons.r('alert-triangle', 'i-22')}</span>
            <div>
              <h3 style='margin:0;color:#8E1B14'>Emergencias</h3>
              <p style='margin:6px 0 0;color:#8E1B14'>${U.escape(c.emergenciaNota)}</p>
            </div>
          </div>
        </div>
      </section>

      <section class='seccion'>
        <div class='card' style='border-style:dashed'>
          <h3>Acerca de este prototipo</h3>
          <p class='sub'>Portal ciudadano conceptual para la Municipalidad de Las Toscas (Santa Fe). Aplicación de demostración construida con HTML, CSS y JavaScript puros, sin conexión a sistemas reales. Iconografía de estilo Lucide embebida. Los datos se guardan en tu navegador.</p>
          <button type='button' class='btn btn-peligro btn-bloque' id='ay-reset'>${Icons.r('refresh', 'i-18')} Reiniciar datos de demostración</button>
        </div>
      </section>`;
    return {
      titulo: 'Ayuda y contacto',
      html: html,
      after: function (raiz) {
        var btn = raiz.querySelector('#ay-reset');
        if (btn) btn.addEventListener('click', function () {
          UI.confirmar({
            titulo: 'Reiniciar datos de demostración',
            mensaje: 'Se borrarán los cambios locales y volverán los datos ficticios iniciales. ¿Continuar?',
            textoConfirmar: 'Reiniciar demo',
            peligro: true
          }).then(function (ok) {
            if (!ok) return;
            Store.reset();
            UI.toast('Datos de demostración reiniciados.', 'exito');
            Router.go('inicio');
          });
        });
      }
    };
  }

  return { main: main };
})();