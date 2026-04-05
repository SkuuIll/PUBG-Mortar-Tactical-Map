---
name: rediseno-menus-morteros-pubg
overview: Rediseñar la estructura de menús y navegación de la app para que sea más intuitiva y visualmente limpia, manteniendo toda la funcionalidad actual, y dejar el README principal alineado con el proyecto y sin contenido viejo.
design:
  architecture:
    framework: html
  styleKeywords:
    - Glassmorphism táctico
    - Dark premium
    - Alto contraste
    - Navegación segmentada
    - HUD compacto
    - Responsive por secciones
  fontSystem:
    fontFamily: Roboto
    heading:
      size: 30px
      weight: 700
    subheading:
      size: 18px
      weight: 600
    body:
      size: 15px
      weight: 400
  colorSystem:
    primary:
      - "#FF5D5D"
      - "#4DABF7"
      - "#7C4DFF"
    background:
      - "#070B11"
      - "#0B1220"
      - "#121C2E"
    text:
      - "#F5F7FB"
      - "#B6C6DB"
      - "#8A9AB0"
    functional:
      - "#00C853"
      - "#FFB74D"
      - "#FF6B6B"
      - "#4DABF7"
todos:
  - id: auditar-ui
    content: Usar [subagent:code-explorer] para validar IDs, acciones y dependencias del refactor de menús
    status: completed
  - id: reestructurar-shell
    content: Usar [mcp:filesystem] para reorganizar `index.html` con app bar, panel lateral, HUD compacto y tabs móviles
    status: completed
    dependencies:
      - auditar-ui
  - id: redisenar-estilos
    content: Usar [mcp:filesystem] para rediseñar `tokens.css`, `layout.css` y `components.css` con jerarquía visual coherente
    status: completed
    dependencies:
      - reestructurar-shell
  - id: adaptar-controladores
    content: Usar [mcp:filesystem] para adaptar `pubg-mortar-app.js` y `drawing-manager.js` a la nueva navegación
    status: completed
    dependencies:
      - reestructurar-shell
      - redisenar-estilos
  - id: validar-flujos
    content: Validar mapa, mortero, dibujo, HUD, acciones móviles y atajos sin romper funcionalidad existente
    status: completed
    dependencies:
      - adaptar-controladores
  - id: rehacer-readme
    content: Usar [mcp:filesystem] para rehacer `README.md` y dejarlo centrado en producto, uso y estructura actual
    status: completed
    dependencies:
      - validar-flujos
---

## User Requirements

- Rediseñar los menús y la navegación de la aplicación porque la estructura actual resulta fragmentada y poco intuitiva.
- Mantener la funcionalidad existente: selección de mapa, modo distancia y mortero, dibujo táctico, HUD, compartir, exportar, instalar, ayuda y cambio de tema.
- Mejorar el flujo entre controles globales, acciones tácticas y herramientas secundarias, especialmente entre escritorio y móvil.
- Rehacer `README.md` desde cero, eliminando el contenido viejo y explicando claramente de qué trata el proyecto y cómo se usa.

## Product Overview

`Morteros PUBG` es una herramienta web táctica sobre mapas interactivos de PUBG. La renovación debe conservar su lógica actual, pero presentar los controles con una jerarquía mucho más clara, más foco sobre el mapa y una experiencia más pulida. Visualmente, la interfaz debe sentirse más compacta, moderna y táctica, con menos ruido en la cabecera y una navegación móvil mejor organizada.

## Core Features

- Barra superior simplificada con solo controles globales.
- Navegación principal agrupada por intención: operación, dibujo táctico, acciones y opciones adicionales.
- HUD inferior más compacto, priorizando los datos clave del disparo o la medición.
- Navegación móvil por secciones claras, con paneles inferiores en lugar de accesos dispersos.
- Documentación principal renovada en `README.md`, enfocada en producto, uso y estructura actual.

## Tech Stack Selection

- Aplicación web estática existente basada en `HTML`, `CSS` y `JavaScript` modular con ES modules.
- Mapa interactivo implementado con `Leaflet`.
- Exportación de vista mediante `html2canvas`.
- Soporte instalable con `manifest.webmanifest` y `sw.js`.

## Implementation Approach

Se debe refactorizar la navegación dentro de la arquitectura actual de una sola pantalla, sin introducir router ni framework nuevo. La estrategia óptima es reorganizar la interfaz en un shell más claro: una app bar superior con controles globales, un panel de navegación agrupado para acciones tácticas, un HUD inferior compacto y una navegación móvil por pestañas con hojas inferiores.

La lógica de mapa, cálculo de mortero, dibujo, compartir, exportar, ayuda y tema ya está centralizada en `src/js/core/pubg-mortar-app.js` y `src/js/features/drawing-manager.js`, por lo que conviene reutilizar esos controladores y remapear sus referencias DOM en lugar de reescribir la lógica funcional. Esto reduce deuda técnica, mantiene consistencia con el proyecto actual y minimiza el riesgo de regresiones.

En términos de rendimiento, el cambio es principalmente estructural y visual: las interacciones siguen siendo de costo constante por evento de UI. Los puntos críticos siguen siendo el render del mapa de Leaflet y la exportación con `html2canvas`; el refactor no debe añadir listeners duplicados ni capas visuales innecesarias. Para ello, conviene centralizar el estado de navegación en el controlador principal y reutilizar un único conjunto de handlers compartido entre escritorio y móvil.

