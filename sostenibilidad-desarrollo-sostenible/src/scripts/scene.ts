import * as THREE from 'three';
import { gsap } from 'gsap';
import { EARTH_MASK } from '../data/earth-mask';

export type ScenePreset = 'cover' | 'outro' | 'hidden';

const RADIUS = 2.2;

/** Devuelve una función que indica si (lat, lon) en grados es tierra. */
function landLookup() {
  const { width, height, data } = EARTH_MASK;
  const bytes = Uint8Array.from(atob(data), (c) => c.charCodeAt(0));
  return (lat: number, lon: number) => {
    const row = Math.min(height - 1, Math.max(0, Math.floor(((90 - lat) / 180) * height)));
    const col = Math.min(width - 1, Math.max(0, Math.floor(((lon + 180) / 360) * width)));
    const i = row * width + col;
    return (bytes[i >> 3] & (1 << (i & 7))) !== 0;
  };
}

/** Textura de halo radial para la atmósfera. */
function haloTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(128, 128, 60, 128, 128, 128);
  grad.addColorStop(0, 'rgba(168,213,162,0.22)');
  grad.addColorStop(0.55, 'rgba(168,213,162,0.08)');
  grad.addColorStop(1, 'rgba(168,213,162,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

/**
 * Escena 3D de fondo: la Tierra hecha de partículas (continentes reales de Natural Earth).
 * Los puntos huyen del cursor y vuelven a su sitio con un muelle cuando el ratón se queda quieto o se va.
 * Solo se renderiza cuando la diapositiva activa la deja ver.
 */
export function createScene(canvas: HTMLCanvasElement, reduced: boolean) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  // Limitado a 1,5: en pantallas 2x/4K el globo sigue nítido y cuesta la mitad de píxeles
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 9);

  const world = new THREE.Group();
  scene.add(world);

  // Inclinación del eje terrestre; el globo gira dentro
  const axis = new THREE.Group();
  axis.rotation.z = 0.35;
  world.add(axis);

  // Esfera de Fibonacci filtrada por la máscara: tierra densa y brillante, océano tenue y más disperso
  const isLand = landLookup();
  const leaf = new THREE.Color('#c6efbd');
  const leafDeep = new THREE.Color('#8cc995');
  const ocean = new THREE.Color('#ece8de').multiplyScalar(0.14);
  const sample = 16000;
  const golden = Math.PI * (3 - Math.sqrt(5));
  const base: number[] = [];
  const cols: number[] = [];
  for (let i = 0; i < sample; i++) {
    const y = 1 - (i / (sample - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const t = golden * i;
    const x = Math.sin(t) * r;
    const z = Math.cos(t) * r;
    const lat = (Math.asin(y) * 180) / Math.PI;
    const lon = (Math.atan2(x, z) * 180) / Math.PI;
    const land = isLand(lat, lon);
    const rand = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1; // pseudoaleatorio, sin patrón en espiral
    if (!land && rand > 1 / 6) continue;
    const rr = RADIUS * (land ? 1.012 : 1);
    base.push(x * rr, y * rr, z * rr);
    const c = land ? leaf.clone().lerp(leafDeep, Math.abs(lat) / 90) : ocean;
    cols.push(c.r, c.g, c.b);
  }

  const count = base.length / 3;
  const home = new Float32Array(base);
  const positions = new Float32Array(base);
  const velocity = new Float32Array(base.length);
  const globeGeo = new THREE.BufferGeometry();
  const posAttr = new THREE.BufferAttribute(positions, 3);
  posAttr.setUsage(THREE.DynamicDrawUsage);
  globeGeo.setAttribute('position', posAttr);
  globeGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(cols), 3));
  const globe = new THREE.Points(
    globeGeo,
    new THREE.PointsMaterial({ size: 0.036, vertexColors: true, transparent: true, opacity: 0.95, depthWrite: false }),
  );
  globe.rotation.y = -0.55; // Empieza mostrando Europa y África (compensa que la cámara lo ve de lado)
  axis.add(globe);

  // Núcleo opaco: tapa la cara oculta del globo para que se lean los continentes
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(RADIUS * 0.985, 64, 48),
    new THREE.MeshBasicMaterial({ color: '#10301f' }),
  );
  axis.add(core);

  const halo = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: haloTexture(), transparent: true, depthWrite: false }),
  );
  halo.scale.setScalar(RADIUS * 3.1);
  world.add(halo);

  // Polvo de estrellas
  const starCount = 900;
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    starPos.set([(Math.random() - 0.5) * 40, (Math.random() - 0.5) * 24, -6 - Math.random() * 20], i * 3);
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  const stars = new THREE.Points(
    starGeo,
    new THREE.PointsMaterial({ size: 0.04, color: '#ece8de', transparent: true, opacity: 0.5, depthWrite: false }),
  );
  scene.add(stars);

  const presets: Record<ScenePreset, { x: number; y: number; z: number; opacity: number }> = {
    cover: { x: 3.4, y: 0, z: 9, opacity: 1 },
    outro: { x: 0, y: -0.2, z: 15, opacity: 0.3 },
    hidden: { x: 0, y: 0, z: 20, opacity: 0 },
  };

  const state = { opacity: 0, target: 0 };
  let running = false;
  let frame = 0;
  let last = 0;

  // Cursor: posición en coordenadas normalizadas y cuándo se movió por última vez
  const pointer = { x: 0, y: 0, ndc: new THREE.Vector2(), inside: false, movedAt: 0 };
  let influence = 0; // 0 = puntos en reposo, 1 = repulsión plena

  window.addEventListener('pointermove', (e) => {
    pointer.x = e.clientX / window.innerWidth - 0.5;
    pointer.y = e.clientY / window.innerHeight - 0.5;
    pointer.ndc.set(pointer.x * 2, -pointer.y * 2);
    pointer.inside = true;
    pointer.movedAt = performance.now();
  });
  document.documentElement.addEventListener('pointerleave', () => (pointer.inside = false));
  window.addEventListener('blur', () => (pointer.inside = false));

  const raycaster = new THREE.Raycaster();
  const localRay = new THREE.Ray();
  const inverse = new THREE.Matrix4();

  // Parámetros de la física
  const REACH = 0.85; // radio de influencia alrededor del rayo del cursor
  const PUSH = 0.075; // fuerza de repulsión
  const SPRING = 0.04; // fuerza de retorno a casa
  const DAMPING = 0.86;
  const IDLE_MS = 700; // tras este tiempo quieto, los puntos vuelven

  function simulate(now: number) {
    const active = pointer.inside && now - pointer.movedAt < IDLE_MS && state.opacity > 0.5;
    influence += ((active ? 1 : 0) - influence) * 0.12;

    // Rayo del cursor en el espacio local del globo (sigue su giro e inclinación)
    let ox = 0, oy = 0, oz = 0, dx = 0, dy = 0, dz = 0;
    const pushing = influence > 0.01;
    if (pushing) {
      raycaster.setFromCamera(pointer.ndc, camera);
      inverse.copy(globe.matrixWorld).invert();
      localRay.copy(raycaster.ray).applyMatrix4(inverse);
      ({ x: ox, y: oy, z: oz } = localRay.origin);
      ({ x: dx, y: dy, z: dz } = localRay.direction);
    }

    let moving = false;
    for (let i = 0; i < count * 3; i += 3) {
      const px = positions[i], py = positions[i + 1], pz = positions[i + 2];
      const hx = home[i], hy = home[i + 1], hz = home[i + 2];
      let vx = velocity[i], vy = velocity[i + 1], vz = velocity[i + 2];

      if (pushing) {
        // Distancia del punto al rayo del cursor
        const t = (px - ox) * dx + (py - oy) * dy + (pz - oz) * dz;
        const ex = px - (ox + dx * t);
        const ey = py - (oy + dy * t);
        const ez = pz - (oz + dz * t);
        const dist = Math.sqrt(ex * ex + ey * ey + ez * ez);
        if (dist < REACH) {
          const f = (1 - dist / REACH) ** 2 * PUSH * influence;
          const inv = dist > 1e-4 ? 1 / dist : 0;
          // Se aparta del cursor y además sale hacia fuera de la esfera (dispersión)
          vx += ex * inv * f + (hx / RADIUS) * f * 0.7;
          vy += ey * inv * f + (hy / RADIUS) * f * 0.7;
          vz += ez * inv * f + (hz / RADIUS) * f * 0.7;
        }
      }

      vx = (vx + (hx - px) * SPRING) * DAMPING;
      vy = (vy + (hy - py) * SPRING) * DAMPING;
      vz = (vz + (hz - pz) * SPRING) * DAMPING;
      velocity[i] = vx;
      velocity[i + 1] = vy;
      velocity[i + 2] = vz;
      positions[i] = px + vx;
      positions[i + 1] = py + vy;
      positions[i + 2] = pz + vz;

      if (!moving && (Math.abs(vx) + Math.abs(vy) + Math.abs(vz) > 1e-5 || Math.abs(hx - px) > 1e-4)) moving = true;
    }
    if (moving || pushing) posAttr.needsUpdate = true;
  }

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  // Compila los shaders ya, para que no frenen la animación de la portada
  renderer.compile(scene, camera);
  renderer.render(scene, camera);

  function tick() {
    const now = performance.now();
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    const speed = reduced ? 0.15 : 1;
    globe.rotation.y += dt * 0.07 * speed;
    stars.rotation.z += dt * 0.004 * speed;
    world.rotation.x += (pointer.y * 0.12 - world.rotation.x) * 0.04;
    world.rotation.y += (pointer.x * 0.18 - world.rotation.y) * 0.04;
    world.updateMatrixWorld();
    if (!reduced) simulate(now);
    canvas.style.opacity = String(state.opacity);
    renderer.render(scene, camera);
    // Se detiene en cuanto deja de verse, aunque el fundido se haya interrumpido por un salto rápido
    if (state.target === 0 && state.opacity < 0.01) {
      state.opacity = 0;
      canvas.style.opacity = '0';
      stop();
      return;
    }
    if (running) frame = requestAnimationFrame(tick);
  }

  function start() {
    if (running) return;
    running = true;
    last = performance.now();
    frame = requestAnimationFrame(tick);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(frame);
  }

  return {
    /** Mueve la cámara al preajuste de la diapositiva (efecto «cambio de cámara»). */
    goTo(preset: ScenePreset, duration = 1.6) {
      const p = presets[preset];
      gsap.killTweensOf([world.position, camera.position, state]);
      state.target = p.opacity;
      if (p.opacity > 0) start();
      const d = reduced ? 0 : duration;
      gsap.to(world.position, { x: p.x, y: p.y, duration: d, ease: 'power3.inOut' });
      gsap.to(camera.position, { z: p.z, duration: d, ease: 'power3.inOut' });
      gsap.to(state, {
        opacity: p.opacity,
        duration: d * 0.8,
        ease: 'power2.inOut',
      });
    },
  };
}
