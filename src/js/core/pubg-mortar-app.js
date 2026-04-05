/**
 * ES: Núcleo de la aplicación. Coordina mapa, HUD, modos y paneles.
 * EN: Application core. Coordinates map, HUD, modes, and panels.
 */
import { DEFAULT_MAP_ID, MAP_STORAGE_KEY, getAvailableMaps, getMapConfig, isValidMapId } from '../config/maps.js';
import {
    MORTAR_CONFIG,
    getFlightTimeSeconds,
    getMortarAngle,
    isMortarDistanceValid
} from '../config/mortar.js';
import { exportMapSnapshot } from '../features/export-service.js';
import { DrawingManager } from '../features/drawing-manager.js';
import { setupInstallPrompt } from '../services/pwa-service.js';
import { shareApp } from '../services/share-service.js';
import { THEMES, applyTheme, getSavedTheme, toggleTheme } from '../services/theme-service.js';
import { loadVisitorCount } from '../services/visitor-counter-service.js';

const APP_TITLE = 'PUBG Mortar Tactical Map';
const DEFAULT_STATUS = 'Listo para una nueva medición.';
const HUD_COLLAPSED_STORAGE_KEY = 'pubg-mortar-hud-collapsed';

function getInitialAppState(search) {
    const params = new URLSearchParams(search);
    const initialMapId = params.get('map');
    const initialTheme = params.get('theme');
    const initialMode = params.get('mode');

    return {
        mapId: isValidMapId(initialMapId) ? initialMapId : null,
        theme: initialTheme === THEMES.light || initialTheme === THEMES.dark ? initialTheme : null,
        isMortarMode: initialMode === 'mortar' ? true : initialMode === 'distance' ? false : null
    };
}

function createMarkerIcon(type, content = '', { size = 40 } = {}) {
    const offset = Math.round(size / 2);

    return L.divIcon({
        className: 'marker-icon-wrapper',
        html: `<span class="map-marker map-marker--${type}">${content}</span>`,
        iconSize: [size, size],
        iconAnchor: [offset, offset],
        popupAnchor: [0, -offset]
    });
}

const MARKER_ICONS = Object.freeze({
    mortar: createMarkerIcon('mortar', '🎯'),
    target: createMarkerIcon('target', '💥'),
    point: createMarkerIcon('point', '', { size: 18 })
});

export class PubgMortarApp {
    constructor({ document, window }) {
        this.document = document;
        this.window = window;
        this.initialState = getInitialAppState(window.location.search);
        this.currentTheme = THEMES.dark;
        this.installPromptCleanup = () => {};
        this.handleViewportChange = () => this.syncResponsiveChrome();
        this.hasExplicitHudPreference = false;
        this.isCompactLayout = false;
        this.isHudCollapsed = false;
        this.isTopbarControlsOpen = true;
        this.map = null;
        this.mapLayer = null;
        this.currentMapId = DEFAULT_MAP_ID;
        this.isMortarMode = false;
        this.measurementPoints = [];
        this.measurementMarkers = [];
        this.measurementLine = null;
        this.mortarRangeLayers = [];

        this.elements = this.getRequiredElements();
    }

    async initialize() {
        this.createMap();
        this.populateMapSelector();
        this.bindInterfaceEvents();
        this.initializeDrawingManager();
        this.initializeResponsiveInterface();
        this.initializeTheme();
        this.restoreInitialMap();

        if (this.initialState.isMortarMode !== null) {
            this.setMortarMode(this.initialState.isMortarMode, { silent: true });
        }

        this.initializeInstallPrompt();
        this.syncUrlState();
        this.updateHud();
        await loadVisitorCount(this.elements.visitorCount);
        this.showStatus('Aplicación cargada con assets locales, compartir rápido y soporte PWA.', 'success');
    }


