import { ArtConfig } from '../types/art';
import { sampleGradient, hexToRgb } from '../utils/math';

export class SacredGeometryRenderer {
  render(
    ctx: CanvasRenderingContext2D,
    config: ArtConfig,
    time = 0
  ) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    const centerX = w / 2;
    const centerY = h / 2;

    if (!config.transparentBackground) {
      ctx.fillStyle = config.backgroundColor;
      ctx.fillRect(0, 0, w, h);
    } else {
      ctx.clearRect(0, 0, w, h);
    }

    const {
      geometryType,
      elementsCount,
      goldenAngleMod,
      waveModulation,
      pendulumFrequencies,
      pendulumPhases,
      pendulumDamping,
      rotationalSymmetry,
      lineWidth,
      glow,
      morphSpeed
    } = config.sacredGeometry;

    const colors = config.palette.colors;
    const morphTime = time * 0.001 * morphSpeed;

    ctx.save();
    if (glow) {
      ctx.shadowBlur = 12;
      ctx.shadowColor = colors[0] || '#ffffff';
    }

    ctx.lineWidth = Math.max(0.5, lineWidth);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (geometryType === 'phyllotaxis') {
      const c = (Math.min(w, h) / 2) / Math.sqrt(elementsCount) * 0.95;
      const angleStep = ((137.5 + goldenAngleMod + Math.sin(morphTime * 0.5) * 0.2) * Math.PI) / 180;

      for (let n = 0; n < elementsCount; n++) {
        const phi = n * angleStep;
        let r = c * Math.sqrt(n);

        // Wave modulation
        if (waveModulation > 0) {
          r += Math.sin(phi * 3 + morphTime) * (waveModulation * 8);
        }

        const x = centerX + r * Math.cos(phi);
        const y = centerY + r * Math.sin(phi);

        const colorT = (n / elementsCount + morphTime * 0.1) % 1;
        const color = sampleGradient(colors, colorT);

        const dotSize = Math.max(1, (r / (Math.min(w, h) * 0.5)) * 6 * lineWidth);

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, dotSize, 0, Math.PI * 2);
        ctx.fill();

        // Connect neighboring petal lines
        if (n > 5 && n % 2 === 0) {
          ctx.strokeStyle = color;
          ctx.globalAlpha = 0.25;
          ctx.beginPath();
          ctx.moveTo(x, y);
          const prevPhi = (n - 5) * angleStep;
          const prevR = c * Math.sqrt(n - 5);
          ctx.lineTo(centerX + prevR * Math.cos(prevPhi), centerY + prevR * Math.sin(prevPhi));
          ctx.stroke();
          ctx.globalAlpha = 1.0;
        }
      }
    } else if (geometryType === 'harmonograph') {
      const steps = elementsCount * 10;
      const dt = 0.01;
      const [f1, f2, f3, f4] = pendulumFrequencies;
      const [p1, p2, p3, p4] = pendulumPhases;
      const d = pendulumDamping * 0.001;

      const scale = Math.min(w, h) * 0.42;

      ctx.beginPath();
      let first = true;

      for (let i = 0; i < steps; i++) {
        const t = i * dt;
        const decay = Math.exp(-d * t);
        const animT = t + morphTime;

        const x = scale * (
          Math.sin(f1 * animT + p1) * Math.exp(-d * t * 0.5) +
          Math.sin(f2 * animT + p2) * Math.exp(-d * t * 0.5)
        ) * 0.5;

        const y = scale * (
          Math.sin(f3 * animT + p3) * Math.exp(-d * t * 0.5) +
          Math.sin(f4 * animT + p4) * Math.exp(-d * t * 0.5)
        ) * 0.5;

        const screenX = centerX + x;
        const screenY = centerY + y;

        if (first) {
          ctx.moveTo(screenX, screenY);
          first = false;
        } else {
          ctx.lineTo(screenX, screenY);
        }

        if (i % 200 === 0 && i > 0) {
          const colorT = (i / steps + morphTime * 0.2) % 1;
          ctx.strokeStyle = sampleGradient(colors, colorT);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(screenX, screenY);
        }
      }
      ctx.stroke();
    } else if (geometryType === 'mandala_epicycles') {
      const symmetry = Math.max(3, rotationalSymmetry);
      const anglePerSection = (Math.PI * 2) / symmetry;
      const maxRadius = Math.min(w, h) * 0.42;
      const points = 1200;

      for (let s = 0; s < symmetry; s++) {
        const baseRot = s * anglePerSection;
        ctx.beginPath();

        for (let i = 0; i <= points; i++) {
          const t = (i / points) * Math.PI * 2;
          const r = maxRadius * (
            0.5 + 
            0.3 * Math.sin(t * pendulumFrequencies[0] + morphTime) +
            0.2 * Math.cos(t * pendulumFrequencies[1] - morphTime * 1.5)
          );

          const theta = baseRot + t / symmetry + Math.sin(t * 3 + morphTime) * 0.1;
          const x = centerX + r * Math.cos(theta);
          const y = centerY + r * Math.sin(theta);

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        const colorT = (s / symmetry + morphTime * 0.1) % 1;
        ctx.strokeStyle = sampleGradient(colors, colorT);
        ctx.stroke();
      }
    } else if (geometryType === 'torus_knot') {
      // 3D Torus knot projection
      const p = Math.round(pendulumFrequencies[0] || 3);
      const q = Math.round(pendulumFrequencies[1] || 7);
      const R = Math.min(w, h) * 0.28;
      const r = Math.min(w, h) * 0.14;
      const steps = 1800;

      const rotX = morphTime * 0.4;
      const rotY = morphTime * 0.7;

      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const phi = (i / steps) * Math.PI * 2 * p;
        const r_phi = R + r * Math.cos(q * phi / p);
        const kx = r_phi * Math.cos(phi);
        const ky = r_phi * Math.sin(phi);
        const kz = -r * Math.sin(q * phi / p);

        // Rotate 3D
        const x1 = kx * Math.cos(rotY) + kz * Math.sin(rotY);
        const y1 = ky;
        const z1 = -kx * Math.sin(rotY) + kz * Math.cos(rotY);

        const x2 = x1;
        const y2 = y1 * Math.cos(rotX) - z1 * Math.sin(rotX);
        const z2 = y1 * Math.sin(rotX) + z1 * Math.cos(rotX);

        const fov = 600;
        const pers = fov / (fov + z2);
        const sx = centerX + x2 * pers;
        const sy = centerY + y2 * pers;

        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);

        if (i % 60 === 0 && i > 0) {
          const colorT = (i / steps + morphTime * 0.2) % 1;
          ctx.strokeStyle = sampleGradient(colors, colorT);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(sx, sy);
        }
      }
      ctx.stroke();
    }

    ctx.restore();
  }
}
