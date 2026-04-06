/**
 * ES: Ajustes balísticos simplificados del mortero.
 * EN: Simplified mortar ballistic settings.
 */
export const MORTAR_CONFIG = Object.freeze({
    minRangeMeters: 121,
    maxRangeMeters: 700,
    shellRadiusMeters: 25,
    projectileSpeedMetersPerSecond: 110,
    maxMortarDistanceLimit: 700.0 // Usado en fórmulas
});

const ANGLE_TABLE = Object.freeze([
    { maxDistance: 150, angle: 75 },
    { maxDistance: 200, angle: 70 },
    { maxDistance: 250, angle: 65 },
    { maxDistance: 300, angle: 60 },
    { maxDistance: 400, angle: 55 },
    { maxDistance: 500, angle: 50 },
    { maxDistance: 600, angle: 45 },
    { maxDistance: 700, angle: 40 }
]);

export function isMortarDistanceValid(distanceMeters) {
    return distanceMeters >= MORTAR_CONFIG.minRangeMeters && distanceMeters <= MORTAR_CONFIG.maxRangeMeters;
}

export function getMortarAngle(distanceMeters) {
    if (distanceMeters < MORTAR_CONFIG.minRangeMeters) {
        return null;
    }

    const matchingEntry = ANGLE_TABLE.find(({ maxDistance }) => distanceMeters < maxDistance);
    return matchingEntry?.angle ?? 40;
}

export function getFlightTimeSeconds(distanceMeters) {
    return distanceMeters / MORTAR_CONFIG.projectileSpeedMetersPerSecond;
}

/**
 * Calcula la distancia efectiva requerida en el mortero considerando la diferencia de altura.
 * Inspirado en fórmulas comunitarias de balística para PUBG.
 * @param {number} distanceMeters Distancia 2D real entre mortero y objetivo.
 * @param {number} elevationMeters Diferencia de altura. Valores positivos si el target está arriba.
 * @returns {number|null} Distancia que debe ponerse en el mortero o null si no es físicamente posible.
 */
export function getElevatedDistance(distanceMeters, elevationMeters) {
    const maxMortar = MORTAR_CONFIG.maxMortarDistanceLimit;
    if (elevationMeters === 0 || !elevationMeters) {
        return distanceMeters;
    }
    const tanBeta = elevationMeters / distanceMeters;
    
    // Formula discriminante para caída balística del mortero en PUBG
    const discriminant = Math.pow(maxMortar, 2) - 2 * distanceMeters * maxMortar * tanBeta - Math.pow(distanceMeters, 2);
    
    if (discriminant < 0) {
        return null; // Objetivo inalcanzable por la pendiente
    }
    
    const sqrtTerm = Math.sqrt(discriminant);
    const elevatedDistance = (distanceMeters + tanBeta * (maxMortar - sqrtTerm)) / (Math.pow(tanBeta, 2) + 1);
    
    return elevatedDistance;
}
