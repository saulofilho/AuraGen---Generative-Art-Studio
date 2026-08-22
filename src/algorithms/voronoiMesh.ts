import { ArtConfig, CanvasPointerEvent } from '../types/art';
import { PRNG, sampleGradient, hexToRgb } from '../utils/math';

interface CellPoint {
  x: number;
  y: number;
  vx: number;
  vy: number;
  colorIndex: number;
}

export class VoronoiRenderer {
  private points: CellPoint[] = [];
  private rng: PRNG;
  private isInitialized = false;

  constructor() {
    this.rng = new PRNG(42);
  }

  init(width: number, height: number, config: ArtConfig) {
    this.rng = new PRNG(config.seed);
    const count = config.voronoi.cellCount;
    this.points = [];

    for (let i = 0; i < count; i++) {
      this.points.push({
        x: this.rng.range(10, width - 10),
        y: this.rng.range(10, height - 10),
        vx: this.rng.range(-0.5, 0.5),
        vy: this.rng.range(-0.5, 0.5),
        colorIndex: this.rng.next()
      });
    }

    // Lloyd's relaxation
    for (let r = 0; r < config.voronoi.relaxationSteps; r++) {
      this.relaxPoints(width, height);
    }

    this.isInitialized = true;
  }

  private relaxPoints(width: number, height: number) {
    // Approximate centroid relaxation
    for (let i = 0; i < this.points.length; i++) {
      let avgX = 0;
      let avgY = 0;
      let neighbors = 0;

      for (let j = 0; j < this.points.length; j++) {
        if (i === j) continue;
        const dx = this.points[j].x - this.points[i].x;
        const dy = this.points[j].y - this.points[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120 && dist > 1) {
          avgX += this.points[j].x;
          avgY += this.points[j].y;
          neighbors++;
        }
      }

      if (neighbors > 0) {
        this.points[i].x = this.points[i].x * 0.7 + (avgX / neighbors) * 0.3;
        this.points[i].y = this.points[i].y * 0.7 + (avgY / neighbors) * 0.3;
      }
    }
  }

  render(
    ctx: CanvasRenderingContext2D,
    config: ArtConfig,
    time = 0,
    pointer?: CanvasPointerEvent,
    isExport = false
  ) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    if (!this.isInitialized || this.points.length !== config.voronoi.cellCount) {
      this.init(w, h, config);
    }

    const {
      distanceMetric,
      renderMode,
      borderWidth,
      colorJitter,
      warpDistortion
    } = config.voronoi;

    const colors = config.palette.colors;

    // Move points slowly
    for (const p of this.points) {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 10 || p.x > w - 10) p.vx *= -1;
      if (p.y < 10 || p.y > h - 10) p.vy *= -1;
    }

    // Interactive pointer repulsion
    if (pointer && pointer.isDown) {
      for (const p of this.points) {
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200 && dist > 1) {
          const force = (1 - dist / 200) * 8;
          p.x += (dx / dist) * force;
          p.y += (dy / dist) * force;
        }
      }
    }

    if (renderMode === 'delaunay_mesh') {
      if (!config.transparentBackground) {
        ctx.fillStyle = config.backgroundColor;
        ctx.fillRect(0, 0, w, h);
      } else {
        ctx.clearRect(0, 0, w, h);
      }

      ctx.lineWidth = Math.max(0.5, borderWidth);
      const maxDist = 180;

      for (let i = 0; i < this.points.length; i++) {
        for (let j = i + 1; j < this.points.length; j++) {
          const p1 = this.points[i];
          const p2 = this.points[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const alpha = 1 - dist / maxDist;
            const colorT = (p1.colorIndex + p2.colorIndex) * 0.5;
            const hex = sampleGradient(colors, colorT);
            const rgb = hexToRgb(hex);

            ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha * 0.8})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // Draw node points
      for (const p of this.points) {
        ctx.fillStyle = sampleGradient(colors, p.colorIndex);
        ctx.beginPath();
        ctx.arc(p.x, p.y, borderWidth * 2 + 2, 0, Math.PI * 2);
        ctx.fill();
      }
      return;
    }

    // Dense pixel rasterizer for Cells & Stained Glass with distance metrics
    // Use an internal grid resolution for performance if live, full if export
    const step = isExport ? 1 : 2;
    const imgW = Math.ceil(w / step);
    const imgH = Math.ceil(h / step);

    const offCanvas = document.createElement('canvas');
    offCanvas.width = imgW;
    offCanvas.height = imgH;
    const offCtx = offCanvas.getContext('2d');
    if (!offCtx) return;

    const imgData = offCtx.createImageData(imgW, imgH);
    const data = imgData.data;

    const getDistance = (x1: number, y1: number, x2: number, y2: number) => {
      const dx = Math.abs(x1 - x2);
      const dy = Math.abs(y1 - y2);
      if (distanceMetric === 'manhattan') {
        return dx + dy;
      } else if (distanceMetric === 'chebyshev') {
        return Math.max(dx, dy);
      }
      return Math.sqrt(dx * dx + dy * dy);
    };

    for (let iy = 0; iy < imgH; iy++) {
      const py = iy * step;
      for (let ix = 0; ix < imgW; ix++) {
        const px = ix * step;

        let d1 = Infinity;
        let d2 = Infinity;
        let closestPoint = this.points[0];

        // Domain warp distortion
        const warpX = warpDistortion > 0 ? Math.sin(py * 0.02 + time * 0.001) * warpDistortion * 20 : 0;
        const warpY = warpDistortion > 0 ? Math.cos(px * 0.02 + time * 0.001) * warpDistortion * 20 : 0;

        for (const p of this.points) {
          const d = getDistance(px + warpX, py + warpY, p.x, p.y);
          if (d < d1) {
            d2 = d1;
            d1 = d;
            closestPoint = p;
          } else if (d < d2) {
            d2 = d;
          }
        }

        const borderDist = d2 - d1;
        const isBorder = borderDist < borderWidth * 2;

        const idx = (iy * imgW + ix) * 4;

        if (isBorder && borderWidth > 0) {
          data[idx] = 10;
          data[idx + 1] = 10;
          data[idx + 2] = 15;
          data[idx + 3] = 255;
        } else {
          let colorVal = (closestPoint.colorIndex + colorJitter * 0.1) % 1;
          const hex = sampleGradient(colors, colorVal);
          const rgb = hexToRgb(hex);

          let r = rgb.r;
          let g = rgb.g;
          let b = rgb.b;

          // Stained glass inner gradient shading
          if (renderMode === 'stained_glass') {
            const innerShade = Math.min(1.4, 0.4 + (d1 / (d2 + 0.01)) * 0.8);
            r = Math.min(255, r * innerShade);
            g = Math.min(255, g * innerShade);
            b = Math.min(255, b * innerShade);
          }

          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
          data[idx + 3] = 255;
        }
      }
    }

    offCtx.putImageData(imgData, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(offCanvas, 0, 0, w, h);
  }
}
