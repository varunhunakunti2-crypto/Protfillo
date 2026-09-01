<template>
  <div
    ref="wrapperRef"
    class="relative h-screen w-full"
    style="clip-path: polygon(0% 0, 100% 0%, 100% 100%, 0 100%)"
  >
    <footer class="fixed bottom-0 left-0 flex h-screen w-full flex-col justify-between overflow-hidden cinematic-footer-wrapper text-[color:var(--theme-text-strong)] bg-[color:var(--theme-bg)]" style="--background: var(--theme-bg); --foreground: var(--theme-text-strong); --primary: var(--theme-text-strong); --secondary: var(--theme-text-muted); --destructive: #ef4444; --border: var(--theme-line-soft); --muted-foreground: var(--theme-text-muted);">
      
      <!-- Ambient Light & Grid Background -->
      <div class="footer-aurora absolute left-1/2 top-1/2 h-[60vh] w-[80vw] -translate-x-1/2 -translate-y-1/2 animate-footer-breathe rounded-[50%] blur-[80px] pointer-events-none z-0" />
      <div class="footer-bg-grid absolute inset-0 z-0 pointer-events-none" />

      <!-- Giant background text -->
      <div
        ref="giantTextRef"
        class="footer-giant-bg-text absolute -bottom-[5vh] w-full text-center whitespace-nowrap z-0 pointer-events-none select-none"
      >
        VARUN
      </div>

      <!-- 1. Diagonal Sleek Marquee (Top of footer) -->
      <div class="absolute top-12 left-0 w-full overflow-hidden border-y border-[var(--border)] bg-[color-mix(in_srgb,var(--theme-bg)_60%,transparent)] backdrop-blur-md py-4 z-10 -rotate-2 scale-110 shadow-2xl">
        <div class="flex w-max animate-footer-scroll-marquee text-xs md:text-sm font-bold tracking-[0.3em] text-[var(--muted-foreground)] uppercase">
          <div class="flex items-center space-x-12 px-6">
            <span>Accountability Redefined</span> <span class="text-[var(--primary)]/60">✦</span>
            <span>Transparent Tracking</span> <span class="text-[var(--secondary)]/60">✦</span>
            <span>Creative Development</span> <span class="text-[var(--primary)]/60">✦</span>
            <span>Sponsor Connection</span> <span class="text-[var(--secondary)]/60">✦</span>
            <span>Absolute Privacy</span> <span class="text-[var(--primary)]/60">✦</span>
          </div>
          <div class="flex items-center space-x-12 px-6">
            <span>Accountability Redefined</span> <span class="text-[var(--primary)]/60">✦</span>
            <span>Transparent Tracking</span> <span class="text-[var(--secondary)]/60">✦</span>
            <span>Creative Development</span> <span class="text-[var(--primary)]/60">✦</span>
            <span>Sponsor Connection</span> <span class="text-[var(--secondary)]/60">✦</span>
            <span>Absolute Privacy</span> <span class="text-[var(--primary)]/60">✦</span>
          </div>
        </div>
      </div>

      <!-- 2. Main Center Content -->
      <div class="relative z-10 flex flex-1 flex-col items-center justify-center px-6 mt-20 w-full max-w-5xl mx-auto">
        <h2
          ref="headingRef"
          class="text-5xl md:text-8xl font-black footer-text-glow tracking-tighter mb-12 text-center"
        >
          Clear mind. Full focus.
        </h2>

        <!-- Interactive Magnetic Pills Layout -->
        <div ref="linksRef" class="flex flex-col items-center gap-6 w-full">
          <!-- Social & Inquiry Links (Primary) -->
          <div class="flex flex-wrap justify-center gap-4 w-full">
            <a href="https://github.com/varunhunakunti2-crypto" target="_blank" rel="noopener noreferrer" class="footer-glass-pill cursor-pointer px-10 py-5 rounded-full font-bold text-sm md:text-base flex items-center gap-3 group" @mousemove="handleMouseMove" @mouseleave="handleMouseLeave">
              <i class="bi bi-github text-lg text-[var(--muted-foreground)] group-hover:text-[color:var(--foreground)] transition-colors"></i>
              GITHUB
            </a>
            
            <a href="https://www.linkedin.com/in/varun-kumar11/" target="_blank" rel="noopener noreferrer" class="footer-glass-pill cursor-pointer px-10 py-5 rounded-full font-bold text-sm md:text-base flex items-center gap-3 group" @mousemove="handleMouseMove" @mouseleave="handleMouseLeave">
              <i class="bi bi-linkedin text-lg text-[var(--muted-foreground)] group-hover:text-[color:var(--foreground)] transition-colors"></i>
              LINKEDIN
            </a>

            <a href="mailto:varunhunakunti2@gmail.com" class="footer-glass-pill cursor-pointer px-10 py-5 rounded-full font-bold text-sm md:text-base flex items-center gap-3 group" @mousemove="handleMouseMove" @mouseleave="handleMouseLeave">
              <i class="bi bi-envelope text-lg text-[var(--muted-foreground)] group-hover:text-[color:var(--foreground)] transition-colors"></i>
              INQUIRY
            </a>
          </div>


        </div>
      </div>

      <!-- 3. Bottom Bar / Credits -->
      <div class="relative z-20 w-full pb-8 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
        
        <!-- Copyright -->
        <div class="text-[var(--muted-foreground)] text-[10px] md:text-xs font-semibold tracking-widest uppercase order-2 md:order-1">
          © 2026 VARUN. All rights reserved.
        </div>



        <!-- Back to top -->
        <button
          @click="scrollToTop"
          class="w-12 h-12 cursor-pointer rounded-full footer-glass-pill flex items-center justify-center text-[var(--muted-foreground)] hover:text-[color:var(--foreground)] group order-3"
          @mousemove="handleMouseMove" 
          @mouseleave="handleMouseLeave"
        >
          <svg class="w-5 h-5 transform group-hover:-translate-y-1.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
          </svg>
        </button>

      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const wrapperRef = ref(null);
