import { ArtConfig } from '../types/art';
import { sampleGradient, hexToRgb } from '../utils/math';

interface TrailPoint {
  x: number;
  y: number;
  colorT: number;
}

export class FourierEpicyclesRenderer {
  private trail: TrailPoint[] = [];

  reset() {
    this.trail = [];
  }

  render(ctx: CanvasRenderingContext2D, config: ArtConfig, time = 0) {
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
      harmonicsCount,
      baseFrequency,
      decayRate,
      phaseShift,
      trailLength,
      showRings,
      showVectors,
      colorShift,
      speed
    } = config.fourier;

    const colors = config.palette.colors;
    const t = (time * 0.001 * speed * baseFrequency) % (Math.PI * 200);

    const baseRadius = Math.min(w, h) * 0.22;

    let currX = centerX;
    let currY = centerY;

    ctx.save();

    for (let i = 1; i <= harmonicsCount; i++) {
      const prevX = currX;
      const prevY = currY;

      // Harmonic frequency, radius and phase
      const freq = (2 * i - 1);
      const radius = baseRadius * Math.pow(decayRate, i - 1) / freq;
      const phase = (i * phaseShift * Math.PI) / 180;

      currX += radius * Math.cos(freq * t + phase);
      currY += radius * Math.sin(freq * t + phase);

      // Draw planetary orbit circle
      if (showRings) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(prevX, prevY, radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw vector link
      if (showVectors) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(currX, currY);
        ctx.stroke();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(currX, currY, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Add point to trail
    const colorT = ((t * colorShift * 0.1) % 1 + 1) % 1;
    this.trail.push({ x: currX, y: currY, colorT });

    if (this.trail.length > trailLength) {
      this.trail.splice(0, this.trail.length - trailLength);
    }

    // Draw glowing neon trail
    if (this.trail.length > 1) {
      ctx.shadowBlur = 10;
      ctx.shadowColor = colors[0] || '#ffffff';

      for (let i = 1; i < this.trail.length; i++) {
        const p1 = this.trail[i - 1];
        const p2 = this.trail[i];

        const progress = i / this.trail.length;
        const alpha = Math.pow(progress, 1.2);
        const hex = sampleGradient(colors, p2.colorT);
        const rgb = hexToRgb(hex);

        ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
        ctx.lineWidth = Math.max(1, progress * 3.5);

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    }

    ctx.restore();
  }
}
