/**
 * ES: Registro del service worker y control del prompt de instalación.
 * EN: Service worker registration and install prompt controller.
 */
function isIosDevice(window) {
    return /iphone|ipad|ipod/i.test(window.navigator.userAgent || '');
}

function isSafariBrowser(window) {
    const userAgent = window.navigator.userAgent || '';
    return /safari/i.test(userAgent) && !/chrome|crios|android/i.test(userAgent);
}

function isStandaloneMode(window) {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

export async function registerPwaServiceWorker({ window }) {
    if (!('serviceWorker' in window.navigator)) {
        return false;
    }

    try {
        await window.navigator.serviceWorker.register('./sw.js', { scope: './' });
        return true;
    } catch (error) {
        return false;
    }
}

export function setupInstallPrompt({ window, button, onStatusChange = () => {} }) {
    if (!button) {
        return () => {};
    }

    let deferredPrompt = null;

    const updateButtonState = () => {
        if (isStandaloneMode(window)) {
            button.hidden = true;
            button.disabled = true;
            return;
        }

        if (deferredPrompt) {
            button.hidden = false;
            button.disabled = false;
            button.textContent = 'Instalar';
            return;
        }

        if (isIosDevice(window) && isSafariBrowser(window)) {
            button.hidden = false;
            button.disabled = false;
            button.textContent = 'Instalar';
            return;
        }

        button.hidden = true;
        button.disabled = true;
    };

    const handleBeforeInstallPrompt = (event) => {
        event.preventDefault();
        deferredPrompt = event;
        updateButtonState();
    };

    const handleAppInstalled = () => {
        deferredPrompt = null;
        updateButtonState();
        onStatusChange('La aplicación se instaló correctamente.', 'success');
    };

    const handleButtonClick = async () => {
        if (deferredPrompt) {
            const promptEvent = deferredPrompt;
            deferredPrompt = null;
            await promptEvent.prompt();
            const choiceResult = await promptEvent.userChoice;

            if (choiceResult?.outcome === 'accepted') {
                onStatusChange('Instalación iniciada desde el navegador.', 'success');
            } else {
                onStatusChange('Instalación cancelada por el usuario.', 'info');
            }

            updateButtonState();
            return;
        }

        if (isIosDevice(window) && isSafariBrowser(window) && !isStandaloneMode(window)) {
            onStatusChange('En Safari usa Compartir y luego “Añadir a pantalla de inicio”.', 'info');
            return;
        }

        onStatusChange('La instalación no está disponible en este navegador.', 'warning');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    button.addEventListener('click', handleButtonClick);
    updateButtonState();

    return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
        button.removeEventListener('click', handleButtonClick);
    };
}
