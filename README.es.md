# PUBG Mortar Tactical Map

## Descripción

Este proyecto es una calculadora táctica de morteros para PUBG basada en Leaflet. La aplicación fue reestructurada por completo para mejorar:

- organización de archivos,
- claridad del código,
- mantenibilidad,
- consistencia de estilo,
- rendimiento,
- documentación.

## Mejoras aplicadas

### Arquitectura

- Se eliminó la lógica monolítica del antiguo `script.js`.
- Se migró a una estructura modular con responsabilidades separadas.
- Se eliminaron los `onclick` y `onchange` embebidos en HTML.
- Se centralizó la configuración de mapas y morteros.
- Se encapsuló la lógica del dibujo en un gestor dedicado.

### Organización de assets

Los mapas ahora están clasificados en carpetas lógicas:

- `assets/maps/active`: mapas activos usados por la aplicación.
- `assets/maps/archive`: imágenes auxiliares, alternativas o históricas.
- `assets/maps/tiles`: tiles preparados para futuras mejoras por mosaicos.

### Rendimiento

- Se reemplazaron URLs remotas por assets locales.
- Se redujo la dependencia de red para cargar mapas.
- El contador de visitas ahora se consulta solo una vez por sesión.
- La exportación a PNG es más estable al trabajar con recursos locales.

### Correcciones funcionales

- `Reset` ahora limpia correctamente medición y encuadre.
- El cambio de mapa limpia mediciones y dibujos para evitar inconsistencias.
- La herramienta de texto ahora funciona con clic directo en el mapa.
- El borrador ahora elimina dibujos individuales.
- Se unificó el idioma de la interfaz al español.
- Se sustituyeron alertas bloqueantes por mensajes de estado no intrusivos.

## Estructura del proyecto

```text
Morteros PUBG/
├── assets/
│   └── maps/
│       ├── active/
│       ├── archive/
│       └── tiles/
├── src/
│   ├── js/
│   │   ├── config/
│   │   │   ├── maps.js
│   │   │   └── mortar.js
│   │   ├── core/
│   │   │   └── pubg-mortar-app.js
│   │   ├── features/
│   │   │   ├── drawing-manager.js
│   │   │   └── export-service.js
│   │   ├── services/
│   │   │   ├── theme-service.js
│   │   │   └── visitor-counter-service.js
│   │   └── main.js
│   └── styles/
│       ├── base.css
│       ├── components.css
│       ├── layout.css
│       ├── main.css
│       ├── map.css
│       └── tokens.css
├── index.html
├── README.md
├── README.en.md
└── README.es.md
```

## Responsabilidades por módulo

### `src/js/config/maps.js`
Define mapas disponibles, rutas locales, escalas y metadatos.

### `src/js/config/mortar.js`
Define rangos válidos, radio de impacto, velocidad del proyectil y tabla simplificada de ángulos.

### `src/js/core/pubg-mortar-app.js`
Orquesta toda la aplicación:

- inicialización,
- control del HUD,
- selección de mapas,
- modo distancia,
- modo mortero,
- atajos de teclado,
- mensajes de estado,
- integración de servicios.

### `src/js/features/drawing-manager.js`
Gestiona el panel de dibujo y sus herramientas:

- trazado libre,
- línea,
- círculo,
- rectángulo,
- texto,
- borrador.

### `src/js/features/export-service.js`
Exporta la vista actual a PNG con `html2canvas`.

### `src/js/services/theme-service.js`
Aplica y persiste el tema claro/oscuro.

### `src/js/services/visitor-counter-service.js`
Carga el contador de visitas con caché de sesión.

## Cómo usar

### Modo distancia

1. Haz clic una vez para marcar el inicio.
2. Haz clic una segunda vez para marcar el destino.
3. Revisa la distancia en el HUD.

### Modo mortero

1. Activa el interruptor de mortero.
2. Haz clic para fijar el mortero.
3. Haz clic para fijar el objetivo.
4. Verifica el estado del disparo en el HUD.

### Dibujo táctico

1. Abre el panel `Dibujar`.
2. Elige herramienta y color.
3. Para texto, escribe el contenido y haz clic sobre el mapa.
4. Para borrar un dibujo, usa `Borrador` y haz clic sobre él.

## Atajos de teclado

- `R`: reiniciar medición y encuadre.
- `C`: limpiar medición actual.
- `D`: abrir/cerrar panel de dibujo.
- `H`: abrir ayuda.
- `M`: alternar modo mortero.
- `E`: exportar vista actual.
- `Esc`: cerrar ayuda y paneles.

## Convenciones de mantenimiento

### Nombres de archivos

- Minúsculas.
- `kebab-case` para CSS y servicios.
- Nombres descriptivos según responsabilidad.

### Principios seguidos

- una responsabilidad por módulo,
- configuración separada de la lógica,
- HTML sin eventos inline,
- mensajes de estado centralizados,
- uso consistente de variables CSS.

## Cómo añadir un mapa nuevo

1. Copia la imagen a `assets/maps/active/`.
2. Añade una entrada en `src/js/config/maps.js` con:
   - `id`,
   - `label`,
   - `sizeLabel`,
   - `assetPath`,
   - `bounds`,
   - `metersPerUnit`.
3. Guarda y recarga la página.

## Notas futuras

La carpeta `assets/maps/tiles/erangel-remaster` se conservó para una futura migración a mapas por tiles. Actualmente la aplicación usa `imageOverlay` con assets locales por simplicidad y compatibilidad.
