<template>
  <button
    type="button"
    :aria-label="config.label || 'Space'"
    :data-pressed="pressed"
    @pointerdown="handlePress"
    @pointerup="handleRelease"
    @pointercancel="handleRelease"
    @pointerleave="handleRelease"
    :style="buttonStyle"
    class="kb-key relative select-none outline-none"
  >
    <!-- contact shadow -->
    <span
      class="pointer-events-none absolute"
      :style="shadowStyle"
    />
    
    <!-- wall base -->
    <span
      class="absolute inset-0"
      :style="wallBaseStyle"
    />
    
    <!-- wall noise -->
    <span
      class="pointer-events-none absolute inset-0 mix-blend-overlay"
      :style="wallNoiseStyle"
    />
    
    <!-- top surface -->
    <span
      class="absolute"
      :style="topSurfaceStyle"
    />
    
    <!-- top noise -->
    <span
      class="pointer-events-none absolute mix-blend-overlay"
      :style="topNoiseStyle"
    />
    
    <!-- top rim highlight -->
    <span
      class="pointer-events-none absolute"
      :style="rimHighlightStyle"
    />
    
    <!-- top edge lighting -->
    <span
      class="pointer-events-none absolute"
      :style="edgeLightingStyle"
    />
    
    <!-- Legends -->
    <span
      class="pointer-events-none absolute inset-0"
      style="z-index: 5;"
    >
      <span
        v-if="config.shiftLabel"
        class="absolute font-medium leading-none"
        :style="shiftLabelStyle"
      >
        {{ config.shiftLabel }}
      </span>
      <span
        v-if="config.label"
        :class="['absolute leading-none', config.small ? 'font-semibold' : 'font-bold', primaryAlign === 'left' ? 'text-left' : 'text-center']"
        :style="primaryLabelStyle"
      >
        {{ displayLabel }}
      </span>
    </span>
  </button>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { 
  getKeyVariance, 
  shiftLightness, 
  getSoundCategory, 
  playKeySound, 
  KEY_PAN, 
  PBT_NOISE_URI, 
  getKeyShade,
  ROW_SCULPT_TIERS,
  RADIUS_TIERS,
  NOISE_OPACITY_TIERS,
  NOISE_SIZE_TIERS,
  LEGEND_FONT_TIERS,
  CONTACT_SHADOW_TIERS,
  KEY_HEIGHT_TIERS,
  MOBILE_LABEL_OVERRIDES,
  LEGEND_SHARED
} from './vintage-keyboard-logic.js';

const props = defineProps({
  config: Object,
  rowIndex: Number,
  tier: String,
  registerTrigger: Function
});

const emit = defineEmits(['activate', 'deactivate']);

const pointerPressed = ref(false);
const physicallyPressed = ref(false);

const MIN_VISIBLE_PRESS_MS = 55;

function usePressState() {
  const isPressed = ref(false);
  let pressedAt = 0;
  let releaseTimeout = null;

  const clearPendingRelease = () => {
    if (releaseTimeout !== null) {
      window.clearTimeout(releaseTimeout);
      releaseTimeout = null;
    }
  };

  const press = () => {
    clearPendingRelease();
    pressedAt = performance.now();
    isPressed.value = true;
  };

  const release = () => {
    const elapsed = performance.now() - pressedAt;
    const remaining = MIN_VISIBLE_PRESS_MS - elapsed;
    if (remaining > 0) {
      clearPendingRelease();
      releaseTimeout = window.setTimeout(() => {
        releaseTimeout = null;
        isPressed.value = false;
      }, remaining);
    } else {
      isPressed.value = false;
    }
  };

  return { isPressed, press, release, clearPendingRelease };
}

const pointerState = usePressState();
const physicalState = usePressState();

const pressed = computed(() => pointerState.isPressed.value || physicalState.isPressed.value);

