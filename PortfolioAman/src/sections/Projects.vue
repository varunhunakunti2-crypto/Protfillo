<template>
  <section
    id="projects"
    ref="projectsSection"
    class="projects-section relative max-w-[1200px] mx-auto py-8 pb-20 mb-24 md:mb-32 px-[clamp(1rem,5vw,4rem)]"
  >
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <article
        v-for="(project, index) in projects"
        :key="project.id"
        class="project-card flex flex-col rounded-[20px] overflow-hidden cursor-pointer"
        ref="projectItems"
        data-cursor="view"
        @click="goToProject(project)"
      >
        <div class="project-image-container relative h-56 w-full overflow-hidden">
          <!-- Category Badge -->
          <div class="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase" style="background: rgba(0,0,0,0.65); color: #fff; backdrop-filter: blur(8px);">
            {{ project.category }}
          </div>
          
          <!-- Links -->
          <div class="absolute top-4 right-4 z-10 flex gap-2">
             <a v-if="project.github" :href="project.github" target="_blank" @click.stop class="icon-btn magnetic-project-btn" aria-label="GitHub Repository">
                <i class="bi bi-github"></i>
             </a>
             <a v-if="project.link" :href="project.link" target="_blank" @click.stop class="icon-btn magnetic-project-btn" aria-label="Live Site">
                <i class="bi bi-box-arrow-up-right"></i>
             </a>
          </div>

          <img
            :src="project.image"
            :alt="project.title"
            class="w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-105"
            loading="lazy"
            decoding="async"
          />
        </div>
        
        <div class="project-content p-6 flex-1 flex flex-col">
          <h3 class="text-[1.35rem] font-bold mb-3 text-[color:var(--theme-text-strong)] tracking-tight">{{ project.title }}</h3>
          <p class="text-[0.95rem] text-[color:var(--theme-text-muted)] mb-6 flex-1 leading-relaxed">{{ project.description }}</p>
          
          <div class="flex flex-wrap gap-2 mt-auto pt-4">
            <span
              v-for="(tag, tagIndex) in project.tags"
              :key="tagIndex"
              class="project-tag"
            >
              {{ tag }}
            </span>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed, inject, onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { makeMagnetic } from '@/composables/useMagnetic.js';
import progress1Img from '@/assets/progress1.jpg';
import freelanceHubImg from '@/assets/freelance-hub.png';
import vibeVineImg from '@/assets/vibe-vine.png';
import animationGalleryImg from '@/assets/animation-gallery.png';

const { t } = useI18n();
const router = useRouter();
const startPageTransition = inject('startPageTransition', null);
const projectsSection = ref(null);
const projectItems = ref([]);
const magneticCleanups = [];

const projects = computed(() => [
  {
    id: 1,
    category: "WEB • PLATFORM",
    title: t('projects.freelanceHub') || "FreelaceHub",
    description: t('projects.freelanceHubSubtitle') || "A platform for freelancers and clients to connect and collaborate.",
    tags: ["React", "Node.js", "MongoDB"],
    image: freelanceHubImg,
    github: "https://github.com/varunhunakunti2-crypto/FreelaceHub",
    link: "https://freelace-hub.vercel.app/"
  },
  {
    id: 2,
    category: "RESTAURANT • WEB APP",
    title: t('projects.vibeVine') || "VIBE&VINE",
    description: t('projects.vibeVineSubtitle') || "Experience the best of modern flavors in a vibrant atmosphere with craft cocktails and social dining.",
    tags: ["React", "Tailwind CSS", "Node.js"],
    image: vibeVineImg,
    github: "https://github.com/varunhunakunti2-crypto/drone-website-",
    link: "https://soft-kataifi-0d1347.netlify.app/"
  },
  {
    id: 3,
    category: "3D • ANIMATION",
    title: t('projects.animationGallery') || "animation_gallary",
    description: t('projects.animationGallerySubtitle') || "A place to display your masterpiece. Artists can display their masterpieces, and buyers can discover and collect.",
    tags: ["React", "GSAP", "Three.js", "Tailwind CSS"],
    image: animationGalleryImg,
    github: "https://github.com/varunhunakunti2-crypto/animation_gallary",
    link: "https://animation-gallary.vercel.app/"
  },
  {
    id: 4,
    category: "PREDICTIVE ML",
    title: t('projects.taskApp') || "Task Management App",
    description: t('projects.taskAppSubtitle') || "A collaborative task management tool with real-time updates.",
    tags: ["Vue", "TensorFlow", "Node.js"],
    image: progress1Img,
    github: "#",
    link: "#"
  }
]);

let projectsTimeline = null;

const goToProject = (project) => {
  if (!project) return;
  const fromSection = projectsSection.value?.id || "projects";
  const navigate = () => {
    router.push({ name: "project-progress", query: { from: fromSection, id: project.id } });
  };
  if (startPageTransition) {
    startPageTransition(navigate);
  } else {
    navigate();
  }
};

