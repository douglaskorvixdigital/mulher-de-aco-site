// "One becomes many": a dotted globe that grows out of a single gold point (São Paulo) and
// sends routes to the cities where the magazine's readers live. Canvas 2D, no WebGL; it pauses
// when off screen and draws one still frame under reduced motion.

export interface GlobeState {
  intro: number; // 0 → 1: the point becomes the sphere
  arcs: number;  // 0 → 1: routes draw out
  scale: number;
  dim: number;
  rotY: number;
  tiltX: number;
  mx: number;
  my: number;
}

type V3 = { x: number; y: number; z: number };

const CITIES: [number, number][] = [
  [41.6, -72.7], [40.71, -74.0], [25.76, -80.19], [43.65, -79.38], [38.72, -9.14], [51.5, -0.12],
  [45.46, 9.19], [40.42, -3.7], [35.68, 139.69], [-33.87, 151.2], [-34.6, -58.38], [19.43, -99.13],
];

const ll = (lat: number, lon: number): V3 => {
  const a = (lat * Math.PI) / 180, b = (-lon * Math.PI) / 180;
  return { x: Math.cos(a) * Math.cos(b), y: Math.sin(a), z: Math.cos(a) * Math.sin(b) };
};

const slerp = (a: V3, b: V3, t: number): V3 => {
  const dot = Math.min(1, Math.max(-1, a.x * b.x + a.y * b.y + a.z * b.z));
  const om = Math.acos(dot), s = Math.sin(om) || 1;
  const k1 = Math.sin((1 - t) * om) / s, k2 = Math.sin(t * om) / s, lift = 1 + Math.sin(Math.PI * t) * 0.22 * om;
  return { x: (a.x * k1 + b.x * k2) * lift, y: (a.y * k1 + b.y * k2) * lift, z: (a.z * k1 + b.z * k2) * lift };
};

const rot = (p: V3, ry: number, rx: number): V3 => {
  const cy = Math.cos(ry), sy = Math.sin(ry), cx = Math.cos(rx), sx = Math.sin(rx);
  const x = p.x * cy - p.z * sy, z = p.x * sy + p.z * cy;
  return { x, y: p.y * cx - z * sx, z: p.y * sx + z * cx };
};

const ease = (t: number) => 1 - Math.pow(1 - t, 4);

export function createGlobe(canvas: HTMLCanvasElement, reduce: boolean): GlobeState {
  const ctx = canvas.getContext("2d")!;
  const N = innerWidth < 760 ? 900 : 1700;
  const pts: (V3 & { d: number })[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), t = golden * i;
    pts.push({ x: Math.cos(t) * r, y, z: Math.sin(t) * r, d: Math.random() });
  }
  const origin = ll(-23.55, -46.63);
  const cities = CITIES.map(([a, b]) => ll(a, b));
  const G: GlobeState = { intro: reduce ? 1 : 0, arcs: reduce ? 1 : 0, scale: 1, dim: 1, rotY: 2.1, tiltX: -0.32, mx: 0, my: 0 };

  let W = 0, H = 0;
  const size = () => {
    const dpr = Math.min(2, devicePixelRatio || 1), r = canvas.getBoundingClientRect();
    W = r.width; H = r.height; canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (reduce) draw();
  };

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const R = Math.min(W, H) * 0.38 * G.scale, cx = W / 2, cy = H / 2;
    const ry = G.rotY + G.mx * 0.35, rx = G.tiltX + G.my * 0.18;
    for (const p of pts) {
      const k = ease(Math.min(1, Math.max(0, G.intro * 1.6 - p.d * 0.6)));
      if (k <= 0) continue;
      const q = rot(p, ry, rx);
      if (q.z < -0.15) continue;
      const a = Math.min(1, (0.27 + 0.8 * (q.z + 1) / 2) * G.dim * k);
      ctx.fillStyle = `rgba(160,176,204,${a})`;
      const s = 1.3 + q.z * 1.1;
      ctx.fillRect(cx + q.x * R * k - s / 2, cy - q.y * R * k - s / 2, s, s);
    }
    ctx.lineWidth = 1;
    cities.forEach((c, i) => {
      const prog = Math.min(1, Math.max(0, G.arcs * 1.4 - i * 0.04));
      if (prog <= 0) return;
      ctx.beginPath();
      let started = false;
      for (let j = 0; j <= 48 * prog; j++) {
        const q = rot(slerp(origin, c, j / 48), ry, rx);
        if (q.z < 0) { started = false; continue; }
        const X = cx + q.x * R, Y = cy - q.y * R;
        if (started) ctx.lineTo(X, Y); else ctx.moveTo(X, Y);
        started = true;
      }
      ctx.strokeStyle = `rgba(217,180,90,${0.6 * G.dim})`;
      ctx.stroke();
      if (prog >= 1) {
        const q = rot(c, ry, rx);
        if (q.z > 0) { ctx.fillStyle = `rgba(243,216,142,${G.dim})`; ctx.beginPath(); ctx.arc(cx + q.x * R, cy - q.y * R, 2.2, 0, 7); ctx.fill(); }
      }
    });
    const o = rot(origin, ry, rx), k = Math.max(ease(G.intro), 0.0001);
    if (o.z > -0.1) {
      const r = G.intro < 0.25 ? 3 + 30 * (0.25 - G.intro) : 3.2;
      ctx.fillStyle = `rgba(243,216,142,${G.dim})`;
      ctx.beginPath(); ctx.arc(cx + o.x * R * k, cy - o.y * R * k, r, 0, 7); ctx.fill();
      ctx.strokeStyle = `rgba(243,216,142,${0.35 * G.dim})`;
      ctx.beginPath(); ctx.arc(cx + o.x * R * k, cy - o.y * R * k, r + 6 + (reduce ? 0 : 4 * Math.sin(performance.now() / 500)), 0, 7); ctx.stroke();
    }
  }

  size();
  addEventListener("resize", size);
  if (reduce) { draw(); return G; }

  let visible = true, raf = 0;
  const loop = () => { raf = 0; if (!visible) return; G.rotY += 0.0016; draw(); raf = requestAnimationFrame(loop); };
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) loop(); }).observe(canvas);
  addEventListener("pointermove", (e) => {
    G.mx += (e.clientX / innerWidth - 0.5 - G.mx) * 0.08;
    G.my += (e.clientY / innerHeight - 0.5 - G.my) * 0.08;
  }, { passive: true });
  loop();
  return G;
}
