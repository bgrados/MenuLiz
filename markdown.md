# Sabor Norteño (antes "MenuLiz") — Estado real del proyecto

> Corte: **2026-10-17**. Refleja código, Git, GitHub, Supabase y Vercel al detenerse.
> El prompt/spec original de arranque queda en el historial de Git (commit `41b3ee6` y anteriores).

## 0. TL;DR
- PWA de pedidos de almuerzo (Perú) **en producción**: https://menuliz.vercel.app
- Rebrand completo a **"Sabor Norteño"** (con ñ) + logo nuevo (cubiertos cruzados negros + "SN").
- Pago Yape/Plin/Lemon más fácil: página `/pago/[id]`, botón **"Ya pagué"**, subir constancia
  (cámara / galería / PDF) y **banner recordatorio** en la app.
- Último commit `3f0d59a` en `main`, desplegado en Vercel (**READY**).
- `tsc` 0 errores · `lint` 0 errores (57 warnings) · `build` OK.

## 1. Repositorio (Git / GitHub)
- Remoto: `https://github.com/bgrados/MenuLiz.git`
- Rama: `main` = `origin/main` (sin divergencia). **HEAD: `3f0d59a`**
- Working tree: **limpio**; solo sin trackear la carpeta `Documentacion/`
- Sin tags.
- Últimos commits (nuevo → viejo):
  1. `3f0d59a` feat(marca): cubiertos cruzados en negro en el logo + iconos estáticos
  2. `edaa26b` feat(marca+pago): rebrand a 'Sabor Norteño' con logo nuevo y pago en 1 toque
  3. `86308ca` feat(admin/compartir): incluir A la Carta en mensaje y tarjeta del menú
  4. `b227436` chore(imagenes): fotos locales de platos que estaban en Storage (jpg→webp)
  5. `befb424` chore(imagenes): fotos locales Sopa de Casa, Gelatina, Refresco Carambola, Olluco
  6. `373bf63` feat(pedidos): constancia de pago (Yape/Plin/Lemon) subida por el cliente
  7. `e537ba7` feat(menu): precio del menú configurable y aplicado en toda la app
  8. `41b3ee6` Add files via upload
  9. `1a61615` fix(whatsapp): api.whatsapp.com/send en vez de wa.me (emojis)
  10. `c9fbdc1` feat(carrito): ubicación GPS opcional (Google Maps / Waze) con autoguardado
  11. `a62733e` fix(menu): no permitir pedidos sin platos publicados
  12. `82653c9` feat(admin/menu-hoy): agregar categoría A la Carta
  13. `b2e2951` fix(whatsapp): emojis seguros + forzar update del service worker
  14. `1f29eeb` feat(platos): 17 platos extra inactivos con fotos locales
  15. `2586c47` feat(platos): fotos locales + resolutor por nombre + migración SQL
  16. `8770668` chore: limpieza, documentación y config de lint/build
  17. `5aa4abd` feat(admin): eliminar pedidos, clientes, configuración, stock RT y fotos
  18. `d76c9c4` fix(pwa): splash naranja, iconos ML y metadatos iOS/tablet
  19. `5e08e52` fix(whatsapp): emojis seguros iOS/Android
  20. `c132dbc` feat(db): permitir eliminar pedidos, arreglar trigger de stock + RLS

## 2. Stack real (package.json)
- **Next.js 16.4.1** (App Router) + **React 19.3.0** + TypeScript 5 + **Tailwind 4**
- PWA: `@ducanh2912/next-pwa` 10.2.9
- Supabase: `@supabase/ssr` 0.12.7 + `@supabase/supabase-js` 2.117.3
- UI/util: `lucide-react` 1.57.0, `html2canvas`, `canvas-confetti`, `clsx`, `tailwind-merge`
- Formularios/validación: `react-hook-form` 7.90, `zod` 4.6, `@hookform/resolvers`
- Fechas: `date-fns` 4.4
- Scripts: `dev`/`build` usan **--webpack**; `start`, `lint`
- `next.config.ts`: PWA (dest public, `skipWaiting`, `clientsClaim`, `cleanupOutdatedCaches`,
  `aggressiveFrontEndNavCaching: false`, desactivada en dev) + `images.remotePatterns`
  (supabase.co y images.unsplash.com) + `turbopack: {}`.
- Nota: **no** se usa Shadcn real; hay `src/components/ui/*` propios (badge, button, card,
  input, label, skeleton, textarea).

## 3. Rutas (src/app)
Cliente `(customer)/`:
- `/` (landing) · `/menu` · `/carta` · `/carrito` · `/confirmacion` · `/pago/[id]` · `layout.tsx`

Admin `(admin)/`:
- `/login` · `/admin/dashboard` · `/admin/platos` · `/admin/menu-hoy` · `/admin/pedidos`
  · `/admin/clientes` · `/admin/compartir` · `/admin/configuracion` · `admin/layout.tsx`