    getRequiredElements() {
        return {
            root: this.document.documentElement,
            topbar: this.document.getElementById('topbar'),
            topbarControls: this.document.getElementById('topbarControls'),
            toggleTopbarButton: this.document.getElementById('toggleTopbarButton'),
            themeColorMeta: this.document.querySelector('meta[name="theme-color"]'),
            mapContainer: this.document.getElementById('map'),
            mapSelect: this.document.getElementById('mapSelect'),
            interactionModeToggle: this.document.getElementById('interactionModeToggle'),
            modeLabel: this.document.getElementById('modeLabel'),
            themeToggle: this.document.getElementById('themeToggle'),
            themeLabel: this.document.getElementById('themeLabel'),
            themeIcon: this.document.getElementById('themeIcon'),
            statusMessage: this.document.getElementById('statusMessage'),
            hudPanel: this.document.getElementById('hudPanel'),
            hudPanelGrid: this.document.getElementById('hudPanelGrid'),
            toggleHudButton: this.document.getElementById('toggleHudButton'),
            collapseHudButton: this.document.getElementById('collapseHudButton'),
            distanceValue: this.document.getElementById('distanceValue'),
            angleValue: this.document.getElementById('angleValue'),
            flightTimeValue: this.document.getElementById('flightTimeValue'),
            shellRadiusValue: this.document.getElementById('shellRadiusValue'),
            pointsValue: this.document.getElementById('pointsValue'),
            rangeStatusValue: this.document.getElementById('rangeStatusValue'),
            visitorCount: this.document.getElementById('visitorCount'),
            toggleDrawPanelButton: this.document.getElementById('toggleDrawPanelButton'),
            shareAppButton: this.document.getElementById('shareAppButton'),
            exportMapButton: this.document.getElementById('exportMapButton'),
            installAppButton: this.document.getElementById('installAppButton'),
            resetMeasurementButton: this.document.getElementById('resetMeasurementButton'),
            clearMeasurementButton: this.document.getElementById('clearMeasurementButton'),
            showHelpButton: this.document.getElementById('showHelpButton'),
            mobileMenuButton: this.document.getElementById('mobileMenuButton'),
            mobileDrawButton: this.document.getElementById('mobileDrawButton'),
            mobileHudButton: this.document.getElementById('mobileHudButton'),
            mobileShareButton: this.document.getElementById('mobileShareButton'),
            mobileHelpButton: this.document.getElementById('mobileHelpButton'),
            helpModal: this.document.getElementById('helpModal'),
            closeHelpButton: this.document.getElementById('closeHelpButton'),
            drawPanel: this.document.getElementById('drawPanel'),
            closeDrawPanelButton: this.document.getElementById('closeDrawPanelButton'),
            drawToolButtons: [...this.document.querySelectorAll('[data-tool]')],
            colorButtons: [...this.document.querySelectorAll('[data-color]')],
            textToolSection: this.document.getElementById('textToolSection'),
            textInput: this.document.getElementById('textInput'),
            addTextButton: this.document.getElementById('addTextButton'),
            clearDrawingsButton: this.document.getElementById('clearDrawingsButton')
        };
    }


    createMap() {
        this.map = L.map(this.elements.mapContainer, {
            crs: L.CRS.Simple,
            minZoom: 0,
            maxZoom: 4,
            zoom: 1,
            center: [1000, 1000],
            preferCanvas: true,
            attributionControl: false
        });

        this.map.on('click', (event) => this.handleMapClick(event));
        this.map.on('mousedown', (event) => this.drawingManager?.handlePointerDown(event));
        this.map.on('mousemove', (event) => this.drawingManager?.handlePointerMove(event));
        this.map.on('mouseup', () => this.drawingManager?.handlePointerUp());
        this.map.on('touchstart', (event) => this.drawingManager?.handlePointerDown(event));
        this.map.on('touchmove', (event) => this.drawingManager?.handlePointerMove(event));
        this.map.on('touchend', () => this.drawingManager?.handlePointerUp());
    }

    populateMapSelector() {
        const fragment = this.document.createDocumentFragment();

        getAvailableMaps().forEach((mapConfig) => {
            const option = this.document.createElement('option');
            option.value = mapConfig.id;
            option.textContent = `${mapConfig.label} (${mapConfig.sizeLabel})`;
            fragment.appendChild(option);
        });

        this.elements.mapSelect.innerHTML = '';
        this.elements.mapSelect.appendChild(fragment);
    }

