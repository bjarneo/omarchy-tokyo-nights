export function updateThemeDisplay(label, strip, theme) {
  if (strip.dataset.theme === theme.id) return;
  strip.dataset.theme = theme.id;
  label.textContent = `${theme.index + 1}/${theme.count} · ${theme.name.toUpperCase()}`;
  strip.replaceChildren(...theme.swatches.map(([role, color]) => {
    const swatch = document.createElement('i');
    swatch.style.backgroundColor = color;
    swatch.title = `${role}: ${color}`;
    return swatch;
  }));
}