const giantTextRef = ref(null);
const headingRef = ref(null);
const linksRef = ref(null);

let ctx;



const handleMouseMove = (e) => {
  const element = e.currentTarget;
  const rect = element.getBoundingClientRect();
  const h = rect.width / 2;
  const w = rect.height / 2;
  const x = e.clientX - rect.left - h;
  const y = e.clientY - rect.top - w;

  gsap.to(element, {
    x: x * 0.4,
    y: y * 0.4,
    rotationX: -y * 0.15,
    rotationY: x * 0.15,
    scale: 1.05,
    ease: "power2.out",
    duration: 0.4,
  });
};

const handleMouseLeave = (e) => {
  const element = e.currentTarget;
  gsap.to(element, {
    x: 0,
    y: 0,
    rotationX: 0,
    rotationY: 0,
    scale: 1,
    ease: "elastic.out(1, 0.3)",
    duration: 1.2,
  });
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

onMounted(() => {


  ctx = gsap.context(() => {
    // Background Parallax
    gsap.fromTo(
      giantTextRef.value,
      { y: "10vh", scale: 0.8, opacity: 0 },
      {
        y: "0vh",
        scale: 1,
        opacity: 1,
        ease: "power1.out",
        scrollTrigger: {
          trigger: wrapperRef.value,
          start: "top 80%",
          end: "bottom bottom",
          scrub: 1,
        },
      }
    );

    // Staggered Content Reveal
    gsap.fromTo(
      [headingRef.value, linksRef.value],
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: wrapperRef.value,
          start: "top 40%",
          end: "bottom bottom",
          scrub: 1,
        },
      }
    );
  }, wrapperRef.value);
});

