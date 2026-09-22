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
  isRedKey,
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
const isRed = computed(() => isRedKey(props.config.id));

const layers = computed(() => {
  const v = variance.value;
  const s = sculpt.value;
  const insetTRBL = `${s.insetTop}px ${s.insetSide}px ${s.insetBottom}px ${s.insetSide}px`;
  const red = isRed.value;
  
  const wallGradient = red
    ? `linear-gradient(180deg, ${shiftLightness("#d92c2c", v.lightnessShift)} 0%, ${shiftLightness("#c62828", v.lightnessShift)} 18%, ${shiftLightness("#b71c1c", v.lightnessShift)} 46%, ${shiftLightness("#8e1515", v.lightnessShift * 0.7)} 78%, ${shiftLightness("#6b0d0d", v.lightnessShift * 0.5)} 100%)`
    : `linear-gradient(180deg, ${shiftLightness("#2c2f35", v.lightnessShift)} 0%, ${shiftLightness("#23262c", v.lightnessShift)} 18%, ${shiftLightness("#1b1d22", v.lightnessShift)} 46%, ${shiftLightness("#131518", v.lightnessShift * 0.7)} 78%, ${shiftLightness("#0d0e10", v.lightnessShift * 0.5)} 100%)`;

  const wallShadow = red
    ? `inset 0 1px 0 rgba(255,180,180,0.35), inset 0.6px 0.4px 0 rgba(255,180,180,0.15), inset 0 -1.5px 2px rgba(30,0,0,0.35), inset 0 0 0 0.5px rgba(20,0,0,0.2)`
    : `inset 0 1px 0 rgba(255,255,255,0.12), inset 0.6px 0.4px 0 rgba(255,255,255,0.06), inset 0 -1.5px 2px rgba(0,0,0,0.55), inset 0 0 0 0.5px rgba(0,0,0,0.4)`;

  const topGradient = red
    ? `radial-gradient(115% 125% at ${23 + v.specularShiftX * 0.4}% 9%, rgba(255,255,255,${0.32 - v.wearAmount * 0.05}), rgba(255,255,255,0) 44%), radial-gradient(150% 120% at 50% 118%, rgba(40,0,0,${0.25 + v.wearAmount * 0.05}), transparent 60%), ${shiftLightness("#c62828", v.lightnessShift * 0.6)}`
    : `radial-gradient(115% 125% at ${23 + v.specularShiftX * 0.4}% 9%, rgba(255,255,255,${0.16 - v.wearAmount * 0.04}), rgba(255,255,255,0) 44%), radial-gradient(150% 120% at 50% 118%, rgba(0,0,0,${0.45 + v.wearAmount * 0.05}), transparent 60%), ${shiftLightness("#1e2025", v.lightnessShift * 0.6)}`;

  const topShadow = red
    ? `inset 0 0 0 0.75px rgba(120,20,20,0.4), inset 0 0.6px 0 rgba(255,200,200,0.35), inset 0 -0.8px 1.2px rgba(40,0,0,0.2)`
    : `inset 0 0 0 0.75px rgba(0,0,0,0.65), inset 0 0.6px 0 rgba(255,255,255,0.12), inset 0 -0.8px 1.2px rgba(0,0,0,0.35)`;

  const topShadowPressed = red
    ? `inset 0 0 0 0.75px rgba(100,10,10,0.6), inset 0 0.5px 0 rgba(255,200,200,0.2), inset 0 1px 2px rgba(30,0,0,0.4)`
    : `inset 0 0 0 0.75px rgba(0,0,0,0.85), inset 0 0.5px 0 rgba(255,255,255,0.06), inset 0 1px 2px rgba(0,0,0,0.65)`;

  return {
    insetTRBL,
    wallGradient,
    wallFilter: `hue-rotate(${v.hueShift}deg)`,
    wallNoisePosition: `${v.specularShiftX}px ${v.specularShiftY}px`,
    wallShadow,
    topGradient,
    topFilter: `hue-rotate(${v.hueShift * 0.4}deg)`,
    topNoisePosition: `${v.specularShiftY}px ${v.specularShiftX}px`,
    topShadow,
    topShadowPressed,
    rimOpacityUp: (red ? 0.45 : 0.25) * v.rimBias,
    rimOpacityDown: (red ? 0.18 : 0.1) * v.rimBias,
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
  opacity: isRed.value ? noiseOpacity.value.wall : noiseOpacity.value.wall * 0.7,
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
  opacity: isRed.value ? noiseOpacity.value.top : noiseOpacity.value.top * 0.7,
  zIndex: 3,
}));

const rimHighlightStyle = computed(() => ({
  borderRadius: `${radius.value.top}px`,
  inset: layers.value.insetTRBL,
  background: isRed.value
    ? 'radial-gradient(55% 50% at 26% 18%, rgba(255,230,230,0.24), transparent 70%)'
    : 'radial-gradient(55% 50% at 26% 18%, rgba(255,255,255,0.12), transparent 70%)',
  opacity: pressed.value ? 0.3 : 1,
  transition: 'opacity 140ms ease-out',
  zIndex: 4,
}));

const edgeLightingStyle = computed(() => ({
  borderRadius: `${radius.value.top}px`,
  inset: layers.value.insetTRBL,
  background: isRed.value
    ? 'linear-gradient(180deg, rgba(255,255,255,0.22) 0%, transparent 14%), linear-gradient(100deg, rgba(255,255,255,0.08) 0%, transparent 9%)'
    : 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 14%), linear-gradient(100deg, rgba(255,255,255,0.04) 0%, transparent 9%)',
  opacity: pressed.value ? layers.value.rimOpacityDown : layers.value.rimOpacityUp,
  transition: 'opacity 140ms ease-out',
  zIndex: 4,
}));

const shiftLabelStyle = computed(() => ({
  top: `calc(${sculpt.value.insetTop}px + ${LEGEND_SHARED.shiftTopOffset})`,
  left: LEGEND_SHARED.shiftLeftOffset,
  fontSize: legendFont.value.shift,
  color: isRed.value ? 'rgba(255, 255, 255, 0.88)' : '#9ca3af',
  opacity: LEGEND_SHARED.shiftOpacity,
  letterSpacing: '0.01em',
  textShadow: isRed.value
    ? '0 0.4px 0 rgba(0,0,0,0.3), 0 0 0.3px rgba(35,0,0,0.5)'
    : '0 0.4px 0 rgba(0,0,0,0.8), 0 0 0.3px rgba(0,0,0,0.8)',
}));

const primaryLabelStyle = computed(() => ({
  bottom: `calc(${sculpt.value.insetBottom}px + ${LEGEND_SHARED.primaryBottomOffset})`,
  left: primaryAlign.value === 'left' ? LEGEND_SHARED.primaryLeftOffset : (props.config.shiftLabel ? `calc(50% - ${LEGEND_SHARED.opticalCenterShift})` : '50%'),
  transform: primaryAlign.value === 'left' ? undefined : 'translateX(-50%)',
  fontSize: small.value ? legendFont.value.small : legendFont.value.normal,
  color: isRed.value ? '#ffffff' : '#d1d5db',
  opacity: LEGEND_SHARED.primaryOpacity,
  letterSpacing: small.value ? '0.015em' : '-0.01em',
  textShadow: isRed.value
    ? '0 0.5px 0 rgba(0,0,0,0.35), 0 0 0.5px rgba(20,0,0,0.5)'
    : '0 0.5px 0 rgba(0,0,0,0.9), 0 0 0.5px rgba(0,0,0,0.8)',
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
