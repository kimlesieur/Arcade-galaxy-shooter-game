export function checkCollision(
  x1: number,
  y1: number,
  w1: number,
  h1: number,
  x2: number,
  y2: number,
  w2: number,
  h2: number,
): boolean {
  return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
}

export function isOffScreen(
  x: number,
  y: number,
  screenWidth: number,
  screenHeight: number,
): boolean {
  return x < -50 || x > screenWidth + 50 || y < -50 || y > screenHeight + 50;
}

