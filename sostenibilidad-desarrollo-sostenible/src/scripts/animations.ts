import { gsap } from 'gsap';

export const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Divide en palabras los títulos marcados con data-a="words", conservando <em>, <span>, etc. */
export function splitWords(root: ParentNode) {
  root.querySelectorAll<HTMLElement>('[data-a="words"]').forEach((el) => {
    if (el.dataset.split) return;
    el.dataset.split = 'true';
    const walk = (node: Node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const frag = document.createDocumentFragment();
          (child.textContent ?? '').split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) {
              frag.append(document.createTextNode(' '));
              return;
            }
            const outer = document.createElement('span');
            outer.className = 'inline-block overflow-hidden align-bottom pt-[0.18em] mt-[-0.18em] pb-[0.08em] mb-[-0.08em]';
            const inner = document.createElement('span');
            inner.className = 'word inline-block';
            inner.textContent = part;
            outer.append(inner);
            frag.append(outer);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          walk(child);
        }
      });
    };
    walk(el);
  });
}

const from: Record<string, gsap.TweenVars> = {
  fade: { autoAlpha: 0 },
  up: { autoAlpha: 0, y: 60 },
  down: { autoAlpha: 0, y: -60 },
  left: { autoAlpha: 0, x: -80 },
  right: { autoAlpha: 0, x: 80 },
  scale: { autoAlpha: 0, scale: 0.85 },
  line: { autoAlpha: 0, scaleX: 0, transformOrigin: 'left center' },
  tile: { autoAlpha: 0, y: 50, rotateX: -35, scale: 0.9, transformPerspective: 900 },
};

/** Timeline de entrada de una diapositiva: los elementos aparecen en el orden del DOM. */
export function buildEnter(slide: HTMLElement): gsap.core.Timeline {
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out', duration: 0.9 } });
  const items = [...slide.querySelectorAll<HTMLElement>('[data-a]')];

  items.forEach((el, i) => {
    const type = el.dataset.a ?? 'fade';
    const at = 0.15 + i * (type === 'tile' ? 0.05 : 0.09);

    if (type === 'words') {
      tl.set(el, { autoAlpha: 1 }, at);
      tl.fromTo(
        el.querySelectorAll('.word'),
        { yPercent: 110, rotate: 4 },
        { yPercent: 0, rotate: 0, duration: 1, stagger: 0.045, ease: 'expo.out' },
        at,
      );
      return;
    }

    const vars = from[type] ?? from.fade;
    tl.fromTo(el, vars, { autoAlpha: 1, x: 0, y: 0, scale: 1, scaleX: 1, rotateX: 0 }, at);
  });

  // Contadores numéricos (193, 17, 169…)
  slide.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
    const target = Number(el.dataset.count);
    const obj = { v: 0 };
    tl.fromTo(
      obj,
      { v: 0 },
      {
        v: target,
        duration: 1.6,
        ease: 'power2.out',
        onUpdate: () => (el.textContent = String(Math.round(obj.v))),
      },
      0.4,
    );
  });

  return tl;
}

/** Muestra todo sin animar (movimiento reducido). */
export function showAll(slide: HTMLElement) {
  gsap.set(slide.querySelectorAll('[data-a]'), { autoAlpha: 1, x: 0, y: 0, scale: 1, scaleX: 1, rotateX: 0 });
  gsap.set(slide.querySelectorAll('.word'), { yPercent: 0, rotate: 0 });
  slide.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => (el.textContent = el.dataset.count ?? ''));
}
