# Base de conocimiento — Asistente virtual de la Municipalidad de Las Toscas

Documento fuente para generar embeddings del asistente del Portal Ciudadano (MUNI_POC).

## Cómo usar este documento

- **Un fragmento por sección `##`.** Cada sección se entiende sola (repite el contexto necesario) para que pueda indexarse por separado. Partir el texto en cada `---`.
- **Metadatos.** Cada fragmento empieza con un comentario `<!-- id | tipo | fuente | confiabilidad -->`. Usarlo como metadata del vector, no como texto a embeber.
  - `fuente: portal` → aplicación de autogestión (MUNI_POC).
  - `fuente: sitio` → sitio institucional (MUNI_LAND).
  - `confiabilidad: oficial` → dato publicado en el sitio institucional.
  - `confiabilidad: demo` → dato ficticio o de demostración del prototipo; el asistente debe aclararlo.
- **Datos de la cuenta del vecino** (deudas, reclamos, turnos, etc.) cambian con cada acción. Lo ideal es inyectarlos en el prompt en tiempo real desde `Store.state`, no desde los embeddings. La sección "Cuenta demo del vecino" queda como referencia del estado inicial.
- **Fechas relativas.** En la demo, vencimientos y fechas se calculan relativos al día actual ("vence en 5 días").

---

## Instrucciones de comportamiento del asistente
<!-- asistente-reglas | reglas | portal | demo -->

El asistente virtual atiende a vecinos de Las Toscas (Santa Fe, Argentina) dentro del Portal Ciudadano. Reglas:

- Responder en español rioplatense, con tuteo con voseo ("podés", "tenés"), de forma breve, clara y amable.
- Guiar al vecino a la sección del portal que resuelve su consulta, indicando el camino (por ejemplo: "Entrá a Pagos, elegí la obligación y tocá Continuar al pago").
- El portal es un **prototipo de demostración**: no está conectado a sistemas municipales reales. Pagos, comprobantes, reclamos, trámites y turnos son simulados y no tienen validez oficial. Aclararlo cuando el vecino quiera hacer algo con efectos reales.
- Nunca pedir datos de tarjeta, claves bancarias ni contraseñas.
- Ante emergencias (incendio, accidente, inundación con riesgo, violencia), indicar primero los números de emergencia: 911, Bomberos 100, Policía 101, SIES 107. El portal no reemplaza esos canales.
- No inventar importes, plazos, requisitos ni teléfonos. Si un dato no está en la base, decir que no se tiene y derivar a la Municipalidad: Calle 12 N° 901, (03482) 492-000, lunes a viernes de 7:00 a 13:00 hs.
- Diferenciar datos oficiales (sitio institucional) de datos de demostración del portal.

---

## Qué es el Portal Ciudadano de Las Toscas
<!-- portal-general | general | portal | demo -->

El Portal Ciudadano (también llamado Autogestión) es un prototipo de demostración de una futura plataforma de autogestión de la Municipalidad de Las Toscas, provincia de Santa Fe. Permite, de forma simulada:

- Consultar y pagar tasas, patentes, multas y planes de pago (pago simulado).
- Ver vehículos e infracciones de tránsito y presentar descargos.
- Hacer reclamos por problemas del barrio y seguir su estado.
- Solicitar servicios municipales (camión atmosférico, poda, voluminosos, etc.).
- Iniciar trámites y consultar "Mis trámites".
- Pedir y cancelar turnos en dependencias municipales.
- Reportar ingreso de agua en la vivienda por lluvias (alerta El Niño).
- Recibir notificaciones y editar el perfil.

Todos los datos son ficticios, los pagos no mueven dinero y nada se envía a la Municipalidad. Los datos se guardan solo en el navegador del usuario (localStorage); si se borran los datos del navegador o se reinicia la demo desde Perfil, todo vuelve al estado inicial.

Dirección del portal: https://grossomaximiliano.github.io/MUNI_POC

---

## Ingreso, registro y cuentas de prueba
<!-- portal-login | guia | portal | demo -->

El ingreso al Portal Ciudadano es simulado. Se entra con correo y clave.

Cuentas de demostración:
- Vecino (ciudadano): maxi.vecino@ejemplo.com, clave demo1234. También hay un botón de "Acceso rápido de demostración" que entra directo con esta cuenta.
- Personal municipal (administrador): gestion@lascoscas.gob.ar, clave demo1234. Entra al Panel municipal.

Registro de nuevos vecinos: desde "Crear cuenta (demo)". Pide nombre, apellido, DNI (7 u 8 números, sin puntos), correo válido, teléfono (al menos 8 números) y clave (al menos 6 caracteres) con confirmación. La clave se guarda sin cifrar en el navegador: nunca usar una clave real.

Cada rol ve su propia parte: el vecino ve el portal ciudadano y el personal municipal ve el panel de administración; si intentan entrar a la otra sección, se los redirige.

---

## Navegación y secciones del portal
<!-- portal-navegacion | guia | portal | demo -->

