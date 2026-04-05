/**
 * ES: Servicio de tema persistente para mantener la interfaz consistente.
 * EN: Persistent theme service to keep the interface consistent.
 */
const THEME_STORAGE_KEY = 'pubg-mortar:theme';

const THEME_BROWSER_COLORS = Object.freeze({
    dark: '#070b11',
    light: '#e9eef6'
});

export const THEMES = Object.freeze({
    dark: 'dark',
    light: 'light'
});

export function getSavedTheme() {
    return localStorage.getItem(THEME_STORAGE_KEY) === THEMES.light ? THEMES.light : THEMES.dark;
}

export function applyTheme(theme, elements) {
    const normalizedTheme = theme === THEMES.light ? THEMES.light : THEMES.dark;
    const isLightTheme = normalizedTheme === THEMES.light;

    elements.root.setAttribute('data-theme', normalizedTheme);
    elements.toggle.checked = isLightTheme;
    elements.icon.textContent = isLightTheme ? '☀️' : '🌙';
    elements.label.textContent = isLightTheme ? 'Claro' : 'Oscuro';

    if (elements.themeColorMeta) {
        elements.themeColorMeta.setAttribute('content', THEME_BROWSER_COLORS[normalizedTheme]);
    }

    localStorage.setItem(THEME_STORAGE_KEY, normalizedTheme);
    return normalizedTheme;
}

export function toggleTheme(isLightEnabled, elements) {
    return applyTheme(isLightEnabled ? THEMES.light : THEMES.dark, elements);
}
