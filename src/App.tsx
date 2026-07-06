/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import bgSamurai from "./assets/final.png";
import { useState, useEffect } from 'react';
import Preloader from './components/Preloader';
import SectionOverlay from './components/SectionOverlay';
import ChromaKeyVideo from './components/ChromaKeyVideo';
import SupportingChromaKeyVideo from './components/SupportingChromaKeyVideo';
import ArchivistChromaKeyVideo from './components/ArchivistChromaKeyVideo';
import WardenChromaKeyVideo from './components/WardenChromaKeyVideo';
import CameraBreathing from './components/CameraBreathing';
import AtmosphereSystem from './components/AtmosphereSystem';


export default function App() {
  const [preloaderComplete, setPreloaderComplete] = useState(false);
  const [activeChapter, setActiveChapter] = useState(0);

  // Throttled scroll-wheel and touch-swipe navigation controller
  useEffect(() => {
    if (!preloaderComplete) return;

    let accumulatedDeltaY = 0;
    const threshold = 30; // threshold to trigger transition
    let lastTransitionTime = 0;

    const handleWheel = (e: WheelEvent) => {
      const now = Date.now();
      // Lock scroll transitions during the 0.5s text dissolve & reveal duration
      if (now - lastTransitionTime < 500) return;

      accumulatedDeltaY += e.deltaY;

      if (Math.abs(accumulatedDeltaY) >= threshold) {
        if (accumulatedDeltaY > 0) {
          setActiveChapter(prev => Math.min(3, prev + 1));
        } else {
          setActiveChapter(prev => Math.max(0, prev - 1));
        }
        accumulatedDeltaY = 0;
        lastTransitionTime = now;
      }
    };

    let resetTimeout: number;
    const handleWheelWithReset = (e: WheelEvent) => {
      clearTimeout(resetTimeout);
      handleWheel(e);
      // Reset accumulated scroll offset if scrolling pauses
      resetTimeout = window.setTimeout(() => {
        accumulatedDeltaY = 0;
      }, 200);
    };

    // Touch Swipe handling for mobile devices & simulated swipe gestures
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        touchStartY = e.touches[0].clientY;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length > 0) {
        const touchEndY = e.changedTouches[0].clientY;
        const deltaY = touchStartY - touchEndY; // Positive is swipe up (scroll down)
        const now = Date.now();
        if (now - lastTransitionTime < 500) return;

        if (Math.abs(deltaY) > 25) {
          if (deltaY > 0) {
            setActiveChapter(prev => Math.min(3, prev + 1));
          } else {
            setActiveChapter(prev => Math.max(0, prev - 1));
          }
          lastTransitionTime = now;
        }
      }
    };

    window.addEventListener('wheel', handleWheelWithReset, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheelWithReset);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      clearTimeout(resetTimeout);
    };
  }, [preloaderComplete]);

  return (
    <div 
      id="samurai-app-wrapper" 
      className="relative w-screen h-screen bg-neutral-200 text-black overflow-hidden font-sans select-none flex flex-col justify-between"
      style={{ height: '100vh', maxHeight: '100vh' }}
    >
      {/* 1. Background Concrete Layer (Z-0) */}
      <div 
        id="samurai-concrete-bg"
        className="absolute inset-[-20px] bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{
          backgroundImage: `url(${bgSamurai})`,
          zIndex: 0,
          transform: 'translate3d(var(--bg-drift-x, 0px), var(--bg-drift-y, 0px), 0) scale(var(--bg-drift-scale, 1.02))',
          willChange: 'transform',
        }}
      />

      {/* 2. Midground Red Splash Layer (Z-1) */}
      <div 
        id="samurai-splatter-bg"
        className="absolute inset-[-20px] bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{
          backgroundImage: `url(${bgSamurai})`,
          zIndex: 1,
          filter: 'url(#red-only-mask)',
          transform: 'translate3d(var(--splatter-drift-x, 0px), var(--splatter-drift-y, 0px), 0) scale(var(--splatter-drift-scale, 1.02))',
          willChange: 'transform, filter',
        }}
      />

      {/* 3. Supporting Character Chroma-keyed Video Layer (Z-3) */}
      <SupportingChromaKeyVideo activeChapter={activeChapter} />

      {/* 3b. Archivist Character — Chapter 03 Protagonist (Z-10, same layer) */}
      <ArchivistChromaKeyVideo activeChapter={activeChapter} />

      {/* 3c. Warden Character — Chapter 04 Protagonist (Z-10, same layer) */}
      <WardenChromaKeyVideo activeChapter={activeChapter} />

      {/* Cinematic Camera Breathing Controller */}
      <CameraBreathing activeChapter={activeChapter} />

      {/* Dynamic Scroll-Driven Atmosphere Evolution Layer (Z-5) */}
      <AtmosphereSystem activeChapter={activeChapter} />
      
      {/* 1. Preloader Overlap Shield */}
      {!preloaderComplete && (
        <Preloader 
          isLoaded={true} 
          onAnimationComplete={() => setPreloaderComplete(true)} 
        />
      )}

      {/* 2. Chroma-keyed samurai video layer — z-10: above bg, below UI text */}
      <ChromaKeyVideo activeChapter={activeChapter} />

      {/* 3. Non-Scrollable Interactive Fullscreen Overlay Grid */}
      <div className="absolute inset-0 w-full h-full z-20 overflow-hidden pointer-events-none" id="viewport-overlay-frame">
        <SectionOverlay 
          activeChapter={activeChapter}
          setActiveChapter={setActiveChapter}
          preloaderComplete={preloaderComplete}
        />
      </div>
      {/* 4. Invisible Video Preloading Strip (no compositor/layout cost) */}
      <div style={{ display: 'none' }} aria-hidden="true">
        <video src="https://files.catbox.moe/jjjkp0.mp4" preload="auto" muted playsInline />
        <video src="https://files.catbox.moe/bbg8wo.mp4" preload="auto" muted playsInline />
        <video src="https://files.catbox.moe/dtmihb.mp4" preload="auto" muted playsInline />
        <video src="https://files.catbox.moe/gcn726.mp4" preload="auto" muted playsInline />
      </div>

    </div>
  );
}