Secciones del Portal Ciudadano para el vecino:
- **Inicio**: resumen de cuenta, obligaciones pendientes, próximo vencimiento, accesos rápidos, actividad reciente y avisos.
- **Pagos e impuestos**: deuda, detalle de cada obligación, pago simulado e historial de comprobantes.
- **Vehículos y multas**: vehículos asociados, infracciones, consulta por dominio y descargos.
- **Reclamos**: nuevo reclamo y seguimiento.
- **Solicitar servicios**: pedido de servicios municipales y "Mis solicitudes".
- **Trámites y turnos**: catálogo de trámites, "Mis trámites" y turnos.
- **Mi perfil**: datos personales, preferencias de notificaciones, vehículos, inmuebles, cierre de sesión y reinicio de la demo.
- **Notificaciones**: avisos de vencimientos, reclamos, trámites, turnos y comunicados.
- **Ayuda y contacto**: guías, preguntas frecuentes, atención presencial y emergencias.

En el celular hay una barra inferior fija con Inicio, Pagos, Reclamos, Servicios y Trámites. Al perfil se entra tocando el avatar (iniciales) arriba a la derecha. En la computadora las secciones están en el menú lateral.

Accesos rápidos del Inicio: Pagar impuestos, Consultar patentes, Ver multas, Hacer un reclamo, Solicitar servicios, Pedir un turno, Mis trámites. También hay un acceso destacado "¿Estás siendo afectado por las lluvias?" para reportar ingreso de agua.

---

## Tipos de obligaciones y estados de deuda
<!-- pagos-categorias | catalogo | portal | demo -->

En Pagos e impuestos las obligaciones se agrupan en categorías:
- **Tasa General de Inmuebles (TGI)**: tasa por inmueble, identificada por número de partida (ejemplo: Partida 123-45.890). Se paga en cuotas.
- **Patente municipal**: impuesto por vehículo, identificado por dominio. Anual.
- **Derechos y tasas comerciales**: por ejemplo la Tasa de inspección sanitaria de una cuenta comercial, trimestral.
- **Otras tasas municipales**: derecho de publicidad y propaganda, tasa por servicios de cementerio, etc.
- **Multas e infracciones**: actas de tránsito.
- **Planes de pago y cuotas**: planes de regularización de deuda (ejemplo: cuota 4 de 12).

Estados de una obligación:
- **Pendiente**: aún no vence o está por vencer.
- **Vencida**: pasó la fecha de vencimiento; se muestran intereses o recargos de ejemplo.
- **Pagada**: tiene comprobante.
- **En proceso**: hay un pago iniciado pendiente de acreditación.

Se puede filtrar el listado por categoría y por estado. Cada obligación muestra concepto, identificador, período, vencimiento, importe, intereses y número de boleta (ficticio).

---

## Cómo pagar una obligación en el portal
<!-- pagos-como-pagar | guia | portal | demo -->

Para pagar una tasa, patente, multa o cuota en el Portal Ciudadano:
1. Entrá a **Pagos** (o tocá "Pagar impuestos" / "Ver mi deuda" en Inicio).
2. Elegí la obligación y tocá **Continuar al pago**.
3. **Paso 1 de 3 — Revisá la obligación**: concepto, período, importe e intereses.
4. **Paso 2 de 3 — Medio de pago**: tarjeta de crédito o débito, transferencia o débito automático, o efectivo en oficina o red de pagos (genera una boleta para pagar en forma presencial).
5. **Paso 3 de 3 — Confirmación**: se procesa el pago.

El resultado puede ser **aprobado** (la obligación pasa a Pagada y se genera un comprobante imprimible) o **rechazado** (la deuda no cambia). Hay una opción "Simular un pago rechazado" para ver cómo se informa un error.

Todo es simulado: no se debita dinero, no se contacta a ningún banco y no se piden datos de tarjeta ni claves. El comprobante dice "PROTOTIPO SIN VALIDEZ" y no acredita pagos reales.

Los comprobantes quedan en **Pagos → Historial** ("Mis comprobantes"), desde donde se pueden ver e imprimir.

---

## Pago de TGI fuera del portal (información oficial)
<!-- oficial-pago-tgi | tramite | sitio | oficial -->

Pago de la Tasa General de Inmuebles (TGI) según el sitio de la Municipalidad de Las Toscas:
- Qué se necesita: número de partida o de contribuyente.
- Dónde: online desde el portal de Autogestión municipal, o en la Caja Municipal.
- Medios: medios electrónicos o pago en Caja Municipal.
- Horario: portal 24 hs; Caja Municipal de lunes a viernes de 7:00 a 12:30 hs.
- Costo: según liquidación.

---

## Vehículos, multas y consulta por dominio
<!-- vehiculos-multas | guia | portal | demo -->

En **Vehículos y multas** el vecino ve los vehículos asociados a su cuenta y sus infracciones de tránsito.

Cada infracción muestra número de acta, fecha, motivo, ubicación, importe y estado: Pendiente, Vencida, Pagada o En descargo (con descargo en curso). Si la multa tiene obligación asociada, se puede pagar en forma simulada desde Pagos.

