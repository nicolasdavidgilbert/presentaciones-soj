import { gsap } from 'gsap';
import { buildEnter, reducedMotion, showAll, splitWords } from './animations';
import { createScene, type ScenePreset } from './scene';
import { bindInput } from './scroll';
import { initOverview } from './overview';

/** Controlador de la presentación: una diapositiva por paso, sin depender del scroll nativo. */
export function initPresentation() {
  document.documentElement.classList.add('js');

  const stage = document.querySelector<HTMLElement>('.stage')!;
  const slides = [...stage.querySelectorAll<HTMLElement>('.slide')];
  const bar = document.querySelector<HTMLElement>('[data-progress]')!;
  const counter = document.querySelector<HTMLElement>('[data-counter]')!;
  const help = document.querySelector<HTMLElement>('[data-help]')!;
  const canvas = document.querySelector<HTMLCanvasElement>('#scene');
  const total = slides.length;

  // Las miniaturas se copian antes de que las animaciones modifiquen el marcado
  const overview = initOverview(slides, (i) => go(i), reducedMotion);

  splitWords(stage);
  const enters = slides.map((s) => buildEnter(s));

  let scene: ReturnType<typeof createScene> | null = null;
  try {
    if (canvas) scene = createScene(canvas, reducedMotion);
  } catch {
    // Sin WebGL: la presentación sigue funcionando sin la escena 3D.
    canvas?.remove();
  }

  // Escalado del lienzo 16:9 al tamaño de la ventana
  const fit = () => {
    const s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    document.documentElement.style.setProperty('--stage-scale', String(s));
  };
  fit();
  window.addEventListener('resize', fit);

  let current = -1;

  const fromHash = () => {
    const n = parseInt(location.hash.slice(1), 10);
    return Number.isFinite(n) ? Math.min(Math.max(n - 1, 0), total - 1) : 0;
  };

  function updateChrome(i: number) {
    gsap.to(bar, { scaleX: (i + 1) / total, duration: reducedMotion ? 0 : 0.8, ease: 'power3.out' });
    counter.textContent = `${i + 1} / ${total}`;
    overview.setActive(i);
    document.title = `${slides[i].dataset.title} · Sostenibilidad`;
    history.replaceState(null, '', `#${i + 1}`);
    slides.forEach((s, k) => s.setAttribute('aria-hidden', String(k !== i)));
  }

  let transition: gsap.core.Timeline | null = null;

  function go(target: number) {
    target = Math.min(Math.max(target, 0), total - 1);
    if (target === current) return;
    // Si hay una transición en curso, se completa al instante en vez de ignorar el salto
    transition?.progress(1);

    const prev = current;
    const dir = target > prev ? 1 : -1;
    const incoming = slides[target];
    const outgoing = prev >= 0 ? slides[prev] : null;
    current = target;
    updateChrome(target);
    scene?.goTo((incoming.dataset.scene as ScenePreset) ?? 'hidden');

    if (outgoing) enters[prev].pause();
    // El contenido entrante empieza oculto desde el primer fotograma (evita el «salto» si ya se visitó)
    enters[target].pause(0);
    incoming.classList.add('is-active');

    if (reducedMotion || !outgoing) {
      outgoing?.classList.remove('is-active');
      if (reducedMotion) showAll(incoming);
      else enters[target].play(0);
      return;
    }

    gsap.set(incoming, { zIndex: 2, willChange: 'transform, opacity' });
    gsap.set(outgoing, { zIndex: 1, willChange: 'transform, opacity' });

    // Solo transform y opacity: el compositor de la GPU lo mueve sin repintar la diapositiva
    transition = gsap
      .timeline({
        defaults: { duration: 0.95, ease: 'power3.inOut' },
        onComplete: () => {
          outgoing.classList.remove('is-active');
          gsap.set([incoming, outgoing], { clearProps: 'zIndex,willChange,transform,opacity,visibility' });
          transition = null;
        },
      })
      .fromTo(incoming, { xPercent: 45 * dir, scale: 1.04, autoAlpha: 0 }, { xPercent: 0, scale: 1, autoAlpha: 1 }, 0)
      .to(outgoing, { xPercent: -22 * dir, scale: 0.92, autoAlpha: 0 }, 0)
      .add(() => enters[target].play(0), 0.3);
  }

  const next = () => go(current + 1);
  const prev = () => go(current - 1);

  // Atajos y entrada
  let typed = '';
  const toggleHelp = (open?: boolean) => help.classList.toggle('is-open', open);
  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen().catch(() => {});
  };

  document.addEventListener('keydown', (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
      case 'PageDown':
      case ' ':
        e.preventDefault();
        next();
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
      case 'PageUp':
        e.preventDefault();
        prev();
        break;
      case 'Home':
        go(0);
        break;
      case 'End':
        go(total - 1);
        break;
      case 'f':
      case 'F':
        toggleFullscreen();
        break;
      case '?':
        toggleHelp();
        break;
      case 'g':
      case 'G':
        overview.toggle();
        break;
      case 'Escape':
        toggleHelp(false);
        overview.close();
        break;
      case 'Enter':
        if (typed) go(parseInt(typed, 10) - 1);
        typed = '';
        break;
      default:
        if (/^\d$/.test(e.key)) typed = (typed + e.key).slice(-2);
    }
  });

  bindInput({ next, prev, ignore: '[data-overview]' });

  document.querySelectorAll<HTMLElement>('[data-nav]').forEach((b) =>
    b.addEventListener('click', () => {
      const action = b.dataset.nav;
      if (action === 'next') next();
      else if (action === 'prev') prev();
      else if (action === 'fullscreen') toggleFullscreen();
      else if (action === 'help') toggleHelp();
      else if (action === 'overview') overview.toggle();
    }),
  );
  help.addEventListener('click', () => toggleHelp(false));

  stage.querySelectorAll<HTMLAnchorElement>('[data-goto]').forEach((a) =>
    a.addEventListener('click', (e) => {
      e.preventDefault();
      go(Number(a.dataset.goto));
    }),
  );

  window.addEventListener('hashchange', () => go(fromHash()));

  // Oculta la navegación cuando el ratón está quieto (útil en el proyector)
  let idle = 0;
  const wake = () => {
    document.body.classList.remove('is-idle');
    clearTimeout(idle);
    idle = window.setTimeout(() => document.body.classList.add('is-idle'), 2500);
  };
  window.addEventListener('pointermove', wake);

  document.fonts.ready.then(() => go(fromHash()));
}
