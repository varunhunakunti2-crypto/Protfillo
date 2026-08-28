export const ROWS = [
  [
    { id: "esc", label: "Esc", small: true, align: "left" },
    { id: "1", label: "1", shiftLabel: "!" },
    { id: "2", label: "2", shiftLabel: "@" },
    { id: "3", label: "3", shiftLabel: "#" },
    { id: "4", label: "4", shiftLabel: "$" },
    { id: "5", label: "5", shiftLabel: "%" },
    { id: "6", label: "6", shiftLabel: "^" },
    { id: "7", label: "7", shiftLabel: "&" },
    { id: "8", label: "8", shiftLabel: "*" },
    { id: "9", label: "9", shiftLabel: "(" },
    { id: "0", label: "0", shiftLabel: ")" },
    { id: "minus", label: "-", shiftLabel: "_" },
    { id: "equal", label: "=", shiftLabel: "+" },
    {
      id: "backspace",
      label: "Backspace",
      width: 2,
      small: true,
      align: "left",
    },
  ],
  [
    { id: "tab", label: "Tab", width: 1.5, align: "left", small: true },
    { id: "q", label: "Q" },
    { id: "w", label: "W", orange: true },
    { id: "e", label: "E" },
    { id: "r", label: "R" },
    { id: "t", label: "T" },
    { id: "y", label: "Y" },
    { id: "u", label: "U" },
    { id: "i", label: "I" },
    { id: "o", label: "O" },
    { id: "p", label: "P" },
    { id: "lbracket", label: "[", shiftLabel: "{" },
    { id: "rbracket", label: "]", shiftLabel: "}" },
    { id: "backslash", label: "\\", shiftLabel: "|", width: 1.5 },
  ],
  [
    { id: "caps", label: "CapsLock", width: 1.75, align: "left", small: true },
    { id: "a", label: "A", orange: true },
    { id: "s", label: "S", orange: true },
    { id: "d", label: "D", orange: true },
    { id: "f", label: "F" },
    { id: "g", label: "G" },
    { id: "h", label: "H" },
    { id: "j", label: "J" },
    { id: "k", label: "K" },
    { id: "l", label: "L" },
    { id: "semicolon", label: ";", shiftLabel: ":" },
    { id: "quote", label: "'", shiftLabel: '"' },
    { id: "enter", label: "Enter", width: 2.25, align: "left", small: true },
  ],
  [
    { id: "lshift", label: "Shift", width: 2.25, align: "left", small: true },
    { id: "z", label: "Z" },
    { id: "x", label: "X" },
    { id: "c", label: "C" },
    { id: "v", label: "V" },
    { id: "b", label: "B" },
    { id: "n", label: "N" },
    { id: "m", label: "M" },
    { id: "comma", label: ",", shiftLabel: "<" },
    { id: "period", label: ".", shiftLabel: ">" },
    { id: "slash", label: "/", shiftLabel: "?" },
    { id: "rshift", label: "Shift", width: 2.75, align: "left", small: true },
  ],
  [
    {
      id: "lctrl",
      label: "Ctrl",
      width: 1.25,
      small: true,
      muted: true,
      align: "left",
    },
    {
      id: "lwin",
      label: "Win",
      width: 1.25,
      small: true,
      muted: true,
      align: "left",
    },
    {
      id: "lalt",
      label: "Alt",
      width: 1.25,
      small: true,
      muted: true,
      align: "left",
    },
    { id: "space", label: "", width: 6.25 },
    {
      id: "ralt",
      label: "Alt",
      width: 1.25,
      small: true,
      muted: true,
      align: "left",
    },
    {
      id: "rwin",
      label: "Win",
      width: 1.25,
      small: true,
      muted: true,
      align: "left",
    },
    {
      id: "fn",
      label: "Fn",
      width: 1.25,
      small: true,
      muted: true,
      align: "left",
    },
  ],
];

const PAN_STRENGTH = 0.3;
const ROW_UNITS = 15;

