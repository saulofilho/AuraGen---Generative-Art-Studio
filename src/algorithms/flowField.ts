import { ArtConfig, CanvasPointerEvent } from '../types/art';
import { NoiseGenerator, PRNG, sampleGradient, hexToRgb } from '../utils/math';

interface Particle {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  vx: number;
  vy: number;
  age: number;
  maxAge: number;
  colorOffset: number;
}

export class FlowFieldRenderer {
  private particles: Particle[] = [];
  private noise: NoiseGenerator;
  private rng: PRNG;
  private width = 800;
  private height = 800;
  private isInitialized = false;

  constructor() {
    this.noise = new NoiseGenerator(42);
    this.rng = new PRNG(42);
  }

  init(width: number, height: number, config: ArtConfig) {
    this.width = width;
    this.height = height;
    this.rng = new PRNG(config.seed);
    this.noise.reseed(config.seed);

    const count = config.flowField.particleCount;
    this.particles = [];

    for (let i = 0; i < count; i++) {
      this.particles.push(this.createParticle(config));
    }
    this.isInitialized = true;
  }

  private createParticle(config: ArtConfig): Particle {
    const x = this.rng.range(0, this.width);
    const y = this.rng.range(0, this.height);
    return {
      x,
      y,
      prevX: x,
      prevY: y,
      vx: 0,
      vy: 0,
      age: 0,
      maxAge: this.rng.range(config.flowField.particleLifetime * 0.5, config.flowField.particleLifetime * 1.5),
      colorOffset: this.rng.next()
    };
  }

  step(
    ctx: CanvasRenderingContext2D,
    config: ArtConfig,
    time: number,
    pointer?: CanvasPointerEvent,
    audioEnergy = 0
  ) {
    if (!this.isInitialized || this.particles.length !== config.flowField.particleCount) {
      this.init(this.width, this.height, config);
    }

    const {
      noiseScale,
      curlStrength,
      noiseType,
      octaves,
      persistence,
      speed,
      lineWidth,
      opacity,
      colorMode,
      trailDecay,
      symmetry,
      bloom
    } = config.flowField;

    const colors = config.palette.colors;
    const centerX = this.width / 2;
    const centerY = this.height / 2;

    // Trail fade
    if (trailDecay > 0) {
      const bg = hexToRgb(config.backgroundColor);
      ctx.save();
      ctx.fillStyle = `rgba(${bg.r}, ${bg.g}, ${bg.b}, ${trailDecay})`;
      ctx.fillRect(0, 0, this.width, this.height);
      ctx.restore();
    }

    ctx.save();
    if (bloom) {
      ctx.shadowBlur = 8;
      ctx.shadowColor = colors[0] || '#ffffff';
    }

    ctx.lineWidth = Math.max(0.5, lineWidth);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const effectiveSpeed = speed * (1 + audioEnergy * 2);
    const effectiveNoiseScale = noiseScale * 0.002;

    const symAngle = (Math.PI * 2) / Math.max(1, symmetry);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.prevX = p.x;
      p.prevY = p.y;

      const nx = p.x * effectiveNoiseScale;
      const ny = p.y * effectiveNoiseScale;
      const nt = time * 0.0003;

      let angle = 0;
      if (noiseType === 'curl') {
        const curl = this.noise.curl2D(nx, ny);
        angle = Math.atan2(curl.dy, curl.dx) * curlStrength;
      } else if (noiseType === 'simplex') {
        angle = this.noise.noise3D(nx, ny, nt) * Math.PI * 4 * curlStrength;
      } else if (noiseType === 'vortex') {
        const dx = p.x - centerX;
        const dy = p.y - centerY;
        const r = Math.sqrt(dx * dx + dy * dy) * 0.005;
        const theta = Math.atan2(dy, dx);
        angle = theta + Math.PI / 2 + this.noise.noise2D(nx + r, ny + r) * curlStrength;
      } else {
        // Multi-octave fBm Perlin
        const n = this.noise.fbm2D(nx + nt, ny + nt, octaves, persistence);
        angle = n * Math.PI * 4 * curlStrength;
      }

      // Pointer interaction
      if (pointer && pointer.isDown) {
        const pdx = pointer.x - p.x;
        const pdy = pointer.y - p.y;
        const distSq = pdx * pdx + pdy * pdy;
        const radiusSq = 250 * 250;

        if (distSq < radiusSq && distSq > 1) {
          const dist = Math.sqrt(distSq);
          const force = (1 - dist / 250) * 8;
          if (pointer.mode === 'attract') {
            angle = Math.atan2(pdy, pdx);
          } else if (pointer.mode === 'repel') {
            angle = Math.atan2(-pdy, -pdx);
          } else if (pointer.mode === 'swirl') {
            angle = Math.atan2(pdy, pdx) + Math.PI / 2;
          }
        }
      }

      p.vx = Math.cos(angle) * effectiveSpeed;
      p.vy = Math.sin(angle) * effectiveSpeed;

      p.x += p.vx;
      p.y += p.vy;
      p.age++;

      // Wrap or respawn
      if (
        p.age > p.maxAge ||
        p.x < -20 ||
        p.x > this.width + 20 ||
        p.y < -20 ||
        p.y > this.height + 20
      ) {
        this.particles[i] = this.createParticle(config);
        continue;
      }

      // Color computation
      let colorT = 0;
      if (colorMode === 'velocity') {
        const v = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        colorT = (v / (effectiveSpeed + 0.1) + p.colorOffset * 0.2) % 1;
      } else if (colorMode === 'angle') {
        colorT = ((angle / (Math.PI * 2)) % 1 + 1) % 1;
      } else if (colorMode === 'radial') {
        const dx = p.x - centerX;
        const dy = p.y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        colorT = (dist / (Math.min(centerX, centerY) || 1) + p.colorOffset * 0.1) % 1;
      } else {
        colorT = (p.colorOffset + time * 0.0001) % 1;
      }

      const color = sampleGradient(colors, colorT);
      const strokeAlpha = Math.max(0.01, opacity * (1 - p.age / p.maxAge));
      const rgb = hexToRgb(color);
      ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${strokeAlpha})`;

      // Render with rotational symmetry
      if (symmetry <= 1) {
        ctx.beginPath();
        ctx.moveTo(p.prevX, p.prevY);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      } else {
        for (let s = 0; s < symmetry; s++) {
          const rot = s * symAngle;
          const cos = Math.cos(rot);
          const sin = Math.sin(rot);

          // Rotate prev point around center
          const p0x = p.prevX - centerX;
          const p0y = p.prevY - centerY;
          const rx0 = centerX + p0x * cos - p0y * sin;
          const ry0 = centerY + p0x * sin + p0y * cos;

          // Rotate curr point around center
          const p1x = p.x - centerX;
          const p1y = p.y - centerY;
          const rx1 = centerX + p1x * cos - p1y * sin;
          const ry1 = centerY + p1x * sin + p1y * cos;

          ctx.beginPath();
          ctx.moveTo(rx0, ry0);
          ctx.lineTo(rx1, ry1);
          ctx.stroke();
        }
      }
    }

    ctx.restore();
  }

  // Batch render for high-res static export
  renderStatic(ctx: CanvasRenderingContext2D, config: ArtConfig, totalSteps = 200) {
    this.init(this.width, this.height, config);
    // Clear bg if not transparent
    if (!config.transparentBackground) {
      ctx.fillStyle = config.backgroundColor;
      ctx.fillRect(0, 0, this.width, this.height);
    }

    for (let step = 0; step < totalSteps; step++) {
      this.step(ctx, config, step * 16);
    }
  }
}
