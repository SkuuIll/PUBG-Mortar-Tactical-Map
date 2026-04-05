/**
 * ES: Punto de entrada de la aplicación.
 * EN: Application entry point.
 */
import { PubgMortarApp } from './core/pubg-mortar-app.js';
import { registerPwaServiceWorker } from './services/pwa-service.js';

async function bootstrap() {
    await registerPwaServiceWorker({ window });

    const app = new PubgMortarApp({ document, window });
    await app.initialize();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        bootstrap();
    }, { once: true });
} else {
    bootstrap();
}