    bindInterfaceEvents() {
        this.elements.mapSelect.addEventListener('change', () => this.loadMap(this.elements.mapSelect.value));
        this.elements.interactionModeToggle.addEventListener('change', () => this.setMortarMode(this.elements.interactionModeToggle.checked));
        this.elements.themeToggle.addEventListener('change', () => {
            const theme = toggleTheme(this.elements.themeToggle.checked, {
                root: this.elements.root,
                toggle: this.elements.themeToggle,
                icon: this.elements.themeIcon,
                label: this.elements.themeLabel,
                themeColorMeta: this.elements.themeColorMeta
            });

            this.currentTheme = theme;
            this.syncUrlState();
            this.showStatus(`Tema ${theme === THEMES.light ? 'claro' : 'oscuro'} activado.`, 'info');
        });
        this.elements.toggleTopbarButton.addEventListener('click', () => this.toggleTopbarControls());
        this.elements.toggleHudButton.addEventListener('click', () => this.toggleHudCollapsed());
        this.elements.collapseHudButton.addEventListener('click', () => this.toggleHudCollapsed());
        this.elements.shareAppButton.addEventListener('click', () => this.shareCurrentApp());
        this.elements.exportMapButton.addEventListener('click', () => this.exportCurrentView());
        this.elements.resetMeasurementButton.addEventListener('click', () => this.resetMeasurement());
        this.elements.clearMeasurementButton.addEventListener('click', () => this.clearMeasurement({ includeFit: false }));
        this.elements.showHelpButton.addEventListener('click', () => this.toggleHelpModal(true));
        this.elements.mobileMenuButton.addEventListener('click', () => this.toggleTopbarControls());
        this.elements.mobileDrawButton.addEventListener('click', () => this.drawingManager?.togglePanel());
        this.elements.mobileHudButton.addEventListener('click', () => this.toggleHudCollapsed());
        this.elements.mobileShareButton.addEventListener('click', () => this.shareCurrentApp());
        this.elements.mobileHelpButton.addEventListener('click', () => this.toggleHelpModal(true));
        this.elements.closeHelpButton.addEventListener('click', () => this.toggleHelpModal(false));
        this.elements.helpModal.addEventListener('click', (event) => {
            if (event.target === this.elements.helpModal) {
                this.toggleHelpModal(false);
            }
        });
        this.document.addEventListener('keydown', (event) => this.handleKeyboardShortcuts(event));
        this.document.addEventListener('mouseup', () => this.drawingManager?.handlePointerUp());
        this.document.addEventListener('touchend', () => this.drawingManager?.handlePointerUp(), { passive: true });
        this.window.addEventListener('resize', this.handleViewportChange);
    }

    initializeDrawingManager() {
        this.drawingManager = new DrawingManager({
            map: this.map,
            elements: {
                panel: this.elements.drawPanel,
                toggleButton: this.elements.toggleDrawPanelButton,
                closeButton: this.elements.closeDrawPanelButton,
                clearButton: this.elements.clearDrawingsButton,
                toolButtons: this.elements.drawToolButtons,
                colorButtons: this.elements.colorButtons,
                textSection: this.elements.textToolSection,
                textInput: this.elements.textInput,
                addTextButton: this.elements.addTextButton
            },
            getDistanceInMeters: (start, end) => this.calculateDistanceBetweenLatLngs(start, end),
            onStatusChange: (message, tone) => this.showStatus(message, tone),
            onPanelVisibilityChange: (isOpen) => {
                this.setMapInteractionsEnabled(!isOpen);
                this.syncDrawingTriggerState(isOpen);
            }
        });

        this.drawingManager.initialize();
        this.syncDrawingTriggerState(false);
    }


    initializeTheme() {
        this.currentTheme = applyTheme(this.initialState.theme ?? getSavedTheme(), {
            root: this.elements.root,
            toggle: this.elements.themeToggle,
            icon: this.elements.themeIcon,
            label: this.elements.themeLabel,
            themeColorMeta: this.elements.themeColorMeta
        });
    }

    initializeInstallPrompt() {
        this.installPromptCleanup = setupInstallPrompt({
            window: this.window,
            button: this.elements.installAppButton,
            onStatusChange: (message, tone) => this.showStatus(message, tone)
        });
    }

    initializeResponsiveInterface() {
        const savedHudPreference = this.window.localStorage.getItem(HUD_COLLAPSED_STORAGE_KEY);
        this.hasExplicitHudPreference = savedHudPreference === 'true' || savedHudPreference === 'false';

        if (this.hasExplicitHudPreference) {
            this.setHudCollapsed(savedHudPreference === 'true', { persist: false });
        } else {
            this.setHudCollapsed(this.window.matchMedia('(max-width: 640px)').matches, { persist: false });
        }

        this.syncResponsiveChrome({ force: true });
    }

