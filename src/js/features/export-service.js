/**
 * ES: Exporta la vista actual del mapa a PNG.
 * EN: Exports the current map view to PNG.
 */
export async function exportMapSnapshot({ element, fileNamePrefix = 'pubg-mortar-map', onStatusChange = () => {} }) {
    if (!element) {
        throw new Error('Map container not found');
    }

    if (typeof window.html2canvas !== 'function') {
        throw new Error('html2canvas is not available');
    }

    onStatusChange('Preparando exportación...', 'info');

    const canvas = await window.html2canvas(element, {
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
