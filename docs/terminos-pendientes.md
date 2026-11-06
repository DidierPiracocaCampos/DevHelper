# Términos: pendientes antes de la versión definitiva

Notas de trabajo que antes aparecían en el texto público de `public/legal/terms-es.md`.

## Datos que debe aportar el responsable

- Nombre o razón social, domicilio y número de identificación fiscal (§1).
- Correo de contacto oficial (§12). Es también el canal para ejercer derechos y pedir la baja (§8.3).
- Ley aplicable, tribunales competentes y, si procede, arbitraje (§11).

## Revisión legal

- Normativa aplicable: LSSI, RGPD y normativa local del responsable.
- Procedimiento y plazo para atender derechos de acceso, rectificación, supresión, oposición y portabilidad. Delegado de Protección de Datos, si aplica.
- Política de suspensión y eliminación de cuentas inactivas, y actuación ante credenciales comprometidas.
- Idoneidad de Firestore `eur3` según la jurisdicción del responsable y del usuario.
- Alcance máximo de la limitación de responsabilidad.
- Plazo de gracia entre publicar una versión y exigirla, y qué ocurre si el usuario no la acepta.
- Atribución o aviso que requiera el modelo de IA.
- Condiciones del plan de pago, cuando exista: precio, cancelación, reembolso y límites.

## Producto

- **Eliminación de cuenta:** no existe en la app. La versión anterior del texto decía que sí.
- **Exportación:** el botón de la tarea solo muestra "próximamente". Definir el alcance antes de anunciarla.
- **Código de recuperación:** no existe. Valorar si ofrecerlo.
- **Passkeys:** riesgo asociado a `allowCredentials: []` en la solicitud de passkey. Documentarlo o limitarlo a credenciales registradas.
- **IA local:** comprobar el tamaño real de la descarga y si se borra de la caché al desactivarla. La versión anterior afirmaba ~470 MB y borrado, y no se pudo confirmar en el código.
