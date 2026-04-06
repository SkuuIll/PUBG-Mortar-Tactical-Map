/**
 * ES: Servicio de compartir con soporte nativo y fallback al portapapeles.
 * EN: Share service with native support and clipboard fallback.
 */
async function copyToClipboard({ window, document, text }) {
    if (window.navigator.clipboard?.writeText) {
        try {
            await window.navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            // Continúa con el fallback clásico si el portapapeles moderno falla.
        }
    }

    const fallbackField = document.createElement('textarea');
    fallbackField.value = text;
    fallbackField.setAttribute('readonly', 'true');
    fallbackField.style.position = 'fixed';
    fallbackField.style.opacity = '0';
    fallbackField.style.pointerEvents = 'none';
    fallbackField.style.inset = '0';
    document.body.appendChild(fallbackField);
    fallbackField.focus();
    fallbackField.select();

    const copySucceeded = document.execCommand('copy');
    document.body.removeChild(fallbackField);

    if (!copySucceeded) {
        throw new Error('Clipboard copy failed');
    }

    return true;
}

export async function shareApp({ window, document, title, text, url }) {
    const shareUrl = url || window.location.href;
    const shareData = { title, text, url: shareUrl };

    if (typeof window.navigator.share === 'function') {
        try {
            await window.navigator.share(shareData);
            return { method: 'native', url: shareUrl };
        } catch (error) {
            if (error?.name === 'AbortError') {
                throw error;
            }
        }
    }

    await copyToClipboard({ window, document, text: shareUrl });
    return { method: 'clipboard', url: shareUrl };
}

