<template>
  <div
    class="kb-viewport flex w-full items-center justify-center overflow-x-hidden bg-black"
    :style="{ padding: container.padding }"
  >
    <div
      class="flex flex-col items-center"
      :style="{ width: '100%', maxWidth: container.maxWidth }"
    >
      <div
        class="flex items-center justify-center"
        :style="{
          marginBottom: 'clamp(0.65rem, 2.2vw, 1.15rem)',
          minHeight: 'clamp(1.6rem, 3vw, 1.9rem)',
          fontFamily: `'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`
        }"
      >
        <div
          :style="{
            opacity: indicatorVisible ? 1 : 0,
            transition: 'opacity 220ms ease-out'
          }"
        >
          <div v-if="indicatorParts && indicatorParts.length > 0" class="flex items-center justify-center" style="gap: 5px;">
            <template v-for="(part, i) in indicatorParts" :key="part + '-' + i">
              <span
                v-if="i > 0"
                style="font-size: 0.72rem; font-weight: 500; color: rgba(255,255,255,0.5); line-height: 1;"
              >
                +
              </span>
              <kbd
                style="
                  font-family: inherit;
                  font-size: clamp(0.72rem, 1.3vw, 0.82rem);
                  font-weight: 600;
                  line-height: 1;
                  color: #1a1a1a;
                  background: #e8e8e8;
                  border: 1px solid #555;
                  border-radius: 6px;
                  padding: 5px 8px;
                  box-shadow: 0 1px 0 rgba(255,255,255,0.15) inset, 0 2px 4px rgba(0,0,0,0.4);
                  letter-spacing: 0.01em;
                "
              >
                {{ part }}
              </kbd>
            </template>
          </div>
          <span
            v-else
            style="
              font-size: clamp(0.8rem, 1.5vw, 0.9rem);
              font-weight: 500;
              letter-spacing: 0.01em;
              color: rgba(255,255,255,0.35);
            "
          >
            Press any key...
          </span>
        </div>
      </div>
      
      <div style="perspective: 1800px; width: 100%;">
        <div
          class="relative w-full"
          style="transform: rotateX(7deg); transform-origin: 50% 100%;"
        >
          <!-- shadows -->
          <div
            class="absolute inset-x-[16%] top-[99%] -z-10 h-1 rounded-full blur-[1.5px]"
            style="background: rgba(15,10,6,0.2);"
          />
          <div
            class="absolute -inset-x-2 top-14 bottom-0 -z-10 rounded-[1.5rem] blur-lg"
            style="background: radial-gradient(55% 70% at 50% 82%, rgba(15,10,6,0.06), transparent 72%);"
          />
          
          <div
            class="relative rounded-[var(--kb-case-radius)]"
            :style="{
              padding: caseTier.casePadding,
              background: `linear-gradient(180deg, rgba(255,255,255,0.045) 0%, transparent 9%), repeating-linear-gradient(180deg, rgba(70,42,16,0.08) 0px, transparent 2px, transparent 6px, rgba(70,42,16,0.055) 8px, transparent 13px), linear-gradient(178deg, #ad7440 0%, #9d6636 26%, #895128 55%, #764a24 78%, #63391a 100%)`,
              boxShadow: '0 0.5px 0 rgba(255,222,185,0.18) inset, 0 -2px 4.5px rgba(35,19,6,0.32) inset, 0.4px 0.4px 0.8px rgba(255,232,200,0.14) inset, 0 3px 6px rgba(15,8,3,0.22), 0 1px 2px rgba(15,8,3,0.2)',
              '--kb-case-radius': caseTier.caseRadius,
              '--kb-bezel-radius': caseTier.bezelRadius
            }"
          >
            <!-- case textures -->
            <div class="pointer-events-none absolute inset-0 rounded-[var(--kb-case-radius)] mix-blend-multiply" :style="{ backgroundImage: `url('${WOOD_TONE_URI}')`, backgroundSize: '520px 520px', opacity: 0.46 }" />
            <div class="pointer-events-none absolute inset-0 rounded-[var(--kb-case-radius)] mix-blend-multiply" :style="{ backgroundImage: `url('${WOOD_GRAIN_URI}')`, backgroundSize: '460px 460px', opacity: 0.5 }" />
            <div class="pointer-events-none absolute inset-0 rounded-[var(--kb-case-radius)] mix-blend-multiply" :style="{ backgroundImage: `url('${WOOD_GRAIN_FINE_URI}')`, backgroundSize: '300px 300px', backgroundPosition: '23px 11px', opacity: 0.24 }" />
            
            <div class="pointer-events-none absolute inset-0 rounded-[var(--kb-case-radius)] mix-blend-overlay" style="background: repeating-linear-gradient(179deg, rgba(255,228,192,0.065) 0px, transparent 3px, transparent 17px, rgba(45,23,7,0.1) 20px, transparent 29px), repeating-linear-gradient(183deg, rgba(255,228,192,0.032) 0px, transparent 7px, transparent 41px, rgba(45,23,7,0.055) 44px, transparent 59px); opacity: 0.58;" />
            <div class="pointer-events-none absolute inset-0 rounded-[var(--kb-case-radius)] mix-blend-multiply" :style="{ backgroundImage: `url('${WOOD_PORE_URI}')`, backgroundSize: '130px 130px', opacity: 0.34 }" />
            <div class="pointer-events-none absolute inset-0 rounded-[var(--kb-case-radius)] mix-blend-screen" :style="{ backgroundImage: `url('${WOOD_MICROSCRATCH_URI}')`, backgroundSize: '620px 420px', opacity: 0.5 }" />
            <div class="pointer-events-none absolute inset-0 rounded-[var(--kb-case-radius)]" :style="{ backgroundImage: `url('${WOOD_DENT_URI}')`, backgroundSize: '100% 100%', opacity: 0.28 }" />
            <div class="pointer-events-none absolute inset-0 rounded-[var(--kb-case-radius)]" style="background: linear-gradient(112deg, transparent 30%, rgba(255,244,222,0.06) 44%, rgba(255,244,222,0.1) 49%, rgba(255,244,222,0.05) 54%, transparent 68%); mix-blend-mode: screen;" />
            
            <div class="pointer-events-none absolute rounded-tl-[var(--kb-case-radius)] mix-blend-multiply" :style="{ left: 0, top: 0, width: '9%', height: '18%', backgroundImage: `url('${END_GRAIN_URI}')`, backgroundSize: '80px 80px', opacity: 0.56, maskImage: 'radial-gradient(ellipse at top left, black, transparent 75%)' }" />
            <div class="pointer-events-none absolute rounded-br-[var(--kb-case-radius)] mix-blend-multiply" :style="{ right: 0, bottom: 0, width: '10%', height: '20%', backgroundImage: `url('${END_GRAIN_URI}')`, backgroundSize: '80px 80px', opacity: 0.5, maskImage: 'radial-gradient(ellipse at bottom right, black, transparent 75%)' }" />
            
            <div class="pointer-events-none absolute inset-0 rounded-[var(--kb-case-radius)]" style="background: radial-gradient(85% 50% at 38% -8%, rgba(255,240,210,0.15), transparent 42%);" />
            <div class="pointer-events-none absolute inset-0 rounded-[var(--kb-case-radius)]" style="background: radial-gradient(70% 45% at 82% 108%, rgba(255,225,180,0.05), transparent 46%);" />
            <div class="pointer-events-none absolute inset-x-0 bottom-0 rounded-b-[var(--kb-case-radius)]" style="height: 14%; background: linear-gradient(180deg, transparent 0%, rgba(250,248,244,0.05) 100%); mix-blend-mode: screen;" />
            <div class="pointer-events-none absolute inset-0 rounded-[var(--kb-case-radius)]" style="box-shadow: inset 0 1px 0 rgba(255,246,224,0.6), inset 0 -1px 0 rgba(10,6,2,0.55), inset 1px 0 0 rgba(255,246,224,0.26), inset -1px 0 0 rgba(10,6,2,0.36);" />
            <div class="pointer-events-none absolute inset-[1px] rounded-[calc(var(--kb-case-radius)_-_0.06rem)] border-t border-l border-[#f6dfae]/22" />
            <div class="pointer-events-none absolute inset-[1px] rounded-[calc(var(--kb-case-radius)_-_0.06rem)] border-b border-r border-[#3f2811]/34" />
            
            <div
              class="relative rounded-[var(--kb-bezel-radius)]"
              :style="{
                padding: caseTier.bezelPadding,
                background: 'linear-gradient(155deg, #15120e 0%, #0e0c08 50%, #0a0805 100%)',
                boxShadow: 'inset 0 2.5px 6px rgba(0,0,0,0.55), inset 0 4px 8px rgba(0,0,0,0.28), inset 0 -1px 0 rgba(255,255,255,0.04), inset 0 0.5px 0 rgba(255,255,255,0.05), inset 0 0 0 1px rgba(0,0,0,0.32), 0 1px 0 rgba(255,236,204,0.1)'
              }"
            >
              <div class="pointer-events-none absolute inset-0 rounded-[var(--kb-bezel-radius)]" style="background: radial-gradient(140% 60% at 44% 0%, rgba(180,120,70,0.1), transparent 45%); z-index: 0;" />
              
              <div class="relative z-10 flex flex-col" :style="{ gap }">
                <div v-for="(row, i) in rows" :key="i" class="flex" :style="{ gap }">
                  <VintageKeyboardKey
                    v-for="keyConfig in row"
                    :key="keyConfig.id"
                    :config="keyConfig"
                    :rowIndex="i"
                    :tier="tier"
                    :registerTrigger="registerTrigger"
                    @activate="activateKey"
                    @deactivate="deactivateKey"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import VintageKeyboardKey from './VintageKeyboardKey.vue';
