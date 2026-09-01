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
  KEYCAP_BASE, 
  LEGEND_INK, 
  LEGEND_INK_SOFT,
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

const layers = computed(() => {
  const v = variance.value;
  const s = sculpt.value;
  const insetTRBL = `${s.insetTop}px ${s.insetSide}px ${s.insetBottom}px ${s.insetSide}px`;
  
  return {
    insetTRBL,
    wallGradient: `linear-gradient(180deg, ${shiftLightness(props.config.orange ? "#ffb74d" : "#f0e4d1", v.lightnessShift)} 0%, ${shiftLightness(props.config.orange ? "#ffa726" : "#e0cead", v.lightnessShift)} 18%, ${shiftLightness(props.config.orange ? "#ff9800" : "#c8b394", v.lightnessShift)} 46%, ${shiftLightness(props.config.orange ? "#f57c00" : "#a68e70", v.lightnessShift * 0.7)} 78%, ${shiftLightness(props.config.orange ? "#e65100" : "#8c7458", v.lightnessShift * 0.5)} 100%)`,
    wallFilter: `hue-rotate(${v.hueShift}deg)`,
    wallNoisePosition: `${v.specularShiftX}px ${v.specularShiftY}px`,
    wallShadow: `inset 0 1px 0 rgba(255,255,255,0.4), inset 0.6px 0.4px 0 rgba(255,255,255,0.14), inset 0 -1.5px 2px rgba(15,9,4,0.16), inset 0 0 0 0.5px rgba(15,9,4,0.06)`,
    topGradient: `radial-gradient(115% 125% at ${23 + v.specularShiftX * 0.4}% 9%, rgba(255,255,255,${0.4 - v.wearAmount * 0.06}), rgba(255,255,255,0) 44%), radial-gradient(150% 120% at 50% 118%, rgba(15,9,4,${0.07 + v.wearAmount * 0.02}), transparent 60%), ${shiftLightness(props.config.orange ? "#ff9800" : KEYCAP_BASE, v.lightnessShift * 0.6)}`,
    topFilter: `hue-rotate(${v.hueShift * 0.4}deg)`,
    topNoisePosition: `${v.specularShiftY}px ${v.specularShiftX}px`,
    topShadow: `inset 0 0 0 0.75px rgba(96,70,42,0.28), inset 0 0.6px 0 rgba(255,250,238,0.4), inset 0 -0.8px 1.2px rgba(15,9,4,0.04)`,
    topShadowPressed: `inset 0 0 0 0.75px rgba(96,70,42,0.34), inset 0 0.5px 0 rgba(255,250,238,0.22), inset 0 1px 2px rgba(15,10,5,0.1)`,
    rimOpacityUp: 0.55 * v.rimBias,
    rimOpacityDown: 0.22 * v.rimBias,
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
  boxShadow: pressed.value ? '0 0.5px 1px rgba(15,9,4,0.2), 0 2px 4px rgba(15,9,4,0.12)' : contactShadow.value,
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
  opacity: noiseOpacity.value.wall,
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
  opacity: noiseOpacity.value.top,
  zIndex: 3,
}));

const rimHighlightStyle = computed(() => ({
  borderRadius: `${radius.value.top}px`,
  inset: layers.value.insetTRBL,
  background: 'radial-gradient(55% 50% at 26% 18%, rgba(255,252,244,0.28), transparent 70%)',
  opacity: pressed.value ? 0.4 : 1,
  transition: 'opacity 140ms ease-out',
  zIndex: 4,
}));

const edgeLightingStyle = computed(() => ({
  borderRadius: `${radius.value.top}px`,
  inset: layers.value.insetTRBL,
  background: 'linear-gradient(180deg, rgba(255,255,255,0.24) 0%, transparent 14%), linear-gradient(100deg, rgba(255,255,255,0.09) 0%, transparent 9%)',
  opacity: pressed.value ? layers.value.rimOpacityDown : layers.value.rimOpacityUp,
  transition: 'opacity 140ms ease-out',
  zIndex: 4,
}));

const shiftLabelStyle = computed(() => ({
  top: `calc(${sculpt.value.insetTop}px + ${LEGEND_SHARED.shiftTopOffset})`,
  left: LEGEND_SHARED.shiftLeftOffset,
  fontSize: legendFont.value.shift,
  color: props.config.orange ? '#ffffff' : LEGEND_INK_SOFT,
  opacity: LEGEND_SHARED.shiftOpacity,
  letterSpacing: '0.01em',
  textShadow: props.config.orange ? '0 0.4px 0 rgba(0,0,0,0.1), 0 0 0.3px rgba(35,28,18,0.3)' : '0 0.4px 0 rgba(255,255,255,0.32), 0 0 0.3px rgba(35,28,18,0.3)',
}));

const primaryLabelStyle = computed(() => ({
  bottom: `calc(${sculpt.value.insetBottom}px + ${LEGEND_SHARED.primaryBottomOffset})`,
  left: primaryAlign.value === 'left' ? LEGEND_SHARED.primaryLeftOffset : (props.config.shiftLabel ? `calc(50% - ${LEGEND_SHARED.opticalCenterShift})` : '50%'),
  transform: primaryAlign.value === 'left' ? undefined : 'translateX(-50%)',
  fontSize: small.value ? legendFont.value.small : legendFont.value.normal,
  color: props.config.orange ? '#ffffff' : LEGEND_INK,
  opacity: LEGEND_SHARED.primaryOpacity,
  letterSpacing: small.value ? '0.015em' : '-0.01em',
  textShadow: props.config.orange ? '0 0.4px 0 rgba(0,0,0,0.1), 0 0 0.35px rgba(30,24,16,0.35)' : '0 0.4px 0 rgba(255,255,255,0.28), 0 0 0.35px rgba(30,24,16,0.35)',
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
