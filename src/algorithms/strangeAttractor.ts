import { ArtConfig } from '../types/art';
import { sampleGradient, hexToRgb } from '../utils/math';

export class StrangeAttractorRenderer {
  private width = 800;
  private height = 800;
  // Accumulation buffer for high dynamic range density mapping
  private densityBuffer: Float32Array | null = null;
  private colorBuffer: Float32Array | null = null; // R, G, B channels

  init(width: number, height: number) {
    this.width = width;
    this.height = height;
    const totalPixels = width * height;
    this.densityBuffer = new Float32Array(totalPixels);
    this.colorBuffer = new Float32Array(totalPixels * 3);
  }

  render(
    ctx: CanvasRenderingContext2D,
    config: ArtConfig,
    time = 0,
    isExport = false
  ) {
    if (!this.densityBuffer || this.width !== ctx.canvas.width || this.height !== ctx.canvas.height) {
      this.init(ctx.canvas.width, ctx.canvas.height);
    }

    const {
      attractorType,
      iterations,
      dt,
      a,
      b,
      c,
      d,
      exposure,
      colorMapping,
      projection3D,
      rotationX,
      rotationY,
      rotationZ,
      zoom
    } = config.strangeAttractor;

    const colors = config.palette.colors;
    const w = this.width;
    const h = this.height;
    const totalPixels = w * h;

    // Reset density & color buffers
    if (this.densityBuffer && this.colorBuffer) {
      this.densityBuffer.fill(0);
      this.colorBuffer.fill(0);
    }

    // Dynamic morphing factor with time
    const morphTime = time * 0.0005;
    const currA = a + Math.sin(morphTime * 0.7) * 0.05;
    const currB = b + Math.cos(morphTime * 0.5) * 0.05;
    const currC = c + Math.sin(morphTime * 0.3) * 0.05;
    const currD = d + Math.cos(morphTime * 0.9) * 0.05;

    // Initial state
    let x = 0.1;
    let y = 0.1;
    let z = 0.1;

    // Discard warm-up iterations
    for (let i = 0; i < 200; i++) {
      if (attractorType === 'clifford') {
        const nx = Math.sin(currA * y) + currC * Math.cos(currA * x);
        const ny = Math.sin(currB * x) + currD * Math.cos(currB * y);
        x = nx; y = ny;
      } else if (attractorType === 'dejong') {
        const nx = Math.sin(currA * y) - Math.cos(currB * x);
        const ny = Math.sin(currC * x) - Math.cos(currD * y);
        x = nx; y = ny;
      } else if (attractorType === 'bedhead') {
        const nx = Math.sin(x * currY(currA, y)) / currB + Math.cos(currA * x);
        const ny = x + Math.sin(y) / currB;
        x = nx; y = ny;
      } else if (attractorType === 'lorenz') {
        const sigma = 10, rho = 28, beta = 8 / 3;
        const dx = sigma * (y - x) * dt;
        const dy = (x * (rho - z) - y) * dt;
        const dz = (x * y - beta * z) * dt;
        x += dx; y += dy; z += dz;
      } else if (attractorType === 'aizawa') {
        const dx = ((z - 0.7) * x - 3.5 * y) * dt;
        const dy = (3.5 * x + (z - 0.7) * y) * dt;
        const dz = (0.6 + 0.95 * z - (z * z * z) / 3 - (x * x + y * y) * (1 + 0.25 * z) + 0.1 * z * (x * x * x)) * dt;
        x += dx; y += dy; z += dz;
      } else if (attractorType === 'thomas') {
        const bConst = 0.208186;
        const dx = (Math.sin(y) - bConst * x) * dt * 5;
        const dy = (Math.sin(z) - bConst * y) * dt * 5;
        const dz = (Math.sin(x) - bConst * z) * dt * 5;
        x += dx; y += dy; z += dz;
      }
    }

    const radX = (rotationX * Math.PI) / 180;
    const radY = (rotationY * Math.PI) / 180 + time * 0.0002;
    const radZ = (rotationZ * Math.PI) / 180;

    const cosX = Math.cos(radX), sinX = Math.sin(radX);
    const cosY = Math.cos(radY), sinY = Math.sin(radY);
    const cosZ = Math.cos(radZ), sinZ = Math.sin(radZ);

    const actualIter = isExport ? iterations * 2 : iterations;
    const centerX = w / 2;
    const centerY = h / 2;
    const baseScale = (Math.min(w, h) / 4) * zoom;

    let maxDensity = 1;

    for (let i = 0; i < actualIter; i++) {
      let prevX = x, prevY = y, prevZ = z;

      if (attractorType === 'clifford') {
        const nx = Math.sin(currA * y) + currC * Math.cos(currA * x);
        const ny = Math.sin(currB * x) + currD * Math.cos(currB * y);
        x = nx; y = ny; z = Math.sin(nx * ny);
      } else if (attractorType === 'dejong') {
        const nx = Math.sin(currA * y) - Math.cos(currB * x);
        const ny = Math.sin(currC * x) - Math.cos(currD * y);
        x = nx; y = ny; z = Math.cos(nx * ny);
      } else if (attractorType === 'bedhead') {
        const nx = Math.sin(x * y / currA) + Math.cos(currB * x);
        const ny = x + Math.sin(y) / currC;
        x = nx; y = ny; z = Math.sin(x + y);
      } else if (attractorType === 'lorenz') {
        const sigma = 10, rho = 28, beta = 8 / 3;
        const dx = sigma * (y - x) * dt;
        const dy = (x * (rho - z) - y) * dt;
        const dz = (x * y - beta * z) * dt;
        x += dx; y += dy; z += dz;
      } else if (attractorType === 'aizawa') {
        const dx = ((z - 0.7) * x - 3.5 * y) * dt;
        const dy = (3.5 * x + (z - 0.7) * y) * dt;
        const dz = (0.6 + 0.95 * z - (z * z * z) / 3 - (x * x + y * y) * (1 + 0.25 * z) + 0.1 * z * (x * x * x)) * dt;
        x += dx; y += dy; z += dz;
      } else if (attractorType === 'thomas') {
        const bConst = 0.208186;
        const dx = (Math.sin(y) - bConst * x) * dt * 5;
        const dy = (Math.sin(z) - bConst * y) * dt * 5;
        const dz = (Math.sin(x) - bConst * z) * dt * 5;
        x += dx; y += dy; z += dz;
      }

      // 3D rotation & projection
      let px = x, py = y, pz = z;
      if (attractorType === 'lorenz') {
        px = x * 0.08;
        py = y * 0.08;
        pz = (z - 25) * 0.08;
      } else if (attractorType === 'aizawa') {
        px = x * 1.5;
        py = y * 1.5;
        pz = (z - 0.5) * 1.5;
      } else if (attractorType === 'thomas') {
        px = x * 0.6;
        py = y * 0.6;
        pz = z * 0.6;
      }

      // Rotate around Y
      let x1 = px * cosY + pz * sinY;
      let y1 = py;
      let z1 = -px * sinY + pz * cosY;

      // Rotate around X
      let x2 = x1;
      let y2 = y1 * cosX - z1 * sinX;
      let z2 = y1 * sinX + z1 * cosX;

      // Rotate around Z
      let x3 = x2 * cosZ - y2 * sinZ;
      let y3 = x2 * sinZ + y2 * cosZ;
      let z3 = z2;

      // Perspective projection
      const cameraDistance = 4;
      const perspective = projection3D ? cameraDistance / (cameraDistance - z3 * 0.5) : 1;

      const screenX = Math.floor(centerX + x3 * baseScale * perspective);
      const screenY = Math.floor(centerY + y3 * baseScale * perspective);

      if (screenX >= 0 && screenX < w && screenY >= 0 && screenY < h) {
        const pixelIdx = screenY * w + screenX;
        if (this.densityBuffer && this.colorBuffer) {
          this.densityBuffer[pixelIdx] += 1;
          if (this.densityBuffer[pixelIdx] > maxDensity) {
            maxDensity = this.densityBuffer[pixelIdx];
          }

          // Compute color factor
          let colorT = 0;
          if (colorMapping === 'lyapunov' || colorMapping === 'velocity') {
            const v = Math.sqrt((x - prevX)**2 + (y - prevY)**2 + (z - prevZ)**2);
            colorT = Math.min(1, v * 20);
          } else if (colorMapping === 'z_depth') {
            colorT = ((z3 + 2) / 4) % 1;
          } else {
            colorT = (i / actualIter + time * 0.0001) % 1;
          }

          const hex = sampleGradient(colors, colorT);
          const rgb = hexToRgb(hex);

          this.colorBuffer[pixelIdx * 3] += rgb.r;
          this.colorBuffer[pixelIdx * 3 + 1] += rgb.g;
          this.colorBuffer[pixelIdx * 3 + 2] += rgb.b;
        }
      }
    }

    // Render density buffer to image data
    const imageData = ctx.createImageData(w, h);
    const data = imageData.data;
    const bgRgb = hexToRgb(config.backgroundColor);

    const logMax = Math.log(maxDensity + 1);
    const expFactor = exposure * 1.5;

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

      // Log-density mapping for dynamic glow & cosmic high dynamic range
      const intensity = Math.pow(Math.log(density + 1) / logMax, 1 / expFactor);
      const avgR = this.colorBuffer ? (this.colorBuffer[i * 3] / density) : 255;
      const avgG = this.colorBuffer ? (this.colorBuffer[i * 3 + 1] / density) : 255;
      const avgB = this.colorBuffer ? (this.colorBuffer[i * 3 + 2] / density) : 255;

      const finalR = Math.min(255, avgR * intensity);
      const finalG = Math.min(255, avgG * intensity);
      const finalB = Math.min(255, avgB * intensity);

      if (!config.transparentBackground) {
        // Blend with bg
        data[idx4] = Math.min(255, bgRgb.r * (1 - intensity) + finalR);
        data[idx4 + 1] = Math.min(255, bgRgb.g * (1 - intensity) + finalG);
        data[idx4 + 2] = Math.min(255, bgRgb.b * (1 - intensity) + finalB);
        data[idx4 + 3] = 255;
      } else {
        data[idx4] = finalR;
        data[idx4 + 1] = finalG;
        data[idx4 + 2] = finalB;
        data[idx4 + 3] = Math.min(255, Math.floor(intensity * 255));
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }
}

function currY(a: number, y: number) {
  return a * y + 0.1;
}
