# MenuLiz 🍲

PWA de pedidos de almuerzo para un restaurante en Perú. El cliente arma su pedido
(menú del día o platos a la carta) y lo envía por **WhatsApp**. La administradora
gestiona platos, menú del día con stock, pedidos en tiempo real y configuración
del negocio.

- **Stack:** Next.js (App Router) + TypeScript + Tailwind CSS + Supabase + Lucide.
- **Idioma:** español (Perú). **Moneda:** S/ (Soles).
- **Sin registro de clientes:** se pide con nombre y teléfono.
- **Sin pagos online:** solo referencia (Efectivo, Yape, Plin, Lemon).

## Requisitos

- Node.js 20+
- Una cuenta/proyecto de [Supabase](https://supabase.com)

## Variables de entorno

Copia `.env.example` a `.env.local` y completa tus datos:

| Variable | Descripción |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública (anon/publishable) |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio (solo servidor) |
| `NEXT_PUBLIC_SITE_URL` | URL pública del sitio |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Número de WhatsApp de la dueña (con código de país, ej. `51999999999`) |
| `NEXT_PUBLIC_RESTAURANT_NAME` | Nombre del restaurante (por defecto `MenuLiz`) |
| `NEXT_PUBLIC_MENU_PRICE` | Precio del combo completo (por defecto `14`) |

## Base de datos (Supabase)

1. Entra a **Supabase → SQL Editor**.
2. Ejecuta el contenido de [`supabase/schema.sql`](supabase/schema.sql). Es
   idempotente: puedes volver a correrlo sin miedo.
3. Crea el usuario de la dueña en **Authentication → Users** (email + password).

Los cambios incrementales están en [`supabase/migrations/`](supabase/migrations/).

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:3000
```

## Build y despliegue

```bash
npm run build
npm start
```

El service worker (PWA) **solo se genera en modo producción** (`next build`).
En desarrollo está desactivado a propósito.

## Estructura

```
src/
  app/
    (customer)/        # Área pública: landing, menú, carta, carrito, confirmación
    (admin)/           # Login y panel de administración
    api/pwa-icon/      # Íconos PWA generados en runtime
    manifest.ts        # Manifest de la PWA
  components/          # UI compartida, cliente y admin
  hooks/               # use-cart, use-daily-menu
  lib/                 # supabase, constants, whatsapp, utils
  types/               # Tipos de dominio
supabase/
  schema.sql           # Esquema completo (fuente de verdad)
  migrations/          # Cambios incrementales
public/
  images/              # Fotos de los platos
```

## Notas

- Las fotos de platos se pueden subir a **Supabase Storage** (bucket `dish-images`)
  o referenciar por URL.
- El mensaje de WhatsApp usa emojis "seguros" (Unicode 6.0, presentación de color)
  para que se vean igual en iPhone y Android.
