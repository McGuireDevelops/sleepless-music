"use client";

import {
  type CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { site } from "@/lib/site";

type ScreenState = "off" | "powering" | "no-signal" | "playing" | "paused";

const POWER_ON_MS = 1100;
const OSD_MS = 2200;
const VU_BARS = 12;

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function TvPlayer() {
  const tracks = site.tracks;
  const hasTracks = tracks.length > 0;

  const audioRef = useRef<HTMLAudioElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const rafRef = useRef(0);
  const osdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const powerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [screen, setScreen] = useState<ScreenState>("off");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [osdVisible, setOsdVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [levels, setLevels] = useState<number[]>(() =>
    new Array(VU_BARS).fill(0),
  );

  const isPlaying = screen === "playing";
  const isOn = screen !== "off";

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    return () => {
      if (osdTimerRef.current) clearTimeout(osdTimerRef.current);
      if (powerTimerRef.current) clearTimeout(powerTimerRef.current);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Apply volume to the media element (perceptual curve).
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.volume = volume * volume;
  }, [volume]);

  const flashOsd = useCallback(() => {
    setOsdVisible(true);
    if (osdTimerRef.current) clearTimeout(osdTimerRef.current);
    osdTimerRef.current = setTimeout(() => setOsdVisible(false), OSD_MS);
  }, []);

  const ensureAnalyser = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || analyserRef.current) return;

    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      const source = ctx.createMediaElementSource(audio);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.75;
      source.connect(analyser);
      analyser.connect(ctx.destination);

      audioCtxRef.current = ctx;
      sourceRef.current = source;
      analyserRef.current = analyser;
    } catch {
      // Analyser is a visual enhancement only; ignore failures.
    }
  }, []);

  const stopVuLoop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setLevels(new Array(VU_BARS).fill(0));
  }, []);

  const startVuLoop = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;
    const data = new Uint8Array(analyser.frequencyBinCount);

    const tick = () => {
      analyser.getByteFrequencyData(data);
      const bins = analyser.frequencyBinCount;
      const next: number[] = [];
      for (let i = 0; i < VU_BARS; i++) {
        const start = Math.floor((i / VU_BARS) * bins);
        const end = Math.max(start + 1, Math.floor(((i + 1) / VU_BARS) * bins));
        let sum = 0;
        for (let j = start; j < end; j++) sum += data[j];
        next.push(Math.min(1, sum / (end - start) / 255));
      }
      setLevels(next);
      rafRef.current = requestAnimationFrame(tick);
    };
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const playCurrent = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    ensureAnalyser();
    if (audioCtxRef.current?.state === "suspended") {
      await audioCtxRef.current.resume().catch(() => {});
    }
    try {
      await audio.play();
    } catch {
      // Autoplay restrictions or missing file — surface paused state.
      setScreen((s) => (s === "playing" ? "paused" : s));
    }
  }, [ensureAnalyser]);

  const powerOnAndPlay = useCallback(() => {
    if (!hasTracks) return;

    if (!isOn) {
      setScreen("powering");
      const delay = reducedMotion ? 0 : POWER_ON_MS;
      if (powerTimerRef.current) clearTimeout(powerTimerRef.current);
      powerTimerRef.current = setTimeout(() => {
        setScreen("playing");
        flashOsd();
        void playCurrent();
      }, delay);
      return;
    }

    setScreen("playing");
    void playCurrent();
  }, [hasTracks, isOn, reducedMotion, flashOsd, playCurrent]);

  const togglePlay = useCallback(() => {
    if (!hasTracks) return;
    const audio = audioRef.current;
    if (!isOn) {
      powerOnAndPlay();
      return;
    }
    if (isPlaying) {
      audio?.pause();
      setScreen("paused");
    } else {
      setScreen("playing");
      void playCurrent();
    }
  }, [hasTracks, isOn, isPlaying, powerOnAndPlay, playCurrent]);

  const changeTrack = useCallback(
    (dir: 1 | -1) => {
      if (!hasTracks) return;
      setCurrentIndex((prev) => {
        const next = (prev + dir + tracks.length) % tracks.length;
        return next;
      });
      flashOsd();
      if (!isOn) {
        powerOnAndPlay();
      } else {
        setScreen("playing");
      }
    },
    [hasTracks, tracks.length, flashOsd, isOn, powerOnAndPlay],
  );

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setCurrentTime(0);
    setScreen("no-signal");
    stopVuLoop();
  }, [stopVuLoop]);

  // When the track index changes while powered, load + play the new source.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !hasTracks) return;
    if (screen === "playing") {
      audio.load();
      void playCurrent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  // Drive the VU loop based on play state.
  useEffect(() => {
    if (isPlaying) startVuLoop();
    else stopVuLoop();
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying, startVuLoop, stopVuLoop]);

  // Pause the VU loop when the tab is hidden.
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(rafRef.current);
      else if (isPlaying) startVuLoop();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () =>
      document.removeEventListener("visibilitychange", onVisibility);
  }, [isPlaying, startVuLoop]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case " ":
        case "Enter":
          if ((e.target as HTMLElement).tagName === "BUTTON") return;
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowRight":
          e.preventDefault();
          changeTrack(1);
          break;
        case "ArrowLeft":
          e.preventDefault();
          changeTrack(-1);
          break;
        case "ArrowUp":
          e.preventDefault();
          setVolume((v) => Math.min(1, Math.round((v + 0.1) * 100) / 100));
          break;
        case "ArrowDown":
          e.preventDefault();
          setVolume((v) => Math.max(0, Math.round((v - 0.1) * 100) / 100));
          break;
      }
    },
    [togglePlay, changeTrack],
  );

  const currentTrack = tracks[currentIndex];
  const trackNumber = (currentIndex + 1).toString().padStart(2, "0");
  const volumeAngle = -135 + volume * 270;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={`tv-player ${reducedMotion ? "tv-player--reduced" : ""}`}
      data-screen={screen}
      onKeyDown={onKeyDown}
    >
      {hasTracks && (
        <audio
          ref={audioRef}
          src={currentTrack?.src}
          preload="none"
          crossOrigin="anonymous"
          onPlay={() => setScreen("playing")}
          onPause={() =>
            setScreen((s) => (s === "playing" ? "paused" : s))
          }
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onEnded={() => changeTrack(1)}
        />
      )}

      {/* ── Television cabinet ── */}
      <div className="tv-cabinet">
        <div className="tv-bezel">
          <div className="tv-screen">
            <button
              type="button"
              className="tv-screen__surface"
              onClick={togglePlay}
              aria-label={
                isPlaying ? "Pause" : isOn ? "Play" : "Power on and play"
              }
            >
              {/* Static / no-signal layer */}
              <span className="tv-static" aria-hidden />

              {/* Broadcast content */}
              <span className="tv-broadcast" aria-hidden>
                <span className="tv-broadcast__bars">
                  {levels.map((lvl, i) => (
                    <span
                      key={i}
                      className="tv-broadcast__bar"
                      style={
                        { "--lvl": lvl.toFixed(3) } as CSSProperties
                      }
                    />
                  ))}
                </span>
              </span>

              {/* OSD: track number, top-left */}
              <span
                className={`tv-osd ${osdVisible || isPlaying ? "tv-osd--visible" : ""}`}
                aria-hidden
              >
                TRACK {trackNumber}
              </span>

              {/* Lower-third chyron */}
              {isOn && screen !== "powering" && (
                <span className="tv-chyron" aria-hidden>
                  <span className="tv-chyron__label">Now Playing</span>
                  <span className="tv-chyron__title">
                    {currentTrack?.title}
                  </span>
                </span>
              )}

              {/* No-signal / press play CTA */}
              {(screen === "off" || screen === "no-signal") && (
                <span className="tv-cta" aria-hidden>
                  <span className="tv-cta__icon">▶</span>
                  <span className="tv-cta__text">
                    {hasTracks ? "Press Play" : "No Signal"}
                  </span>
                </span>
              )}

              {/* Glass + scanlines + glare */}
              <span className="tv-glass" aria-hidden />
              <span className="tv-scanlines" aria-hidden />
              <span className="tv-glare" aria-hidden />
              {screen === "powering" && (
                <span className="tv-powerline" aria-hidden />
              )}
            </button>
          </div>

          {/* Right-side speaker + brand */}
          <div className="tv-sidebar" aria-hidden>
            <span className="tv-brand">SLEEPLESS</span>
            <span className="tv-speaker" />
            <span className="tv-vu" aria-hidden>
              {levels.slice(0, 5).map((lvl, i) => (
                <span
                  key={i}
                  className="tv-vu__seg"
                  style={{ "--lvl": lvl.toFixed(3) } as CSSProperties}
                />
              ))}
            </span>
          </div>
        </div>

        {/* ── VCR unit ── */}
        <div className="vcr">
          <div className="vcr__top">
            <span
              className={`vcr__clock ${reducedMotion ? "" : "vcr__clock--blink"}`}
              aria-hidden
            >
              12:00
            </span>
            <span className="vcr__slot" aria-hidden>
              <span className="vcr__slot-flap" />
            </span>
            <span className="vcr__display" aria-hidden>
              <span className="vcr__led" data-on={isPlaying} />
              <span className="vcr__time">
                {formatTime(currentTime)}
                {duration > 0 ? ` / ${formatTime(duration)}` : ""}
              </span>
            </span>
          </div>

          <div className="vcr__progress" aria-hidden>
            <span
              className="vcr__progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="vcr__controls">
            <button
              type="button"
              className="vcr-btn"
              onClick={() => changeTrack(-1)}
              disabled={!hasTracks}
              aria-label="Previous track"
            >
              <span aria-hidden>◀◀</span>
              <span className="vcr-btn__label">Rew</span>
            </button>

            <button
              type="button"
              className="vcr-btn vcr-btn--primary"
              onClick={togglePlay}
              disabled={!hasTracks}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              <span aria-hidden>{isPlaying ? "❚❚" : "▶"}</span>
              <span className="vcr-btn__label">
                {isPlaying ? "Pause" : "Play"}
              </span>
            </button>

            <button
              type="button"
              className="vcr-btn"
              onClick={stop}
              disabled={!hasTracks || !isOn}
              aria-label="Stop"
            >
              <span aria-hidden>■</span>
              <span className="vcr-btn__label">Stop</span>
            </button>

            <button
              type="button"
              className="vcr-btn"
              onClick={() => changeTrack(1)}
              disabled={!hasTracks}
              aria-label="Next track"
            >
              <span aria-hidden>▶▶</span>
              <span className="vcr-btn__label">FF</span>
            </button>

            {/* Volume knob */}
            <div className="vcr-knob">
              <span
                className="vcr-knob__dial"
                style={{ "--angle": `${volumeAngle}deg` } as CSSProperties}
                aria-hidden
              >
                <span className="vcr-knob__indicator" />
              </span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="vcr-knob__input"
                aria-label="Volume"
              />
              <span className="vcr-knob__label">Vol</span>
            </div>
          </div>
        </div>

        {/* TV stand legs */}
        <div className="tv-legs" aria-hidden>
          <span className="tv-leg" />
          <span className="tv-leg" />
        </div>
      </div>

      {site.reelcrafterReelUrl && (
        <a
          className="tv-fulllink"
          href={site.reelcrafterReelUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open the full reel
        </a>
      )}
    </div>
  );
}
