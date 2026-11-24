/* ==========================================================
   Navegación de la presentación
   - Rueda del ratón: una diapositiva por gesto (se para en cada una)
   - Espacio / → / ↓ / AvPág: siguiente   ·   Mayús+Espacio / ← / ↑ / RePág: anterior
   - Inicio / Fin: primera / última   ·   F: pantalla completa
   - Ratón pegado al borde izquierdo: barra de miniaturas
   ========================================================== */

const slides = Array.from(document.querySelectorAll<HTMLElement>('.slide'));
const thumbs = Array.from(document.querySelectorAll<HTMLElement>('.thumb'));
const sidebar = document.querySelector<HTMLElement>('.sidebar')!;
const progress = document.querySelector<HTMLElement>('.progress span')!;
const counter = document.querySelector<HTMLElement>('.counter b')!;

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const DURATION = reduced ? 0 : 750;
const EASING = 'cubic-bezier(.65,0,.25,1)';
const last = slides.length - 1;

let current = -1;
let busy = false;

/* ---------- Contadores animados (cifras) ---------- */
const fmtCache = new Map<number, Intl.NumberFormat>();
function fmt(n: number, dec: number) {
  if (!fmtCache.has(dec)) {
    fmtCache.set(
      dec,
      new Intl.NumberFormat('es-ES', {
        minimumFractionDigits: dec,
        maximumFractionDigits: dec,
        // @ts-ignore: 'always' fuerza el punto de miles también en 4 cifras (8.199)
        useGrouping: 'always',
      }),
    );
  }
  return fmtCache.get(dec)!.format(n);
}

function runCounters(slide: HTMLElement) {
  slide.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
    const target = parseFloat(el.dataset.count!);
    const dec = parseInt(el.dataset.dec ?? '0', 10);
    if (reduced) {
      el.textContent = fmt(target, dec);
      return;
    }
    const start = performance.now() + 250;
    const dur = 1400;
    el.textContent = fmt(0, dec);
    const tick = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - start) / dur));
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = fmt(target * eased, dec);
      if (t < 1 && slide.classList.contains('active')) requestAnimationFrame(tick);
      else el.textContent = fmt(target, dec);
    };
    requestAnimationFrame(tick);
  });
}

/* ---------- Cambio de diapositiva ---------- */
function updateUI() {
  progress.style.transform = `scaleX(${last ? current / last : 1})`;
  counter.textContent = String(current + 1).padStart(2, '0');
  thumbs.forEach((t, i) => t.classList.toggle('current', i === current));
  history.replaceState(null, '', `#${current + 1}`);
}

function go(target: number, instant = false) {
  const n = Math.max(0, Math.min(last, target));
  if (n === current || busy) return;

  const prev = current >= 0 ? slides[current] : null;
  const next = slides[n];
  const dir = n > current ? 1 : -1;
  current = n;
  updateUI();

  next.classList.add('active');

  if (!prev || instant || !DURATION) {
    prev?.classList.remove('active', 'shown');
    requestAnimationFrame(() => next.classList.add('shown'));
    runCounters(next);
    return;
  }

  busy = true;
  prev.classList.remove('active');
  prev.classList.add('leaving');
  prev.style.zIndex = '1';
  next.style.zIndex = '2';

  // La nueva entra desde abajo (o arriba) y tapa a la anterior, que se aleja un poco
  const inAnim = next.animate(
    [{ transform: `translateY(${dir * 100}%)` }, { transform: 'translateY(0)' }],
    { duration: DURATION, easing: EASING },
  );
  const outAnim = prev.animate(
    [
      { transform: 'translateY(0)', opacity: 1 },
      { transform: `translateY(${-dir * 25}%)`, opacity: 0.35 },
    ],
    { duration: DURATION, easing: EASING, fill: 'forwards' },
  );

  setTimeout(() => {
    next.classList.add('shown');
    runCounters(next);
  }, DURATION * 0.4);

  inAnim.onfinish = () => {
    prev.classList.remove('leaving', 'shown');
    outAnim.cancel();
    prev.style.zIndex = '';
    next.style.zIndex = '';
    busy = false;
  };
}

const nextSlide = () => go(current + 1);
const prevSlide = () => go(current - 1);

/* ---------- Rueda del ratón / touchpad ---------- */
// Solo se avanza si la rueda estaba quieta antes (pausa > 180 ms).
// Así un "golpe" de rueda = una diapositiva, y la inercia del touchpad no salta varias.
let lastWheel = 0;
addEventListener(
  'wheel',
  (e) => {
    if (sidebar.contains(e.target as Node)) return; // dentro de la barra se hace scroll normal
    e.preventDefault();
    const now = performance.now();
    const gap = now - lastWheel;
    lastWheel = now;
    const delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    if (busy || gap < 180 || Math.abs(delta) < 4) return;
    delta > 0 ? nextSlide() : prevSlide();
  },
  { passive: false },
);

/* ---------- Teclado ---------- */
addEventListener('keydown', (e) => {
  if (e.altKey || e.ctrlKey || e.metaKey) return;
  switch (e.key) {
    case ' ':
    case 'Spacebar':
      e.preventDefault();
      e.shiftKey ? prevSlide() : nextSlide();
      break;
    case 'ArrowRight':
    case 'ArrowDown':
    case 'PageDown':
      e.preventDefault();
      nextSlide();
      break;
    case 'ArrowLeft':
    case 'ArrowUp':
    case 'PageUp':
      e.preventDefault();
      prevSlide();
      break;
    case 'Home':
      e.preventDefault();
      go(0);
      break;
    case 'End':
      e.preventDefault();
      go(last);
      break;
    case 'f':
    case 'F':
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen().catch(() => {});
      break;
    case 'Escape':
      closeSidebar();
      break;
  }
});

/* ---------- Táctil (por si se usa en tablet) ---------- */
let touchY = 0;
addEventListener('touchstart', (e) => (touchY = e.touches[0].clientY), { passive: true });
addEventListener(
  'touchend',
  (e) => {
    const dy = touchY - e.changedTouches[0].clientY;
    if (Math.abs(dy) > 50) dy > 0 ? nextSlide() : prevSlide();
  },
  { passive: true },
);

/* ---------- Barra lateral de miniaturas ---------- */
function openSidebar() {
  if (sidebar.classList.contains('open')) return;
  sidebar.classList.add('open');
  thumbs[current]?.scrollIntoView({ block: 'center' });
}
function closeSidebar() {
  sidebar.classList.remove('open');
}

addEventListener('mousemove', (e) => {
  if (e.clientX <= 6) openSidebar();
});
sidebar.addEventListener('mouseleave', closeSidebar);

/* ---------- Enlaces internos (índice y miniaturas) ---------- */
document.addEventListener('click', (e) => {
  const el = (e.target as HTMLElement).closest<HTMLElement>('[data-go]');
  if (!el) return;
  e.preventDefault();
  closeSidebar();
  go(parseInt(el.dataset.go!, 10));
});

/* ---------- Arranque: respeta el número en la URL (#5) ---------- */
const fromHash = parseInt(location.hash.slice(1), 10);
go(Number.isNaN(fromHash) ? 0 : fromHash - 1, true);
