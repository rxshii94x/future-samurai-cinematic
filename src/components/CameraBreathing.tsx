import { useEffect, useRef } from 'react';

interface CameraBreathingProps {
  activeChapter: number;
}

// Subtle coordinates for camera panning to create a continuous "journey" framing per section
const CHAPTER_PAN_OFFSETS = [
  { x: 0, y: 0 },       // Chapter 1 (Archive)
  { x: 8, y: -4 },      // Chapter 2 (Chronicles)
  { x: -7, y: 7 },      // Chapter 3 (Factions)
  { x: 4, y: -8 }       // Chapter 4 (Transmission)
];

/**
 * CameraBreathing Component
 * 
 * Provides an ultra-subtle, GPU-optimized cinematic breathing, drift, and mouse parallax animation.
 * It also applies a slow, continuous camera panning transition when switching chapters.
 * Directly modifies CSS custom variables on the parent wrapper container once per frame 
 * using requestAnimationFrame to ensure smooth 60+ FPS on both desktop and mobile devices.
 */
export default function CameraBreathing({ activeChapter }: CameraBreathingProps) {
  const activeChapterRef = useRef(activeChapter);

  // Sync prop changes to ref immediately so loop reads latest value without resetting
  useEffect(() => {
    activeChapterRef.current = activeChapter;
  }, [activeChapter]);

  useEffect(() => {
    const wrapper = document.getElementById('samurai-app-wrapper');
    if (!wrapper) return;

    let animFrameId: number;
    let isActive = true;

    // Track targeted and current interpolated mouse coordinates
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    // Track current camera panning coordinates (interpolates to target chapter offset)
    let currentPanX = 0;
    let currentPanY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      // Calculate normalized mouse positions relative to center of viewport [-1.0, 1.0]
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const update = () => {
      if (!isActive) return;

      // Scale time factor down for an extremely slow, majestic float
      const time = performance.now() * 0.00025;

      // 1. Smooth interpolation for cursor parallax (removes jitter/stutter)
      currentMouseX += (targetMouseX - currentMouseX) * 0.08;
      currentMouseY += (targetMouseY - currentMouseY) * 0.08;

      // 2. Smooth interpolation for chapter panning glide (very slow LERP factor for cinematic ease)
      const targetOffset = CHAPTER_PAN_OFFSETS[activeChapterRef.current] || { x: 0, y: 0 };
      currentPanX += (targetOffset.x - currentPanX) * 0.035;
      currentPanY += (targetOffset.y - currentPanY) * 0.035;

      // 3. Background Concrete Layer (Z-0)
      // Combined breathing + mouse parallax + chapter panning (moves with cursor, standard pan)
      const bgX = Math.sin(time * 0.75) * 1.6 + Math.cos(time * 0.32) * 0.7 + currentMouseX * 3.0 + currentPanX;
      const bgY = Math.cos(time * 0.62) * 1.1 + Math.sin(time * 0.22) * 0.4 + currentMouseY * 2.0 + currentPanY;
      const bgScale = 1.021 + Math.sin(time * 0.42) * 0.001;

      // 4. Midground Splatter/Brush-stroke Layer (Z-1)
      // Combined breathing + mouse parallax + chapter panning (moves opposite cursor, pans 40% more)
      const splatterX = Math.sin(time * 0.82 + 0.6) * 1.8 + Math.cos(time * 0.38) * 0.8 + currentMouseX * -4.0 + (currentPanX * 1.4);
      const splatterY = Math.cos(time * 0.67 + 0.3) * 1.2 + Math.sin(time * 0.26) * 0.5 + currentMouseY * -3.0 + (currentPanY * 1.4);
      const splatterScale = 1.021 + Math.sin(time * 0.45 + 1.0) * 0.001;

      // 5. Foreground Video (Samurai) Layer (Z-10)
      // Combined breathing + mouse parallax + chapter panning ("moves the least", pans 85% less)
      const videoX = (Math.sin(time * 0.93 + 1.2) * -2.0 + Math.cos(time * 0.42) * -0.7) * 0.2 + currentMouseX * -1.0 + (currentPanX * 0.15);
      const videoY = (Math.cos(time * 0.73 + 0.6) * -1.3 + Math.sin(time * 0.21) * -0.5) * 0.2 + currentMouseY * -0.7 + (currentPanY * 0.15);
      const videoScale = 1.0 + (Math.sin(time * 0.48 + 1.8) * 0.0012) * 0.2;

      // Apply coordinates directly to container CSS variables
      wrapper.style.setProperty('--bg-drift-x', `${bgX.toFixed(3)}px`);
      wrapper.style.setProperty('--bg-drift-y', `${bgY.toFixed(3)}px`);
      wrapper.style.setProperty('--bg-drift-scale', `${bgScale.toFixed(5)}`);

      wrapper.style.setProperty('--splatter-drift-x', `${splatterX.toFixed(3)}px`);
      wrapper.style.setProperty('--splatter-drift-y', `${splatterY.toFixed(3)}px`);
      wrapper.style.setProperty('--splatter-drift-scale', `${splatterScale.toFixed(5)}`);

      wrapper.style.setProperty('--video-drift-x', `${videoX.toFixed(3)}px`);
      wrapper.style.setProperty('--video-drift-y', `${videoY.toFixed(3)}px`);
      wrapper.style.setProperty('--video-drift-scale', `${videoScale.toFixed(5)}`);

      animFrameId = requestAnimationFrame(update);
    };

    animFrameId = requestAnimationFrame(update);

    return () => {
      isActive = false;
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return null;
}
