# Términos y Condiciones de DevHelper

> Versión: `2026-07-18` · Idioma: español (`es`)
>
> Este documento es un **placeholder pendiente de revisión legal profesional**. Las zonas marcadas con `[TBD - pendiente revisión legal]` requieren validación de un abogado antes de su publicación definitiva. Se incluye como mínimo vinculante para que el flujo de aceptación (`acceptTerms` en el registro y snapshot versionado) tenga un texto al que apuntar.

---

## 1. Identidad del responsable

DevHelper es un proyecto personal mantenido por un único responsable. Los datos de identificación completos (nombre legal, domicilio, NIF/RFC, correo de contacto oficial) **se añadirán en la versión definitiva de este documento**.

`[TBD - pendiente revisión legal]` Datos identificativos obligatorios por la normativa aplicable (LSSI, RGPD, normativa local del responsable). Incluir al menos:

- Nombre o razón social del responsable del tratamiento.
- Domicilio físico.
- Dirección de correo electrónico de contacto.
- En su caso, número de identificación fiscal.

---

## 2. Qué es DevHelper y qué hace

DevHelper es una **aplicación web personal (SPA)** pensada para funcionar como *workspace* cifrado de un único usuario desarrollador. Reúne en un solo lugar:

- **Proyectos y tareas** (incluye notas) con descripción y estado.
- **Gestor de contraseñas** cifrado en cliente.
- **Archivos adjuntos** cifrados en cliente (imágenes, capturas, PDFs pequeños) asociados a proyectos o a entradas concretas.
- **Eventos y recordatorios** locales.
- **Asistente de IA local** (opt-in) que permite consultar el contenido cifrado sin enviar datos a servidores externos.

El producto está dirigido a un **uso individual**. No es una plataforma multiusuario, no ofrece espacios compartidos ni funcionalidades de colaboración en tiempo real.

`[TBD - pendiente revisión legal]` Confirmar que la descripción del servicio (proyectos, contraseñas, archivos, eventos, IA local) se ajusta al producto final y no induce a error al usuario.

---

## 3. Cuenta y autenticación

Para usar DevHelper necesitas crear una cuenta. El registro se realiza con:

- **Correo electrónico y contraseña** (mínimo 6 caracteres, recomendado más largo).
- Opcionalmente, **Google** como proveedor de identidad (OAuth).

Cada cuenta es **personal e intransferible**. No se permiten cuentas compartidas, corporativas ni multiusuario.

La sesión caduca por inactividad tras **30 minutos**. Al volver, se solicitará de nuevo el desbloqueo del vault (ver §4).

`[TBD - pendiente revisión legal]` Política de suspensión y eliminación de cuentas inactivas. Procedimiento ante sospecha de compromiso de credenciales. Política de recuperación de contraseña más allá del correo de Firebase Auth.

---

## 4. Vault cifrado

Toda la información sensible del usuario (contraseñas, contenido de archivos, datos de proyectos) **se cifra en el navegador antes de salir del dispositivo** usando el estándar **AES-GCM** con una clave maestra (*master key*) derivada por el usuario.

La clave maestra está protegida por uno o dos métodos de desbloqueo, a elección del usuario:

- **PIN** de al menos 6 dígitos, derivado mediante **PBKDF2**.
- **Passkey** (WebAuthn) basada en el dispositivo o en un gestor de claves (1Password, Bitwarden, iCloud Keychain, etc.).

### 4.1 Advertencia de irrecuperabilidad

> **Si pierdes tanto el PIN como las passkeys registradas, los datos cifrados son irrecuperables.** No existe un canal de soporte que pueda restablecerlos: la clave maestra nunca abandona tu dispositivo en claro y nosotros no la conservamos.

`[TBD - pendiente revisión legal]` Valorar si procede implementar (o no) un **código de recuperación** derivado de BIP-39 y, en su caso, cuál es el texto legal que debe acompañar la opción. Esta versión del documento asume que no se ofrece código de recuperación.

`[TBD - pendiente revisión legal]` Riesgo asociado a `allowCredentials: []` en la solicitud de passkey (cualquier credencial del RP puede descifrar). Documentar o, preferentemente, limitar a credenciales registradas antes de aceptar la versión definitiva.

---

## 5. Modelo de IA local

DevHelper puede integrar de forma **opt-in** un asistente de inteligencia artificial que responde preguntas sobre los datos cifrados del usuario.

- La descarga e inferencia se realizan **íntegramente en el navegador**.
- El modelo (~470 MB) **no se envía a ningún servidor**; queda en la *Cache Storage* del navegador.
- Puedes **desactivar el asistente en cualquier momento** desde la sección de preferencias. La descarga se descarta del caché cuando se desactiva o cuando se cierra la cuenta.
- Mientras el asistente está desactivado, **ningún componente de IA se carga en la página**.

`[TBD - pendiente revisión legal]` Aclarar si el modelo, al ser open-weight, requiere atribución o aviso específico de proveedor. Confirmar que la información que se menciona (cifrado, no envío, opt-in) refleja exactamente el comportamiento implementado.

---

## 6. Almacenamiento

Los datos se almacenan en los servicios de **Google Firebase** contratados por el responsable:

- **Firebase Authentication** (gestión de identidad).
- **Cloud Firestore** (base de datos documental) en la región **`eur3` (Europa)**.