**Consulta por dominio**: se ingresa una patente (por ejemplo AB 529 JR) y se muestran sus infracciones. Es simulada: solo reconoce los dominios cargados en la demo.

Para consultar una multa: desde Inicio tocá "Ver multas" o entrá a Vehículos y multas.

Las infracciones del portal son ficticias y no constituyen sanciones reales; no implican descuentos ni plazos verificados.

---

## Cómo presentar un descargo de tránsito
<!-- vehiculos-descargo | guia | portal | demo -->

Un descargo es la presentación del vecino para que se revise un acta de infracción de tránsito. En el portal:
1. Entrá a Vehículos y multas y abrí la infracción.
2. Tocá la opción de presentar descargo.
3. Escribí por qué considerás que el acta debería revisarse (mínimo 20 caracteres).
4. Confirmá: se genera un número de descargo ficticio (ejemplo DER-2026-00018) y la infracción pasa a "En descargo".

Requisitos ilustrativos: número de acta, expresión escrita del descargo y datos de contacto actualizados en el perfil.

Estados del descargo: **Presentado** (recibido por Mesa de Entradas) → **En revisión** (el área de Tránsito lo evalúa) → **Resuelto**.

El plazo informado en la demo es de 30 días corridos desde el acta, pero es un dato de demostración no verificado. El descargo no se envía a ningún organismo real.

---

## Cómo hacer un reclamo por un problema del barrio
<!-- reclamos-como | guia | portal | demo -->

Para reportar un problema en la vía pública en el Portal Ciudadano:
1. Entrá a **Reclamos** y tocá **Nuevo reclamo** (o "Hacer un reclamo" en Inicio).
2. **Paso 1 de 3 — ¿Qué está pasando?**: elegí la categoría.
3. **Paso 2 de 3 — Datos**: título, descripción (mínimo 20 caracteres: qué pasa, desde cuándo y cómo afecta), barrio, dirección o referencia (obligatoria), punto en el mapa (opcional, con OpenStreetMap) y foto opcional (hasta 3 MB; se reduce automáticamente).
4. **Paso 3 de 3 — Revisá antes de enviar** y confirmá.

Se genera un número de reclamo (ejemplo REC-2026-000214) y se puede seguir su avance en la línea de tiempo del reclamo.

Categorías: Alumbrado público; Baches y calles; Recolección de residuos; Microbasurales; Poda y arbolado; Plazas y espacios verdes; Desagües e infraestructura; Señalización vial; Otros problemas municipales.

Barrios disponibles: Centro, Fátima, Virgen Niña, Itatí y Zona rural.

En la demo ningún área municipal recibe el reclamo. Fuera del portal, los reclamos por alumbrado, residuos y calles se hacen a Servicios Públicos: 3482 650174 (guardia permanente, sin costo).

---

## Estados de un reclamo
<!-- reclamos-estados | catalogo | portal | demo -->

Un reclamo del Portal Ciudadano avanza por estos estados:
1. **Recibido**: ingresó al sistema de atención ciudadana.
2. **En revisión**: Atención Ciudadana lo evalúa y puede asignar un inspector.
3. **Derivado al área correspondiente**: pasó al área técnica responsable (Alumbrado Público, Vialidad Urbana, Higiene Urbana, etc.).
4. **En resolución**: hay tareas en curso o programadas.
5. **Resuelto**: se informó la intervención realizada.

Estados especiales:
- **Requiere información**: el área necesita datos adicionales del vecino (por ejemplo una foto o una referencia más precisa). El vecino puede responder desde el detalle del reclamo (mínimo 5 caracteres) y el reclamo vuelve a "En revisión".
- **No corresponde**: el tema no es competencia municipal (por ejemplo, una señal de jurisdicción provincial; se sugiere contactar a Vialidad Provincial).

Los cambios de estado en la demo son simulados en el dispositivo.

---

## Solicitar servicios municipales
<!-- servicios | guia | portal | demo -->

En **Solicitar servicios** el vecino pide un servicio municipal y consulta el estado en "Mis solicitudes".

Servicios disponibles:
- Camión atmosférico (desagote de pozos negros).
- Junte de ramas / poda.
- Recolección de residuos voluminosos (muebles, electrodomésticos).
- Desmalezado / limpieza de terreno baldío.
- Riego de calles.
- Zanjeo / limpieza de cunetas.
- Corte o retiro de árbol (riesgo).
- Otros (se describe el servicio, mínimo 3 caracteres).

Datos del formulario: tipo de servicio, dirección donde se necesita (obligatoria), fecha preferida (no puede ser anterior a hoy), teléfono (al menos 8 números) y observaciones para coordinar.

Se genera un número de solicitud (ejemplo SER-2026-000017). Estados: Pendiente, Programada y siguientes. La solicitud queda asociada a la cuenta en el navegador y no se envía a la Municipalidad.

---

## Catálogo de trámites del portal
<!-- tramites-catalogo | catalogo | portal | demo -->

