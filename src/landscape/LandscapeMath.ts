import { Random } from '../core/Random';
import type { LandscapeLayer } from './LandscapeConfig';

export interface SilhouettePoint { x: number; y: number }

/** A repeatable silhouette, periodic across the circular world's seam. */
export function landscapeSilhouette(
  layer: LandscapeLayer, layerIndex: number, layerCount: number, seed: number, width: number,
): SilhouettePoint[] {
  const random = new Random(seed);
  // Far-away layers have a higher horizon; the terrain collision height never changes.
  const base = 44 - (layerIndex + 1) * 30 / (layerCount + 1);
  const amplitude = layer.amplitude * 0.55;
  if (layer.type === 'buildings') {
    const count = Math.max(36, Math.round(55 + layer.detail));
    const heights = Array.from({ length: count }, () =>
      Math.max(14, Math.min(66, base + (random.next() * 1.65 - 0.55) * amplitude)));
    const points: SilhouettePoint[] = [{ x: 0, y: heights[0]! }];
    for (let i = 0; i < count; i++) {
      const x = width * (i + 1) / count;
      points.push({ x, y: heights[i]! });
      points.push({ x, y: heights[(i + 1) % count]! });
    }
    return points;
  }

  const count = Math.max(12, Math.round(15 + layer.detail * 0.55));
  const peaks = Array.from({ length: count }, () => (random.next() * 2 - 1) * amplitude);
  const samples = count * 4;
  const points: SilhouettePoint[] = [];
  for (let i = 0; i <= samples; i++) {
    const current = Math.floor(i / 4) % count;
    const next = (current + 1) % count;
    const t = (i % 4) / 4;
    // Distant hills are rounded; close silhouettes retain a more faceted edge.
    const smooth = t * t * (3 - 2 * t);
    const distant = 1 - layerIndex / Math.max(1, layerCount - 1);
    const blend = smooth * distant + t * (1 - distant);
    const y = base + peaks[current]! * (1 - blend) + peaks[next]! * blend;
    points.push({ x: width * i / samples, y });
  }
  return points;
}

/** Parallax camera ratio. Zero is fixed to the screen; one moves with the world. */
export function parallaxFactor(index: number, count: number): number {
  return 0.08 + 0.62 * (index + 1) / (count + 1);
}

/** Periodic offset, continuous for the unwrapped camera X used by CameraRig. */
export function parallaxOffset(cameraX: number, factor: number, width: number): number {
  return ((cameraX * factor) % width + width) % width;
}