    syncResponsiveChrome({ force = false } = {}) {
        const isCompactLayout = this.window.matchMedia('(max-width: 900px)').matches;
        const isNarrowHudLayout = this.window.matchMedia('(max-width: 640px)').matches;
        const compactLayoutChanged = force || isCompactLayout !== this.isCompactLayout;

        this.isCompactLayout = isCompactLayout;

        if (compactLayoutChanged || !isCompactLayout) {
            this.setTopbarControlsOpen(!isCompactLayout);
        }

        if (!this.hasExplicitHudPreference) {
            this.setHudCollapsed(isNarrowHudLayout, { persist: false });
            return;
        }

        this.syncHudUiState();
    }

    toggleTopbarControls() {
        this.setTopbarControlsOpen(!this.isTopbarControlsOpen);
    }

    setTopbarControlsOpen(isOpen) {
        const shouldOpen = this.isCompactLayout ? isOpen : true;

        this.isTopbarControlsOpen = shouldOpen;
        this.elements.topbar.classList.toggle('is-controls-open', this.isCompactLayout && shouldOpen);
        this.elements.topbarControls.hidden = this.isCompactLayout ? !shouldOpen : false;
        this.elements.toggleTopbarButton.textContent = shouldOpen ? '✕' : '☰';
        this.elements.toggleTopbarButton.setAttribute('aria-label', shouldOpen ? 'Cerrar controles' : 'Mostrar controles');
        this.elements.toggleTopbarButton.setAttribute('aria-expanded', String(shouldOpen));
        this.elements.mobileMenuButton.textContent = shouldOpen ? 'Cerrar' : 'Menú';
        this.elements.mobileMenuButton.setAttribute('aria-label', shouldOpen ? 'Cerrar controles' : 'Abrir controles');
        this.elements.mobileMenuButton.setAttribute('aria-expanded', String(shouldOpen));
        this.elements.mobileMenuButton.classList.toggle('is-active', shouldOpen);
    }

    toggleHudCollapsed() {
        this.setHudCollapsed(!this.isHudCollapsed);
    }

    setHudCollapsed(isCollapsed, { persist = true } = {}) {
        this.isHudCollapsed = isCollapsed;
        this.elements.hudPanel.classList.toggle('is-collapsed', isCollapsed);
        this.elements.hudPanelGrid.hidden = isCollapsed;

        if (persist) {
            this.window.localStorage.setItem(HUD_COLLAPSED_STORAGE_KEY, String(isCollapsed));
            this.hasExplicitHudPreference = true;
        }

        this.syncHudUiState();
    }

    syncHudUiState() {
        const isExpanded = !this.isHudCollapsed;
        const buttonLabel = isExpanded ? 'Ocultar HUD' : 'Mostrar HUD';

        this.elements.collapseHudButton.textContent = isExpanded ? '▾' : '▴';
        this.elements.collapseHudButton.setAttribute('aria-label', buttonLabel);
        this.elements.collapseHudButton.setAttribute('aria-expanded', String(isExpanded));

        this.elements.toggleHudButton.setAttribute('aria-label', buttonLabel);
        this.elements.toggleHudButton.setAttribute('aria-expanded', String(isExpanded));
        this.elements.toggleHudButton.classList.toggle('is-active', isExpanded);

        this.elements.mobileHudButton.setAttribute('aria-label', buttonLabel);
        this.elements.mobileHudButton.setAttribute('aria-expanded', String(isExpanded));
        this.elements.mobileHudButton.classList.toggle('is-active', isExpanded);
    }

    syncDrawingTriggerState(isOpen) {
        this.elements.mobileDrawButton.setAttribute('aria-pressed', String(isOpen));
        this.elements.mobileDrawButton.classList.toggle('is-active', isOpen);
    }

    restoreInitialMap() {
        const savedMapId = localStorage.getItem(MAP_STORAGE_KEY);
        const initialMapId = this.initialState.mapId ?? (isValidMapId(savedMapId) ? savedMapId : DEFAULT_MAP_ID);
        this.loadMap(initialMapId, { silent: true });
    }


