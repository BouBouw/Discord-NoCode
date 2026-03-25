import { createCanvas, loadImage } from '@napi-rs/canvas';
import { resolve, resolveChannel } from '../context.js';

// Draw a rounded rectangle path
function roundedRect(ctx, x, y, w, h, r) {
  r = Math.min(r ?? 0, w / 2, h / 2);
  if (r <= 0) { ctx.rect(x, y, w, h); return; }
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);          ctx.quadraticCurveTo(x + w, y,     x + w, y + r);
  ctx.lineTo(x + w, y + h - r);      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);          ctx.quadraticCurveTo(x,     y + h, x,     y + h - r);
  ctx.lineTo(x, y + r);              ctx.quadraticCurveTo(x,     y,     x + r, y);
  ctx.closePath();
}

// Resolve a value expression — replaces {variable.xyz} tokens via ctx.variables
function resolveValue(raw, ctx) {
  if (typeof raw !== 'string') return String(raw ?? '');
  return raw.replace(/\{variable\.([^}]+)\}/g, (_, k) => String(ctx.variables?.[k] ?? ''));
}

export async function executeAction(type, config, ctx) {
  if (type !== 'canvasCard') return null;

  const W = Number(config.width)  || 800;
  const H = Number(config.height) || 250;

  const canvas = createCanvas(W, H);
  const c      = canvas.getContext('2d');

  for (const layer of (config.layers ?? [])) {
    c.save();
    try {
      // Apply opacity (all non-background layers)
      if (layer.type !== 'background' && layer.opacity !== undefined && layer.opacity !== 1) {
        c.globalAlpha = Math.max(0, Math.min(1, Number(layer.opacity)));
      }

      // Shadow helper — applied before drawing shapes
      const applyShadow = () => {
        if (layer.shadowColor) {
          c.shadowColor   = layer.shadowColor;
          c.shadowBlur    = Number(layer.shadowBlur    ?? 0);
          c.shadowOffsetX = Number(layer.shadowOffsetX ?? 0);
          c.shadowOffsetY = Number(layer.shadowOffsetY ?? 0);
        }
      };

      // Stroke helper — applied after fill
      const applyStroke = () => {
        if (layer.strokeColor && Number(layer.strokeWidth) > 0) {
          c.strokeStyle = layer.strokeColor;
          c.lineWidth   = Number(layer.strokeWidth);
          c.stroke();
        }
      };

      // ── Background ──────────────────────────────────────────────────────────
      if (layer.type === 'background') {
        if (layer.bgMode === 'gradient') {
          const dirs = {
            horizontal: [0, 0, W, 0],
            vertical:   [0, 0, 0, H],
            diagonal:   [0, 0, W, H],
          };
          const [x0, y0, x1, y1] = dirs[layer.bgGradientDir ?? 'horizontal'];
          const grad = c.createLinearGradient(x0, y0, x1, y1);
          grad.addColorStop(0, layer.bgGradientFrom ?? '#1a1a2e');
          grad.addColorStop(1, layer.bgGradientTo   ?? '#16213e');
          c.fillStyle = grad;
          c.fillRect(0, 0, W, H);

        } else if (layer.bgMode === 'image' && layer.bgImageUrl) {
          const url = resolveValue(layer.bgImageUrl, ctx);
          const img = await loadImage(url);
          c.drawImage(img, 0, 0, W, H);

        } else {
          c.fillStyle = layer.bgColor ?? '#2f3136';
          c.fillRect(0, 0, W, H);
        }

      // ── Text ────────────────────────────────────────────────────────────────
      } else if (layer.type === 'text') {
        applyShadow();
        const fw = layer.fontWeight ?? 'normal';
        const fs = Number(layer.fontSize) || 24;
        c.font         = `${fw} ${fs}px sans-serif`;
        c.fillStyle    = layer.color     ?? '#FFFFFF';
        c.textAlign    = layer.textAlign ?? 'left';
        c.textBaseline = 'top';
        const text = resolveValue(layer.text ?? '', ctx);
        c.fillText(text, Number(layer.x) || 0, Number(layer.y) || 0);

      // ── Image / Avatar ──────────────────────────────────────────────────────
      } else if (layer.type === 'image') {
        applyShadow();
        const url = resolveValue(layer.imageUrl ?? '', ctx);
        if (url) {
          const img = await loadImage(url);
          const x   = Number(layer.x) || 30;
          const y   = Number(layer.y) || 30;
          const sz  = Number(layer.imageSize) || 90;

          if (layer.rounded) {
            c.beginPath();
            c.arc(x + sz / 2, y + sz / 2, sz / 2, 0, Math.PI * 2);
            c.clip();
          }
          c.drawImage(img, x, y, sz, sz);
        }

      // ── Rectangle ───────────────────────────────────────────────────────────
      } else if (layer.type === 'rect') {
        applyShadow();
        const x = Number(layer.x)      || 0;
        const y = Number(layer.y)      || 0;
        const w = Number(layer.width)  || 200;
        const h = Number(layer.height) || 20;
        const r = Number(layer.borderRadius) || 0;
        c.fillStyle = layer.fillColor ?? '#4f545c';
        c.beginPath();
        roundedRect(c, x, y, w, h, r);
        c.fill();
        applyStroke();

      // ── Circle ──────────────────────────────────────────────────────────────
      } else if (layer.type === 'circle') {
        applyShadow();
        c.beginPath();
        c.arc(
          Number(layer.cx     ?? 120),
          Number(layer.cy     ?? 125),
          Number(layer.radius ??  60),
          0, Math.PI * 2
        );
        c.fillStyle = layer.fillColor ?? '#5865F2';
        c.fill();
        applyStroke();

      // ── Line ────────────────────────────────────────────────────────────────
      } else if (layer.type === 'line') {
        c.beginPath();
        c.moveTo(Number(layer.x1 ?? 0),  Number(layer.y1 ?? 0));
        c.lineTo(Number(layer.x2 ?? W),  Number(layer.y2 ?? 0));
        c.strokeStyle = layer.strokeColor ?? '#5865F2';
        c.lineWidth   = Number(layer.lineWidth ?? 3);
        c.lineCap     = layer.lineCap ?? 'round';
        c.stroke();

      // ── Badge ────────────────────────────────────────────────────────────────
      } else if (layer.type === 'badge') {
        applyShadow();
        const px = Number(layer.paddingX ?? 14);
        const py = Number(layer.paddingY ??  6);
        const fs = Number(layer.fontSize ?? 14);
        const fw = layer.fontWeight ?? 'bold';
        c.font = `${fw} ${fs}px sans-serif`;
        const text = resolveValue(layer.text ?? '', ctx);
        const tw   = c.measureText(text).width;
        const bw   = tw + px * 2;
        const bh   = fs + py * 2;
        const x    = Number(layer.x ?? 0);
        const y    = Number(layer.y ?? 0);
        const rad  = Number(layer.borderRadius ?? 20);
        c.fillStyle = layer.fillColor ?? '#5865F2';
        c.beginPath();
        roundedRect(c, x, y, bw, bh, rad);
        c.fill();
        applyStroke();
        c.shadowColor = 'transparent'; c.shadowBlur = 0; // clear shadow before text
        c.fillStyle    = layer.color ?? '#FFFFFF';
        c.textBaseline = 'top';
        c.textAlign    = 'left';
        c.fillText(text, x + px, y + py);

      // ── Progress Bar ─────────────────────────────────────────────────────────
      } else if (layer.type === 'progressBar') {
        applyShadow();
        const x   = Number(layer.x)      || 160;
        const y   = Number(layer.y)      || 130;
        const mw  = Number(layer.width)  || 400;
        const h   = Number(layer.height) || 20;
        const r   = Number(layer.borderRadius) || 10;
        const max = Number(layer.maxValue) || 100;
        const raw = parseFloat(resolveValue(String(layer.value ?? '50'), ctx)) || 0;
        const fw  = Math.max(0, Math.min(mw, (raw / max) * mw));

        // Background track
        c.fillStyle = layer.bgColorBar ?? '#4f545c';
        c.beginPath(); roundedRect(c, x, y, mw, h, r); c.fill();

        // Fill
        if (fw > 0) {
          c.shadowColor = 'transparent'; c.shadowBlur = 0;
          c.fillStyle = layer.fillColor ?? '#5865F2';
          c.beginPath(); roundedRect(c, x, y, fw, h, r); c.fill();
        }
      }
    } catch (err) {
      console.warn(`[Canvas] Layer "${layer.type}" error:`, err.message);
    }
    c.restore();
  }

  const buffer = canvas.toBuffer('image/png');

  // Store in workflow variables
  if (config.outputVar) {
    ctx.variables[config.outputVar] = buffer;
  }

  // Optionally send directly
  if (config.sendDirect) {
    const channel = await resolveChannel(config, ctx);
    if (channel) {
      await channel.send({ files: [{ attachment: buffer, name: 'card.png' }] });
    }
  }

  return { nextHandle: 'success' };
}
