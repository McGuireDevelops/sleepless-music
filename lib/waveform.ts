export type WaveformPeaks = {
  duration: number;
  peaks: number[];
};

const cache = new Map<string, Promise<WaveformPeaks | null>>();

export function peaksPathFromAudioSrc(src: string): string {
  return src.replace(/\.(wav|mp3|m4a)$/i, ".peaks.json");
}

export function loadPeaks(src: string): Promise<WaveformPeaks | null> {
  const path = peaksPathFromAudioSrc(src);
  const existing = cache.get(path);
  if (existing) return existing;

  const request = fetch(path)
    .then((res) => (res.ok ? res.json() : null))
    .catch(() => null);
  cache.set(path, request);
  return request;
}

export function seekTimeFromX(
  clientX: number,
  rect: DOMRect,
  duration: number,
): number {
  if (duration <= 0 || rect.width <= 0) return 0;
  const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  return ratio * duration;
}