Otros:
- `app/layout.tsx`, `app/manifest.ts`, `app/icon.png`, `app/apple-icon.png`,
  `app/api/pwa-icon/route.tsx` (redirige a los PNG estáticos), `app/globals.css`

## 4. Componentes (src/components)
- Marca/PWA: `BrandMark.tsx`, `PWAInstallPrompt.tsx`
- Cliente: `customer/CustomerHeader.tsx`, `customer/CustomerBottomNav.tsx`,
  `customer/PendingPaymentBanner.tsx`, `DishCard.tsx`, `Hero.tsx`, `CategoryFilter.tsx`
- Pago: `PaymentActions.tsx`, `PaymentReceiptUpload.tsx`
- Config: `RestaurantSettingsProvider.tsx` (fuente única de nombre / precio / delivery / WhatsApp)
- UI propia: `ui/*` (8 archivos)
- **Código muerto (no importado)**: `Navbar.tsx`, `AdminModal.tsx` (PIN `1234`), `CartDrawer.tsx`

## 5. Supabase (proyecto y esquema)
- Proyecto: ref **`zwdfwasdmlsjunpezhsm`** · URL `https://zwdfwasdmlsjunpezhsm.supabase.co`
- Clave pública (publishable): `sb_publishable_794mkDhmQwvlaVLFin2FwA_DMcSNLc4`
- **Migraciones 0002 → 0008 aplicadas** (remote = local).
  Base: `supabase/schema.sql` (fuente de verdad, idempotente).
  - `0002` eliminar pedidos + fix stock + RLS
  - `0003` fotos locales de platos
  - `0004` 17 platos extra inactivos
  - `0005` precio del menú + constancia de pago
    (`restaurant_settings.menu_price`, `orders.payment_receipt_path`, RPC `attach_payment_receipt`)
  - `0006` fotos locales desde Storage
  - `0007` nombre del restaurante = 'Sabor Norteño'
  - `0008` confirmación de pago "1 toque": `orders.payment_note`, `orders.payment_confirmed_at`,
    RPC `confirm_order_payment`, RPC `get_order_payment_info`
- Tablas: `profiles`, `dishes`, `daily_menus`, `orders`, `order_items`, `restaurant_settings`
- RPCs anon-safe: `create_order`, `attach_payment_receipt`, `confirm_order_payment`,
  `get_order_payment_info`
- ⚠️ `.env.local` tiene `SUPABASE_SERVICE_ROLE_KEY` = la **misma publishable key**
  (no es service role real; no hay SQL admin desde el cliente).

## 6. Datos reales (al 2026-10-17)
**restaurant_settings** (id `main`):
- restaurant_name: **Sabor Norteño**
- whatsapp_number: **51991346526**
- delivery_fee: **3.00** · menu_price: **14.00**
- address: **Av. Mariano Arredondo 2589**
- opening_hours: **L–V 11:30 AM–4:30 PM / S–D 11:00 AM–4.30 PM**
- updated_at: 2026-10-16 18:40 UTC

**dishes**: 65 en total
- Activos: 48 → entrada 13 · segundo 20 · refresco 6 · a_la_carta 9
- Inactivos: 17 → entrada 5 · segundo 10 · refresco 2

**public/images**: 42 archivos. 56 platos usan `/images/*`; 9 usan URL `http`:
- 8 son URLs **absolutas a `menuliz.vercel.app/images/*.webp`** (mismo archivo local, solo absoluto)
- 1 es **externa de Unsplash**: `Ceviche de Pescado` ← único plato sin foto local
- 0 platos sin imagen

**daily_menus HOY (2026-10-17)**: 18 filas, todas publicadas y disponibles
→ 9 a_la_carta · 3 entrada · 1 refresco · 5 segundo

**orders**: 12 pedidos
- Estados: nuevo 9 · en_camino 2 · confirmado 1
- Pagos: yape 8 · efectivo 3 · lemon 1
- Con constancia subida: 2 · Con "Ya pagué" (`payment_confirmed_at`): 0
- Último: **#47** (2026-10-17 17:13 UTC, yape, S/ 38.00)

## 7. Imágenes / Storage
- `public/images/` → fotos locales WebP (cacheables por la PWA).
- Buckets en Supabase Storage:
  - `dish-images` → fotos originales (backup; ya casi ninguna se usa)
  - `payment-receipts` → **privado**, guarda la ruta de la constancia
    (`orders.payment_receipt_path`; se ve por *signed URL* desde el admin)
- Queda un probe de 2 bytes `payment-receipts/__verify__/probe.txt`
  (solo borrable desde el dashboard).

## 8. PWA / marca / iconos
- Nombre en la app: viene de `restaurant_settings.restaurant_name` (header, landing,
  confirmación, carrito, admin, footer, splash y metadatos). Fallback en código: `'Sabor Norteño'`.
