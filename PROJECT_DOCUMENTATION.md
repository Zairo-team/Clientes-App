# Documentación del Proyecto

Resumen y guía para desarrollar y mantener la aplicación.

## Descripción

Aplicación web construida con Next.js (App Router) y TypeScript que utiliza Supabase como backend (autenticación y base de datos). Contiene módulos para gestión de pacientes, citas, servicios y reportes.

## Tecnologías principales

- Next.js 16 (App Router)
- React 19
- TypeScript
- Supabase (`@supabase/supabase-js`, `@supabase/ssr`)
- Tailwind CSS (con `postcss` y plugins)
- Radix UI (componentes de accesibilidad)
- React Hook Form / Zod (formularios y validaciones)
- Recharts (gráficas)
- Sonner (toasts)
- pnpm (lockfile presente)

Dependencias se pueden ver en `package.json`.

## Estructura relevante del repositorio

- `app/` - rutas y páginas (Next.js App Router)
- `components/` - componentes por dominio (dashboard, patients, services, ui)
- `lib/` - utilidades y cliente de Supabase (`lib/supabase/client.ts`, `lib/auth-context.tsx`)
- `hooks/` - hooks reutilizables
- `public/` - activos estáticos
- `supabase/` - `schema.sql` y migraciones
- `styles/` - estilos globales

## Scripts (desde `package.json`)

- `dev` - Ejecuta la app en modo desarrollo (`next dev`)
- `build` - Construye la app para producción (`next build`)
- `start` - Inicia la app construida (`next start`)
- `lint` - Ejecuta ESLint (`eslint .`)

Ejecutar con pnpm (recomendado por `pnpm-lock.yaml`):

```bash
pnpm install
pnpm dev
```

También funciona con `npm` o `yarn` si prefieres.

## Variables de entorno (archivo `.env.local`)

Crear `.env.local` en la raíz con al menos las variables necesarias para Supabase y Next.js. Ejemplos:

- `NEXT_PUBLIC_SUPABASE_URL` - URL pública de Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Anon key para cliente en el navegador
- `SUPABASE_SERVICE_ROLE_KEY` - (opcional) clave de servicio para tareas del servidor
- `NEXTAUTH_*` u otras variables si se añaden integraciones

No comitear claves secretas.

## Base de datos y Supabase

- El esquema y migraciones están en `supabase/schema.sql` y `supabase/migrations/`.
- La app usa la tabla `profiles` para datos de usuario (ver `lib/auth-context.tsx`).
- Si Row Level Security (RLS) está activado en Supabase, asegúrate de tener políticas que permitan leer/escribir según la lógica de sesión.
- Para pruebas locales de la base de datos, usa el CLI de Supabase o el panel web.

## Flujo de autenticación

- La app consume `supabase.auth` (cliente en `lib/supabase/client.ts`).
- `AuthProvider` (en `lib/auth-context.tsx`) gestiona sesión, usuario y carga del `profile`.

## Desarrollo local

1. Clona el repositorio.
2. Copia `.env.example` a `.env.local` (si existe) y completa las variables.
3. Instala dependencias: `pnpm install`.
4. Ejecuta en desarrollo: `pnpm dev`.

Consejos:

- Si agregas nuevas variables de entorno, documenta aquí y en `.env.example`.
- Reinicia el servidor si cambias `next.config.mjs`.

## Deployment

- El proyecto es compatible con Vercel y otros hosts que soporten Next.js.
- Asegura las variables de entorno en la plataforma de despliegue y las claves de Supabase.

## Testing

- Actualmente no hay tests automatizados en el repositorio (buscar `test` o configuración de Jest/Playwright).
- Recomendación: agregar pruebas unitarias con Vitest/Jest y pruebas end-to-end con Playwright.

## Contribución y mantenimiento

- Flujo sugerido:
  - Crear feature branch: `feat/<breve-descripción>` o `fix/<breve>`.
  - Abrir PR con descripción y screenshots si aplica.
  - Añadir checklist en PR: lint, build local, prueba rápida de la funcionalidad.

- Estilo de código:
  - TypeScript estricto cuando sea posible.
  - Mantener consistencia con `eslint` configurado (ejecutar `pnpm lint`).

## Documentación viva

Este archivo está pensado para mantenerse actualizado. Recomendaciones para ello:

- Siempre que añadas una dependencia importante, actualiza la sección de Tecnologías.
- Al modificar scripts, actualiza la sección de Scripts.
- Si se añaden o cambian variables de entorno, actualiza la sección correspondiente.
- Añade notas de arquitectura (decisiones importantes) en la sección `Arquitectura` o crea `docs/` para temas más largos.

## Plantilla rápida de Changelog

```
## [Unreleased]

### Added
-

### Changed
-

### Fixed
-

```

## Checklist antes de merge/deploy

- [ ] Lint passed (`pnpm lint`)
- [ ] Build local (`pnpm build`)
- [ ] Verificar cambios en UI y funciones críticas
- [ ] Actualizar documentación y changelog

## Contacto / Soporte

https://www.linkedin.com/in/michael-vasquez-4b4827205/
https://www.linkedin.com/in/tomas-ferrer-910133353/

---
