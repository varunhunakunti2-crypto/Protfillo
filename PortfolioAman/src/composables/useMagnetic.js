import { onMounted, onBeforeUnmount } from 'vue';
import gsap from 'gsap';

/**
 * Creates a magnetic effect on a Vue ref or element.
 * @param {import('vue').Ref<HTMLElement | null>} elRef - Vue ref containing the element
 * @param {Object} options
 * @param {number} [options.strength=0.3] - The pull strength (0 to 1)
 * @param {number} [options.duration=0.6] - Animation duration in seconds
 */
export function useMagnetic(elRef, options = {}) {
  const { strength = 0.3, duration = 0.6 } = options;

  let el = null;

  const onMouseMove = (e) => {
    if (!el) return;
    
    const rect = el.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);

    // Pull the button towards the cursor
    gsap.to(el, {
      x: x * strength,
      y: y * strength,
      duration: duration,
      ease: 'power3.out',
      overwrite: 'auto'
    });
  };

  const onMouseLeave = () => {
    if (!el) return;

    // Reset button position smoothly
    gsap.to(el, {
      x: 0,
      y: 0,
      duration: 0.8,
      ease: 'elastic.out(1, 0.3)',
      overwrite: 'auto'
    });
  };

  onMounted(() => {
    el = elRef.value;
    if (!el) return;

    el.addEventListener('mousemove', onMouseMove);
    el.addEventListener('mouseleave', onMouseLeave);
  });

  onBeforeUnmount(() => {
    if (!el) return;
    el.removeEventListener('mousemove', onMouseMove);
    el.removeEventListener('mouseleave', onMouseLeave);
  });
}

/**
 * Applies magnetic effect directly to a DOM element.
 * @param {HTMLElement} el
 * @param {Object} options
 */
export function makeMagnetic(el, options = {}) {
  if (!el) return;
  const { strength = 0.3, duration = 0.6 } = options;

  const onMouseMove = (e) => {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);

    gsap.to(el, {
      x: x * strength,
      y: y * strength,
      duration: duration,
      ease: 'power3.out',
      overwrite: 'auto'
    });
  };

  const onMouseLeave = () => {
    gsap.to(el, {
      x: 0,
      y: 0,
      duration: 0.8,
      ease: 'elastic.out(1, 0.3)',
      overwrite: 'auto'
    });
  };

  el.addEventListener('mousemove', onMouseMove);
  el.addEventListener('mouseleave', onMouseLeave);

  return () => {
    el.removeEventListener('mousemove', onMouseMove);
    el.removeEventListener('mouseleave', onMouseLeave);
  };
}
