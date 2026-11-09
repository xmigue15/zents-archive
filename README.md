# Zent

**Tus finanzas claras.** Aplicación web para registrar ingresos, gastos, cuentas y categorías, y entender tu dinero mes a mes.

Esta primera versión es **local-first**: no hay login, no hay pagos y tus datos nunca salen de tu dispositivo. Todo se guarda en el `localStorage` del navegador.

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

## Tus datos

- Se guardan solo en el navegador de ese dispositivo y ese dominio.
- Si borras los datos del sitio o usas otro navegador, no aparecerán.
- Usa **Ajustes → Exportar respaldo** antes de limpiar el navegador o cambiar de dispositivo.
- **Ajustes → Importar** reemplaza los datos actuales por los del respaldo.
- **Ajustes → Borrar todo** elimina movimientos, cuentas y categorías personalizadas de ese dispositivo.

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
