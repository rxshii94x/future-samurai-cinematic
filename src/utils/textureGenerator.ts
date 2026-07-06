/**
 * Procedural Texture Generator for the Future Samurai immersive experience.
 * This file creates high-resolution, artistic assets directly on HTML5 Canvas element textures.
 * By constructing these procedurally, the experience remains ultra-fast, perfectly sized,
 * and immune to slow network loads or asset failures, while retaining pristine artistic fidelity.
 */

// Helper to generate simple random 2D noise
function createNoise(ctx: CanvasRenderingContext2D, width: number, height: number, opacity: number) {
  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const val = Math.floor(Math.random() * 255);
    data[i] = val;     // R
    data[i + 1] = val; // G
    data[i + 2] = val; // B
    data[i + 3] = Math.floor(Math.random() * opacity * 255); // Alpha
  }
  ctx.putImageData(imgData, 0, 0);
}

/**
 * Generates a high-fidelity weathered, matte, raw gray concrete texture.
 */
export function generateConcreteTexture(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // 1. Base wash of raw concrete gray
  ctx.fillStyle = '#e4e4e2';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. Multi-layered organic plaster texture
  for (let i = 0; i < 12; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = Math.random() * 400 + 200;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, size);
    
    // Varying cement washes
    const colorVal = Math.random() > 0.5 ? 215 : 230;
    const opacity = Math.random() * 0.15 + 0.05;
    grad.addColorStop(0, `rgba(${colorVal}, ${colorVal}, ${colorVal - 2}, ${opacity})`);
    grad.addColorStop(1, 'rgba(228, 228, 226, 0)');
    
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // 3. Dark, damp corners and industrial staining (grunge)
  for (let i = 0; i < 8; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const sizeWidth = Math.random() * 500 + 300;
    const sizeHeight = Math.random() * 300 + 100;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.random() * Math.PI * 2);
    
    const grad = ctx.createLinearGradient(0, 0, 0, sizeHeight);
    grad.addColorStop(0, `rgba(40, 40, 35, ${Math.random() * 0.07 + 0.02})`);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = grad;
    ctx.fillRect(-sizeWidth / 2, -sizeHeight / 2, sizeWidth, sizeHeight);
    ctx.restore();
  }

  // 4. Subtle structural cracks & hairline fissures
  ctx.strokeStyle = 'rgba(70, 70, 65, 0.2)';
  ctx.lineWidth = 0.5;
  for (let i = 0; i < 5; i++) {
    let curX = Math.random() * canvas.width;
    let curY = Math.random() * canvas.height;
    ctx.beginPath();
    ctx.moveTo(curX, curY);
    for (let j = 0; j < 10; j++) {
      curX += (Math.random() - 0.5) * 45;
      curY += Math.random() * 40 + 10;
      ctx.lineTo(curX, curY);
    }
    ctx.stroke();
  }

  // 5. Raw concrete micro-grit overlay
  const noiseCanvas = document.createElement('canvas');
  noiseCanvas.width = canvas.width;
  noiseCanvas.height = canvas.height;
  const noiseCtx = noiseCanvas.getContext('2d');
  if (noiseCtx) {
    createNoise(noiseCtx, noiseCanvas.width, noiseCanvas.height, 0.06);
    ctx.globalCompositeOperation = 'multiply';
    ctx.drawImage(noiseCanvas, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
  }

  return canvas;
}

/**
 * Generates an isolated Red Splash ink texture on a transparent background.
 * Matches painterly, broad Sumi-e brush strokes with dynamic splatter particles.
 */