    loadMap(mapId, { silent = false } = {}) {
        const mapConfig = getMapConfig(mapId);

        if (this.mapLayer) {
            this.map.removeLayer(this.mapLayer);
        }

        this.mapLayer = L.imageOverlay(mapConfig.assetPath, mapConfig.bounds, {
            interactive: false,
            zIndex: 1
        }).addTo(this.map);

        this.currentMapId = mapConfig.id;
        this.elements.mapSelect.value = mapConfig.id;
        localStorage.setItem(MAP_STORAGE_KEY, mapConfig.id);
        this.clearMeasurement({ includeFit: false, silent: true });
        this.drawingManager?.clear();
        this.map.setMaxBounds(mapConfig.bounds);
        this.map.fitBounds(mapConfig.bounds, { padding: [20, 20] });
        this.syncUrlState();

        if (!silent) {
            this.showStatus(`Mapa cargado: ${mapConfig.label}.`, 'success');
        }
    }

    handleMapClick(event) {
        if (this.drawingManager?.handleMapClick(event)) {
            return;
        }

        if (this.isMortarMode) {
            this.handleMortarClick(event.latlng);
            return;
        }

        this.handleDistanceClick(event.latlng);
    }

    handleDistanceClick(latlng) {
        if (this.measurementPoints.length >= 2) {
            this.showStatus('Ya existen dos puntos. Limpia o reinicia para medir otra vez.', 'warning');
            return;
        }

        this.addMeasurementPoint(latlng, 'point');

        if (this.measurementPoints.length === 2) {
            const distanceMeters = this.calculateMeasurementDistance();
            this.renderDistanceLine(distanceMeters);
            this.updateHud(distanceMeters);
            this.showStatus(`Distancia calculada: ${distanceMeters} m.`, 'success');
        } else {
            this.updateHud();
            this.showStatus('Punto inicial registrado.', 'info');
        }
    }

    handleMortarClick(latlng) {
        if (this.measurementPoints.length >= 2) {
            this.showStatus('Ya existen dos puntos. Limpia o reinicia para recalcular.', 'warning');
            return;
        }

        const pointType = this.measurementPoints.length === 0 ? 'mortar' : 'target';
        this.addMeasurementPoint(latlng, pointType);

        if (pointType === 'mortar') {
            this.renderMortarRange(latlng);
            this.updateHud();
            this.showStatus('Posición del mortero fijada.', 'info');
            return;
        }

        const distanceMeters = this.calculateMeasurementDistance();
        this.renderMortarLine(distanceMeters);
        this.updateHud(distanceMeters);

        const isValidShot = isMortarDistanceValid(distanceMeters);
        this.showStatus(
            isValidShot
                ? `Objetivo válido a ${distanceMeters} m.`
                : `Objetivo fuera de rango a ${distanceMeters} m.`,
            isValidShot ? 'success' : 'warning'
        );
    }

    addMeasurementPoint(latlng, type) {
        const marker = L.marker(latlng, { icon: MARKER_ICONS[type] }).addTo(this.map);
        this.measurementMarkers.push(marker);
        this.measurementPoints.push({ lat: latlng.lat, lng: latlng.lng, type });
        this.updateHud();
    }

    calculateMeasurementDistance() {
        if (this.measurementPoints.length < 2) {
            return 0;
        }

        return this.calculateDistanceBetweenLatLngs(this.measurementPoints[0], this.measurementPoints[1]);
    }

    calculateDistanceBetweenLatLngs(start, end) {
        const deltaX = end.lng - start.lng;
        const deltaY = end.lat - start.lat;
        const mapUnits = Math.hypot(deltaX, deltaY);
        return Math.round(mapUnits * getMapConfig(this.currentMapId).metersPerUnit);
    }

    renderDistanceLine(distanceMeters) {
        this.removeMeasurementLine();

        this.measurementLine = L.polyline(this.measurementPoints.map((point) => [point.lat, point.lng]), {
            color: '#ff6b6b',
            weight: 3,
            dashArray: '10 8',
            opacity: 0.95
        }).addTo(this.map);

        this.measurementLine.bindPopup(`<strong>Distancia:</strong> ${distanceMeters} m`).openPopup();
        this.map.fitBounds(this.measurementLine.getBounds(), { padding: [80, 80] });
    }