## Implementation Notes

- Reutilizar los servicios y configuraciones actuales; no mover lógica de mapas, mortero, compartir, PWA o exportación fuera de sus módulos existentes.
- Mantener compatibilidad con atajos de teclado, mensajes de estado y persistencia actual de mapa, tema y HUD.
- Preservar IDs actuales cuando sea razonable para reducir el impacto en `pubg-mortar-app.js`; si se cambian, hacerlo de forma coordinada y completa.
- Evitar refactors no relacionados en `maps.js`, `mortar.js`, `share-service.js`, `theme-service.js` y `pwa-service.js`.
- Limitar el cambio documental a `README.md`; no tocar `README.en.md` ni `README.es.md` salvo solicitud posterior.

## Architecture Design

La solución debe seguir la arquitectura ya existente:

- `index.html`
- Shell único de la aplicación y jerarquía de navegación.
- `src/js/core/pubg-mortar-app.js`
- Coordinador principal de estado, eventos, HUD, menús y responsive.
- `src/js/features/drawing-manager.js`
- Gestor aislado del panel de dibujo y de sus herramientas.
- `src/styles/*.css`
- Separación actual por tokens, layout, componentes y mapa.
- Servicios y configuraciones
- Permanecen sin cambios funcionales, solo reutilizados desde la nueva navegación.

## Directory Structure

### Directory Structure Summary

La implementación reorganiza la navegación y la documentación principal sin alterar la lógica base de cálculo ni los servicios existentes.

- `c:/Users/Skull/Desktop/Morteros PUBG/index.html` [MODIFY]  
Reestructurar la UI principal: app bar simplificada, panel lateral de navegación, HUD compacto y navegación móvil por pestañas u hojas inferiores. Mantener todas las acciones existentes accesibles desde la nueva jerarquía.

- `c:/Users/Skull/Desktop/Morteros PUBG/src/styles/tokens.css` [MODIFY]  
Extender o ajustar tokens visuales para nuevos estados activos, superficies de panel, navegación segmentada y compactación del HUD, manteniendo coherencia con el tema claro/oscuro actual.

- `c:/Users/Skull/Desktop/Morteros PUBG/src/styles/layout.css` [MODIFY]  
Redefinir la distribución espacial del shell, el comportamiento responsive, el panel lateral en escritorio, la ocupación del mapa y la navegación inferior móvil.

- `c:/Users/Skull/Desktop/Morteros PUBG/src/styles/components.css` [MODIFY]  
Rediseñar botones, grupos de control, pestañas, paneles, estados activos, hojas móviles y bloques del HUD para lograr una jerarquía visual más clara y atractiva.

- `c:/Users/Skull/Desktop/Morteros PUBG/src/js/core/pubg-mortar-app.js` [MODIFY]  
Actualizar referencias DOM y sincronización de estado para la nueva navegación; conservar handlers de mapa, modo mortero, HUD, ayuda, compartir, exportar e instalación.

- `c:/Users/Skull/Desktop/Morteros PUBG/src/js/features/drawing-manager.js` [MODIFY]  
Adaptar la integración del panel de dibujo con la nueva estructura de menús, respetando herramientas, capas y limpieza de estado.

- `c:/Users/Skull/Desktop/Morteros PUBG/README.md` [MODIFY]  
Sustituir el contenido viejo por una explicación clara del producto, sus funciones principales, su uso y la estructura actual del proyecto.

## Diseño de interfaz

La aplicación seguirá siendo una sola pantalla, pero organizada en cinco bloques claros: app bar superior, navegación táctica lateral en escritorio, mapa central dominante, HUD inferior compacto y navegación móvil inferior por secciones. La app bar debe quedarse con marca, mapa, modo, tema y acceso a opciones secundarias; el resto se agrupa por intención para evitar la dispersión actual.

El panel lateral debe dividir opciones en bloques claros: operación, dibujo táctico, acciones y ayuda/más. El HUD debe priorizar distancia, ángulo, tiempo y estado, dejando la información menos crítica en un nivel secundario. En móvil, la navegación debe transformarse en una barra inferior con secciones `Mapa`, `Tiro`, `Dibujo` y `Más`, cada una abriendo una hoja inferior compacta para no tapar el mapa innecesariamente.

La estética debe apoyarse en el lenguaje visual ya existente: superficies translúcidas, alto contraste, brillo sutil, bordes suaves y microinteracciones rápidas. El resultado buscado es más táctico, más limpio y más premium, con mayor foco sobre el mapa y mejor lectura operativa.

## Agent Extensions

### SubAgent

- **code-explorer**
- Purpose: verificar selectores, archivos afectados y dependencias de eventos antes y después del refactor visual.
- Expected outcome: un alcance validado del cambio y menor riesgo de romper acciones existentes.

### MCP

- **filesystem**
- Purpose: aplicar ediciones coordinadas en `index.html`, CSS, controladores JS y `README.md`, revisando el resultado final archivo por archivo.
- Expected outcome: una refactorización consistente de menús y documentación actualizada en los archivos correctos.