import { useEffect, useRef } from 'react';

interface AtmosphereSystemProps {
  activeChapter: number;
}

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  size: number;
  speedX: number;
  speedY: number;
  wobbleSpeed: number;
  wobbleRange: number;
  baseAlpha: number;
  depth: number; // 0.1 (far background) to 1.0 (near foreground)
  color: string;
  threshold: number; // scroll progress threshold [0.0 - 1.0] at which it activates
}

interface InkWisp {
  x: number;
  y: number;
  size: number;
  angle: number;
  spinSpeed: number;
  speedX: number;
  speedY: number;
  baseAlpha: number;
  scaleX: number; // stretch factor for brush-stroke look
  scaleY: number;
  threshold: number;
  isRed?: boolean;
}

export default function AtmosphereSystem({ activeChapter }: AtmosphereSystemProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Track targeted and current interpolated scroll progress
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);

  // Sync target progress to the active chapter (0.0 to 1.0 snap points)
  useEffect(() => {
    targetProgressRef.current = activeChapter / 3;
  }, [activeChapter]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;
    let isActive = true;

    // Handle screen resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // 2. Initialize Living Ink Particles Pool
    // Pre-allocated to avoid garbage collection spikes and ensure high 60fps performance on mobile
    const PARTICLE_COUNT = 120;
    const particles: Particle[] = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const depth = 0.15 + Math.random() * 0.85; // 0.15 to 1.0
      const size = 1.0 + (depth * 2.2) + Math.random() * 0.4; // larger particles are closer
      
      // Base drift speeds
      const speedY = -(0.1 + depth * 0.25) * (0.8 + Math.random() * 0.4);
      const speedX = -(0.05 + depth * 0.08) * (0.8 + Math.random() * 0.4);

      // Varying particle thresholds to distribute the fade-in organically
      const threshold = Math.random() * 0.82;

      // Color choice: 80% Sumi-e black ink, 20% glowing warning red
      const isRed = Math.random() > 0.80;
      const color = isRed 
        ? 'rgba(176, 12, 20, 1)'
        : 'rgba(20, 20, 24, 1)';

      const x = Math.random() * window.innerWidth;
      const y = Math.random() * window.innerHeight;

      particles.push({
        x,
        y,
        baseX: x,
        baseY: y,
        size,
        speedX,
        speedY,
        wobbleSpeed: 0.0003 + Math.random() * 0.0007,
        wobbleRange: 4 + Math.random() * 8 * depth,
        baseAlpha: isRed ? 0.35 + Math.random() * 0.3 : 0.25 + Math.random() * 0.3,
        depth,
        color,
        threshold
      });
    }

    // 3. Initialize Ink Smoke Wisps (larger organic brush-stroke layers)
    const WISP_COUNT = 6;
    const wisps: InkWisp[] = [];
    for (let i = 0; i < WISP_COUNT; i++) {
      const isRed = i >= 4; // 4 black wisps, 2 red wisps
      // If red, position near the center/right center splatter zone
      const x = isRed 
        ? window.innerWidth * 0.55 + (Math.random() - 0.3) * window.innerWidth * 0.2
        : Math.random() * window.innerWidth;
      const y = isRed
        ? canvas.height * 0.45 + (Math.random() - 0.5) * canvas.height * 0.2
        : canvas.height * 0.35 + Math.random() * canvas.height * 0.4;
      
      wisps.push({
        x,
        y,
        size: isRed ? 70 + Math.random() * 80 : 90 + Math.random() * 120,
        angle: Math.random() * Math.PI * 2,
        spinSpeed: (Math.random() - 0.5) * (isRed ? 0.0001 : 0.0002),
        speedX: isRed ? (Math.random() * 0.04 + 0.02) : (Math.random() * 0.08 + 0.04),
        speedY: isRed ? -(Math.random() * 0.05 + 0.03) : -(Math.random() * 0.10 + 0.06),
        baseAlpha: isRed ? 0.035 + Math.random() * 0.03 : 0.03 + Math.random() * 0.03,
        scaleX: isRed ? 1.2 + Math.random() * 0.8 : 1.5 + Math.random() * 1.5,
        scaleY: isRed ? 0.6 + Math.random() * 0.4 : 0.5 + Math.random() * 0.5,
        threshold: isRed ? 0.3 : i * 0.25,
        isRed
      });
    }

    // 4. Animation Loop
    const draw = () => {
      if (!isActive) return;

      // Smooth interpolation of scroll progress (easing)
      currentProgressRef.current += (targetProgressRef.current - currentProgressRef.current) * 0.05;
      const progress = currentProgressRef.current;

      // Smooth interpolation for cursor parallax (removes jitter/stutter)
      currentMouseX += (targetMouseX - currentMouseX) * 0.08;
      currentMouseY += (targetMouseY - currentMouseY) * 0.08;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const time = performance.now();

      // Camera Breathing offsets (aligned with CameraBreathing.tsx)
      const breathingTime = time * 0.00025;
      const camX = Math.sin(breathingTime * 0.75) * 1.6 + Math.cos(breathingTime * 0.32) * 0.7;
      const camY = Math.cos(breathingTime * 0.62) * 1.1 + Math.sin(breathingTime * 0.22) * 0.4;

      // ── Stage A: Volumetric Fog Layer 2 (Background Fog) ──────────
      // Fog density limits: Opacity starts light (~0.06) and evolves to dense (~0.4)
      const fogIntensity = 0.06 + progress * 0.34;

      const fog2X = canvas.width * 0.8 + Math.cos(breathingTime * 0.3) * 60;
      const fog2Y = canvas.height * 0.45 + Math.sin(breathingTime * 0.5) * 50;
      const grad2 = ctx.createRadialGradient(
        fog2X, fog2Y, 0,
        fog2X, fog2Y, canvas.width * 0.5
      );
      grad2.addColorStop(0, `rgba(220, 220, 220, ${fogIntensity * 0.6})`);
      grad2.addColorStop(0.6, `rgba(228, 228, 225, ${fogIntensity * 0.25})`);
      grad2.addColorStop(1, 'rgba(213, 213, 213, 0)');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // ── Stage B: Volumetric Light System (Light Shafts & Glow) ─────
      // Virtual light source slightly offset to the top-left/center, shifting with camera breathing
      const lightOriginX = canvas.width * 0.35 + Math.sin(breathingTime * 0.3) * 30 + camX * 0.3;
      const lightOriginY = -150;

      // 1. Ambient scattering source glow
      const glowRadius = Math.min(canvas.width, canvas.height) * 0.7;
      const glowGrad = ctx.createRadialGradient(
        lightOriginX, lightOriginY, 0,
        lightOriginX, lightOriginY, glowRadius
      );
      const baseGlowAlpha = (0.015 + progress * 0.045) * (0.85 + Math.sin(breathingTime * 0.5) * 0.15);
      glowGrad.addColorStop(0, `rgba(255, 253, 240, ${baseGlowAlpha})`);
      glowGrad.addColorStop(0.4, `rgba(255, 253, 240, ${baseGlowAlpha * 0.35})`);
      glowGrad.addColorStop(1, 'rgba(255, 253, 240, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Linear Light Rays (Shafts)
      const RAY_COUNT = 5;
      for (let i = 0; i < RAY_COUNT; i++) {
        const baseAngle = 0.75 + i * 0.16; // Pointing down-right
        const currentAngle = baseAngle + Math.sin(breathingTime * 0.25 + i * 1.3) * 0.025;
        const rayLen = Math.max(canvas.width, canvas.height) * 1.6;

        // Base width of the ray at origin (narrow)
        const startX1 = lightOriginX + Math.cos(currentAngle - 0.005) * 8;
        const startY1 = lightOriginY + Math.sin(currentAngle - 0.005) * 8;
        const startX2 = lightOriginX + Math.cos(currentAngle + 0.005) * 8;
        const startY2 = lightOriginY + Math.sin(currentAngle + 0.005) * 8;

        // End width of the ray at bottom-right (wide spread)
        const endAngleWidth = 0.075 + Math.sin(breathingTime * 0.15 + i * 0.8) * 0.015;
        const endX1 = lightOriginX + Math.cos(currentAngle - endAngleWidth) * rayLen;
        const endY1 = lightOriginY + Math.sin(currentAngle - endAngleWidth) * rayLen;
        const endX2 = lightOriginX + Math.cos(currentAngle + endAngleWidth) * rayLen;
        const endY2 = lightOriginY + Math.sin(currentAngle + endAngleWidth) * rayLen;

        ctx.beginPath();
        ctx.moveTo(startX1, startY1);
        ctx.lineTo(startX2, startY2);
        ctx.lineTo(endX2, endY2);
        ctx.lineTo(endX1, endY1);
        ctx.closePath();

        const rayGrad = ctx.createLinearGradient(
          lightOriginX,
          lightOriginY,
          (endX1 + endX2) / 2,
          (endY1 + endY2) / 2
        );

        const rayProgressAlpha = 0.03 + progress * 0.07;
        const pulse = 0.7 + Math.sin(breathingTime * 0.45 + i * 2.1) * 0.3;
        const maxRayAlpha = rayProgressAlpha * pulse;

        rayGrad.addColorStop(0, `rgba(255, 254, 248, ${maxRayAlpha * 0.6})`);
        rayGrad.addColorStop(0.35, `rgba(255, 254, 248, ${maxRayAlpha * 0.3})`);
        rayGrad.addColorStop(1, 'rgba(255, 254, 248, 0)');

        ctx.fillStyle = rayGrad;
        ctx.fill();
      }

      // ── Stage C: Ink Smoke Wisps (Drifting brush-stroke shapes) ─────
      wisps.forEach((w) => {
        // Slow drift motion
        w.x += w.speedX;
        w.y += w.speedY;
        w.angle += w.spinSpeed;

        // Screen wrap
        if (w.y < -w.size) {
          w.y = canvas.height + w.size;
          w.x = Math.random() * canvas.width;
        }
        if (w.x < -w.size) {
          w.x = canvas.width + w.size;
        } else if (w.x > canvas.width + w.size) {
          w.x = -w.size;
        }

        // Only render if we have crossed its activation progress threshold
        let wispAlpha = 0;
        if (progress >= w.threshold) {
          const wispFade = Math.min(1, (progress - w.threshold) / 0.2);
          wispAlpha = w.baseAlpha * wispFade;
        }

        if (wispAlpha > 0.005) {
          ctx.save();
          // Subtle camera breathing parallax
          ctx.translate(w.x + camX * 0.5, w.y + camY * 0.5);
          ctx.rotate(w.angle);
          ctx.scale(w.scaleX, w.scaleY);

          // Draw elongated radial gradient simulating diluting sumi-e ink smoke
          const colorString = w.isRed ? '176, 12, 20' : '16, 16, 18';
          const wispGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, w.size);
          wispGrad.addColorStop(0, `rgba(${colorString}, ${wispAlpha})`);
          wispGrad.addColorStop(0.5, `rgba(${colorString}, ${wispAlpha * 0.4})`);
          wispGrad.addColorStop(1, `rgba(${colorString}, 0)`);

          ctx.fillStyle = wispGrad;
          ctx.beginPath();
          ctx.arc(0, 0, w.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });

      // ── Stage D: Volumetric Fog Layer 1 (Foreground Fog - diffuses rays & wisps) ──
      const fog1X = canvas.width * 0.2 + Math.sin(breathingTime * 0.4) * 80;
      const fog1Y = canvas.height * 0.8 + Math.cos(breathingTime * 0.3) * 40;
      const grad1 = ctx.createRadialGradient(
        fog1X, fog1Y, 0,
        fog1X, fog1Y, canvas.width * 0.6
      );
      grad1.addColorStop(0, `rgba(215, 215, 215, ${fogIntensity * 0.8})`);
      grad1.addColorStop(0.5, `rgba(225, 225, 222, ${fogIntensity * 0.4})`);
      grad1.addColorStop(1, 'rgba(213, 213, 213, 0)');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // ── Stage E: Living Ink Particles (Flow-field & gathering) ────
      // Invisible dynamic gathering vortex center that moves in a slow figure-8 orbit
      const gatherX = canvas.width * 0.5 + Math.sin(breathingTime * 0.4) * 200;
      const gatherY = canvas.height * 0.55 + Math.cos(breathingTime * 0.65) * 120;
      // Oscillate gathering force between pulling and dispersing over a ~30 second period
      const gatherForce = Math.sin(time * 0.0002) * 0.08; 

      particles.forEach((p) => {
        // Flow-field angle inspired by organic brush stroke curves and turbulence
        const flowAngle = Math.sin(p.x * 0.0035 + time * 0.00008) * Math.cos(p.y * 0.003 + time * 0.00008) * Math.PI * 1.5;
        
        // Depth scale multiplier
        const depthSpeedScale = 0.55 + p.depth * 0.45;

        // Apply primary drift + flow field velocity
        p.x += (Math.cos(flowAngle) * 0.16 + p.speedX * 0.5) * depthSpeedScale;
        p.y += (Math.sin(flowAngle) * 0.12 + p.speedY * 0.5) * depthSpeedScale;

        // Apply gathering / dispersing vortex vector forces
        const dx = gatherX - p.x;
        const dy = gatherY - p.y;
        const dist = Math.hypot(dx, dy);
        
        if (dist > 40 && dist < 650) {
          const force = (1.0 - dist / 650) * gatherForce * (0.4 + p.depth * 0.6);
          p.x += (dx / dist) * force;
          p.y += (dy / dist) * force;
        }

        // Screen boundaries wrap around
        if (p.y < -30) {
          p.y = canvas.height + 30;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < -30) {
          p.x = canvas.width + 30;
        } else if (p.x > canvas.width + 30) {
          p.x = -30;
        }

        // Add organic horizontal float wobble
        const wobble = Math.sin(time * p.wobbleSpeed) * p.wobbleRange;

        // Calculate 3D Parallax offset based on depth, camera breathing, and mouse parallax
        const pxX = p.x + wobble + camX * p.depth * 1.2 + currentMouseX * p.depth * -2.5;
        const pxY = p.y + camY * p.depth * 1.2 + currentMouseY * p.depth * -1.8;

        // Calculate smooth opacity based on the particle activation threshold
        let alpha = 0;
        if (progress >= p.threshold) {
          const fadeBuffer = 0.15;
          const fadeFactor = Math.min(1, (progress - p.threshold) / fadeBuffer);
          alpha = p.baseAlpha * fadeFactor;
        }

        if (alpha > 0.01) {
          ctx.beginPath();
          ctx.arc(pxX, pxY, p.size, 0, Math.PI * 2);
          
          if (p.color === 'rgba(176, 12, 20, 1)') {
            ctx.fillStyle = `rgba(176, 12, 20, ${alpha * 0.55})`;
          } else {
            ctx.fillStyle = `rgba(20, 20, 24, ${alpha * 0.45})`;
          }

          ctx.fill();
        }
      });

      animFrameId = requestAnimationFrame(draw);
    };

    animFrameId = requestAnimationFrame(draw);

    return () => {
      isActive = false;
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-none" 
      style={{ zIndex: 5 }} 
    />
  );
}