    renderMortarLine(distanceMeters) {
        this.removeMeasurementLine();

        const validShot = isMortarDistanceValid(distanceMeters);
        const angle = getMortarAngle(distanceMeters);
        const flightTime = getFlightTimeSeconds(distanceMeters).toFixed(1);

        this.measurementLine = L.polyline(this.measurementPoints.map((point) => [point.lat, point.lng]), {
            color: validShot ? '#00c853' : '#ff922b',
            weight: 4,
            dashArray: '14 10',
            opacity: 0.95
        }).addTo(this.map);

        this.measurementLine.bindPopup(
            `<strong>Distancia:</strong> ${distanceMeters} m<br>` +
            `<strong>Ángulo:</strong> ${angle ? `${angle}°` : '--'}<br>` +
            `<strong>Tiempo:</strong> ${flightTime} s<br>` +
            `<strong>Estado:</strong> ${validShot ? 'Dentro de alcance' : 'Fuera de alcance'}`
        ).openPopup();

        this.map.fitBounds(this.measurementLine.getBounds(), { padding: [80, 80] });
    }

    renderMortarRange(latlng) {
        this.clearMortarRange();

        const metersPerUnit = getMapConfig(this.currentMapId).metersPerUnit;
        const minRadius = MORTAR_CONFIG.minRangeMeters / metersPerUnit;
        const maxRadius = MORTAR_CONFIG.maxRangeMeters / metersPerUnit;

        const minRangeCircle = L.circle(latlng, {
            radius: minRadius,
            color: '#ff6b6b',
            fillColor: '#ff6b6b',
            fillOpacity: 0.12,
            weight: 2
        }).addTo(this.map);

        const maxRangeCircle = L.circle(latlng, {
            radius: maxRadius,
            color: '#00c853',
            fillColor: '#00c853',
            fillOpacity: 0.08,
            weight: 2
        }).addTo(this.map);

        this.mortarRangeLayers = [minRangeCircle, maxRangeCircle];
    }

    setMortarMode(isEnabled, { silent = false } = {}) {
        this.isMortarMode = isEnabled;
        this.elements.interactionModeToggle.checked = isEnabled;
        this.elements.modeLabel.textContent = isEnabled ? 'Mortero' : 'Distancia';
        this.clearMeasurement({ includeFit: false, silent: true });
        this.syncUrlState();

        if (!silent) {
            this.showStatus(
                isEnabled ? 'Modo mortero activado.' : 'Modo distancia activado.',
                'info'
            );
        }
    }

    resetMeasurement() {
        this.clearMeasurement({ includeFit: true });
        this.showStatus('Medición reiniciada y vista restaurada.', 'info');
    }

    clearMeasurement({ includeFit = false, silent = false } = {}) {
        this.measurementMarkers.forEach((marker) => this.map.removeLayer(marker));
        this.measurementMarkers = [];
        this.measurementPoints = [];
        this.removeMeasurementLine();
        this.clearMortarRange();
        this.updateHud();

        if (includeFit) {
            this.map.fitBounds(getMapConfig(this.currentMapId).bounds, { padding: [20, 20] });
        }

        if (!silent) {
            this.showStatus(DEFAULT_STATUS, 'info');
        }
    }

    removeMeasurementLine() {
        if (this.measurementLine) {
            this.map.removeLayer(this.measurementLine);
            this.measurementLine = null;
        }
    }

    clearMortarRange() {
        this.mortarRangeLayers.forEach((layer) => this.map.removeLayer(layer));
        this.mortarRangeLayers = [];
    }

    updateHud(distanceMeters = this.calculateMeasurementDistance()) {
        const shouldShowMortarData = this.isMortarMode && distanceMeters > 0;
        const angle = shouldShowMortarData ? getMortarAngle(distanceMeters) : null;
        const flightTime = shouldShowMortarData ? `${getFlightTimeSeconds(distanceMeters).toFixed(1)} s` : '-- s';
        const rangeStatus = !distanceMeters
            ? 'Esperando'
            : this.isMortarMode
                ? (isMortarDistanceValid(distanceMeters) ? 'Dentro de alcance' : 'Fuera de alcance')
                : 'Medición lista';

        this.elements.distanceValue.textContent = `${String(distanceMeters || 0).padStart(4, '0')} m`;
        this.elements.angleValue.textContent = angle ? `${angle}°` : '--°';
        this.elements.flightTimeValue.textContent = flightTime;
        this.elements.shellRadiusValue.textContent = `${MORTAR_CONFIG.shellRadiusMeters} m`;
        this.elements.pointsValue.textContent = `${this.measurementPoints.length}/2`;
        this.elements.rangeStatusValue.textContent = rangeStatus;
    }

