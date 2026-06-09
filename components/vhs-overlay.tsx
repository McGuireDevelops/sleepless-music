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
  const [active, setActive] = useState(false);
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

      const glitchX = Math.sin(progress * Math.PI * 14) * progress * 6;
      const tearY = progress * 100;
      container.style.setProperty("--vhs-glitch-x", `${glitchX.toFixed(2)}px`);
      container.style.setProperty("--vhs-tear-y", `${tearY.toFixed(2)}%`);
      container.style.setProperty(
        "--vhs-chroma",
        `${(progress * 3).toFixed(2)}px`,
      );
    };

    const updateScroll = () => {
      applyProgress(getHeroScrollProgress(hero));
    };

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

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const drawNoise = () => {
      if (!running || document.hidden) {
        frameId = requestAnimationFrame(drawNoise);
        return;
      }

      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const progress = progressRef.current;
      const imageData = ctx.createImageData(w, h);
      const data = imageData.data;
      const alphaBase = 12 + progress * 36;
      const scrollSlice = Math.floor(progress * h * 0.15);

      for (let y = 0; y < h; y++) {
        const rowOffset =
          Math.abs(y - scrollSlice) < 6 ? Math.floor(progress * 18) : 0;

        for (let x = 0; x < w; x++) {
          const i = (y * w + x) * 4;
          const v = Math.random() * 255;
          const alpha =
            rowOffset > 0
              ? alphaBase + rowOffset + Math.random() * 20
              : alphaBase + Math.random() * 8;

          data[i] = v;
          data[i + 1] = v;
          data[i + 2] = v;
          data[i + 3] = Math.min(80, alpha);
        }
      }

      ctx.putImageData(imageData, 0, 0);
      frameId = requestAnimationFrame(drawNoise);
    };

    frameId = requestAnimationFrame(drawNoise);

    const onVisibility = () => {
      if (!document.hidden && running) {
        cancelAnimationFrame(frameId);
        frameId = requestAnimationFrame(drawNoise);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
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
          <div className="vhs-overlay__chromatic vhs-overlay__chromatic--r" />
          <div className="vhs-overlay__chromatic vhs-overlay__chromatic--b" />
          <div className="vhs-overlay__tracking" />
          <div className="vhs-overlay__glitch" />
        </>
      )}
    </div>
  );
}