export const KEY_PAN = (() => {
  const pans = {};
  for (const row of ROWS) {
    let cursor = 0;
    for (const key of row) {
      const width = key.width ?? 1;
      const center = cursor + width / 2;
      pans[key.id] = ((center / ROW_UNITS) * 2 - 1) * PAN_STRENGTH;
      cursor += width;
    }
  }
  return pans;
})();

export const ALL_KEYS_BY_ID = (() => {
  const map = {};
  for (const row of ROWS) {
    for (const key of row) {
      map[key.id] = key;
    }
  }
  return map;
})();

const MODIFIER_KEY_IDS = new Set([
  "esc",
  "tab",
  "caps",
  "enter",
  "backspace",
  "lshift",
  "rshift",
  "lctrl",
  "lwin",
  "lalt",
  "ralt",
  "rwin",
  "fn",
]);

export function getSoundCategory(id) {
  if (id === "space") return "spacebar";
  if (MODIFIER_KEY_IDS.has(id)) return "modifier";
  return "normal";
}

const MODIFIER_DISPLAY_ORDER = ["Ctrl", "Shift", "Alt", "Win", "Fn"];

export function getKeyDisplayLabel(id) {
  if (id === "space") return "Space";
  return ALL_KEYS_BY_ID[id]?.label || id;
}

export function getActiveKeyParts(ids) {
  if (ids.length === 0) return null;
  const labels = Array.from(new Set(ids.map(getKeyDisplayLabel)));
  const modifiers = MODIFIER_DISPLAY_ORDER.filter((m) => labels.includes(m));
  const others = labels.filter((l) => !MODIFIER_DISPLAY_ORDER.includes(l));
  return [...modifiers, ...others];
}

export function shiftLightness(hex, amount) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
  const adj = amount * 2.2;
  const rr = clamp(r + adj);
  const gg = clamp(g + adj);
  const bb = clamp(b + adj);
  return `rgb(${rr}, ${gg}, ${bb})`;
}

