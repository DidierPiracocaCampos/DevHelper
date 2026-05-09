# DevHelper

Una plataforma para desarrolladores que centraliza documentos relacionados con issues de programación. Organiza errores, soluciones y notas técnicas de forma eficiente.

## Tech Stack

- **Framework**: Angular 20.3.18 con standalone components
- **Estilado**: Tailwind CSS v4.1 + DaisyUI v5.5 (tema custom "devhelper")
- **Backend**: Firebase 11.10 + AngularFire 20.0
- **Iconos**: Material Symbols Outlined
- **Testing**: Vitest + Karma

## Prerequisites

- Node.js 20+
- npm 10+
- Angular CLI 20.3.24

## Installation

```bash
npm install
```

## Development

```bash
npm start        # Dev server en http://localhost:4200
npm run build   # Build production
npm test        # Unit tests
```

## Architecture

```
src/
├── app/
│   ├── auth/              # Autenticación (login, registro)
│   ├── home/              # Dashboard principal
│   ├── core/              # Guards y utilities
│   └── shared/            # Componentes, servicios y formularios reutilizables
│       ├── components/    # UI components (ui-button, ui-alert, card-*, list-*)
│       ├── forms/         # Input components y validators
│       ├── security/      # Vault encryption services
│       ├── service/       # Authenticator, repository-base
│       └── api/           # API interfaces y mixins
├── environments/           # Configuración Firebase
└── styles/                # Tokens CSS y utilities (Tailwind/DaisyUI)
```

## Features

- Autenticación con email/password y Google via Firebase Auth
- Vault encriptado con AES-GCM (PIN o Passkey)
- NASA Picture of the Day integration
- Sistema de diseño con DaisyUI custom theme
- Standalone components con signals y OnPush change detection

## Design System

Tema custom "devhelper" (dark):

- Base-100: #171717 (fondo)
- Base-200: #20201E
- Base-300: #363633
- Success: oklch(55% 0.22 145)
- Error: oklch(70% 0.25 25)

Ver `src/styles/tokens.css` y `src/styles/utilities.css` para tokens y clases utilitarias.
