# M6 · Widget NASA

Imagen astronomica del dia desde la API APOD de NASA. Si el usuario ha configurado una imagen personalizada en el modal de configuracion, se usa esa en su lugar.

## Dependencias

- M7-T4 (PreferencesService y modal de configuracion).

## Tareas

- [ ] M6.1 Peticion a `https://api.nasa.gov/planetary/apod` con API key desde `environment`.
- [ ] M6.2 Render de imagen o video segun `media_type`.
- [ ] M6.3 Titulo, fecha y descripcion visibles.
- [ ] M6.4 Cache local con TTL configurable (1 dia por defecto).
- [ ] M6.5 Fallback elegante ante error de red o API key invalida.
- [ ] M6.6 API key gestionada via variable de entorno.
- [ ] M6.7 Soporte de imagen personalizada: leer `PreferencesService.customNasaImageUrl()` y usarla si esta definida. Si esta, titulo "Imagen personalizada" y descripcion oculta.
- [ ] M6.8 Estados de carga y error visibles (skeleton / mensaje).
- [ ] M6.9 Tests del widget con APOD mockeado y con imagen personalizada.
