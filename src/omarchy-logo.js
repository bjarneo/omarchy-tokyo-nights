let pendingLogo;

export function loadOmarchyLogo() {
  if (!pendingLogo) {
    pendingLogo = fetch(new URL('../assets/omarchy-logo.txt', import.meta.url))
      .then((response) => {
        if (!response.ok) throw new Error('The Omarchy logo cannot load.');
        return response.text();
      })
      .then((source) => {
        const lines = source.trimEnd().split('\n');
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(...lines.map((line) => line.length)) * 4;
        canvas.height = lines.length * 8;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#c0caf5';
        lines.forEach((line, row) => {
          [...line].forEach((character, column) => {
            if (character === ' ') return;
            if (!['█', '▀', '▄'].includes(character)) throw new Error('The Omarchy logo contains an unsupported block.');
            ctx.fillRect(column * 4, row * 8 + (character === '▄' ? 4 : 0), 4, character === '█' ? 8 : 4);
          });
        });
        return canvas;
      });
  }
  return pendingLogo;
}