import { 
  ROWS, 
  getThockEngine, 
  playKeySound, 
  getSoundCategory,
  KEY_PAN,
  CODE_TO_KEY_ID,
  ALL_KEYS_BY_ID,
  MODIFIER_FAMILIES,
  resolveTier,
  CONTAINER_TIERS,
  CASE_TIERS,
  KEY_GAP_TIERS,
  getActiveKeyParts,
  WOOD_TONE_URI,
  WOOD_GRAIN_URI,
  WOOD_GRAIN_FINE_URI,
  WOOD_PORE_URI,
  WOOD_MICROSCRATCH_URI,
  WOOD_DENT_URI,
  END_GRAIN_URI
} from './vintage-keyboard-logic.js';

const rows = ROWS;
const keyTriggersRef = ref({});
const tier = ref(resolveTier());
const container = computed(() => CONTAINER_TIERS[tier.value]);
const caseTier = computed(() => CASE_TIERS[tier.value]);
const gap = computed(() => KEY_GAP_TIERS[tier.value]);

const activeKeyIds = ref([]);
const indicatorParts = ref(null);
const indicatorVisible = ref(true);

let holdTimeout = null;
let fadeTimeout = null;

const registerTrigger = (id, trigger) => {
  keyTriggersRef.value[id] = trigger;
  return () => {
    if (keyTriggersRef.value[id] === trigger) {
      delete keyTriggersRef.value[id];
    }
  };
};

