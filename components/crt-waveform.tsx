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

/** Downsample peaks to roughly one point per ~2px of canvas width. */
function resamplePeaks(peaks: number[], targetCount: number): number[] {
  if (targetCount >= peaks.length) return peaks;
  const out: number[] = [];
  const bucketSize = peaks.length / targetCount;
  for (let i = 0; i < targetCount; i++) {
    const start = Math.floor(i * bucketSize);
    const end = Math.floor((i + 1) * bucketSize);
    let max = 0;
    for (let j = start; j < end; j++) {
      max = Math.max(max, peaks[j] ?? 0);
    }
    out.push(max);
  }
  return out;
}

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

    const targetCount = Math.max(48, Math.floor(w / 2));
    const samples = resamplePeaks(peaks.peaks, targetCount);
    const count = samples.length;
    const midY = h / 2;
    const amp = h * 0.44;
    const progress =
      duration > 0 ? Math.min(1, currentTime / duration) : 0;
    const playheadX = progress * w;

    const topPath = new Path2D();
    const bottomPath = new Path2D();

    for (let i = 0; i < count; i++) {
      const x = count === 1 ? 0 : (i / (count - 1)) * w;
      const y = samples[i] * amp;
      if (i === 0) {
        topPath.moveTo(x, midY - y);
        bottomPath.moveTo(x, midY + y);
      } else {
        topPath.lineTo(x, midY - y);
        bottomPath.lineTo(x, midY + y);
      }
    }

    const shape = new Path2D();
    shape.addPath(topPath);
    shape.lineTo(w, midY);
    for (let i = count - 1; i >= 0; i--) {
      const x = count === 1 ? 0 : (i / (count - 1)) * w;
      shape.lineTo(x, midY + samples[i] * amp);
    }
    shape.closePath();

    ctx.fillStyle = "rgba(90, 140, 200, 0.4)";
    ctx.fill(shape);
    ctx.strokeStyle = "rgba(120, 170, 220, 0.55)";
    ctx.lineWidth = Math.max(1, dpr * 0.75);
    ctx.lineJoin = "round";
    ctx.stroke(topPath);
    ctx.stroke(bottomPath);

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, playheadX, h);
    ctx.clip();
    ctx.fillStyle = "rgba(210, 230, 255, 0.92)";
    ctx.fill(shape);
    ctx.strokeStyle = "rgba(230, 245, 255, 0.95)";
    ctx.stroke(topPath);
    ctx.stroke(bottomPath);
    ctx.restore();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
    ctx.lineWidth = Math.max(1, dpr);
    ctx.beginPath();
    ctx.moveTo(playheadX, h * 0.04);
    ctx.lineTo(playheadX, h * 0.96);
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
      const seconds = seekTimeFromX(
        e.clientX,
        canvas.getBoundingClientRect(),
        dur,
      );
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
