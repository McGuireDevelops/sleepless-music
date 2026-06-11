"use client";

import Image from "next/image";
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
const VU_BARS = 14;

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function TvPlayer() {
  const tracks = site.tracks;
  const hasTracks = tracks.length > 0;
  const rect = site.tvScreenRect;

  const audioRef = useRef<HTMLAudioElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const rafRef = useRef(0);
  const osdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const powerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [screen, setScreen] = useState<ScreenState>("off");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const volumeRef = useRef(volume);
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

  useEffect(() => {
    volumeRef.current = volume;
    // Once routed through Web Audio, <audio>.volume is ignored — drive a GainNode.
    if (gainRef.current) {
      gainRef.current.gain.value = volume * volume;
    } else {
      const audio = audioRef.current;
      if (audio) audio.volume = volume * volume;
    }
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
      const gain = ctx.createGain();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.75;
      gain.gain.value = volumeRef.current * volumeRef.current;
      source.connect(gain);
      gain.connect(analyser);
      analyser.connect(ctx.destination);

      audioCtxRef.current = ctx;
      sourceRef.current = source;
      gainRef.current = gain;
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
      setCurrentIndex((prev) => (prev + dir + tracks.length) % tracks.length);
      flashOsd();
      if (!isOn) powerOnAndPlay();
      else setScreen("playing");
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

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !hasTracks) return;
    if (screen === "playing") {
      audio.load();
      void playCurrent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  useEffect(() => {
    if (isPlaying) startVuLoop();
    else stopVuLoop();
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying, startVuLoop, stopVuLoop]);

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

  const screenStyle: CSSProperties = {
    top: `${rect.top}%`,
    left: `${rect.left}%`,
    width: `calc(${rect.width}% + 15px)`,
    height: `${rect.height}%`,
  };

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
          onPause={() => setScreen((s) => (s === "playing" ? "paused" : s))}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onEnded={() => changeTrack(1)}
        />
      )}

      {/* ── Photoreal scene + controls stage ── */}
      <div className="tv-stage">
      {/* ── Photoreal scene with live CRT overlay ── */}
      <div className="tv-scene">
        <Image
          src={site.tvScene}
          alt="Vintage television in a dark listening room"
          width={1536}
          height={1024}
          className="tv-scene__img"
          sizes="(max-width: 48rem) 100vw, 64rem"
          priority={false}
        />

        <button
          type="button"
          className="crt"
          style={screenStyle}
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause" : isOn ? "Play" : "Power on and play"}
        >
          <span className="crt__static" aria-hidden />

          <span className="crt__broadcast" aria-hidden>
            <span className="crt__bars">
              {levels.map((lvl, i) => (
                <span
                  key={i}
                  className="crt__bar"
                  style={{ "--lvl": lvl.toFixed(3) } as CSSProperties}
                />
              ))}
            </span>
          </span>

          <span
            className={`crt__osd ${osdVisible || isPlaying ? "crt__osd--visible" : ""}`}
            aria-hidden
          >
            TRACK {trackNumber}
          </span>

          {(screen === "playing" || screen === "paused") && (
            <span className="crt__chyron" aria-hidden>
              <span className="crt__chyron-label">Now Playing</span>
              <span className="crt__chyron-title">{currentTrack?.title}</span>
            </span>
          )}

          {(screen === "off" || screen === "no-signal") && (
            <span className="crt__cta" aria-hidden>
              <span className="crt__cta-icon">▶</span>
              <span className="crt__cta-text">
                {hasTracks ? "Press Play" : "No Signal"}
              </span>
            </span>
          )}

          <span className="crt__scanlines" aria-hidden />
          <span className="crt__glass" aria-hidden />
          {screen === "powering" && <span className="crt__powerline" aria-hidden />}
        </button>
      </div>

      {/* ── Visible, usable VCR control deck ── */}
      <div
        className="vcr"
        role="group"
        aria-label="VCR controls"
        data-on={isOn}
        data-playing={isPlaying}
      >
        <div className="vcr__top">
          <span
            className={`vcr__clock ${reducedMotion ? "" : "vcr__clock--blink"}`}
            aria-hidden
          >
            12:00
          </span>
          <span className="vcr__nowplaying" aria-hidden>
            {isOn ? `TRACK ${trackNumber} · ${currentTrack?.title ?? ""}` : "- - -"}
          </span>
          <span className="vcr__display" aria-hidden>
            <span className="vcr__led" data-on={isPlaying} />
            <span className="vcr__time">
              {formatTime(currentTime)}
              {duration > 0 ? ` / ${formatTime(duration)}` : ""}
            </span>
          </span>
        </div>

        <div className="vcr__slot" aria-hidden>
          <div className="vcr__slot-bezel">
            <div className="vcr__slot-mouth">
              <div
                className={`vcr__cassette ${isOn ? "vcr__cassette--in" : ""}`}
              >
                <span className="vcr__cassette-reel" />
                <span className="vcr__cassette-label">
                  {currentTrack?.title ?? "DEMO REEL"}
                </span>
                <span className="vcr__cassette-reel" />
              </div>
            </div>
          </div>
        </div>

        <div className="vcr__progress" aria-hidden>
          <span className="vcr__progress-fill" style={{ width: `${progress}%` }} />
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
            <span className="vcr-btn__label">{isPlaying ? "Pause" : "Play"}</span>
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
      </div>
    </div>
  );
}
