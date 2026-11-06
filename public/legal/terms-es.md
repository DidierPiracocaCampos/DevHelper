# Términos y Condiciones de DevHelper

> Versión 2026-11-06, en español. Este documento es un **borrador pendiente de revisión legal**: los apartados marcados como pendientes se completarán en la versión definitiva.

## 1. Identidad del responsable

DevHelper es un proyecto personal mantenido por un único responsable. Los datos de identificación completos (nombre legal, domicilio, número de identificación fiscal y correo de contacto oficial) **se añadirán en la versión definitiva de este documento**.

## 2. Qué es DevHelper y qué hace

DevHelper es una **aplicación web personal** para que un desarrollador registre sus avances. Reúne en un solo lugar:

- **Proyectos y tareas** (incluye notas) con descripción, solución y estado.
- **Gestor de contraseñas**, con el valor de cada contraseña cifrado en el navegador.
- **Archivos adjuntos** de hasta 5 MB, con su contenido cifrado en el navegador, asociados a una tarea o generales.
- **Eventos y recordatorios** en un calendario.
- **Asistente de IA local** opcional, que responde consultas sobre tus tareas sin enviarlas a servidores externos.

El producto está dirigido a un **uso individual**. No es una plataforma multiusuario, no ofrece espacios compartidos ni funcionalidades de colaboración.

## 3. Cuenta y autenticación

Para usar DevHelper necesitas crear una cuenta. El registro se realiza con:

- **Correo electrónico y contraseña**.
- Opcionalmente, **Google** como proveedor de identidad.

Cada cuenta es **personal e intransferible**. No se permiten cuentas compartidas, corporativas ni multiusuario.

La sesión caduca por inactividad tras **30 minutos**. Al volver, se solicitará de nuevo el desbloqueo del vault (ver §4).

## 4. Vault y alcance del cifrado

### 4.1 Qué se cifra y qué no

**Se cifra en tu navegador antes de salir del dispositivo**, con AES-GCM 256 y una clave maestra generada en tu navegador:

- El valor de tus contraseñas.
- El contenido de tus archivos.

**No se cifra en el navegador.** Se guarda en Firebase, protegido por reglas de acceso que lo limitan a tu cuenta:

- Proyectos, tareas y notas, incluidas sus descripciones y soluciones.
- Eventos.
- Nombres de contraseñas y archivos, y otros metadatos.

### 4.2 Desbloqueo

La clave maestra se guarda protegida por uno o dos métodos de desbloqueo, a tu elección:

- **PIN** de 5 dígitos, derivado mediante PBKDF2.
- **Passkey** (WebAuthn) basada en el dispositivo o en un gestor de claves.

### 4.3 Advertencia de irrecuperabilidad

> **Si pierdes tanto el PIN como las passkeys registradas, los datos cifrados son irrecuperables.** No existe un canal de soporte que pueda restablecerlos ni un código de recuperación.

## 5. Asistente de IA local

DevHelper incluye un asistente de inteligencia artificial **opcional** que responde consultas sobre tus tareas.

- La descarga y el procesamiento se realizan **en tu navegador**.
- Tus consultas **no se envían a ningún servidor**.
- Puedes **desactivar el asistente** desde las preferencias.
- Mientras el asistente está desactivado, **ningún componente de IA se carga en la página**.

## 6. Almacenamiento

Los datos se almacenan en los servicios de **Google Firebase** contratados por el responsable:

- **Firebase Authentication** (gestión de identidad).
- **Cloud Firestore** (base de datos) en la región **eur3 (Europa)**.

El valor de las contraseñas y el contenido de los archivos se almacenan cifrados. El resto de los datos descritos en §4.1 se almacena sin cifrado de cliente.

## 7. Plan gratuito y membresía

Actualmente DevHelper se ofrece en **plan gratuito** sin coste. El plan gratuito puede incluir límites (por ejemplo, número máximo de proyectos o de archivos). **No existe, en esta versión, un plan de pago.**

## 8. Privacidad

### 8.1 Datos que se recogen

- **Correo electrónico** y credenciales, gestionados por Firebase Authentication.
- **El contenido que registras**: proyectos, tareas, notas, eventos y nombres de contraseñas y archivos.
- **Metadatos**: tamaño, tipo, fecha de creación y de modificación.
- **Registro de aceptación de estos Términos**: versión aceptada, idioma, fecha y origen del consentimiento.

### 8.2 Datos que no se recogen en claro

- **El valor de tus contraseñas**.
- **El contenido de tus archivos**.
- **Las consultas al asistente de IA**, que se procesan en tu navegador.

Firebase puede registrar direcciones IP en sus registros de plataforma, fuera de nuestro control directo.

### 8.3 Derechos del usuario

- **Acceso**: puedes consultar tus datos desde la propia aplicación.
- **Exportación**: la exportación de datos está en desarrollo y todavía no está disponible.
- **Eliminación**: la eliminación de la cuenta desde la aplicación todavía no está disponible. El canal para solicitarla y para ejercer el resto de tus derechos está **pendiente de definir** (ver §12).

## 9. Limitación de responsabilidad

DevHelper se ofrece **"tal cual"**, sin garantías expresas o implícitas de idoneidad para un fin particular, disponibilidad ininterrumpida o ausencia total de errores.

En particular, el responsable **no se hace responsable de**:

- Pérdida de acceso al vault por extravío del PIN y de las passkeys (ver §4.3).
- Daños derivados del uso del asistente de IA local, incluidas respuestas incorrectas o incompletas.
- Interrupciones del servicio provocadas por Firebase u otros proveedores de infraestructura.
- Contenido que el usuario decida almacenar, ni del uso que haga del producto.

## 10. Cambios a los términos

Podemos modificar estos Términos para reflejar cambios legales, técnicos o de producto. Cuando lo hagamos:

1. Se publicará una **nueva versión** de este documento, identificada por su fecha.
2. Se mostrará un **aviso no bloqueante** la próxima vez que inicies sesión, invitándote a revisar y aceptar la nueva versión.
3. La versión aceptada quedará registrada en tu cuenta.

El cambio no afecta a los datos ya cifrados con tu clave maestra.

## 11. Ley aplicable y jurisdicción

La ley aplicable y los tribunales competentes están **pendientes de definir** en la versión definitiva.

Por defecto y en ausencia de indicación expresa, las partes se someten a los tribunales del domicilio del responsable del tratamiento.

## 12. Contacto

La dirección de contacto para comunicaciones sobre estos Términos y la privacidad está **pendiente de definir** en la versión definitiva.