export function generateRedSplashTexture(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Set transparent background
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Helper for drawing paint splatters
  const drawSplatter = (cx: number, cy: number, maxRadius: number, count: number, fillStyle: string) => {
    ctx.fillStyle = fillStyle;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.pow(Math.random(), 1.5) * maxRadius;
      const r = Math.random() * 12 + 2;
      const spX = cx + Math.cos(angle) * distance;
      const spY = cy + Math.sin(angle) * distance;
      
      ctx.beginPath();
      ctx.arc(spX, spY, r, 0, Math.PI * 2);
      ctx.fill();

      // Mini satellite splatter running outwards
      if (Math.random() > 0.6) {
        const satAngle = angle + (Math.random() - 0.5) * 0.4;
        const satDist = distance + r * (Math.random() * 4 + 2);
        const satX = cx + Math.cos(satAngle) * satDist;
        const satY = cy + Math.sin(satAngle) * satDist;
        ctx.beginPath();
        ctx.arc(satX, satY, r * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  // Define crimson / scarlet paint gradient
  const grad = ctx.createRadialGradient(512, 512, 100, 512, 512, 450);
  grad.addColorStop(0, '#be0b0b'); // Vibrant pure crimson core
  grad.addColorStop(0.3, '#940505'); // Deep warning scarlet
  grad.addColorStop(0.7, '#6b0000'); // Shadow blood red
  grad.addColorStop(1, 'rgba(107, 0, 0, 0)'); // Fades out cleanly for composition

  ctx.fillStyle = grad;

  // 1. Core massive paint splatters (the bold background blot)
  ctx.beginPath();
  ctx.arc(512, 500, 180, 0, Math.PI * 2);
  ctx.fill();

  // Create overlapping brush blob clusters (irregular organic look)
  const blobs = [
    { x: 380, y: 440, r: 120 },
    { x: 640, y: 540, r: 140 },
    { x: 420, y: 580, r: 110 },
    { x: 580, y: 410, r: 130 },
  ];
  blobs.forEach(b => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
  });

  // 2. Draw expressive brush stroke flares
  ctx.strokeStyle = grad;
  ctx.lineCap = 'round';

  // Major horizontal strokes
  const strokePath = (startX: number, startY: number, ctrl1X: number, ctrl1Y: number, ctrl2X: number, ctrl2Y: number, endX: number, endY: number, startWidth: number) => {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.bezierCurveTo(ctrl1X, ctrl1Y, ctrl2X, ctrl2Y, endX, endY);
    ctx.lineWidth = startWidth;
    ctx.stroke();
  };

  // horizontal high-energy sweeping streak
  strokePath(150, 480, 350, 200, 650, 800, 880, 520, 80);
  // minor diagonal flare strokes mimicking dynamic canvas
  strokePath(220, 600, 380, 680, 700, 320, 860, 400, 50);
  strokePath(400, 280, 520, 240, 580, 750, 620, 820, 35);

  // 3. Spatter fine detail elements (dripping paint effect around boundaries)
  drawSplatter(512, 512, 420, 95, '#be0b0b');
  drawSplatter(554, 490, 350, 50, '#940505');
  drawSplatter(420, 550, 380, 40, '#6b0000');
  drawSplatter(512, 512, 480, 25, '#df1c1c'); // Sparks of bright scarlet highlights

  return canvas;
}

/**
 * Generates an intricate Future Samurai character from the hips up on a transparent background,
 * styled to match the cybernetic traditional-modern helmet and robe configuration of the briefing.
 */
export function generateSamuraiCharacterTexture(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const cx = 512;
  const cy = 520; // Anchor position of core body

  // 1. Draw traditional Kimono (Robe Layer)
  // Base shadows for drapes
  ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
  ctx.beginPath();
  ctx.moveTo(cx - 300, cy + 300);
  ctx.lineTo(cx + 300, cy + 300);
  ctx.lineTo(cx + 250, cy - 20);
  ctx.lineTo(cx - 250, cy - 20);
  ctx.closePath();
  ctx.fill();

  // White Kimono folds (Left and Right lapels crossing)
  const drawKimonoLapel = (points: {x:number, y:number}[], fillColor: string, strokeColor: string) => {
    ctx.fillStyle = fillColor;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for(let i=1; i<points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };

  // Base Kimono Body (broad neck, sloping shoulders)
  // Left Sleeve / drape
  drawKimonoLapel([
    { x: cx - 290, y: cy + 450 },
    { x: cx - 210, y: cy + 180 },
    { x: cx - 80,  y: cy + 80  },
    { x: cx - 120, y: cy + 450 }
  ], '#eaeaea', '#cccccc');

  // Right Sleeve / drape
  drawKimonoLapel([
    { x: cx + 290, y: cy + 450 },
    { x: cx + 210, y: cy + 180 },
    { x: cx + 80,  y: cy + 80  },
    { x: cx + 120, y: cy + 450 }
  ], '#f4f4f4', '#dcdcdc');

  // Left Lapel crossing over (the outer visible layer)
  drawKimonoLapel([
    { x: cx - 80, y: cy + 110 },
    { x: cx + 85, y: cy + 320 },
    { x: cx + 70, y: cy + 450 },
    { x: cx - 90, y: cy + 450 }
  ], '#ffffff', '#e0e0e0');

  // Right Lapel tucked under
  drawKimonoLapel([
    { x: cx + 80, y: cy + 110 },
    { x: cx - 85, y: cy + 320 },
    { x: cx - 60, y: cy + 450 },
    { x: cx + 90, y: cy + 450 }
  ], '#ebebeb', '#d2d2d2');

  // Kimono fold shadow detailing
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx - 10, cy + 200);
  ctx.lineTo(cx + 40, cy + 280);
  ctx.moveTo(cx - 30, cy + 150);
  ctx.lineTo(cx + 10, cy + 210);
  ctx.stroke();

  // Draw Obi (black waist belt sash)
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.moveTo(cx - 110, cy + 320);
  ctx.lineTo(cx + 110, cy + 320);
  ctx.lineTo(cx + 105, cy + 410);
  ctx.lineTo(cx - 105, cy + 410);
  ctx.closePath();
  ctx.fill();

  // Segmented Obi textures
  ctx.strokeStyle = '#2d2d2d';
  ctx.lineWidth = 2;
  for(let i = -70; i <= 70; i += 35) {
    ctx.beginPath();
    ctx.moveTo(cx + i, cy + 322);
    ctx.lineTo(cx + i, cy + 408);
    ctx.stroke();
  }

  // 2. Left Shoulder Cybernetic Sub-Armor (Sode)
  // Segments of black metal overlapping scales
  ctx.fillStyle = '#0f0f11';
  ctx.strokeStyle = '#28282e';
  ctx.lineWidth = 3;
  
  const sodeYStart = cy + 50;
  for (let i = 0; i < 4; i++) {
    const yOffset = sodeYStart + (i * 35);
    const scaleWidth = 100 - (i * 8);
    ctx.beginPath();
    ctx.moveTo(cx + 160 + (i * 4), yOffset);
    ctx.lineTo(cx + 160 + scaleWidth + (i * 2), yOffset + 10);
    ctx.lineTo(cx + 150 + scaleWidth + (i * 2), yOffset + 38);
    ctx.lineTo(cx + 150 + (i * 4), yOffset + 28);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Cyber crimson accent line on the armor plates
    ctx.fillStyle = '#da1010';
    ctx.fillRect(cx + 175 + (i * 4), yOffset + 12, 6, 12);
    ctx.fillStyle = '#0f0f11'; // restaurar
  }

  // Bridging cyber spine wires from Sode to body
  ctx.strokeStyle = '#18181c';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx + 140, cy + 100);
  ctx.quadraticCurveTo(cx + 120, cy + 120, cx + 80, cy + 120);
  ctx.stroke();

  // 3. Cybernetic Samurai Face mask & Jaw (Menpo)
  // Silver/Carbon futuristic armor structures protecting throat and lower skull
  ctx.fillStyle = '#eef2f5'; // Bright titanium alloy plates
  ctx.strokeStyle = '#2c3e50';
  ctx.lineWidth = 3;

  // Throat plate (Nodowa)
  ctx.beginPath();
  ctx.moveTo(cx - 35, cy - 30);
  ctx.lineTo(cx + 35, cy - 30);
  ctx.lineTo(cx + 25, cy + 5);
  ctx.lineTo(cx - 25, cy + 5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Metallic jaw armor mouth mask (Menpo)
  ctx.fillStyle = '#2b2b30'; // Dark mechanical polymer
  ctx.strokeStyle = '#000000';
  ctx.beginPath();
  ctx.moveTo(cx - 45, cy - 80);
  ctx.lineTo(cx + 45, cy - 80);
  
  // Jaw tip
  ctx.lineTo(cx + 25, cy - 35);
  ctx.lineTo(cx, cy - 25); // Nose/chin point
  ctx.lineTo(cx - 25, cy - 35);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Cybernetic faceplate markings (segmented seams)
  ctx.strokeStyle = '#d91111'; // Red laser lining details
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 75);
  ctx.lineTo(cx, cy - 30);
  ctx.moveTo(cx - 30, cy - 65);
  ctx.lineTo(cx - 15, cy - 45);
  ctx.moveTo(cx + 30, cy - 65);
  ctx.lineTo(cx + 15, cy - 45);
  ctx.stroke();

  // 4. Futuristic Black Kabuto Helmet
  // Deep charcoal/black metallic dome and crest
  ctx.fillStyle = '#0f0f11';
  ctx.strokeStyle = '#222227';
  ctx.lineWidth = 4;

  // Neck protective back plates flare (Shikoro)
  ctx.beginPath();
  ctx.moveTo(cx - 85, cy - 130);
  ctx.bezierCurveTo(cx - 130, cy - 90, cx - 135, cy - 10, cx - 110, cy + 20);
  ctx.lineTo(cx - 60, cy - 8);
  ctx.bezierCurveTo(cx - 80, cy - 60, cx - 80, cy - 90, cx - 60, cy - 110);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx + 85, cy - 130);
  ctx.bezierCurveTo(cx + 130, cy - 90, cx + 135, cy - 10, cx + 110, cy + 20);
  ctx.lineTo(cx + 60, cy - 8);
  ctx.bezierCurveTo(cx + 80, cy - 60, cx + 80, cy - 90, cx + 60, cy - 110);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Helmet Dome (Hachi)
  ctx.beginPath();
  ctx.arc(cx, cy - 120, 65, Math.PI, 0, false);
  ctx.lineTo(cx + 65, cy - 100);
  ctx.quadraticCurveTo(cx, cy - 90, cx - 65, cy - 100);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Visor brow (Maezashi) - chunky forward block
  ctx.fillStyle = '#1c1c21';
  ctx.beginPath();
  ctx.moveTo(cx - 70, cy - 115);
  ctx.lineTo(cx + 70, cy - 115);
  ctx.lineTo(cx + 65, cy - 95);
  ctx.lineTo(cx - 65, cy - 95);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  
  // Center futuristic gold crest mount (Haraidate)
  ctx.fillStyle = '#ffd700'; // Pure polished brass/gold
  ctx.beginPath();
  ctx.moveTo(cx - 15, cy - 120);
  ctx.lineTo(cx + 15, cy - 120);
  ctx.lineTo(cx + 10, cy - 135);
  ctx.lineTo(cx - 10, cy - 135);
  ctx.closePath();
  ctx.fill();

  // 5. Majestic Cyber Crest/Horns (Kuwagata)
  // Left wing horn
  ctx.fillStyle = '#0f0f11';
  ctx.beginPath();
  ctx.moveTo(cx - 8, cy - 133);
  ctx.bezierCurveTo(cx - 100, cy - 150, cx - 180, cy - 100, cx - 190, cy - 145);
  ctx.bezierCurveTo(cx - 150, cy - 195, cx - 80, cy - 200, cx - 2, cy - 148);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Right wing horn
  ctx.beginPath();
  ctx.moveTo(cx + 8, cy - 133);
  ctx.bezierCurveTo(cx + 100, cy - 150, cx + 180, cy - 100, cx + 190, cy - 145);
  ctx.bezierCurveTo(cx + 150, cy - 195, cx + 80, cy - 200, cx + 2, cy - 148);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Massive spectacular Center Crown Blade Horn (The main centerpiece from reference!)
  ctx.fillStyle = '#1b1b22';
  ctx.beginPath();
  ctx.moveTo(cx - 18, cy - 135);
  ctx.bezierCurveTo(cx - 45, cy - 230, cx - 120, cy - 230, cx - 85, cy - 310);
  ctx.quadraticCurveTo(cx, cy - 350, cx, cy - 380); // Ultra razor-sharp tip
  ctx.quadraticCurveTo(cx, cy - 350, cx + 85, cy - 310);
  ctx.bezierCurveTo(cx + 120, cy - 230, cx + 45, cy - 230, cx + 18, cy - 135);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Golden glowing center channel for the crown horn
  ctx.fillStyle = '#ffd700';
  ctx.beginPath();
  ctx.moveTo(cx - 3, cy - 140);
  ctx.lineTo(cx - 6, cy - 290);
  ctx.lineTo(cx, cy - 350);
  ctx.lineTo(cx + 6, cy - 290);
  ctx.lineTo(cx + 3, cy - 140);
  ctx.closePath();
  ctx.fill();

  // Helmet ribbon tie knot (Agemaki) beneath throat
  ctx.strokeStyle = '#da1010';
  ctx.lineWidth = 5;
  ctx.beginPath();
  // Knot loop
  ctx.arc(cx - 10, cy - 15, 6, 0, Math.PI * 2);
  ctx.arc(cx + 10, cy - 15, 6, 0, Math.PI * 2);
  ctx.stroke();

  // Hanging cords
  ctx.beginPath();
  ctx.moveTo(cx - 5, cy - 10);
  ctx.quadraticCurveTo(cx - 20, cy + 20, cx - 15, cy + 70);
  ctx.moveTo(cx + 5, cy - 10);
  ctx.quadraticCurveTo(cx + 20, cy + 20, cx + 15, cy + 70);
  ctx.stroke();

  // 6. Right Arm Extended in Host Gesture (Pre-loader invitation)
  // Arm with white kimono sleeve trailing off, hand open, palm facing up
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 3;

  // Sleeve drape outwards left (from user perspective)
  ctx.beginPath();
  ctx.moveTo(cx - 180, cy + 180);
  ctx.bezierCurveTo(cx - 310, cy + 180, cx - 360, cy + 300, cx - 360, cy + 360);
  ctx.lineTo(cx - 250, cy + 420);
  ctx.quadraticCurveTo(cx - 210, cy + 280, cx - 150, cy + 240);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Right Hand (outstretched cybernetic mechanical hand, palm up)
  ctx.fillStyle = '#fbfbfb'; // Cyber skin overlay
  ctx.strokeStyle = '#222227';
  ctx.lineWidth = 2.5;

  // Forearm emerging from sleeve
  ctx.beginPath();
  ctx.moveTo(cx - 300, cy + 230);
  ctx.lineTo(cx - 390, cy + 210);
  ctx.lineTo(cx - 400, cy + 245);
  ctx.lineTo(cx - 310, cy + 270);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Palm and outstretched invitation fingers (referencing image gesture!)
  ctx.fillStyle = '#1c1c21'; // Carbon composite joints
  ctx.beginPath();
  ctx.arc(cx - 410, cy + 215, 14, 0, Math.PI * 2); // Core palm cluster
  ctx.fill();
  ctx.stroke();

  // Elegant extended fingers drawing outwards and up
  ctx.strokeStyle = '#1c1c21';
  ctx.lineCap = 'round';
  
  // Thumb
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(cx - 405, cy + 210);
  ctx.quadraticCurveTo(cx - 410, cy + 180, cx - 425, cy + 180);
  ctx.stroke();
  
  // Index
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx - 415, cy + 215);
  ctx.quadraticCurveTo(cx - 440, cy + 200, cx - 460, cy + 210);
  ctx.stroke();

  // Middle
  ctx.beginPath();
  ctx.moveTo(cx - 415, cy + 220);
  ctx.quadraticCurveTo(cx - 445, cy + 215, cx - 465, cy + 230);
  ctx.stroke();

  // Ring
  ctx.beginPath();
  ctx.moveTo(cx - 415, cy + 225);
  ctx.quadraticCurveTo(cx - 440, cy + 228, cx - 455, cy + 248);
  ctx.stroke();

  // Little finger
  ctx.beginPath();
  ctx.moveTo(cx - 410, cy + 228);
  ctx.quadraticCurveTo(cx - 430, cy + 238, cx - 442, cy + 260);
  ctx.stroke();

  // 7. Left Hand holding Katana Hilt near Obi
  // Draw hilt (Tsuka) and round handguard (Tsuba) at waist
  const hiltX = cx + 80;
  const hiltY = cy + 340;

  // Solid golden Tsuba (handguard)
  ctx.fillStyle = '#ffd700';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2.5;
  ctx.save();
  ctx.translate(hiltX, hiltY);
  ctx.rotate(0.4); // Angled katana hilt
  ctx.beginPath();
  ctx.ellipse(0, 0, 32, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // The Katana Hilt (Tsuka) extending upwards from Tsuba
  ctx.fillStyle = '#0f0f11';
  ctx.beginPath();
  ctx.rect(-8, -120, 16, 120);
  ctx.fill();
  ctx.stroke();

  // Diamond-shaped traditional hilt wrapping cords (Tsuka-ito)
  ctx.fillStyle = '#da1010'; // Red under-wrap
  for (let y = -110; y < -10; y += 18) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(6, y + 8);
    ctx.lineTo(0, y + 16);
    ctx.lineTo(-6, y + 8);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // Left hand gripping hilt base
  ctx.fillStyle = '#1c1c1f';
  ctx.beginPath();
  ctx.arc(hiltX, hiltY + 12, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  return canvas;
}
