/**
 * Schematic Renderer — Canvas 2D overlay for the stylized property view.
 *
 * Renders assets and zones with flat colors, clean shapes, and category-based
 * styling on a Canvas element overlaid on the Leaflet map. Also provides
 * SVG export capability.
 */
import type { Asset, Zone, PropertyStore } from "./models";
import { CATEGORY_COLORS, SCHEMATIC_FILLS } from "./styles";

export interface SchematicRenderOptions {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  /** Convert a [lat, lng] coordinate to pixel [x, y] on the canvas. */
  latLngToPixel: (lat: number, lng: number) => [number, number];
}

/**
 * Render the full schematic view onto a Canvas 2D context.
 */
export function renderSchematic(
  data: PropertyStore,
  options: SchematicRenderOptions
): void {
  const { canvas, width, height, latLngToPixel } = options;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Clear with a light background
  ctx.fillStyle = "#f5f5f0";
  ctx.fillRect(0, 0, width, height);

  // Draw property boundary
  const boundary = data.property.boundary;
  if (boundary.length > 0) {
    ctx.beginPath();
    const [firstX, firstY] = latLngToPixel(boundary[0][0], boundary[0][1]);
    ctx.moveTo(firstX, firstY);
    for (let i = 1; i < boundary.length; i++) {
      const [x, y] = latLngToPixel(boundary[i][0], boundary[i][1]);
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(200, 230, 200, 0.2)";
    ctx.fill();
  }

  // Draw zones (below assets)
  for (const zone of data.zones) {
    drawZone(ctx, zone, latLngToPixel);
  }

  // Draw assets
  for (const asset of data.assets) {
    drawAsset(ctx, asset, latLngToPixel);
  }

  // Scale bar
  drawScaleBar(ctx, width, height);

  // North arrow
  drawNorthArrow(ctx);
}

/** Resolve fill/stroke for an asset, using SCHEMATIC_FILLS when the asset type matches. */
function resolveAssetColors(asset: Asset): { fill: string; stroke: string } {
  const typeKey = (asset.type || "").toLowerCase();
  if (SCHEMATIC_FILLS[typeKey]) {
    return SCHEMATIC_FILLS[typeKey];
  }
  const color = CATEGORY_COLORS[asset.category] ?? "#9E9E9E";
  return { fill: color, stroke: color };
}

function drawAsset(
  ctx: CanvasRenderingContext2D,
  asset: Asset,
  latLngToPixel: (lat: number, lng: number) => [number, number]
): void {
  const { fill, stroke } = resolveAssetColors(asset);
  const color = stroke;

  switch (asset.geometry.type) {
    case "Point": {
      const coords = asset.geometry.coordinates as [number, number];
      const [x, y] = latLngToPixel(coords[0], coords[1]);

      // Circle marker
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.fillStyle = "#333";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(asset.name, x, y - 14);
      break;
    }

    case "LineString": {
      const coords = asset.geometry.coordinates as [number, number][];
      if (coords.length < 2) return;

      ctx.beginPath();
      const [sx, sy] = latLngToPixel(coords[0][0], coords[0][1]);
      ctx.moveTo(sx, sy);
      for (let i = 1; i < coords.length; i++) {
        const [nx, ny] = latLngToPixel(coords[i][0], coords[i][1]);
        ctx.lineTo(nx, ny);
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.stroke();
      break;
    }

    case "Polygon": {
      const rings = asset.geometry.coordinates as [number, number][][];
      const coords = rings[0];
      if (!coords || coords.length < 3) return;

      ctx.beginPath();
      const [fx, fy] = latLngToPixel(coords[0][0], coords[0][1]);
      ctx.moveTo(fx, fy);
      for (let i = 1; i < coords.length; i++) {
        const [px, py] = latLngToPixel(coords[i][0], coords[i][1]);
        ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fillStyle = hexToRgba(fill, 0.4);
      ctx.fill();
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 2;
      ctx.stroke();
      break;
    }
  }
}

function drawZone(
  ctx: CanvasRenderingContext2D,
  zone: Zone,
  latLngToPixel: (lat: number, lng: number) => [number, number]
): void {
  if (zone.geometry.type !== "Polygon") return;

  const rings = zone.geometry.coordinates as [number, number][][];
  const coords = rings[0];
  if (!coords || coords.length < 3) return;

  const color = zone.color || CATEGORY_COLORS[zone.category] || "#9E9E9E";

  ctx.beginPath();
  const [fx, fy] = latLngToPixel(coords[0][0], coords[0][1]);
  ctx.moveTo(fx, fy);
  for (let i = 1; i < coords.length; i++) {
    const [px, py] = latLngToPixel(coords[i][0], coords[i][1]);
    ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = hexToRgba(color, 0.15);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.stroke();
  ctx.setLineDash([]);

  // Zone label at centroid
  const cx = coords.reduce((s, c) => s + c[0], 0) / coords.length;
  const cy = coords.reduce((s, c) => s + c[1], 0) / coords.length;
  const [lx, ly] = latLngToPixel(cx, cy);
  ctx.fillStyle = "#555";
  ctx.font = "12px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(zone.name, lx, ly);
}

function drawScaleBar(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number
): void {
  const barWidth = 100;
  const x = canvasWidth - barWidth - 20;
  const y = canvasHeight - 30;

  ctx.fillStyle = "#333";
  ctx.fillRect(x, y, barWidth, 4);
  ctx.fillRect(x, y - 4, 2, 12);
  ctx.fillRect(x + barWidth - 2, y - 4, 2, 12);

  ctx.font = "11px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("scale", x + barWidth / 2, y - 8);
}

function drawNorthArrow(ctx: CanvasRenderingContext2D): void {
  const x = 30;
  const y = 40;
  const size = 20;

  ctx.beginPath();
  ctx.moveTo(x, y - size);
  ctx.lineTo(x - size / 3, y + size / 3);
  ctx.lineTo(x, y + size / 6);
  ctx.lineTo(x + size / 3, y + size / 3);
  ctx.closePath();
  ctx.fillStyle = "#333";
  ctx.fill();

  ctx.font = "bold 12px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("N", x, y - size - 6);
}

/**
 * Export the current schematic view as an SVG string.
 */
export function exportToSVG(
  data: PropertyStore,
  width: number,
  height: number,
  latLngToPixel: (lat: number, lng: number) => [number, number]
): string {
  const parts: string[] = [];
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`
  );
  parts.push(`<rect width="${width}" height="${height}" fill="#f5f5f0"/>`);

  // Property boundary
  const boundary = data.property.boundary;
  if (boundary.length > 0) {
    const points = boundary
      .map((c) => {
        const [x, y] = latLngToPixel(c[0], c[1]);
        return `${x},${y}`;
      })
      .join(" ");
    parts.push(
      `<polygon points="${points}" fill="rgba(200,230,200,0.2)" stroke="#333" stroke-width="3" stroke-dasharray="10,5"/>`
    );
  }

  // Zones
  for (const zone of data.zones) {
    if (zone.geometry.type !== "Polygon") continue;
    const coords = (zone.geometry.coordinates as number[][][])[0];
    if (!coords || coords.length < 3) continue;
    const color = zone.color || "#9E9E9E";
    const points = coords
      .map((c) => {
        const [x, y] = latLngToPixel(c[0], c[1]);
        return `${x},${y}`;
      })
      .join(" ");
    parts.push(
      `<polygon points="${points}" fill="${hexToRgba(color, 0.15)}" stroke="${color}" stroke-width="1" stroke-dasharray="4,4"/>`
    );
  }

  // Assets
  for (const asset of data.assets) {
    const color = CATEGORY_COLORS[asset.category] ?? "#9E9E9E";

    if (asset.geometry.type === "Point") {
      const coords = asset.geometry.coordinates as [number, number];
      const [x, y] = latLngToPixel(coords[0], coords[1]);
      parts.push(
        `<circle cx="${x}" cy="${y}" r="8" fill="${color}" stroke="#fff" stroke-width="2"/>`
      );
      parts.push(
        `<text x="${x}" y="${y - 14}" text-anchor="middle" font-size="11" fill="#333">${escapeXml(asset.name)}</text>`
      );
    } else if (asset.geometry.type === "LineString") {
      const coords = asset.geometry.coordinates as [number, number][];
      if (coords.length >= 2) {
        const pointStr = coords
          .map((c) => {
            const [x, y] = latLngToPixel(c[0], c[1]);
            return `${x},${y}`;
          })
          .join(" ");
        parts.push(
          `<polyline points="${pointStr}" fill="none" stroke="${color}" stroke-width="3"/>`
        );
      }
    } else if (asset.geometry.type === "Polygon") {
      const rings = asset.geometry.coordinates as [number, number][][];
      const coords = rings[0];
      if (coords && coords.length >= 3) {
        const pointStr = coords
          .map((c) => {
            const [x, y] = latLngToPixel(c[0], c[1]);
            return `${x},${y}`;
          })
          .join(" ");
        parts.push(
          `<polygon points="${pointStr}" fill="${hexToRgba(color, 0.3)}" stroke="${color}" stroke-width="2"/>`
        );
      }
    }
  }

  parts.push("</svg>");
  return parts.join("\n");
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
