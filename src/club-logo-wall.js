const BASE = new URL('../assets/open-source/', import.meta.url);
const loadImage = (file) => new Promise((resolve) => {
  const image = new Image(); image.decoding = 'async';
  image.onload = () => resolve(image); image.onerror = () => resolve(null);
  image.src = new URL(file, BASE).href;
});

export function addOpenSourceWalls(room) {
  const panels = [
    { id: 'foundation', x: -10, z: 13.74, y: 2.65, width: 14, height: 3.1, yaw: Math.PI },
    { id: 'editors', x: 10, z: 13.74, y: 2.65, width: 14, height: 3.1, yaw: Math.PI },
    { id: 'languages', x: -17.74, z: -7.5, y: 3.1, width: 11.2, height: 2.7, yaw: Math.PI / 2 },
    { id: 'apps', x: 17.74, z: -7.5, y: 3.1, width: 11.2, height: 2.7, yaw: -Math.PI / 2 },
    { id: 'tooling', x: -17.74, z: 6.5, y: 3.1, width: 12.5, height: 2.7, yaw: Math.PI / 2 },
  ];
  room.at(0, 0);
  room.logoWalls = panels.map((panel) => {
    const canvas = document.createElement('canvas'); canvas.width = 2048; canvas.height = Math.round(2048 * panel.height / panel.width);
    const mesh = room.plane(canvas, panel.width, panel.height, panel.x, panel.y, panel.z, panel.yaw);
    mesh.name = `open-source-${panel.id}`;
    const ctx = canvas.getContext('2d'); ctx.fillStyle = '#24283b'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    return { ...panel, canvas, mesh };
  });
  room.galleryReady = fetch(new URL('manifest.json', BASE)).then((response) => {
    if (!response.ok) throw new Error('The logo gallery cannot load.');
    return response.json();
  }).then(async (manifest) => {
    const images = new Map();
    await Promise.all(manifest.groups.flatMap((group) => group.entries).map(async (entry) => images.set(entry.id, await loadImage(entry.file))));
    room.galleryManifest = manifest;
    for (const panel of room.logoWalls) {
      const group = manifest.groups.find((item) => item.id === panel.id);
      const { canvas } = panel; const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#202333'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#7dcfff'; ctx.lineWidth = 6; ctx.strokeRect(3, 3, canvas.width - 6, canvas.height - 6);
      ctx.fillStyle = '#e0af68'; ctx.font = '42px "Courier New", monospace'; ctx.textAlign = 'left'; ctx.fillText(group.title, 42, 56);
      ctx.fillStyle = '#9aa5ce'; ctx.font = '22px "Courier New", monospace'; ctx.fillText(group.subtitle, 42, 90);
      const columns = Math.ceil(group.entries.length / 2); const cellWidth = (canvas.width - 64) / columns; const cellHeight = (canvas.height - 146) / 2;
      group.entries.forEach((entry, index) => {
        const x = 32 + index % columns * cellWidth; const y = 112 + Math.floor(index / columns) * cellHeight;
        const size = Math.min(cellHeight - 49, cellWidth - 42);
        const cx = x + cellWidth / 2;
        ctx.fillStyle = '#e2dfd2'; ctx.fillRect(cx - size / 2, y, size, size);
        const image = images.get(entry.id);
        if (image) {
          const scale = Math.min((size - 18) / image.naturalWidth, (size - 18) / image.naturalHeight);
          const width = image.naturalWidth * scale; const height = image.naturalHeight * scale;
          ctx.drawImage(image, cx - width / 2, y + (size - height) / 2, width, height);
        }
        ctx.fillStyle = '#c0caf5'; ctx.textAlign = 'center'; ctx.font = `${entry.name.length > 15 ? 21 : 25}px "Courier New", monospace`; ctx.fillText(entry.name, cx, y + size + 30);
      });
      ctx.fillStyle = '#9aa5ce'; ctx.textAlign = 'left'; ctx.font = '19px "Courier New", monospace';
      ctx.fillText(panel.id === 'tooling' ? manifest.terminalNames.join('  ·  ') : 'THE OPEN-SOURCE SOFTWARE BEHIND OMARCHY', 42, canvas.height - 19);
      panel.mesh.material.map.needsUpdate = true;
    }
    room.galleryLoaded = [...images.values()].filter(Boolean).length;
    return manifest;
  }).catch(() => { room.galleryLoaded = 0; return null; });
}
