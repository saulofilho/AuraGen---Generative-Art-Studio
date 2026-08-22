import { ArtConfig, CanvasPointerEvent } from '../types/art';
import { PRNG, sampleGradient, hexToRgb } from '../utils/math';

export class ReactionDiffusionRenderer {
  private gridWidth = 200;
  private gridHeight = 200;
  private uGrid: Float32Array | null = null;
  private vGrid: Float32Array | null = null;
  private nextU: Float32Array | null = null;
  private nextV: Float32Array | null = null;
  private isInitialized = false;

  init(width: number, height: number, config: ArtConfig) {
    // Keep simulation grid optimized for real-time 60fps, then upsample smoothly to canvas
    const aspect = width / height;
    this.gridHeight = 180;
    this.gridWidth = Math.round(180 * aspect);

    const size = this.gridWidth * this.gridHeight;
    this.uGrid = new Float32Array(size);
    this.vGrid = new Float32Array(size);
    this.nextU = new Float32Array(size);
    this.nextV = new Float32Array(size);

    this.resetGrid(config);
    this.isInitialized = true;
  }

  resetGrid(config: ArtConfig) {
    if (!this.uGrid || !this.vGrid) return;
    const size = this.gridWidth * this.gridHeight;
    this.uGrid.fill(1.0);
    this.vGrid.fill(0.0);

    const rng = new PRNG(config.seed);
    const { presetPattern } = config.reactionDiffusion;

    // Seed center disturbances
    const gw = this.gridWidth;
    const gh = this.gridHeight;

    if (presetPattern === 'solitons' || presetPattern === 'mitosis') {
      const numSpots = rng.rangeInt(6, 14);
      for (let s = 0; s < numSpots; s++) {
        const cx = rng.rangeInt(20, gw - 20);
        const cy = rng.rangeInt(20, gh - 20);
        const r = rng.rangeInt(3, 8);
        for (let y = cy - r; y <= cy + r; y++) {
          for (let x = cx - r; x <= cx + r; x++) {
            if (x >= 0 && x < gw && y >= 0 && y < gh) {
              const idx = y * gw + x;
              this.uGrid[idx] = 0.5;
              this.vGrid[idx] = 0.25;
            }
          }
        }
      }
    } else {
      // Multiple seeded squares / noise patch
      const centerPatch = 16;
      for (let y = Math.floor(gh / 2 - centerPatch); y <= gh / 2 + centerPatch; y++) {
        for (let x = Math.floor(gw / 2 - centerPatch); x <= gw / 2 + centerPatch; x++) {
          if (x >= 0 && x < gw && y >= 0 && y < gh) {
            const idx = y * gw + x;
            this.uGrid[idx] = 0.5 + rng.range(-0.1, 0.1);
            this.vGrid[idx] = 0.25 + rng.range(-0.05, 0.05);
          }
        }
      }
    }
  }

  step(
    ctx: CanvasRenderingContext2D,
    config: ArtConfig,
    pointer?: CanvasPointerEvent
  ) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    if (!this.isInitialized || !this.uGrid) {
      this.init(w, h, config);
    }

    if (!this.uGrid || !this.vGrid || !this.nextU || !this.nextV) return;

    const gw = this.gridWidth;
    const gh = this.gridHeight;
    const {
      feedRate,
      killRate,
      diffusionU,
      diffusionV,
      iterationsPerFrame,
      colorGradientSpread,
      specularLighting
    } = config.reactionDiffusion;

