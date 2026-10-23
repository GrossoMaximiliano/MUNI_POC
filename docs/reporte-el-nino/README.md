# Reconstrucción: Reporte por lluvias (El Niño)

Guía paso a paso para **rehacer la funcionalidad** de "reporte por ser afectado por las lluvias (El Niño)" si el código fue pisado por otra rama.

La función en una frase: un acceso destacado en el Inicio lleva a un formulario de **una sola pantalla** donde el vecino elige si el ingreso de agua es **leve** o **crítico**, carga dirección, personas, asistencia especial, teléfono y foto opcional, recibe un número de reporte (`AGU-2026-XXXXXX`) y hace seguimiento con estados `Recibido → Verificado → En asistencia → Cerrado`.

## Archivos involucrados

| Archivo | Acción | Qué se agrega |
|---|---|---|
| `js/views/agua.js` | **CREAR** (copia entera) | Vista completa. Copia de respaldo en `docs/reporte-el-nino/agua.js` |
| `index.html` | 1 línea | `<script src='js/views/agua.js'></script>` |
| `js/app.js` | 3 rutas + 1 clave de mapa | `agua`, `agua/nuevo`, `agua/detalle/:id` y `agua: 'inicio'` |
| `js/data.js` | Catálogos + seed | `nivelesAgua`, `estadosAgua`, `comentariosAgua` y `reportesAgua` en el estado inicial |
| `js/storage.js` | 1 línea | Migración para estados guardados viejos |
| `js/services.js` | 2 funciones + export | `crearReporteAgua`, `avanzarReporteAgua` |
| `js/ui.js` | 1 función + export | `procesarImagen` (foto opcional reducida) |
| `js/views/home.js` | Tarjeta + icono | Acceso destacado de emergencia en Accesos rápidos |
| `js/views/notificaciones.js` | Grupo + icono | Filtro "Alertas por lluvias" |
| `js/views/reclamos.js` | 1 botón (opcional) | Enlace cruzado "Reportar agua por lluvias" |
| `css/styles.css` | Bloque al final | `.acceso-emergencia` y `.opcion-nivel` |
| `README.md` | 1 viñeta (opcional) | Descripción de la función |

Requisitos previos que ya existen en el proyecto: `Icons.r('droplets')`, etc. (biblioteca embebida en `js/icons.js`), `U.fecha/escape/uid/esTelefono`, `Store.save()`, `Servicios.notificar/logActividad`, `UI.toast/ponerError/limpiarErrores/etiquetaDemo`.

## Paso 1 — `js/data.js`

**1.a)** Dentro de `catalogos` (el objeto que devuelve `DEMO`), pegar **antes de** `avisos: [`:

```js
    nivelesAgua: [
      { id: 'leve', nombre: 'Ingreso leve', texto: 'Entra un poco de agua: humedad, charcos o escurrimiento que puedo controlar.', icono: 'droplets', clase: 'b-aviso' },
      { id: 'critico', nombre: 'Ingreso crítico', texto: 'Entra mucha agua o sube rápido. Hay riesgo para personas o bienes.', icono: 'alert-triangle', clase: 'b-peligro' }
    ],
    estadosAgua: ['Recibido', 'Verificado', 'En asistencia', 'Cerrado'],
    comentariosAgua: {
      'Verificado': 'Personal de Defensa Civil verificó la situación en el domicilio (demo).',
      'En asistencia': 'Brigada asignada con bomba de achique. Asistencia en camino (demo).',
      'Cerrado': 'La situación fue atendida y el reporte se cerró (demo).'
    },
```

**1.b)** Dentro de `estadoInicial()`, pegar **justo después del array `turnos: [...]`** (y su coma), un array `reportesAgua` con un ejemplo precargado:

```js
      reportesAgua: [
        { id: 'agu-1', numero: 'AGU-2026-000017', nivel: 'critico', direccion: 'Calle 14 N°45', barrio: 'Virgen Niña', personas: 4, asistencia: true, telefono: '3482 555-1234', notas: 'El agua entra por la calle y ya cubre 20 cm dentro de la casa.', fecha: D(-1, 22, 30), estado: 'En asistencia', timeline: [ { estado: 'Recibido', fecha: D(-1, 22, 31), comentario: 'Reporte crítico recibido. Prioridad alta (demo).' }, { estado: 'Verificado', fecha: D(-1, 23, 10), comentario: 'Defensa Civil verificó la situación en el domicilio (demo).' }, { estado: 'En asistencia', fecha: D(0, 0, 45), comentario: 'Brigada asignada con bomba de achique. Asistencia en camino (demo).' } ] }
      ],
```

