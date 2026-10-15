import { useEffect, useRef, type Ref } from 'react';

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface Frame {
  center: Point3D;
  /** Half-extent along x/y (a rectangle roughly 16:9). */
  w: number;
  h: number;
  hue: number;
  spin: number;
}

interface Particle {
  x: number;
  y: number;
  z: number;
  speed: number;
  size: number;
  hue: number;
}

const BRAND_HUES = [174, 262, 318, 162];

/**
 * A hand-rolled 3D renderer: it project a cloud of film "frames" and dust
 * particles through a true perspective transform onto a 2D canvas.
 *
 * Why custom rather than a WebGL library? The app ships a strict CSP and this
 * keeps the hero dependency-free, tiny, and reliable across browsers — while
 * still delivering genuine 3D parallax and depth.
 */
export function HeroCanvas({ className, ref }: { className?: string; ref?: Ref<HTMLCanvasElement> }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });

  /** Keep the internal ref and any externally supplied ref in sync. */
  const setCanvasRef = (node: HTMLCanvasElement | null) => {
    canvasRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) (ref as React.MutableRefObject<HTMLCanvasElement | null>).current = node;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const isSmall = window.matchMedia?.('(max-width: 640px)').matches;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    const focal = 620;

    // ---- Build the scene -------------------------------------------------
    const frames: Frame[] = [];
    const FRAME_COUNT = 9;
    for (let i = 0; i < FRAME_COUNT; i++) {
      const angle = (i / FRAME_COUNT) * Math.PI * 2;
      const radius = 220 + (i % 3) * 70;
      frames.push({
        center: {
          x: Math.cos(angle) * radius,
          y: (Math.sin(angle * 1.6) * 130) - (i % 2 === 0 ? 40 : -30),
          z: Math.sin(angle) * radius,
        },
        w: 120 + (i % 2) * 40,
        h: 68 + (i % 2) * 22,
        hue: BRAND_HUES[i % BRAND_HUES.length],
        spin: (i % 2 === 0 ? 1 : -1) * (0.12 + (i % 3) * 0.04),
      });
    }

    const particles: Particle[] = [];
    const PARTICLE_COUNT = isSmall ? 90 : 180;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: (Math.random() - 0.5) * 1600,
        y: (Math.random() - 0.5) * 1000,
        z: (Math.random() - 0.5) * 1400,
        speed: 0.15 + Math.random() * 0.5,
        size: 0.6 + Math.random() * 1.8,
        hue: BRAND_HUES[i % BRAND_HUES.length],
      });
    }

    // ---- Helpers ---------------------------------------------------------
    const project = (p: Point3D) => {
      const z = p.z + 900; // push the camera back
      const scale = focal / Math.max(z, 1);
      return {
        x: width / 2 + (p.x + width * 0.18) * scale * 0.5,
        y: height / 2 + p.y * scale * 0.5,
        scale,
        z,
      };
    };

    const rotate = (p: Point3D, yaw: number, pitch: number): Point3D => {
      const cosY = Math.cos(yaw);
      const sinY = Math.sin(yaw);
      const x = p.x * cosY - p.z * sinY;
      const z = p.x * sinY + p.z * cosY;

      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);
      const y = p.y * cosP - z * sinP;
      const z2 = p.y * sinP + z * cosP;

      return { x, y, z: z2 };
    };

    let t = 0;
    let raf = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Ease the camera toward the pointer for a soft parallax.
      pointer.current.x += (target.current.x - pointer.current.x) * 0.05;
      pointer.current.y += (target.current.y - pointer.current.y) * 0.05;

      const yaw = t * 0.14 + pointer.current.x * 0.6;
      const pitch = Math.sin(t * 0.2) * 0.12 + pointer.current.y * 0.35;

      // Depth-sort frames so overlaps read correctly.
      const rendered = frames
        .map((frame) => {
          const c = rotate(frame.center, yaw, pitch);
          const sp = project(c);
          return { frame, c, sp, spin: t * frame.spin };
        })
        .sort((a, b) => b.sp.z - a.sp.z);

      for (const { frame, sp, spin } of rendered) {
        const depth = Math.min(Math.max(sp.scale, 0.35), 1.6);
        const w = frame.w * depth;
        const h = frame.h * depth;
        const alpha = Math.min(Math.max((depth - 0.3) * 0.8, 0.06), 0.5);

        ctx.save();
        ctx.translate(sp.x, sp.y);
        ctx.rotate(spin * 0.35);
        ctx.globalAlpha = alpha;

        // Frame body
        const grad = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
        grad.addColorStop(0, `hsla(${frame.hue}, 90%, 62%, 0.32)`);
        grad.addColorStop(1, `hsla(${(frame.hue + 40) % 360}, 90%, 55%, 0.06)`);
        ctx.fillStyle = grad;
        ctx.strokeStyle = `hsla(${frame.hue}, 95%, 70%, ${Math.min(alpha + 0.25, 0.7)})`;
        ctx.lineWidth = 1.4;

        const r = Math.min(w, h) * 0.12;
        ctx.beginPath();
        ctx.moveTo(-w / 2 + r, -h / 2);
        ctx.arcTo(w / 2, -h / 2, w / 2, h / 2, r);
        ctx.arcTo(w / 2, h / 2, -w / 2, h / 2, r);
        ctx.arcTo(-w / 2, h / 2, -w / 2, -h / 2, r);
        ctx.arcTo(-w / 2, -h / 2, w / 2, -h / 2, r);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Film sprocket dots along the top edge
        const dots = 6;
        for (let d = 0; d < dots; d++) {
          const dx = -w / 2 + (w / (dots + 1)) * (d + 1);
          ctx.globalAlpha = alpha * 0.8;
          ctx.fillStyle = `hsla(${frame.hue}, 100%, 82%, 0.9)`;
          ctx.beginPath();
          ctx.arc(dx, -h / 2 + h * 0.14, Math.max(h * 0.035, 0.8), 0, Math.PI * 2);
          ctx.fill();
        }

        // Playhead line sweeping the frame
        const sweep = (Math.sin(t * 0.9 + frame.hue) * 0.5 + 0.5) * w;
        ctx.globalAlpha = alpha * 0.7;
        ctx.strokeStyle = `hsla(${frame.hue}, 100%, 78%, 0.85)`;
        ctx.beginPath();
        ctx.moveTo(-w / 2 + sweep, -h / 2);
        ctx.lineTo(-w / 2 + sweep, h / 2);
        ctx.stroke();

        ctx.restore();
      }

      // Particles
      for (const p of particles) {
        p.z -= p.speed;
        if (p.z < -700) p.z = 700;

        const rp = rotate(p, yaw * 0.4, pitch * 0.4);
        const sp = project(rp);
        const alpha = Math.min(Math.max(sp.scale * 0.9, 0), 0.55);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = `hsla(${p.hue}, 100%, 72%, 1)`;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, p.size * sp.scale, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;

      t += 0.006;
      raf = requestAnimationFrame(draw);
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      target.current = {
        x: ((event.clientX - rect.left) / rect.width - 0.5) * 1.2,
        y: ((event.clientY - rect.top) / rect.height - 0.5) * 1.2,
      };
    };

    resize();
    // Reduced motion: paint a single static frame instead of an endless loop.
    if (reduced) {
      draw();
      cancelAnimationFrame(raf);
    } else {
      draw();
    }

    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointerMove);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, []);

  return (
    <canvas
      ref={setCanvasRef}
      aria-hidden="true"
      className={className}
    />
  );
}