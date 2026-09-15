const PRESETS = Object.freeze({
  low: Object.freeze({
    pixelRatio: 1,
    framebufferScale: 0.6,
    screenNearHz: 4,
    screenFarHz: 1,
    screenNearCount: 6,
    dust: false,
    glow: false,
    avatarCull: 18,
    avatarAnimateHz: 10,
  }),
  high: Object.freeze({
    pixelRatio: 1.4,
    framebufferScale: 0.85,
    screenNearHz: 12,
    screenFarHz: 4,
    screenNearCount: 8,
    dust: true,
    glow: true,
    avatarCull: 30,
    avatarAnimateHz: 30,
  }),
});

export function qualityPreset(name) {
  return PRESETS[name] || PRESETS.high;
}

export function presetNames() {
  return Object.keys(PRESETS);
}

export class ClubQuality {
  constructor({ mode = 'auto', immersive = false } = {}) {
    this.mode = mode;
    this.active = immersive ? 'low' : 'high';
    this.ema = 60;
    this.goodTime = 0;
    this.badTime = 0;
    this.lastStamp = 0;
    this.stats = { fps: 0, calls: 0, triangles: 0, screens: 0, avatars: 0 };
  }

  preset() {
    return qualityPreset(this.active);
  }

  setMode(mode, immersive = false) {
    this.mode = mode;
    if (mode === 'low') this.active = 'low';
    else if (mode === 'high') this.active = 'high';
    else this.active = immersive ? 'low' : 'high';
    this.goodTime = 0;
    this.badTime = 0;
  }

  apply(renderer, vr) {
    const preset = this.preset();
    if (renderer && !renderer.xr?.isPresenting) {
      renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio || 1, preset.pixelRatio));
    }
    if (vr && typeof vr.setFramebufferScale === 'function') vr.setFramebufferScale(preset.framebufferScale);
    else if (renderer?.xr?.setFramebufferScaleFactor) {
      try { renderer.xr.setFramebufferScaleFactor(preset.framebufferScale); } catch { /* Optional. */ }
    }
  }

  updateAuto(timestamp, target = 72) {
    if (!this.lastStamp) { this.lastStamp = timestamp; return this.active; }
    const dt = Math.max(1, timestamp - this.lastStamp);
    this.lastStamp = timestamp;
    const fps = 1000 / dt;
    this.ema = this.ema * 0.92 + fps * 0.08;
    this.stats.fps = Math.round(this.ema);
    if (this.mode !== 'auto') return this.active;
    if (this.ema >= target) { this.goodTime += dt; this.badTime = 0; }
    else if (this.ema < target - 12) { this.badTime += dt; this.goodTime = 0; }
    else { this.goodTime = 0; this.badTime = 0; }
    if (this.badTime > 3000 && this.active === 'high') { this.active = 'low'; this.badTime = 0; return 'changed:low'; }
    if (this.goodTime > 5000 && this.active === 'low') { this.active = 'high'; this.goodTime = 0; return 'changed:high'; }
    return this.active;
  }

  record(renderer, screens, avatars) {
    if (renderer?.info?.render) {
      this.stats.calls = renderer.info.render.calls;
      this.stats.triangles = renderer.info.render.triangles;
    }
    this.stats.screens = screens;
    this.stats.avatars = avatars;
  }
}

export const PERF_BUDGETS = Object.freeze({
  high: Object.freeze({ calls: 260, triangles: 450000, screensPerSecond: 40 }),
  low: Object.freeze({ calls: 190, triangles: 300000, screensPerSecond: 16 }),
});
