import { gsap } from 'gsap';
import { Observer } from 'gsap/Observer';

gsap.registerPlugin(Observer);

/**
 * Rueda, trackpad y gestos táctiles: cada gesto avanza o retrocede exactamente una diapositiva,
 * sin importar cuánto se mueva la rueda. Es el único sistema que controla el desplazamiento.
 */
export function bindInput({ next, prev, ignore }: { next: () => void; prev: () => void; ignore?: string }) {
  let locked = false;
  const step = (fn: () => void) => {
    if (locked) return;
    locked = true;
    fn();
    // Evita que la inercia del trackpad salte varias diapositivas
    gsap.delayedCall(1.0, () => (locked = false));
  };

  Observer.create({
    target: window,
    type: 'wheel,touch',
    wheelSpeed: -1,
    tolerance: 12,
    preventDefault: true,
    ignore, // dentro del menú de miniaturas la rueda hace scroll normal
    onDown: () => step(prev),
    onUp: () => step(next),
  });
}
