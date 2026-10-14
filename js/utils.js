window.U = (function () {
  var nf = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2 });
  var p2 = function (n) { return String(n).padStart(2, '0'); };
  function parseFecha(iso) { if (!iso) return null; var f = new Date(iso); if (isNaN(f.getTime())) return null; return f; }
  function money(n) { return nf.format(n || 0); }
  function fecha(iso) { var f = parseFecha(iso); if (!f) return '-'; return p2(f.getDate()) + '/' + p2(f.getMonth() + 1) + '/' + f.getFullYear(); }
  function fechaHora(iso) { var f = parseFecha(iso); if (!f) return '-'; return fecha(iso) + ' ' + p2(f.getHours()) + ':' + p2(f.getMinutes()) + ' h'; }
  function fechaLarga(iso) { var f = parseFecha(iso); if (!f) return '-'; return f.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); }
  function hoyISO() { var d = new Date(); return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()) + 'T' + p2(d.getHours()) + ':' + p2(d.getMinutes()); }
  function isoOffset(dias, hora, min) { var d = new Date(); d.setDate(d.getDate() + dias); d.setHours(hora == null ? 10 : hora, min == null ? 0 : min, 0, 0); return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()) + 'T' + p2(d.getHours()) + ':' + p2(d.getMinutes()); }
  function diasHasta(iso) { var f = parseFecha(iso); if (!f) return null; var hoy = new Date(); hoy.setHours(0, 0, 0, 0); var obj = new Date(f.getFullYear(), f.getMonth(), f.getDate()); return Math.round((obj - hoy) / 86400000); }
  function venceTexto(iso) { var d = diasHasta(iso); if (d === null) return ''; if (d === 0) return 'Vence hoy'; if (d === 1) return 'Vence mañana'; if (d > 1) return 'Vence en ' + d + ' días'; if (d === -1) return 'Venció ayer'; return 'Venció hace ' + Math.abs(d) + ' días'; }
  function hace(iso) { var f = parseFecha(iso); if (!f) return ''; var min = Math.floor((Date.now() - f.getTime()) / 60000); if (min < 1) return 'recién'; if (min < 60) return 'hace ' + min + ' min'; var h = Math.floor(min / 60); if (h < 24) return 'hace ' + h + ' h'; var dd = Math.floor(h / 24); if (dd < 30) return 'hace ' + dd + (dd === 1 ? ' día' : ' días'); return fecha(iso); }
  function escape(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&#39;'); }
  function iniciales(nombre, apellido) { var a = (nombre || ' ').trim().charAt(0); var b = (apellido || ' ').trim().charAt(0); return ((a + b).toUpperCase() || 'V'); }
  function uid(prefijo) { return (prefijo || 'id') + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7); }
  function esEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim()); }
  function esTelefono(v) { return String(v || '').replace(/\D/g, '').length >= 8; }
  function plural(n, sing, plur) { return n === 1 ? sing : (plur || sing + 's'); }
  return { money: money, fecha: fecha, fechaHora: fechaHora, fechaLarga: fechaLarga, hoyISO: hoyISO, isoOffset: isoOffset, diasHasta: diasHasta, venceTexto: venceTexto, hace: hace, escape: escape, iniciales: iniciales, uid: uid, esEmail: esEmail, esTelefono: esTelefono, plural: plural, parseFecha: parseFecha };
})();
