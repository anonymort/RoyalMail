const script = `(() => {
  try {
    const storageKey = 'rmdt-theme';
    const root = document.documentElement;
    const persisted = window.localStorage.getItem(storageKey);
    const hasPersisted = persisted === 'light' || persisted === 'dark';
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const systemPreference = mediaQuery.matches ? 'dark' : 'light';
    const theme = hasPersisted ? persisted : systemPreference;
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
  } catch (error) {
    // no-op: rely on default styles if storage is unavailable
  }
})();`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
