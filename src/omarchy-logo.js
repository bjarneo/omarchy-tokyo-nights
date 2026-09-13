const pendingLogos = new Map();

function loadBlockLogo(file, color) {
  if (!pendingLogos.has(file)) {
    const pending = fetch(new URL(`../assets/${file}`, import.meta.url))
      .then((response) => {
        if (!response.ok) throw new Error('The block logo cannot load.');
        return response.text();
      })
      .then((source) => {
        const lines = source.trimEnd().split('\n');
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(...lines.map((line) => line.length)) * 4;
        canvas.height = lines.length * 8;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = color;
        lines.forEach((line, row) => {
          [...line].forEach((character, column) => {
            if (character === ' ') return;
            if (!['█', '▀', '▄'].includes(character)) throw new Error('The logo contains an unsupported block.');
            ctx.fillRect(column * 4, row * 8 + (character === '▄' ? 4 : 0), 4, character === '█' ? 8 : 4);
          });
        });
        return canvas;
      });
    pendingLogos.set(file, pending);
  }
  return pendingLogos.get(file);
}

export const loadOmarchyLogo = () => loadBlockLogo('omarchy-logo.txt', '#c0caf5');
export const loadCliampLogo = () => loadBlockLogo('cliamp-logo.txt', '#e0af68');
