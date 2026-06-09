"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";

function getHeroScrollProgress(hero: HTMLElement): number {
  const rect = hero.getBoundingClientRect();
  const height = hero.offsetHeight || window.innerHeight;
  return Math.min(1, Math.max(0, -rect.top / height));
}

export function VhsOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const [active, setActive] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(mq.matches);
    updateMotion();
    mq.addEventListener("change", updateMotion);
    return () => mq.removeEventListener("change", updateMotion);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const hero = container.closest(".hero-section") as HTMLElement | null;
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(hero);

    let frameId = 0;

    const applyProgress = (progress: number) => {
      progressRef.current = progress;
      container.style.setProperty("--vhs-progress", progress.toFixed(4));
    };

    const updateScroll = () => applyProgress(getHeroScrollProgress(hero));

    const onScroll = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(updateScroll);
    };

    updateScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    if (reducedMotion || !active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let frameId = 0;
    let running = true;
    let lastDraw = 0;
    // Render static at a reduced internal resolution for chunky, performant grain.
    const SCALE = 0.5;
    const FRAME_MS = 1000 / 30;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(2, Math.floor(rect.width * SCALE));
      canvas.height = Math.max(2, Math.floor(rect.height * SCALE));
    };

    resize();
    window.addEventListener("resize", resize);

    const draw = (time: number) => {
      frameId = requestAnimationFrame(draw);
      if (!running || document.hidden) return;
      if (time - lastDraw < FRAME_MS) return;
      lastDraw = time;

      const w = canvas.width;
      const h = canvas.height;
      const progress = progressRef.current;
      // Always-on baseline so the static is visible immediately, then ramps up.
      const intensity = 0.4 + progress * 0.45;

      const image = ctx.createImageData(w, h);
      const data = image.data;
      const baseAlpha = 14 + intensity * 30;
      const jitter = 18 * intensity;

      for (let i = 0; i < data.length; i += 4) {
        const v = Math.random() * 255;
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
        data[i + 3] = baseAlpha + Math.random() * jitter;
      }

      // Random glitch slices: brighter, displaced, occasionally color-tinted bands.
      const sliceChance = 0.18 + progress * 0.35;
      if (Math.random() < sliceChance) {
        const slices = 1 + Math.floor(Math.random() * (1 + progress * 2));
        for (let s = 0; s < slices; s++) {
          const bandH = 1 + Math.floor(Math.random() * Math.max(2, h * 0.04));
          const y0 = Math.floor(Math.random() * h);
          const tint = Math.random();
          const rBoost = tint > 0.66 ? 70 : 0;
          const bBoost = tint < 0.33 ? 70 : 0;
          const bandAlpha = 70 + Math.random() * 80;

          for (let y = y0; y < Math.min(h, y0 + bandH); y++) {
            for (let x = 0; x < w; x++) {
              const i = (y * w + x) * 4;
              const v = 140 + Math.random() * 115;
              data[i] = Math.min(255, v + rBoost);
              data[i + 1] = v;
              data[i + 2] = Math.min(255, v + bBoost);
              data[i + 3] = bandAlpha;
            }
          }
        }
      }

      ctx.putImageData(image, 0, 0);
    };

    frameId = requestAnimationFrame(draw);

    return () => {
      running = false;
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
    };
  }, [reducedMotion, active]);

  return (
    <div
      ref={containerRef}
      className={`vhs-overlay ${reducedMotion ? "vhs-overlay--reduced" : ""}`}
      style={{ "--vhs-progress": "0" } as CSSProperties}
      aria-hidden
    >
      {!reducedMotion && (
        <canvas ref={canvasRef} className="vhs-overlay__noise" />
      )}
      <div className="vhs-overlay__scanlines" />
      {!reducedMotion && (
        <>
          <div className="vhs-overlay__tracking" />
          <div className="vhs-overlay__jolt" />
        </>
      )}
    </div>
  );
}
