import React, { useRef, useEffect, useMemo, useState } from 'react';

const VIDEO_SRC = 'https://files.catbox.moe/gcn726.mp4';
const CROSSFADE_SEC = 0.8;

interface WardenChromaKeyVideoProps {
  activeChapter: number;
}

/**
 * WardenChromaKeyVideo – Chapter 04 protagonist: The Warden.
 *
 * Visual contract (mirrors Character 03 / The Archivist):
 *  • Same right-side composition zone positioning
 *  • Same z-index 10 layering — above backgrounds, below UI text
 *  • Same chroma-key filter pipeline — GPU-composited green screen removal
 *  • Locked position — no --video-drift-* drift
 *  • Micro-opacity breathing — imperceptible 2% pulse for living presence
 *  • Video paused when inactive — zero GPU decode cost
 *
 * This is a CHARACTER REPLACEMENT, not an addition.
 * When Chapter 04 activates, Character 03 fades out, The Warden fades in.
 */
const WardenChromaKeyVideo = React.memo(function WardenChromaKeyVideo({ activeChapter }: WardenChromaKeyVideoProps) {
  const videoARef = useRef<HTMLVideoElement>(null);
  const videoBRef = useRef<HTMLVideoElement>(null);
  const isActive = activeChapter === 3;

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
      vA.play().catch(() => {});
    } else {
      // Pause both videos when not visible — stops GPU decoding entirely
      vA.pause();
      vB.pause();
    }
  }, [isActive]);

  /* ── Crossfade loop controller ── */
  useEffect(() => {
    const vA = videoARef.current;
    const vB = videoBRef.current;
    if (!vA || !vB) return;

    let active: HTMLVideoElement = vA;
    let standby: HTMLVideoElement = vB;
    let fading = false;

    standby.pause();
    standby.currentTime = 0;
    vA.style.opacity = '1';
    vB.style.opacity = '0';

    const checkTime = () => {
      if (fading || !isFinite(active.duration)) return;

      const remaining = active.duration - active.currentTime;

      if (remaining <= CROSSFADE_SEC && remaining > 0) {
        fading = true;

        standby.currentTime = 0;
        standby.play().catch(() => {});

        active.style.transition  = `opacity ${CROSSFADE_SEC}s ease-in-out`;
        standby.style.transition = `opacity ${CROSSFADE_SEC}s ease-in-out`;
        active.style.opacity  = '0';
        standby.style.opacity = '1';

        setTimeout(() => {
          const tmp = active;
          active  = standby;
          standby = tmp;

          standby.pause();
          standby.currentTime = 0;
          standby.style.transition = 'none';

          fading = false;
        }, CROSSFADE_SEC * 1000 + 60);
      }
    };

    vA.addEventListener('timeupdate', checkTime);
    vB.addEventListener('timeupdate', checkTime);

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

  /* ── Unified crossfade + micro-breathing controller ──────── */
  const isActiveRef = useRef(false);
  isActiveRef.current = isActive;

  useEffect(() => {
    const container = document.getElementById('warden-char-container');
    if (!container) return;

    let animId: number;
    let running = true;
    let currentOpacity = isActiveRef.current ? 1 : 0;
    let lastTime = performance.now();

    const CROSSFADE_DUR = 0.5; // 500ms cross-fade

    const loop = () => {
      if (!running) return;

      const now = performance.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      const target = isActiveRef.current ? 1 : 0;
      const step = dt / CROSSFADE_DUR;

      if (currentOpacity < target) {
        currentOpacity = Math.min(target, currentOpacity + step);
      } else if (currentOpacity > target) {
        currentOpacity = Math.max(target, currentOpacity - step);
      }

      let finalOpacity = currentOpacity;
      if (currentOpacity >= 0.99) {
        const t = now * 0.001;
        finalOpacity = 0.98 + Math.sin(t * (Math.PI / 3)) * 0.02;
      }

      // Write opacity + subtle scale reveal (0.98 → 1.0) in lockstep
      const scale = 0.98 + currentOpacity * 0.02;
      container.style.opacity = finalOpacity.toFixed(4);
      container.style.transform = `translate3d(0px, 0px, 0) scale(${scale.toFixed(5)})`;
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => {
      running = false;
      cancelAnimationFrame(animId);
    };
  }, []);

  /* ── Video element styles (stable ref, matches Character 03 composition) ─── */
  const videoStyle: React.CSSProperties = useMemo(() => ({
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) scale(1.035) translateX(21%)',
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
    <div
      id="warden-char-container"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 10,
        pointerEvents: 'none',
        opacity: 0, /* JS-driven crossfade — starts hidden */
        transform: 'translate3d(0px, 0px, 0) scale(0.98)',
        willChange: 'transform, opacity',
      }}
    >
      <>
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
  );
});

export default WardenChromaKeyVideo;