onMounted(() => {
  if (props.registerTrigger) {
    props.registerTrigger(props.config.id, {
      press: physicalState.press,
      release: physicalState.release
    });
  }
});

onBeforeUnmount(() => {
  pointerState.clearPendingRelease();
  physicalState.clearPendingRelease();
});

const width = computed(() => props.config.width ?? 1);
const align = computed(() => props.config.align ?? 'center');
const small = computed(() => props.config.small);
const muted = computed(() => props.config.muted);

const primaryAlign = align;
const displayLabel = computed(() => {
  return props.tier === 'mobile' ? (MOBILE_LABEL_OVERRIDES[props.config.id] ?? props.config.label) : props.config.label;
});

const variance = computed(() => getKeyVariance(props.config.id, small.value));

const sculptRows = computed(() => ROW_SCULPT_TIERS[props.tier]);
const sculpt = computed(() => sculptRows.value[props.rowIndex] ?? sculptRows.value[1]);
const radius = computed(() => RADIUS_TIERS[props.tier]);
const noiseOpacity = computed(() => NOISE_OPACITY_TIERS[props.tier]);
const noiseSize = computed(() => NOISE_SIZE_TIERS[props.tier]);
const legendFont = computed(() => LEGEND_FONT_TIERS[props.tier]);
const contactShadow = computed(() => CONTACT_SHADOW_TIERS[props.tier]);
const keyHeight = computed(() => KEY_HEIGHT_TIERS[props.tier]);

const shade = computed(() => getKeyShade(props.config.id));

