# PUBG Mortar Tactical Map

## Overview

This project is a Leaflet-based tactical mortar calculator for PUBG. The application was fully restructured to improve:

- file organization,
- code clarity,
- maintainability,
- styling consistency,
- performance,
- documentation.

## Implemented improvements

### Architecture

- The previous monolithic `script.js` was replaced.
- The app now uses a modular structure with separated responsibilities.
- Inline `onclick` and `onchange` handlers were removed from HTML.
- Map and mortar settings are now centralized.
- Drawing logic is isolated in a dedicated manager.

### Asset organization

Maps are now grouped into logical folders:

- `assets/maps/active`: active maps used by the app.
- `assets/maps/archive`: auxiliary, alternate, or historical images.
- `assets/maps/tiles`: tile resources preserved for future improvements.

### Performance

- Remote map URLs were replaced with local assets.
- Network dependency for map loading was reduced.
- The visitor counter now loads only once per session.
- PNG export is more stable because the project now uses same-origin resources.

### Functional fixes

- `Reset` now clears measurement and framing correctly.
- Changing maps clears measurements and drawings to avoid inconsistent state.
- The text tool now works by clicking directly on the map.
- The eraser now removes individual drawings.
- The interface language was unified to Spanish.
- Blocking alerts were replaced with non-intrusive status messages.

## Project structure

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

## Module responsibilities

### `src/js/config/maps.js`
Defines available maps, local routes, scales, and metadata.

### `src/js/config/mortar.js`
Defines valid mortar ranges, impact radius, projectile speed, and the simplified angle table.

### `src/js/core/pubg-mortar-app.js`
Coordinates the full application:

- initialization,
- HUD updates,
- map selection,
- distance mode,
- mortar mode,
- keyboard shortcuts,
- status messages,
- service integration.

### `src/js/features/drawing-manager.js`
Handles the drawing panel and its tools:

- freehand,
- line,
- circle,
- rectangle,
- text,
- eraser.

### `src/js/features/export-service.js`
Exports the current view to PNG through `html2canvas`.

### `src/js/services/theme-service.js`
Applies and persists the light/dark theme.

### `src/js/services/visitor-counter-service.js`
Loads the visitor counter with session caching.

## Usage

### Distance mode

1. Click once to place the starting point.
2. Click again to place the destination.
3. Check the HUD for the measured distance.

### Mortar mode

1. Enable the mortar toggle.
2. Click to place the mortar position.
3. Click to place the target.
4. Check the HUD for shot status and data.

### Tactical drawing

1. Open the `Dibujar` panel.
2. Choose a tool and color.
3. For text, type content and click on the map.
4. To remove a drawing, select `Borrador` and click the drawing.

## Keyboard shortcuts

- `R`: reset measurement and framing.
- `C`: clear current measurement.
- `D`: open/close drawing panel.
- `H`: open help.
- `M`: toggle mortar mode.
- `E`: export current view.
- `Esc`: close help and panels.

## Maintenance conventions

### File naming

- Lowercase names.
- `kebab-case` for CSS files and services.
- Descriptive filenames based on responsibility.

### Applied principles

- one responsibility per module,
- configuration separated from logic,
- HTML without inline events,
- centralized status messages,
- consistent CSS variable usage.

## How to add a new map

1. Copy the image into `assets/maps/active/`.
2. Add a new entry in `src/js/config/maps.js` including:
   - `id`,
   - `label`,
   - `sizeLabel`,
   - `assetPath`,
   - `bounds`,
   - `metersPerUnit`.
3. Save and reload the page.

## Future notes

The `assets/maps/tiles/erangel-remaster` folder was preserved for a future migration to tiled maps. The current app uses `imageOverlay` with local assets for simplicity and compatibility.
