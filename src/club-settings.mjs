const DEFAULTS = Object.freeze({
  quality: 'auto',
  turnMode: 'snap',
  snapAngle: 30,
  speed: 'normal',
  haptics: true,
  captions: true,
  height: 'standing',
  eyeHeight: 1.65,
  text: 'normal',
  dwell: false,
  singleHand: false,
});

const ALLOW = {
  quality: ['auto', 'low', 'high'],
  turnMode: ['snap', 'smooth'],
  snapAngle: [15, 30, 45],
  speed: ['normal', 'calm'],
  haptics: [true, false],
  captions: [true, false],
  height: ['standing', 'seated'],
  text: ['normal', 'large'],
  dwell: [true, false],
  singleHand: [true, false],
};

export function defaultSettings() {
  return { ...DEFAULTS };
}

export function sanitizeSettings(raw) {
  const clean = { ...DEFAULTS };
  if (!raw || typeof raw !== 'object') return clean;
  for (const [key, allowed] of Object.entries(ALLOW)) {
    if (allowed.includes(raw[key])) clean[key] = raw[key];
  }
  const eye = Number(raw.eyeHeight);
  if (Number.isFinite(eye) && eye >= 1.1 && eye <= 2) clean.eyeHeight = Math.round(eye * 100) / 100;
  return clean;
}

export function loadSettings(storage) {
  try {
    const raw = storage?.get?.('club.settings', null);
    if (!raw) return defaultSettings();
    return sanitizeSettings(JSON.parse(raw));
  } catch {
    return defaultSettings();
  }
}

export function saveSettings(storage, settings) {
  try {
    storage?.set?.('club.settings', JSON.stringify(sanitizeSettings(settings)));
  } catch { /* Storage is optional. */ }
}

export function walkSpeed(settings) {
  return settings?.speed === 'calm' ? 2.5 : 4.2;
}

export function snapRadians(settings) {
  return ((settings?.snapAngle ?? 30) * Math.PI) / 180;
}
