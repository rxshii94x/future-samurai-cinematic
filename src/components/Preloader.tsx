import React, { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';

interface PreloaderProps {
  isLoaded: boolean;
  onAnimationComplete: () => void;
}

const LINE1_SOURCE = "MODEL: RE_CLASS_V4";
const LINE2_SOURCE = "STATUS: SYSTEM_READY";

export default function Preloader({ isLoaded, onAnimationComplete }: PreloaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [screenIndex, setScreenIndex] = useState(0);
  const [counterNum, setCounterNum] = useState(100);
  
  // Custom typewriter state for Screen 1
  const [screen1Text, setScreen1Text] = useState({ line1: '', line2: '' });

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        // Final transition: preloader container fades out over 0.8s (Character Reveal)
        gsap.to(containerRef.current, {
          opacity: 0,
          duration: 0.8,
          ease: 'power2.inOut',
          onComplete: onAnimationComplete
        });
      }
    });

    // --- Screen 1 Typewriter (Total: 0.4s) ---
    tl.to({}, { duration: 0.04 });
    
    // Type out line 1
    for (let i = 1; i <= LINE1_SOURCE.length; i++) {
      tl.call(() => {
        setScreen1Text(prev => ({ ...prev, line1: LINE1_SOURCE.slice(0, i) }));
      }, undefined, `+=0.008`);
    }
    
    // Type out line 2
    for (let i = 1; i <= LINE2_SOURCE.length; i++) {
      tl.call(() => {
        setScreen1Text(prev => ({ ...prev, line2: LINE2_SOURCE.slice(0, i) }));
      }, undefined, `+=0.008`);
    }

    tl.to({}, { duration: 0.06 }); // Complete the 0.4s slot

    // --- Switch to Screen 2 (Total: 0.36s) ---
    tl.call(() => setScreenIndex(1));
    const numObj = { val: 100 };
    tl.to(numObj, {
      val: 150,
      duration: 0.36,
      ease: 'power1.inOut',
      onUpdate: () => {
        setCounterNum(Math.floor(numObj.val));
      }
    });

    // --- Switch to Screen 3 (Total: 0.24s) ---
    tl.call(() => setScreenIndex(2));
    tl.to({}, { duration: 0.24 });

    // --- Switch to Screen 4 (Total: 0.36s) ---
    tl.call(() => setScreenIndex(3));
    tl.to(numObj, {
      val: 200,
      duration: 0.36,
      ease: 'power1.inOut',
      onUpdate: () => {
        setCounterNum(Math.floor(numObj.val));
      }
    });

    // --- Switch to Screen 5 (Total: 0.24s) ---
    tl.call(() => setScreenIndex(4));
    tl.to({}, { duration: 0.24 });

    // --- Switch to Screen 6 (SAMURAI Logo Screen) ---
    tl.call(() => setScreenIndex(5));
    // Set initial logo element opacity to 0
    tl.set(".logo-element", { opacity: 0 });
    // Logo Fade In: 0.4 second
    tl.to(".logo-element", { opacity: 1, duration: 0.4, ease: 'power1.inOut' });
    // Logo Hold: 0.4 second
    tl.to({}, { duration: 0.4 });
    // Logo Fade Out: 0.4 second
    tl.to(".logo-element", { opacity: 0, duration: 0.4, ease: 'power1.inOut' });

    return () => {
      tl.kill();
    };
  }, [onAnimationComplete]);

  return (
    <div
      ref={containerRef}
      id="pre-loader-overlay"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-white select-none overflow-hidden"
      style={{
        willChange: 'filter, opacity'
      }}
    >
      {/* Cinematic CRT Scan overlays */}
      <div className="scanline" />
      <div className="scanbar" />

      {/* Main Text Content */}
      <div className="w-full max-w-md px-8 flex flex-col items-center justify-center text-center font-mono relative z-10">
        
        {/* SCREEN 1: Model status diagnostic */}
        {screenIndex === 0 && (
          <div className="flex flex-col items-start text-left space-y-1.5 border-l border-[#b00c14] pl-4 py-1.5 min-w-[260px] flicker-subtle">
            <div className="text-[12px] tracking-[0.15em] text-white">
              {screen1Text.line1}
              {screen1Text.line1.length < LINE1_SOURCE.length && <span className="typewriter-cursor" />}
            </div>
            <div className="text-[12px] tracking-[0.15em] text-[#b00c14] font-bold">
              {screen1Text.line2}
              {screen1Text.line1.length === LINE1_SOURCE.length && <span className="typewriter-cursor" />}
            </div>
          </div>
        )}

        {/* SCREEN 2: 100 / ARCHIVE_LOADING */}
        {screenIndex === 1 && (
          <div className="flex flex-col items-center space-y-3 glitch-micro">
            <div className="font-futuristic text-6xl md:text-7xl font-bold tracking-tight text-white">
              {counterNum}
            </div>
            <div className="text-[10px] tracking-[0.24em] text-white/70 uppercase">
              ARCHIVE_LOADING<span className="typewriter-cursor" />
            </div>
          </div>
        )}

        {/* SCREEN 3: 150 / RECONSTRUCTING_BUSHIDO_PROTOCOL */}
        {screenIndex === 2 && (
          <div className="flex flex-col items-center space-y-3 flicker-subtle">
            <div className="font-futuristic text-6xl md:text-7xl font-bold tracking-tight text-white">
              {counterNum}
            </div>
            <div className="text-[10px] tracking-[0.24em] text-[#b00c14] font-bold uppercase">
              RECONSTRUCTING_BUSHIDO_PROTOCOL<span className="typewriter-cursor" />
            </div>
          </div>
        )}

        {/* SCREEN 4: 200 / RECONSTRUCTING_HISTORY_OF_FUTURE */}
        {screenIndex === 3 && (
          <div className="flex flex-col items-center space-y-3 glitch-micro">
            <div className="font-futuristic text-6xl md:text-7xl font-bold tracking-tight text-white">
              {counterNum}
            </div>
            <div className="text-[10px] tracking-[0.24em] text-[#b00c14] font-bold uppercase">
              RECONSTRUCTING_HISTORY_OF_FUTURE<span className="typewriter-cursor" />
            </div>
          </div>
        )}

        {/* SCREEN 5: SYSTEM_SYNCHRONIZED */}
        {screenIndex === 4 && (
          <div className="flex flex-col items-center space-y-2.5 flicker-subtle">
            <div className="w-6 h-[1px] bg-[#b00c14]" />
            <div className="text-[13px] sm:text-[14px] tracking-[0.32em] text-white font-extrabold uppercase">
              SYSTEM_SYNCHRONIZED
            </div>
            <div className="w-6 h-[1px] bg-[#b00c14]" />
          </div>
        )}

        {/* SCREEN 6: SAMURAI logo brand intro */}
        {screenIndex === 5 && (
          <div className="logo-element flex flex-col items-center select-none">
            <div className="flex items-center">
              <div 
                className="font-serif font-black text-4xl sm:text-5xl tracking-[0.16em] text-white select-none leading-none"
              >
                SAMURAI
              </div>
              <div 
                className="border-[2px] border-[#b00c14] bg-[#b00c14] text-white px-1.5 py-0.5 ml-3 font-bold uppercase select-none tracking-normal rotate-[-3deg] inline-block text-[12px]"
                style={{ fontFamily: 'sans-serif', lineHeight: '1' }}
              >
                侍
              </div>
            </div>
            <div className="w-[180px] h-[1.5px] bg-white/20 mt-3.5" />
            <div className="font-mono text-[8.5px] text-white/70 tracking-[0.36em] mt-3 flex items-center uppercase font-bold leading-none">
              THE ANCIENT WAY REMAINS...
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
