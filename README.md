# Zent

**Tus finanzas claras.** Aplicación web para registrar ingresos, gastos, cuentas y categorías, y entender tu dinero mes a mes.

Esta versión sincroniza tus datos con **Supabase**: inicias sesión con correo y contraseña, y tus movimientos, cuentas y categorías se guardan en la nube para usarlos desde cualquier dispositivo.

## Funciones incluidas

- **Resumen mensual** con saldo total, ingresos, gastos, balance, promedio diario y mayor categoría de gasto.
- **Consejo del día** con 1000 frases de educación financiera: una nueva en cada apertura.
- **Movimientos** con búsqueda, filtros por mes, tipo y cuenta, y edición o eliminación.
- **Agregar en pasos**: primero eliges gasto o ingreso, luego el monto, la categoría y los detalles.
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

- Zent es **local primero**: abre al instante con lo guardado en `localStorage` del dispositivo, incluso sin internet. Supabase se usa para subir los cambios y como copia de seguridad.
- Si no hay conexión, los cambios quedan en cola en el dispositivo y se suben solos cuando vuelve internet (verás el estado en **Ajustes → Sincronización**).
- En un dispositivo nuevo la app trae la copia de la nube la primera vez. Después, usa **Ajustes → Traer de la nube** solo si quieres recuperar esa copia a mano.
- Si cierras sesión, se borra la sesión actual pero los datos siguen en Supabase para la próxima vez que inicies sesión con la misma cuenta.
- Usa **Ajustes → Exportar respaldo** para descargar una copia JSON de tus datos en cualquier momento.
- **Ajustes → Borrar todo** elimina los datos de este dispositivo y los sube vacíos a Supabase (cuidado: esto sobrescribe en la nube).

## Cómo usar en tu celular

1. Despliega esta carpeta en un hosting con HTTPS (Netlify, Vercel, Cloudflare Pages, GitHub Pages, etc.).
2. Abre la URL desde el navegador de tu celular.
3. Regístrate o inicia sesión con tu correo y contraseña.
4. La primera vez en un dispositivo nuevo, tus datos se traen de la nube automáticamente. A partir de ahí se guardan en el dispositivo y se suben a tu cuenta con cada cambio.

## Estructura

```text
zent/
├── index.html              # Estructura de la app
├── styles.css              # Diseño responsive y temas
├── app.js                  # Lógica, cálculos y persistencia
├── sync.js                 # Sincronización local primero con Supabase
├── vendor/supabase-js.js   # Librería de Supabase servida desde el mismo dominio
├── manifest.webmanifest    # Configuración de la app instalable
├── sw.js                   # Service worker (modo sin conexión)
└── icons/                  # Iconos SVG y PNG
```

## Notas técnicas

- HTML, CSS y JavaScript sin proceso de compilación. La única librería externa es supabase-js, guardada en `vendor/` para no depender de un CDN al abrir la app.
- Datos validados y normalizados al cargar o importar un respaldo.
- Ruteo por hash (`#/resumen`, `#/movimientos`, etc.), así que funciona en cualquier hosting estático.
- Si actualizas archivos y usas el service worker, cambia `CACHE_NAME` en `sw.js` para invalidar la caché anterior.

## Estado

Versión `0.1.0` — base funcional de la versión web. Las funciones avanzadas (metas, presupuestos, recurrentes, reportes, sincronización o pagos) se pueden agregar más adelante.
