/**
 * ES: Gestor aislado del panel y de las capas de dibujo.
 * EN: Isolated manager for the drawing panel and drawing layers.
 */
const DEFAULT_TOOL = 'freehand';
const DEFAULT_COLOR = '#ff4d4f';
const SHAPE_TOOLS = new Set(['freehand', 'line', 'circle', 'rectangle']);

export class DrawingManager {
    constructor({ map, elements, getDistanceInMeters, onStatusChange, onPanelVisibilityChange }) {
        this.map = map;
        this.elements = elements;
        this.getDistanceInMeters = getDistanceInMeters;
        this.onStatusChange = onStatusChange;
        this.onPanelVisibilityChange = onPanelVisibilityChange;

        this.isPanelOpen = false;
        this.currentTool = DEFAULT_TOOL;
        this.currentColor = DEFAULT_COLOR;
        this.isPointerDown = false;
        this.dragStartLatLng = null;
        this.previewLayer = null;
        this.freehandLatLngs = [];
        this.pendingTextLatLng = null;
        this.layers = new Set();
        this.previouslyFocusedElement = null;
    }


    initialize() {
        this.bindPanelEvents();
        this.syncPanelState(false);
        this.syncToolState();
        this.syncColorState();
    }

    bindPanelEvents() {
        this.elements.toggleButton.addEventListener('click', () => this.togglePanel());
        this.elements.closeButton.addEventListener('click', () => this.togglePanel(false));
        this.elements.clearButton.addEventListener('click', () => {
            this.clear();
            this.onStatusChange('Todos los dibujos fueron eliminados.', 'info');
        });

        this.elements.toolButtons.forEach((button) => {
            button.addEventListener('click', () => this.setTool(button.dataset.tool));
        });

        this.elements.colorButtons.forEach((button) => {
            button.addEventListener('click', () => this.setColor(button.dataset.color));
        });

        this.elements.addTextButton.addEventListener('click', () => {
            if (!this.pendingTextLatLng) {
                this.onStatusChange('Haz clic en el mapa para posicionar el texto.', 'warning');
                return;
            }

            this.addTextAt(this.pendingTextLatLng);
        });
    }

    togglePanel(forceState) {
        const nextState = typeof forceState === 'boolean' ? forceState : !this.isPanelOpen;
        this.syncPanelState(nextState);
    }

    syncPanelState(isOpen) {
        if (isOpen) {
            this.previouslyFocusedElement = document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null;
        }

        this.isPanelOpen = isOpen;
        this.elements.panel.classList.toggle('is-open', isOpen);
        this.elements.panel.setAttribute('aria-hidden', String(!isOpen));
        this.elements.toggleButton.setAttribute('aria-pressed', String(isOpen));
        this.onPanelVisibilityChange(isOpen);

        if (isOpen) {
            requestAnimationFrame(() => {
                const activeToolButton = this.elements.toolButtons.find((button) => button.dataset.tool === this.currentTool);
                (this.elements.closeButton || activeToolButton || this.elements.toggleButton)?.focus();
            });
            return;
        }

        this.resetInteractionState();

        const focusTarget = this.previouslyFocusedElement && typeof this.previouslyFocusedElement.focus === 'function'
            ? this.previouslyFocusedElement
            : this.elements.toggleButton;
        focusTarget?.focus();
    }


    setTool(tool) {
        this.currentTool = tool || DEFAULT_TOOL;
        this.pendingTextLatLng = null;
        this.syncToolState();

        const toolLabels = {
            freehand: 'trazado libre',
            line: 'línea',
            circle: 'círculo',
            rectangle: 'rectángulo',
            text: 'texto',
            eraser: 'borrador'
        };

        this.onStatusChange(`Herramienta activa: ${toolLabels[this.currentTool]}.`, 'info');
    }

    setColor(color) {
        this.currentColor = color || DEFAULT_COLOR;
        this.syncColorState();
    }

    syncToolState() {
        this.elements.toolButtons.forEach((button) => {
            button.classList.toggle('is-active', button.dataset.tool === this.currentTool);
        });

        const shouldShowTextSection = this.currentTool === 'text';
        this.elements.textSection.hidden = !shouldShowTextSection;
    }

    syncColorState() {
        this.elements.colorButtons.forEach((button) => {
            button.classList.toggle('is-active', button.dataset.color === this.currentColor);
        });
    }

    handlePointerDown(event) {
        if (!this.isPanelOpen || !SHAPE_TOOLS.has(this.currentTool)) {
            return false;
        }

        if (event.originalEvent?.button !== undefined && event.originalEvent.button !== 0) {
            return false;
        }

        this.isPointerDown = true;
        this.dragStartLatLng = event.latlng;
        this.freehandLatLngs = [event.latlng];

        if (this.currentTool === 'freehand') {
            this.previewLayer = this.createLineLayer(this.freehandLatLngs, false).addTo(this.map);
        }

        return true;
    }