Los datos sensibles **viajan y se almacenan cifrados en cliente** (ver §4). Firebase únicamente ve *blobs* cifrados y metadatos mínimos (rutas, tamaños, marcas de tiempo).

No utilizamos otros servicios de Google (Analytics, Crashlytics, etc.) que envíen datos del usuario fuera de la región `eur3`.

`[TBD - pendiente revisión legal]` Verificar la idoneidad de Firestore `eur3` y la configuración de residency de datos según la jurisdicción del responsable y del usuario final.

---

## 7. Plan gratuito y membresía

Actualmente DevHelper se ofrece en **plan gratuito** sin coste. El plan gratuito puede incluir límites (por ejemplo, número máximo de proyectos o de archivos). **No existe, en esta versión, un plan de pago.**

`[TBD - pendiente revisión legal]` Cuando se habilite un plan de pago, este apartado deberá detallar:

- Precio, periodicidad y método de cobro.
- Política de cancelación y reembolso.
- Diferencias funcionales entre el plan gratuito y el de pago.
- Límites cuantitativos aplicables a cada plan.

---

## 8. Privacidad

### 8.1 Datos que sí se recogen

- **Correo electrónico** y hash de credenciales gestionados por Firebase Auth.
- **Metadatos** de los documentos cifrados: ruta, tamaño, fecha de creación y modificación.
- **Snapshot de aceptación de estos Términos** (`users/{uid}/legal/termsAccepted`): versión aceptada, idioma, fecha y origen del consentimiento (registro, modal de re-aceptación, manual).

### 8.2 Datos que **no** se recogen

- **Contraseñas almacenadas** ni sus valores en claro (cifradas en cliente).
- **Contenido de los archivos** en claro.
- **Consultas al asistente de IA** (procesadas localmente).
- Direcciones IP de forma persistente (Firebase puede registrarlas en sus logs de plataforma, fuera de nuestro control directo).

### 8.3 Derechos del usuario

El usuario puede en cualquier momento:

- **Acceder** a sus datos desde la propia aplicación.
- **Exportar** los datos descifrados (funcionalidad en desarrollo).
- **Eliminar la cuenta**: borra los documentos de Firestore y el vault asociado.

`[TBD - pendiente revisión legal]` Procedimiento para atender derechos ARCO / RGPD (acceso, rectificación, supresión, oposición, portabilidad). Canal y plazo de respuesta. Designación de Delegado de Protección de Datos si aplica.

`[TBD - pendiente revisión legal]` Aclarar el alcance de "exportar" (¿incluye contraseñas descifradas? ¿solo metadatos? ¿qué formato?) antes de publicitar la funcionalidad.

---

## 9. Limitación de responsabilidad

DevHelper se ofrece **"tal cual"** (*as is*), sin garantías expresas o implícitas de idoneidad para un fin particular, disponibilidad ininterrumpida o ausencia total de errores.

En particular, el responsable **no se hace responsable de**:

- Pérdida de acceso al vault por extravío del PIN y de las passkeys (ver §4.1).
- Daños derivados del uso del asistente de IA local, incluidas respuestas incorrectas o incompletas.
- Interrupciones del servicio provocadas por Firebase u otros proveedores de infraestructura.
- Contenido que el usuario decida almacenar o cifrar, ni del uso que haga del producto.

`[TBD - pendiente revisión legal]` Limitar la responsabilidad al máximo permitido por la ley aplicable. Revisar si la jurisdicción local exige cláusulas específicas sobre productos digitales o servicios en la nube.

---

## 10. Cambios a los términos

Podemos modificar estos Términos para reflejar cambios legales, técnicos o de producto. Cuando lo hagamos:

1. Se publicará una **nueva versión** de este documento con su correspondiente `versión` (formato `AAAA-MM-DD`).
2. Se mostrará un **modal no bloqueante** la próxima vez que inicies sesión, invitándote a revisar y aceptar la nueva versión.
3. La versión aceptada quedará registrada en `users/{uid}/legal/termsAccepted`.

Las versiones anteriores se conservarán como referencia. El cambio no afecta a datos ya cifrados con tu clave maestra.

`[TBD - pendiente revisión legal]` Plazo de gracia entre publicación y obligatoriedad de la nueva versión. Procedimiento si el usuario no acepta la actualización tras un periodo razonable.

---

## 11. Ley aplicable y jurisdicción

`[TBD - pendiente revisión legal]` Este apartado es **enteramente pendiente de revisión legal**. Debe completarse con:

- Ley aplicable (por ejemplo, legislación española, mexicana, argentina, etc., según el responsable).
- Tribunales competentes para resolver disputas.
- Si procede, mención a arbitraje o mecanismos alternativos de resolución.

Por defecto y en ausencia de indicación expresa, las partes se someten a los tribunales del domicilio del responsable del tratamiento.

---

## 12. Contacto

Para cualquier comunicación relacionada con estos Términos, la privacidad o el funcionamiento de DevHelper:

`[TBD - pendiente revisión legal]` Dirección de correo electrónico de contacto oficial. Considerar crear una dirección específica (por ejemplo, `legal@devhelper.app`) en lugar de reutilizar el correo personal del responsable.

---

## Metadatos del documento

- **Versión:** `2026-07-18`
- **Idioma:** `es`
- **Estado:** borrador pendiente de revisión legal
- **Próxima revisión programada:** `[TBD - pendiente revisión legal]`
