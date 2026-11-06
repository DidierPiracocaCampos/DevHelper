# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Un desarrollador individual, en uso estrictamente privado. Una cuenta = una persona. Durante meses y años de trabajo se topa de nuevo con errores, decisiones de arquitectura, credenciales, archivos y compromisos que ya resolvió o guardó, y los vuelve a buscar o a reconstruir.

## Product Purpose

DevHelper es un workspace personal para registrar, organizar y recuperar el conocimiento técnico de trabajo sin saltar entre notas, gestor de contraseñas, calendario y almacenamiento. Tiene éxito cuando el desarrollador vuelve a encontrar lo que ya sabía en lugar de reconstruirlo (activación: primer proyecto y tarea; recuperación: reabrir tareas antiguas).

## Positioning

Para el dueño del producto, DevHelper es ante todo una app para registrar tus avances. Toda página debe dejarlo claro en la primera frase.

La memoria técnica personal: cada problema queda guardado con su solución, junto a sus archivos y credenciales, en la estructura proyecto → tarea. La propuesta no es ser mejor que Notion, 1Password, Calendar o Drive en algo concreto, sino eliminar la fragmentación entre ellos para un solo desarrollador.

## Operating Context

Navegador de escritorio y móvil, mientras se trabaja en otra cosa. Se vuelve cuando reaparece un problema. Sin colaboración, equipos ni roles. Sin integraciones externas ni importadores.

## Capabilities and Constraints

Confirmado en código y por el dueño del producto:

- Auth con email/password o Google (Firebase Auth). GitHub OAuth existe en código pero está fuera de alcance.
- Proyectos → tareas (normales con estado y vencimiento, o notas libres). La tarea tiene título, descripción y campo de solución.
- Contraseñas globales o por tarea; archivos globales o por tarea (máx. 5 MB).
- Eventos y calendario funcionan (`estado-actual.md` está desactualizado en esto).
- Buscador (paleta de búsqueda) sobre tareas.
- Asistente IA local opt-in, 100% en el dispositivo; consultas estructuradas (pendientes, vencidas, hoy, semana, por proyecto, por tag, búsqueda). No conversa ni genera texto libre.
- Vault con PIN o Passkey (WebAuthn); clave maestra generada en local; AES-GCM 256.
- **Alcance real del cifrado:** contraseñas y el contenido de archivos marcados como cifrados se cifran en cliente. Proyectos, tareas, notas y eventos se guardan en Firestore sin cifrar en cliente, protegidos por reglas owner-only. No afirmar que todo el workspace está cifrado ni que DevHelper no puede leer nada: el dueño no lo confirmó y el código lo contradice.
- Firebase (Firestore y Auth, región eur3) es un servicio propietario: no afirmar "todo open source", "sin SDKs propietarios" ni "sin vendor lock-in".
- Freemium previsto (1 proyecto activo gratis, membresía mensual), sin precios ni membresía implementados: no publicar precios.

## Brand Commitments

- Nombre DevHelper. Interfaz en español.
- `docs/design-context.md` es vinculante: tema único oscuro `devhelper`, Roboto como única familia, Material Symbols Outlined, sin emojis, sin gradientes decorativos, sin animaciones de celebración.

## Evidence on Hand

- Repositorio público: https://github.com/DidierPiracocaCampos/DevHelper (código auditable y enlazable).
- La app real en funcionamiento y una cuenta de pruebas para capturas con datos de demostración.
- Imágenes en `public/img/landing/` (composiciones de marketing, algunas con texto en inglés).
- No hay testimonios, clientes, métricas de uso, benchmarks, auditorías de seguridad ni precios: no inventarlos.

## Product Principles

1. Recuperar antes que almacenar: lo que importa es volver a encontrarlo.
2. Decir exactamente lo que se cifra. En un producto de privacidad, la precisión es la credibilidad.
3. Un solo desarrollador, un solo lugar: sin funciones de equipo ni promesas de roadmap.
4. La IA es opcional y local; si no se activa, no existe.