export function hashKeyId(id) {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

export function getKeyVariance(id, small) {
  const a = hashKeyId(id);
  const b = hashKeyId(id + "_b");
  const c = hashKeyId(id + "_c");
  const d = hashKeyId(id + "_d");
  const e = hashKeyId(id + "_e");
  return {
    hueShift: (a - 0.5) * 3,
    lightnessShift: (b - 0.5) * 4,
    specularShiftX: (c - 0.5) * 16,
    specularShiftY: (a * c - 0.5) * 12,
    wearAngle: b * 360,
    wearAmount: small ? 0.08 + c * 0.06 : 0.1 + d * 0.1,
    dust: false,
    dustX: 15 + c * 70,
    dustY: 15 + a * 70,
    microTilt: (e - 0.5) * 0.32,
    rimBias: 0.85 + e * 0.25,
  };
}

export const CODE_TO_KEY_ID = {
  Escape: "esc",
  Digit1: "1",
  Digit2: "2",
  Digit3: "3",
  Digit4: "4",
  Digit5: "5",
  Digit6: "6",
  Digit7: "7",
  Digit8: "8",
  Digit9: "9",
  Digit0: "0",
  Minus: "minus",
  Equal: "equal",
  Backspace: "backspace",
  Tab: "tab",
  KeyQ: "q",
  KeyW: "w",
  KeyE: "e",
  KeyR: "r",
  KeyT: "t",
  KeyY: "y",
  KeyU: "u",
  KeyI: "i",
  KeyO: "o",
  KeyP: "p",
  BracketLeft: "lbracket",
  BracketRight: "rbracket",
  Backslash: "backslash",
  CapsLock: "caps",
  KeyA: "a",
  KeyS: "s",
  KeyD: "d",
  KeyF: "f",
  KeyG: "g",
  KeyH: "h",
  KeyJ: "j",
  KeyK: "k",
  KeyL: "l",
  Semicolon: "semicolon",
  Quote: "quote",
  Enter: "enter",
  ShiftLeft: "lshift",
  KeyZ: "z",
  KeyX: "x",
  KeyC: "c",
  KeyV: "v",
  KeyB: "b",
  KeyN: "n",
  KeyM: "m",
  Comma: "comma",
  Period: "period",
  Slash: "slash",
  ShiftRight: "rshift",
  ControlLeft: "lctrl",
  MetaLeft: "lwin",
  AltLeft: "lalt",
  Space: "space",
  AltRight: "ralt",
  MetaRight: "rwin",
};

const svgDataUri = (svg) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

export const WOOD_GRAIN_URI = svgDataUri(`
<svg xmlns='http://www.w3.org/2000/svg' width='460' height='460'>
  <filter id='g'>
    <feTurbulence type='fractalNoise' baseFrequency='0.14 0.0032' numOctaves='6' seed='23' stitchTiles='stitch' result='n'/>
    <feColorMatrix in='n' type='matrix' values='0 0 0 0 0.27  0 0 0 0 0.15  0 0 0 0 0.065  0 0 0 1.0 0'/>
  </filter>
  <rect width='100%' height='100%' filter='url(#g)'/>
</svg>`);

export const WOOD_GRAIN_FINE_URI = svgDataUri(`
<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'>
  <filter id='gf'>
    <feTurbulence type='fractalNoise' baseFrequency='0.28 0.01' numOctaves='4' seed='71' stitchTiles='stitch' result='n'/>
    <feColorMatrix in='n' type='matrix' values='0 0 0 0 0.35  0 0 0 0 0.21  0 0 0 0 0.1  0 0 0 0.55 0'/>
  </filter>
  <rect width='100%' height='100%' filter='url(#gf)'/>
</svg>`);

export const WOOD_TONE_URI = svgDataUri(`
<svg xmlns='http://www.w3.org/2000/svg' width='520' height='520'>
  <filter id='t'>
    <feTurbulence type='fractalNoise' baseFrequency='0.0045' numOctaves='2' seed='11' result='n'/>
    <feColorMatrix in='n' type='matrix' values='0 0 0 0 0.22  0 0 0 0 0.115  0 0 0 0 0.045  0 0 0 0.5 0'/>
  </filter>
  <rect width='100%' height='100%' filter='url(#t)'/>
</svg>`);

export const PBT_NOISE_URI = svgDataUri(`
<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'>
  <filter id='n'>
    <feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='4' result='t'/>
    <feColorMatrix in='t' type='matrix' values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.045 0'/>
  </filter>
  <rect width='100%' height='100%' filter='url(#n)'/>
</svg>`);

export const END_GRAIN_URI = svgDataUri(`
<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'>
  <filter id='e'>
    <feTurbulence type='turbulence' baseFrequency='0.24' numOctaves='3' seed='2' result='t'/>
    <feColorMatrix in='t' type='matrix' values='0 0 0 0 0.12  0 0 0 0 0.07  0 0 0 0 0.026  0 0 0 0.55 0'/>
  </filter>
  <rect width='100%' height='100%' filter='url(#e)'/>
</svg>`);

export const WOOD_PORE_URI = svgDataUri(`
<svg xmlns='http://www.w3.org/2000/svg' width='260' height='260'>
  <filter id='p'>
    <feTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='2' seed='31' result='t'/>
    <feColorMatrix in='t' type='matrix' values='0 0 0 0 0.05  0 0 0 0 0.025  0 0 0 0 0.008  0 0 0 0.075 0'/>
  </filter>
  <rect width='100%' height='100%' filter='url(#p)'/>
</svg>`);

export const WOOD_MICROSCRATCH_URI = svgDataUri(`
<svg xmlns='http://www.w3.org/2000/svg' width='620' height='420'>
  <defs>
    <filter id='s'>
      <feTurbulence type='fractalNoise' baseFrequency='0.012 0.09' numOctaves='2' seed='58' result='n'/>
      <feColorMatrix in='n' type='matrix' values='0 0 0 0 1  0 0 0 0 0.97  0 0 0 0 0.9  0 0 0 0.035 0'/>
    </filter>
  </defs>
  <rect width='100%' height='100%' filter='url(#s)'/>
</svg>`);

export const WOOD_DENT_URI = svgDataUri(`
<svg xmlns='http://www.w3.org/2000/svg' width='700' height='500'>
  <defs>
    <radialGradient id='d1' cx='50%' cy='40%' r='60%'>
      <stop offset='0%' stop-color='#000' stop-opacity='0.13'/>
      <stop offset='55%' stop-color='#000' stop-opacity='0.04'/>
      <stop offset='100%' stop-color='#000' stop-opacity='0'/>
    </radialGradient>
    <radialGradient id='d2' cx='50%' cy='40%' r='60%'>
      <stop offset='0%' stop-color='#fff' stop-opacity='0.18'/>
      <stop offset='100%' stop-color='#fff' stop-opacity='0'/>
    </radialGradient>
  </defs>
  <ellipse cx='118' cy='72' rx='4.5' ry='2.1' fill='url(#d1)'/>
  <ellipse cx='120' cy='70' rx='1.6' ry='0.7' fill='url(#d2)'/>
  <ellipse cx='562' cy='410' rx='5.5' ry='2.5' fill='url(#d1)' transform='rotate(18 562 410)'/>
  <ellipse cx='564' cy='407' rx='1.9' ry='0.8' fill='url(#d2)' transform='rotate(18 564 407)'/>
  <ellipse cx='612' cy='58' rx='3.2' ry='1.4' fill='url(#d1)'/>
  <ellipse cx='34' cy='330' rx='2.7' ry='1.2' fill='url(#d1)'/>
</svg>`);

const AUDIO_SAMPLE = "data:@file/ogg;base64,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";

let thockEngine = null;
let thockEnginePromise = null;

function buildCaseImpulse(ctx) {
  const duration = 0.2;
  const length = Math.ceil(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    let lp = 0;
    for (let i = 0; i < length; i++) {
      const t = i / length;
      const decay = Math.pow(1 - t, 2.8);
      const raw = (Math.random() * 2 - 1) * decay;
      lp += (raw - lp) * 0.3;
      data[i] = lp;
    }
  }
  return buffer;
}

function base64ToArrayBuffer(dataUri) {
  try {
    const commaIndex = dataUri.indexOf(",");
    const base64 = commaIndex >= 0 ? dataUri.slice(commaIndex + 1) : dataUri;
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
  } catch {
    return null;
  }
}

async function decodeSample(ctx, dataUri) {
  const arrayBuffer = base64ToArrayBuffer(dataUri);
  if (!arrayBuffer || arrayBuffer.byteLength === 0) return null;
  try {
    return await ctx.decodeAudioData(arrayBuffer);
  } catch {
    return null;
  }
}

export function getThockEngine() {
  if (thockEngine) return Promise.resolve(thockEngine);
  if (thockEnginePromise) return thockEnginePromise;

  thockEnginePromise = (async () => {
    if (typeof window === "undefined") return null;
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;

    const ctx = new Ctor();

    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -20;
    compressor.knee.value = 12;
    compressor.ratio.value = 5;
    compressor.attack.value = 0.002;
    compressor.release.value = 0.08;

    const master = ctx.createGain();
    master.gain.value = 0.9;
    compressor.connect(master);
    master.connect(ctx.destination);

    const dry = ctx.createGain();
    dry.gain.value = 0.85;
    dry.connect(compressor);

    const wet = ctx.createGain();
    wet.gain.value = 0.3;
    const convolver = ctx.createConvolver();
    convolver.normalize = true;
    convolver.buffer = buildCaseImpulse(ctx);
    wet.connect(convolver);
    convolver.connect(compressor);

    const buffer = await decodeSample(ctx, AUDIO_SAMPLE);

    const engine = {
      ctx,
      dry,
      wet,
      supportsPanning: typeof ctx.createStereoPanner === "function",
      buffer,
    };
    thockEngine = engine;
    return engine;
  })();

  return thockEnginePromise;
}

const CATEGORY_PROFILE = {
  normal: { rate: [0.97, 1.04], gain: 0.85, filterHz: null },
  spacebar: { rate: [0.72, 0.78], gain: 1.0, filterHz: 1600 },
  modifier: { rate: [0.86, 0.92], gain: 0.68, filterHz: 3000 },
};

export function playKeySound(category, muted, panHint = 0) {
  if (typeof window === "undefined") return;
  getThockEngine().then((engine) => {
    if (!engine || !engine.buffer) return;
    const { ctx, dry, wet, supportsPanning, buffer } = engine;
    if (ctx.state === "suspended") void ctx.resume();

    const profile = CATEGORY_PROFILE[category];
    const now = ctx.currentTime;

    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const [minRate, maxRate] = profile.rate;
    src.playbackRate.value = minRate + Math.random() * (maxRate - minRate);

    const gain = ctx.createGain();
    const baseGain = muted ? profile.gain * 0.75 : profile.gain;
    gain.gain.value = baseGain * (0.96 + Math.random() * 0.08);

    const nodes = [src, gain];
    src.connect(gain);
    let tail = gain;

    if (profile.filterHz) {
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = profile.filterHz;
      filter.Q.value = 0.7;
      tail.connect(filter);
      tail = filter;
      nodes.push(filter);
    }

    if (supportsPanning) {
      const panner = ctx.createStereoPanner();
      panner.pan.value = Math.max(-1, Math.min(1, panHint + (Math.random() - 0.5) * 0.08));
      tail.connect(panner);
      tail = panner;
      nodes.push(panner);
    }

    tail.connect(dry);
    tail.connect(wet);

    src.onended = () => {
      for (const node of nodes) node.disconnect();
    };
    src.start(now);
  });
}

export const KEYCAP_BASE = "#DFD2C3";
export const LEGEND_INK = "#413e38";
export const LEGEND_INK_SOFT = "#726d64";

const MOBILE_BREAKPOINT = "(max-width: 639px)";
const TABLET_BREAKPOINT = "(max-width: 1023px)";

export function resolveTier() {
  if (typeof window === "undefined") return "desktop";
  if (window.matchMedia(MOBILE_BREAKPOINT).matches) return "mobile";
  if (window.matchMedia(TABLET_BREAKPOINT).matches) return "tablet";
  return "desktop";
}

export const RADIUS_TIERS = {
  desktop: { wall: 8, top: 6.5 },
  tablet: { wall: 7, top: 5.5 },
  mobile: { wall: 5.5, top: 4 },
};

export const NOISE_OPACITY_TIERS = {
  desktop: { wall: 0.05, top: 0.06 },
  tablet: { wall: 0.05, top: 0.06 },
  mobile: { wall: 0.045, top: 0.05 },
};

export const NOISE_SIZE_TIERS = {
  desktop: { wall: 90, top: 40 },
  tablet: { wall: 68, top: 30 },
  mobile: { wall: 48, top: 22 },
};

export const ROW_SCULPT_TIERS = {
  desktop: [
    { insetTop: 4, insetSide: 4.5, insetBottom: 11 },
    { insetTop: 4, insetSide: 4.5, insetBottom: 9.5 },
    { insetTop: 4, insetSide: 4.5, insetBottom: 8.5 },
    { insetTop: 4, insetSide: 4.5, insetBottom: 9 },
    { insetTop: 3.5, insetSide: 4, insetBottom: 7 },
  ],
  tablet: [
    { insetTop: 3.2, insetSide: 3.6, insetBottom: 8.8 },
    { insetTop: 3.2, insetSide: 3.6, insetBottom: 7.6 },
    { insetTop: 3.2, insetSide: 3.6, insetBottom: 6.8 },
    { insetTop: 3.2, insetSide: 3.6, insetBottom: 7.2 },
    { insetTop: 2.8, insetSide: 3.2, insetBottom: 5.6 },
  ],
  mobile: [
    { insetTop: 2.2, insetSide: 2.4, insetBottom: 5.8 },
    { insetTop: 2.2, insetSide: 2.4, insetBottom: 5 },
    { insetTop: 2.2, insetSide: 2.4, insetBottom: 4.4 },
    { insetTop: 2.2, insetSide: 2.4, insetBottom: 4.7 },
    { insetTop: 2, insetSide: 2.2, insetBottom: 3.6 },
  ],
};

export const LEGEND_SHARED = {
  shiftTopOffset: "13%",
  shiftLeftOffset: "18%",
  primaryBottomOffset: "14.5%",
  primaryLeftOffset: "0.85em",
  opticalCenterShift: "1.4%",
  shiftOpacity: 0.66,
  primaryOpacity: 0.96,
};

export const LEGEND_FONT_TIERS = {
  desktop: {
    shift: "clamp(0.46rem, 0.74vw, 0.58rem)",
    normal: "clamp(0.74rem, 1.38vw, 0.95rem)",
    small: "clamp(0.56rem, 1.02vw, 0.7rem)",
  },
  tablet: {
    shift: "clamp(0.48rem, 1.12vw, 0.58rem)",
    normal: "clamp(0.7rem, 2.05vw, 0.86rem)",
    small: "clamp(0.55rem, 1.58vw, 0.68rem)",
  },
  mobile: {
    shift: "clamp(0.43rem, 2.05vw, 0.51rem)",
    normal: "clamp(0.62rem, 3.65vw, 0.78rem)",
    small: "clamp(0.51rem, 2.85vw, 0.63rem)",
  },
};

export const CONTACT_SHADOW_TIERS = {
  desktop: "0 0.5px 0.5px rgba(12,8,4,0.14), 0 2px 3px rgba(12,8,4,0.1), 0 5px 9px rgba(12,8,4,0.07), 0 10px 16px rgba(12,8,4,0.045)",
  tablet: "0 0.4px 0.4px rgba(12,8,4,0.14), 0 1.5px 2.2px rgba(12,8,4,0.1), 0 3.5px 6px rgba(12,8,4,0.07), 0 6.5px 10px rgba(12,8,4,0.04)",
  mobile: "0 0.3px 0.3px rgba(12,8,4,0.13), 0 1px 1.6px rgba(12,8,4,0.1), 0 2.2px 4px rgba(12,8,4,0.06)",
};

export const KEY_HEIGHT_TIERS = {
  desktop: "clamp(2.15rem, min(4.15vw, 7.5vh), 2.95rem)",
  tablet: "clamp(1.95rem, min(5.4vw, 7vh), 2.6rem)",
  mobile: "clamp(1.75rem, min(8vw, 6vh), 2.2rem)",
};

export const KEY_GAP_TIERS = {
  desktop: "3px",
  tablet: "2.5px",
  mobile: "2px",
};

export const CONTAINER_TIERS = {
  desktop: { padding: "clamp(1.5rem, 6.25vw, 2.5rem)", maxWidth: "48rem" },
  tablet: { padding: "clamp(1.1rem, 3.6vw, 1.75rem)", maxWidth: "38rem" },
  mobile: { padding: "clamp(0.6rem, 3vw, 0.9rem)", maxWidth: "26rem" },
};

export const CASE_TIERS = {
  desktop: {
    caseRadius: "0.32rem",
    bezelRadius: "0.24rem",
    casePadding: "1.15% 1.3%",
    bezelPadding: "0.28%",
  },
  tablet: {
    caseRadius: "0.3rem",
    bezelRadius: "0.22rem",
    casePadding: "1.3% 1.5%",
    bezelPadding: "0.32%",
  },
  mobile: {
    caseRadius: "0.26rem",
    bezelRadius: "0.2rem",
    casePadding: "1.6% 1.9%",
    bezelPadding: "0.4%",
  },
};

export const MOBILE_LABEL_OVERRIDES = {
  backspace: "⌫",
  caps: "Caps",
};

export const MODIFIER_FAMILIES = [
  { modifier: "Alt", ids: ["lalt", "ralt"] },
  { modifier: "Control", ids: ["lctrl"] },
  { modifier: "Shift", ids: ["lshift", "rshift"] },
  { modifier: "Meta", ids: ["lwin", "rwin"] },
];
