/**
 * ES: Ajustes balísticos simplificados del mortero.
 * EN: Simplified mortar ballistic settings.
 */
export const MORTAR_CONFIG = Object.freeze({
    minRangeMeters: 100,
    maxRangeMeters: 800,
    shellRadiusMeters: 25,
    projectileSpeedMetersPerSecond: 110
});

const ANGLE_TABLE = Object.freeze([
    { maxDistance: 150, angle: 75 },
    { maxDistance: 200, angle: 70 },
    { maxDistance: 250, angle: 65 },
    { maxDistance: 300, angle: 60 },
    { maxDistance: 400, angle: 55 },
    { maxDistance: 500, angle: 50 },
    { maxDistance: 600, angle: 45 },
    { maxDistance: 700, angle: 40 },
    { maxDistance: 800, angle: 35 },
    { maxDistance: 900, angle: 30 },
    { maxDistance: 1000, angle: 25 },
    { maxDistance: 1200, angle: 20 },
    { maxDistance: 1400, angle: 15 },
    { maxDistance: 1600, angle: 12 },
    { maxDistance: 1800, angle: 10 },
    { maxDistance: 2000, angle: 8 }
]);

export function isMortarDistanceValid(distanceMeters) {
    return distanceMeters >= MORTAR_CONFIG.minRangeMeters && distanceMeters <= MORTAR_CONFIG.maxRangeMeters;
}

export function getMortarAngle(distanceMeters) {
    if (distanceMeters < MORTAR_CONFIG.minRangeMeters) {
        return null;
    }

    const matchingEntry = ANGLE_TABLE.find(({ maxDistance }) => distanceMeters < maxDistance);
    return matchingEntry?.angle ?? 5;
}

export function getFlightTimeSeconds(distanceMeters) {
    return distanceMeters / MORTAR_CONFIG.projectileSpeedMetersPerSecond;
}
