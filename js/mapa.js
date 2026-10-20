window.Mapa = (function () {
  var CENTRO = [-28.3549, -59.2594];

  function crearIcono() {
    if (!window.L || !window.Icons) return null;
    return L.divIcon({
      className: 'mapa-marcador',
      html: "<span class='mapa-marcador-ico'>" + Icons.r('map-pin') + "</span>",
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
  }

  function crear(contenedor, opciones) {
    opciones = opciones || {};
    if (!contenedor) return null;
    if (!window.L) {
      contenedor.innerHTML = "<div class='mapa-error'>No se pudo cargar el mapa.<br>Verificá tu conexión a internet.</div>";
      return null;
    }
    var valor = opciones.valor;
    var tienePunto = valor && typeof valor.lat === 'number' && typeof valor.lng === 'number';
    var mapa = L.map(contenedor, {
      center: tienePunto ? [valor.lat, valor.lng] : CENTRO,
      zoom: opciones.zoom || 15,
      scrollWheelZoom: false
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">Colaboradores de OpenStreetMap</a>'
    }).addTo(mapa);

    var icono = crearIcono();
    var marcador = null;

    function poner(lat, lng) {
      if (marcador) {
        marcador.setLatLng([lat, lng]);
      } else {
        marcador = L.marker([lat, lng], { draggable: true, icon: icono || new L.Icon.Default() }).addTo(mapa);
        marcador.on('dragend', function () {
          var ll = marcador.getLatLng();
          if (opciones.onChange) opciones.onChange(ll.lat, ll.lng);
        });
      }
    }

    if (tienePunto) poner(valor.lat, valor.lng);
    mapa.on('click', function (e) {
      poner(e.latlng.lat, e.latlng.lng);
      if (opciones.onChange) opciones.onChange(e.latlng.lat, e.latlng.lng);
    });
    setTimeout(function () { mapa.invalidateSize(); }, 80);
    return mapa;
  }

  return { crear: crear, CENTRO: CENTRO };
})();