- Logo: badge naranja + **cubiertos cruzados negros (#1c1917)** + **"SN"** blanco.
- Iconos **estáticos** generados con `sharp` (`scripts/generate-icons.mjs`):
  `src/app/icon.png` (48), `src/app/apple-icon.png` (180), `public/icons/icon-192.png`,
  `public/icons/icon-512.png`, `public/icons/maskable-512.png`.
- `manifest.ts`: name "Sabor Norteño - Pedidos Online", short_name "Sabor Norteño",
  theme/background `#f97316`, display standalone.
- Splash naranja `#f97316` con el logo (inline, a prueba de fallos).
- Service worker: `public/sw.js` + `workbox-*.js` (solo se generan en producción).

## 9. WhatsApp
- `src/lib/whatsapp.ts` genera el texto con formato WhatsApp (*negrita*) y **emojis "seguros"**
  (Unicode 6.0, sin ZWJ / selectores, escritos con `String.fromCodePoint`).
- Se abre con **`https://api.whatsapp.com/send`** (nunca `wa.me`).
- Los pedidos con Yape/Plin/Lemon agregan un **recordatorio con enlace** a `/pago/<id>`.
- Número destino: el de `restaurant_settings.whatsapp_number` (**51991346526**).

## 10. Flujo de pago
- `/pago/[id]`: "Ya pagué" (1 toque, con N° de operación opcional), instrucciones para
  **Compartir desde Yape** por WhatsApp, y subida de constancia.
- `PaymentReceiptUpload`: dos botones ("Tomar foto" con cámara y "Elegir de la galería"),
  acepta imagen o **PDF**, máx 8 MB.
- `PendingPaymentBanner`: recordatorio persistente (localStorage `menuliz_pending_payment_v1`)
  hasta confirmar o subir la constancia.
- Admin → Pedidos: muestra "Pago confirmado por el cliente" + nota, y "Ver constancia".

## 11. Vercel
- Proyecto: **menuliz** (`prj_EFq4ApBDRiFW1j1sUMqFsHYOKkik`, team `team_Y6ejt6CNX95WboJmmi4akqfr`)
- Producción: **https://menuliz.vercel.app** · Último deploy **READY** = commit `3f0d59a`
- Variables en Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  (+ `VITE_SUPABASE_*`), en Production y Preview.
- ⚠️ **No** están en Vercel: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_WHATSAPP_NUMBER`,
  `NEXT_PUBLIC_RESTAURANT_NAME`, `NEXT_PUBLIC_MENU_PRICE` → se usan los defaults del código.
- Desplegar: `npx vercel --prod --yes`

## 12. Validación
- `npx tsc --noEmit` → **0 errores**
- `npm run lint` → **0 errores**, 57 warnings (imports / setState en efectos, preexistentes)
- `npm run build` → **OK** (~15 s, 19 páginas)

## 13. Pendientes / riesgos / deuda
- [ ] `Ceviche de Pescado` sigue con foto externa (Unsplash) → falta foto local.
- [ ] 8 platos usan URL absoluta `menuliz.vercel.app/images/*` (funciona, pero mejor `/images/*`).
- [ ] README.md desactualizado (dice "MenuLiz", `api/pwa-icon` "en runtime", etc.).
- [ ] Código muerto: `Navbar.tsx`, `AdminModal.tsx` (PIN 1234), `CartDrawer.tsx`.
- [ ] `/login` muestra **credenciales hardcodeadas** y botón "Acceso Rápido Dueña"
      (`duena@menuliz.pe` / `admin123`).
- [ ] `SUPABASE_SERVICE_ROLE_KEY` no es service-role real.
- [ ] Restos en `public/`: `next.svg`, `vercel.svg`, `file.svg`, `globe.svg`, `window.svg`.
- [ ] Probe en `payment-receipts/__verify__/probe.txt` (borrar desde el dashboard).
- [ ] Apps ya instaladas pueden conservar el ícono viejo en caché (desinstalar / reinstalar).

## 14. Cómo correr / desplegar
```bash
npm install
npm run dev            # http://localhost:3000
npx tsc --noEmit && npm run lint && npm run build
npx --yes supabase@latest db push --yes   # aplicar migraciones
npx vercel --prod --yes                    # desplegar
node scripts/generate-icons.mjs            # regenerar iconos
```

## 15. Accesos y URLs
- App: https://menuliz.vercel.app
- Repo: https://github.com/bgrados/MenuLiz.git
- Supabase: https://zwdfwasdmlsjunpezhsm.supabase.co
- Admin: `/login` — `duena@menuliz.pe` / `admin123`
- WhatsApp dueña: 51991346526 · Delivery S/ 3.00 · Menú S/ 14.00

## 16. Adjuntos (sin trackear) — `Documentacion/`
- `Manual_de_Usuario_MenuLiz_Sabor_Norteno.docx` / `.pdf`
- `Guía_para_pedir_tu_almuerzo.png`
- `qr-code.png`
