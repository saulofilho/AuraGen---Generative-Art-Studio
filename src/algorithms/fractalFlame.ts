import { ArtConfig } from '../types/art';
import { PRNG, sampleGradient, hexToRgb } from '../utils/math';

interface Transform {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
  weight: number;
  colorIndex: number;
}

export class FractalFlameRenderer {
  private width = 800;
  private height = 800;
  private densityBuffer: Float32Array | null = null;
  private colorBuffer: Float32Array | null = null;

  init(width: number, height: number) {
    this.width = width;
    this.height = height;
    const totalPixels = width * height;
    this.densityBuffer = new Float32Array(totalPixels);
    this.colorBuffer = new Float32Array(totalPixels * 3);
  }

  private createTransforms(config: ArtConfig): Transform[] {
    const rng = new PRNG(config.seed);
    const count = config.fractalFlame.transformsCount;
    const transforms: Transform[] = [];

    for (let i = 0; i < count; i++) {
      transforms.push({
        a: rng.range(-1, 1),
        b: rng.range(-1, 1),
        c: rng.range(-1, 1),
        d: rng.range(-1, 1),
        e: rng.range(-1, 1),
        f: rng.range(-1, 1),
        weight: rng.range(0.2, 1.0),
        colorIndex: i / count
      });
    }
    return transforms;
  }

