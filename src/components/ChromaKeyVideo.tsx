import React, { useRef, useEffect, useMemo, useCallback, useState } from 'react';

const VIDEO_SRC = 'https://files.catbox.moe/jjjkp0.mp4';
const CROSSFADE_SEC = 0.8;

/**
 * GPU-accelerated green-screen removal via an inline SVG <filter> applied
 * through CSS `filter: url(#chroma-key)`.  Zero JavaScript pixel work.
 *
 * ── Performance optimizations ───────────────────────────────────────
 *  • React.memo — prevents re-renders from parent state changes
 *  • Video pause/play — only decodes when this chapter is active
 *  • No animated CSS blur — uses pure opacity for hide/show (GPU-only)
 *  • Stable style references via useMemo
 *  • Preload metadata on mount for instant chapter activation
 */

interface ChromaKeyVideoProps {
  activeChapter: number;
}

const ChromaKeyVideo = React.memo(function ChromaKeyVideo({ activeChapter = 0 }: ChromaKeyVideoProps) {
  const videoARef = useRef<HTMLVideoElement>(null);
  const videoBRef = useRef<HTMLVideoElement>(null);
  const isActive = activeChapter === 0;

  // Preload and warm up videos on mount
  useEffect(() => {
    const vA = videoARef.current;
    const vB = videoBRef.current;
    if (!vA || !vB) return;

    vA.load();
    vB.load();

    if (!isActive) {
      const warmVideo = (video: HTMLVideoElement) => {
        const onCanPlay = () => {
          video.play().then(() => {
            video.pause();
            video.currentTime = 0;
          }).catch(() => {});
          video.removeEventListener('canplay', onCanPlay);
        };
        if (video.readyState >= 3) {
          video.play().then(() => {
            video.pause();
            video.currentTime = 0;
          }).catch(() => {});
        } else {
          video.addEventListener('canplay', onCanPlay);
        }
      };
      warmVideo(vA);
      warmVideo(vB);
    }
  }, []);

  /* ── Pause/resume video decoding based on chapter visibility ── */
  useEffect(() => {
    const vA = videoARef.current;
    const vB = videoBRef.current;
    if (!vA || !vB) return;

    if (isActive) {
      // Resume the visible video
      vA.play().catch(() => {});
    } else {
      // Pause both videos when not visible — stops GPU decoding entirely
      vA.pause();
      vB.pause();
    }
  }, [isActive]);

  /* ── Crossfade loop controller ────────────────────────────── */
  useEffect(() => {
    const vA = videoARef.current;
    const vB = videoBRef.current;
    if (!vA || !vB) return;

    let active: HTMLVideoElement = vA;
    let standby: HTMLVideoElement = vB;
    let fading = false;

    // Initialize standby: paused at frame 0, invisible
    standby.pause();
    standby.currentTime = 0;
    vA.style.opacity = '1';
    vB.style.opacity = '0';

    const checkTime = () => {
      if (fading || !isFinite(active.duration)) return;

      const remaining = active.duration - active.currentTime;

      if (remaining <= CROSSFADE_SEC && remaining > 0) {
        fading = true;

        // Cue standby from the top and begin playback
        standby.currentTime = 0;
        standby.play().catch(() => {});

        // CSS-driven opacity crossfade
        active.style.transition  = `opacity ${CROSSFADE_SEC}s ease-in-out`;
        standby.style.transition = `opacity ${CROSSFADE_SEC}s ease-in-out`;
        active.style.opacity  = '0';
        standby.style.opacity = '1';

        // After the fade completes, swap roles
        setTimeout(() => {
          const tmp = active;
          active  = standby;
          standby = tmp;

          // Park the now-standby silently at frame 0
          standby.pause();
          standby.currentTime = 0;
          standby.style.transition = 'none';

          fading = false;
        }, CROSSFADE_SEC * 1000 + 60);
      }
    };

    // timeupdate fires ~4 Hz which is plenty for a 0.8 s window
    vA.addEventListener('timeupdate', checkTime);
    vB.addEventListener('timeupdate', checkTime);

    // Safety net: if a video somehow reaches the end without a crossfade
    const onEnded = (e: Event) => {
      const v = e.target as HTMLVideoElement;
      v.currentTime = 0;
      v.play().catch(() => {});
    };
    vA.addEventListener('ended', onEnded);
    vB.addEventListener('ended', onEnded);

    return () => {
      vA.removeEventListener('timeupdate', checkTime);
      vB.removeEventListener('timeupdate', checkTime);
      vA.removeEventListener('ended', onEnded);
      vB.removeEventListener('ended', onEnded);
    };
  }, []);

  /* ── Shared inline styles for both video elements (stable ref) ── */
  const videoStyle: React.CSSProperties = useMemo(() => ({
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) scale(1.15) translateX(16%)',
    transformOrigin: 'center center',
    height: '85vh',
    maxHeight: '85vh',
    maxWidth: '80vw',
    width: 'auto',
    objectFit: 'contain',
    zIndex: 10,
    pointerEvents: 'none',
    filter: 'url(#chroma-key)',
    willChange: 'opacity',
    WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 85%, transparent 100%)',
    maskImage: 'linear-gradient(to bottom, black 0%, black 85%, transparent 100%)',
  }), []);

  return (
    <>
      {/* ── Inline SVG filter definition (0×0, invisible) ──────── */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <filter id="chroma-key" colorInterpolationFilters="sRGB">
            {/*
              Stage 1 — Green dominance map
              Each output channel = 2G − R − B  (clamped 0–1).
              Pure green (0,1,0) → 1,1,1 (bright white).
              White (1,1,1) → 0,0,0 (black).
              Grey (0.5,0.5,0.5) → 0,0,0 (black).
              Off-white fabric (0.86,0.9,0.86) → 0.08 (near-black).
            */}
            <feColorMatrix
              type="matrix"
              in="SourceGraphic"
              result="greenDom"
              values="
                -1  2  -1  0  0
                -1  2  -1  0  0
                -1  2  -1  0  0
                 0  0   0  1  0
              "
            />

            {/* Stage 2 — Luminance → alpha channel */}
            <feColorMatrix type="luminanceToAlpha" in="greenDom" result="lumA" />

            {/*
              Stage 3 — Invert + threshold alpha
              tableValues maps input alpha [0→1] to output alpha.
              5 values = 4 intervals of width 0.25 each:
                [0.00–0.25] → 1   (non-green: fully opaque)
                [0.25–0.50] → 1→0 (soft feather edge)
                [0.50–0.75] → 0   (moderate green: transparent)
                [0.75–1.00] → 0   (strong green: transparent)
            */}
            <feComponentTransfer in="lumA" result="mask">
              <feFuncA type="table" tableValues="1 1 0 0 0" />
            </feComponentTransfer>

            {/* Stage 4 — Composite: keep source only where mask alpha = 1 */}
            <feComposite in="SourceGraphic" in2="mask" operator="in" result="keyed" />

            {/*
              Stage 5 — Green-spill desaturation
              Gently blends the green channel with R and B to neutralise
              any residual green tint on edge pixels.
              G' = 0.05R + 0.90G + 0.05B
            */}
            <feColorMatrix
              type="matrix"
              in="keyed"
              values="
                1     0     0  0  0
                0.05  0.90  0.05  0  0
                0     0     1  0  0
                0     0     0  1  0
              "
            />
          </filter>

          <filter id="red-only-mask" colorInterpolationFilters="sRGB">
            <feColorMatrix
              type="matrix"
              values="
                1  0  0  0  0
                0  1  0  0  0
                0  0  1  0  0
               15 -15 -15  0 -1
              "
            />
          </filter>
        </defs>
      </svg>

      {/* ── Parent container: GPU-composited via transform + opacity only ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 10,
          pointerEvents: 'none',
          transform: `translate3d(var(--video-drift-x, 0px), var(--video-drift-y, 0px), 0) scale(calc(var(--video-drift-scale, 1) * ${
            isActive ? 1.0 : 0.98
          }))`,
          opacity: isActive ? 1.0 : 0,
          transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          willChange: 'transform, opacity',
        }}
      >
        <>
          {/* ── Video A (starts as active, autoplay) ───────────────── */}
            <video
              ref={videoARef}
              src={VIDEO_SRC}
              autoPlay
              muted
              playsInline
              preload="auto"
              crossOrigin="anonymous"
              style={videoStyle}
            />

            {/* ── Video B (standby clone for seamless crossfade) ──────── */}
            <video
              ref={videoBRef}
              src={VIDEO_SRC}
              muted
              playsInline
              preload="auto"
              crossOrigin="anonymous"
              style={{ ...videoStyle, opacity: 0 }}
            />
        </>
      </div>
    </>
  );
});

export default ChromaKeyVideo;