    getShareUrl() {
        const shareUrl = new URL(this.window.location.href);
        shareUrl.searchParams.set('map', this.currentMapId);
        shareUrl.searchParams.set('mode', this.isMortarMode ? 'mortar' : 'distance');
        shareUrl.searchParams.set('theme', this.currentTheme);
        return shareUrl.toString();
    }

    syncUrlState() {
        const nextUrl = this.getShareUrl();
        this.window.history.replaceState({}, '', nextUrl);
        return nextUrl;
    }

    async shareCurrentApp() {
        const mapConfig = getMapConfig(this.currentMapId);

        try {
            const result = await shareApp({
                window: this.window,
                document: this.document,
                title: APP_TITLE,
                text: `Mapa ${mapConfig.label} en modo ${this.isMortarMode ? 'mortero' : 'distancia'}.`,
                url: this.getShareUrl()
            });

            if (result.method === 'native') {
                this.showStatus('Contenido compartido correctamente.', 'success');
                return;
            }

            this.showStatus('Enlace copiado al portapapeles.', 'success');
        } catch (error) {
            if (error?.name === 'AbortError') {
                this.showStatus('Acción de compartir cancelada.', 'info');
                return;
            }

            this.showStatus('No fue posible compartir la aplicación.', 'error');
        }
    }

    async exportCurrentView() {
        const workspaceElement = this.document.querySelector('.workspace');

        try {
            await exportMapSnapshot({
                element: workspaceElement,
                fileNamePrefix: `${this.currentMapId}-mortar-view`,
                onStatusChange: (message, tone) => this.showStatus(message, tone)
            });
        } catch (error) {
            this.showStatus('No fue posible exportar la vista actual.', 'error');
        }
    }

    setMapInteractionsEnabled(isEnabled) {
        const methods = ['dragging', 'touchZoom', 'doubleClickZoom', 'scrollWheelZoom', 'boxZoom', 'keyboard'];

        methods.forEach((method) => {
            if (!this.map[method]) {
                return;
            }

            if (isEnabled) {
                this.map[method].enable();
            } else {
                this.map[method].disable();
            }
        });

        this.map.getContainer().classList.toggle('is-drawing-mode', !isEnabled);
    }

    toggleHelpModal(forceState) {
        const shouldOpen = typeof forceState === 'boolean'
            ? forceState
            : !this.elements.helpModal.classList.contains('is-open');

        this.elements.helpModal.classList.toggle('is-open', shouldOpen);
        this.elements.helpModal.setAttribute('aria-hidden', String(!shouldOpen));
    }

    handleKeyboardShortcuts(event) {
        const tagName = event.target.tagName;
        if (tagName === 'INPUT' || tagName === 'SELECT' || tagName === 'TEXTAREA') {
            if (event.key === 'Escape') {
                event.target.blur();
            }
            return;
        }

        switch (event.key.toLowerCase()) {
            case 'r':
                this.resetMeasurement();
                break;
            case 'c':
                this.clearMeasurement({ includeFit: false });
                break;
            case 'd':
                this.drawingManager.togglePanel();
                break;
            case 'h':
                this.toggleHelpModal(true);
                break;
            case 'm':
                this.setMortarMode(!this.isMortarMode);
                break;
            case 's':
                this.shareCurrentApp();
                break;
            case 'i':
                if (!this.elements.installAppButton.hidden) {
                    this.elements.installAppButton.click();
                }
                break;
            case 'e':
                this.exportCurrentView();
                break;
            case 'escape':
                this.toggleHelpModal(false);
                this.drawingManager.togglePanel(false);
                break;
            default:
                break;
        }
    }

    showStatus(message, tone = 'info') {
        this.elements.statusMessage.textContent = message;
        this.elements.statusMessage.className = `status-bar status-bar--${tone}`;
    }
}