El catálogo de **Trámites** del portal tiene buscador y categorías: Documentación y certificados; Inmuebles y tasas; Vehículos e infracciones; Comercio y habilitaciones; Turnos y atención ciudadana; Solicitudes generales.

Trámites disponibles (información orientativa de demostración; no certifica costos, plazos ni disponibilidad reales):
- **Certificado de libre deuda de tasas**: certifica que una partida o cuenta no registra deuda. Presencial. 3 a 5 días hábiles. Requisitos: ser titular o apoderado y no registrar deuda vencida. Documentación: DNI y última boleta. Datos: partida o número de cuenta, destino del certificado.
- **Constancia de valuación fiscal**: valuación y superficie declarada de un inmueble. Online, inmediata. Dato: partida inmobiliaria.
- **Certificado de residencia**: certifica domicilio dentro del ejido municipal. Presencial, 2 a 3 días hábiles. Documentación: DNI y factura de servicio. Datos: domicilio y motivo.
- **Habilitación comercial**: habilitar un local o actividad. Mixta, 20 a 30 días hábiles. Requisitos: título de propiedad o contrato de locación y croquis del local. Documentación: DNI y constancia de CUIT o monotributo. Datos: nombre del comercio, rubro, domicilio, superficie.
- **Factibilidad de uso de suelo**: uso permitido para una dirección. Presencial, 10 a 15 días hábiles. Datos: dirección y actividad prevista.
- **Consulta de expediente**: estado de un expediente con su número. Online, inmediata.
- **Solicitud de poda de arbolado**: poda o relevamiento de un árbol. Online, 5 a 10 días hábiles para inspección.
- **Limpieza de terreno y microbasural**: relevamiento de terreno con residuos o maleza alta. Online, 7 días hábiles.
- **Permiso de publicidad y propaganda**: carteles en la vía pública. Mixta, 10 días hábiles.
- **Presentación de descargos de tránsito**: descargo ante una infracción. Presencial.
- **Solicitud de plan de pagos**: plan de regularización de deuda municipal. Online, respuesta en 5 días hábiles. Datos: partida o cuenta con deuda y cantidad de cuotas.

---

## Cómo iniciar un trámite y estados
<!-- tramites-como | guia | portal | demo -->

Para iniciar un trámite en el portal:
1. Entrá a **Trámites**, buscá el trámite o filtrá por categoría.
2. Abrí el detalle: descripción, modalidad (online, presencial o mixta), tiempo estimado, requisitos y documentación.
3. **Paso 1 de 2 — Completá los datos** del formulario.
4. **Paso 2 de 2 — Revisá y confirmá**.

Se genera un número de solicitud (ejemplo TRA-2026-000102) y el trámite aparece en **Mis trámites**.

Estados de un trámite: Recibido → En revisión → En emisión → Listo para retirar → Finalizado.

La solicitud es simulada y no se envía a ningún sistema municipal real.

---

## Cómo pedir y cancelar un turno
<!-- turnos | guia | portal | demo -->

Para reservar un turno en el portal (sección Trámites y turnos, o "Pedir un turno" en Inicio):
1. **Paso 1 de 3 — Tipo de trámite**.
2. **Paso 2 de 3 — Dependencia, día y horario**: los horarios no disponibles aparecen tachados.
3. **Paso 3 de 3 — Revisá tu turno** y confirmá.

Se genera un número (ejemplo TUR-2026-000031) con estado Confirmado. Desde "Mis turnos" se puede cancelar (pide confirmación).

Tipos de turno: Atención general; Consultas de tasas y pagos; Habilitación comercial; Obras particulares; Tránsito e infracciones; Castración de mascotas; Licencia de conducir; Consulta psicológica para licencia.

Datos extra según el tipo:
- Castración de mascotas: nombre de la mascota y especie (perro/perra o gato/gata). Solo en el Centro de Zoonosis y Bienestar Animal.
- Licencia de conducir: gestión (emisión inicial, renovación o cambio de clase). Solo en el Centro de Emisión de Licencias de Conducir.
- Consulta psicológica para licencia: número de trámite de licencia (opcional). Solo en el Centro de Emisión de Licencias.

Horarios de turnos: de 08:00 a 12:30, cada 30 minutos.

Dependencias (demo, todas en Calle 12 N° 901, Palacio Municipal): Mesa de Entradas; Oficina de Rentas; Dirección de Obras Particulares; Dirección de Tránsito; Centro de Zoonosis y Bienestar Animal; Centro de Emisión de Licencias de Conducir.

La disponibilidad es simulada y no representa la agenda real.

---

## Reporte de ingreso de agua por lluvias (alerta El Niño)
<!-- agua-reporte | guia | portal | demo -->

El portal permite reportar si las lluvias están afectando la vivienda (condición El Niño). Acceso: botón "¿Estás siendo afectado por las lluvias?" en Inicio.