const SHADE_THEMES = {
  white: {
    stops: ["#ffffff", "#f5f5f5", "#e2e2e2", "#c8c8c8", "#aaaaaa"],
    wallShadow: "inset 0 1px 0 rgba(255,255,255,0.95), inset 0.6px 0.4px 0 rgba(255,255,255,0.4), inset 0 -1.5px 2px rgba(0,0,0,0.18), inset 0 0 0 0.5px rgba(0,0,0,0.08)",
    topBase: "#ffffff",
    topSpecular: 0.65,
    topShadow: "inset 0 0 0 0.75px rgba(0,0,0,0.15), inset 0 0.6px 0 rgba(255,255,255,0.95), inset 0 -0.8px 1.2px rgba(0,0,0,0.06)",
    topShadowPressed: "inset 0 0 0 0.75px rgba(0,0,0,0.25), inset 0 0.5px 0 rgba(255,255,255,0.6), inset 0 1px 2px rgba(0,0,0,0.15)",
    legendPrimary: "#111215",
    legendShift: "#3f3f46",
    legendShadow: "0 0.5px 0 rgba(255,255,255,0.6)",
    rimOpacity: 0.6,
  },
  cream: {
    stops: ["#eae6dd", "#ded9cf", "#c8c2b5", "#aba496", "#8d8677"],
    wallShadow: "inset 0 1px 0 rgba(255,255,255,0.7), inset 0.6px 0.4px 0 rgba(255,255,255,0.3), inset 0 -1.5px 2px rgba(0,0,0,0.22), inset 0 0 0 0.5px rgba(0,0,0,0.1)",
    topBase: "#dcd7cc",
    topSpecular: 0.45,
    topShadow: "inset 0 0 0 0.75px rgba(60,50,40,0.2), inset 0 0.6px 0 rgba(255,255,255,0.7), inset 0 -0.8px 1.2px rgba(0,0,0,0.08)",
    topShadowPressed: "inset 0 0 0 0.75px rgba(60,50,40,0.3), inset 0 0.5px 0 rgba(255,255,255,0.4), inset 0 1px 2px rgba(0,0,0,0.2)",
    legendPrimary: "#262626",
    legendShift: "#52525b",
    legendShadow: "0 0.5px 0 rgba(255,255,255,0.4)",
    rimOpacity: 0.45,
  },
  mid_grey: {
    stops: ["#b0b4bb", "#a2a6ad", "#8b8f97", "#6e7279", "#52555a"],
    wallShadow: "inset 0 1px 0 rgba(255,255,255,0.4), inset 0.6px 0.4px 0 rgba(255,255,255,0.18), inset 0 -1.5px 2px rgba(0,0,0,0.3), inset 0 0 0 0.5px rgba(0,0,0,0.15)",
    topBase: "#9ea2a9",
    topSpecular: 0.35,
    topShadow: "inset 0 0 0 0.75px rgba(0,0,0,0.28), inset 0 0.6px 0 rgba(255,255,255,0.4), inset 0 -0.8px 1.2px rgba(0,0,0,0.12)",
    topShadowPressed: "inset 0 0 0 0.75px rgba(0,0,0,0.4), inset 0 0.5px 0 rgba(255,255,255,0.25), inset 0 1px 2px rgba(0,0,0,0.25)",
    legendPrimary: "#18191c",
    legendShift: "#334155",
    legendShadow: "0 0.5px 0 rgba(255,255,255,0.25)",
    rimOpacity: 0.35,
  },
  slate_grey: {
    stops: ["#5e646f", "#525761", "#42464e", "#32353c", "#23252a"],
    wallShadow: "inset 0 1px 0 rgba(255,255,255,0.2), inset 0.6px 0.4px 0 rgba(255,255,255,0.1), inset 0 -1.5px 2px rgba(0,0,0,0.45), inset 0 0 0 0.5px rgba(0,0,0,0.3)",
    topBase: "#4e535c",
    topSpecular: 0.22,
    topShadow: "inset 0 0 0 0.75px rgba(0,0,0,0.5), inset 0 0.6px 0 rgba(255,255,255,0.18), inset 0 -0.8px 1.2px rgba(0,0,0,0.25)",
    topShadowPressed: "inset 0 0 0 0.75px rgba(0,0,0,0.65), inset 0 0.5px 0 rgba(255,255,255,0.1), inset 0 1px 2px rgba(0,0,0,0.45)",
    legendPrimary: "#e2e8f0",
    legendShift: "#94a3b8",
    legendShadow: "0 1px 2px rgba(0,0,0,0.7)",
    rimOpacity: 0.25,
  },
  charcoal_grey: {
    stops: ["#3c4048", "#33363e", "#282a30", "#1e1f24", "#141518"],
    wallShadow: "inset 0 1px 0 rgba(255,255,255,0.14), inset 0.6px 0.4px 0 rgba(255,255,255,0.06), inset 0 -1.5px 2px rgba(0,0,0,0.5), inset 0 0 0 0.5px rgba(0,0,0,0.35)",
    topBase: "#2e3137",
    topSpecular: 0.18,
    topShadow: "inset 0 0 0 0.75px rgba(0,0,0,0.6), inset 0 0.6px 0 rgba(255,255,255,0.14), inset 0 -0.8px 1.2px rgba(0,0,0,0.3)",
    topShadowPressed: "inset 0 0 0 0.75px rgba(0,0,0,0.75), inset 0 0.5px 0 rgba(255,255,255,0.08), inset 0 1px 2px rgba(0,0,0,0.55)",
    legendPrimary: "#94a3b8",
    legendShift: "#64748b",
    legendShadow: "0 1px 2px rgba(0,0,0,0.8)",
    rimOpacity: 0.2,
  },
  black: {
    stops: ["#282b30", "#202227", "#18191c", "#111215", "#0a0b0d"],
    wallShadow: "inset 0 1px 0 rgba(255,255,255,0.1), inset 0.6px 0.4px 0 rgba(255,255,255,0.05), inset 0 -1.5px 2px rgba(0,0,0,0.6), inset 0 0 0 0.5px rgba(0,0,0,0.45)",
    topBase: "#18191d",
    topSpecular: 0.12,
    topShadow: "inset 0 0 0 0.75px rgba(0,0,0,0.7), inset 0 0.6px 0 rgba(255,255,255,0.1), inset 0 -0.8px 1.2px rgba(0,0,0,0.35)",
    topShadowPressed: "inset 0 0 0 0.75px rgba(0,0,0,0.85), inset 0 0.5px 0 rgba(255,255,255,0.05), inset 0 1px 2px rgba(0,0,0,0.65)",
    legendPrimary: "#6b7280",
    legendShift: "#4b5563",
    legendShadow: "0 1px 2px rgba(0,0,0,0.9)",
    rimOpacity: 0.18,
  }
};