const activateKey = (id) => {
  if (!activeKeyIds.value.includes(id)) {
    activeKeyIds.value.push(id);
  }
};

const deactivateKey = (id) => {
  const index = activeKeyIds.value.indexOf(id);
  if (index !== -1) {
    activeKeyIds.value.splice(index, 1);
  }
};

watch(activeKeyIds, (newVal) => {
  if (holdTimeout !== null) {
    window.clearTimeout(holdTimeout);
    holdTimeout = null;
  }
  if (fadeTimeout !== null) {
    window.clearTimeout(fadeTimeout);
    fadeTimeout = null;
  }

  if (newVal.length > 0) {
    indicatorParts.value = getActiveKeyParts(newVal);
    indicatorVisible.value = true;
    return;
  }

  if (indicatorParts.value !== null) {
    holdTimeout = window.setTimeout(() => {
      indicatorVisible.value = false;
      fadeTimeout = window.setTimeout(() => {
        indicatorParts.value = null;
        indicatorVisible.value = true;
      }, 220);
    }, 550);
  }
}, { deep: true });

onMounted(() => {
  const updateTier = () => {
    tier.value = resolveTier();
  };
  
  const mobileQuery = window.matchMedia("(max-width: 639px)");
  const tabletQuery = window.matchMedia("(max-width: 1023px)");
  
  mobileQuery.addEventListener("change", updateTier);
  tabletQuery.addEventListener("change", updateTier);
  
  getThockEngine();

  const held = new Set();

  const isTypingTarget = (target) => {
    if (!target) return false;
    const tag = target.tagName?.toLowerCase();
    return tag === "input" || tag === "textarea" || target.isContentEditable;
  };

  const releaseKey = (id) => {
    if (!held.has(id)) return;
    held.delete(id);
    keyTriggersRef.value[id]?.release();
    deactivateKey(id);
  };

  const releaseAllHeld = () => {
    held.forEach((id) => {
      keyTriggersRef.value[id]?.release();
      deactivateKey(id);
    });
    held.clear();
  };

  const reconcileModifiers = (event) => {
    if (typeof event.getModifierState !== "function") return;
    for (const { modifier, ids } of MODIFIER_FAMILIES) {
      if (!event.getModifierState(modifier)) {
        for (const id of ids) releaseKey(id);
      }
    }
  };

  const handleKeyDown = (event) => {
    reconcileModifiers(event);

    if (event.code === "AltLeft" || event.code === "AltRight") {
      event.preventDefault();
    }

    if (event.repeat) return;
    if (isTypingTarget(event.target)) return;

    const id = CODE_TO_KEY_ID[event.code];
    if (!id || held.has(id)) return;

    held.add(id);
    keyTriggersRef.value[id]?.press();
    activateKey(id);

    const config = ALL_KEYS_BY_ID[id];
    playKeySound(getSoundCategory(id), !!config?.muted, KEY_PAN[id] ?? 0);
  };

  const handleKeyUp = (event) => {
    reconcileModifiers(event);

    const id = CODE_TO_KEY_ID[event.code];
    if (!id) return;
    releaseKey(id);
  };

  const handleVisibilityChange = () => {
    if (document.hidden) releaseAllHeld();
  };

  const handleFocus = () => releaseAllHeld();

  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
  window.addEventListener("blur", releaseAllHeld);
  window.addEventListener("focus", handleFocus);
  document.addEventListener("visibilitychange", handleVisibilityChange);

  onBeforeUnmount(() => {
    mobileQuery.removeEventListener("change", updateTier);
    tabletQuery.removeEventListener("change", updateTier);
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("keyup", handleKeyUp);
    window.removeEventListener("blur", releaseAllHeld);
    window.removeEventListener("focus", handleFocus);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    
    if (holdTimeout !== null) window.clearTimeout(holdTimeout);
    if (fadeTimeout !== null) window.clearTimeout(fadeTimeout);
  });
});
</script>

<style>
.kb-key {
  --tilt: 0deg;
  will-change: transform;
  contain: layout style paint;
  backface-visibility: hidden;
  touch-action: none;
  -webkit-tap-highlight-color: transparent;
  transform: translateY(0) scale(1) rotate(var(--tilt));
  transition: transform 260ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
.kb-key[data-pressed="true"] {
  transform: translateY(4.5px) scale(0.975) rotate(calc(var(--tilt) * 0.3));
  transition: transform 15ms linear;
}
.kb-viewport {
  min-height: 100vh;
  min-height: 100dvh;
}
</style>