Pasos: elegir el nivel de la situación, dirección del domicilio afectado, punto en el mapa (opcional), cantidad de personas en la vivienda, teléfono de contacto (al menos 8 números), si alguien necesita asistencia especial (adultos mayores, embarazadas, enfermedades o discapacidad), notas y foto opcional (hasta 3 MB).

Niveles:
- **Ingreso leve**: entra un poco de agua (humedad, charcos o escurrimiento controlable).
- **Ingreso crítico**: entra mucha agua o sube rápido; hay riesgo para personas o bienes. Prioridad alta: en una implementación real, Defensa Civil contactaría al teléfono indicado.

Estados del reporte: Recibido → Verificado (Defensa Civil verificó la situación) → En asistencia (brigada con bomba de achique) → Cerrado. Número de ejemplo: AGU-2026-000017.

Es una herramienta de demostración: ninguna área municipal recibe estos reportes. **Ante peligro inminente, llamar al 911 o a Defensa Civil.**

---

## Notificaciones y perfil
<!-- notificaciones-perfil | guia | portal | demo -->

**Notificaciones**: bandeja con avisos de vencimientos próximos, obligaciones vencidas, avances de reclamos, actualizaciones de trámites, recordatorios de turnos y comunicados municipales. Se pueden filtrar, marcar como leídas y abrir el detalle de cada operación. La campana de la cabecera muestra cuántas hay sin leer.

**Mi perfil**: datos personales editables (nombre, apellido, alias, correo, teléfono, domicilio, barrio), preferencias de notificaciones (vencimientos, reclamos, trámites, turnos, comunicados), vehículos e inmuebles asociados, historiales, cierre de sesión y **reinicio de la demo** (vuelve todo al estado inicial).

---

## Preguntas frecuentes del portal
<!-- faq-portal | faq | portal | demo -->

**¿Esta aplicación es oficial?** No. Es un prototipo de demostración para presentar cómo podría funcionar un futuro portal de autogestión de la Municipalidad de Las Toscas. No está conectado a sistemas reales.

**¿Los pagos que hago aquí son reales?** No. Todos los pagos son simulados, sin movimiento de dinero. Los comprobantes son ficticios y no tienen validez.

**¿Cómo pago una obligación?** Andá a Pagos, elegí la obligación, tocá Continuar al pago y seguí los pasos. Al final verás un comprobante de demostración que podés imprimir.

**¿Cómo hago un reclamo?** Entrá a Reclamos, tocá Nuevo reclamo, elegí la categoría, describí el problema, podés adjuntar una foto y enviar. Después seguís el estado desde la línea de tiempo.

**¿Cómo consulto una multa?** Desde Inicio, tocá Ver multas o entrá a Vehículos y multas. Cada infracción muestra acta, motivo, importe y opciones (pago simulado o descargo).

**¿Cómo pido un turno?** En Trámites y turnos: elegí tipo, dependencia, día y horario disponible y confirmá. La disponibilidad es simulada.

**¿Por qué desaparecen mis cambios?** Los datos se guardan en el navegador. Si borrás los datos del navegador o reiniciás la demo desde Perfil, todo vuelve al estado inicial.

**¿Qué hago ante una emergencia?** La aplicación no reemplaza los canales de emergencia. Comunicate con 911, bomberos (100) o defensa civil.

---

## Panel municipal (personal de la Municipalidad)
<!-- admin-panel | guia | portal | demo -->

El personal municipal (rol administrador) entra al **Panel municipal** en lugar del portal del vecino. Secciones:
- **Panel**: resumen de multas e impuestos (pendientes, pagadas, vencidas, en descargo), recaudación simulada e indicadores de atención ciudadana.
- **Multas e infracciones**: todas las multas del municipio con búsqueda y filtros por estado.
- **Reclamos**: gestión de reclamos de los vecinos con avance de estado.
- **Trámites**: gestión de trámites con avance de estado.
- **Ciudadanos**: padrón de vecinos con su deuda y la opción de bloquear o reactivar cuentas (simulado). Estados de un ciudadano: Activo o Bloqueado.
- **Mi perfil**.

Todos los datos del panel son ficticios.

---

## Cuenta demo del vecino (estado inicial)
<!-- demo-cuenta-vecino | datos-usuario | portal | demo -->

Referencia del estado inicial de la cuenta de prueba. En producción, estos datos deben llegar al asistente en tiempo real, no desde los embeddings.

Vecino: Maximiliano Rodríguez ("Maxi"), maxi.vecino@ejemplo.com, teléfono 3482 555-1234, Calle 12 N° 245, barrio Centro.

Inmuebles: Casa, Calle 12 N° 245 (Partida 123-45.890); Terreno, Calle 15 N° 78, barrio Itatí (Partida 123-52.104).
Vehículos: Toyota Corolla 2016, dominio AB 529 JR; moto Honda Wave 110 2019, dominio CQ 887 KS.

