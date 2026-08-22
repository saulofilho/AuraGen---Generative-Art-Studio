import { ArtConfig, ExportOptions } from '../types/art';
import { FlowFieldRenderer } from '../algorithms/flowField';
import { StrangeAttractorRenderer } from '../algorithms/strangeAttractor';
import { SacredGeometryRenderer } from '../algorithms/sacredGeometry';
import { FractalFlameRenderer } from '../algorithms/fractalFlame';
import { ReactionDiffusionRenderer } from '../algorithms/reactionDiffusion';
import { VoronoiRenderer } from '../algorithms/voronoiMesh';
import { FourierEpicyclesRenderer } from '../algorithms/fourierEpicycles';
import { sampleGradient } from './math';

export async function renderHighResArtwork(
  config: ArtConfig,
  options: ExportOptions,
  onProgress?: (percent: number, status: string) => void
): Promise<string> {
  const { width, height, format, quality } = options;

  onProgress?.(10, 'Preparando canvas de alta resolução...');

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: true, willReadFrequently: true });

  if (!ctx) {
    throw new Error('Não foi possível inicializar o contexto de renderização 2D.');
  }

  // Draw background if not transparent
  if (!config.transparentBackground) {
    ctx.fillStyle = config.backgroundColor;
    ctx.fillRect(0, 0, width, height);
  } else {
    ctx.clearRect(0, 0, width, height);
  }

  onProgress?.(25, `Renderizando algoritmo ${config.algorithm} em ${width}x${height}px...`);

  // Render based on algorithm
  if (config.algorithm === 'flow_field') {
    const renderer = new FlowFieldRenderer();
    const steps = 300;
    renderer.init(width, height, config);
    for (let s = 0; s < steps; s++) {
      renderer.step(ctx, config, s * 16);
      if (s % 30 === 0) {
        onProgress?.(25 + Math.floor((s / steps) * 60), `Traçando linhas de fluxo (${s}/${steps})...`);
        await new Promise(r => setTimeout(r, 0));
      }
    }
  } else if (config.algorithm === 'strange_attractors') {
    const renderer = new StrangeAttractorRenderer();
    renderer.init(width, height);
    onProgress?.(50, 'Computando equações de caos & densidade logarítmica...');
    await new Promise(r => setTimeout(r, 10));
    renderer.render(ctx, config, 0, true);
  } else if (config.algorithm === 'sacred_geometry') {
    const renderer = new SacredGeometryRenderer();
    onProgress?.(60, 'Gerando curvas de ressonância e geometria sagrada...');
    await new Promise(r => setTimeout(r, 10));
    renderer.render(ctx, config, 0);
  } else if (config.algorithm === 'fractal_flame') {
    const renderer = new FractalFlameRenderer();
    renderer.init(width, height);
    onProgress?.(50, 'Iterando sistema de funções fractais com variações não-lineares...');
    await new Promise(r => setTimeout(r, 10));
    renderer.render(ctx, config, 0, true);
  } else if (config.algorithm === 'reaction_diffusion') {
    const renderer = new ReactionDiffusionRenderer();
    renderer.init(width, height, config);
    const warmup = 240;
    for (let w = 0; w < warmup; w++) {
      renderer.step(ctx, config);
      if (w % 40 === 0) {
        onProgress?.(25 + Math.floor((w / warmup) * 60), `Simulando morfogênese Turing (${w}/${warmup})...`);
        await new Promise(r => setTimeout(r, 0));
      }
    }
  } else if (config.algorithm === 'voronoi_mesh') {
    const renderer = new VoronoiRenderer();
    renderer.init(width, height, config);
    onProgress?.(60, 'Cristalizando células de Voronoi e tesselação...');
    await new Promise(r => setTimeout(r, 10));
    renderer.render(ctx, config, 0, undefined, true);
  } else if (config.algorithm === 'fourier_epicycles') {
    const renderer = new FourierEpicyclesRenderer();
    onProgress?.(50, 'Computando órbita de harmônicos de Fourier...');
    const traceSteps = 1500;
    for (let t = 0; t < traceSteps; t++) {
      renderer.render(ctx, config, t * 8);
    }
  }

  // Watermark if requested
  if (options.includeWatermark && options.watermarkText) {
    ctx.save();
    ctx.font = `600 ${Math.max(14, Math.floor(width * 0.015))}px sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText(options.watermarkText, width - Math.floor(width * 0.03), height - Math.floor(height * 0.03));
    ctx.restore();
  }

  onProgress?.(90, 'Codificando arquivo...');
  await new Promise(r => setTimeout(r, 10));

  let mimeType = 'image/png';
  if (format === 'jpeg') mimeType = 'image/jpeg';
  else if (format === 'webp') mimeType = 'image/webp';

  const dataUrl = canvas.toDataURL(mimeType, quality);
  onProgress?.(100, 'Pronto!');
  return dataUrl;
}

export function generateSVGArtwork(config: ArtConfig, width = 1920, height = 1080): string {
  const centerX = width / 2;
  const centerY = height / 2;
  const colors = config.palette.colors;
  const bg = config.transparentBackground ? 'none' : config.backgroundColor;

  let svgContent = '';

  if (config.algorithm === 'sacred_geometry') {
    const { geometryType, elementsCount, goldenAngleMod, waveModulation } = config.sacredGeometry;
    if (geometryType === 'phyllotaxis') {
      const c = (Math.min(width, height) / 2) / Math.sqrt(elementsCount) * 0.95;
      const angleStep = ((137.5 + goldenAngleMod) * Math.PI) / 180;
      let circles = '';
      for (let n = 0; n < elementsCount; n++) {
        const phi = n * angleStep;
        let r = c * Math.sqrt(n);
        if (waveModulation > 0) r += Math.sin(phi * 3) * (waveModulation * 8);
        const x = centerX + r * Math.cos(phi);
        const y = centerY + r * Math.sin(phi);
        const color = sampleGradient(colors, n / elementsCount);
        const radius = Math.max(1, (r / (Math.min(width, height) * 0.5)) * 6);
        circles += `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${radius.toFixed(2)}" fill="${color}" opacity="0.85"/>\n`;
      }
      svgContent = circles;
    } else {
      // Harmonograph path
      const steps = elementsCount * 6;
      const [f1, f2, f3, f4] = config.sacredGeometry.pendulumFrequencies;
      const scale = Math.min(width, height) * 0.42;
      let pathData = '';
      for (let i = 0; i < steps; i++) {
        const t = i * 0.01;
        const x = centerX + scale * (Math.sin(f1 * t) + Math.sin(f2 * t)) * 0.5;
        const y = centerY + scale * (Math.sin(f3 * t) + Math.sin(f4 * t)) * 0.5;
        pathData += `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)} `;
      }
      const strokeColor = colors[0] || '#00F0FF';
      svgContent = `<path d="${pathData}" fill="none" stroke="${strokeColor}" stroke-width="${config.sacredGeometry.lineWidth}" opacity="0.8"/>`;
    }
  } else {
    // Default fallback SVG message
    svgContent = `<text x="${centerX}" y="${centerY}" fill="${colors[0]}" font-size="24" text-anchor="middle" font-family="sans-serif">AuraGen Vector Export</text>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <rect width="100%" height="100%" fill="${bg}"/>
  ${svgContent}
</svg>`;
}

export function downloadFile(url: string, filename: string) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