onMounted(async () => {
  const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
  ]);
  gsap.registerPlugin(ScrollTrigger);

  const sectionEl = projectsSection.value;
  if (!sectionEl) return;

  const items = sectionEl.querySelectorAll('.project-card');
  if (!items.length) return;

  gsap.set(items, {
    opacity: 0,
    y: 50
  });

  projectsTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: sectionEl,
      start: 'top 75%',
      toggleActions: 'play none none none'
    }
  });

  projectsTimeline.to(items, {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: 'power3.out',
    stagger: 0.15
  });

  const magneticEls = sectionEl.querySelectorAll('.magnetic-project-btn');
  magneticEls.forEach((el) => {
    const cleanup = makeMagnetic(el, { strength: 0.35 });
    if (cleanup) magneticCleanups.push(cleanup);
  });
});

onUnmounted(() => {
  magneticCleanups.forEach((cleanup) => cleanup());
  if (projectsTimeline) {
    if (projectsTimeline.scrollTrigger) projectsTimeline.scrollTrigger.kill();
    projectsTimeline.kill();
    projectsTimeline = null;
  }
});
</script>

<style scoped>
.project-card {
  position: relative;
  background: var(--project-card-bg);
  border: 1px solid var(--project-card-border);
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), 
              box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1), 
              border-color 0.4s ease,
              background-color 0.4s ease;
  will-change: transform;
}

.project-card:hover {
  transform: translateY(-8px) scale(1.01);
  box-shadow: var(--project-card-shadow);
  border-color: var(--project-hover-border);
}

.project-card h3 {
  transition: color 0.3s ease;
}

.project-card:hover h3 {
  color: var(--project-title-hover);
}

.project-image-container {
  border-bottom: 1px solid var(--project-card-border);
}

.project-image-container::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.35) 0%, transparent 60%);
  opacity: 0.6;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.project-card:hover .project-image-container::after {
  opacity: 0.15;
}

.project-card .project-image-container img {
  transition: transform 0.7s cubic-bezier(0.2, 1, 0.2, 1);
}

.project-card:hover .project-image-container img {
  transform: scale(1.08);
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.65);
  color: #fff;
  backdrop-filter: blur(8px);
  transition: background 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
  font-size: 0.95rem;
}

.icon-btn:hover {
  background: rgba(139, 92, 246, 0.85);
  transform: scale(1.15) rotate(5deg);
  box-shadow: 0 0 15px rgba(139, 92, 246, 0.5);
}

.project-tag {
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 500;
  background: var(--project-tag-bg);
  color: var(--project-tag-color);
  border: 1px solid var(--project-tag-border);
  white-space: nowrap;
  transition: all 0.3s ease;
}

.project-card:hover .project-tag {
  background: var(--project-tag-hover-bg);
  border-color: var(--project-tag-hover-border);
  color: var(--project-tag-hover-color);
}

:global([data-theme="dark"]) {
  --project-card-bg: rgba(22, 25, 30, 0.65);
  --project-card-border: rgba(255, 255, 255, 0.08);
  --project-hover-border: rgba(139, 92, 246, 0.4);
  --project-card-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px -5px rgba(139, 92, 246, 0.18);
  --project-title-hover: #ffffff;
  --project-tag-bg: rgba(255, 255, 255, 0.03);
  --project-tag-border: rgba(255, 255, 255, 0.08);
  --project-tag-color: rgba(255, 255, 255, 0.7);
  --project-tag-hover-bg: rgba(139, 92, 246, 0.12);
  --project-tag-hover-border: rgba(139, 92, 246, 0.35);
  --project-tag-hover-color: #ffffff;
}

:global([data-theme="light"]) {
  --project-card-bg: #ffffff;
  --project-card-border: rgba(0, 0, 0, 0.08);
  --project-hover-border: rgba(99, 102, 241, 0.4);
  --project-card-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.12), 0 0 25px -5px rgba(99, 102, 241, 0.15);
  --project-title-hover: #4f46e5;
  --project-tag-bg: rgba(0, 0, 0, 0.03);
  --project-tag-border: rgba(0, 0, 0, 0.06);
  --project-tag-color: var(--theme-text-muted);
  --project-tag-hover-bg: rgba(99, 102, 241, 0.08);
  --project-tag-hover-border: rgba(99, 102, 241, 0.3);
  --project-tag-hover-color: #4f46e5;
}

:root {
  --project-card-bg: rgba(22, 25, 30, 0.65);
  --project-card-border: rgba(255, 255, 255, 0.08);
  --project-hover-border: rgba(139, 92, 246, 0.4);
  --project-card-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px -5px rgba(139, 92, 246, 0.18);
  --project-title-hover: #ffffff;
  --project-tag-bg: rgba(255, 255, 255, 0.03);
  --project-tag-border: rgba(255, 255, 255, 0.08);
  --project-tag-color: rgba(255, 255, 255, 0.7);
  --project-tag-hover-bg: rgba(139, 92, 246, 0.12);
  --project-tag-hover-border: rgba(139, 92, 246, 0.35);
  --project-tag-hover-color: #ffffff;
}
</style>
