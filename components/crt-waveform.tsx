"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  loadPeaks,
  seekTimeFromX,
  type WaveformPeaks,
} from "@/lib/waveform";

type CrtWaveformProps = {
  trackSrc: string;
  currentTime: number;
  duration: number;
  onSeek: (seconds: number) => void;
};

export function CrtWaveform({
  trackSrc,
  currentTime,
  duration,
  onSeek,
}: CrtWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const peaksRef = useRef<WaveformPeaks | null>(null);
  const draggingRef = useRef(false);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const peaks = peaksRef.current;
    if (!canvas || !peaks) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width * dpr));
    const h = Math.max(1, Math.floor(rect.height * dpr));

    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    ctx.clearRect(0, 0, w, h);

    const barCount = peaks.peaks.length;
    const gap = Math.max(1, Math.floor(dpr));
    const barWidth = Math.max(1, (w - gap * (barCount - 1)) / barCount);
    const midY = h / 2;
    const progress =
      duration > 0 ? Math.min(1, currentTime / duration) : 0;
    const playheadX = progress * w;

    for (let i = 0; i < barCount; i++) {
      const peak = peaks.peaks[i];
      const barH = Math.max(dpr * 2, peak * (h * 0.82));
      const x = i * (barWidth + gap);
      const played = x + barWidth / 2 <= playheadX;

      ctx.fillStyle = played
        ? "rgba(220, 235, 255, 0.95)"
        : "rgba(120, 170, 220, 0.42)";
      ctx.fillRect(x, midY - barH / 2, barWidth, barH);
    }

    ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
    ctx.lineWidth = Math.max(1, dpr);
    ctx.beginPath();
    ctx.moveTo(playheadX, h * 0.06);
    ctx.lineTo(playheadX, h * 0.94);
    ctx.stroke();
  }, [currentTime, duration]);

  useEffect(() => {
    let cancelled = false;
    peaksRef.current = null;

    loadPeaks(trackSrc).then((data) => {
      if (cancelled || !data) return;
      peaksRef.current = data;
      draw();
    });

    return () => {
      cancelled = true;
    };
  }, [trackSrc, draw]);

  useEffect(() => {
    draw();
  }, [draw, currentTime, duration]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const observer = new ResizeObserver(() => draw());
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [draw]);

  const handlePointer = useCallback(
    (e: ReactPointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      const peaks = peaksRef.current;
      if (!canvas || !peaks) return;

      const dur = duration > 0 ? duration : peaks.duration;
      const seconds = seekTimeFromX(e.clientX, canvas.getBoundingClientRect(), dur);
      onSeek(seconds);
    },
    [duration, onSeek],
  );

  const ariaMax = duration > 0 ? duration : peaksRef.current?.duration ?? 0;

  return (
    <canvas
      ref={canvasRef}
      className="crt__waveform"
      role="slider"
      aria-label="Seek within track"
      aria-valuemin={0}
      aria-valuemax={Math.round(ariaMax)}
      aria-valuenow={Math.round(currentTime)}
      onPointerDown={(e) => {
        draggingRef.current = true;
        canvasRef.current?.setPointerCapture(e.pointerId);
        handlePointer(e);
      }}
      onPointerMove={(e) => {
        if (draggingRef.current) handlePointer(e);
      }}
      onPointerUp={(e) => {
        draggingRef.current = false;
        canvasRef.current?.releasePointerCapture(e.pointerId);
      }}
      onPointerCancel={() => {
        draggingRef.current = false;
      }}
    />
  );
}
