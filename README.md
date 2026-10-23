# Portal Ciudadano Las Toscas — Prototipo de demostración

Mockup interactivo de una futura plataforma de autogestión ciudadana para la **Municipalidad de Las Toscas (Santa Fe, Argentina)**.

> **Importante:** es un prototipo de experiencia de usuario. **No está conectado a ningún sistema municipal real**. Todos los datos, importes, trámites, turnos, comprobantes y estados son ficticios. Los pagos son simulados y no representan movimiento de dinero. No tiene validez oficial.

## Cómo ejecutarlo

No requiere instalación, dependencias ni procesos de compilación.

1. Descargá o cloná esta carpeta.
2. Hacé doble clic en `index.html` (o abrila con Chrome, Edge o Firefox actualizados).

Eso es todo. La aplicación funciona abriendo el archivo directamente (`file://`).

> **Mapa:** la selección de ubicación usa **Leaflet + OpenStreetMap** (librería y teselas desde internet). Sin conexión, el mapa muestra un aviso y el formulario sigue funcionando con la dirección escrita.

### Alternativa con servidor local (opcional)

Si preferís servirlo por HTTP (no es necesario):

```
python -m http.server 8080
# o
npx serve .
```

y abrí `http://localhost:8080`.

### Nota sobre el almacenamiento

Los datos de la demo se guardan en `localStorage` del navegador. Algunas configuraciones bloquean el almacenamiento en `file://`; en ese caso la app avisa con un mensaje y funciona igualmente en memoria (los cambios no persisten al recargar).

## Estructura del proyecto

```
index.html                      Estructura principal (shell de la SPA)
css/styles.css                  Variables de marca, componentes, responsive, impresión
js/icons.js                     Biblioteca de iconos SVG (estilo Lucide, embebidos)
js/utils.js                     Formato de moneda ($ 24.500,00), fechas (DD/MM/AAAA), validaciones
js/data.js                      Datos ficticios, solicitudes de servicios y dataset del panel de administración
js/storage.js                   Persistencia en localStorage + reinicio de la demo
js/services.js                  Operaciones de dominio simuladas (auth, pagos, reclamos, servicios, trámites, panel admin)
js/ui.js                        Componentes compartidos: modales, toasts, badges, validación
js/mapa.js                      Mapa Leaflet + OpenStreetMap para marcar ubicaciones
js/app.js                       Router por hash, guard por rol, navegación y arranque
js/views/login.js               Ingreso y registro de ciudadanos (con validaciones)
js/views/home.js                Pantalla de inicio
js/views/pagos.js               Deuda, detalle, flujo de pago simulado, comprobantes
js/views/vehiculos.js           Vehículos, infracciones, descargos
js/views/reclamos.js            Formulario de reclamos y seguimiento
js/views/servicios.js           Catálogo y solicitudes mock de servicios municipales
js/views/tramites.js            Catálogo, solicitudes y "Mis trámites"
js/views/turnos.js              Solicitud de turnos y "Mis turnos"
js/views/perfil.js              Perfil, preferencias, sesión y reinicio de demo
js/views/notificaciones.js      Bandeja de notificaciones
js/views/ayuda.js               Preguntas frecuentes, guías y contacto
js/views/admin/dashboard.js     Panel municipal: resumen de multas, impuestos y atención
js/views/admin/multas.js        Multas del municipio: búsqueda, filtros y detalle
js/views/admin/reclamos.js      Gestión de reclamos con avance de estado
js/views/admin/tramites.js      Gestión de trámites con avance de estado
js/views/admin/ciudadanos.js    Padrón de ciudadanos, deuda y bloqueo (simulado)
assets/logo-municipalidad.png  Escudo oficial de la Municipalidad de Las Toscas
```

## Cuentas de demostración

El login es **simulado** (las claves se guardan sin cifrar en el navegador; nunca uses una clave real). Cuentas incluidas:

| Rol | Correo | Clave |
|---|---|---|
| Ciudadano | `maxi.vecino@ejemplo.com` | `demo1234` |
| Personal municipal (admin) | `gestion@lascoscas.gob.ar` | `demo1234` |

La pantalla de ingreso incluye botones de acceso rápido con ambas cuentas. También se pueden registrar nuevos ciudadanos desde el formulario de registro (validaciones de DNI, correo, teléfono y claves).

## Qué incluye la demo

