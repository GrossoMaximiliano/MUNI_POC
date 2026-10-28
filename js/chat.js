/* chat.js — Botón flotante y panel de chat con el asistente.
   La respuesta la da Chat.responder: js/agente.js la conecta con el modelo; sin clave queda la respuesta de prueba. */
window.Chat = (function () {
  var abierto = false;
  var ocupado = false;
  var cuentaActual = null;
  var historial = []; // { rol: 'usuario' | 'asistente', texto, hora }

  var SUGERENCIAS = ['¿Cuánto debo de tasas?', 'Quiero hacer un reclamo', '¿Cómo saco un turno?', 'Horarios de atención'];

  // Punto de integración: recibe el texto y el historial, devuelve una Promise<string>.
  function responder(texto, hist) {
    return new Promise(function (ok) {
      setTimeout(function () {
        ok('Recibí tu consulta: “' + texto + '”. La conexión con el agente todavía no está configurada en esta demo, así que por ahora no puedo responder.');
      }, 900);
    });
  }

  /* ---------- Audio (texto a voz con OpenRouter) ---------- */
  var cfg = window.CONFIG || {};
  var hayAudio = !!cfg.openrouterKey;
  var reproductor = new Audio();
  var sonando = null; // mensaje que se está reproduciendo

  // Gemini TTS devuelve PCM 16 bits mono crudo: se le agrega cabecera WAV para poder reproducirlo.
  function pcmAWav(pcm, rate) {
    var h = new DataView(new ArrayBuffer(44));
    function txt(o, s) { for (var i = 0; i < s.length; i++) h.setUint8(o + i, s.charCodeAt(i)); }
    txt(0, 'RIFF'); h.setUint32(4, 36 + pcm.byteLength, true); txt(8, 'WAVE');
    txt(12, 'fmt '); h.setUint32(16, 16, true); h.setUint16(20, 1, true); h.setUint16(22, 1, true);
    h.setUint32(24, rate, true); h.setUint32(28, rate * 2, true); h.setUint16(32, 2, true); h.setUint16(34, 16, true);
    txt(36, 'data'); h.setUint32(40, pcm.byteLength, true);
    return new Blob([h.buffer, pcm], { type: 'audio/wav' });
  }

  function sintetizar(texto) {
    return fetch('https://openrouter.ai/api/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + cfg.openrouterKey,
        'Content-Type': 'application/json',
        'HTTP-Referer': location.origin,
        'X-Title': 'Las Toscas Portal ciudadano'
      },
      body: JSON.stringify({ model: cfg.ttsModelo || 'google/gemini-3.1-flash-tts-preview', input: texto, voice: cfg.ttsVoz || 'Zephyr', response_format: 'pcm' })
    }).then(function (r) {
      if (!r.ok) throw new Error('TTS ' + r.status);
      var tipo = r.headers.get('Content-Type') || '';
      var rate = parseInt((tipo.match(/rate=(\d+)/) || [])[1], 10) || 24000;
      return r.arrayBuffer().then(function (buf) {
        return URL.createObjectURL(/wav|mpeg|mp3|ogg/.test(tipo) ? new Blob([buf], { type: tipo }) : pcmAWav(buf, rate));
      });
    });
  }

  function detener() {
    reproductor.pause();
    if (sonando) { sonando.audioEstado = null; sonando = null; }
  }

  function alternarAudio(m) {
    if (m.audioEstado === 'cargando') return;
    if (m === sonando) { detener(); pintar(); return; }
    detener();
    var listo = m.audioUrl ? Promise.resolve(m.audioUrl) : (m.audioEstado = 'cargando', pintar(), sintetizar(m.texto));
    listo.then(function (url) {
      m.audioUrl = url;
      m.audioEstado = 'sonando';
      sonando = m;
      reproductor.src = url;
      return reproductor.play();
    }).catch(function () {
      m.audioEstado = null;
      if (sonando === m) sonando = null;
      if (window.UI && UI.toast) UI.toast('No se pudo generar el audio. Probá de nuevo.', 'error');
    }).then(pintar);
  }

  reproductor.addEventListener('ended', function () { detener(); pintar(); });

  function botonAudio(m, i) {
    if (!hayAudio || m.rol !== 'asistente') return '';
    var est = m.audioEstado;
    var etiqueta = est === 'sonando' ? 'Detener audio' : est === 'cargando' ? 'Generando audio' : 'Escuchar respuesta';
    var icono = est === 'sonando' ? Icons.r('square', 'i-14') : est === 'cargando' ? `<span class='chat-girando' aria-hidden='true'></span>` : Icons.r('volume-2', 'i-16');
    return `<button type='button' class='chat-audio${est ? ' chat-audio--' + est : ''}' data-audio='${i}' aria-label='${etiqueta}' title='${etiqueta}'>${icono}</button>`;
  }

  /* ---------- Mensajes de voz (grabación + transcripción con OpenRouter) ---------- */
  var puedeGrabar = hayAudio && !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
  var MAX_SEG_AUDIO = 60;
  var grabacion = null; // { rec, stream, partes, inicio, reloj, cancelada }

  // Pasa la grabación (webm/ogg/mp4 según el navegador) a WAV 16 kHz mono, el formato que acepta la transcripción.
  function aWav(blob) {
    var Ctx = window.AudioContext || window.webkitAudioContext;
    var ctx = new Ctx();
    var rate = 16000;
    return blob.arrayBuffer().then(function (buf) { return ctx.decodeAudioData(buf); }).then(function (audio) {
      ctx.close();
      var off = new OfflineAudioContext(1, Math.max(1, Math.ceil(audio.duration * rate)), rate);
      var src = off.createBufferSource();
      src.buffer = audio;
      src.connect(off.destination);
      src.start();
      return off.startRendering();
    }).then(function (r) {
      var d = r.getChannelData(0);
      var pcm = new Int16Array(d.length);
      for (var i = 0; i < d.length; i++) { var s = Math.max(-1, Math.min(1, d[i])); pcm[i] = s < 0 ? s * 0x8000 : s * 0x7FFF; }
      return pcmAWav(pcm.buffer, rate);
    });
  }

  function aBase64(blob) {
    return new Promise(function (ok, mal) {
      var fr = new FileReader();
      fr.onload = function () { ok(String(fr.result).split(',')[1]); };
      fr.onerror = mal;
      fr.readAsDataURL(blob);
    });
  }

  function transcribir(blob) {
    return aWav(blob).then(aBase64).then(function (b64) {
      return fetch('https://openrouter.ai/api/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + cfg.openrouterKey,
          'Content-Type': 'application/json',
          'HTTP-Referer': location.origin,
          'X-Title': 'Las Toscas Portal ciudadano'
        },
        body: JSON.stringify({ model: cfg.sttModelo || 'mistralai/voxtral-small-transcribe-3-0', input_audio: { data: b64, format: 'wav' } })
      });
    }).then(function (r) {
      if (!r.ok) throw new Error('STT ' + r.status);
      return r.json();
    }).then(function (j) { return String(j.text || '').trim(); });
  }

  function aviso(msj) { if (window.UI && UI.toast) UI.toast(msj, 'error'); }

  function tiempo(seg) { return Math.floor(seg / 60) + ':' + String(seg % 60).padStart(2, '0'); }

  function modoGrabando(on) {
    document.getElementById('chat-form').classList.toggle('chat-form--grabando', on);
    var mic = document.getElementById('chat-mic');
    mic.setAttribute('aria-label', on ? 'Enviar mensaje de voz' : 'Grabar mensaje de voz');
    mic.setAttribute('title', on ? 'Enviar mensaje de voz' : 'Grabar mensaje de voz');
    mic.innerHTML = Icons.r(on ? 'send' : 'mic');
    document.getElementById('chat-reloj').textContent = '0:00';
  }

  function iniciarGrabacion() {
    if (grabacion || ocupado) return;
    detener();
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
      var rec = new MediaRecorder(stream);
      var g = grabacion = { rec: rec, stream: stream, partes: [], inicio: Date.now(), cancelada: false };
      rec.addEventListener('dataavailable', function (e) { if (e.data && e.data.size) g.partes.push(e.data); });
      rec.addEventListener('stop', function () {
        stream.getTracks().forEach(function (t) { t.stop(); });
        clearInterval(g.reloj);
        grabacion = null;
        modoGrabando(false);
        if (g.cancelada) return;
        if (Date.now() - g.inicio < 800) { aviso('El audio es muy corto. Tocá el micrófono y hablá.'); return; }
        enviarAudio(new Blob(g.partes, { type: rec.mimeType || 'audio/webm' }));
      });
      rec.start();
      modoGrabando(true);
      g.reloj = setInterval(function () {
        var seg = Math.floor((Date.now() - g.inicio) / 1000);
        document.getElementById('chat-reloj').textContent = tiempo(seg);
        if (seg >= MAX_SEG_AUDIO) terminarGrabacion(false);
      }, 250);
    }).catch(function () {
      aviso('No se pudo usar el micrófono. Revisá los permisos del navegador.');
    });
  }

  function terminarGrabacion(cancelar) {
    if (!grabacion) return;
    grabacion.cancelada = cancelar;
    if (grabacion.rec.state !== 'inactive') grabacion.rec.stop();
  }

  function enviarAudio(blob) {
    var msj = { rol: 'usuario', texto: '', hora: hora(), deAudio: true, transcribiendo: true };
    historial.push(msj);
    ocupado = true;
    pintar();
    transcribir(blob).then(function (texto) {
      if (!texto) throw new Error('vacío');
      msj.texto = texto;
      msj.transcribiendo = false;
      pedirRespuesta(texto);
    }).catch(function (e) {
      if (window.console) console.warn('Chat: no se pudo transcribir el audio', e);
      historial.splice(historial.indexOf(msj), 1);
      ocupado = false;
      pintar();
      aviso(e.message === 'vacío' ? 'No se entendió el audio. Probá de nuevo.' : 'No se pudo transcribir el audio. Probá de nuevo.');
    });
  }

  function sesion() { return (window.Store && Store.state && Store.state.sesion) || {}; }

  function hora() {
    var d = new Date();
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }

  function saludo() {
    var s = sesion();
    var nombre = s.alias || s.nombre || '';
    return '¡Hola' + (nombre ? ', ' + nombre : '') + '! Soy el asistente virtual de la Municipalidad de Las Toscas. ¿En qué te puedo ayudar?';
  }

  function crear() {
    var fab = document.createElement('button');
    fab.type = 'button';
    fab.className = 'chat-fab';
    fab.id = 'chat-fab';
    fab.setAttribute('aria-label', 'Abrir asistente virtual');
    fab.setAttribute('aria-expanded', 'false');
    fab.setAttribute('aria-controls', 'chat-panel');
    fab.innerHTML = Icons.r('message-circle', 'chat-fab-abrir') + Icons.r('x', 'chat-fab-cerrar');

    var panel = document.createElement('section');
    panel.className = 'chat-panel';
    panel.id = 'chat-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Asistente virtual');
    panel.hidden = true;
    panel.innerHTML =
      `<header class='chat-cabeza'>
        <span class='chat-avatar'>${Icons.r('sparkles')}</span>
        <div class='chat-titulo'><strong>Asistente Las Toscas</strong><span><i class='chat-punto'></i>Asistente virtual · demo</span></div>
        <button type='button' class='chat-cerrar' id='chat-cerrar' aria-label='Cerrar asistente'>${Icons.r('x')}</button>
      </header>
      <div class='chat-mensajes' id='chat-mensajes' role='log' aria-live='polite'></div>
      <div class='chat-sugerencias' id='chat-sugerencias'></div>
      <form class='chat-form${puedeGrabar ? ' chat-form--voz chat-form--vacio' : ''}' id='chat-form' autocomplete='off'>
        <textarea id='chat-input' rows='1' placeholder='Escribí tu consulta…' aria-label='Mensaje para el asistente'></textarea>
        <div class='chat-grabando' aria-live='polite'>
          <button type='button' class='chat-cancelar' id='chat-cancelar' aria-label='Cancelar grabación' title='Cancelar grabación'>${Icons.r('x')}</button>
          <span class='chat-rec' aria-hidden='true'></span><span>Grabando</span><span class='chat-reloj' id='chat-reloj'>0:00</span>
        </div>
        <button type='submit' class='chat-enviar' id='chat-enviar' aria-label='Enviar mensaje' disabled>${Icons.r('send')}</button>
        ${puedeGrabar ? `<button type='button' class='chat-enviar chat-mic' id='chat-mic' aria-label='Grabar mensaje de voz' title='Grabar mensaje de voz'>${Icons.r('mic')}</button>` : ''}
      </form>
      <p class='chat-aviso'>Las respuestas son orientativas y no reemplazan la atención municipal.</p>`;

    document.body.appendChild(panel);
    document.body.appendChild(fab);

    fab.addEventListener('click', function () { abierto ? cerrar() : abrir(); });
    panel.querySelector('#chat-cerrar').addEventListener('click', cerrar);
    panel.addEventListener('keydown', function (e) { if (e.key === 'Escape') cerrar(); });

    var input = panel.querySelector('#chat-input');
    var enviarBtn = panel.querySelector('#chat-enviar');
    input.addEventListener('input', function () {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 120) + 'px';
      enviarBtn.disabled = ocupado || !input.value.trim();
      panel.querySelector('#chat-form').classList.toggle('chat-form--vacio', !input.value.trim());
    });
    if (puedeGrabar) {
      panel.querySelector('#chat-mic').addEventListener('click', function () { grabacion ? terminarGrabacion(false) : iniciarGrabacion(); });
      panel.querySelector('#chat-cancelar').addEventListener('click', function () { terminarGrabacion(true); });
    }
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); panel.querySelector('#chat-form').requestSubmit(); }
    });
    panel.querySelector('#chat-form').addEventListener('submit', function (e) {
      e.preventDefault();
      enviar(input.value);
    });
    panel.querySelector('#chat-mensajes').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-audio]');
      if (b) alternarAudio(historial[+b.getAttribute('data-audio')]);
    });
    panel.querySelector('#chat-sugerencias').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-texto]');
      if (b) enviar(b.getAttribute('data-texto'));
    });

    // Al cerrar sesión se oculta el shell (body.sin-sesion): cerrar también el chat.
    new MutationObserver(function () {
      if (document.body.classList.contains('sin-sesion') && abierto) cerrar();
    }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }

  function pintar() {
    var cont = document.getElementById('chat-mensajes');
    var abajo = cont.scrollHeight - cont.scrollTop - cont.clientHeight < 40;
    var scroll = cont.scrollTop;
    var transcribiendo = false;
    cont.innerHTML = historial.map(function (m, i) {
      if (m.transcribiendo) transcribiendo = true;
      var cuerpo = m.transcribiendo ? `<span class='chat-transcribiendo'><span class='chat-girando chat-girando--claro' aria-hidden='true'></span>Transcribiendo audio…</span>` : U.escape(m.texto).replace(/\n/g, '<br>');
      var voz = m.deAudio ? `<span class='chat-voz' title='Mensaje de voz'>${Icons.r('mic', 'i-14')}</span>` : '';
      return `<div class='chat-msj chat-msj--${m.rol}'><div class='chat-burbuja'>${cuerpo}</div><div class='chat-meta'>${voz}${botonAudio(m, i)}<span class='chat-hora'>${m.hora}</span></div></div>`;
    }).join('') + (ocupado && !transcribiendo ? `<div class='chat-msj chat-msj--asistente'><div class='chat-burbuja chat-escribiendo' aria-label='El asistente está escribiendo'><span></span><span></span><span></span></div></div>` : '');
    cont.scrollTop = abajo ? cont.scrollHeight : scroll; // no saltar al fondo al tocar el audio de un mensaje viejo

    var sug = document.getElementById('chat-sugerencias');
    var soloSaludo = historial.length <= 1;
    sug.hidden = !soloSaludo;
    sug.innerHTML = soloSaludo ? SUGERENCIAS.map(function (t) { return `<button type='button' class='chat-chip' data-texto='${U.escape(t)}'>${U.escape(t)}</button>`; }).join('') : '';
  }

  function abrir() {
    var s = sesion();
    if (cuentaActual !== s.cuentaId) { // conversación nueva por cuenta
      cuentaActual = s.cuentaId;
      detener();
      historial.forEach(function (m) { if (m.audioUrl) URL.revokeObjectURL(m.audioUrl); });
      historial = [{ rol: 'asistente', texto: saludo(), hora: hora() }];
    }
    abierto = true;
    document.getElementById('chat-panel').hidden = false;
    document.body.classList.add('chat-abierto');
    var fab = document.getElementById('chat-fab');
    fab.setAttribute('aria-expanded', 'true');
    fab.setAttribute('aria-label', 'Cerrar asistente virtual');
    pintar();
    document.getElementById('chat-input').focus();
  }

  function cerrar() {
    abierto = false;
    detener();
    terminarGrabacion(true);
    document.getElementById('chat-panel').hidden = true;
    document.body.classList.remove('chat-abierto');
    var fab = document.getElementById('chat-fab');
    fab.setAttribute('aria-expanded', 'false');
    fab.setAttribute('aria-label', 'Abrir asistente virtual');
    fab.focus();
  }

  function enviar(texto) {
    texto = (texto || '').trim();
    if (!texto || ocupado || grabacion) return;
    var input = document.getElementById('chat-input');
    input.value = '';
    input.style.height = 'auto';
    document.getElementById('chat-form').classList.add('chat-form--vacio');
    historial.push({ rol: 'usuario', texto: texto, hora: hora() });
    ocupado = true;
    pedirRespuesta(texto);
  }

  // El último mensaje del historial ya es el del vecino (escrito o transcripto).
  function pedirRespuesta(texto) {
    var input = document.getElementById('chat-input');
    document.getElementById('chat-enviar').disabled = true;
    pintar();
    Chat.responder(texto, historial.slice()).then(function (resp) {
      historial.push({ rol: 'asistente', texto: resp, hora: hora() });
    }, function () {
      historial.push({ rol: 'asistente', texto: 'No pude conectarme con el asistente. Probá de nuevo en unos minutos.', hora: hora() });
    }).then(function () {
      ocupado = false;
      document.getElementById('chat-enviar').disabled = !input.value.trim();
      pintar();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', crear); else crear();

  return { responder: responder, abrir: abrir, cerrar: cerrar };
})();
