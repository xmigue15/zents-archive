# Zent

**Tus finanzas claras.** Aplicación web para registrar ingresos, gastos, cuentas y categorías, y entender tu dinero mes a mes.

Esta versión sincroniza tus datos con **Supabase**: inicias sesión con correo y contraseña, y tus movimientos, cuentas y categorías se guardan en la nube para usarlos desde cualquier dispositivo.

## Funciones incluidas

- **Resumen mensual** con saldo total, ingresos, gastos, balance, promedio diario y mayor categoría de gasto.
- **Movimientos** con búsqueda, filtros por mes, tipo y cuenta, y edición o eliminación.
- **Cuentas** con saldo inicial, color y saldo calculado automáticamente.
- **Categorías** de gasto e ingreso, con emoji, color y creación de categorías propias.
- **Estadísticas** de los últimos 6 meses y desglose por categoría.
- **Tema claro, oscuro o automático** según el sistema.
- **Respaldo e importación** en JSON.
- **Funciona sin conexión** una vez cargada (service worker) y se puede instalar como app.
- Formato de moneda **COP** (peso colombiano).

## Cómo usarla

### Opción 1: abrir directamente

Abre `index.html` con tu navegador. La app funciona, pero el modo sin conexión y la instalación como app necesitan un servidor.

### Opción 2: servidor local (recomendado)

En Windows puedes hacer doble clic en **`iniciar.cmd`**. Se abrirá la app en <http://localhost:8080> y la ventana quedará sirviendo los archivos mientras la usas.

También puedes hacerlo manualmente desde la carpeta `zent`:

```bash
python -m http.server 8080
```

Luego abre <http://localhost:8080>.

### Opción 3: publicarla

Sube el contenido de esta carpeta a cualquier hosting estático: GitHub Pages, Netlify, Cloudflare Pages, Vercel o tu propio servidor. No requiere build ni backend.

Para instalar como app, ábrela desde `https` o `localhost` y usa la opción **Instalar app** del navegador.

## Tus datos y Supabase

Tus datos se sincronizan con Supabase mediante autenticación de correo y contraseña. Cada usuario solo ve sus propios datos gracias a Row Level Security.

### Configurar Supabase (una sola vez)

En tu proyecto de Supabase, ve a **SQL Editor** y ejecuta:

```sql
create extension if not exists "uuid-ossp";

create table if not exists public.user_states (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null unique,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

alter table public.user_states enable row level security;

create policy "Users can view their own state"
  on public.user_states for select
  using (auth.uid() = user_id);

create policy "Users can insert their own state"
  on public.user_states for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own state"
  on public.user_states for update
  using (auth.uid() = user_id);
```

Luego, en **Authentication → Settings**, confirma que tienes habilitado **Email confirmations** si quieres que los usuarios verifiquen su correo al registrarse.

### Notas

- Tus datos se guardan en `localStorage` como respaldo local y se suben a Supabase tras cada cambio.
- Si cierras sesión, se borra la sesión actual pero los datos siguen en Supabase para la próxima vez que inicies sesión con la misma cuenta.
- Usa **Ajustes → Exportar respaldo** para descargar una copia JSON de tus datos en cualquier momento.
- **Ajustes → Borrar todo** elimina los datos de este dispositivo y los sube vacíos a Supabase (cuidado: esto sobrescribe en la nube).

## Cómo usar en tu celular

1. Despliega esta carpeta en un hosting con HTTPS (Netlify, Vercel, Cloudflare Pages, GitHub Pages, etc.).
2. Abre la URL desde el navegador de tu celular.
3. Regístrate o inicia sesión con tu correo y contraseña.
4. Tus datos aparecen automáticamente en todos los dispositivos donde inicies sesión con la misma cuenta.

## Estructura

```text
zent/
├── index.html              # Estructura de la app
├── styles.css              # Diseño responsive y temas
├── app.js                  # Lógica, cálculos y persistencia
├── manifest.webmanifest    # Configuración de la app instalable
├── sw.js                   # Service worker (modo sin conexión)
└── icons/                  # Iconos SVG y PNG
```

## Notas técnicas

- HTML, CSS y JavaScript sin dependencias ni proceso de compilación.
- Datos validados y normalizados al cargar o importar un respaldo.
- Ruteo por hash (`#/resumen`, `#/movimientos`, etc.), así que funciona en cualquier hosting estático.
- Si actualizas archivos y usas el service worker, cambia `CACHE_NAME` en `sw.js` para invalidar la caché anterior.

## Estado

Versión `0.1.0` — base funcional de la versión web. Las funciones avanzadas (metas, presupuestos, recurrentes, reportes, sincronización o pagos) se pueden agregar más adelante.
