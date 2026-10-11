import { BufferGeometry, Float32BufferAttribute, Group, Mesh } from 'three/webgpu';
import { CONFIG } from '../game/config';
import type { LandscapeStyle } from '../landscape/LandscapeConfig';
import { landscapeVisualSeed } from '../landscape/LandscapeConfig';
import { landscapeSilhouette, parallaxFactor, parallaxOffset } from '../landscape/LandscapeMath';
import { emission } from './materials';

function silhouetteGeometry(points: ReturnType<typeof landscapeSilhouette>, depth: number): BufferGeometry {
  const vertices: number[] = [], indices: number[] = [];
  const bottom = -30;
  for (let i = 0; i < points.length; i++) {
    const p = points[i]!;
    vertices.push(p.x, p.y, depth, p.x, bottom, depth);
    if (i > 0) {
      const a = (i - 1) * 2, b = i * 2;
      indices.push(a, a + 1, b, a + 1, b + 1, b);
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  // All backdrops are unlit color silhouettes; no normals or GPU texture allocations needed.
  geometry.computeBoundingSphere();
  return geometry;
}

/** Visual-only geometry. No simulation state or collider is ever changed. */
export class ParallaxLandscape {
  readonly group = new Group();
  private readonly layerGroups: Group[] = [];

  rebuild(style: LandscapeStyle, gameSeed: number, wave: number): void {
    this.disposeLayers();
    style.layers.forEach((layer, i) => {
      const seed = landscapeVisualSeed(gameSeed, style.seed, wave, i);
      const points = landscapeSilhouette(layer, i, style.layers.length, seed, CONFIG.worldWidth);
      const depth = -114 + i * (83 / Math.max(1, style.layers.length - 1));
      const geometry = silhouetteGeometry(points, depth);
      const material = emission(Number.parseInt(layer.color.slice(1), 16));
      const container = new Group();
      for (let tile = -1; tile <= 1; tile++) {
        const mesh = new Mesh(geometry, material);
        mesh.frustumCulled = false;
        mesh.position.x = tile * CONFIG.worldWidth;
        container.add(mesh);
      }
      this.layerGroups.push(container);
      this.group.add(container);
    });
  }

  update(cameraX: number): void {
    const count = this.layerGroups.length;
    this.layerGroups.forEach((container, i) => {
      const offset = parallaxOffset(cameraX, parallaxFactor(i, count), CONFIG.worldWidth);
      container.children.forEach((mesh, tile) => { mesh.position.x = (tile - 1) * CONFIG.worldWidth - offset; });
    });
  }

  private disposeLayers(): void {
    for (const container of this.layerGroups) {
      const mesh = container.children[0] as Mesh | undefined;
      if (mesh) {
        mesh.geometry.dispose();
        if (Array.isArray(mesh.material)) mesh.material.forEach(material => material.dispose());
        else mesh.material.dispose();
      }
      this.group.remove(container);
      container.clear();
    }
    this.layerGroups.length = 0;
  }

  dispose(): void { this.disposeLayers(); }
}
