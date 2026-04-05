/**
 * ES: Contador de visitas local. Incrementa en cada sesión nueva.
 * EN: Local visit counter. Increments on each new session.
 */
const SESSION_KEY = 'pubg-mortar:visitor-session';
const LOCAL_COUNT_KEY = 'pubg-mortar:visitor-count:local';

export async function loadVisitorCount(counterElement) {
    if (!counterElement) {
        return;
    }

    const alreadyCounted = sessionStorage.getItem(SESSION_KEY);
    let count = Number(localStorage.getItem(LOCAL_COUNT_KEY) || '0');

    if (!alreadyCounted) {
        count += 1;
        localStorage.setItem(LOCAL_COUNT_KEY, String(count));
        sessionStorage.setItem(SESSION_KEY, 'true');
    }

    counterElement.textContent = formatCount(count);
}

function formatCount(value) {
    return Number.isFinite(value) ? new Intl.NumberFormat('es-ES').format(value) : '--';
}