onUnmounted(() => {

  if (ctx) ctx.revert();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');

.cinematic-footer-wrapper {
  font-family: 'Plus Jakarta Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
  
  /* Dynamic Variables using standard shadcn/tailwind v4 tokens */
  --pill-bg-1: color-mix(in oklch, var(--foreground) 3%, transparent);
  --pill-bg-2: color-mix(in oklch, var(--foreground) 1%, transparent);
  --pill-shadow: color-mix(in oklch, var(--background) 50%, transparent);
  --pill-highlight: color-mix(in oklch, var(--foreground) 10%, transparent);
  --pill-inset-shadow: color-mix(in oklch, var(--background) 80%, transparent);
  --pill-border: color-mix(in oklch, var(--foreground) 8%, transparent);
  
  --pill-bg-1-hover: color-mix(in oklch, var(--foreground) 8%, transparent);
  --pill-bg-2-hover: color-mix(in oklch, var(--foreground) 2%, transparent);
  --pill-border-hover: color-mix(in oklch, var(--foreground) 20%, transparent);
  --pill-shadow-hover: color-mix(in oklch, var(--background) 70%, transparent);
  --pill-highlight-hover: color-mix(in oklch, var(--foreground) 20%, transparent);
}

@keyframes footer-breathe {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
  100% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
}

@keyframes footer-scroll-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

@keyframes footer-heartbeat {
  0%, 100% { transform: scale(1); filter: drop-shadow(0 0 5px color-mix(in oklch, var(--destructive) 50%, transparent)); }
  15%, 45% { transform: scale(1.2); filter: drop-shadow(0 0 10px color-mix(in oklch, var(--destructive) 80%, transparent)); }
  30% { transform: scale(1); }
}

.animate-footer-breathe {
  animation: footer-breathe 8s ease-in-out infinite alternate;
}

.animate-footer-scroll-marquee {
  animation: footer-scroll-marquee 40s linear infinite;
}

.animate-footer-heartbeat {
  animation: footer-heartbeat 2s cubic-bezier(0.25, 1, 0.5, 1) infinite;
}

/* Theme-adaptive Grid Background */
.footer-bg-grid {
  background-size: 60px 60px;
  background-image: 
    linear-gradient(to right, color-mix(in oklch, var(--foreground) 3%, transparent) 1px, transparent 1px),
    linear-gradient(to bottom, color-mix(in oklch, var(--foreground) 3%, transparent) 1px, transparent 1px);
  mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
  -webkit-mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
}

/* Theme-adaptive Aurora Glow */
.footer-aurora {
  background: radial-gradient(
    circle at 50% 50%, 
    color-mix(in oklch, var(--primary) 15%, transparent) 0%, 
    color-mix(in oklch, var(--secondary) 15%, transparent) 40%, 
    transparent 70%
  );
}

/* Glass Pill Theming */
.footer-glass-pill {
  background: linear-gradient(145deg, var(--pill-bg-1) 0%, var(--pill-bg-2) 100%);
  box-shadow: 
      0 10px 30px -10px var(--pill-shadow), 
      inset 0 1px 1px var(--pill-highlight), 
      inset 0 -1px 2px var(--pill-inset-shadow);
  border: 1px solid var(--pill-border);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.footer-glass-pill:hover {
  background: linear-gradient(145deg, var(--pill-bg-1-hover) 0%, var(--pill-bg-2-hover) 100%);
  border-color: var(--pill-border-hover);
  box-shadow: 
      0 20px 40px -10px var(--pill-shadow-hover), 
      inset 0 1px 1px var(--pill-highlight-hover);
  color: var(--foreground);
}

/* Giant Background Text Masking */
.footer-giant-bg-text {
  font-size: 26vw;
  line-height: 0.75;
  font-weight: 900;
  letter-spacing: -0.05em;
  color: transparent;
  -webkit-text-stroke: 1px color-mix(in oklch, var(--foreground) 5%, transparent);
  background: linear-gradient(180deg, color-mix(in oklch, var(--foreground) 15%, transparent) 0%, transparent 60%);
  -webkit-background-clip: text;
  background-clip: text;
}

/* Metallic Text Glow */
.footer-text-glow {
  background: linear-gradient(180deg, var(--foreground) 0%, color-mix(in oklch, var(--foreground) 40%, transparent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0px 0px 20px color-mix(in oklch, var(--foreground) 15%, transparent));
}
</style>