Obligaciones iniciales:
- TGI 2026 2ª cuota, Partida 123-45.890: $ 24.500, pendiente (vence en 5 días).
- TGI 2026 1ª cuota, Partida 123-52.104: $ 23.800 + $ 1.047 de intereses, vencida.
- Patente 2026 anual, AB 529 JR: $ 9.350, pendiente.
- Tasa de inspección sanitaria, 3er trimestre, Kiosco Calle 12 (cuenta 5521): $ 8.200, pendiente.
- Multa acta 2026-00187 (exceso de velocidad en zona escolar, AB 529 JR): $ 18.500, pendiente.
- Plan de regularización PLAN-2025-000918, cuota 4 de 12: $ 6.125, pendiente.
- Derecho de publicidad, cartel Calle 12 N° 1120: $ 12.400, en proceso.
- TGI 2025 4ª cuota: $ 21.300, pagada.

Otras multas: acta 2026-00221 (estacionamiento prohibido, moto): $ 6.900, pendiente; acta 2026-00152 (moto sin casco): $ 12.300, en descargo (DER-2026-00018, en revisión).

Reclamos: REC-2026-000214 luminaria apagada (derivado); REC-2026-000198 bache (en resolución); REC-2026-000173 contenedores (resuelto); REC-2026-000236 desagüe tapado (requiere información); REC-2026-000155 señal PARE (no corresponde).

Trámite: TRA-2026-000102 certificado de libre deuda, en revisión. Turno: TUR-2026-000031, Consultas de tasas y pagos, Oficina de Rentas, en 3 días a las 09:30. Servicios: SER-2026-000017 camión atmosférico (pendiente); SER-2026-000018 junte de ramas (programada).

---

## Datos institucionales de la Municipalidad
<!-- oficial-institucional | institucional | sitio | oficial -->

Municipalidad de Las Toscas, provincia de Santa Fe, Argentina.
- Dirección: Calle 12 N° 901 (Palacio Municipal), Las Toscas, Santa Fe.
- Teléfono: (03482) 492-000.
- Correo: intendencia@lastoscas.gob.ar.
- Horario de atención: lunes a viernes de 7:00 a 13:00 hs.
- Sitio institucional: https://grossomaximiliano.github.io/MUNI_LAND/
- Portal de Autogestión: https://grossomaximiliano.github.io/MUNI_POC

Las Toscas está en el departamento General Obligado, en el norte de Santa Fe, sobre la Ruta Nacional 11 y a orillas del sistema de humedales del río Paraná. Fue fundada el 23 de agosto de 1880 alrededor de un fortín de frontera.

Nota: dentro del portal de demostración, la sección Ayuda muestra datos de contacto de ejemplo; los datos de esta sección son los publicados en el sitio institucional.

---

## Intendente y gabinete municipal
<!-- oficial-gabinete | institucional | sitio | oficial -->

Intendente: **Iván Sánchez**, Intendente Municipal (período 2025–2029; asumió el 14 de diciembre de 2025). Correo: intendencia@lastoscas.gob.ar. Responsable de la administración general y la dirección política del municipio.

Gabinete:
- Secretaría General — Laura Fiant (gobierno@lastoscas.gob.ar): coordinación de las áreas de gobierno y asistencia a la Intendencia.
- Planificación Económica — Fernando Paredes (hacienda@lastoscas.gob.ar): recursos financieros, presupuesto y recaudación.
- Planificación y Desarrollo Territorial — Daniel Molina (territorial@lastoscas.gob.ar): planificación urbana, obras públicas e infraestructura.
- Desarrollo Productivo — Damián Cremona (produccion@lastoscas.gob.ar): industria local, comercio, emprendedurismo y empleo.
- Desarrollo Humano — Mayra Gómez (desarrollohumano@lastoscas.gob.ar): inclusión social, salud comunitaria y asistencia a la familia.
- Recreación y Deporte — Pablo Verón (deportes@lastoscas.gob.ar): actividades deportivas y espacios recreativos.
- Patrimonio y Comunicación — Mariela Cerdán (comunicacion@lastoscas.gob.ar): comunicación institucional, cultura, turismo y patrimonio.

Otros correos: Obras Públicas, obraspublicas@lastoscas.gob.ar.

---

## Teléfonos útiles y emergencias
<!-- oficial-telefonos | contacto | sitio | oficial -->

Emergencias:
- **911**: emergencias.
- **Bomberos Voluntarios**: 100 o (03482) 451250 — guardia de cuartel 24 hs.
- **Policía — Comisaría 5ta.**: 101, 911 o (03482) 492135 — atención permanente.
- **SIES 107** (emergencia sanitaria, guardia médica / central Villa Ocampo): 107, (03482) 451366 o (03482) 467502.
- **EPE** (energía eléctrica, reclamos): 03482 15 680873.

Servicios y atención municipal:
- **Servicios Públicos** (guardia y reclamos): 3482 650174.
- **Corralón Municipal** (mantenimiento urbano): (03482) 492173.
- **Desarrollo Humano** (asistencia social): 3482 303995.
- **CODESELT** (cooperativa, electricidad rural): (03482) 492200 o 03482 15 615518.
- **Municipalidad** (conmutador): (03482) 492-000.

---

