"use client";

import Image from "next/image";
import {
  type CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { CrtWaveform } from "@/components/crt-waveform";
import { site } from "@/lib/site";
import { seekTimeFromX } from "@/lib/waveform";

type ScreenState = "off" | "powering" | "no-signal" | "playing" | "paused";

const POWER_ON_MS = 1100;
const OSD_MS = 2200;

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
  const osdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const powerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const [screen, setScreen] = useState<ScreenState>("off");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [osdVisible, setOsdVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMobileLayout, setIsMobileLayout] = useState(false);

  const isPlaying = screen === "playing";
  const isOn = screen !== "off";
  const tapeInSlot = screen === "playing" || screen === "paused";
  const showWaveform = screen === "playing" || screen === "paused";

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 74.99rem)");
    const update = () => setIsMobileLayout(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    return () => {
      if (osdTimerRef.current) clearTimeout(osdTimerRef.current);
      if (powerTimerRef.current) clearTimeout(powerTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.volume = volume * volume;
  }, [volume]);

  const flashOsd = useCallback(() => {
    setOsdVisible(true);
    if (osdTimerRef.current) clearTimeout(osdTimerRef.current);
    osdTimerRef.current = setTimeout(() => setOsdVisible(false), OSD_MS);
  }, []);

  const playCurrent = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      await audio.play();
    } catch {
      setScreen((s) => (s === "playing" ? "paused" : s));
    }
  }, []);

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

  const handleTrackEnded = useCallback(() => {
    if (!hasTracks) return;
    if (currentIndex < tracks.length - 1) {
      changeTrack(1);
    } else {
      setScreen("paused");
    }
  }, [hasTracks, currentIndex, tracks.length, changeTrack]);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setCurrentTime(0);
    setScreen("no-signal");
  }, []);

  const handleSeek = useCallback(
    (seconds: number) => {
      const audio = audioRef.current;
      if (!audio || !hasTracks) return;
      const wasPlaying = isPlaying;
      audio.currentTime = seconds;
      setCurrentTime(seconds);
      flashOsd();
      if (wasPlaying) void playCurrent();
    },
    [hasTracks, isPlaying, flashOsd, playCurrent],
  );

  const handleProgressSeek = useCallback(
    (clientX: number) => {
      const bar = progressRef.current;
      if (!bar || duration <= 0) return;
      handleSeek(seekTimeFromX(clientX, bar.getBoundingClientRect(), duration));
    },
    [duration, handleSeek],
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !hasTracks) return;
    if (screen === "playing") {
      audio.load();
      void playCurrent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

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

  const rect = isMobileLayout ? site.tvScreenRectMobile : site.tvScreenRect;
  const screenStyle: CSSProperties = {
    top: `${rect.top}%`,
    left: `${rect.left}%`,
    width: `calc(${rect.width}% + ${isMobileLayout ? 11 : 15}px)`,
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
          preload="metadata"
          crossOrigin="anonymous"
          onPlay={() => setScreen("playing")}
          onPause={() => setScreen((s) => (s === "playing" ? "paused" : s))}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onEnded={handleTrackEnded}
        />
      )}

      <div className="tv-stage">
        <div className="tv-scene">
          <Image
            src={site.tvSceneDesktop}
            alt=""
            width={1536}
            height={1024}
            className="tv-scene__img tv-scene__img--desktop"
            sizes="(min-width: 75rem) 64rem, 0px"
            priority={false}
            aria-hidden
          />
          <Image
            src={site.tvSceneMobile}
            alt="Vintage television in a dark listening room"
            width={1536}
            height={1024}
            className="tv-scene__img tv-scene__img--mobile"
            sizes="(max-width: 74.99rem) 100vw, 0px"
            priority={false}
          />

          <div className="crt" style={screenStyle}>
            <span className="crt__static" aria-hidden />

            <span className="crt__broadcast" aria-hidden>
              {showWaveform && currentTrack && (
                <CrtWaveform
                  trackSrc={currentTrack.src}
                  currentTime={currentTime}
                  duration={duration}
                  onSeek={handleSeek}
                />
              )}
            </span>

            <span
              className={`crt__osd ${osdVisible || isPlaying ? "crt__osd--visible" : ""}`}
              aria-hidden
            >
              TRACK {trackNumber}
            </span>

            {showWaveform && (
              <span className="crt__chyron" aria-hidden>
                <span className="crt__chyron-label">Now Playing</span>
                <span className="crt__chyron-title">{currentTrack?.title}</span>
              </span>
            )}

            {(screen === "off" || screen === "no-signal") && (
              <button
                type="button"
                className="crt__cta-btn"
                onClick={powerOnAndPlay}
                aria-label={hasTracks ? "Power on and play" : "No signal"}
              >
                <span className="crt__cta" aria-hidden>
                  <span className="crt__cta-icon">▶</span>
                  <span className="crt__cta-text">
                    {hasTracks ? "Press Play" : "No Signal"}
                  </span>
                </span>
              </button>
            )}

            <span className="crt__scanlines" aria-hidden />
            <span className="crt__glass" aria-hidden />
            {screen === "powering" && (
              <span className="crt__powerline" aria-hidden />
            )}
          </div>
        </div>

        <div className="vcr-scale">
          <div
            id="player-controls"
            className="vcr scroll-mt-0 scroll-mb-[max(1rem,env(safe-area-inset-bottom))]"
            role="group"
            aria-label="VCR controls"
            data-on={isOn}
            data-playing={isPlaying}
          >
            <div className="vcr__deck">
              <div className="vcr__slot" aria-hidden>
                <div className="vcr__slot-bezel">
                  <div className="vcr__slot-mouth">
                    {tapeInSlot && (
                      <div className="vcr__tape">
                        <span className="vcr__tape-window">
                          {currentTrack?.title ?? "DEMO REEL"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <span className="vcr__display" aria-hidden>
                <span className="vcr__led" data-on={isPlaying} />
                <span className="vcr__time">{formatTime(currentTime)}</span>
              </span>
            </div>

            <div
              ref={progressRef}
              className="vcr__progress"
              role="slider"
              aria-label="Track progress"
              aria-valuemin={0}
              aria-valuemax={Math.round(duration)}
              aria-valuenow={Math.round(currentTime)}
              tabIndex={isOn ? 0 : -1}
              onPointerDown={(e) => {
                if (!isOn || duration <= 0) return;
                handleProgressSeek(e.clientX);
              }}
              onKeyDown={(e) => {
                if (!isOn || duration <= 0) return;
                const step = duration * 0.05;
                if (e.key === "ArrowRight") {
                  e.preventDefault();
                  handleSeek(Math.min(duration, currentTime + step));
                } else if (e.key === "ArrowLeft") {
                  e.preventDefault();
                  handleSeek(Math.max(0, currentTime - step));
                }
              }}
            >
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
    </div>
  );
}
