import { gsap } from 'gsap';

const THUMB_W = 232; // ancho de la miniatura en px de pantalla

/**
 * Panel lateral con una miniatura de cada diapositiva.
 * Las miniaturas son copias del marcado original, hechas antes de que las animaciones lo modifiquen.
 */
export function initOverview(slides: HTMLElement[], go: (i: number) => void, reduced: boolean) {
  const panel = document.querySelector<HTMLElement>('[data-overview]')!;
  const list = panel.querySelector<HTMLElement>('[data-overview-list]')!;
  const edge = document.querySelector<HTMLElement>('[data-overview-edge]')!;
  const scale = THUMB_W / 1920;

  const items = slides.map((slide, i) => {
    const clone = slide.cloneNode(true) as HTMLElement;
    clone.classList.add('is-active');
    clone.removeAttribute('aria-label');
    clone.removeAttribute('aria-roledescription');
    clone.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'));
    clone.style.transform = `scale(${scale})`;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'overview__thumb';
    button.setAttribute('aria-label', `Ir a la diapositiva ${i + 1}: ${slide.dataset.title}`);
    const frame = document.createElement('div');
    frame.className = 'overview__frame';
    frame.setAttribute('inert', '');
    frame.append(clone);
    const label = document.createElement('span');
    label.className = 'overview__label';
    label.innerHTML = `<b>${String(i + 1).padStart(2, '0')}</b> ${slide.dataset.title ?? ''}`;
    button.append(frame, label);
    button.addEventListener('click', () => {
      go(i);
      close();
    });

    const li = document.createElement('li');
    li.append(button);
    list.append(li);
    return li;
  });

  let isOpen = false;
  let closeTimer = 0;

  function open() {
    clearTimeout(closeTimer);
    if (isOpen) return;
    isOpen = true;
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    items.find((li) => li.classList.contains('is-current'))?.scrollIntoView({ block: 'center' });
    if (!reduced) {
      gsap.fromTo(items, { x: -40, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.5, stagger: 0.025, ease: 'power3.out' });
    }
  }

  function close() {
    clearTimeout(closeTimer);
    if (!isOpen) return;
    isOpen = false;
    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
  }

  edge.addEventListener('pointerenter', open);
  panel.addEventListener('pointerenter', () => clearTimeout(closeTimer));
  panel.addEventListener('pointerleave', () => {
    closeTimer = window.setTimeout(close, 250);
  });
  document.addEventListener('pointerdown', (e) => {
    if (isOpen && !panel.contains(e.target as Node) && !(e.target as Element).closest('[data-nav="overview"]')) close();
  });

  return {
    open,
    close,
    toggle: () => (isOpen ? close() : open()),
    get isOpen() {
      return isOpen;
    },
    setActive(i: number) {
      items.forEach((li, k) => li.classList.toggle('is-current', k === i));
    },
  };
}
