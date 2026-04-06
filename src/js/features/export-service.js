/**
 * ES: Exporta la vista actual del mapa a PNG.
 * EN: Exports the current map view to PNG.
 */
const HTML2CANVAS_SRC = './vendor/html2canvas/html2canvas.min.js';

async function ensureHtml2Canvas() {
    if (typeof window.html2canvas === 'function') {
        return window.html2canvas;
    }

    const existingScript = document.querySelector(`script[src="${HTML2CANVAS_SRC}"]`);

    if (existingScript) {
        await waitForScript(existingScript);
        return window.html2canvas;
    }

    const script = document.createElement('script');
    script.src = HTML2CANVAS_SRC;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    await waitForScript(script);
    return window.html2canvas;
}

function waitForScript(scriptElement) {
    return new Promise((resolve, reject) => {
        const onLoad = () => {
            cleanup();
            resolve();
        };

        const onError = () => {
            cleanup();
            reject(new Error('html2canvas failed to load'));
        };

        const cleanup = () => {
            scriptElement.removeEventListener('load', onLoad);
            scriptElement.removeEventListener('error', onError);
        };

        scriptElement.addEventListener('load', onLoad, { once: true });
        scriptElement.addEventListener('error', onError, { once: true });
    });
}

export async function exportMapSnapshot({ element, fileNamePrefix = 'pubg-mortar-map', onStatusChange = () => {} }) {
    if (!element) {
        throw new Error('Map container not found');
    }

    onStatusChange('Preparando exportación...', 'info');
    const html2canvas = await ensureHtml2Canvas();

    if (typeof html2canvas !== 'function') {
        throw new Error('html2canvas is not available');
    }

    const canvas = await html2canvas(element, {
        backgroundColor: '#09090b',
        scale: Math.min(window.devicePixelRatio || 1, 2),
        useCORS: true,
        logging: false
    });

    const downloadLink = document.createElement('a');
    downloadLink.download = `${fileNamePrefix}-${Date.now()}.png`;
    downloadLink.href = canvas.toDataURL('image/png');
    downloadLink.click();

    onStatusChange('Exportación completada correctamente.', 'success');
}