> `D(dias, hora, minutos)` es el helper local de fechas relativas que ya existe al inicio de `data.js`.

## Paso 2 — `js/storage.js`

En `init()`, **debajo de** `if (!state.sesion) state.sesion = { iniciada: false };` agregar:

```js
    if (!state.reportesAgua) state.reportesAgua = [];
```

Esto hace que un estado guardado con la versión anterior (sin la clave) se complete solo, sin perder datos del usuario.

## Paso 3 — `js/services.js`

Dentro del IIFE, pegar estas dos funciones (por ejemplo, antes de `crearTramite`):

```js
  function crearReporteAgua(datos) {
    var st = S();
    var critico = datos.nivel === 'critico';
    var rep = {
      id: U.uid('agu'),
      numero: 'AGU-2026-' + pad(18 + st.reportesAgua.length),
      nivel: datos.nivel,
      direccion: datos.direccion,
      barrio: datos.barrio,
      personas: datos.personas || 1,
      asistencia: !!datos.asistencia,
      telefono: datos.telefono,
      notas: datos.notas || '',
      fecha: U.hoyISO(),
      estado: 'Recibido',
      timeline: [ { estado: 'Recibido', fecha: U.hoyISO(), comentario: critico ? 'Reporte crítico recibido. Prioridad alta: se contactará al teléfono indicado (demo).' : 'Reporte recibido. Quedó registrado para seguimiento (demo).' } ]
    };
    st.reportesAgua.unshift(rep);
    notificar('agua', 'Reporte por lluvias recibido (demo)', rep.numero + ' · ' + (critico ? 'Ingreso crítico' : 'Ingreso leve') + ' · ' + rep.direccion + ', ' + rep.barrio + '.', 'agua/detalle/' + rep.id);
    logActividad('agua', 'Reporte por lluvias ' + rep.numero, critico ? 'Ingreso crítico' : 'Ingreso leve', 'agua/detalle/' + rep.id);
    Store.save();
    return rep;
  }

  function avanzarReporteAgua(id) {
    var st = S();
    var rep = st.reportesAgua.filter(function (r) { return r.id === id; })[0];
    if (!rep) return null;
    var estados = C().estadosAgua;
    var idx = estados.indexOf(rep.estado);
    if (idx < 0 || idx >= estados.length - 1) return null;
    var nuevo = estados[idx + 1];
    rep.estado = nuevo;
    rep.timeline.push({ estado: nuevo, fecha: U.hoyISO(), comentario: C().comentariosAgua[nuevo] });
    notificar('agua', 'Tu reporte por lluvias avanzó (demo)', rep.numero + ' pasó a: ' + nuevo + '.', 'agua/detalle/' + rep.id);
    logActividad('agua', 'Reporte por lluvias ' + rep.numero, nuevo, 'agua/detalle/' + rep.id);
    Store.save();
    return nuevo;
  }
```

Y en el `return { ... }` final del módulo agregar:

```js
    crearReporteAgua: crearReporteAgua,
    avanzarReporteAgua: avanzarReporteAgua,
```

> `pad`, `C`, `S`, `notificar` y `logActividad` ya existen en ese archivo. El tipo de notificación es `'agua'` (se registra el filtro en el Paso 8).

## Paso 4 — `js/ui.js`

Función para adjuntar foto opcional (valida tipo/3 MB y reduce a JPEG). Pegar **antes del** `return { ... }` final:

```js
  function procesarImagen(archivo, maxLado, cb) {
    if (!archivo) { cb('No se seleccionó ningún archivo.'); return; }
    if (!/^image\//.test(archivo.type)) { cb('El archivo debe ser una imagen.'); return; }
    if (archivo.size > 3 * 1024 * 1024) { cb('La imagen supera los 3 MB permitidos.'); return; }
    var lector = new FileReader();
    lector.onload = function () {
      var img = new Image();
      img.onload = function () {
        var escala = Math.min(1, maxLado / Math.max(img.width, img.height));
        var lienzo = document.createElement('canvas');
        lienzo.width = Math.round(img.width * escala);
        lienzo.height = Math.round(img.height * escala);
        lienzo.getContext('2d').drawImage(img, 0, 0, lienzo.width, lienzo.height);
        try { cb(null, lienzo.toDataURL('image/jpeg', 0.72)); } catch (e) { cb('No se pudo procesar la imagen.'); }
      };
      img.onerror = function () { cb('La imagen no se pudo leer.'); };
      img.src = lector.result;
    };
    lector.onerror = function () { cb('No se pudo leer el archivo.'); };
    lector.readAsDataURL(archivo);
  }
```

Y en el `return` final del módulo agregar: `procesarImagen: procesarImagen,`

## Paso 5 — `js/views/agua.js` (ARCHIVO NUEVO)

Copiar el archivo completo desde este respaldo:

```
docs/reporte-el-nino/agua.js  →  js/views/agua.js
```

Contiene las tres pantallas: `main()` (listado "Mis reportes" con contador de activos), `nuevo()` (formulario de una pantalla: niveles leve/crítico, dirección, barrio, personas, asistencia especial, teléfono, notas, foto) y `detalle(id)` (ficha + línea de tiempo + "Simular avance"). Usa la redacción formal **"¿Estás siendo afectado por las lluvias?"**.

## Paso 6 — `index.html`

En la lista de scripts, agregar **antes de** `js/app.js` (por ejemplo debajo de `js/views/reclamos.js`):

```html
<script src='js/views/agua.js'></script>
```

## Paso 7 — `js/app.js`

**7.a)** En `registrarRutas()`, debajo de `add('reclamos', ...)`:

```js
    add('agua', function () { return Views.agua.main(); });
    add('agua/nuevo', function () { return Views.agua.nuevo(); });
    add('agua/detalle/:id', function (p) { return Views.agua.detalle(p.id); });
```

**7.b)** En `marcarNav()`, dentro del objeto `mapa` agregar la clave:

```js
    agua: 'inicio',
```

(de esta forma, al navegar por la sección de agua queda resaltado "Inicio" en la barra).

## Paso 8 — `js/views/home.js`

**8.a)** La tarjeta de emergencia (va **dentro del grid** `.accesos`, después de los 6 accesos normales; `grid-column: 1 / -1` la hace ocupar el ancho completo). Primero agregar esta función al módulo:

```js
  function accesoAgua() {
    var activos = Store.state.reportesAgua.filter(function (r) { return r.estado !== 'Cerrado'; }).length;
    return `
      <a class='acceso acceso-emergencia' href='#/agua/nuevo'>
        <span class='tinte t-rojo item-ico'>${Icons.r('droplets', 'i-26')}</span>
        <span style='flex:1;min-width:0'>
          <span class='item-titulo' style='display:block'>¿Estás siendo afectado por las lluvias?</span>
          <span class='item-sub' style='margin-top:2px'><span>Reportá tu situación · Alerta El Niño (demo)</span></span>
        </span>
        ${activos ? `<span class='badge b-peligro'>${activos} activo${activos === 1 ? '' : 's'}</span>` : ''}
        <span class='flecha'>${Icons.r('chevron-right')}</span>
      </a>`;
  }
```

**8.b)** En `main()`, dentro de `<div class='accesos'>` y después del `.map(...)` de `accesos`, insertar `${accesoAgua()}`.

**8.c)** Al objeto `iconosActividad` agregarle: `agua: 'droplets'` (para la actividad reciente).

## Paso 9 — `js/views/notificaciones.js`

En el objeto `grupos` agregar: `agua: 'Alertas por lluvias',` (antes de `tramite`), y en el mapa de `iconoTipo` agregar: `agua: 'droplets'`.

## Paso 10 — `js/views/reclamos.js` (opcional)

En `main()`, dentro de la `fila-acciones` del encabezado, agregar el enlace cruzado:

```html
<a class='btn btn-secundario' href='#/agua/nuevo'>${Icons.r('droplets', 'i-18')} Reportar agua por lluvias</a>
```

## Paso 11 — `css/styles.css`

Pegar **al final del archivo**:

```css
/* Acceso destacado: reporte por lluvias (El Niño) */
.acceso-emergencia{
  grid-column:1 / -1;
  flex-direction:row;justify-content:flex-start;text-align:left;
  gap:12px;padding:13px 14px;border:1.5px solid var(--c-peligro-borde);
  background:linear-gradient(180deg,#FDECEA,#FFF6F5);
}
.acceso-emergencia:hover{color:var(--c-peligro);box-shadow:0 8px 22px rgba(179,38,30,.18)}
.acceso-emergencia .tinte{width:48px;height:48px;flex:0 0 48px}
.acceso-emergencia .item-sub span{color:var(--c-texto-2)}

/* Opciones de nivel (leve / crítico) */
.opcion-nivel{padding:15px;border-radius:16px;align-items:flex-start}
.opcion-nivel .tinte{width:52px;height:52px;flex:0 0 52px;border-radius:16px}
.opcion-nivel .opcion-titulo{font-size:15.5px}
.opcion-nivel .opcion-sub{display:block;margin-top:2px;line-height:1.4}
.opcion-nivel.esta-leve:has(input:checked){border-color:var(--c-aviso);background:var(--c-aviso-suave);box-shadow:0 0 0 1px var(--c-aviso)}
.opcion-nivel.esta-leve:has(input:checked) .marca{background:var(--c-aviso);border-color:var(--c-aviso)}
.opcion-nivel.esta-critico:has(input:checked){border-color:var(--c-peligro);background:var(--c-peligro-suave);box-shadow:0 0 0 1px var(--c-peligro)}
.opcion-nivel.esta-critico:has(input:checked) .marca{background:var(--c-peligro);border-color:var(--c-peligro)}
```

## Paso 12 — `README.md` (opcional)

En la lista de qué incluye la demo, agregar esta viñeta:

```md
- **Alerta por lluvias (El Niño)**: acceso destacado en el inicio para reportar ingreso de agua en la vivienda en dos niveles (leve o crítico), con personas en la vivienda, asistencia especial, contacto y foto opcional; seguimiento con estados (Recibido → Verificado → En asistencia → Cerrado).
```

## Validación final

1. Sintaxis de todo lo tocado:

```
node --check js/views/agua.js && node --check js/data.js && node --check js/storage.js && node --check js/services.js && node --check js/ui.js && node --check js/app.js && node --check js/views/home.js && node --check js/views/notificaciones.js
```

2. Smoke test del ciclo completo (crear + avanzar hasta Cerrado + notificación):

```
node -e "global.window=global;const fs=require('fs');eval(fs.readFileSync('js/utils.js','utf8'));eval(fs.readFileSync('js/data.js','utf8'));eval(fs.readFileSync('js/storage.js','utf8'));eval(fs.readFileSync('js/services.js','utf8'));Store.init();Servicios.iniciarSesion();const r=Servicios.crearReporteAgua({nivel:'leve',direccion:'Calle 6 N°99',barrio:'Centro',personas:2,asistencia:false,telefono:'34825559999',notas:''});console.log(r.numero,r.estado,Servicios.avanzarReporteAgua(r.id),Servicios.avanzarReporteAgua(r.id),Servicios.avanzarReporteAgua(r.id),Servicios.avanzarReporteAgua(r.id));console.log('tipo notif:',Store.state.notificaciones[0].tipo);"
```

Salida esperada: `AGU-2026-XXXXXX Recibido Verificado En asistencia Cerrado null` y `tipo notif: agua`.

3. En el navegador: Inicio → tarjeta roja de lluvias → reportar → confirmación → seguimiento → campana con la novedad → filtro "Alertas por lluvias".

## Notas de diseño

- **Redacción formal**: el título es "¿Estás siendo afectado por las lluvias?" (decisión del equipo; se descartó "¿Te entra agua?" por prestarse a doble sentido). El campo de dirección es "Dirección del domicilio afectado".
- **Disclaimers**: todas las pantallas aclaran que es demostración y que ningún área municipal recibe los reportes; se recuerdan los canales reales (911 / Defensa Civil).
- **Migración**: el `if (!state.reportesAgua)` del Paso 2 es lo que permite pisar código sin romper el `localStorage` de quien ya probó versiones anteriores.
- **Fechas relativas**: el seed usa `D(-1, 22, 30)` para que el ejemplo siempre parezca reciente, sea cual sea el día en que se abra la demo.