const layers = computed(() => {
  const v = variance.value;
  const s = sculpt.value;
  const insetTRBL = `${s.insetTop}px ${s.insetSide}px ${s.insetBottom}px ${s.insetSide}px`;
  const t = SHADE_THEMES[shade.value] || SHADE_THEMES.black;
  
  const wallGradient = `linear-gradient(180deg, ${shiftLightness(t.stops[0], v.lightnessShift)} 0%, ${shiftLightness(t.stops[1], v.lightnessShift)} 20%, ${shiftLightness(t.stops[2], v.lightnessShift)} 50%, ${shiftLightness(t.stops[3], v.lightnessShift * 0.7)} 80%, ${shiftLightness(t.stops[4], v.lightnessShift * 0.5)} 100%)`;

  const topGradient = `radial-gradient(115% 125% at ${23 + v.specularShiftX * 0.4}% 9%, rgba(255,255,255,${t.topSpecular - v.wearAmount * 0.05}), rgba(255,255,255,0) 44%), radial-gradient(150% 120% at 50% 118%, rgba(0,0,0,${0.35 + v.wearAmount * 0.05}), transparent 60%), ${shiftLightness(t.topBase, v.lightnessShift * 0.6)}`;

  return {
    insetTRBL,
    wallGradient,
    wallFilter: `hue-rotate(${v.hueShift}deg)`,
    wallNoisePosition: `${v.specularShiftX}px ${v.specularShiftY}px`,
    wallShadow: t.wallShadow,
    topGradient,
    topFilter: `hue-rotate(${v.hueShift * 0.4}deg)`,
    topNoisePosition: `${v.specularShiftY}px ${v.specularShiftX}px`,
    topShadow: t.topShadow,
    topShadowPressed: t.topShadowPressed,
    rimOpacityUp: t.rimOpacity * v.rimBias,
    rimOpacityDown: (t.rimOpacity * 0.45) * v.rimBias,
    legendPrimary: t.legendPrimary,
    legendShift: t.legendShift,
    legendShadow: t.legendShadow,
  };
});

const buttonStyle = computed(() => ({
  flexGrow: width.value,
  flexBasis: 0,
  minWidth: 0,
  height: keyHeight.value,
  '--tilt': `${variance.value.microTilt}deg`,
}));

const shadowStyle = computed(() => ({
  inset: 0,
  borderRadius: `${radius.value.wall}px`,
  boxShadow: pressed.value ? '0 0.5px 1px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.25)' : contactShadow.value,
  transition: 'box-shadow 140ms ease-out',
  zIndex: 0,
}));

const wallBaseStyle = computed(() => ({
  borderRadius: `${radius.value.wall}px`,
  background: layers.value.wallGradient,
  filter: layers.value.wallFilter,
  boxShadow: layers.value.wallShadow,
  zIndex: 1,
}));

const wallNoiseStyle = computed(() => ({
  borderRadius: `${radius.value.wall}px`,
  backgroundImage: `url("${PBT_NOISE_URI}")`,
  backgroundSize: `${noiseSize.value.wall}px ${noiseSize.value.wall}px`,
  backgroundPosition: layers.value.wallNoisePosition,
  opacity: (shade.value === 'white' || shade.value === 'cream') ? noiseOpacity.value.wall * 1.2 : noiseOpacity.value.wall * 0.7,
  zIndex: 1,
}));

