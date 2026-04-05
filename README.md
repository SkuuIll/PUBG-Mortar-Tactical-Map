# Morteros PUBG

`Morteros PUBG` es una aplicación web táctica para `PUBG` enfocada en calcular tiros de mortero, medir distancias y marcar referencias directamente sobre mapas interactivos del juego.

## Qué resuelve

La app reúne en una sola pantalla todo lo necesario para trabajar sobre el mapa sin depender de herramientas separadas:

- medir distancia entre dos puntos,
- calcular un tiro de mortero,
- validar si el objetivo está dentro de alcance,
- dibujar rutas, radios, cajas y notas,
- compartir la configuración actual,
- exportar la vista del mapa,
- usarla como `PWA` instalable.

## Navegación actual

La interfaz quedó organizada en bloques más claros:

- `Mapa`: selección del mapa activo y contexto visual del escenario.
- `Tiro`: cambio entre `Distancia` y `Mortero`, con flujo guiado y acciones de reinicio o limpieza.
- `Dibujo`: acceso a la capa táctica para anotar sobre el mapa.
- `Acciones`: compartir, exportar e instalar.
- `Más`: tema, ayuda rápida y atajos.

En escritorio estas secciones viven en un panel lateral. En móvil se accede desde la barra inferior por secciones.

## Funcionalidades principales

### Medición

- Marca un punto inicial y un punto final.
- La distancia se calcula automáticamente.
- El `HUD` resume el resultado sin tapar el mapa innecesariamente.

### Mortero

- Cambia al modo `Mortero`.
- Marca primero la posición del mortero.
- Marca después el objetivo.
- La app muestra distancia, ángulo, tiempo de vuelo y estado del disparo.

### Dibujo táctico

Incluye herramientas para:

- trazado libre,
- línea,
- círculo,
- rectángulo,
- texto,
- borrador.

### Utilidades

- Compartir mediante URL con mapa, modo y tema activos.
- Exportar la vista actual del mapa a `PNG`.
- Cambiar entre tema claro y oscuro.
- Instalar como aplicación web progresiva.

## Cómo usarla

### Flujo básico

1. Entra a `Mapa` y elige el escenario.
2. Ve a `Tiro` y define si quieres medir o calcular mortero.
3. Haz clic sobre el mapa siguiendo el paso actual indicado en la interfaz.
4. Revisa el `HUD` inferior para ver el resultado.
5. Si necesitas anotar jugadas, abre `Dibujo` y usa las herramientas.
6. Usa `Acciones` para compartir o exportar.

### Atajos

- `R`: reiniciar medición y encuadre.
- `C`: limpiar medición.
- `D`: abrir o cerrar dibujo.
- `H`: abrir ayuda.
- `M`: alternar modo mortero.
- `S`: compartir.
- `E`: exportar.
- `I`: instalar, si está disponible.
- `Esc`: cerrar paneles.

## Stack

- `HTML`
- `CSS`
- `JavaScript` modular
- `Leaflet`
- `html2canvas`
- `Service Worker` + `manifest` para soporte `PWA`

## Estructura del proyecto

```text
index.html                  # Shell principal de la interfaz
src/js/core/                # Coordinación de mapa, HUD, navegación y estado
src/js/config/              # Configuración de mapas y mortero
src/js/features/            # Dibujo táctico y exportación
src/js/services/            # Tema, compartir, PWA y servicios auxiliares
src/styles/                 # Tokens, layout, componentes y mapa
assets/                     # Branding y mapas activos
vendor/                     # Dependencias locales
```

## Ejecución

Es un proyecto estático. Puedes abrir `index.html` directamente, aunque para probar mejor `PWA`, caché y comportamiento del navegador conviene usar un servidor local.

## Objetivo

Ofrecer una herramienta táctica rápida, clara y visualmente limpia para jugadores de `PUBG` que necesitan calcular tiros de mortero y trabajar sobre mapas interactivos con el menor roce posible.