    handlePointerMove(event) {
        if (!this.isPanelOpen || !this.isPointerDown || !this.dragStartLatLng) {
            return false;
        }

        if (this.previewLayer) {
            this.map.removeLayer(this.previewLayer);
            this.previewLayer = null;
        }

        if (this.currentTool === 'freehand') {
            this.freehandLatLngs.push(event.latlng);
            this.previewLayer = this.createLineLayer(this.freehandLatLngs, false).addTo(this.map);
            return true;
        }

        if (this.currentTool === 'line') {
            this.previewLayer = this.createLineLayer([this.dragStartLatLng, event.latlng], true).addTo(this.map);
            return true;
        }

        if (this.currentTool === 'circle') {
            const radiusInMeters = this.getDistanceInMeters(this.dragStartLatLng, event.latlng);
            const radiusInMapUnits = radiusInMeters / this.getMetersPerUnit();
            this.previewLayer = L.circle(this.dragStartLatLng, {
                radius: radiusInMapUnits,
                ...this.getShapeOptions(true)
            }).addTo(this.map);
            return true;
        }

        if (this.currentTool === 'rectangle') {
            this.previewLayer = L.rectangle([
                [this.dragStartLatLng.lat, this.dragStartLatLng.lng],
                [event.latlng.lat, event.latlng.lng]
            ], this.getShapeOptions(true)).addTo(this.map);
            return true;
        }

        return false;
    }

    handlePointerUp() {
        if (!this.isPanelOpen || !this.isPointerDown) {
            return false;
        }

        this.isPointerDown = false;

        if (this.previewLayer) {
            this.registerLayer(this.previewLayer);
            this.previewLayer = null;
        }

        this.dragStartLatLng = null;
        this.freehandLatLngs = [];
        return true;
    }

    handleMapClick(event) {
        if (!this.isPanelOpen) {
            return false;
        }

        if (this.currentTool === 'text') {
            this.pendingTextLatLng = event.latlng;
            this.addTextAt(event.latlng);
            return true;
        }

        if (this.currentTool === 'eraser') {
            this.onStatusChange('Haz clic sobre un dibujo para eliminarlo.', 'info');
            return true;
        }

        return SHAPE_TOOLS.has(this.currentTool);
    }

    addTextAt(latlng) {
        const rawText = this.elements.textInput.value.trim();
        if (!rawText) {
            this.onStatusChange('Escribe un texto antes de colocarlo en el mapa.', 'warning');
            this.elements.textInput.focus();
            return;
        }

        const safeText = escapeHtml(rawText);
        const textMarker = L.marker(latlng, {
            keyboard: false,
            icon: L.divIcon({
                className: 'drawing-text-icon',
                html: `<div class="drawing-text-label" style="--drawing-color:${this.currentColor}">${safeText}</div>`
            })
        });

        textMarker.addTo(this.map);
        this.registerLayer(textMarker);
        this.pendingTextLatLng = null;
        this.elements.textInput.value = '';
        this.onStatusChange('Texto añadido al mapa.', 'success');
    }

    clear() {
        this.layers.forEach((layer) => {
            if (this.map.hasLayer(layer)) {
                this.map.removeLayer(layer);
            }
        });

        this.layers.clear();
        this.resetInteractionState();
    }

    registerLayer(layer) {
        this.layers.add(layer);
        layer.on('click', () => {
            if (!this.isPanelOpen || this.currentTool !== 'eraser') {
                return;
            }

            this.removeLayer(layer);
            this.onStatusChange('Dibujo eliminado.', 'success');
        });
    }

    removeLayer(layer) {
        if (this.map.hasLayer(layer)) {
            this.map.removeLayer(layer);
        }

        this.layers.delete(layer);
    }

    resetInteractionState() {
        this.isPointerDown = false;
        this.dragStartLatLng = null;
        this.pendingTextLatLng = null;
        this.freehandLatLngs = [];

        if (this.previewLayer && this.map.hasLayer(this.previewLayer)) {
            this.map.removeLayer(this.previewLayer);
        }

        this.previewLayer = null;
    }

    getMetersPerUnit() {
        return this.getDistanceInMeters({ lat: 0, lng: 0 }, { lat: 0, lng: 1 }) || 1;
    }

    createLineLayer(latlngs, dashed) {
        return L.polyline(latlngs, {
            color: this.currentColor,
            weight: 3,
            opacity: 0.95,
            lineCap: 'round',
            lineJoin: 'round',
            dashArray: dashed ? '8 8' : undefined
        });
    }

    getShapeOptions(fill) {
        return {
            color: this.currentColor,
            weight: 2,
            opacity: 0.95,
            fill: fill,
            fillColor: this.currentColor,
            fillOpacity: fill ? 0.18 : 0
        };
    }
}

function escapeHtml(value) {
    const temporaryElement = document.createElement('div');
    temporaryElement.textContent = value;
    return temporaryElement.innerHTML;
}