  render(ctx: CanvasRenderingContext2D, config: ArtConfig, time = 0, isExport = false) {
    if (!this.densityBuffer || this.width !== ctx.canvas.width || this.height !== ctx.canvas.height) {
      this.init(ctx.canvas.width, ctx.canvas.height);
    }

    const {
      variation,
      iterations,
      gamma,
      vibrancy,
      zoom,
      rotation,
      symmetry
    } = config.fractalFlame;

    const colors = config.palette.colors;
    const w = this.width;
    const h = this.height;
    const totalPixels = w * h;

    if (this.densityBuffer && this.colorBuffer) {
      this.densityBuffer.fill(0);
      this.colorBuffer.fill(0);
    }

    const transforms = this.createTransforms(config);
    const totalWeight = transforms.reduce((acc, t) => acc + t.weight, 0);

    const actualIter = isExport ? iterations * 2 : iterations;
    const rng = new PRNG(config.seed + Math.floor(time * 0.05));

    let px = rng.range(-1, 1);
    let py = rng.range(-1, 1);
    let pColor = 0;

    // Warm-up
    for (let i = 0; i < 50; i++) {
      let rVal = rng.range(0, totalWeight);
      let t = transforms[0];
      for (const trans of transforms) {
        if (rVal <= trans.weight) {
          t = trans;
          break;
        }
        rVal -= trans.weight;
      }
      const nx = t.a * px + t.b * py + t.e;
      const ny = t.c * px + t.d * py + t.f;
      px = nx;
      py = ny;
    }

    const centerX = w / 2;
    const centerY = h / 2;
    const scale = (Math.min(w, h) / 3) * zoom;
    const rotRad = (rotation * Math.PI) / 180 + time * 0.0002;
    const cosR = Math.cos(rotRad);
    const sinR = Math.sin(rotRad);

    let maxDensity = 1;

    for (let i = 0; i < actualIter; i++) {
      // Pick random transform weighted
      let rVal = rng.range(0, totalWeight);
      let t = transforms[0];
      for (const trans of transforms) {
        if (rVal <= trans.weight) {
          t = trans;
          break;
        }
        rVal -= trans.weight;
      }

      // Linear affine map
      let nx = t.a * px + t.b * py + t.e;
      let ny = t.c * px + t.d * py + t.f;

      // Nonlinear variation mapping
      const r2 = nx * nx + ny * ny;
      const r = Math.sqrt(r2) + 0.00001;
      const theta = Math.atan2(ny, nx);

      if (variation === 'sinusoidal') {
        nx = Math.sin(nx);
        ny = Math.sin(ny);
      } else if (variation === 'spherical') {
        nx = nx / (r2 + 0.001);
        ny = ny / (r2 + 0.001);
      } else if (variation === 'swirl') {
        nx = nx * Math.sin(r2) - ny * Math.cos(r2);
        ny = nx * Math.cos(r2) + ny * Math.sin(r2);
      } else if (variation === 'horseshoe') {
        nx = (nx - ny) * (nx + ny) / r;
        ny = 2 * nx * ny / r;
      } else if (variation === 'polar') {
        nx = theta / Math.PI;
        ny = r - 1;
      } else if (variation === 'heart') {
        nx = r * Math.sin(theta * r);
        ny = -r * Math.cos(theta * r);
      } else if (variation === 'disc') {
        nx = (theta / Math.PI) * Math.sin(Math.PI * r);
        ny = (theta / Math.PI) * Math.cos(Math.PI * r);
      } else if (variation === 'julia') {
        const sqrtR = Math.sqrt(r);
        const omega = rng.boolean() ? 0 : Math.PI;
        nx = sqrtR * Math.cos(theta / 2 + omega);
        ny = sqrtR * Math.sin(theta / 2 + omega);
      }

      px = nx;
      py = ny;
      pColor = (pColor + t.colorIndex) * 0.5;

      // Symmetry plotting
      const symCount = Math.max(1, symmetry);
      for (let s = 0; s < symCount; s++) {
        const symAngle = (Math.PI * 2 * s) / symCount;
        const cosS = Math.cos(symAngle);
        const sinS = Math.sin(symAngle);

        const symX = px * cosS - py * sinS;
        const symY = px * sinS + py * cosS;

        // Apply global canvas rotation
        const rotX = symX * cosR - symY * sinR;
        const rotY = symX * sinR + symY * cosR;

        const screenX = Math.floor(centerX + rotX * scale);
        const screenY = Math.floor(centerY + rotY * scale);

        if (screenX >= 0 && screenX < w && screenY >= 0 && screenY < h) {
          const pixelIdx = screenY * w + screenX;
          if (this.densityBuffer && this.colorBuffer) {
            this.densityBuffer[pixelIdx] += 1;
            if (this.densityBuffer[pixelIdx] > maxDensity) {
              maxDensity = this.densityBuffer[pixelIdx];
            }

            const hex = sampleGradient(colors, pColor);
            const rgb = hexToRgb(hex);

            this.colorBuffer[pixelIdx * 3] += rgb.r;
            this.colorBuffer[pixelIdx * 3 + 1] += rgb.g;
            this.colorBuffer[pixelIdx * 3 + 2] += rgb.b;
          }
        }
      }
    }

    // Render image data
    const imageData = ctx.createImageData(w, h);
    const data = imageData.data;
    const bgRgb = hexToRgb(config.backgroundColor);

    const logMax = Math.log(maxDensity + 1);

    for (let i = 0; i < totalPixels; i++) {
      const density = this.densityBuffer ? this.densityBuffer[i] : 0;
      const idx4 = i * 4;

      if (density === 0) {
        if (!config.transparentBackground) {
          data[idx4] = bgRgb.r;
          data[idx4 + 1] = bgRgb.g;
          data[idx4 + 2] = bgRgb.b;
          data[idx4 + 3] = 255;
        } else {
          data[idx4 + 3] = 0;
        }
        continue;
      }

      // Log-density mapping with gamma correction & vibrancy
      const alpha = Math.log(density + 1) / logMax;
      const intensity = Math.pow(alpha, 1 / gamma) * vibrancy;

      const avgR = this.colorBuffer ? (this.colorBuffer[i * 3] / density) : 255;
      const avgG = this.colorBuffer ? (this.colorBuffer[i * 3 + 1] / density) : 255;
      const avgB = this.colorBuffer ? (this.colorBuffer[i * 3 + 2] / density) : 255;

      const finalR = Math.min(255, avgR * intensity);
      const finalG = Math.min(255, avgG * intensity);
      const finalB = Math.min(255, avgB * intensity);

      if (!config.transparentBackground) {
        data[idx4] = Math.min(255, bgRgb.r * (1 - alpha) + finalR);
        data[idx4 + 1] = Math.min(255, bgRgb.g * (1 - alpha) + finalG);
        data[idx4 + 2] = Math.min(255, bgRgb.b * (1 - alpha) + finalB);
        data[idx4 + 3] = 255;
      } else {
        data[idx4] = finalR;
        data[idx4 + 1] = finalG;
        data[idx4 + 2] = finalB;
        data[idx4 + 3] = Math.min(255, Math.floor(alpha * 255));
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }
}