## Guía oficial de trámites — Conductores, tasas y vehículos
<!-- oficial-tramites-1 | tramite | sitio | oficial -->

**Licencia de conducir (renovación y primera vez)**. Requisitos: DNI original y fotocopia con domicilio en Las Toscas; certificado de antecedentes de tránsito (CENAT); grupo sanguíneo y factor certificado; libre deuda de multas municipales. Primera vez: aprobar curso teórico, examen psicofísico y examen práctico. Lugar: Área de Tránsito Municipal. Horario: lunes a viernes de 7:00 a 12:00 hs. Costo: consultar tarifa vigente. Formulario: https://lastoscas.gob.ar/wp/wp-content/uploads/2026/10/Formulario-para-descargar.pdf

**Certificado de libre deuda**. Constancia de que el inmueble o comercio no registra deudas. Requisitos: nota de solicitud con datos del titular, número de partida o legajo comercial y tasas al día. Lugar: Área de Rentas, lunes a viernes de 7:00 a 12:30 hs. Costo: sellado municipal.

**Patente automotor (altas, bajas y transferencias)**. Para vehículos radicados en Las Toscas. Requisitos: título del automotor y DNI del titular, formulario de alta, baja o transferencia (DNRPA) y libre deuda de patente. Lugar: Área de Rentas, lunes a viernes de 7:00 a 12:30 hs. Costo: según valuación.

---

## Guía oficial de trámites — Comercio, obras y social
<!-- oficial-tramites-2 | tramite | sitio | oficial -->

**Habilitación comercial y ASSAL** (apertura o transferencia de comercios e industrias). Requisitos: constancia de inscripción en AFIP y API (Ingresos Brutos); DNI del titular o contrato social; contrato de locación sellado o título de propiedad; plano del local aprobado por Obras Privadas; libreta sanitaria al día (rubros alimenticios o gastronómicos); libre deuda de TGI. Lugar: Mesa de Entradas, Palacio Municipal, lunes a viernes de 7:00 a 12:30 hs. Costo: según rubro.

**Libreta sanitaria**. Obligatoria para quienes manipulan alimentos o atienden al público en rubros específicos. Requisitos: DNI, certificado médico de aptitud, curso de manipulación de alimentos (cuando corresponda) y foto carnet 4x4. Lugar: Área de Bromatología, lunes a viernes de 7:00 a 12:00 hs.

**Permiso de edificación y planos** (obra nueva, ampliación o relevamiento). Requisitos: planos firmados por profesional matriculado (3 copias), título de propiedad o boleto de compraventa, libre deuda de TGI y visado del colegio profesional. Lugar: Secretaría de Planificación y Desarrollo Territorial, lunes a viernes de 7:00 a 12:30 hs. Costo: según metros cuadrados.

**Asistencia y acompañamiento social**. Orientación y acceso a programas sociales, alimentarios y de acompañamiento familiar. Requisitos: DNI del solicitante y del grupo familiar y entrevista con el equipo técnico. Lugar: Secretaría de Desarrollo Humano, lunes a viernes de 7:00 a 12:30 hs. Sin costo.

**Escuelas deportivas y talleres**. Requisitos: DNI del participante, apto físico (menores: firmado por madre, padre o tutor) y ficha de inscripción. Lugar: Secretaría de Recreación y Deporte, Polideportivo. Horario según actividad. Gratuito.

**Reclamos por alumbrado, residuos y calles**. Requisitos: dirección exacta o referencia, descripción (y foto si es posible) y datos de contacto. Lugar: Servicios Públicos, 3482 650174, o formulario web. Guardia permanente. Sin costo.

---

## Capacitaciones gratuitas y Empleo Local
<!-- oficial-trabajo | programa | sitio | oficial -->

La Municipalidad impulsa dos plataformas complementarias:

**Plataforma de Capacitaciones** (https://grossomaximiliano.github.io/MUNI_CURSOS/): formación 100% gratuita para aprender un oficio o mejorar el perfil laboral. Clases grabadas disponibles 24/7 desde el celular o la PC, encuentros en vivo con instructores locales, seguimiento del avance y certificado oficial al completar cada capacitación. Temas: electricidad, costura, ofimática, programación, panadería, huerta, apicultura, gastronomía, salud, agro, cultura y más.

**Empleo Local** (https://grossomaximiliano.github.io/MUNI_EMPLE/): punto de encuentro entre quienes buscan trabajo, quienes ofrecen un oficio y quienes necesitan contratar en Las Toscas. Perfiles de trabajadores independientes con oficio y especialidades, buscador de profesionales por rubro y disponibilidad, y ofertas de empleo publicadas por comercios y empresas.

Cómo funciona: elegí una capacitación → obtené tu certificado → publicá tu perfil en Empleo Local → vecinos, comercios y empresas te contactan o te postulás a ofertas.

---

## Turismo en Las Toscas
<!-- oficial-turismo | turismo | sitio | oficial -->

Las Toscas ofrece naturaleza, historia y humedal en el norte santafesino, dentro del sitio Ramsar Jaaukanigás.

- **Ecoturismo**: safaris fotográficos, avistaje de aves y navegación por los brazos del río Paraná.
- **Isla del Medio**: declarada Área Natural Protegida de Interés Ecológico y Turístico por la Ordenanza Nº 026/2026; meandros, lagunas y monte nativo.
- **El Mangrullo**: torre de vigilancia del antiguo fortín que dio origen a la ciudad. Monumento Histórico Provincial desde 1984; aparece en el escudo. Está sobre calle 13, entre 12 y 14, en el paseo histórico "El Mirador", junto a los bustos de los fundadores Gaspar Kauffman y Antonio Tomassone.
- **Esparcimiento**: Club Pato Cuá, pesca deportiva, camping y polideportivo.
- **Paseos**: Plaza 23 de Agosto y Parroquia Nuestra Señora de la Asunción.

Servicios al turista: hospedaje (Apart Premium Las Toscas, Apart Hotel Sammer); gastronomía (Augusto Resto-Bar, La Tranquera Parrilla, Tapitas, La Farmacia en calle 4 y 19); pesca y paseos (Jaaukatourlt, cabañas Don Arturo, cabañas Don Quito).

Oficina de Turismo Municipal: lunes a viernes de 8:00 a 13:00 hs.

Cómo llegar: en auto por Ruta Nacional 11, desde el sur (Reconquista / Santa Fe) o desde el norte (Resistencia); en colectivo, con servicios de media y larga distancia por la Ruta Nacional 11.

---

## Prevención ante la creciente y lluvias (El Niño)
<!-- oficial-creciente | aviso | sitio | oficial -->

Ante el avance del agua por el fenómeno de El Niño (octubre de 2026), la Municipalidad pide extremar las precauciones:
- Está prohibido ingresar o bañarse en el arroyo y otros cursos de agua mientras dure la creciente.
- No recorrer a pie ni en vehículo las zonas inundadas, aunque parezcan seguras.
- Niñas, niños y adolescentes no deben acercarse al río ni al arroyo.
- Evitar transitar por los sectores afectados si no se está colaborando con las tareas de asistencia.

Si entra agua en la vivienda, se puede usar el reporte de ingreso de agua del portal (demostración). Ante riesgo para personas, llamar al 911 o a Bomberos (100).

---

## Novedades recientes de la gestión
<!-- oficial-noticias | noticias | sitio | oficial -->

- **23/10/2026 — Nuevos vehículos 0 km**: la Municipalidad incorporó un camión volcador, un tanque atmosférico de arrastre, una camioneta, un automóvil y tres motos, con una inversión de más de $600 millones; proyecta llegar a $1.000 millones en reequipamiento este año. Se firmó el convenio del Programa Potenciar para una retroexcavadora 0 km.
- **23/10/2026 — Escuelas**: más de $120 millones invertidos en 2026 en escuelas de la ciudad (Fondo de Financiamiento Educativo, FANI y Fondo Provincial de Educación Técnica). La Escuela Técnica Nº 363 "Norma Aquino" sumó la sala "363 Streaming"; la Escuela Nº 6049 recibió más de $8,6 millones para su instalación eléctrica.
- **22/10/2026 — Taller de Autonomía Digital**: adultos mayores completaron el taller del Punto Violeta (Desarrollo Humano) para usar el celular de forma práctica y segura.
- **21/10/2026 — Cementerio**: 50 reflectores LED, 12 postes, más de 500 metros de tendido eléctrico y sereno nocturno para prevenir vandalismo.
- **09/10/2026 — Isla del Medio**: declarada Área Natural Protegida por la Ordenanza Nº 026/2026.
- **14/12/2025 — Asunción**: Iván Sánchez asumió como intendente (2025–2029) en la Plaza 23 de Agosto.

---

## Gobierno abierto: ordenanzas, decretos y balances
<!-- oficial-digesto | normativa | sitio | oficial -->

Normativa y documentos publicados en el sitio institucional (sección Transparencia):
- Ordenanza N° 1450/2026 (01/10/2026): https://lastoscas.gob.ar/wp/wp-content/uploads/2026/10/ORDENANZA-1450.pdf
- Ordenanza N° 026/2026 (09/10/2026): declara a la Isla del Medio Área Natural Protegida de Interés Ecológico y Turístico.
- Decreto N° 1255/2026 (03/10/2026): https://lastoscas.gob.ar/wp/wp-content/uploads/2026/10/Decreto-1255.pdf
- Balance 1er Trimestre 2026: https://lastoscas.gob.ar/wp/wp-content/uploads/2026/04/BALANCE-1ER-TRIMESTRE.pdf
- Balance 2do Trimestre 2026: https://lastoscas.gob.ar/wp/wp-content/uploads/2026/04/BALANCE-2DO-TRIMESTRE.pdf

El sitio también muestra registros de ejemplo (no reales) como la Ordenanza 1449/2026 de arbolado público, la 1448/2026 de separación de residuos y el Decreto 1254/2026 de presupuesto participativo: no citarlos como normativa vigente.
