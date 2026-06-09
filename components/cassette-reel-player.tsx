"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { site } from "@/lib/site";

type CassetteState =
  | "closed-vertical"
  | "rotating-horizontal"
  | "opening-lid"
  | "open-playing"
  | "closing-lid"
  | "rotating-vertical";

const ROTATE_MS = 500;
const LID_MS = 500;

function JewelCaseContents({
  state,
  loadIframe,
  reducedMotion,
}: {
  state: CassetteState;
  loadIframe: boolean;
  reducedMotion: boolean;
}) {
  const isOpen = state === "open-playing";
  const lidOpen =
    state === "opening-lid" ||
    state === "open-playing" ||
    (state === "closing-lid" && !reducedMotion);

  return (
    <>
      <div className="jewel-case__spine" aria-hidden>
        <span>{site.cassetteSideTitle}</span>
      </div>

      <div className="jewel-case__shell">
        <div
          className={`jewel-case__lid ${lidOpen ? "jewel-case__lid--open" : ""} ${state === "closing-lid" ? "jewel-case__lid--closing" : ""}`}
        >
          <div className="jewel-case__lid-face">
            <div className="jewel-case__label">
              <p className="jewel-case__label-type">{site.cassetteLabel}</p>
              <p className="jewel-case__label-title">
                {site.reelcrafterEmbedTitle}
              </p>
              <p className="jewel-case__label-line">{site.cassetteTrackLine}</p>
            </div>
            {state === "closed-vertical" && (
              <p className="jewel-case__hint">Tap to play</p>
            )}
          </div>
        </div>

        <div className="jewel-case__tray">
          <div className="jewel-case__tray-inner">
            <div
              className={`cassette-tape ${isOpen ? "cassette-tape--playing" : ""}`}
            >
              <div className="cassette-tape__body" aria-hidden={isOpen}>
                <div className="cassette-tape__window">
                  <span className="cassette-tape__hub cassette-tape__hub--left" />
                  <span className="cassette-tape__strip" />
                  <span className="cassette-tape__hub cassette-tape__hub--right" />
                </div>
                <p className="cassette-tape__title">{site.cassetteLabel}</p>
              </div>

              {loadIframe && (
                <div
                  className={`cassette-tape__screen ${isOpen ? "cassette-tape__screen--visible" : ""}`}
                >
                  <iframe
                    src={site.reelcrafterEmbedSrc}
                    title={site.reelcrafterEmbedTitle}
                    width="100%"
                    height={400}
                    className="block h-[min(56vw,400px)] w-full border-0 md:h-[400px]"
                    allow="autoplay; encrypted-media"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function CassetteReelPlayer() {
  const hasEmbed = site.reelcrafterEmbedSrc.length > 0;
  const [state, setState] = useState<CassetteState>("closed-vertical");
  const [loadIframe, setLoadIframe] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const open = useCallback(() => {
    if (!hasEmbed || state !== "closed-vertical") return;

    if (reducedMotion) {
      setLoadIframe(true);
      setState("open-playing");
      return;
    }

    setState("rotating-horizontal");
    clearTimer();
    timerRef.current = setTimeout(() => setState("opening-lid"), ROTATE_MS);
  }, [hasEmbed, state, reducedMotion, clearTimer]);

  const eject = useCallback(() => {
    if (state !== "open-playing") return;

    if (reducedMotion) {
      setLoadIframe(false);
      setState("closed-vertical");
      return;
    }

    setLoadIframe(false);
    setState("closing-lid");
    clearTimer();
    timerRef.current = setTimeout(() => setState("rotating-vertical"), LID_MS);
  }, [state, reducedMotion, clearTimer]);

  useEffect(() => {
    if (state !== "opening-lid") return;

    clearTimer();
    timerRef.current = setTimeout(() => {
      setLoadIframe(true);
      setState("open-playing");
    }, LID_MS);

    return clearTimer;
  }, [state, clearTimer]);

  useEffect(() => {
    if (state !== "rotating-vertical") return;

    clearTimer();
    timerRef.current = setTimeout(() => setState("closed-vertical"), ROTATE_MS);

    return clearTimer;
  }, [state, clearTimer]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && state === "open-playing") {
        eject();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [state, eject]);

  const isClosed = state === "closed-vertical";
  const isOpen = state === "open-playing";

  if (!hasEmbed) {
    return (
      <div className="cassette-player cassette-player--placeholder">
        <div className="flex aspect-[16/10] flex-col items-center justify-center gap-4 px-8 text-center md:aspect-[16/9]">
          <p className="font-display text-xl text-gold/80">Reel coming soon</p>
          <p className="max-w-md text-sm leading-relaxed text-sand/50">
            Add your ReelCrafter embed URL to{" "}
            <code className="text-gold/70">lib/site.ts</code>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`cassette-player ${reducedMotion ? "cassette-player--reduced" : ""}`}
      data-state={state}
    >
      <div className="jewel-case-scene">
        {isClosed && (
          <button
            type="button"
            className="jewel-case-scene__trigger"
            onClick={open}
            aria-expanded={false}
            aria-label="Open demo reel jewel case"
          />
        )}

        <div className="jewel-case">
          <JewelCaseContents
            state={state}
            loadIframe={loadIframe}
            reducedMotion={reducedMotion}
          />
        </div>
      </div>

      {isOpen && (
        <button
          type="button"
          className="cassette-player__eject-btn"
          onClick={eject}
          aria-expanded
          aria-label="Eject cassette and close player"
        >
          <span aria-hidden>⏏</span>
          <span className="cassette-player__eject-label">Eject</span>
        </button>
      )}
    </div>
  );
}
