/**
 * ES: Servicio de compartir con soporte nativo y fallback al portapapeles.
 * EN: Share service with native support and clipboard fallback.
 */
export async function shareApp({ window, document, title, text, url }) {
    const shareUrl = url || window.location.href;
    const shareData = { title, text, url: shareUrl };

    if (typeof window.navigator.share === 'function') {
        await window.navigator.share(shareData);
        return { method: 'native', url: shareUrl };
    }

    if (window.navigator.clipboard?.writeText) {
        await window.navigator.clipboard.writeText(shareUrl);
        return { method: 'clipboard', url: shareUrl };
    }

    const fallbackField = document.createElement('textarea');
    fallbackField.value = shareUrl;
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

    return { method: 'clipboard', url: shareUrl };
}
