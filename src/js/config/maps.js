/**
 * ES: Configuración centralizada de mapas y rutas locales.
 * EN: Centralized map configuration and local asset paths.
 */
export const DEFAULT_MAP_ID = 'erangel';
export const MAP_STORAGE_KEY = 'pubg-mortar:selected-map';

export const MAP_CONFIG = Object.freeze({
    erangel: {
        id: 'erangel',
        label: 'Erangel',
        sizeLabel: '8×8',
        assetPath: './assets/maps/active/erangel-main.png',
        bounds: [[0, 0], [2000, 2000]],
        metersPerUnit: 4,
        description: 'Mapa principal 8×8.'
    },
    miramar: {
        id: 'miramar',
        label: 'Miramar',
        sizeLabel: '8×8',
        assetPath: './assets/maps/active/miramar-main.png',
        bounds: [[0, 0], [2000, 2000]],
        metersPerUnit: 4,
        description: 'Mapa desértico 8×8.'
    },
    vikendi: {
        id: 'vikendi',
        label: 'Vikendi',
        sizeLabel: '6×6',
        assetPath: './assets/maps/active/vikendi-main.png',
        bounds: [[0, 0], [2000, 2000]],
        metersPerUnit: 3,
        description: 'Mapa nevado 6×6.'
    },
    taego: {
        id: 'taego',
        label: 'Taego',
        sizeLabel: '8×8',
        assetPath: './assets/maps/active/taego-main.png',
        bounds: [[0, 0], [2000, 2000]],
        metersPerUnit: 4,
        description: 'Mapa coreano 8×8.'
    },
    deston: {
        id: 'deston',
        label: 'Deston',
        sizeLabel: '8×8',
        assetPath: './assets/maps/active/deston-main.png',
        bounds: [[0, 0], [2000, 2000]],
        metersPerUnit: 4,
        description: 'Mapa urbano 8×8.'
    },
    rondo: {
        id: 'rondo',
        label: 'Rondo',
        sizeLabel: '4×4',
        assetPath: './assets/maps/active/rondo-main.png',
        bounds: [[0, 0], [2000, 2000]],
        metersPerUnit: 2,
        description: 'Mapa compacto 4×4.'
    }
});

export function getAvailableMaps() {
    return Object.values(MAP_CONFIG);
}

export function getMapConfig(mapId) {
    return MAP_CONFIG[mapId] ?? MAP_CONFIG[DEFAULT_MAP_ID];
}

export function isValidMapId(mapId) {
    return Object.prototype.hasOwnProperty.call(MAP_CONFIG, mapId);
}
