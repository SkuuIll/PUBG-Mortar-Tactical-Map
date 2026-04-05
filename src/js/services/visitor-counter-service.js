/**
 * ES: Carga el contador una sola vez por sesión para evitar ruido y tráfico innecesario.
 * EN: Loads the counter only once per session to avoid unnecessary traffic.
 */
const SESSION_CACHE_KEY = 'pubg-mortar:visitor-count';
const LOCAL_CACHE_KEY = 'pubg-mortar:visitor-count:last-known';
const COUNTER_ENDPOINT = 'https://api.countapi.xyz/hit/odia2-mortar-pubg/visits';

export async function loadVisitorCount(counterElement) {
    if (!counterElement) {
        return;
    }

    const sessionValue = sessionStorage.getItem(SESSION_CACHE_KEY);
    if (sessionValue) {
        counterElement.textContent = formatCount(Number(sessionValue));
        return;
    }

    const cachedValue = localStorage.getItem(LOCAL_CACHE_KEY);
    if (cachedValue) {
        counterElement.textContent = formatCount(Number(cachedValue));
    }

    try {
        const response = await fetch(COUNTER_ENDPOINT, { cache: 'no-store' });
        if (!response.ok) {
            throw new Error('Counter service unavailable');
        }

        const data = await response.json();
        const count = Number(data.value);

        if (Number.isFinite(count)) {
            sessionStorage.setItem(SESSION_CACHE_KEY, String(count));
            localStorage.setItem(LOCAL_CACHE_KEY, String(count));
            counterElement.textContent = formatCount(count);
        } else {
            throw new Error('Invalid counter response');
        }
    } catch (error) {
        counterElement.textContent = cachedValue ? formatCount(Number(cachedValue)) : '--';
    }
}

function formatCount(value) {
    return Number.isFinite(value) ? new Intl.NumberFormat('es-ES').format(value) : '--';
}