const topSurfaceStyle = computed(() => ({
  borderRadius: `${radius.value.top}px`,
  inset: layers.value.insetTRBL,
  background: layers.value.topGradient,
  filter: layers.value.topFilter,
  boxShadow: pressed.value ? layers.value.topShadowPressed : layers.value.topShadow,
  transition: 'box-shadow 140ms ease-out, background 140ms ease-out',
  zIndex: 3,
}));

const topNoiseStyle = computed(() => ({
  borderRadius: `${radius.value.top}px`,
  inset: layers.value.insetTRBL,
  backgroundImage: `url("${PBT_NOISE_URI}")`,
  backgroundSize: `${noiseSize.value.top}px ${noiseSize.value.top}px`,
  backgroundPosition: layers.value.topNoisePosition,
  opacity: (shade.value === 'white' || shade.value === 'cream') ? noiseOpacity.value.top * 1.2 : noiseOpacity.value.top * 0.7,
  zIndex: 3,
}));

const rimHighlightStyle = computed(() => ({
  borderRadius: `${radius.value.top}px`,
  inset: layers.value.insetTRBL,
  background: (shade.value === 'white' || shade.value === 'cream')
    ? 'radial-gradient(55% 50% at 26% 18%, rgba(255,255,255,0.4), transparent 70%)'
    : 'radial-gradient(55% 50% at 26% 18%, rgba(255,255,255,0.12), transparent 70%)',
  opacity: pressed.value ? 0.3 : 1,
  transition: 'opacity 140ms ease-out',
  zIndex: 4,
}));

const edgeLightingStyle = computed(() => ({
  borderRadius: `${radius.value.top}px`,
  inset: layers.value.insetTRBL,
  background: (shade.value === 'white' || shade.value === 'cream')
    ? 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 14%), linear-gradient(100deg, rgba(255,255,255,0.12) 0%, transparent 9%)'
    : 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 14%), linear-gradient(100deg, rgba(255,255,255,0.04) 0%, transparent 9%)',
  opacity: pressed.value ? layers.value.rimOpacityDown : layers.value.rimOpacityUp,
  transition: 'opacity 140ms ease-out',
  zIndex: 4,
}));

const shiftLabelStyle = computed(() => ({
  top: `calc(${sculpt.value.insetTop}px + ${LEGEND_SHARED.shiftTopOffset})`,
  left: LEGEND_SHARED.shiftLeftOffset,
  fontSize: legendFont.value.shift,
  color: layers.value.legendShift,
  opacity: LEGEND_SHARED.shiftOpacity,
  letterSpacing: '0.01em',
  textShadow: layers.value.legendShadow,
}));

const primaryLabelStyle = computed(() => ({
  bottom: `calc(${sculpt.value.insetBottom}px + ${LEGEND_SHARED.primaryBottomOffset})`,
  left: primaryAlign.value === 'left' ? LEGEND_SHARED.primaryLeftOffset : (props.config.shiftLabel ? `calc(50% - ${LEGEND_SHARED.opticalCenterShift})` : '50%'),
  transform: primaryAlign.value === 'left' ? undefined : 'translateX(-50%)',
  fontSize: small.value ? legendFont.value.small : legendFont.value.normal,
  color: layers.value.legendPrimary,
  opacity: LEGEND_SHARED.primaryOpacity,
  letterSpacing: small.value ? '0.015em' : '-0.01em',
  textShadow: layers.value.legendShadow,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'clip',
  maxWidth: '100%',
}));

const handlePress = (event) => {
  event.currentTarget.setPointerCapture(event.pointerId);
  pointerState.press();
  emit('activate', props.config.id);
  playKeySound(getSoundCategory(props.config.id), !!muted.value, KEY_PAN[props.config.id] ?? 0);
};

const handleRelease = () => {
  pointerState.release();
  emit('deactivate', props.config.id);
};
</script>
