export function euclideanDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

export function normalizedDistance(distance: number, maxDistance: number): number {
  if (maxDistance === 0) {
    return 0;
  };
  return Math.min(1, Math.max(0, distance / maxDistance));
}

export function distanceFromCenter(x: number, y: number, centerX: number, centerY: number): number {
  return euclideanDistance(x, y, centerX, centerY);
}

export function maxDistanceFromCenter(width: number, height: number): number {
  const centerX = Math.floor(width / 2);
  const centerY = Math.floor(height / 2);

  return euclideanDistance(0, 0, centerX, centerY);
}