    // Handle interactive disturbance
    if (pointer && pointer.isDown) {
      const gx = Math.floor((pointer.x / w) * gw);
      const gy = Math.floor((pointer.y / h) * gh);
      const radius = 6;

      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const px = gx + dx;
          const py = gy + dy;
          if (px >= 0 && px < gw && py >= 0 && py < gh && dx * dx + dy * dy <= radius * radius) {
            const idx = py * gw + px;
            if (pointer.mode === 'repel') {
              this.uGrid[idx] = 1.0;
              this.vGrid[idx] = 0.0;
            } else {
              this.uGrid[idx] = 0.2;
              this.vGrid[idx] = 0.8;
            }
          }
        }
      }
    }

    // Reaction-Diffusion simulation sub-steps
    const du = diffusionU;
    const dv = diffusionV;
    const F = feedRate;
    const K = killRate;

    for (let it = 0; it < iterationsPerFrame; it++) {
      for (let y = 0; y < gh; y++) {
        const yTop = (y - 1 + gh) % gh;
        const yBottom = (y + 1) % gh;
        const rowCurrent = y * gw;
        const rowTop = yTop * gw;
        const rowBottom = yBottom * gw;

        for (let x = 0; x < gw; x++) {
          const xLeft = (x - 1 + gw) % gw;
          const xRight = (x + 1) % gw;

          const idx = rowCurrent + x;
          const u = this.uGrid[idx];
          const v = this.vGrid[idx];

          // 9-point Laplacian stencil weights
          const lapU =
            this.uGrid[rowTop + x] * 0.2 +
            this.uGrid[rowBottom + x] * 0.2 +
            this.uGrid[rowCurrent + xLeft] * 0.2 +
            this.uGrid[rowCurrent + xRight] * 0.2 +
            this.uGrid[rowTop + xLeft] * 0.05 +
            this.uGrid[rowTop + xRight] * 0.05 +
            this.uGrid[rowBottom + xLeft] * 0.05 +
            this.uGrid[rowBottom + xRight] * 0.05 -
            u;

          const lapV =
            this.vGrid[rowTop + x] * 0.2 +
            this.vGrid[rowBottom + x] * 0.2 +
            this.vGrid[rowCurrent + xLeft] * 0.2 +
            this.vGrid[rowCurrent + xRight] * 0.2 +
            this.vGrid[rowTop + xLeft] * 0.05 +
            this.vGrid[rowTop + xRight] * 0.05 +
            this.vGrid[rowBottom + xLeft] * 0.05 +
            this.vGrid[rowBottom + xRight] * 0.05 -
            v;

          const uvv = u * v * v;
          this.nextU[idx] = Math.max(0, Math.min(1, u + (du * lapU - uvv + F * (1.0 - u))));
          this.nextV[idx] = Math.max(0, Math.min(1, v + (dv * lapV + uvv - (F + K) * v)));
        }
      }

      // Swap buffers
      const tempU = this.uGrid;
      this.uGrid = this.nextU;
      this.nextU = tempU;

      const tempV = this.vGrid;
      this.vGrid = this.nextV;
      this.nextV = tempV;
    }

    // Render to high-resolution / scaled display
    const offCanvas = document.createElement('canvas');
    offCanvas.width = gw;
    offCanvas.height = gh;
    const offCtx = offCanvas.getContext('2d');
    if (!offCtx) return;

    const imgData = offCtx.createImageData(gw, gh);
    const data = imgData.data;
    const colors = config.palette.colors;
    const bgRgb = hexToRgb(config.backgroundColor);

    for (let y = 0; y < gh; y++) {
      for (let x = 0; x < gw; x++) {
        const idx = y * gw + x;
        const u = this.uGrid[idx];
        const v = this.vGrid[idx];

        let val = Math.max(0, Math.min(1, (v / (u + v + 0.0001)) * colorGradientSpread));
        const colorHex = sampleGradient(colors, val);
        const rgb = hexToRgb(colorHex);

        let finalR = rgb.r;
        let finalG = rgb.g;
        let finalB = rgb.b;

        // Specular 3D lighting bump map
        if (specularLighting && x > 0 && y > 0 && x < gw - 1 && y < gh - 1) {
          const dx = this.vGrid[idx + 1] - this.vGrid[idx - 1];
          const dy = this.vGrid[idx + gw] - this.vGrid[idx - gw];
          const lightNorm = Math.max(0, -dx * 0.7 - dy * 0.7 + 0.5);
          finalR = Math.min(255, finalR * (0.6 + lightNorm * 0.8));
          finalG = Math.min(255, finalG * (0.6 + lightNorm * 0.8));
          finalB = Math.min(255, finalB * (0.6 + lightNorm * 0.8));
        }

        const pIdx = idx * 4;
        data[pIdx] = finalR;
        data[pIdx + 1] = finalG;
        data[pIdx + 2] = finalB;
        data[pIdx + 3] = 255;
      }
    }

    offCtx.putImageData(imgData, 0, 0);

    // Draw smoothed to canvas
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(offCanvas, 0, 0, w, h);
  }
}
