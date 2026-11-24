export type ArrangeMode = "side-by-side" | "grid" | "cascade";

export interface Rect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface Viewport {
  readonly width: number;
  readonly height: number;
  readonly top: number;
  readonly left: number;
}

export function clampRect(rect: Rect, viewport: Viewport): Rect {
  const width = Math.min(rect.width, viewport.width);
  const height = Math.min(rect.height, viewport.height);
  const maxX = viewport.left + viewport.width - width;
  const maxY = viewport.top + viewport.height - height;
  return {
    x: Math.min(Math.max(rect.x, viewport.left), Math.max(viewport.left, maxX)),
    y: Math.min(Math.max(rect.y, viewport.top), Math.max(viewport.top, maxY)),
    width,
    height,
  };
}

export function computeSnapRects(
  count: number,
  mode: ArrangeMode,
  viewport: Viewport,
): readonly Rect[] {
  if (count <= 0) {
    return [];
  }
  if (mode === "cascade") {
    return Array.from({ length: count }, (_item, index) =>
      clampRect(
        { x: viewport.left + index * 28, y: viewport.top + index * 28, width: 480, height: 320 },
        viewport,
      ),
    );
  }
  const columns = mode === "side-by-side" ? count : Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / columns);
  const width = Math.floor(viewport.width / columns);
  const height = Math.floor(viewport.height / rows);
  return Array.from({ length: count }, (_item, index) =>
    clampRect(
      {
        x: viewport.left + (index % columns) * width,
        y: viewport.top + Math.floor(index / columns) * height,
        width,
        height,
      },
      viewport,
    ),
  );
}