- **Ingreso y registro (demo)**: login con correo y clave (validaciones de formato y credenciales), registro de nuevos ciudadanos con validaciones (DNI, correo, teléfono, claves con confirmación) y accesos rápidos con las cuentas ficticias. La sesión distingue roles: el ciudadano ve el portal; el personal municipal ve el panel de administración y es redirigido si intenta entrar al portal (y viceversa).
- **Panel de administración (demo)**: resumen de multas e impuestos (pendientes, pagadas, vencidas, en descargo), recaudación simulada, indicadores de atención ciudadana, multas con búsqueda y filtros por estado, gestión de reclamos y trámites con avance de estado, y padrón de ciudadanos con deuda y bloqueo/reactivación simulada.
- **Inicio** con resumen de cuenta, próximo vencimiento, accesos rápidos, actividad reciente y avisos (marcados como demo).
- **Pagos e impuestos**: listado con filtros por categoría y estado, detalle con intereses de ejemplo, flujo de pago en 3 pasos con resultado **aprobado o rechazado (simulado)**, comprobante imprimible (`Imprimir` usa el diálogo del navegador).
- **Vehículos y multas**: vehículos demo, consulta por dominio (simulada), infracciones con pago simulado y descargo ficticio con seguimiento.
- **Reclamos**: asistente en 3 pasos (categoría, formulario con foto y mapa Leaflet/OpenStreetMap para marcar la ubicación, revisión), confirmación con número ficticio y línea de tiempo de seguimiento con avance simulado.
- **Solicitar servicios**: catálogo municipal, formulario validado y “Mis solicitudes” con estado. Las solicitudes mock se guardan por `ciudadanoId` en `Store.state.solicitudesServicios`.
- **Trámites**: catálogo con búsqueda y categorías, detalle con requisitos, solicitud con revisión previa y "Mis trámites".
- **Turnos**: tipo (incluye castración de mascotas, licencia de conducir y consulta psicológica para licencia, con campos propios y dependencia asignada), dependencia, día y horario (disponibilidad simulada), revisión, confirmación y cancelación.
- **Perfil**: datos editables, preferencias de notificaciones, vehículos, inmuebles, historiales, sesión simulada y **reinicio de la demo**.
- **Notificaciones** con filtros, marcado de lectura y enlace al detalle de cada operación.
- **Ayuda** con preguntas frecuentes, guías, canales de contacto (placeholders) y aviso de emergencias.

## Personalización

- **Paleta y marca**: los colores están como variables CSS al inicio de `css/styles.css` (`--c-primario`, `--c-primario-osc`, etc.). El escudo institucional es `assets/logo-municipalidad.png` (favicon, sidebar, cabecera y pantalla de ingreso); para actualizarlo basta reemplazar ese archivo manteniendo el nombre.
- **Datos**: los datos ficticios se generan en `js/data.js`. Las fechas se calculan relativas al día actual para que la demo luzca siempre activa.
- **Futuras integraciones**: toda la persistencia pasa por `js/storage.js` y las operaciones por `js/services.js`; esos dos archivos son la frontera natural para conectar un backend real (API tributaria, pasarela de pagos, sistema de expedientes) sin reescribir las pantallas. El mapeo tentativo de servicios a endpoints REST está comentado en `js/services.js` (ej.: `login` → `POST /auth/login`, `resumenMunicipal` → `GET /admin/resumen`, `avanzarReclamoMunicipal` → `PATCH /admin/reclamos/:id`). El dataset del panel admin (`state.municipal`) es independiente del portal ciudadano para poder reemplazarlo por datos reales sin tocar las vistas del vecino.

## Decisiones técnicas

- HTML5, CSS3 y JavaScript nativo, **sin frameworks ni build**. Scripts clásicos compatibles con `file://`.
- SPA con **router por hash** (`#/pagos/detalle/ob-1`): el botón "atrás" del navegador funciona y no se recarga la página.
- Única fuente de verdad (`Store.state`) persistida en `localStorage`; todos los módulos leen del mismo estado, por lo que un pago simulado se refleja en el inicio, los listados y el historial. El estado está versionado (`version: 3`): si hay una versión guardada anterior, se descarta y se vuelve a sembrar.
- **Roles simulados**: la sesión guarda el rol de la cuenta activa (`ciudadano` / `admin`). El router protege las rutas por rol y la navegación (sidebar y barra inferior) se reconstruye al entrar o salir. Las claves de las cuentas demo se guardan sin cifrar en `localStorage`, con avisos para no usar claves reales.
- Accesibilidad: etiquetas y roles ARIA, foco visible, manejo de foco en modales, contraste verificado, estados comunicados con texto además de color, áreas táctiles de al menos 44 px, respeto de `prefers-reduced-motion` y de las áreas seguras en móviles.
- Iconos: paths SVG de estilo [Lucide](https://lucide.dev) (ISC) embebidos localmente, sin dependencias de red.
- Mapas: **Leaflet 1.9.4** con teselas de **OpenStreetMap** (atribución visible en el mapa). Requiere conexión a internet; sin conexión, el mapa muestra un aviso y el formulario sigue funcionando con la dirección escrita.
